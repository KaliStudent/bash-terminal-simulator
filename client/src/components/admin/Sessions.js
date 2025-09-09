import React, { useState, useEffect } from 'react';

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionLogs, setSessionLogs] = useState([]);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      // This would need to be implemented in the backend
      // For now, we'll show a placeholder
      setSessions([]);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionLogs = async (sessionId) => {
    try {
      const response = await fetch(`/api/admin/sessions/${sessionId}/logs`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSessionLogs(data.logs);
      }
    } catch (error) {
      console.error('Failed to fetch session logs:', error);
    }
  };

  const handleSessionClick = (session) => {
    setSelectedSession(session);
    fetchSessionLogs(session.session_id);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return <div className="loading">Loading sessions...</div>;
  }

  return (
    <div>
      <div className="content-header">
        <h1>All Sessions</h1>
        <button onClick={fetchSessions} className="btn">
          Refresh
        </button>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <p style={{ color: '#888', textAlign: 'center', padding: '40px' }}>
            Session monitoring feature will be implemented here.
            This will show all active and completed sessions across all students.
          </p>
        </div>

        {selectedSession && (
          <div style={{ flex: 1 }}>
            <div className="form-container">
              <h2>Session Logs</h2>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {sessionLogs.length > 0 ? (
                  <div>
                    {sessionLogs.map((log, index) => (
                      <div key={index} style={{ 
                        marginBottom: '10px', 
                        padding: '10px', 
                        background: '#333',
                        borderRadius: '3px',
                        borderLeft: `3px solid ${log.success ? '#00ff00' : '#ff4444'}`
                      }}>
                        <div style={{ color: '#00ff00', fontWeight: 'bold' }}>
                          $ {log.command}
                        </div>
                        {log.output && (
                          <div style={{ 
                            marginTop: '5px', 
                            color: log.success ? '#ffffff' : '#ff4444',
                            whiteSpace: 'pre-wrap'
                          }}>
                            {log.output}
                          </div>
                        )}
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#888', 
                          marginTop: '5px' 
                        }}>
                          {formatDate(log.timestamp)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No logs found for this session.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sessions;
