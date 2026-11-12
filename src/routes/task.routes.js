const express = require('express');
const ctrl = require('../controllers/task.controller');
const { validateTask, validateId, validateQuery } = require('../middlewares/validate');

const router = express.Router();

// Not: sabit yollar (/search, /assignee/:name) "/:id" yolundan ÖNCE tanımlanmalıdır.
router.get('/search', validateQuery, ctrl.search);
router.get('/assignee/:name', validateQuery, ctrl.listByAssignee);

router.route('/')
  .get(validateQuery, ctrl.list)
  .post(validateTask(), ctrl.create);

router.route('/:id')
  .all(validateId)
  .get(ctrl.getById)
  .put(validateTask(), ctrl.replace)
  .patch(validateTask({ partial: true }), ctrl.update)
  .delete(ctrl.remove);

module.exports = router;
