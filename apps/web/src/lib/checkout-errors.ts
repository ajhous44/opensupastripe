export function getCheckoutErrorMessage(error: string | undefined, status: number): string {
  if (status === 429) {
    return 'Too many checkout attempts. Please wait a minute and try again.'
  }

  switch (error) {
    case 'Subscription already exists':
      return 'You already have an active subscription. Open your dashboard to manage billing.'
    case 'No organization found':
      return 'Finish setting up your organization first, then try upgrading again.'
    case 'Subscription plan not available':
      return 'This plan is temporarily unavailable. Please contact support.'
    case 'Unauthenticated':
      return 'Sign in to continue checkout.'
    case 'Server configuration error':
      return 'Checkout is temporarily unavailable. Please try again later or contact support.'
    default:
      return error || 'Failed to create checkout. Please try again.'
  }
}
