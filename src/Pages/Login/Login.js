import React, { useState } from 'react';
import './login.css';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Username and password are required');
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (res.ok && data.success && data.adminId) {
        localStorage.setItem('adminId', data.adminId);
        navigate('/reg'); // Navigate to employee registration after login
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'An error occurred during login');
    }
  };

  const handleAdminRegister = () => {
    navigate('/admin-register');
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <h1>Admin Login</h1>
        <p>Sign in to manage employee attendance</p>
      </div>
      {error && <div className="error-message">{error}</div>}
      <form className="login-form" onSubmit={handleSubmit}>
        <label htmlFor="username">Username</label>
        <input 
          type="text" 
          id="username" 
          value={username} 
          onChange={e => setUsername(e.target.value)} 
          required 
        />
        <label htmlFor="password">Password</label>
        <input 
          type="password" 
          id="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required 
        />
        <button type="submit" className="login-button">Login</button>
      </form>

      <div className="admin-register-link">
        <p>Not an admin yet?</p>
        <button onClick={handleAdminRegister} className="login-button">Register as Admin</button>
      </div>
    </div>
  );
}
