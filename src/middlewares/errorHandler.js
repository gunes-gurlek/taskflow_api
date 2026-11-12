const HttpError = require('../utils/httpError');

function notFound(req, res, next) {
  next(new HttpError(404, `Endpoint bulunamadı: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Geçersiz JSON gövdesi (express.json hatası)
  if (err.type === 'entity.parse.failed') {
    err = new HttpError(400, 'Geçersiz JSON: istek gövdesi çözümlenemedi.');
  }
  const status = err.statusCode || 500;
  if (status === 500) console.error(err);

  res.status(status).json({
    success: false,
    error: {
      status,
      message: status === 500 ? 'Sunucu hatası oluştu.' : err.message,
      ...(err.details && { details: err.details }),
    },
  });
}

module.exports = { notFound, errorHandler };
