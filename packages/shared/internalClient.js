import { AppError } from './errors.js';

export async function internalRequest(url, {
  method = 'GET',
  body = null,
  headers = {},
  correlationId = null
} = {}) {
  const reqHeaders = {
    'Content-Type': 'application/json',
    'x-internal-key': process.env.INTERNAL_API_KEY || 'change-me-internal-secret-api-key',
    ...headers
  };

  if (correlationId) {
    reqHeaders['x-correlation-id'] = correlationId;
  }

  const options = {
    method,
    headers: reqHeaders
  };

  if (body && method !== 'GET' && method !== 'HEAD') {
    options.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    data = { raw: text };
  }

  if (!response.ok) {
    const errorInfo = data?.error || {};
    const message = errorInfo.message || `Internal request failed with status ${response.status}`;
    const code = errorInfo.code || `HTTP_${response.status}`;
    const details = errorInfo.details || [];
    throw new AppError(message, response.status, code, details);
  }

  return data;
}
