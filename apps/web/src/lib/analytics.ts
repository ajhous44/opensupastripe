// Google Analytics utility functions

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Track a custom event in Google Analytics
 * @param action - The action name (e.g., 'click', 'view', 'signup')
 * @param category - The category (e.g., 'engagement', 'organization', 'billing')
 * @param label - Optional label for additional context
 * @param value - Optional numeric value
 */
export function trackEvent(
  action: string,
  category: string,
  label?: string,
  value?: number
) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value,
    });
  }
}

/**
 * Track page views (usually handled automatically, but useful for SPA navigation)
 * @param pageTitle - The page title
 * @param pagePath - The page path
 */
export function trackPageView(pageTitle: string, pagePath: string) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (typeof window !== 'undefined' && window.gtag && gaId) {
    window.gtag('config', gaId, {
      page_title: pageTitle,
      page_location: window.location.href,
      page_path: pagePath,
    });
  }
}

/**
 * Track organization-specific events
 */
export const organizationAnalytics = {
  /**
   * Track when someone views a organization homepage
   */
  viewOrganizationHome: (organizationName: string, organizationId: string) => {
    trackEvent('view_organization_home', 'organization', organizationName);
    const gaId = process.env.NEXT_PUBLIC_GA_ID;
    if (typeof window !== 'undefined' && window.gtag && gaId) {
      window.gtag('config', gaId, {
        custom_map: {
          organization_id: organizationId,
          organization_name: organizationName,
        },
      });
    }
  },

  contactOrganization: (organizationName: string, contactMethod: 'phone' | 'email' | 'form') => {
    trackEvent('contact_organization', 'lead_generation', `${organizationName}_${contactMethod}`);
  },
};

/**
 * Track My Company platform events
 */
export const platformAnalytics = {
  /**
   * Track when someone signs up for My Company
   */
  signup: (_userEmail?: string) => {
    trackEvent('sign_up', 'engagement');
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'sign_up', {
        method: 'email'
      });
    }
  },

  /**
   * Track when someone starts creating a organization
   */
  startOrganizationCreation: () => {
    trackEvent('begin_checkout', 'organization_creation');
  },

  /**
   * Track when someone completes organization creation
   */
  completeOrganizationCreation: (organizationName: string) => {
    trackEvent('purchase', 'organization_creation', organizationName);
  },


  

  /**
   * Track when someone views pricing
   */
  viewPricing: () => {
    trackEvent('view_pricing', 'engagement');
  },

  /**
   * Track when someone views the demo/example site
   */
  viewDemo: () => {
    trackEvent('view_demo', 'engagement');
  }
};
