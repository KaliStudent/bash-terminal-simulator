import React, { useState, useEffect, useRef } from 'react';

const Terminal = ({ sessionId }) => {
  const [history, setHistory] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentDir, setCurrentDir] = useState('/home/user');
  const [loading, setLoading] = useState(false);
  const terminalRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const executeCommand = async (command) => {
    if (!command.trim()) return;

    setLoading(true);
    
    // Add command to history
    const newEntry = {
      type: 'command',
      content: command,
      timestamp: new Date()
    };
    setHistory(prev => [...prev, newEntry]);

    try {
      const response = await fetch('/api/terminal/execute', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          command: command,
          sessionId: sessionId
        })
      });

      const result = await response.json();
      
      // Add output to history
      const outputEntry = {
        type: 'output',
        content: result.output,
        success: result.success,
        timestamp: new Date()
      };
      setHistory(prev => [...prev, outputEntry]);

      // Update current directory if it's a cd command
      if (command.startsWith('cd')) {
        const pwdResponse = await fetch(`/api/terminal/pwd/${sessionId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (pwdResponse.ok) {
          const pwdResult = await pwdResponse.json();
          setCurrentDir(pwdResult.output);
        }
      }

    } catch (error) {
      const errorEntry = {
        type: 'output',
        content: `Error: ${error.message}`,
        success: false,
        timestamp: new Date()
      };
      setHistory(prev => [...prev, errorEntry]);
    } finally {
      setLoading(false);
      // Refocus the input after command execution
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand(currentInput);
      setCurrentInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      // TODO: Implement command history navigation
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      // TODO: Implement command history navigation
    }
  };

  const handleInputChange = (e) => {
    setCurrentInput(e.target.value);
  };

  const renderHistoryEntry = (entry, index) => {
    if (entry.type === 'command') {
      return (
        <div key={index} className="terminal-line">
          <span className="terminal-prompt">user@bash:{currentDir}$ </span>
          <span>{entry.content}</span>
        </div>
      );
    } else if (entry.type === 'output') {
      return (
        <div key={index} className="terminal-line">
          <span className={entry.success ? 'terminal-success' : 'terminal-error'}>
            {entry.content}
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="terminal" ref={terminalRef}>
      <div className="terminal-output">
        {history.map((entry, index) => renderHistoryEntry(entry, index))}
      </div>
      
      <div className="terminal-input-line">
        <span className="terminal-prompt">user@bash:{currentDir}$ </span>
        <input
          ref={inputRef}
          type="text"
          className="terminal-input"
          value={currentInput}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          disabled={loading}
          placeholder={loading ? 'Executing...' : 'Type a command...'}
        />
      </div>
    </div>
  );
};

export default Terminal;
