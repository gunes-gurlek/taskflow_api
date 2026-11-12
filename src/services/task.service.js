const store = require('../data/store');
const HttpError = require('../utils/httpError');
const { PRIORITIES, DEFAULT_PAGE, DEFAULT_LIMIT } = require('../config');

const PRIORITY_RANK = Object.fromEntries(PRIORITIES.map((p, i) => [p, i]));

const normalize = (v) => String(v ?? '').toLocaleLowerCase('tr');

function compare(field) {
  return (a, b) => {
    let x = a[field];
    let y = b[field];
    if (field === 'priority') [x, y] = [PRIORITY_RANK[x], PRIORITY_RANK[y]];
    if (x == null && y == null) return 0;
    if (x == null) return 1; // boş değerler her zaman sonda
    if (y == null) return -1;
    if (typeof x === 'string') return x.localeCompare(y, 'tr');
    return x - y;
  };
}

/**
 * Filtreleme + arama + sıralama + sayfalama.
 * query alanları validateQuery middleware'i tarafından doğrulanmış/dönüştürülmüş gelir.
 */
function list({ status, priority, assignee, keyword, sort = 'id', order = 'asc', page = DEFAULT_PAGE, limit = DEFAULT_LIMIT } = {}) {
  let items = [...store.all()];

  if (status) items = items.filter((t) => t.status === status);
  if (priority) items = items.filter((t) => t.priority === priority);
  if (assignee) items = items.filter((t) => normalize(t.assignee) === normalize(assignee));
  if (keyword) {
    const k = normalize(keyword);
    items = items.filter((t) => [t.title, t.description, t.assignee].some((f) => normalize(f).includes(k)));
  }

  const cmp = compare(sort);
  items.sort((a, b) => (order === 'desc' ? -cmp(a, b) : cmp(a, b)));

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;

  return {
    data: items.slice(start, start + limit),
    meta: { total, page, limit, totalPages },
  };
}

function getById(id) {
  const task = store.all().find((t) => t.id === id);
  if (!task) throw new HttpError(404, `ID'si ${id} olan görev bulunamadı.`);
  return task;
}

function create({ title, description, status, priority, assignee }) {
  const now = new Date().toISOString();
  const task = {
    id: store.nextId(),
    title,
    description: description ?? '',
    status: status ?? 'pending',
    priority: priority ?? 'medium',
    assignee: assignee ?? null,
    createdAt: now,
    updatedAt: now,
  };
  store.all().push(task);
  store.save();
  return task;
}

/** replace=true (PUT): belirtilmeyen alanlar varsayılana döner; false (PATCH): yalnızca gelen alanlar değişir. */
function update(id, fields, { replace = false } = {}) {
  const task = getById(id);
  const defaults = { description: '', status: 'pending', priority: 'medium', assignee: null };
  for (const key of ['title', 'description', 'status', 'priority', 'assignee']) {
    if (fields[key] !== undefined) task[key] = fields[key];
    else if (replace && key in defaults) task[key] = defaults[key];
  }
  task.updatedAt = new Date().toISOString();
  store.save();
  return task;
}

function remove(id) {
  const tasks = store.all();
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) throw new HttpError(404, `ID'si ${id} olan görev bulunamadı.`);
  const [removed] = tasks.splice(index, 1);
  store.save();
  return removed;
}

module.exports = { list, getById, create, update, remove };
