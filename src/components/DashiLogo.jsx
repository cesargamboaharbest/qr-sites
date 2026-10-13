import './DashiLogo.css'

// The Dashi bowl drawn in SVG so its steam can rise. Decorative: callers
// label the logo, not the picture.
export function DashiBowl({ className = '' }) {
  return (
    <svg className={`dashi-bowl ${className}`} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <g className="dashi-steam" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
        <path d="M20 27c-4-4 4-7 0-11s4-7 0-11" />
        <path d="M32 27c-4-4 4-7 0-11s4-7 0-11" />
        <path d="M44 27c-4-4 4-7 0-11s4-7 0-11" />
      </g>
      <rect x="5" y="32" width="54" height="5" rx="2.5" fill="currentColor" />
      <path d="M9 37h46a23 22 0 0 1-46 0z" fill="currentColor" />
    </svg>
  )
}

// Bowl + "dashi" wordmark, like dashi-logo.png but recolourable for dark
// backgrounds (the wordmark takes the text colour)
export default function DashiLogo({ className = '' }) {
  return (
    <span className={`dashi-logo ${className}`} role="img" aria-label="Dashi">
      <DashiBowl />
      <span className="dashi-wordmark" aria-hidden="true">
        dashi
      </span>
    </span>
  )
}
