const express = require('express');
const logger = require('./middlewares/logger');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const taskRoutes = require('./routes/task.routes');
const reportRoutes = require('./routes/report.routes');

const app = express();

app.use(logger);
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    name: 'TASKFLOW API',
    version: '1.0.0',
    endpoints: ['/tasks', '/tasks/search?keyword=', '/tasks/assignee/:name', '/reports/completed', '/reports/pending', '/reports/summary', '/health'],
  });
});
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

app.use('/tasks', taskRoutes);
app.use('/reports', reportRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
