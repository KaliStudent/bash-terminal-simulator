import React, { useState, useEffect } from 'react';

const TestSelector = ({ onStartFree, onStartTest }) => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await fetch('/api/student/tests', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTests(data.tests);
      }
    } catch (error) {
      console.error('Failed to fetch tests:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading tests...</div>;
  }

  return (
    <div>
      <div className="form-container">
        <h2>Choose Your Session</h2>
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#00ff00', marginBottom: '15px' }}>Free Practice</h3>
          <p style={{ marginBottom: '15px', color: '#ccc' }}>
            Practice with the bash terminal simulator without any restrictions. 
            Perfect for learning and experimenting with commands.
          </p>
          <button onClick={onStartFree} className="btn">
            Start Free Practice Session
          </button>
        </div>
      </div>

      {tests.length > 0 && (
        <div className="form-container">
          <h2>Available Tests</h2>
          <div style={{ display: 'grid', gap: '15px' }}>
            {tests.map((test) => (
              <div key={test.id} style={{ 
                background: '#333', 
                padding: '15px', 
                borderRadius: '5px',
                border: '1px solid #555'
              }}>
                <h3 style={{ color: '#00ff00', marginBottom: '10px' }}>
                  {test.title}
                </h3>
                {test.description && (
                  <p style={{ marginBottom: '10px', color: '#ccc' }}>
                    {test.description}
                  </p>
                )}
                {test.instructions && (
                  <p style={{ marginBottom: '10px', color: '#ffaa00' }}>
                    <strong>Instructions:</strong> {test.instructions}
                  </p>
                )}
                {test.time_limit && (
                  <p style={{ marginBottom: '10px', color: '#4488ff' }}>
                    <strong>Time Limit:</strong> {test.time_limit} minutes
                  </p>
                )}
                <button 
                  onClick={() => onStartTest(test.id)} 
                  className="btn"
                  style={{ background: '#4488ff' }}
                >
                  Start Test
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tests.length === 0 && (
        <div className="form-container">
          <p style={{ textAlign: 'center', color: '#888' }}>
            No tests available at the moment. You can still practice with the free session!
          </p>
        </div>
      )}
    </div>
  );
};

export default TestSelector;
