import { useEffect, useState } from 'react'
import { api } from '../api/client.js'
import { errorMessage, t } from '../i18n/index.js'
import Field from '../components/Field.jsx'
import ProChip from '../components/ProChip.jsx'
import { fieldOfError, validateCredentials } from '../utils/credentials.js'
import { useAuth } from '../auth/AuthContext.jsx'

const EMPTY_FORM = { username: '', password: '', location: '', isAdmin: false }

// Locations travel as { business, name }; the <select> needs a string
const locationKey = (location) => (location ? `${location.business}|${location.name}` : '')

function LocationSelect({ locations, value, onChange, disabled, label }) {
  // Keep a waiter's location listed even if its last table was deleted
  const options = value && !locations.some((l) => locationKey(l) === value) ? [...locations, null] : locations
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} aria-label={label}>
      <option value="">{t('waiters.allLocations')}</option>
      {options.map((l) =>
        l ? (
          <option key={locationKey(l)} value={locationKey(l)}>
            {t('waiters.locationOption', { business: l.businessName, location: l.name })}
          </option>
        ) : (
          <option key={value} value={value}>
            {t('waiters.locationGone', { location: value.split('|').slice(1).join('|') })}
          </option>
        )
      )}
    </select>
  )
}

// Owner creates waiter accounts ("meseros"): each works at one location or
// all of them, and can be made admin to also edit the menus. Creating waiters
// is locked without the Pro plan.
export default function WaitersPage() {
  const { user } = useAuth()
  const locked = !user.proPlan
  const [waiters, setWaiters] = useState(null)
  const [locations, setLocations] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [created, setCreated] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [pending, setPending] = useState(false)

  useEffect(() => {
    api('/waiters')
      .then((data) => {
        setWaiters(data.waiters)
        setLocations(data.locations)
      })
      .catch((err) => setError(errorMessage(err.code)))
  }, [])

  const update = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value })
    if (fieldErrors[field]) setFieldErrors({ ...fieldErrors, [field]: undefined })
  }

  const locationFor = (key) => locations.find((l) => locationKey(l) === key) ?? null

  async function createWaiter(e) {
    e.preventDefault()
    setError('')
    setCreated('')
    const found = validateCredentials(form, { newAccount: true })
    setFieldErrors(found)
    if (Object.keys(found).length) return
    setPending(true)
    try {
      const { waiter } = await api('/waiters', {
        method: 'POST',
        body: {
          username: form.username.trim(),
          password: form.password,
          location: locationFor(form.location),
          isAdmin: form.isAdmin,
        },
      })
      setWaiters((current) => [...(current ?? []), waiter])
      setCreated(waiter.username)
      setForm(EMPTY_FORM)
    } catch (err) {
      const field = fieldOfError(err.code)
      if (field === 'form') setError(errorMessage(err.code))
      else setFieldErrors({ [field]: err.code })
    } finally {
      setPending(false)
    }
  }

  async function updateWaiter(waiter, body) {
    setError('')
    try {
      const data = await api(`/waiters/${waiter.id}`, { method: 'PATCH', body })
      setWaiters((current) => current.map((w) => (w.id === waiter.id ? data.waiter : w)))
    } catch (err) {
      setError(errorMessage(err.code))
    }
  }

  function toggleAdmin(waiter) {
    const isAdmin = !waiter.isAdmin
    if (isAdmin && !window.confirm(t('waiters.adminConfirm', { username: waiter.username }))) return
    updateWaiter(waiter, { isAdmin })
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
        <form onSubmit={createWaiter} noValidate>
          <fieldset className="stack" disabled={locked}>
            <div className="inline-form">
              <Field
                label={t('waiters.username')}
                error={fieldErrors.username && errorMessage(fieldErrors.username)}
              >
                <input
                  type="email"
                  value={form.username}
                  onChange={update('username')}
                  placeholder={t('auth.emailPlaceholder')}
                  autoComplete="off"
                  autoCapitalize="none"
                  maxLength={254}
                />
              </Field>
              {/* Shown in plain text: the owner has to pass it on to the waiter */}
              <Field
                label={t('waiters.password')}
                hint={t('auth.passwordHint')}
                error={fieldErrors.password && errorMessage(fieldErrors.password)}
              >
                <input value={form.password} onChange={update('password')} autoComplete="new-password" />
              </Field>
            </div>
            <Field
              label={t('waiters.location')}
              hint={t(locations.length ? 'waiters.locationHint' : 'waiters.noLocationsHint')}
            >
              <LocationSelect
                locations={locations}
                value={form.location}
                onChange={(location) => setForm({ ...form, location })}
              />
            </Field>
            <div className="preview-option">
              <label>
                <input
                  type="checkbox"
                  checked={form.isAdmin}
                  onChange={(e) => setForm({ ...form, isAdmin: e.target.checked })}
                />
                <span>{t('waiters.admin')}</span>
              </label>
              <small className="muted">{t('waiters.adminHint')}</small>
            </div>
            <div>
              <button className="btn btn-primary" disabled={pending}>
                {t(pending ? 'waiters.adding' : 'waiters.add')}
              </button>
            </div>
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
            <li key={waiter.id} className="product-row waiter-row">
              <div className="product-info">
                <strong>{waiter.username}</strong>{' '}
                {waiter.isAdmin && <span className="badge badge-ok">{t('waiters.adminBadge')}</span>}
              </div>
              <div className="row-actions">
                <LocationSelect
                  locations={locations}
                  value={locationKey(waiter.location)}
                  onChange={(key) => updateWaiter(waiter, { location: locationFor(key) })}
                  label={t('waiters.locationOf', { username: waiter.username })}
                  disabled={locked}
                />
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => toggleAdmin(waiter)} disabled={locked}>
                  {t(waiter.isAdmin ? 'waiters.removeAdmin' : 'waiters.makeAdmin')}
                </button>
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
