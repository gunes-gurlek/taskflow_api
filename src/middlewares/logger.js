const fs = require('fs');
const path = require('path');
const { LOG_DIR, LOG_TO_FILE, LOG_TO_CONSOLE } = require('../config');

let stream = null;
function getStream() {
  if (!stream) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    stream = fs.createWriteStream(path.join(LOG_DIR, 'access.log'), { flags: 'a' });
  }
  return stream;
}

/** Her isteği (zaman damgası, method, endpoint, durum kodu, süre) konsola ve logs/access.log dosyasına yazar. */
function logger(req, res, next) {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    const line = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${ms.toFixed(1)}ms`;
    if (LOG_TO_CONSOLE) console.log(line);
    if (LOG_TO_FILE) getStream().write(line + '\n');
  });
  next();
}

module.exports = logger;
