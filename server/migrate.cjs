const Database = require('better-sqlite3');
const db = new Database('server/quro.db');

const cols = [
  'username TEXT DEFAULT ""',
  'bio TEXT DEFAULT ""',
  'avatar_url TEXT DEFAULT ""',
  'date_of_birth TEXT DEFAULT ""',
  'goals TEXT DEFAULT ""',
  'notif_task_reminders INTEGER DEFAULT 1',
  'notif_habit_alerts INTEGER DEFAULT 1',
  'notif_weekly_summary INTEGER DEFAULT 1',
];

for (const col of cols) {
  try {
    db.exec('ALTER TABLE users ADD COLUMN ' + col);
    console.log('Added:', col.split(' ')[0]);
  } catch (e) {
    console.log('Exists:', col.split(' ')[0]);
  }
}
console.log('Migration done');
