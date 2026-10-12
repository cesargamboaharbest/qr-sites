import { useState } from 'react'
import { errorMessage, t } from '../i18n/index.js'

// Layout option of menus without a cart (Business.twoColumns), saved right away
export default function TwoColumnsToggle({ business, mutate }) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  async function toggle(e) {
    setPending(true)
    setError('')
    try {
      await mutate('', 'PATCH', { twoColumns: e.target.checked })
    } catch (err) {
      setError(errorMessage(err.code))
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="preview-option">
      <label>
        <input type="checkbox" checked={Boolean(business.twoColumns)} onChange={toggle} disabled={pending} />
        <span>{t('products.twoColumns')}</span>
      </label>
      <small className="muted">{t('products.twoColumnsHint')}</small>
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
  )
}
