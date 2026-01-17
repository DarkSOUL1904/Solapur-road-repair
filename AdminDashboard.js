import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminDashboard() {
  const [view, setView] = useState('dashboard');
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, users: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (view === 'dashboard' || view === 'complaints') fetchComplaints();
    if (view === 'users') fetchUsers();
    if (view === 'assign') fetchWorkers();
    fetchStats();
  }, [view]);

  const fetchComplaints = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('http://localhost:5000/api/complaints', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setComplaints(response.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    }
  };

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('http://localhost:5000/api/workers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchWorkers = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('http://localhost:5000/api/workers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setWorkers(response.data);
    } catch (error) {
      console.error('Error fetching workers:', error);
    }
  };

  const fetchStats = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('http://localhost:5000/api/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateComplaintStatus = async (id, status) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`http://localhost:5000/api/complaints/${id}`, 
        { status },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      fetchComplaints();
      fetchStats();
      alert('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const assignToWorker = async (complaintId, workerId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(`http://localhost:5000/api/complaints/${complaintId}/assign`, 
        { workerId },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      fetchComplaints();
      alert('Complaint assigned successfully');
    } catch (error) {
      console.error('Error assigning complaint:', error);
      alert('Failed to assign complaint');
    }
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="user-profile">
          <div className="avatar">👨‍💼</div>
          <h3>Admin Dashboard</h3>
          <p>Manage complete system</p>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={view === 'dashboard' ? 'active' : ''} 
            onClick={() => setView('dashboard')}
          >
            📊 Overview
          </button>
          <button 
            className={view === 'complaints' ? 'active' : ''} 
            onClick={() => setView('complaints')}
          >
            🚧 All Complaints
          </button>
          <button 
            className={view === 'assign' ? 'active' : ''} 
            onClick={() => setView('assign')}
          >
            👷 Assign Tasks
          </button>
          <button 
            className={view === 'users' ? 'active' : ''} 
            onClick={() => setView('users')}
          >
            👥 Manage Users
          </button>
        </nav>
      </div>

      <div className="main-content">
        {view === 'dashboard' && (
          <div className="dashboard-view">
            <div className="dashboard-header">
              <h2>👨‍💼 Admin Dashboard</h2>
              <p>Complete system overview and management</p>
            </div>

            <div className="stats-cards">
              <div className="stat-card large">
                <h3>📊 System Overview</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <h4>Total Complaints</h4>
                    <p className="stat-number">{stats.total}</p>
                  </div>
                  <div className="stat-item">
                    <h4>Pending</h4>
                    <p className="stat-number pending">{stats.pending}</p>
                  </div>
                  <div className="stat-item">
                    <h4>Resolved</h4>
                    <p className="stat-number resolved">{stats.resolved}</p>
                  </div>
                  <div className="stat-item">
                    <h4>With Photos</h4>
                    <p className="stat-number photo">{stats.withPhotos}</p>
                  </div>
                  <div className="stat-item">
                    <h4>High Priority</h4>
                    <p className="stat-number high">{stats.highPriority}</p>
                  </div>
                  <div className="stat-item">
                    <h4>Assigned</h4>
                    <p className="stat-number assigned">{stats.assigned}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="quick-actions">
              <h3>⚡ Quick Actions</h3>
              <div className="action-buttons">
                <button onClick={() => setView('complaints')} className="action-btn">
                  🚧 View All Complaints
                </button>
                <button onClick={() => setView('assign')} className="action-btn">
                  👷 Assign to Workers
                </button>
                <button onClick={() => setView('users')} className="action-btn">
                  👥 Manage Users
                </button>
              </div>
            </div>
          </div>
        )}

        {view === 'complaints' && (
          <div className="dashboard-view">
            <div className="dashboard-header">
              <h2>🚧 All Complaints</h2>
              <p>Manage and monitor all reported issues</p>
            </div>

            <div className="complaints-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Photo</th>
                    <th>Reporter</th>
                    <th>Location</th>
                    <th>Description</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Assigned To</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((complaint) => (
                    <tr key={complaint.id}>
                      <td>#{complaint.id}</td>
                      <td>
                        {complaint.photo ? (
                          <a 
                            href={`http://localhost:5000${complaint.photo}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="view-photo"
                          >
                            👁️ View
                          </a>
                        ) : 'No photo'}
                      </td>
                      <td>{complaint.name}</td>
                      <td>{complaint.location}</td>
                      <td>{complaint.description}</td>
                      <td>
                        <span className={`priority-badge ${complaint.priority.toLowerCase()}`}>
                          {complaint.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${complaint.status.toLowerCase()}`}>
                          {complaint.status}
                        </span>
                      </td>
                      <td>{complaint.assignedTo ? `Worker #${complaint.assignedTo}` : 'Not assigned'}</td>
                      <td>
                        <select 
                          value={complaint.status}
                          onChange={(e) => updateComplaintStatus(complaint.id, e.target.value)}
                          className="status-select"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Assigned">Assigned</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === 'assign' && (
          <div className="dashboard-view">
            <div className="dashboard-header">
              <h2>👷 Assign Complaints to Workers</h2>
              <p>Assign pending complaints to available workers</p>
            </div>

            <div className="assign-section">
              <div className="workers-list">
                <h3>Available Workers</h3>
                <div className="workers-grid">
                  {workers.map((worker) => (
                    <div key={worker.id} className="worker-card">
                      <div className="worker-avatar">👷</div>
                      <h4>{worker.name}</h4>
                      <p>{worker.email}</p>
                      <p>{worker.phone}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pending-complaints">
                <h3>Pending Complaints</h3>
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Location</th>
                      <th>Priority</th>
                      <th>Assign To</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints
                      .filter(c => c.status === 'Pending')
                      .map((complaint) => (
                        <tr key={complaint.id}>
                          <td>#{complaint.id}</td>
                          <td>{complaint.location}</td>
                          <td>
                            <span className={`priority-badge ${complaint.priority.toLowerCase()}`}>
                              {complaint.priority}
                            </span>
                          </td>
                          <td>
                            <select 
                              onChange={(e) => assignToWorker(complaint.id, e.target.value)}
                              className="assign-select"
                            >
                              <option value="">Select Worker</option>
                              {workers.map((worker) => (
                                <option key={worker.id} value={worker.id}>
                                  {worker.name}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {view === 'users' && (
          <div className="dashboard-view">
            <div className="dashboard-header">
              <h2>👥 System Users</h2>
              <p>Manage all registered users</p>
            </div>

            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Address</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>#{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.phone}</td>
                      <td>
                        <span className={`role-badge ${user.role}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>{user.address}</td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;