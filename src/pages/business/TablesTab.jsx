import { useId, useState } from 'react'
import { Navigate, useOutletContext } from 'react-router-dom'
import { errorMessage, t } from '../../i18n/index.js'
import { publicMenuUrl, slugify, tableLocations } from '../../utils/format.js'
import QrCard from '../../components/QrCard.jsx'

function TableCard({ business, table, mostScanned, onMove, onDelete }) {
  const scans = table.scans ?? 0
  return (
    <QrCard
      businessName={table.location ? `${business.name} · ${table.location}` : business.name}
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
      filename={`${[business.slug, slugify(table.location ?? ''), slugify(table.name)].filter(Boolean).join('-')}.png`}
    >
      <button type="button" className="btn btn-ghost btn-sm" onClick={onMove}>
        {t('tables.changeLocation')}
      </button>
      <button type="button" className="btn btn-danger btn-sm" onClick={onDelete}>
        {t('app.delete')}
      </button>
    </QrCard>
  )
}

export default function TablesTab() {
  const { business, mutate } = useOutletContext()
  const listId = useId()
  const [name, setName] = useState('')
  // Kept after adding a table, so several tables of one location go quickly
  const [location, setLocation] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const locations = tableLocations(business.tables)
  const sameLocation = (table) => (table.location ?? '').toLowerCase() === location.trim().toLowerCase()
  // Numbered per location: "Mesa 1" in each restaurant
  const nextName = t('tables.defaultName', { n: business.tables.filter(sameLocation).length + 1 })
  // Tag the table(s) with the most scans, once there's something to compare
  const maxScans = Math.max(0, ...business.tables.map((table) => table.scans ?? 0))
  const showTop = business.tables.length > 1 && maxScans > 0
  // Tables without a location first, then one group per location
  const groups = [
    { location: '', tables: business.tables.filter((table) => !table.location) },
    ...locations.map((l) => ({ location: l, tables: business.tables.filter((table) => table.location === l) })),
  ].filter((group) => group.tables.length > 0)

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
      await mutate('/tables', 'POST', { name: name.trim() || nextName, location: location.trim() })
      setName('')
    })
  }

  function moveTable(table) {
    const value = window.prompt(t('tables.changeLocationPrompt', { name: table.name }), table.location ?? '')
    if (value === null) return
    run(() => mutate(`/tables/${table._id}`, 'PATCH', { location: value.trim() }))
  }

  function deleteTable(table) {
    if (window.confirm(t('tables.deleteConfirm', { name: table.name }))) {
      run(() => mutate(`/tables/${table._id}`, 'DELETE'))
    }
  }

  const renderGrid = (tables) => (
    <ul className="table-grid">
      {tables.map((table) => (
        <TableCard
          key={table._id}
          business={business}
          table={table}
          mostScanned={showTop && (table.scans ?? 0) === maxScans}
          onMove={() => moveTable(table)}
          onDelete={() => deleteTable(table)}
        />
      ))}
    </ul>
  )

  return (
    <div className="stack">
      <section className="card no-print">
        <h2>{t('tables.title')}</h2>
        <p className="muted">{t('tables.hint')}</p>
        <form className="inline-form" onSubmit={addTable}>
          <label className="field">
            <span>{t('tables.location')}</span>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t('tables.locationPlaceholder')}
              list={listId}
              maxLength={60}
            />
            <datalist id={listId}>
              {locations.map((l) => (
                <option key={l} value={l} />
              ))}
            </datalist>
          </label>
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
        <p className="muted">
          <small>{t('tables.locationHint')}</small>
        </p>
        {error && <p className="form-error" role="alert">{error}</p>}
      </section>

      {business.tables.length === 0 ? (
        <p className="muted">{t('tables.empty')}</p>
      ) : locations.length === 0 ? (
        renderGrid(business.tables)
      ) : (
        groups.map((group) => (
          <section key={group.location} className="stack">
            <h3 className="table-group-title">{group.location || t('tables.noLocation')}</h3>
            {renderGrid(group.tables)}
          </section>
        ))
      )}
    </div>
  )
}
