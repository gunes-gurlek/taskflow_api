const HttpError = require('../utils/httpError');
const { STATUSES, PRIORITIES, SORT_FIELDS, MAX_LIMIT } = require('../config');

const fail = (errors) => {
  throw new HttpError(400, 'Doğrulama hatası: gönderilen veriler geçersiz.', errors);
};

const isBlankString = (v) => typeof v !== 'string' || v.trim() === '';

/** Gövde alanlarını doğrular. partial=true ise (PATCH) alanlar zorunlu değildir ancak en az biri gelmelidir. */
function validateTask({ partial = false } = {}) {
  return (req, res, next) => {
    const body = req.body;
    if (body === null || typeof body !== 'object' || Array.isArray(body)) {
      return fail([{ field: 'body', message: 'İstek gövdesi bir JSON nesnesi olmalıdır.' }]);
    }

    const errors = [];
    const { title, description, status, priority, assignee } = body;

    if (title === undefined) {
      if (!partial) errors.push({ field: 'title', message: 'title alanı zorunludur.' });
    } else if (isBlankString(title) || title.trim().length < 3 || title.trim().length > 100) {
      errors.push({ field: 'title', message: 'title 3-100 karakter arasında bir metin olmalıdır.' });
    }

    if (description !== undefined && (typeof description !== 'string' || description.length > 500)) {
      errors.push({ field: 'description', message: 'description en fazla 500 karakterlik bir metin olmalıdır.' });
    }

    if (status !== undefined && !STATUSES.includes(status)) {
      errors.push({ field: 'status', message: `status şunlardan biri olmalıdır: ${STATUSES.join(', ')}.` });
    }

    if (priority !== undefined && !PRIORITIES.includes(priority)) {
      errors.push({ field: 'priority', message: `priority şunlardan biri olmalıdır: ${PRIORITIES.join(', ')}.` });
    }

    if (assignee !== undefined && assignee !== null &&
        (isBlankString(assignee) || assignee.trim().length < 2 || assignee.trim().length > 50)) {
      errors.push({ field: 'assignee', message: 'assignee 2-50 karakter arasında bir metin olmalıdır (veya null).' });
    }

    if (partial && ['title', 'description', 'status', 'priority', 'assignee'].every((k) => body[k] === undefined)) {
      errors.push({ field: 'body', message: 'Güncellemek için en az bir alan gönderilmelidir.' });
    }

    if (errors.length) return fail(errors);

    // Temizlenmiş değerleri yaz (bilinmeyen alanlar atılır)
    const clean = {};
    if (title !== undefined) clean.title = title.trim();
    if (description !== undefined) clean.description = description.trim();
    if (status !== undefined) clean.status = status;
    if (priority !== undefined) clean.priority = priority;
    if (assignee !== undefined) clean.assignee = assignee === null ? null : assignee.trim();
    req.body = clean;
    next();
  };
}

/** :id parametresinin pozitif tam sayı olduğunu doğrular ve req.params.id'yi sayıya çevirir. */
function validateId(req, res, next) {
  if (!/^[1-9]\d*$/.test(req.params.id)) {
    return fail([{ field: 'id', message: 'id pozitif bir tam sayı olmalıdır.' }]);
  }
  req.params.id = Number(req.params.id);
  next();
}

/** Liste/arama sorgu parametrelerini doğrular, sayısal alanları dönüştürür ve req.filters'a koyar. */
function validateQuery(req, res, next) {
  const { status, priority, assignee, keyword, sort, order, page, limit } = req.query;
  const errors = [];
  const filters = {};

  if (status !== undefined) {
    if (STATUSES.includes(status)) filters.status = status;
    else errors.push({ field: 'status', message: `status şunlardan biri olmalıdır: ${STATUSES.join(', ')}.` });
  }
  if (priority !== undefined) {
    if (PRIORITIES.includes(priority)) filters.priority = priority;
    else errors.push({ field: 'priority', message: `priority şunlardan biri olmalıdır: ${PRIORITIES.join(', ')}.` });
  }
  if (assignee !== undefined) {
    if (typeof assignee === 'string' && assignee.trim()) filters.assignee = assignee.trim();
    else errors.push({ field: 'assignee', message: 'assignee boş olamaz.' });
  }
  if (keyword !== undefined) {
    if (typeof keyword === 'string' && keyword.trim()) filters.keyword = keyword.trim();
    else errors.push({ field: 'keyword', message: 'keyword boş olamaz.' });
  }

  if (sort !== undefined) {
    // "-createdAt" biçimi azalan sıralama anlamına gelir
    const field = typeof sort === 'string' ? sort.replace(/^-/, '') : '';
    if (SORT_FIELDS.includes(field)) {
      filters.sort = field;
      if (sort.startsWith('-')) filters.order = 'desc';
    } else errors.push({ field: 'sort', message: `sort şunlardan biri olmalıdır: ${SORT_FIELDS.join(', ')}.` });
  }
  if (order !== undefined) {
    if (['asc', 'desc'].includes(order)) filters.order = order;
    else errors.push({ field: 'order', message: 'order asc veya desc olmalıdır.' });
  }

  if (page !== undefined) {
    if (/^[1-9]\d*$/.test(page)) filters.page = Number(page);
    else errors.push({ field: 'page', message: 'page pozitif bir tam sayı olmalıdır.' });
  }
  if (limit !== undefined) {
    if (/^[1-9]\d*$/.test(limit) && Number(limit) <= MAX_LIMIT) filters.limit = Number(limit);
    else errors.push({ field: 'limit', message: `limit 1 ile ${MAX_LIMIT} arasında bir tam sayı olmalıdır.` });
  }

  if (errors.length) return fail(errors);
  req.filters = filters;
  next();
}

module.exports = { validateTask, validateId, validateQuery };
