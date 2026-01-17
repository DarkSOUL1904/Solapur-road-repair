import React, { useState, useEffect } from 'react';
import axios from 'axios';

function WorkerDashboard() {
  const [view, setView] = useState('assigned');
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({ assigned: 0, resolved: 0, pending: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComplaints();
    fetchStats();
  }, []);

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

  const filteredComplaints = complaints.filter(complaint => {
    if (view === 'assigned') return complaint.status === 'Assigned' || complaint.assignedTo;
    if (view === 'pending') return complaint.status === 'Pending';
    if (view === 'resolved') return complaint.status === 'Resolved';
    return true;
  });

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="user-profile">
          <div className="avatar">👷</div>
          <h3>Worker Dashboard</h3>
          <p>Fix and update road issues</p>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={view === 'assigned' ? 'active' : ''} 
            onClick={() => setView('assigned')}
          >
            📋 Assigned to Me
          </button>
          <button 
            className={view === 'pending' ? 'active' : ''} 
            onClick={() => setView('pending')}
          >
            ⏳ Pending Issues
          </button>
          <button 
            className={view === 'resolved' ? 'active' : ''} 
            onClick={() => setView('resolved')}
          >
            ✅ Resolved Issues
          </button>
        </nav>
      </div>

      <div className="main-content">
        <div className="dashboard-view">
          <div className="dashboard-header">
            <h2>👷 Worker Dashboard</h2>
            <p>Manage assigned road repair tasks</p>
          </div>

          <div className="stats-cards">
            <div className="stat-card">
              <h3>📊 Work Statistics</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <h4>Assigned to Me</h4>
                  <p className="stat-number">{stats.myAssigned || 0}</p>
                </div>
                <div className="stat-item">
                  <h4>Pending</h4>
                  <p className="stat-number pending">{stats.pending}</p>
                </div>
                <div className="stat-item">
                  <h4>Resolved</h4>
                  <p className="stat-number resolved">{stats.resolved}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="complaints-table">
            <h3>{view === 'assigned' ? '📋 Assigned Tasks' : view === 'pending' ? '⏳ Pending Issues' : '✅ Resolved Issues'}</h3>
            
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Photo</th>
                  <th>Location</th>
                  <th>Description</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map((complaint) => (
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
                    <td>
                      {complaint.status !== 'Resolved' && (
                        <select 
                          value={complaint.status}
                          onChange={(e) => updateComplaintStatus(complaint.id, e.target.value)}
                          className="status-select"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Assigned">Assigned</option>
                          <option value="Resolved">Mark as Resolved</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredComplaints.length === 0 && (
              <div className="empty-state">
                <p>No {view} complaints found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkerDashboard;