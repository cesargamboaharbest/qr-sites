import { useCallback, useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate, useParams } from 'react-router-dom'
import { api } from '../../api/client.js'
import { errorMessage, t } from '../../i18n/index.js'
import { publicMenuUrl } from '../../utils/format.js'
import CopyButton from '../../components/CopyButton.jsx'

export default function BusinessLayout() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [business, setBusiness] = useState(null)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [justPublished, setJustPublished] = useState(false)

  useEffect(() => {
    api(`/businesses/${id}`)
      .then((data) => setBusiness(data.business))
      .catch((err) => setError(errorMessage(err.code)))
  }, [id])

  // Calls a /businesses/:id endpoint that responds with the updated business
  const mutate = useCallback(
    async (path, method, body) => {
      const data = await api(`/businesses/${id}${path}`, { method, body })
      setBusiness(data.business)
      setError('')
      return data.business
    },
    [id]
  )

  async function setPublished(published) {
    if (!published && !window.confirm(t('business.unpublishConfirm'))) return
    setError('')
    setPending(true)
    try {
      await mutate('', 'PATCH', { published })
      setJustPublished(published)
    } catch (err) {
      setError(errorMessage(err.code))
    } finally {
      setPending(false)
    }
  }

  async function deleteBusiness() {
    if (!window.confirm(t('business.deleteConfirm', { name: business.name }))) return
    try {
      await api(`/businesses/${id}`, { method: 'DELETE' })
      navigate('/dashboard')
    } catch (err) {
      setError(errorMessage(err.code))
    }
  }

  if (!business) {
    return error ? <p className="form-error" role="alert">{error}</p> : <p className="muted">{t('app.loading')}</p>
  }

  const url = publicMenuUrl(business.slug)
  // Tabs unlocked by "Crear"; menus without a cart only get a single QR code
  const extraTabs = business.ordering
    ? [
        { key: 'tables', path: 'mesas' },
        { key: 'orders', path: 'pedidos' },
      ]
    : [{ key: 'qr', path: 'qr' }]
  const lockedTab = (key) => (
    <span key={key} className="tab is-locked" title={t('business.lockedTab')} aria-disabled="true">
      {t(`business.tabs.${key}`)}
    </span>
  )

  return (
    <div className="business">
      <Link to="/dashboard" className="back-link">
        ← {t('app.backToBusinesses')}
      </Link>

      <header className="business-header">
        <div>
          <h1>
            {business.name}{' '}
            <span className={`badge ${business.published ? 'badge-ok' : ''}`}>
              {t(business.published ? 'status.published' : 'status.draft')}
            </span>{' '}
            <span className="badge">
              {t(business.ordering ? 'types.cart' : 'types.menuOnly')}
              {!business.ordering && ` · ${t(`themes.${business.theme}.name`)}`}
            </span>
          </h1>
          {business.published ? (
            <p className="public-url">
              <span className="muted">{t('business.publicUrl')}:</span>{' '}
              <a href={url} target="_blank" rel="noreferrer">
                {url}
              </a>{' '}
              <CopyButton text={url} />
            </p>
          ) : (
            <p className="muted">{t('business.publishHint')}</p>
          )}
        </div>
        <div className="business-actions">
          {business.published ? (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPublished(false)} disabled={pending}>
              {t('business.unpublish')}
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => setPublished(true)} disabled={pending}>
              {t(pending ? 'business.publishing' : 'business.publish')}
            </button>
          )}
          <button type="button" className="btn btn-danger btn-sm" onClick={deleteBusiness}>
            {t('business.deleteBusiness')}
          </button>
        </div>
      </header>

      {error && <p className="form-error" role="alert">{error}</p>}
      {justPublished && business.published && (
        <p className="notice" role="status">
          {t(business.ordering ? 'business.publishedNotice' : 'business.publishedNoticeMenuOnly')}
        </p>
      )}

      <nav className="tabs" aria-label={t('business.tabsLabel')}>
        <NavLink to="" end className="tab">
          {t('business.tabs.products')}
        </NavLink>
        {extraTabs.map((tab) =>
          business.published ? (
            <NavLink key={tab.key} to={tab.path} className="tab">
              {t(`business.tabs.${tab.key}`)}
            </NavLink>
          ) : (
            lockedTab(tab.key)
          )
        )}
      </nav>

      <Outlet context={{ business, mutate }} />
    </div>
  )
}
