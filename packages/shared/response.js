export function sendSuccess(res, data, statusCode = 200, headers = {}) {
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
  return res.status(statusCode).json({
    data
  });
}

export function sendPaginated(res, data, page = 1, limit = 10, total = 0, statusCode = 200, headers = {}) {
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
  return res.status(statusCode).json({
    data,
    page: Number(page),
    limit: Number(limit),
    total: Number(total)
  });
}
