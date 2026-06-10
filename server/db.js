const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'data', 'sensor_data.db');

let db = null;

async function getDb() {
  if (db) return db;

  const SQL = await initSqlJs();
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`CREATE TABLE IF NOT EXISTS sensor_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sensor TEXT NOT NULL,
    value REAL NOT NULL,
    timestamp INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_sensor_ts ON sensor_data(sensor, timestamp)`);

  saveDb();
  return db;
}

function saveDb() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

async function insertReading(sensor, value, timestamp) {
  const d = await getDb();
  d.run('INSERT INTO sensor_data (sensor, value, timestamp) VALUES (?, ?, ?)', [sensor, value, timestamp]);
  saveDb();
}

async function getHistory(sensor, limit = 200, from = null, to = null) {
  const d = await getDb();
  let sql = 'SELECT value, timestamp FROM sensor_data WHERE sensor = ?';
  const params = [sensor];

  if (from) { sql += ' AND timestamp >= ?'; params.push(from); }
  if (to) { sql += ' AND timestamp <= ?'; params.push(to); }

  sql += ' ORDER BY timestamp ASC LIMIT ?';
  params.push(limit);

  const stmt = d.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

async function getLatest(sensor) {
  const d = await getDb();
  const sql = 'SELECT value, timestamp FROM sensor_data WHERE sensor = ? ORDER BY timestamp DESC LIMIT 1';
  const stmt = d.prepare(sql);
  stmt.bind([sensor]);
  const row = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  return row;
}

async function getLatestAll() {
  const result = {};
  for (const sensor of ['temp', 'umid', 'luz']) {
    const row = await getLatest(sensor);
    if (row) result[sensor] = { value: row.value, timestamp: row.timestamp };
  }
  return result;
}

module.exports = { insertReading, getHistory, getLatest, getLatestAll };
