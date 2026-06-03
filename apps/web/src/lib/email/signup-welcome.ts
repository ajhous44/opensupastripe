import 'server-only'

export {
  sendSignupWelcomeEmail,
  SIGNUP_WELCOME_OAUTH_MAX_USER_AGE_MS,
  shouldSendOAuthSignupWelcome,
  isLikelyFreshAuthUser,
} from './signup-welcome-email'
