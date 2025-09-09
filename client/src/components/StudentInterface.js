import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Terminal from './Terminal';
import TestSelector from './TestSelector';

const StudentInterface = () => {
  const { user, logout } = useAuth();
  const [currentSession, setCurrentSession] = useState(null);
  const [testInfo, setTestInfo] = useState(null);
  const [showTestSelector, setShowTestSelector] = useState(true);

  const startFreeSession = async () => {
    try {
      const response = await fetch('/api/student/sessions/free/start', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentSession({ id: data.sessionId, type: 'free' });
        setTestInfo(null);
        setShowTestSelector(false);
      }
    } catch (error) {
      console.error('Failed to start free session:', error);
    }
  };

  const startTestSession = async (testId) => {
    try {
      const response = await fetch(`/api/student/tests/${testId}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentSession({ id: data.sessionId, type: 'test', testId: testId });
        setTestInfo(data.test);
        setShowTestSelector(false);
      }
    } catch (error) {
      console.error('Failed to start test session:', error);
    }
  };

  const endSession = async () => {
    if (!currentSession) return;

    try {
      await fetch(`/api/student/sessions/${currentSession.id}/end`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      setCurrentSession(null);
      setTestInfo(null);
      setShowTestSelector(true);
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  const submitTest = async () => {
    if (!currentSession || currentSession.type !== 'test') return;

    try {
      await fetch(`/api/student/tests/${currentSession.testId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionId: currentSession.id })
      });

      alert('Test submitted successfully!');
      setCurrentSession(null);
      setTestInfo(null);
      setShowTestSelector(true);
    } catch (error) {
      console.error('Failed to submit test:', error);
    }
  };

  if (showTestSelector) {
    return (
      <div className="student-interface">
        <div className="terminal-header">
          <h1>Bash Terminal Simulator</h1>
          <div className="session-info">
            Welcome, {user?.username}!
            <button onClick={logout} className="btn-logout" style={{ marginLeft: '20px' }}>
              Logout
            </button>
          </div>
        </div>
        <div className="terminal-container">
          <TestSelector 
            onStartFree={startFreeSession}
            onStartTest={startTestSession}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="student-interface">
      <div className="terminal-header">
        <h1>Bash Terminal Simulator</h1>
        <div className="session-info">
          {currentSession?.type === 'test' ? 'Test Mode' : 'Free Practice'} | 
          Session: {currentSession?.id}
          <button onClick={endSession} className="btn-logout" style={{ marginLeft: '20px' }}>
            End Session
          </button>
          {currentSession?.type === 'test' && (
            <button onClick={submitTest} className="btn" style={{ marginLeft: '10px' }}>
              Submit Test
            </button>
          )}
        </div>
      </div>
      {testInfo && (
        <div className="test-info">
          <h3>{testInfo.title}</h3>
          {testInfo.description && <p>{testInfo.description}</p>}
          {testInfo.instructions && <p><strong>Instructions:</strong> {testInfo.instructions}</p>}
          {testInfo.time_limit && <p><strong>Time Limit:</strong> {testInfo.time_limit} minutes</p>}
        </div>
      )}
      <div className="terminal-container">
        <Terminal sessionId={currentSession?.id} />
      </div>
    </div>
  );
};

export default StudentInterface;
