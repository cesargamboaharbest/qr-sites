// Same rules as server/src/credentials.js, checked before sending so each
// field can show its own error. Values are error codes from i18n "errors".
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
export const MIN_PASSWORD_LENGTH = 6

// `newAccount` adds the sign-up rules (minimum length, matching confirmation)
export function validateCredentials({ username, password, confirm }, { newAccount }) {
  const errors = {}
  const email = username.trim()
  if (!email) errors.username = 'EMAIL_REQUIRED'
  else if (email.length > 254 || !EMAIL_PATTERN.test(email)) errors.username = 'INVALID_EMAIL'

  if (!password) errors.password = 'PASSWORD_REQUIRED'
  else if (newAccount && password.length < MIN_PASSWORD_LENGTH) errors.password = 'WEAK_PASSWORD'

  if (newAccount && confirm !== undefined && !errors.password && confirm !== password) {
    errors.confirm = 'PASSWORD_MISMATCH'
  }
  return errors
}

// Which field a server error belongs to (anything else is shown for the form)
const FIELD_OF_ERROR = {
  EMAIL_REQUIRED: 'username',
  INVALID_EMAIL: 'username',
  USER_NOT_FOUND: 'username',
  USERNAME_TAKEN: 'username',
  PASSWORD_REQUIRED: 'password',
  WEAK_PASSWORD: 'password',
  WRONG_PASSWORD: 'password',
}

export function fieldOfError(code) {
  return FIELD_OF_ERROR[code] ?? 'form'
}
