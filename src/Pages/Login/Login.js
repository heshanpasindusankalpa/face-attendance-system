import React from 'react';
import './login.css';
import LoginImage from '../../Images/LoginImage.png';

export default function Login() {
  return (
    <div className="login-container">
      <div className="login-top-image">
        <img src={LoginImage} alt="LoginImage" className='loginLogo' />
      </div>

      <div className="login-header">
        <img src="face-recognition-icon.png" alt="Facial Recognition" className="login-icon" />
        <h1>Admin Login</h1>
        <p>Sign in to manage employee attendance</p>
      </div>

      <form className="login-form">
        <label htmlFor="username">Username</label>
        <input type="text" id="username" name="username" placeholder="Enter your username" required />

        <label htmlFor="password">Password</label>
        <input type="password" id="password" name="password" placeholder="Enter your password" required />

        <button type="submit" className="login-button">Login</button>
      </form>

      <div className="security-note">
        <p>Make sure your password is secure and follows best practices.</p>
      </div>
    </div>
  );
}
