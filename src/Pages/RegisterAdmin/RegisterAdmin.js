import React, { useState } from 'react';
import './registerAdmin.css'; 
export default function RegisterAdmin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await fetch('http://localhost:3001/api/register-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (data.success && data.adminId) {
        localStorage.setItem('adminId', data.adminId);
        setMessage('✅ Admin registered successfully!');
        setUsername('');
        setPassword('');
        setTimeout(() => {
          window.location.href = '/reg';
        }, 1000);
      } else {
        setMessage(data.message || 'Registration failed ❌');
      }
    } catch (err) {
      console.error(err);
      setMessage('Server error 😓');
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h1 className="register-title">Admin Registration</h1>
        <p className="register-subtitle">Create a new admin account</p>

        {message && <div className="register-message">{message}</div>}

        <form className="register-form" onSubmit={handleRegister}>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            placeholder="Enter username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Enter password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="register-button">Register Admin</button>
        </form>
      </div>
    </div>
  );
}
