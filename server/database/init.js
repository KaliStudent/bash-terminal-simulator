const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const initializeDatabase = () => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'student')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME
    )
  `);

  // Sessions table for tracking student activity
  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      session_type TEXT NOT NULL CHECK(session_type IN ('free', 'test')),
      test_id INTEGER,
      start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      end_time DATETIME,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'terminated')),
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (test_id) REFERENCES tests (id)
    )
  `);

  // Tests table
  db.run(`
    CREATE TABLE IF NOT EXISTS tests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      instructions TEXT,
      restricted_commands TEXT, -- JSON array of allowed commands
      time_limit INTEGER, -- in minutes
      created_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_active BOOLEAN DEFAULT 1,
      FOREIGN KEY (created_by) REFERENCES users (id)
    )
  `);

  // Activity logs table
  db.run(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      command TEXT NOT NULL,
      output TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      success BOOLEAN DEFAULT 1,
      FOREIGN KEY (session_id) REFERENCES sessions (id)
    )
  `);

  // Test submissions table
  db.run(`
    CREATE TABLE IF NOT EXISTS test_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      test_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      session_id INTEGER NOT NULL,
      score INTEGER,
      feedback TEXT,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (test_id) REFERENCES tests (id),
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (session_id) REFERENCES sessions (id)
    )
  `);

  // Create default admin user
  const adminPassword = bcrypt.hashSync('admin123', 10);
  db.run(`
    INSERT OR IGNORE INTO users (username, email, password, role) 
    VALUES ('admin', 'admin@example.com', ?, 'admin')
  `, [adminPassword]);

  // Create sample student accounts
  const student1Password = bcrypt.hashSync('student123', 10);
  const student2Password = bcrypt.hashSync('student123', 10);
  const student3Password = bcrypt.hashSync('student123', 10);
  const brianPassword = bcrypt.hashSync('pass123', 10);
  db.run(`
    INSERT OR IGNORE INTO users (username, email, password, role) 
    VALUES ('student1', 'student1@example.com', ?, 'student')
  `, [student1Password]);
  
  db.run(`
    INSERT OR IGNORE INTO users (username, email, password, role) 
    VALUES ('student2', 'student2@example.com', ?, 'student')
  `, [student2Password]);
  
  db.run(`
    INSERT OR IGNORE INTO users (username, email, password, role) 
    VALUES ('student3', 'student3@example.com', ?, 'student')
  `, [student3Password]);

    db.run(`
    INSERT OR IGNORE INTO users (username, email, password, role) 
    VALUES ('brian', 'brian@example.com', ?, 'student')
  `, [brianPassword]);

  console.log('Database initialized successfully');
};

module.exports = { initializeDatabase, db };
