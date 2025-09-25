import React, { useState } from 'react';
import { useAuth } from './AuthContext';

const LoginForm = ({ onToggleForm, onSuccess }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.username, formData.password);

    if (result.success) {
      if (onSuccess) onSuccess(result.user);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="auth-form">
      <h2>Login to Movie Database</h2>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <button type="submit" disabled={loading} className="auth-button">
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p className="auth-toggle">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onToggleForm}
          className="link-button"
          disabled={loading}
        >
          Sign up here
        </button>
      </p>

      <div className="demo-accounts">
        <h3>Demo Accounts</h3>
        <p><strong>Admin:</strong> admin / admin</p>
        <p><strong>User:</strong> user / user</p>
      </div>
    </div>
  );
};

export default LoginForm;