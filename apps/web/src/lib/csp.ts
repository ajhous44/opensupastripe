'use client';

/**
 * Utility to get the CSP nonce from headers for use in client components
 * This enables the use of nonce with inline scripts/styles in a way that aligns with CSP
 */

export function getNonce(): string {
  // For client-side, get the nonce from the header passed by middleware
  if (typeof document !== 'undefined') {
    // When using the middleware approach, we store the nonce in a meta tag
    const nonceElement = document.querySelector('meta[name="csp-nonce"]');
    return nonceElement ? nonceElement.getAttribute('content') || '' : '';
  }
  
  return '';
}

/**
 * Creates script props with the nonce attribute
 */
export function getScriptProps(): { nonce: string } {
  return { nonce: getNonce() };
}

/**
 * Creates style props with the nonce attribute
 */
export function getStyleProps(): { nonce: string } {
  return { nonce: getNonce() };
} 