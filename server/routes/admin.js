const express = require('express');
const { requireRole } = require('../middleware/auth');
const { db } = require('../database/init');

const router = express.Router();

// Get all students
router.get('/students', requireRole(['admin']), (req, res) => {
  db.all(
    'SELECT id, username, email, created_at, last_login FROM users WHERE role = "student"',
    (err, students) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ students });
    }
  );
});

// Create new student
router.post('/students', requireRole(['admin']), (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Validate password strength
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  const bcrypt = require('bcryptjs');
  const hashedPassword = bcrypt.hashSync(password, 10);

  db.run(
    'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
    [username, email, hashedPassword, 'student'],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Username or email already exists' });
        }
        return res.status(500).json({ error: 'Database error' });
      }

      res.status(201).json({
        message: 'Student created successfully',
        student: {
          id: this.lastID,
          username,
          email,
          role: 'student'
        }
      });
    }
  );
});

// Delete student
router.delete('/students/:id', requireRole(['admin']), (req, res) => {
  const { id } = req.params;

  // First check if student exists
  db.get('SELECT id FROM users WHERE id = ? AND role = "student"', [id], (err, student) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Delete the student
    db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({ message: 'Student deleted successfully' });
    });
  });
});

// Get student activity
router.get('/students/:id/activity', requireRole(['admin']), (req, res) => {
  const { id } = req.params;
  const { limit = 100, offset = 0 } = req.query;

  db.all(`
    SELECT 
      s.id as session_id,
      s.session_type,
      s.start_time,
      s.end_time,
      s.status,
      t.title as test_title,
      COUNT(al.id) as command_count
    FROM sessions s
    LEFT JOIN tests t ON s.test_id = t.id
    LEFT JOIN activity_logs al ON s.id = al.session_id
    WHERE s.user_id = ?
    GROUP BY s.id
    ORDER BY s.start_time DESC
    LIMIT ? OFFSET ?
  `, [id, limit, offset], (err, sessions) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ sessions });
  });
});

// Get detailed session logs
router.get('/sessions/:sessionId/logs', requireRole(['admin']), (req, res) => {
  const { sessionId } = req.params;

  db.all(`
    SELECT command, output, timestamp, success
    FROM activity_logs
    WHERE session_id = ?
    ORDER BY timestamp ASC
  `, [sessionId], (err, logs) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ logs });
  });
});

// Create test
router.post('/tests', requireRole(['admin']), (req, res) => {
  const { title, description, instructions, restricted_commands, time_limit } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const commandsJson = restricted_commands ? JSON.stringify(restricted_commands) : null;

  db.run(`
    INSERT INTO tests (title, description, instructions, restricted_commands, time_limit, created_by)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [title, description, instructions, commandsJson, time_limit, req.user.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.status(201).json({
      message: 'Test created successfully',
      testId: this.lastID
    });
  });
});

// Get all tests
router.get('/tests', requireRole(['admin']), (req, res) => {
  db.all(`
    SELECT t.*, u.username as created_by_username
    FROM tests t
    JOIN users u ON t.created_by = u.id
    ORDER BY t.created_at DESC
  `, (err, tests) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ tests });
  });
});

// Update test
router.put('/tests/:id', requireRole(['admin']), (req, res) => {
  const { id } = req.params;
  const { title, description, instructions, restricted_commands, time_limit, is_active } = req.body;

  const commandsJson = restricted_commands ? JSON.stringify(restricted_commands) : null;

  db.run(`
    UPDATE tests 
    SET title = ?, description = ?, instructions = ?, restricted_commands = ?, time_limit = ?, is_active = ?
    WHERE id = ?
  `, [title, description, instructions, commandsJson, time_limit, is_active, id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Test not found' });
    }

    res.json({ message: 'Test updated successfully' });
  });
});

// Delete test
router.delete('/tests/:id', requireRole(['admin']), (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM tests WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Test not found' });
    }

    res.json({ message: 'Test deleted successfully' });
  });
});

// Get test submissions
router.get('/tests/:id/submissions', requireRole(['admin']), (req, res) => {
  const { id } = req.params;

  db.all(`
    SELECT 
      ts.*,
      u.username,
      u.email,
      s.start_time,
      s.end_time
    FROM test_submissions ts
    JOIN users u ON ts.user_id = u.id
    JOIN sessions s ON ts.session_id = s.id
    WHERE ts.test_id = ?
    ORDER BY ts.submitted_at DESC
  `, [id], (err, submissions) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ submissions });
  });
});

// Grade submission
router.put('/submissions/:id/grade', requireRole(['admin']), (req, res) => {
  const { id } = req.params;
  const { score, feedback } = req.body;

  db.run(`
    UPDATE test_submissions 
    SET score = ?, feedback = ?
    WHERE id = ?
  `, [score, feedback, id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json({ message: 'Submission graded successfully' });
  });
});

module.exports = router;
