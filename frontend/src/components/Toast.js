import React, { useState, useEffect } from 'react';

function Toast({ message, type = 'info', duration = 4000, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastStyle = () => {
    const baseStyle = {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '16px 20px',
      borderRadius: '12px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      color: 'white',
      fontSize: '0.9rem',
      fontWeight: '500',
      zIndex: 1000,
      transition: 'all 0.3s ease',
      transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
      opacity: isVisible ? 1 : 0,
      minWidth: '300px',
      maxWidth: '400px'
    };

    const typeStyles = {
      success: { background: '#10B981' },
      error: { background: '#EF4444' },
      warning: { background: '#F59E0B' },
      info: { background: '#3B82F6' }
    };

    return { ...baseStyle, ...typeStyles[type] };
  };

  const getIcon = () => {
    const icons = {
      success: '✓',
      error: '✗',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type];
  };

  return (
    <div style={getToastStyle()}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '1.1rem' }}>{getIcon()}</span>
        <span>{message}</span>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            marginLeft: 'auto',
            cursor: 'pointer',
            fontSize: '1.2rem',
            opacity: 0.7,
            padding: '0 4px'
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}

export default Toast;