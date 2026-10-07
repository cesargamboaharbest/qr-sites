import { useEffect, useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { errorMessage, t } from '../../i18n/index.js'
import { getTheme } from '../../themes/index.js'
import { useAuth } from '../../auth/AuthContext.jsx'
import PreviewFrame from '../../components/PreviewFrame.jsx'
import TwoColumnsToggle from '../../components/TwoColumnsToggle.jsx'
import { CartMenu } from '../PublicMenuPage.jsx'

// Size the menu is laid out at in "computer" mode, scaled down to fit
const DESKTOP = { width: 1280, height: 800 }
const IMAGE_WAIT_MS = 5000

// The business description: the closing text of the Kura theme, the top band
// of the other themes
function MessageForm({ business, mutate }) {
  const [message, setMessage] = useState(business.description)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  async function save(e) {
    e.preventDefault()
    setPending(true)
    setError('')
    setSaved(false)
    try {
      const updated = await mutate('', 'PATCH', { description: message })
      setMessage(updated.description)
      setSaved(true)
    } catch (err) {
      setError(errorMessage(err.code))
    } finally {
      setPending(false)
    }
  }

  return (
    <form className="stack" onSubmit={save}>
      <label className="field">
        <span>{t('preview.message')}</span>
        <textarea
          value={message}
          onChange={(e) => {
            setMessage(e.target.value)
            setSaved(false)
          }}
          placeholder={t('businessForm.descriptionPlaceholder')}
          maxLength={300}
          rows={3}
        />
        <small>{t('preview.messageHint')}</small>
      </label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="preview-save">
        <button className="btn btn-primary btn-sm" disabled={pending || message === business.description}>
          {t(pending ? 'preview.saving' : 'preview.save')}
        </button>
        {saved && <span className="muted" role="status">{t('preview.saved')}</span>}
      </div>
    </form>
  )
}

// Scale that fits the desktop-sized frame into the available width
function useFitScale(ref, width) {
  const [scale, setScale] = useState(1)
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      setScale(Math.min(1, entry.contentRect.width / width))
    })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [ref, width])
  return scale
}

// Lazy images below the fold haven't loaded yet; load them before printing
async function loadAllImages(doc) {
  const images = [...doc.images]
  images.forEach((img) => {
    img.loading = 'eager'
  })
  const pending = images
    .filter((img) => !img.complete)
    .map(
      (img) =>
        new Promise((resolve) => {
          img.addEventListener('load', resolve, { once: true })
          img.addEventListener('error', resolve, { once: true })
        })
    )
  const timeout = new Promise((resolve) => setTimeout(resolve, IMAGE_WAIT_MS))
  await Promise.race([Promise.all(pending), timeout])
}

export default function PreviewTab() {
  const { business, mutate } = useOutletContext()
  const { user } = useAuth()
  const [device, setDevice] = useState('phone')
  const [printing, setPrinting] = useState(false)
  const frameRef = useRef(null)
  const stageRef = useRef(null)
  const scale = useFitScale(stageRef, DESKTOP.width)

  const theme = getTheme(user.theme)
  // Only what customers see
  const shown = { ...business, products: business.products.filter((p) => p.available) }
  const desktop = device === 'desktop'

  async function printMenu() {
    const frame = frameRef.current
    if (!frame?.contentDocument) return
    setPrinting(true)
    try {
      await loadAllImages(frame.contentDocument)
      // Used as the suggested PDF file name
      frame.contentDocument.title = business.name
      frame.contentWindow.print()
    } finally {
      setPrinting(false)
    }
  }

  return (
    <div className="preview-layout">
      <section className="card stack">
        <h2>{t('preview.settings')}</h2>
        <MessageForm business={business} mutate={mutate} />
        {!business.ordering && <TwoColumnsToggle business={business} mutate={mutate} />}
      </section>

      <section className="card">
        <div className="preview-toolbar">
          <div className="segmented" role="group" aria-label={t('preview.deviceLabel')}>
            {['phone', 'desktop'].map((value) => (
              <button
                key={value}
                type="button"
                className={device === value ? 'is-active' : undefined}
                aria-pressed={device === value}
                onClick={() => setDevice(value)}
              >
                {t(`preview.devices.${value}`)}
              </button>
            ))}
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={printMenu} disabled={printing}>
            {t(printing ? 'preview.preparing' : 'preview.print')}
          </button>
        </div>
        <p className="muted preview-hint">{t('preview.printHint')}</p>

        {/* One iframe for both sizes, so switching keeps the scroll position */}
        <div
          ref={stageRef}
          className={`preview-stage preview-stage--${device}`}
          style={desktop ? { height: DESKTOP.height * scale } : undefined}
        >
          <PreviewFrame
            title={t('preview.frameTitle')}
            className="preview-device"
            frameRef={frameRef}
            style={desktop ? { width: DESKTOP.width, height: DESKTOP.height, transform: `scale(${scale})` } : undefined}
          >
            {business.ordering ? (
              <CartMenu data={{ business: shown, table: null }} themeKey={theme.key} reload={() => {}} />
            ) : (
              <theme.Menu business={shown} />
            )}
          </PreviewFrame>
        </div>
      </section>
    </div>
  )
}
