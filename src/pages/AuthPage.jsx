import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { homeFor, useAuth } from '../auth/AuthContext.jsx'
import { errorMessage, t } from '../i18n/index.js'
import Field from '../components/Field.jsx'
import { fieldOfError, validateCredentials } from '../utils/credentials.js'

// Shared by /login and /register. Errors are shown under the field they're
// about (email, password, confirmation); anything else above the button.
export default function AuthPage({ mode }) {
  const { user, ready, authenticate } = useAuth()
  const location = useLocation()
  const formRef = useRef(null)
  const [form, setForm] = useState({ username: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [pending, setPending] = useState(false)
  const [failedSubmits, setFailedSubmits] = useState(0)
  const isRegister = mode === 'register'

  // After a failed submit, move focus to the first field with an error so it's
  // announced and fixable (runs once the errors are rendered)
  useEffect(() => {
    if (failedSubmits) formRef.current?.querySelector('[aria-invalid="true"]')?.focus()
  }, [failedSubmits])
  const focusFirstError = () => setFailedSubmits((n) => n + 1)

  // After logging in, go back to the page that asked for it (e.g. a shared
  // /negocios/<id> link), or to the user's home
  if (ready && user) {
    const from = location.state?.from
    return <Navigate to={from ? `${from.pathname}${from.search ?? ''}` : homeFor(user)} replace />
  }

  const update = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value })
    // Editing a field clears its error (and a form-level one)
    if (errors[field] || errors.form) setErrors({ ...errors, [field]: undefined, form: undefined })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const found = validateCredentials(isRegister ? form : { ...form, confirm: undefined }, { newAccount: isRegister })
    if (Object.keys(found).length) {
      setErrors(found)
      focusFirstError()
      return
    }
    setErrors({})
    setPending(true)
    try {
      await authenticate(mode, { username: form.username.trim(), password: form.password })
    } catch (err) {
      setErrors({ [fieldOfError(err.code)]: err.code })
      setPending(false)
      focusFirstError()
    }
  }

  const message = (code) => code && errorMessage(code)

  return (
    <main className="auth">
      <form ref={formRef} className="card auth-card" onSubmit={handleSubmit} noValidate>
        <p className="brand">{t('app.name')}</p>
        <h1>{t(isRegister ? 'auth.registerTitle' : 'auth.loginTitle')}</h1>
        <p className="muted">{t(isRegister ? 'auth.registerSubtitle' : 'auth.loginSubtitle')}</p>

        <Field label={t('auth.email')} error={message(errors.username)}>
          <input
            type="email"
            value={form.username}
            onChange={update('username')}
            placeholder={t('auth.emailPlaceholder')}
            autoComplete={isRegister ? 'email' : 'username'}
            autoCapitalize="none"
            maxLength={254}
          />
        </Field>

        <Field
          label={t('auth.password')}
          hint={isRegister && t('auth.passwordHint')}
          error={message(errors.password)}
        >
          <input
            type="password"
            value={form.password}
            onChange={update('password')}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
          />
        </Field>

        {isRegister && (
          <Field label={t('auth.confirmPassword')} error={message(errors.confirm)}>
            <input type="password" value={form.confirm} onChange={update('confirm')} autoComplete="new-password" />
          </Field>
        )}

        {errors.form && (
          <p className="form-error" role="alert">
            {message(errors.form)}
          </p>
        )}

        <button className="btn btn-primary btn-block" disabled={pending}>
          {isRegister
            ? t(pending ? 'auth.registering' : 'auth.registerButton')
            : t(pending ? 'auth.loggingIn' : 'auth.loginButton')}
        </button>

        <p className="auth-switch">
          {t(isRegister ? 'auth.haveAccount' : 'auth.noAccount')}{' '}
          <Link to={isRegister ? '/login' : '/register'} state={location.state}>
            {t(isRegister ? 'auth.goToLogin' : 'auth.goToRegister')}
          </Link>
        </p>
      </form>
    </main>
  )
}
