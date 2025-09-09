import React, { useState, useEffect } from 'react';

const TestSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [grading, setGrading] = useState(false);
  const [gradeForm, setGradeForm] = useState({
    score: '',
    feedback: ''
  });

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      // This would need to be implemented in the backend
      // For now, we'll show a placeholder
      setSubmissions([]);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async (submissionId) => {
    if (!gradeForm.score) {
      alert('Please enter a score');
      return;
    }

    setGrading(true);
    try {
      const response = await fetch(`/api/admin/submissions/${submissionId}/grade`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          score: parseInt(gradeForm.score),
          feedback: gradeForm.feedback
        })
      });

      if (response.ok) {
        await fetchSubmissions();
        setSelectedSubmission(null);
        setGradeForm({ score: '', feedback: '' });
        alert('Submission graded successfully!');
      }
    } catch (error) {
      console.error('Failed to grade submission:', error);
      alert('Failed to grade submission');
    } finally {
      setGrading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return <div className="loading">Loading submissions...</div>;
  }

  return (
    <div>
      <div className="content-header">
        <h1>Test Submissions</h1>
        <button onClick={fetchSubmissions} className="btn">
          Refresh
        </button>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <p style={{ color: '#888', textAlign: 'center', padding: '40px' }}>
            Test submissions will be displayed here once students start submitting tests.
            This will show all submitted tests with their scores and feedback.
          </p>
        </div>

        {selectedSubmission && (
          <div style={{ flex: 1 }}>
            <div className="form-container">
              <h2>Grade Submission</h2>
              <div style={{ marginBottom: '20px' }}>
                <p><strong>Student:</strong> {selectedSubmission.username}</p>
                <p><strong>Test:</strong> {selectedSubmission.test_title}</p>
                <p><strong>Submitted:</strong> {formatDate(selectedSubmission.submitted_at)}</p>
                <p><strong>Session Duration:</strong> {
                  selectedSubmission.end_time && selectedSubmission.start_time
                    ? `${Math.round((new Date(selectedSubmission.end_time) - new Date(selectedSubmission.start_time)) / 60000)} minutes`
                    : 'N/A'
                }</p>
              </div>
              
              <div className="form-group">
                <label>Score (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={gradeForm.score}
                  onChange={(e) => setGradeForm({...gradeForm, score: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Feedback</label>
                <textarea
                  value={gradeForm.feedback}
                  onChange={(e) => setGradeForm({...gradeForm, feedback: e.target.value})}
                  rows="4"
                  placeholder="Enter feedback for the student..."
                />
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => handleGrade(selectedSubmission.id)}
                  className="btn"
                  disabled={grading}
                >
                  {grading ? 'Grading...' : 'Submit Grade'}
                </button>
                <button 
                  onClick={() => {
                    setSelectedSubmission(null);
                    setGradeForm({ score: '', feedback: '' });
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestSubmissions;
