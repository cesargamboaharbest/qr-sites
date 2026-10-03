// The API only returns error codes (e.g. { error: 'SLUG_TAKEN' }); the frontend
// turns them into translated messages.
export class HttpError extends Error {
  constructor(status, code) {
    super(code)
    this.status = status
    this.code = code
  }
}

export function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.code })
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'VALIDATION' })
  }
  if (err.name === 'CastError') {
    return res.status(404).json({ error: 'NOT_FOUND' })
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'VALIDATION' })
  }
  console.error(err)
  res.status(500).json({ error: 'SERVER_ERROR' })
}
