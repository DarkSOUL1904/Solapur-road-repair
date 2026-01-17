import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Report Complaint Component
function ReportComplaint() {
  const [formData, setFormData] = useState({
    location: '',
    latitude: 0,
    longitude: 0,
    description: '',
    priority: 'Medium'
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [locationStatus, setLocationStatus] = useState('Click "Get Location" button');
  const [loading, setLoading] = useState(false);
  const fileInputRef = React.useRef(null);
  const navigate = useNavigate();

  // Get current location with reverse geocoding
  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation not supported');
      return;
    }

    setLocationStatus('Getting location...');
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Get address from coordinates
          const response = await axios.get(`http://localhost:5000/api/geocode?lat=${latitude}&lng=${longitude}`);
          
          setFormData(prev => ({
            ...prev,
            location: response.data.address,
            latitude: response.data.lat,
            longitude: response.data.lng
          }));
          
          setLocationStatus('✓ Location captured successfully!');
        } catch (error) {
          // Fallback if geocoding fails
          setFormData(prev => ({
            ...prev,
            location: `Lat: ${latitude.toFixed(4)}, Long: ${longitude.toFixed(4)}`,
            latitude,
            longitude
          }));
          setLocationStatus('✓ Coordinates captured');
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLocationStatus('Failed to get location. Please enter manually.');
        setFormData(prev => ({
          ...prev,
          location: 'Solapur, Maharashtra',
          latitude: 17.6599,
          longitude: 75.9064
        }));
      }
    );
  };

  const handlePhotoSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File too large (max 5MB)');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setPhoto(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!photo) {
      alert('Please upload a photo of the damage');
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const formDataObj = new FormData();
      formDataObj.append('photo', photo);
      formDataObj.append('location', formData.location);
      formDataObj.append('latitude', formData.latitude);
      formDataObj.append('longitude', formData.longitude);
      formDataObj.append('description', formData.description);
      formDataObj.append('priority', formData.priority);

      await axios.post('http://localhost:5000/api/complaints', formDataObj, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('✅ Complaint submitted successfully!');
      navigate('/citizen');
      
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to submit complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-view">
      <div className="dashboard-header">
        <h2>📝 Report New Road Damage</h2>
        <p>Take photo and location will be automatically captured</p>
      </div>

      <form onSubmit={handleSubmit} className="complaint-form">
        <div className="form-group">
          <label>📍 Location</label>
          <div className="location-section">
            <div className="location-input">
              <input 
                type="text" 
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="Address will auto-fill"
                required
              />
              <button 
                type="button" 
                onClick={getCurrentLocation}
                className="location-btn"
              >
                📍 Get Current Location
              </button>
            </div>
            <p className="location-status">{locationStatus}</p>
          </div>
        </div>

        <div className="form-group">
          <label>📸 Photo Evidence (Required)</label>
          <div className="photo-upload-section">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoSelect}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <button 
              type="button" 
              onClick={() => fileInputRef.current.click()}
              className="photo-upload-btn"
            >
              📁 Upload Photo
            </button>
            
            {photoPreview && (
              <div className="photo-preview">
                <img src={photoPreview} alt="Preview" />
                <button 
                  type="button" 
                  onClick={() => {
                    setPhotoPreview(null);
                    setPhoto(null);
                  }}
                  className="remove-photo-btn"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
          <p className="hint">Upload clear photo of the damage (max 5MB)</p>
        </div>

        <div className="form-group">
          <label>📝 Damage Description</label>
          <textarea 
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Describe the pothole, crack, or damage in detail..."
            rows="4"
            required
          />
        </div>

        <div className="form-group">
          <label>⚠️ Priority Level</label>
          <select 
            value={formData.priority}
            onChange={(e) => setFormData({...formData, priority: e.target.value})}
          >
            <option value="Low">Low - Minor damage</option>
            <option value="Medium">Medium - Moderate damage</option>
            <option value="High">High - Major hazard, needs immediate attention</option>
          </select>
        </div>

        <div className="form-actions">
          <Link to="/citizen" className="cancel-btn">Cancel</Link>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </div>
      </form>
    </div>
  );
}

// My Complaints Component
function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
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
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard-view">
      <div className="dashboard-header">
        <h2>📋 My Reported Complaints</h2>
        <p>Track the status of your reported issues</p>
      </div>

      <div className="complaints-list">
        {complaints.length === 0 ? (
          <div className="empty-state">
            <p>No complaints reported yet.</p>
            <Link to="/citizen/report" className="primary-btn">Report Your First Issue</Link>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Photo</th>
                <th>Location</th>
                <th>Description</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Date</th>
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
                  <td>{complaint.location}</td>
                  <td>{complaint.description}</td>
                  <td>
                    <span className={`status-badge ${complaint.status.toLowerCase()}`}>
                      {complaint.status}
                    </span>
                  </td>
                  <td>
                    <span className={`priority-badge ${complaint.priority.toLowerCase()}`}>
                      {complaint.priority}
                    </span>
                  </td>
                  <td>{complaint.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// Main Citizen Dashboard
function CitizenDashboard() {
  const [view, setView] = useState('dashboard');
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

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

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="user-profile">
          <div className="avatar">👤</div>
          <h3>Citizen Dashboard</h3>
          <p>Report and track road issues</p>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={view === 'dashboard' ? 'active' : ''} 
            onClick={() => setView('dashboard')}
          >
            🏠 Dashboard
          </button>
          <button 
            className={view === 'report' ? 'active' : ''} 
            onClick={() => setView('report')}
          >
            📝 Report Issue
          </button>
          <button 
            className={view === 'complaints' ? 'active' : ''} 
            onClick={() => setView('complaints')}
          >
            📋 My Complaints
          </button>
        </nav>
      </div>

      <div className="main-content">
        {view === 'dashboard' && (
          <div className="dashboard-view">
            <div className="dashboard-header">
              <h2>👤 Citizen Dashboard</h2>
              <p>Welcome to Solapur Road Repair System</p>
            </div>

            <div className="stats-cards">
              <div className="stat-card">
                <h3>📊 My Statistics</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <h4>Total Reports</h4>
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
                </div>
              </div>

              <div className="quick-actions">
                <h3>🚀 Quick Actions</h3>
                <div className="action-buttons">
                  <button onClick={() => setView('report')} className="action-btn primary">
                    📝 Report New Issue
                  </button>
                  <button onClick={() => setView('complaints')} className="action-btn secondary">
                    📋 View My Reports
                  </button>
                </div>
              </div>
            </div>

            <div className="recent-activity">
              <h3>📢 How to Report</h3>
              <div className="steps">
                <div className="step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>Get Location</h4>
                    <p>Click "Get Current Location" button when reporting</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>Take Photo</h4>
                    <p>Upload clear photo of the road damage</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>Track Status</h4>
                    <p>Check "My Complaints" to see repair progress</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'report' && <ReportComplaint />}
        {view === 'complaints' && <MyComplaints />}
      </div>
    </div>
  );
}

export default CitizenDashboard;