import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import Header from './components/Header';
import Sidebar from './components/Sidebar';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState([]);

  // Check authentication on load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
        showNotification('success', `Welcome back, ${parsedUser.name || parsedUser.email}!`);
      } catch (error) {
        console.error('Error parsing user data:', error);
        handleLogout();
      }
    }
    setLoading(false);
  }, []);

  // Show notification
  const showNotification = (type, message) => {
    const id = Date.now();
    const notification = { id, type, message };
    setNotifications(prev => [...prev, notification]);
    
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Handle login
  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    showNotification('success', 'Login successful!');
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setIsAuthenticated(false);
    setActiveTab('dashboard');
    showNotification('info', 'Logged out successfully.');
  };

  // Handle register (uses the same logic as login)
  const handleRegister = (token, userData) => {
    handleLogin(token, userData);
    showNotification('success', 'Registration successful! Welcome!');
  };

  // Protected route wrapper
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  // Render dashboard content based on active tab
  const renderDashboardContent = () => {
    if (!user) return null;

    // Sample issues data
    const issues = [
      { id: '#001', type: 'Pothole', location: 'Main Road, Near Market', status: 'pending', priority: 'high', date: '2024-01-15' },
      { id: '#002', type: 'Street Light', location: 'Park Street', status: 'completed', priority: 'low', date: '2024-01-14' },
      { id: '#003', type: 'Drainage', location: 'Ganesh Colony', status: 'in-progress', priority: 'medium', date: '2024-01-13' },
    ];

    // Get status badge
    const getStatusBadge = (status, priority) => {
      if (status === 'pending') return <span className="status-badge pending">Pending</span>;
      if (status === 'in-progress') return <span className="status-badge in-progress">In Progress</span>;
      if (status === 'completed') return <span className="status-badge completed">Resolved</span>;
      
      if (priority === 'high') return <span className="status-badge high">High</span>;
      if (priority === 'medium') return <span className="status-badge medium">Medium</span>;
      return <span className="status-badge low">Low</span>;
    };

    // Render issues table
    const renderIssuesTable = (filteredIssues = issues) => (
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Issue Type</th>
              <th>Location</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Reported On</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredIssues.map(issue => (
              <tr key={issue.id}>
                <td>{issue.id}</td>
                <td>{issue.type}</td>
                <td>{issue.location}</td>
                <td>{getStatusBadge(issue.status, '')}</td>
                <td>{getStatusBadge('', issue.priority)}</td>
                <td>{issue.date}</td>
                <td>
                  <div className="action-buttons">
                    <button className="btn btn-primary" onClick={() => showNotification('info', `Viewing ${issue.id}`)}>
                      <span>👁️</span> View
                    </button>
                    <button className="btn btn-secondary" onClick={() => showNotification('info', `Editing ${issue.id}`)}>
                      <span>✏️</span> Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="dashboard-view fade-in">
            <div className="dashboard-header">
              <h2>Welcome back, {user.name || user.email}!</h2>
              <p>Here's what's happening with road repairs in Solapur today.</p>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-icon">📋</div>
                  <span className="stat-trend up">+12%</span>
                </div>
                <div className="stat-content">
                  <h3>248</h3>
                  <p>Total Issues Reported</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-icon">✅</div>
                  <span className="stat-trend up">+8%</span>
                </div>
                <div className="stat-content">
                  <h3>187</h3>
                  <p>Issues Resolved</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-icon">⏳</div>
                  <span className="stat-trend down">-3%</span>
                </div>
                <div className="stat-content">
                  <h3>42</h3>
                  <p>Pending Issues</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-icon">👷</div>
                  <span className="stat-trend up">+5%</span>
                </div>
                <div className="stat-content">
                  <h3>{user.role === 'admin' ? '24' : user.role === 'worker' ? '8' : 'N/A'}</h3>
                  <p>Active Workers</p>
                </div>
              </div>
            </div>

            <div className="quick-actions">
              <h3><span>⚡</span> Quick Actions</h3>
              <div className="actions-grid">
                {user.role === 'citizen' && (
                  <>
                    <button className="action-btn primary" onClick={() => setActiveTab('report')}>
                      <span className="action-icon">➕</span>
                      Report New Issue
                    </button>
                    <button className="action-btn secondary" onClick={() => setActiveTab('my-issues')}>
                      <span className="action-icon">📋</span>
                      View My Reports
                    </button>
                    <button className="action-btn" onClick={() => setActiveTab('track')}>
                      <span className="action-icon">📍</span>
                      Track Status
                    </button>
                  </>
                )}
                
                {user.role === 'worker' && (
                  <>
                    <button className="action-btn primary" onClick={() => setActiveTab('tasks')}>
                      <span className="action-icon">✅</span>
                      View Tasks
                    </button>
                    <button className="action-btn secondary" onClick={() => showNotification('info', 'Upload photos feature coming soon!')}>
                      <span className="action-icon">📸</span>
                      Upload Photos
                    </button>
                    <button className="action-btn" onClick={() => showNotification('info', 'Update progress feature coming soon!')}>
                      <span className="action-icon">📈</span>
                      Update Progress
                    </button>
                  </>
                )}
                
                {user.role === 'admin' && (
                  <>
                    <button className="action-btn primary" onClick={() => setActiveTab('workers')}>
                      <span className="action-icon">👥</span>
                      Manage Users
                    </button>
                    <button className="action-btn secondary" onClick={() => showNotification('info', 'Assign tasks feature coming soon!')}>
                      <span className="action-icon">📋</span>
                      Assign Tasks
                    </button>
                    <button className="action-btn danger" onClick={() => showNotification('info', 'Generate reports feature coming soon!')}>
                      <span className="action-icon">📊</span>
                      Generate Reports
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="recent-activity">
              <h3><span>🕒</span> Recent Activity</h3>
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-icon">📍</div>
                  <div className="activity-details">
                    <h4>New pothole reported on Main Road</h4>
                    <p>Citizen reported a large pothole near the market area</p>
                    <div className="activity-time">10 minutes ago</div>
                  </div>
                </div>
                
                <div className="activity-item">
                  <div className="activity-icon">✅</div>
                  <div className="activity-details">
                    <h4>Street light repair completed</h4>
                    <p>Worker John completed the street light repair on Park Street</p>
                    <div className="activity-time">2 hours ago</div>
                  </div>
                </div>
                
                <div className="activity-item">
                  <div className="activity-icon">📸</div>
                  <div className="activity-details">
                    <h4>Progress photos uploaded</h4>
                    <p>Worker Sarah uploaded before/after photos of road repair</p>
                    <div className="activity-time">4 hours ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'issues':
        return (
          <div className="dashboard-view fade-in">
            <div className="dashboard-header">
              <h2>All Issues</h2>
              <p>Manage and track all reported road issues</p>
            </div>
            
            <div className="content-tabs">
              <button className="tab-btn active" onClick={() => setActiveTab('issues')}>All Issues</button>
              <button className="tab-btn" onClick={() => showNotification('info', 'Pending issues filter coming soon!')}>Pending</button>
              <button className="tab-btn" onClick={() => showNotification('info', 'In progress filter coming soon!')}>In Progress</button>
              <button className="tab-btn" onClick={() => showNotification('info', 'Resolved issues filter coming soon!')}>Resolved</button>
            </div>
            
            {renderIssuesTable()}
          </div>
        );

      case 'report':
        return (
          <div className="dashboard-view fade-in">
            <div className="dashboard-header">
              <h2>Report New Issue</h2>
              <p>Report a road issue that needs attention</p>
            </div>
            
            <div className="auth-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
              <form className="auth-form" onSubmit={(e) => {
                e.preventDefault();
                showNotification('success', 'Issue reported successfully!');
                setActiveTab('my-issues');
              }}>
                <div className="form-group">
                  <label>Issue Type *</label>
                  <select required defaultValue="">
                    <option value="" disabled>Select issue type</option>
                    <option value="pothole">Pothole</option>
                    <option value="street-light">Street Light</option>
                    <option value="drainage">Drainage Problem</option>
                    <option value="road-damage">Road Damage</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Location *</label>
                  <input type="text" placeholder="Enter exact location or address" required />
                </div>
                
                <div className="form-group">
                  <label>Description *</label>
                  <textarea rows="4" placeholder="Describe the issue in detail" required></textarea>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Priority</label>
                    <select defaultValue="medium">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Upload Photo (Optional)</label>
                    <div className="file-input-wrapper">
                      <input type="file" accept="image/*" id="photo-upload" />
                      <label htmlFor="photo-upload" className="file-input-label">
                        <span>📷</span>
                        Choose File
                      </label>
                    </div>
                  </div>
                </div>
                
                <button type="submit" className="auth-btn">
                  <span>📤</span>
                  Submit Report
                </button>
              </form>
            </div>
          </div>
        );

      case 'my-issues':
        return (
          <div className="dashboard-view fade-in">
            <div className="dashboard-header">
              <h2>My Reported Issues</h2>
              <p>Track the status of issues you've reported</p>
            </div>
            {renderIssuesTable(issues.filter(issue => issue.id === '#001' || issue.id === '#003'))}
          </div>
        );

      case 'tasks':
        return (
          <div className="dashboard-view fade-in">
            <div className="dashboard-header">
              <h2>My Tasks</h2>
              <p>View and manage your assigned tasks</p>
            </div>
            
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <h3>No tasks assigned</h3>
              <p>You don't have any tasks assigned at the moment. Check back later or contact your supervisor.</p>
            </div>
          </div>
        );

      default:
        return (
          <div className="dashboard-view fade-in">
            <div className="dashboard-header">
              <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')}</h2>
              <p>Manage your road repair activities</p>
            </div>
            
            <div className="empty-state">
              <div className="empty-state-icon">🚧</div>
              <h3>Under Construction</h3>
              <p>This section is currently being developed. Check back soon for updates!</p>
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading">
          <div className="loading-spinner"></div>
          <div>Loading application...</div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        {/* Toast Notifications */}
        <div className="toast-container">
          {notifications.map(notification => (
            <div key={notification.id} className={`toast ${notification.type}`}>
              <span className="toast-icon">
                {notification.type === 'success' ? '✅' : 
                 notification.type === 'error' ? '❌' : 
                 notification.type === 'warning' ? '⚠️' : 'ℹ️'}
              </span>
              <span>{notification.message}</span>
            </div>
          ))}
        </div>

        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
              <Navigate to="/dashboard" /> : 
              <Login onLogin={handleLogin} />
            } 
          />
          
          <Route 
            path="/register" 
            element={
              isAuthenticated ? 
              <Navigate to="/dashboard" /> : 
              <Register onLogin={handleRegister} />
            } 
          />
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <>
                  <Header user={user} onLogout={handleLogout} />
                  <div className="dashboard-container">
                    <Sidebar user={user} activeTab={activeTab} onTabChange={setActiveTab} />
                    <div className="main-content">
                      {renderDashboardContent()}
                    </div>
                  </div>
                </>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/" 
            element={
              <Navigate to={isAuthenticated ? "/dashboard" : "/login"} />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;