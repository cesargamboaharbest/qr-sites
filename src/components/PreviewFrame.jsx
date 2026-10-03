import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const BLANK_DOC = '<!doctype html><html lang="es"><head></head><body></body></html>'

// Renders children inside an iframe so they lay out (and hit media queries)
// at the iframe's width, like on a phone. The app's stylesheets are mirrored
// into the frame, including the ones Vite injects/updates in development.
export default function PreviewFrame({ title, className, children }) {
  const ref = useRef(null)
  const [body, setBody] = useState(null)

  useEffect(() => {
    if (!body) return
    const doc = body.ownerDocument
    const syncStyles = () => {
      const styles = document.querySelectorAll('style, link[rel="stylesheet"]')
      doc.head.replaceChildren(...[...styles].map((node) => node.cloneNode(true)))
    }
    syncStyles()
    const observer = new MutationObserver(syncStyles)
    observer.observe(document.head, { childList: true, subtree: true, characterData: true })
    return () => observer.disconnect()
  }, [body])

  return (
    <iframe
      ref={ref}
      title={title}
      className={className}
      srcDoc={BLANK_DOC}
      onLoad={() => setBody(ref.current.contentDocument.body)}
    >
      {body && createPortal(children, body)}
    </iframe>
  )
}
