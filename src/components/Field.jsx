import { cloneElement, useId } from 'react'

// Label + control + optional hint and error. Hint and error are linked with
// aria-describedby rather than living inside the <label>, so they don't become
// part of the name; an error also marks the control aria-invalid.
export default function Field({ label, hint: hintText, error, children }) {
  const id = useId()
  // The error replaces the hint while it's showing (they'd often repeat)
  const hint = error ? null : hintText
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy = [error && errorId, hint && hintId].filter(Boolean).join(' ') || undefined
  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {cloneElement(children, { id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined })}
      {error && (
        <small id={errorId} className="field-error">
          {error}
        </small>
      )}
      {hint && <small id={hintId}>{hint}</small>}
    </div>
  )
}
