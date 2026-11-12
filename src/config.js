const path = require('path');

module.exports = {
  PORT: Number(process.env.PORT) || 3000,
  DATA_FILE: process.env.DATA_FILE || path.join(__dirname, 'data', 'tasks.json'),
  LOG_DIR: process.env.LOG_DIR || path.join(__dirname, '..', 'logs'),
  LOG_TO_FILE: process.env.LOG_TO_FILE !== 'false',
  LOG_TO_CONSOLE: process.env.LOG_TO_CONSOLE !== 'false',

  STATUSES: ['pending', 'in-progress', 'completed'],
  PRIORITIES: ['low', 'medium', 'high'],
  SORT_FIELDS: ['id', 'title', 'status', 'priority', 'assignee', 'createdAt', 'updatedAt'],

  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};
