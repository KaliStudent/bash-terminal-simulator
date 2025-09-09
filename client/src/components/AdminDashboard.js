import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Students from './admin/Students';
import Tests from './admin/Tests';
import Sessions from './admin/Sessions';
import TestSubmissions from './admin/TestSubmissions';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { path: '/admin/students', label: 'Students', component: Students },
    { path: '/admin/tests', label: 'Tests', component: Tests },
    { path: '/admin/sessions', label: 'Sessions', component: Sessions },
    { path: '/admin/submissions', label: 'Submissions', component: TestSubmissions }
  ];

  return (
    <div className="admin-dashboard">
      <div className="sidebar">
        <h2>Admin Dashboard</h2>
        <ul>
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link 
                to={item.path} 
                className={location.pathname === item.path ? 'active' : ''}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div style={{ marginTop: '20px', padding: '10px', background: '#333', borderRadius: '5px' }}>
          <p style={{ color: '#00ff00', fontSize: '12px' }}>Logged in as: {user?.username}</p>
          <button onClick={logout} className="btn-logout" style={{ marginTop: '10px', width: '100%' }}>
            Logout
          </button>
        </div>
      </div>
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/admin/students" replace />} />
          {menuItems.map((item) => (
            <Route key={item.path} path={item.path.replace('/admin', '')} element={<item.component />} />
          ))}
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
