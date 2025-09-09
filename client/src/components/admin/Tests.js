import React, { useState, useEffect } from 'react';

const Tests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    restricted_commands: '',
    time_limit: ''
  });

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await fetch('/api/admin/tests', {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const testData = {
      ...formData,
      restricted_commands: formData.restricted_commands 
        ? formData.restricted_commands.split(',').map(cmd => cmd.trim())
        : null,
      time_limit: formData.time_limit ? parseInt(formData.time_limit) : null
    };

    try {
      const url = editingTest ? `/api/admin/tests/${editingTest.id}` : '/api/admin/tests';
      const method = editingTest ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
      });

      if (response.ok) {
        await fetchTests();
        setShowForm(false);
        setEditingTest(null);
        setFormData({
          title: '',
          description: '',
          instructions: '',
          restricted_commands: '',
          time_limit: ''
        });
      }
    } catch (error) {
      console.error('Failed to save test:', error);
    }
  };

  const handleEdit = (test) => {
    setEditingTest(test);
    setFormData({
      title: test.title,
      description: test.description || '',
      instructions: test.instructions || '',
      restricted_commands: test.restricted_commands 
        ? JSON.parse(test.restricted_commands).join(', ')
        : '',
      time_limit: test.time_limit || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (testId) => {
    if (!window.confirm('Are you sure you want to delete this test?')) return;

    try {
      const response = await fetch(`/api/admin/tests/${testId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        await fetchTests();
      }
    } catch (error) {
      console.error('Failed to delete test:', error);
    }
  };

  const toggleTestStatus = async (test) => {
    try {
      const response = await fetch(`/api/admin/tests/${test.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...test,
          is_active: !test.is_active
        })
      });

      if (response.ok) {
        await fetchTests();
      }
    } catch (error) {
      console.error('Failed to update test:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return <div className="loading">Loading tests...</div>;
  }

  return (
    <div>
      <div className="content-header">
        <h1>Tests</h1>
        <button onClick={() => setShowForm(true)} className="btn">
          Create New Test
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <h2>{editingTest ? 'Edit Test' : 'Create New Test'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Time Limit (minutes)</label>
                <input
                  type="number"
                  value={formData.time_limit}
                  onChange={(e) => setFormData({...formData, time_limit: e.target.value})}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="3"
              />
            </div>
            
            <div className="form-group">
              <label>Instructions</label>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                rows="4"
              />
            </div>
            
            <div className="form-group">
              <label>Restricted Commands (comma-separated)</label>
              <input
                type="text"
                value={formData.restricted_commands}
                onChange={(e) => setFormData({...formData, restricted_commands: e.target.value})}
                placeholder="ls, cd, pwd, cat, mkdir, touch, rm, rmdir, cp, mv, echo, grep, find, head, tail, wc, sort, uniq, chmod, whoami, date, history, help, clear"
              />
              <small style={{ color: '#888' }}>
                Leave empty to allow all commands. Separate commands with commas.
              </small>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn">
                {editingTest ? 'Update Test' : 'Create Test'}
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setShowForm(false);
                  setEditingTest(null);
                  setFormData({
                    title: '',
                    description: '',
                    instructions: '',
                    restricted_commands: '',
                    time_limit: ''
                  });
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Time Limit</th>
            <th>Status</th>
            <th>Created</th>
            <th>Created By</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tests.map((test) => (
            <tr key={test.id}>
              <td>{test.title}</td>
              <td>{test.description || 'N/A'}</td>
              <td>{test.time_limit ? `${test.time_limit} min` : 'No limit'}</td>
              <td>
                <span style={{ 
                  color: test.is_active ? '#00ff00' : '#ff4444',
                  fontWeight: 'bold'
                }}>
                  {test.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>{formatDate(test.created_at)}</td>
              <td>{test.created_by_username}</td>
              <td>
                <button 
                  onClick={() => handleEdit(test)}
                  className="btn"
                  style={{ padding: '5px 10px', fontSize: '12px', marginRight: '5px' }}
                >
                  Edit
                </button>
                <button 
                  onClick={() => toggleTestStatus(test)}
                  className="btn"
                  style={{ 
                    padding: '5px 10px', 
                    fontSize: '12px', 
                    marginRight: '5px',
                    background: test.is_active ? '#ff4444' : '#00ff00'
                  }}
                >
                  {test.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button 
                  onClick={() => handleDelete(test.id)}
                  className="btn"
                  style={{ 
                    padding: '5px 10px', 
                    fontSize: '12px',
                    background: '#ff4444'
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Tests;
