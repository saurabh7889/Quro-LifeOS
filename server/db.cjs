const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'quro.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create all tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    username TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    avatar_url TEXT DEFAULT '',
    date_of_birth TEXT DEFAULT '',
    goals TEXT DEFAULT '',
    notif_task_reminders INTEGER DEFAULT 1,
    notif_habit_alerts INTEGER DEFAULT 1,
    notif_weekly_summary INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 0,
    coins INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    life_score INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    priority TEXT DEFAULT 'medium',
    difficulty TEXT DEFAULT 'medium',
    estimated_time TEXT DEFAULT '1h',
    xp INTEGER DEFAULT 100,
    completed INTEGER DEFAULT 0,
    deadline TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    completed_today INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    xp INTEGER DEFAULT 50,
    last_completed TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS study_subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    percentage INTEGER DEFAULT 0,
    trend TEXT DEFAULT 'neutral',
    color TEXT DEFAULT 'bg-blue-500',
    scope TEXT DEFAULT 'semester-1',
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS study_resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    type TEXT DEFAULT 'Notes',
    status TEXT DEFAULT 'Not Started',
    duration TEXT DEFAULT '',
    scope TEXT DEFAULT 'semester-1',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS study_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    tags TEXT DEFAULT '[]',
    date TEXT DEFAULT (date('now')),
    content TEXT DEFAULT '',
    scope TEXT DEFAULT 'semester-1',
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS study_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    current_cgpa REAL DEFAULT 0.0,
    target_cgpa REAL DEFAULT 0.0,
    scope TEXT DEFAULT 'semester-1',
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    progress INTEGER DEFAULT 0,
    status TEXT DEFAULT 'In Progress',
    deadline TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS project_milestones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    amount REAL NOT NULL,
    type TEXT DEFAULT 'expense',
    category TEXT DEFAULT 'Other',
    date TEXT DEFAULT (date('now')),
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS savings_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    goal_amount REAL DEFAULT 0,
    net_worth REAL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS workouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    duration TEXT DEFAULT '',
    calories INTEGER DEFAULT 0,
    date TEXT DEFAULT (date('now')),
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS health_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    steps INTEGER DEFAULT 0,
    calories_burned INTEGER DEFAULT 0,
    fitness_score INTEGER DEFAULT 0,
    step_goal INTEGER DEFAULT 0,
    date TEXT DEFAULT (date('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS diary_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    mood TEXT DEFAULT 'neutral',
    energy INTEGER DEFAULT 5,
    productivity INTEGER DEFAULT 5,
    content TEXT DEFAULT '',
    date TEXT DEFAULT (date('now')),
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    year INTEGER,
    rating INTEGER,
    status TEXT DEFAULT 'watchlist',
    genre TEXT DEFAULT '',
    poster TEXT DEFAULT '🎬',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    time TEXT DEFAULT 'Just now',
    read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

function ensureColumn(tableName, columnName, definition) {
  const cols = db.prepare(`PRAGMA table_info(${tableName})`).all();
  const exists = cols.some((col) => col.name === columnName);
  if (!exists) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

ensureColumn('study_subjects', 'scope', "TEXT DEFAULT 'semester-1'");
ensureColumn('study_resources', 'scope', "TEXT DEFAULT 'semester-1'");
ensureColumn('study_notes', 'scope', "TEXT DEFAULT 'semester-1'");
ensureColumn('study_settings', 'scope', "TEXT DEFAULT 'semester-1'");

/**
 * Seed initial data for a new user
 */
function seedUserData(userId) {
  // Intentionally empty: new users start with a clean zero-data state.
}

module.exports = { db, seedUserData };
