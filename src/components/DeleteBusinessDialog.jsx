import { useEffect, useRef, useState } from 'react'
import { errorMessage, t } from '../i18n/index.js'

// Asks the owner to type the business name before deleting it, so a stray
// click can't wipe out a menu. `onConfirm(name)` does the deletion; the server
// checks the name again.
export default function DeleteBusinessDialog({ name, open, onClose, onConfirm }) {
  const dialogRef = useRef(null)
  const [typed, setTyped] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const matches = typed.trim() === name

  useEffect(() => {
    const dialog = dialogRef.current
    if (open && !dialog.open) {
      setTyped('')
      setError('')
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  async function submit(e) {
    e.preventDefault()
    if (!matches) return
    setPending(true)
    setError('')
    try {
      await onConfirm(typed.trim())
    } catch (err) {
      setError(errorMessage(err.code))
    } finally {
      setPending(false)
    }
  }

  return (
    // Esc and the browser's own close also go through onClose
    <dialog ref={dialogRef} className="confirm-dialog" aria-labelledby="delete-business-title" onClose={onClose}>
      <form className="stack" onSubmit={submit}>
        <h2 id="delete-business-title">{t('business.deleteTitle')}</h2>
        <p className="confirm-dialog-warning" role="note">
          {t('business.deleteWarning', { name })}
        </p>
        <label className="field">
          <span>{t('business.deleteTypeName', { name })}</span>
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={name}
            autoComplete="off"
            spellCheck={false}
          />
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="form-actions">
          <button className="btn btn-danger" disabled={!matches || pending}>
            {t(pending ? 'business.deleting' : 'business.deleteForever')}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={pending}>
            {t('app.cancel')}
          </button>
        </div>
      </form>
    </dialog>
  )
}
