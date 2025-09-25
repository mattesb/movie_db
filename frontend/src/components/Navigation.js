import React from 'react';
import { useAuth } from './AuthContext';

function Navigation({ currentView, onViewChange }) {
  const { isAdmin } = useAuth();

  const allMenuItems = [
    { id: 'collection', label: '🎬 My Collection', icon: '🎬', roles: ['user', 'admin'] },
    { id: 'search', label: '🔍 Add Movies', icon: '🔍', roles: ['admin'] },
    { id: 'statistics', label: '📊 Statistics', icon: '📊', roles: ['user', 'admin'] },
    { id: 'filters', label: '🎛️ Filters', icon: '🎛️', roles: ['user', 'admin'] }
  ];

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter(item =>
    item.roles.includes(isAdmin() ? 'admin' : 'user')
  );

  return (
    <nav style={{
      background: '#2a2a2a',
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '30px',
      border: '1px solid #3a3a3a',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`btn ${currentView === item.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              fontSize: '1rem',
              fontWeight: '600',
              minWidth: '140px',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              transform: currentView === item.id ? 'translateY(-2px)' : 'none',
              boxShadow: currentView === item.id 
                ? '0 8px 20px rgba(102, 126, 234, 0.4)' 
                : 'none'
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
            <span>{item.label.split(' ').slice(1).join(' ')}</span>
          </button>
        ))}
      </div>
      
      <div style={{
        textAlign: 'center',
        marginTop: '15px',
        fontSize: '0.9rem',
        opacity: 0.7
      }}>
        <strong>Navigation:</strong> {isAdmin() ? 'Admin access - Full movie management' : 'User access - View only'}
      </div>
    </nav>
  );
}

export default Navigation;