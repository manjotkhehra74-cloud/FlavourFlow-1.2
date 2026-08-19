// Tiny JSON document store — no native deps, works in restricted sandboxes.
const fs = require('fs');
const path = require('path');

const dataDir = process.env.DATA_DIR || path.join(__dirname, '..', '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });
const dataFile = path.join(dataDir, 'db.json');

const empty = {
  seq: 0,
  users: [],
  attendance: [],
  attendance_requests: [],
  leave_requests: [],
  leave_balances: [],
  team_actions: [],
  posts: [],
  comments: [],
  wishes: [],
  tickets: [],
};

let store;
try {
  store = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
} catch {
  store = JSON.parse(JSON.stringify(empty));
}
for (const k of Object.keys(empty)) if (!(k in store)) store[k] = JSON.parse(JSON.stringify(empty[k]));

function save() {
  fs.writeFileSync(dataFile, JSON.stringify(store, null, 2));
}
function nextId() {
  store.seq += 1;
  save();
  return store.seq;
}

// Collection helper — returns an API shaped a bit like better-sqlite3 for ergonomics.
function coll(name) {
  return {
    all: () => JSON.parse(JSON.stringify(store[name])),
    find: (pred) => JSON.parse(JSON.stringify(store[name].find(pred) || null)),
    filter: (pred) => JSON.parse(JSON.stringify(store[name].filter(pred))),
    insert: (doc) => {
      const id = nextId();
      const now = new Date().toISOString();
      const row = { id, created_at: now, ...doc };
      store[name].push(row);
      save();
      return { lastInsertRowid: id, row: JSON.parse(JSON.stringify(row)) };
    },
    update: (pred, patch) => {
      let changes = 0;
      store[name].forEach((r) => { if (pred(r)) { Object.assign(r, patch); changes += 1; } });
      save();
      return { changes };
    },
    remove: (pred) => {
      const before = store[name].length;
      store[name] = store[name].filter((r) => !pred(r));
      save();
      return { changes: before - store[name].length };
    },
    count: (pred) => (pred ? store[name].filter(pred).length : store[name].length),
  };
}

const db = {
  users: coll('users'),
  attendance: coll('attendance'),
  attendance_requests: coll('attendance_requests'),
  leave_requests: coll('leave_requests'),
  leave_balances: coll('leave_balances'),
  team_actions: coll('team_actions'),
  posts: coll('posts'),
  comments: coll('comments'),
  wishes: coll('wishes'),
  tickets: coll('tickets'),
  transaction: (fn) => (...args) => fn(...args),
  _reset: () => { store = JSON.parse(JSON.stringify(empty)); save(); },
};

module.exports = db;
