import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { errorMessage, t } from '../i18n/index.js'
import Field from '../components/Field.jsx'

// Shared by /login and /register
export default function AuthPage({ mode }) {
  const { user, ready, authenticate } = useAuth()
  const location = useLocation()
  const [form, setForm] = useState({ username: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const isRegister = mode === 'register'

  if (ready && user) {
    return <Navigate to={location.state?.from?.pathname ?? '/dashboard'} replace />
  }

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  async function handleSubmit(e) {
    e.preventDefault()
    if (isRegister && form.password !== form.confirm) {
      setError(t('auth.passwordMismatch'))
      return
    }
    setError('')
    setPending(true)
    try {
      await authenticate(mode, { username: form.username, password: form.password })
    } catch (err) {
      setError(errorMessage(err.code))
      setPending(false)
    }
  }

  return (
    <main className="auth">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <p className="brand">{t('app.name')}</p>
        <h1>{t(isRegister ? 'auth.registerTitle' : 'auth.loginTitle')}</h1>
        <p className="muted">{t(isRegister ? 'auth.registerSubtitle' : 'auth.loginSubtitle')}</p>

        <Field label={t('auth.username')} hint={isRegister && t('auth.usernameHint')}>
          <input
            value={form.username}
            onChange={update('username')}
            autoComplete="username"
            autoCapitalize="none"
            required
            minLength={isRegister ? 3 : undefined}
            maxLength={40}
          />
        </Field>

        <Field label={t('auth.password')} hint={isRegister && t('auth.passwordHint')}>
          <input
            type="password"
            value={form.password}
            onChange={update('password')}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            required
            minLength={isRegister ? 6 : undefined}
          />
        </Field>

        {isRegister && (
          <Field label={t('auth.confirmPassword')}>
            <input
              type="password"
              value={form.confirm}
              onChange={update('confirm')}
              autoComplete="new-password"
              required
            />
          </Field>
        )}

        {error && <p className="form-error" role="alert">{error}</p>}

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
