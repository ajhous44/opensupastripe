import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getDomainInfo, setCustomDomain, removeCustomDomain, updateDomainVerification } from '@/app/actions/organization';
import { requireAuth, validateRequiredParams, normalizeDomain } from '@/lib/auth-helpers';
import { z } from 'zod';

// Validation schemas
const DomainQuerySchema = z.object({
  organizationId: z.string().uuid()
})

const DomainSetSchema = z.object({
  organizationId: z.string().uuid(),
  domain: z.string()
    .min(1, 'Domain is required')
    .max(253, 'Domain too long')
    .regex(/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/, 'Invalid domain format')
    .refine(domain => !domain.includes('localhost') && !domain.includes('127.0.0.1'), 'Invalid domain')
})



const VERCEL_TOKEN = process.env.VERCEL_API_TOKEN;
const PROJECT_ID = process.env.VERCEL_PROJECT_ID;
const IS_DEV = process.env.NODE_ENV !== 'production';
const TEAM_ID = process.env.VERCEL_TEAM_ID;

function withTeamParam(url: string): string {
  if (!TEAM_ID) return url;
  return url + (url.includes('?') ? `&teamId=${TEAM_ID}` : `?teamId=${TEAM_ID}`);
}

// Rate limiting for domain verification (1 check per minute)
const verificationCooldowns = new Map<string, number>();
const COOLDOWN_PERIOD = 60 * 1000; // 1 minute in milliseconds

