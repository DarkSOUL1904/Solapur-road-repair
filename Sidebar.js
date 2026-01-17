import React from 'react';

function Sidebar({ user, activeTab, onTabChange }) {
  const tabs = {
    admin: [
      { id: 'dashboard', label: 'Dashboard', icon: '📊' },
      { id: 'issues', label: 'All Issues', icon: '📋' },
      { id: 'workers', label: 'Workers', icon: '👷' },
      { id: 'citizens', label: 'Citizens', icon: '👤' },
      { id: 'reports', label: 'Reports', icon: '📈' },
      { id: 'settings', label: 'Settings', icon: '⚙️' }
    ],
    worker: [
      { id: 'dashboard', label: 'Dashboard', icon: '📊' },
      { id: 'tasks', label: 'My Tasks', icon: '✅' },
      { id: 'progress', label: 'Progress', icon: '📈' },
      { id: 'reports', label: 'Reports', icon: '📋' }
    ],
    citizen: [
      { id: 'dashboard', label: 'Dashboard', icon: '📊' },
      { id: 'report', label: 'Report Issue', icon: '➕' },
      { id: 'my-issues', label: 'My Reports', icon: '📋' },
      { id: 'track', label: 'Track Status', icon: '📍' }
    ]
  };

  const userTabs = tabs[user?.role] || tabs.citizen;

  return (
    <aside className="sidebar">
      <div className="user-profile">
        <div className="user-avatar">
          {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
        </div>
        <h3>{user?.name || 'User'}</h3>
        <p>{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Citizen'}</p>
      </div>
      
      <nav className="sidebar-nav">
        {userTabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className="nav-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;