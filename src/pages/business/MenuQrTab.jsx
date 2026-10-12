import { Navigate, useOutletContext } from 'react-router-dom'
import { t } from '../../i18n/index.js'
import { publicMenuUrl } from '../../utils/format.js'
import QrCard from '../../components/QrCard.jsx'

// Single QR code for menus without a cart (no tables, no orders)
export default function MenuQrTab() {
  const { business } = useOutletContext()
  if (!business.published) return <Navigate to=".." relative="path" replace />
  const scans = business.menuScans ?? 0

  return (
    <div className="stack">
      <section className="card no-print">
        <h2>{t('menuQr.title')}</h2>
        <p className="muted">{t('menuQr.hint')}</p>
        <button type="button" className="btn btn-ghost" onClick={() => window.print()}>
          {t('menuQr.print')}
        </button>
      </section>
      <ul className="table-grid">
        <QrCard
          businessName={business.name}
          caption={t('menuQr.scanToView')}
          stats={t(scans === 1 ? 'tables.scansOne' : 'tables.scans', { n: scans })}
          alt={t('menuQr.qrAlt', { name: business.name })}
          url={publicMenuUrl(business.slug)}
          filename={`${business.slug}-qr.png`}
        />
      </ul>
    </div>
  )
}
