import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'
import { errorMessage, t } from '../i18n/index.js'
import { publicMenuUrl, slugify } from '../utils/format.js'
import Field from '../components/Field.jsx'
import { DEFAULT_THEME, MENU_THEMES } from '../themes/index.js'

function CreateBusinessForm() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    currency: 'CRC',
    ordering: true,
    theme: DEFAULT_THEME,
  })
  const [slugTouched, setSlugTouched] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  const slug = slugTouched ? form.slug : slugify(form.name)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setPending(true)
    try {
      const { business } = await api('/businesses', { method: 'POST', body: { ...form, slug } })
      navigate(`/negocios/${business.id}`)
    } catch (err) {
      setError(errorMessage(err.code))
      setPending(false)
    }
  }

  return (
    <form className="card stack" onSubmit={handleSubmit}>
      <h2>{t('businessForm.title')}</h2>
      <fieldset className="choice-group">
        <legend>{t('businessForm.type')}</legend>
        {[
          { ordering: true, label: 'businessForm.typeCart', hint: 'businessForm.typeCartHint' },
          { ordering: false, label: 'businessForm.typeMenuOnly', hint: 'businessForm.typeMenuOnlyHint' },
        ].map((option) => (
          <label key={option.label} className={`choice ${form.ordering === option.ordering ? 'is-selected' : ''}`}>
            <input
              type="radio"
              name="business-type"
              checked={form.ordering === option.ordering}
              onChange={() => setForm({ ...form, ordering: option.ordering })}
            />
            <span>
              <strong>{t(option.label)}</strong>
              <small>{t(option.hint)}</small>
            </span>
          </label>
        ))}
      </fieldset>
      <label className="field">
        <span>{t('businessForm.name')}</span>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder={t('businessForm.namePlaceholder')}
          required
          maxLength={80}
        />
      </label>
      <Field label={t('businessForm.slug')} hint={t('businessForm.slugHint', { url: publicMenuUrl(slug || '…') })}>
        <input
          value={slug}
          onChange={(e) => {
            setSlugTouched(true)
            setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })
          }}
          required
          maxLength={50}
        />
      </Field>
      <label className="field">
        <span>{t('businessForm.description')}</span>
        <input
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder={t('businessForm.descriptionPlaceholder')}
          maxLength={300}
        />
      </label>
      <label className="field">
        <span>{t('businessForm.currency')}</span>
        <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
          <option value="CRC">{t('currencies.CRC')}</option>
          <option value="USD">{t('currencies.USD')}</option>
        </select>
      </label>
      {!form.ordering && (
        <label className="field">
          <span>{t('businessForm.theme')}</span>
          <select value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })}>
            {Object.keys(MENU_THEMES).map((key) => (
              <option key={key} value={key}>
                {t('themes.option', {
                  name: t(`themes.${key}.name`),
                  description: t(`themes.${key}.description`),
                })}
              </option>
            ))}
          </select>
        </label>
      )}
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="btn btn-primary" disabled={pending}>
        {pending
          ? t('businessForm.submitting')
          : t(form.ordering ? 'businessForm.submit' : 'businessForm.submitMenuOnly')}
      </button>
    </form>
  )
}

export default function DashboardPage() {
  const [businesses, setBusinesses] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api('/businesses')
      .then((data) => setBusinesses(data.businesses))
      .catch((err) => setError(errorMessage(err.code)))
  }, [])

  return (
    <div className="dashboard">
      <section>
        <h1>{t('dashboard.title')}</h1>
        {error && <p className="form-error" role="alert">{error}</p>}
        {!businesses && !error && <p className="muted">{t('app.loading')}</p>}
        {businesses?.length === 0 && <p className="muted">{t('dashboard.empty')}</p>}
        <ul className="business-list">
          {businesses?.map((b) => (
            <li key={b.id}>
              <Link to={`/negocios/${b.id}`} className="card business-card">
                <span className="business-card-head">
                  <strong>{b.name}</strong>
                  <span className={`badge ${b.published ? 'badge-ok' : ''}`}>
                    {t(b.published ? 'status.published' : 'status.draft')}
                  </span>
                </span>
                <span className="muted">/{b.slug}</span>
                <span className="muted">
                  {t(b.ordering ? 'types.cart' : 'types.menuOnly')} ·{' '}
                  {t('dashboard.productCount', { count: b.products.length })}
                  {b.ordering && <> · {t('dashboard.tableCount', { count: b.tables.length })}</>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <aside>
        <CreateBusinessForm />
      </aside>
    </div>
  )
}