export async function GET(request: NextRequest) {
  // Authenticate user
  const { user, error: authError } = await requireAuth();
  if (authError) return authError;

  try {
    // Get and validate the organization ID from the query parameters
    const { searchParams } = request.nextUrl;
    const organizationId = searchParams.get('organizationId');
    
    const validationResult = DomainQuerySchema.safeParse({ organizationId });
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid parameters',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    // Get domain info using Server Actions
    const domainResult = await getDomainInfo(validationResult.data.organizationId, user!.id);
    
    if (!domainResult.data) {
      return NextResponse.json(
        { error: domainResult.error?.message || 'Organization not found or access denied' },
        { status: 403 }
      );
    }

    // Optionally include current Vercel config to help frontend render DNS guidance
    let config: any = null;
    const debug: Record<string, any> = {};
    const domain = domainResult.data.custom_domain;
    if (domain && VERCEL_TOKEN && PROJECT_ID) {
      try {
        const url = withTeamParam(`https://api.vercel.com/v6/domains/${domain}/config`);
        const configResp = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${VERCEL_TOKEN}`
          }
        });
        const text = await configResp.text();
        try { config = JSON.parse(text); } catch { config = text; }
        if (IS_DEV) {
          console.log('[Domains][GET] Fetched Vercel config', { domain, status: configResp.status });
          console.log(config);
          debug.getConfig = { url, status: configResp.status, body: config };
        }
      } catch (e) {
        // non-fatal
        if (IS_DEV) {
          console.warn('[Domains][GET] Error fetching Vercel config', { domain, error: String(e) });
          debug.getConfigError = String(e);
        }
      }
    }

    return NextResponse.json({
      customDomain: domainResult.data.custom_domain || null,
      isVerified: domainResult.data.custom_domain_verified || false,
      config,
      ...(IS_DEV ? { debug } : {})
    });
  } catch (error) {
    console.error('Error fetching domain info:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve domain information' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Authenticate user
  const { user, error: authError } = await requireAuth();
  if (authError) return authError;

  try {
    const requestData = await request.json();

    // Validate with Zod
    const validationResult = DomainSetSchema.safeParse(requestData);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request body',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const { organizationId, domain } = validationResult.data;

    if (!VERCEL_TOKEN || !PROJECT_ID) {
      return NextResponse.json(
        { error: 'Vercel API configuration is missing' },
        { status: 500 }
      );
    }

    // Add the domain to Vercel using their API
    const addUrl = withTeamParam(`https://api.vercel.com/v9/projects/${PROJECT_ID}/domains`);
    const normalized = normalizeDomain(domain);
    const response = await fetch(addUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: normalized })
    });

    const vercelResponse = await response.json();

    if (!response.ok) {
      // If there's an error code related to domain already existing as an alias, that's okay
      if (vercelResponse.code === 'domain_taken_by_alias') {
        // Continue processing, as the domain is already registered with Vercel
        console.warn('Domain is already configured as an alias in Vercel:', domain);
      } else {
        // For other errors, return the error message
        return NextResponse.json(
          { error: vercelResponse.error?.message || 'Failed to add domain to Vercel' },
          { status: response.status }
        );
      }
    }

    // Update the organization record with the custom domain using Server Actions
    const updateResult = await setCustomDomain(organizationId, user!.id, normalized);

    if (!updateResult.data) {
      return NextResponse.json(
        { error: updateResult.error?.message || 'Failed to update organization record with custom domain' },
        { status: 500 }
      );
    }

    revalidatePath('/dashboard/website');

    // Also fetch domain config hints for immediate DNS guidance
    let config: any = null
    try {
      const configResp = await fetch(`https://api.vercel.com/v6/domains/${normalized}/config`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${VERCEL_TOKEN}`
        }
      })
      if (configResp.ok) {
        config = await configResp.json()
      }
    } catch (_error) {
      // non-fatal
    }

    return NextResponse.json({ 
      success: true,
      domain: normalized,
      verification: vercelResponse.verification || [],
      config
    });
  } catch (error) {
    console.error('Error adding domain:', error);
    return NextResponse.json(
      { error: 'Failed to add custom domain' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  // Authenticate user
  const { user, error: authError } = await requireAuth();
  if (authError) return authError;

  try {
    const { searchParams } = request.nextUrl;
    const organizationId = searchParams.get('organizationId');
    
    const validation = validateRequiredParams({ organizationId }, ['organizationId']);
    if (!validation.valid) return validation.error;

    // Get current domain and remove it using Server Actions
    const removeResult = await removeCustomDomain(organizationId!, user!.id);

    if (!removeResult.data) {
      return NextResponse.json(
        { error: removeResult.error?.message || 'Failed to remove custom domain' },
        { status: removeResult.error?.message?.includes('not found') ? 403 : 400 }
      );
    }

    const domain = removeResult.data.custom_domain;
    if (!domain) {
      return NextResponse.json(
        { error: 'No custom domain was configured for this organization' },
        { status: 400 }
      );
    }

    if (!VERCEL_TOKEN || !PROJECT_ID) {
      return NextResponse.json(
        { error: 'Vercel API configuration is missing' },
        { status: 500 }
      );
    }

    // Remove the domain from Vercel
    const delUrl = withTeamParam(`https://api.vercel.com/v9/projects/${PROJECT_ID}/domains/${domain}`);
    const response = await fetch(delUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error removing domain from Vercel:', errorData);
    }

    revalidatePath('/dashboard/website');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing domain:', error);
    return NextResponse.json(
      { error: 'Failed to remove custom domain' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  // Authenticate user
  const { user, error: authError } = await requireAuth();
  if (authError) return authError;

  try {
    const requestData = await request.json();
    const { organizationId, action } = requestData;

    const validation = validateRequiredParams({ organizationId, action }, ['organizationId', 'action']);
    if (!validation.valid) return validation.error;

    if (action !== 'verify') {
      return NextResponse.json(
        { error: 'Invalid action. Only "verify" is supported.' },
        { status: 400 }
      );
    }

    // Check rate limiting
    const cooldownKey = `${organizationId}:${user!.id}`;
    const lastVerification = verificationCooldowns.get(cooldownKey);
    const now = Date.now();

    if (lastVerification && (now - lastVerification) < COOLDOWN_PERIOD) {
      const remainingTime = Math.ceil((COOLDOWN_PERIOD - (now - lastVerification)) / 1000);
      return NextResponse.json(
        { error: `Please wait ${remainingTime} seconds before verifying again.` },
        { status: 429 }
      );
    }

    if (!VERCEL_TOKEN || !PROJECT_ID) {
      return NextResponse.json(
        { error: 'Vercel API configuration is missing' },
        { status: 500 }
      );
    }

    // Get current domain info using Server Actions
    const domainResult = await getDomainInfo(organizationId, user!.id);
    
    if (!domainResult.data || !domainResult.data.custom_domain) {
      return NextResponse.json(
        { error: 'No custom domain configured for this organization' },
        { status: 400 }
      );
    }

    const domain = domainResult.data.custom_domain;

    // Check domain ownership status with Vercel
    const statusUrl = withTeamParam(`https://api.vercel.com/v9/projects/${PROJECT_ID}/domains/${domain}`);
    const response = await fetch(statusUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to check domain status with Vercel' },
        { status: 500 }
      );
    }

    const domainText = await response.text();
    let domainData: any = null;
    try { domainData = JSON.parse(domainText); } catch { domainData = domainText; }
    if (IS_DEV) {
      console.log('[Domains][PATCH] Status response', { domain, status: response.status });
      console.log(domainData);
    }
    const isVerified = domainData.verified === true;

    // Check DNS configuration state (misconfigured vs configured) and return config
    let isConfigured = false;
    let config: any = null;
    try {
      const cfgUrl = withTeamParam(`https://api.vercel.com/v6/domains/${domain}/config`);
      const configResp = await fetch(cfgUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${VERCEL_TOKEN}`
        }
      });
      const cfgText = await configResp.text();
      let cfg: any = null;
      try { cfg = JSON.parse(cfgText) } catch { cfg = cfgText }
      config = cfg;
      if (IS_DEV) {
        console.log('[Domains][PATCH] Config response', { domain, status: configResp.status });
        console.log(cfg);
      }
      // Vercel returns { misconfigured: boolean, ... }
      if (cfg && typeof cfg.misconfigured === 'boolean') {
        isConfigured = cfg.misconfigured === false;
      }
    } catch (err) {
      // Non-fatal: leave isConfigured as false; UI will prompt for DNS
      console.warn('Failed to fetch Vercel domain config:', err);
    }

    // Update verification status using Server Actions
    const updateResult = await updateDomainVerification(organizationId, user!.id, isVerified);

    if (!updateResult.data) {
      return NextResponse.json(
        { error: updateResult.error?.message || 'Failed to update domain verification status' },
        { status: 500 }
      );
    }

    // Set cooldown
    verificationCooldowns.set(cooldownKey, now);

    revalidatePath('/dashboard/website');

    return NextResponse.json({
      success: true,
      verified: isVerified,
      configured: isConfigured,
      config,
      domain,
      message: isVerified
        ? (isConfigured ? 'Domain verified and configured.' : 'Ownership verified. DNS not fully configured yet.')
        : 'Domain verification pending. Please check your DNS settings.',
      ...(IS_DEV ? { debug: { statusUrl, domainData } } : {})
    });
  } catch (error) {
    console.error('Error verifying domain:', error);
    return NextResponse.json(
      { error: 'Failed to verify custom domain' },
      { status: 500 }
    );
  }
} 