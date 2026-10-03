import { cloneElement, useId } from 'react'

// Label + control + optional hint. The hint is linked with aria-describedby
// rather than living inside the <label>, so it doesn't become part of the name.
export default function Field({ label, hint, children }) {
  const id = useId()
  const hintId = `${id}-hint`
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {cloneElement(children, { id, 'aria-describedby': hint ? hintId : undefined })}
      {hint && <small id={hintId}>{hint}</small>}
    </div>
  )
}
