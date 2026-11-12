const reportService = require('../services/report.service');

exports.completed = (req, res) => res.json({ success: true, data: reportService.completed() });
exports.pending = (req, res) => res.json({ success: true, data: reportService.pending() });
exports.summary = (req, res) => res.json({ success: true, data: reportService.summary() });
