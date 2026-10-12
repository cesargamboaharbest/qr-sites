import { useState } from 'react'
import { Navigate, useOutletContext } from 'react-router-dom'
import { errorMessage, t } from '../../i18n/index.js'
import { publicMenuUrl, slugify } from '../../utils/format.js'
import QrCard from '../../components/QrCard.jsx'

function TableCard({ business, table, mostScanned, onDelete }) {
  const scans = table.scans ?? 0
  return (
    <QrCard
      businessName={business.name}
      title={table.name}
      caption={t('tables.scanToOrder')}
      stats={
        <>
          {t(scans === 1 ? 'tables.scansOne' : 'tables.scans', { n: scans })}
          {mostScanned && <span className="badge badge-ok">{t('tables.mostScanned')}</span>}
        </>
      }
      alt={t('tables.qrAlt', { name: table.name })}
      url={publicMenuUrl(business.slug, table._id)}
      filename={`${business.slug}-${slugify(table.name)}.png`}
    >
      <button type="button" className="btn btn-danger btn-sm" onClick={onDelete}>
        {t('app.delete')}
      </button>
    </QrCard>
  )
}

export default function TablesTab() {
  const { business, mutate } = useOutletContext()
  const nextName = t('tables.defaultName', { n: business.tables.length + 1 })
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  // Tag the table(s) with the most scans, once there's something to compare
  const maxScans = Math.max(0, ...business.tables.map((table) => table.scans ?? 0))
  const showTop = business.tables.length > 1 && maxScans > 0

  if (!business.published || !business.ordering) return <Navigate to=".." relative="path" replace />

  async function run(action) {
    setError('')
    setPending(true)
    try {
      await action()
    } catch (err) {
      setError(errorMessage(err.code))
    } finally {
      setPending(false)
    }
  }

  function addTable(e) {
    e.preventDefault()
    run(async () => {
      await mutate('/tables', 'POST', { name: name.trim() || nextName })
      setName('')
    })
  }

  function deleteTable(table) {
    if (window.confirm(t('tables.deleteConfirm', { name: table.name }))) {
      run(() => mutate(`/tables/${table._id}`, 'DELETE'))
    }
  }

  return (
    <div className="stack">
      <section className="card no-print">
        <h2>{t('tables.title')}</h2>
        <p className="muted">{t('tables.hint')}</p>
        <form className="inline-form" onSubmit={addTable}>
          <label className="field">
            <span>{t('tables.name')}</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={nextName} maxLength={40} />
          </label>
          <button className="btn btn-primary" disabled={pending}>
            {t(pending ? 'tables.adding' : 'tables.add')}
          </button>
          {business.tables.length > 0 && (
            <button type="button" className="btn btn-ghost" onClick={() => window.print()}>
              {t('tables.print')}
            </button>
          )}
        </form>
        {error && <p className="form-error" role="alert">{error}</p>}
      </section>

      {business.tables.length === 0 ? (
        <p className="muted">{t('tables.empty')}</p>
      ) : (
        <ul className="table-grid">
          {business.tables.map((table) => (
            <TableCard
              key={table._id}
              business={business}
              table={table}
              mostScanned={showTop && (table.scans ?? 0) === maxScans}
              onDelete={() => deleteTable(table)}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
