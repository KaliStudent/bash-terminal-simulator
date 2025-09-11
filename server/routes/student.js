const express = require('express');
const { requireRole } = require('../middleware/auth');
const { db } = require('../database/init');
const BashSimulator = require('../services/bashSimulator');

const router = express.Router();

// Execute command
router.post('/execute', requireRole(['student', 'admin']), (req, res) => {
  const { command, sessionId } = req.body;
  const userId = req.user.id;

  if (!command || !sessionId) {
    return res.status(400).json({ error: 'Command and session ID required' });
  }

  // Verify session belongs to user
  db.get(`
    SELECT s.*, t.restricted_commands, t.time_limit
    FROM sessions s
    LEFT JOIN tests t ON s.test_id = t.id
    WHERE s.id = ? AND s.user_id = ? AND s.status = 'active'
  `, [sessionId, userId], (err, session) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!session) {
      return res.status(404).json({ error: 'Active session not found' });
    }

    // Check command restrictions for test sessions
    if (session.session_type === 'test' && session.restricted_commands) {
      const allowedCommands = JSON.parse(session.restricted_commands);
      const commandName = command.split(' ')[0];
      
      if (!allowedCommands.includes(commandName)) {
        return res.status(403).json({ 
          error: 'Command not allowed in this test',
          allowedCommands 
        });
      }
    }

    // Get or create simulator instance for this session
    let simulator = req.app.get(`simulator_${sessionId}`);
    if (!simulator) {
      simulator = new BashSimulator();
      req.app.set(`simulator_${sessionId}`, simulator);
    }
    
    const result = simulator.executeCommand(command);

    // Log the command and result
    db.run(`
      INSERT INTO activity_logs (session_id, command, output, success)
      VALUES (?, ?, ?, ?)
    `, [sessionId, command, result.output, result.success], (err) => {
      if (err) {
        console.error('Failed to log activity:', err);
      }
    });

    res.json(result);
  });
});

// Get current directory
router.get('/pwd/:sessionId', requireRole(['student', 'admin']), (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user.id;

  db.get(`
    SELECT * FROM sessions 
    WHERE id = ? AND user_id = ? AND status = 'active'
  `, [sessionId, userId], (err, session) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!session) {
      return res.status(404).json({ error: 'Active session not found' });
    }

    // Get or create simulator instance for this session
    let simulator = req.app.get(`simulator_${sessionId}`);
    if (!simulator) {
      simulator = new BashSimulator();
      req.app.set(`simulator_${sessionId}`, simulator);
    }
    
    const result = simulator.executeCommand('pwd');
    res.json(result);
  });
});

module.exports = router;
