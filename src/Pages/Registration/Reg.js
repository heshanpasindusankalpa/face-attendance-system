import React, { useState } from 'react';
import './reg.css';

export default function Reg() {
  const [showCamera, setShowCamera] = useState(false);

  const handleCaptureClick = () => {
    setShowCamera(true);
  };

  return (
    <div className="container">
      <h1>Employee Registration</h1>
      <div className="registration-form">
        <div className="face-capture">
          <h2>Face Capture</h2>
          <div className="capture-box">
            {showCamera ? (
              <img src="http://localhost:5000/video_feed" alt="Live Camera" style={{ width: '100%', height: '100%' }} />
            ) : (
              <div className="camera-icon" onClick={handleCaptureClick}></div>
            )}
          </div>
          <button className="capture-button" onClick={handleCaptureClick}>Capture Photo</button>
          <div className="guidelines">
            <p>Guidelines for best results:</p>
            <ul>
              <li>Ensure good lighting</li>
              <li>Look directly at the camera</li>
              <li>Remove glasses or face coverings</li>
              <li>Maintain neutral expression</li>
            </ul>
          </div>
        </div>
        <div className="employee-details">
          <h2>Employee Details</h2>
          <form>
            <label>Employee ID</label>
            <input type="text" placeholder="Enter employee ID" />
            <label>Full Name</label>
            <input type="text" placeholder="Enter full name" />
            <label>Department</label>
            <input type="text" placeholder="Enter department" />
            <label>Position</label>
            <input type="text" placeholder="Enter position" />
            <label>Email</label>
            <input type="email" placeholder="Enter email address" />
            <button type="submit" className="register-button">Register Employee</button>
          </form>
          <div className="video-register">
            <img src="video_register_icon.png" alt="Video Register" />
          </div>
        </div>
      </div>
    </div>
  );
}
