import React, { useState, useEffect } from 'react';
import Terminal from './Terminal';

const SimulatorFrame = ({ sessionId, user, sessionType = 'practice' }) => {
  const [errors, setErrors] = useState([]);
  const [showInstructions, setShowInstructions] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);

  // Mock data for demonstration - in a real app, this would come from props or API
  const mockErrors = [
    { time: '14:32:15', message: 'Command not found: lss' },
    { time: '14:31:42', message: 'Permission denied: /root' },
    { time: '14:30:18', message: 'No such file or directory: /tmp/test.txt' }
  ];

  const mockInstructions = {
    practice: {
      title: "Free Practice Mode",
      content: "You're in free practice mode. Use this time to explore bash commands and get familiar with the terminal environment.",
      tips: [
        "Try basic commands like 'ls', 'pwd', 'cd'",
        "Use 'man <command>' to get help on any command",
        "Practice file operations with 'touch', 'mkdir', 'rm'",
        "Explore text editing with 'nano' or 'vim'"
      ]
    },
    test: {
      title: "Test Mode",
      content: "You're taking a test. Follow the instructions carefully and complete all required tasks.",
      tips: [
        "Read all instructions before starting",
        "Check your work before submitting",
        "Use 'history' to review your commands",
        "Don't hesitate to ask for clarification if needed"
      ]
    }
  };

  useEffect(() => {
    // In a real app, you might fetch errors from an API
    setErrors(mockErrors);
  }, [sessionId]);

  const currentInstructions = mockInstructions[sessionType] || mockInstructions.practice;

  return (
    <div className="simulator-container">
      {/* Left Info Panel */}
      <div className="info-panel">
        <div className="info-section">
          <h3>Session Info</h3>
          <div className="info-item">
            <span>User:</span>
            <span>{user?.username || 'Guest'}</span>
          </div>
          <div className="info-item">
            <span>Session:</span>
            <span>{sessionId || 'N/A'}</span>
          </div>
          <div className="info-item">
            <span>Mode:</span>
            <span>{sessionType}</span>
          </div>
        </div>

        <div className="info-section">
          <h3>Configuration</h3>
          <div className="config-item">
            <label>
              <input 
                type="checkbox" 
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
              />
              Auto-scroll
            </label>
          </div>
          <div className="config-item">
            <label>
              <input 
                type="checkbox" 
                checked={showInstructions}
                onChange={(e) => setShowInstructions(e.target.checked)}
              />
              Show Instructions
            </label>
          </div>
        </div>

        {errors.length > 0 && (
          <div className="info-section">
            <h3>Recent Errors</h3>
            {errors.map((error, index) => (
              <div key={index} className="error-item">
                <div className="error-time">{error.time}</div>
                <div className="error-message">{error.message}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Terminal Frame */}
      <div className="terminal-frame">
        <div className="terminal-header">
          <div className="terminal-title">Bash Terminal</div>
          <div className="terminal-status">
            <div className="status-indicator"></div>
            <span>Connected</span>
          </div>
        </div>
        <Terminal sessionId={sessionId} />
      </div>

      {/* Bottom Instructions Panel */}
      {showInstructions && (
        <div className="instructions-panel">
          <h3>{currentInstructions.title}</h3>
          <div className="instructions-content">
            <p>{currentInstructions.content}</p>
            <h4>Quick Tips:</h4>
            <ul>
              {currentInstructions.tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulatorFrame;

