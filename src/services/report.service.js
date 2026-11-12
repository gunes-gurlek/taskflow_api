const store = require('../data/store');
const { STATUSES, PRIORITIES } = require('../config');

const countBy = (items, key, keys) => {
  const result = Object.fromEntries(keys.map((k) => [k, 0]));
  for (const item of items) result[item[key]] = (result[item[key]] || 0) + 1;
  return result;
};

const completed = () => ({ completedCount: store.all().filter((t) => t.status === 'completed').length });

const pending = () => {
  const tasks = store.all();
  return {
    pendingCount: tasks.filter((t) => t.status === 'pending').length,
    inProgressCount: tasks.filter((t) => t.status === 'in-progress').length,
  };
};

function summary() {
  const tasks = store.all();
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === 'completed').length;

  const byAssignee = {};
  for (const t of tasks) {
    const name = t.assignee || 'unassigned';
    byAssignee[name] ??= { total: 0, completed: 0 };
    byAssignee[name].total++;
    if (t.status === 'completed') byAssignee[name].completed++;
  }

  return {
    totalTasks: total,
    byStatus: countBy(tasks, 'status', STATUSES),
    byPriority: countBy(tasks, 'priority', PRIORITIES),
    byAssignee,
    unassignedTasks: tasks.filter((t) => !t.assignee).length,
    completionRate: total ? Math.round((done / total) * 10000) / 100 : 0, // yüzde
  };
}

module.exports = { completed, pending, summary };
