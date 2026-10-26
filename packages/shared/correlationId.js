import crypto from 'node:crypto';

export function correlationIdMiddleware(req, res, next) {
  const incomingId = req.headers['x-correlation-id'];
  const correlationId = typeof incomingId === 'string' && incomingId.trim() !== ''
    ? incomingId.trim()
    : crypto.randomUUID();

  req.correlationId = correlationId;
  res.setHeader('x-correlation-id', correlationId);
  next();
}
