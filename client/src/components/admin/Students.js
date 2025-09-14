import React, { useState, useEffect } from 'react';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentActivity, setStudentActivity] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    username: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/admin/students', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStudents(data.students);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentActivity = async (studentId) => {
    try {
      const response = await fetch(`/api/admin/students/${studentId}/activity`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStudentActivity(data.sessions);
      }
    } catch (error) {
      console.error('Failed to fetch student activity:', error);
    }
  };

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    fetchStudentActivity(student.id);
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    
    if (!createForm.username || !createForm.email || !createForm.password) {
      alert('Please fill in all fields');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/admin/students', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createForm)
      });

      if (response.ok) {
        await fetchStudents();
        setShowCreateForm(false);
        setCreateForm({ username: '', email: '', password: '' });
        alert('Student created successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create student');
      }
    } catch (error) {
      console.error('Failed to create student:', error);
      alert('Failed to create student');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/students/${studentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        await fetchStudents();
        alert('Student deleted successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete student');
      }
    } catch (error) {
      console.error('Failed to delete student:', error);
      alert('Failed to delete student');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return <div className="loading">Loading students...</div>;
  }

  return (
    <div>
      <div className="content-header">
        <h1>Students</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setShowCreateForm(true)} className="btn">
            Create New Student
          </button>
          <button onClick={fetchStudents} className="btn">
            Refresh
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div className="form-container" style={{ marginBottom: '20px' }}>
          <h2>Create New Student</h2>
          <form onSubmit={handleCreateStudent}>
            <div className="form-row">
              <div className="form-group">
                <label>Username *</label>
                <input
                  type="text"
                  value={createForm.username}
                  onChange={(e) => setCreateForm({...createForm, username: e.target.value})}
                  required
                  placeholder="Enter username"
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                  required
                  placeholder="Enter email address"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm({...createForm, password: e.target.value})}
                required
                placeholder="Enter password (min 6 characters)"
                minLength="6"
              />
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn" disabled={creating}>
                {creating ? 'Creating...' : 'Create Student'}
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setShowCreateForm(false);
                  setCreateForm({ username: '', email: '', password: '' });
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Created</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr 
                  key={student.id}
                  onClick={() => handleStudentClick(student)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>{student.username}</td>
                  <td>{student.email}</td>
                  <td>{formatDate(student.created_at)}</td>
                  <td>{student.last_login ? formatDate(student.last_login) : 'Never'}</td>
                  <td>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStudentClick(student);
                      }}
                      className="btn"
                      style={{ padding: '5px 10px', fontSize: '12px', marginRight: '5px' }}
                    >
                      View Activity
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteStudent(student.id);
                      }}
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

        {selectedStudent && (
          <div style={{ flex: 1 }}>
            <div className="form-container">
              <h2>Activity for {selectedStudent.username}</h2>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {studentActivity.length > 0 ? (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Session Type</th>
                        <th>Test</th>
                        <th>Start Time</th>
                        <th>End Time</th>
                        <th>Status</th>
                        <th>Commands</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentActivity.map((session) => (
                        <tr key={session.session_id}>
                          <td>{session.session_type}</td>
                          <td>{session.test_title || 'N/A'}</td>
                          <td>{formatDate(session.start_time)}</td>
                          <td>{session.end_time ? formatDate(session.end_time) : 'Active'}</td>
                          <td>{session.status}</td>
                          <td>{session.command_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No activity found for this student.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Students;
