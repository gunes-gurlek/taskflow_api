const express = require('express');
const ctrl = require('../controllers/report.controller');

const router = express.Router();

router.get('/completed', ctrl.completed);
router.get('/pending', ctrl.pending);
router.get('/summary', ctrl.summary);

module.exports = router;
