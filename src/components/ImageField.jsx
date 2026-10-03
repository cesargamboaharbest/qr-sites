import { useId, useState } from 'react'
import { t } from '../i18n/index.js'
import { PLACEHOLDER_IMAGE } from '../utils/products.js'

const MAX_FILE_BYTES = 20 * 1024 * 1024

// Product photo picker: uploads to Firebase Storage as soon as a file is
// chosen and hands the download URL to the form. `onBusyChange` lets the form
// hold its submit button while an upload is running.
export default function ImageField({ businessId, value, onChange, onBusyChange }) {
  const inputId = useId()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  function setBusy(busy) {
    setUploading(busy)
    onBusyChange?.(busy)
  }

  async function handleFile(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow picking the same file again
    if (!file) return
    setError('')
    if (!file.type.startsWith('image/') || file.size > MAX_FILE_BYTES) {
      setError(t('errors.INVALID_IMAGE'))
      return
    }
    setBusy(true)
    try {
      // Firebase is loaded only when someone actually uploads a photo
      const { uploadProductImage } = await import('../firebase.js')
      onChange(await uploadProductImage(businessId, file))
    } catch (err) {
      console.error('Image upload failed:', err)
      setError(t('errors.UPLOAD_FAILED'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="field image-field">
      <span>{t('products.image')}</span>
      <div className="image-field-body">
        <img src={value || PLACEHOLDER_IMAGE} alt="" className="image-field-preview" />
        <div className="image-field-actions">
          <label htmlFor={inputId} className={`btn btn-ghost btn-sm ${uploading ? 'is-disabled' : ''}`}>
            {t(uploading ? 'products.uploadingImage' : value ? 'products.changeImage' : 'products.uploadImage')}
          </label>
          <input
            id={inputId}
            type="file"
            accept="image/*"
            className="visually-hidden"
            onChange={handleFile}
            disabled={uploading}
          />
          {value && !uploading && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange('')}>
              {t('products.removeImage')}
            </button>
          )}
          <small>{t('products.imageHint')}</small>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
