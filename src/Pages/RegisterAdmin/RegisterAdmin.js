import React, { useState } from 'react';
import '../Login/login.css'; // reuse login styles

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
      localStorage.setItem('adminId', data.adminId); // Store admin ID
      setMessage('Admin registered successfully');
      setUsername('');
      setPassword('');
      window.location.href = '/reg'; // Redirect to employee registration
    } else {
      setMessage(data.message || 'Registration failed');
    }
  } catch (err) {
    console.error(err);
    setMessage('Server error');
  }
};

  return (
    <div className="login-container">
      <div className="login-header">
        <h1>Admin Registration</h1>
        <p>Create a new admin account</p>
      </div>
      {message && <div className="error-message">{message}</div>}
      <form className="login-form" onSubmit={handleRegister}>
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
        <button type="submit" className="login-button">Register Admin</button>
      </form>
    </div>
  );
}
