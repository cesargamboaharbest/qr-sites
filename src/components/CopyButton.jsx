import { useState } from 'react'
import { t } from '../i18n/index.js'

export default function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      window.prompt(t('app.copy'), text)
    }
  }

  return (
    <button type="button" className="btn btn-ghost btn-sm" onClick={copy}>
      {t(copied ? 'app.copied' : 'app.copy')}
    </button>
  )
}
