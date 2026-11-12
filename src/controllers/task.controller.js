const taskService = require('../services/task.service');
const HttpError = require('../utils/httpError');

const ok = (res, data, meta, status = 200) =>
  res.status(status).json({ success: true, ...(meta && { meta }), data });

exports.list = (req, res) => {
  const { data, meta } = taskService.list(req.filters);
  ok(res, data, meta);
};

// GET /tasks/search?keyword=...
exports.search = (req, res, next) => {
  if (!req.filters.keyword) {
    return next(new HttpError(400, 'Doğrulama hatası: arama için keyword parametresi zorunludur.', [
      { field: 'keyword', message: 'keyword zorunludur. Örnek: /tasks/search?keyword=backend' },
    ]));
  }
  exports.list(req, res);
};

// GET /tasks/assignee/:name
exports.listByAssignee = (req, res) => {
  const { data, meta } = taskService.list({ ...req.filters, assignee: req.params.name });
  ok(res, data, meta);
};

exports.getById = (req, res) => ok(res, taskService.getById(req.params.id));

exports.create = (req, res) => ok(res, taskService.create(req.body), null, 201);

exports.replace = (req, res) => ok(res, taskService.update(req.params.id, req.body, { replace: true }));

exports.update = (req, res) => ok(res, taskService.update(req.params.id, req.body));

exports.remove = (req, res) => {
  const removed = taskService.remove(req.params.id);
  res.json({ success: true, message: 'Görev silindi.', data: removed });
};
