const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const os = require('os');
const path = require('path');
const fs = require('fs');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'taskflow-'));
process.env.DATA_FILE = path.join(tmp, 'tasks.json');
process.env.LOG_TO_FILE = 'false';
process.env.LOG_TO_CONSOLE = 'false';

const app = require('../src/app');
let server, base;

before(async () => {
  await new Promise((r) => { server = app.listen(0, r); });
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => { server.close(); fs.rmSync(tmp, { recursive: true, force: true }); });

const call = async (method, url, body) => {
  const res = await fetch(base + url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
};

test('CRUD akışı', async () => {
  let r = await call('POST', '/tasks', { title: 'Backend görevi', description: 'Açıklama', priority: 'high', assignee: 'Musa' });
  assert.equal(r.status, 201);
  const id = r.body.data.id;
  assert.equal(r.body.data.status, 'pending');

  r = await call('GET', '/tasks');
  assert.equal(r.status, 200);
  assert.equal(r.body.data.length, 1);

  r = await call('GET', `/tasks/${id}`);
  assert.equal(r.body.data.title, 'Backend görevi');

  r = await call('PUT', `/tasks/${id}`, { title: 'Güncel başlık', status: 'in-progress' });
  assert.equal(r.status, 200);
  assert.equal(r.body.data.priority, 'medium'); // PUT: belirtilmeyen alan varsayılana döner

  r = await call('PATCH', `/tasks/${id}`, { status: 'completed' });
  assert.equal(r.body.data.status, 'completed');
  assert.equal(r.body.data.title, 'Güncel başlık');

  r = await call('DELETE', `/tasks/${id}`);
  assert.equal(r.status, 200);
  r = await call('GET', `/tasks/${id}`);
  assert.equal(r.status, 404);
});

test('validation 400 döner', async () => {
  let r = await call('POST', '/tasks', { description: 'x' });
  assert.equal(r.status, 400);
  assert.equal(r.body.error.details[0].field, 'title');
  r = await call('POST', '/tasks', { title: 'Geçerli başlık', priority: 'urgent', assignee: 'a' });
  assert.equal(r.status, 400);
  assert.equal(r.body.error.details.length, 2);
  r = await call('POST', '/tasks', '{bozuk json');
  assert.equal(r.status, 400);
  r = await call('GET', '/tasks/abc');
  assert.equal(r.status, 400);
  r = await call('PATCH', '/tasks/1', {});
  assert.equal(r.status, 400);
  r = await call('GET', '/tasks?status=bilinmeyen');
  assert.equal(r.status, 400);
  r = await call('GET', '/nope');
  assert.equal(r.status, 404);
});

test('filtreleme, arama, sıralama, sayfalama ve raporlar', async () => {
  const seed = [
    ['Backend kurulum', 'high', 'completed', 'musa'],
    ['Frontend tasarım', 'low', 'pending', 'ayse'],
    ['Backend test', 'medium', 'in-progress', 'musa'],
    ['Dokümantasyon', 'high', 'pending', null],
  ];
  for (const [title, priority, status, assignee] of seed) {
    await call('POST', '/tasks', { title, priority, status, assignee });
  }
  let r = await call('GET', '/tasks?priority=high');
  assert.equal(r.body.data.length, 2);
  r = await call('GET', '/tasks?status=pending&priority=high');
  assert.equal(r.body.data.length, 1);
  r = await call('GET', '/tasks/search?keyword=BACKEND');
  assert.equal(r.body.data.length, 2);
  r = await call('GET', '/tasks/search');
  assert.equal(r.status, 400);
  r = await call('GET', '/tasks/assignee/MUSA');
  assert.equal(r.body.data.length, 2);
  r = await call('GET', '/tasks?sort=priority&order=desc');
  assert.equal(r.body.data[0].priority, 'high');
  r = await call('GET', '/tasks?page=2&limit=3');
  assert.equal(r.body.data.length, 1);
  assert.equal(r.body.meta.totalPages, 2);

  r = await call('GET', '/reports/completed');
  assert.equal(r.body.data.completedCount, 1);
  r = await call('GET', '/reports/pending');
  assert.equal(r.body.data.pendingCount, 2);
  r = await call('GET', '/reports/summary');
  assert.equal(r.body.data.totalTasks, 4);
  assert.equal(r.body.data.completionRate, 25);
  assert.equal(r.body.data.unassignedTasks, 1);
});
