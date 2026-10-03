import { useEffect, useState } from 'react'
import { api } from '../api/client.js'
import { errorMessage, t } from '../i18n/index.js'
import Field from '../components/Field.jsx'
import ProChip from '../components/ProChip.jsx'
import { useAuth } from '../auth/AuthContext.jsx'

const EMPTY_FORM = { username: '', password: '' }

// Owner creates waiter accounts ("meseros") that see the orders of all their
// Pro businesses. Creating waiters is locked without the Pro plan.
export default function WaitersPage() {
  const { user } = useAuth()
  const locked = !user.proPlan
  const [waiters, setWaiters] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [created, setCreated] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    api('/waiters')
      .then((data) => setWaiters(data.waiters))
      .catch((err) => setError(errorMessage(err.code)))
  }, [])

  async function createWaiter(e) {
    e.preventDefault()
    setError('')
    setCreated('')
    setPending(true)
    try {
      const { waiter } = await api('/waiters', { method: 'POST', body: form })
      setWaiters((current) => [...(current ?? []), waiter])
      setCreated(waiter.username)
      setForm(EMPTY_FORM)
    } catch (err) {
      setError(errorMessage(err.code))
    } finally {
      setPending(false)
    }
  }

  async function deleteWaiter(waiter) {
    if (!window.confirm(t('waiters.deleteConfirm', { username: waiter.username }))) return
    setError('')
    try {
      await api(`/waiters/${waiter.id}`, { method: 'DELETE' })
      setWaiters((current) => current.filter((w) => w.id !== waiter.id))
    } catch (err) {
      setError(errorMessage(err.code))
    }
  }

  return (
    <div className="stack">
      <h1 className="page-title">{t('waiters.pageTitle')}</h1>
      <section className={`card ${locked ? 'is-locked' : ''}`}>
        <h2>
          {t('waiters.title')} {locked && <ProChip />}
        </h2>
        <p className="muted">
          {locked ? t('plan.lockedHint') : t('waiters.hint', { url: `${window.location.origin}/login` })}
        </p>
        {/* Without the Pro plan the whole form is disabled (greyed out) */}
        <form onSubmit={createWaiter}>
          <fieldset className="inline-form" disabled={locked}>
          <Field label={t('waiters.username')} hint={t('auth.usernameHint')}>
            <input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              autoComplete="off"
              autoCapitalize="none"
              required
              minLength={3}
              maxLength={40}
            />
          </Field>
          {/* Shown in plain text: the owner has to pass it on to the waiter */}
          <Field label={t('waiters.password')} hint={t('auth.passwordHint')}>
            <input
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="new-password"
              required
              minLength={6}
            />
          </Field>
          <button className="btn btn-primary" disabled={pending}>
            {t(pending ? 'waiters.adding' : 'waiters.add')}
          </button>
          </fieldset>
        </form>
        {created && (
          <p className="notice" role="status">
            {t('waiters.createdNotice', { username: created })}
          </p>
        )}
        {error && <p className="form-error" role="alert">{error}</p>}
      </section>

      <section className="card">
        <h2>{t('waiters.listTitle')}</h2>
        {!waiters && !error && <p className="muted">{t('app.loading')}</p>}
        {waiters?.length === 0 && <p className="muted">{t('waiters.empty')}</p>}
        <ul className="product-list">
          {waiters?.map((waiter) => (
            <li key={waiter.id} className="product-row">
              <div className="product-info">
                <strong>{waiter.username}</strong>
              </div>
              <div>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => deleteWaiter(waiter)}>
                  {t('app.delete')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
