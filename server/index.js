const express = require('express');
const cors = require('cors');
const path = require('path');
const WebSocket = require('ws');
const http = require('http');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const studentRoutes = require('./routes/student');
const terminalRoutes = require('./routes/terminal');
const { initializeDatabase } = require('./database/init');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// Initialize database
initializeDatabase();

// WebSocket for real-time terminal communication
wss.on('connection', (ws, req) => {
  console.log('New terminal connection');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      // Handle terminal commands here
      console.log('Terminal command:', data);
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    console.log('Terminal connection closed');
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);
app.use('/api/student', authenticateToken, studentRoutes);
app.use('/api/terminal', authenticateToken, terminalRoutes);

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
