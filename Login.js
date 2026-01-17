import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem('savedEmail');
    const savedRemember = localStorage.getItem('rememberMe') === 'true';
    
    if (savedEmail && savedRemember) {
      setFormData(prev => ({
        ...prev,
        email: savedEmail,
        rememberMe: savedRemember
      }));
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: formData.email,
        password: formData.password
      });
      
      if (response.data.success) {
        if (formData.rememberMe) {
          localStorage.setItem('savedEmail', formData.email);
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('savedEmail');
          localStorage.removeItem('rememberMe');
        }
        
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        onLogin(response.data.token, response.data.user.role);
        
        setTimeout(() => {
          if (response.data.user.role === 'admin') {
            navigate('/admin/dashboard');
          } else if (response.data.user.role === 'worker') {
            navigate('/worker/dashboard');
          } else {
            navigate('/dashboard');
          }
        }, 500);
      }
    } catch (err) {
      console.error('Login error:', err);
      
      if (err.response) {
        if (err.response.status === 401) {
          setError('Invalid email or password. Please try again.');
        } else if (err.response.status === 429) {
          setError('Too many login attempts. Please try again later.');
        } else if (err.response.status === 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(err.response.data?.error || 'Login failed. Please try again.');
        }
      } else if (err.request) {
        setError('Network error. Please check your internet connection.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (role) => {
    const credentials = {
      admin: { 
        email: 'admin@solapur.gov', 
        password: 'admin123',
        role: 'Administrator'
      },
      worker: { 
        email: 'worker@solapur.gov', 
        password: 'worker123',
        role: 'Road Worker'
      },
      citizen: { 
        email: 'citizen@example.com', 
        password: 'citizen123',
        role: 'Citizen'
      }
    };
    
    setFormData({
      ...formData,
      email: credentials[role].email,
      password: credentials[role].password
    });
    
    setError('');
    setErrors({});
    setError(`Demo credentials loaded for ${credentials[role].role}. Click Login to continue.`);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit(e);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">
            🛣️
          </div>
          <h2>Solapur Road Repair System</h2>
          <p>Sign in to manage road maintenance and repairs</p>
        </div>

        <div className="demo-credentials">
          <h4>
            <span>🚀</span>
            Quick Demo Access
          </h4>
          <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
            Test different user roles with one click
          </p>
          <div className="demo-buttons">
            <button 
              type="button" 
              onClick={() => fillDemoCredentials('admin')} 
              className="demo-btn admin"
              title="Administrator - Full system access"
            >
              <span>👑</span>
              Admin
            </button>
            <button 
              type="button" 
              onClick={() => fillDemoCredentials('worker')} 
              className="demo-btn worker"
              title="Road Worker - Task management"
            >
              <span>🚧</span>
              Worker
            </button>
            <button 
              type="button" 
              onClick={() => fillDemoCredentials('citizen')} 
              className="demo-btn citizen"
              title="Citizen - Report issues"
            >
              <span>👤</span>
              Citizen
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && !error.includes('Demo credentials') && (
            <div className="error-message">
              <span>⚠️</span>
              {error}
            </div>
          )}
          
          {error && error.includes('Demo credentials') && (
            <div className="success-message">
              <span>✅</span>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">
              <span>📧</span>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              placeholder="Enter your email address"
              className={errors.email ? 'error' : ''}
              required
              autoComplete="email"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <span>🔒</span>
              Password
            </label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                placeholder="Enter your password"
                className={errors.password ? 'error' : ''}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-row">
            <div className="remember-me">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <label htmlFor="rememberMe">
                Remember me
              </label>
            </div>
            <Link to="/forgot-password" className="forgot-password">
              Forgot password?
            </Link>
          </div>

          <button 
            type="submit" 
            className="auth-btn" 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Signing in...
              </>
            ) : (
              <>
                <span>→</span>
                Sign In to Dashboard
              </>
            )}
          </button>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register">Create an account</Link>
            </p>
            
            <div className="role-info-box">
              <h5>
                <span>📋</span>
                Role Information
              </h5>
              <ul className="role-list">
                <li>
                  <strong>Citizen:</strong> Report road issues, track repair status
                </li>
                <li>
                  <strong>Road Worker:</strong> View assigned tasks, update progress
                </li>
                <li>
                  <strong>Administrator:</strong> Manage users, assign tasks, generate reports
                </li>
              </ul>
            </div>
            
            <div style={{ 
              marginTop: '1.5rem', 
              fontSize: '0.85rem', 
              color: '#95a5a6',
              textAlign: 'center'
            }}>
              <p>For assistance: support@solapurroads.gov.in</p>
              <p>Emergency hotline: ☎️ 1800-ROAD-HELP</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;