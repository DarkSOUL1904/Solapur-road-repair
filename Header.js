import React from 'react';
import { Link } from 'react-router-dom';

function Header({ user, onLogout }) {
  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <div className="logo-icon">🛣️</div>
          <div className="logo-text">
            <h1>Solapur Road Repair</h1>
            <span>Smart Infrastructure Management</span>
          </div>
        </Link>
        
        {user && (
          <div className="user-info">
            <div className="user-details">
              <div className="avatar">
                {user.name?.charAt(0) || user.role?.charAt(0) || 'U'}
              </div>
              <div className="user-text">
                <div className="user-name">{user.name || user.email}</div>
                <div className="user-role">{user.role?.toUpperCase()}</div>
              </div>
            </div>
            <button onClick={onLogout} className="logout-btn">
              <span>🚪</span>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;