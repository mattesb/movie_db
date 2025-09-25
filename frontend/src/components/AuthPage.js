import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const AuthPage = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  const handleAuthSuccess = (user) => {
    if (onAuthSuccess) {
      onAuthSuccess(user);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>🎬 Movie Database</h1>
          <p>Discover, search, and manage your favorite movies</p>
        </div>

        {isLogin ? (
          <LoginForm
            onToggleForm={toggleForm}
            onSuccess={handleAuthSuccess}
          />
        ) : (
          <RegisterForm
            onToggleForm={toggleForm}
            onSuccess={handleAuthSuccess}
          />
        )}

        <div className="auth-info">
          <h3>Access Levels</h3>
          <div className="access-level">
            <strong>👥 User Account:</strong>
            <ul>
              <li>View movie collection</li>
              <li>Browse statistics</li>
              <li>Use filters and search</li>
            </ul>
          </div>
          <div className="access-level">
            <strong>👑 Admin Account:</strong>
            <ul>
              <li>All user permissions</li>
              <li>Add new movies</li>
              <li>Edit movie details</li>
              <li>Delete movies</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;