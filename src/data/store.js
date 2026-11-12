/**
 * Basit JSON dosya tabanlı veri deposu.
 * Veriler bellekte tutulur, her değişiklikte atomik olarak dosyaya yazılır.
 */
const fs = require('fs');
const path = require('path');
const { DATA_FILE } = require('../config');

let state = null;

function load() {
  if (state) return state;
  try {
    state = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (err) {
    if (err.code !== 'ENOENT') console.error('Veri dosyası okunamadı, boş veri ile başlanıyor:', err.message);
    state = { nextId: 1, tasks: [] };
  }
  return state;
}

function save() {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  const tmp = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2), 'utf8');
  fs.renameSync(tmp, DATA_FILE);
}

module.exports = {
  all: () => load().tasks,
  nextId: () => load().nextId++,
  save,
  // test amaçlı: belleği sıfırlar
  reset: () => {
    state = { nextId: 1, tasks: [] };
    save();
  },
};
