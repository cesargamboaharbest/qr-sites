import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { t } from '../i18n/index.js'

// Printable card with a QR code pointing at `url`, plus download/open actions
export default function QrCard({ businessName, title, caption, alt, url, filename, children }) {
  const [qr, setQr] = useState('')

  useEffect(() => {
    QRCode.toDataURL(url, { width: 512, margin: 1 }).then(setQr)
  }, [url])

  return (
    <li className="card table-card">
      <p className="table-card-business">{businessName}</p>
      {title && <h3>{title}</h3>}
      {qr && <img src={qr} alt={alt} className="table-qr" />}
      <p className="table-card-scan">{caption}</p>
      <div className="row-actions no-print">
        <a className="btn btn-ghost btn-sm" href={qr} download={filename}>
          {t('tables.download')}
        </a>
        <a className="btn btn-ghost btn-sm" href={url} target="_blank" rel="noreferrer">
          {t('app.open')}
        </a>
        {children}
      </div>
    </li>
  )
}
