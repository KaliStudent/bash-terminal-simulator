const express = require('express');
const { requireRole } = require('../middleware/auth');
const { db } = require('../database/init');

const router = express.Router();

// Get available tests
router.get('/tests', requireRole(['student', 'admin']), (req, res) => {
  db.all(`
    SELECT id, title, description, instructions, time_limit, created_at
    FROM tests
    WHERE is_active = 1
    ORDER BY created_at DESC
  `, (err, tests) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ tests });
  });
});

// Start test session
router.post('/tests/:id/start', requireRole(['student', 'admin']), (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Check if test exists and is active
  db.get('SELECT * FROM tests WHERE id = ? AND is_active = 1', [id], (err, test) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!test) {
      return res.status(404).json({ error: 'Test not found or inactive' });
    }

    // Check if user already has an active session for this test
    db.get(`
      SELECT id FROM sessions 
      WHERE user_id = ? AND test_id = ? AND status = 'active'
    `, [userId, id], (err, existingSession) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (existingSession) {
        return res.status(400).json({ error: 'Test session already active' });
      }

      // Create new test session
      db.run(`
        INSERT INTO sessions (user_id, session_type, test_id)
        VALUES (?, 'test', ?)
      `, [userId, id], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        res.json({
          message: 'Test session started',
          sessionId: this.lastID,
          test: test
        });
      });
    });
  });
});

// Start free practice session
router.post('/sessions/free/start', requireRole(['student', 'admin']), (req, res) => {
  const userId = req.user.id;

  // End any existing active sessions
  db.run('UPDATE sessions SET status = "terminated", end_time = CURRENT_TIMESTAMP WHERE user_id = ? AND status = "active"', [userId], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Create new free session
    db.run(`
      INSERT INTO sessions (user_id, session_type)
      VALUES (?, 'free')
    `, [userId], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({
        message: 'Free practice session started',
        sessionId: this.lastID
      });
    });
  });
});

// End session
router.post('/sessions/:id/end', requireRole(['student', 'admin']), (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  db.run(`
    UPDATE sessions 
    SET status = 'completed', end_time = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ? AND status = 'active'
  `, [id, userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Session not found or not active' });
    }

    res.json({ message: 'Session ended successfully' });
  });
});

// Get user's sessions
router.get('/sessions', requireRole(['student', 'admin']), (req, res) => {
  const userId = req.user.id;
  const { limit = 50, offset = 0 } = req.query;

  db.all(`
    SELECT 
      s.*,
      t.title as test_title
    FROM sessions s
    LEFT JOIN tests t ON s.test_id = t.id
    WHERE s.user_id = ?
    ORDER BY s.start_time DESC
    LIMIT ? OFFSET ?
  `, [userId, limit, offset], (err, sessions) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ sessions });
  });
});

// Submit test
router.post('/tests/:testId/submit', requireRole(['student', 'admin']), (req, res) => {
  const { testId } = req.params;
  const userId = req.user.id;
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID required' });
  }

  // Verify session belongs to user and is a test session
  db.get(`
    SELECT * FROM sessions 
    WHERE id = ? AND user_id = ? AND test_id = ? AND session_type = 'test' AND status = 'active'
  `, [sessionId, userId, testId], (err, session) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!session) {
      return res.status(404).json({ error: 'Active test session not found' });
    }

    // End the session
    db.run(`
      UPDATE sessions 
      SET status = 'completed', end_time = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [sessionId], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      // Create submission record
      db.run(`
        INSERT INTO test_submissions (test_id, user_id, session_id)
        VALUES (?, ?, ?)
      `, [testId, userId, sessionId], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        res.json({
          message: 'Test submitted successfully',
          submissionId: this.lastID
        });
      });
    });
  });
});

module.exports = router;
