import React, { useState, useEffect } from 'react';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentActivity, setStudentActivity] = useState([]);

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
        <button onClick={fetchStudents} className="btn">
          Refresh
        </button>
      </div>

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
                      style={{ padding: '5px 10px', fontSize: '12px' }}
                    >
                      View Activity
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
