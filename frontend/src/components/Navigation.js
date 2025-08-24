import React from 'react';

function Navigation({ currentView, onViewChange }) {
  const menuItems = [
    { id: 'collection', label: '🎬 My Collection', icon: '🎬' },
    { id: 'search', label: '🔍 Add Movies', icon: '🔍' },
    { id: 'statistics', label: '📊 Statistics', icon: '📊' },
    { id: 'filters', label: '🎛️ Filters', icon: '🎛️' }
  ];

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
        <strong>Navigation:</strong> Use the menu above to switch between different sections
      </div>
    </nav>
  );
}

export default Navigation;