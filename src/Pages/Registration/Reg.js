import React, { useState } from 'react';
import './reg.css';

export default function Reg() {
  const [showCamera, setShowCamera] = useState(false);
  const [emp, setEmp] = useState({
    employeeId: '',
    fullName: '',
    department: '',
    position: '',
    email: ''
  });

  const handleOpenCamera = () => {
    setShowCamera(true);
  };

  const handleCapture = async () => {
    const name = prompt('Enter Employee Name');
    if (!name) return;

    try {
      const res = await fetch('http://localhost:5000/capture_faces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });

      const data = await res.json();
      alert(data.msg);
    } catch (err) {
      alert('Error capturing face: ' + err.message);
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  const adminId = localStorage.getItem('adminId'); // from login

  if (!adminId) {
    return alert('No adminId found — please log in again');
  }

  try {
    const res = await fetch('http://localhost:3001/api/register-employee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminId,
        employee: emp // wrap employee data in 'employee'
      })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return alert(data.message || 'Error registering employee');
    }

    alert('Registered successfully');
    setEmp({ employeeId: '', fullName: '', department: '', position: '', email: '' });

  } catch (err) {
    alert('Network error: ' + err.message);
  }
};

  return (
    <div className="container">
      <h1>Employee Registration</h1>
      <div className="registration-form">
        {/* Face Capture Section */}
        <div className="face-capture">
          <h2>Face Capture</h2>
          <div className="capture-box">
            {showCamera ? (
              <img
                src="http://localhost:5000/video_feed"
                alt="Live Camera"
                style={{ width: '100%', height: '100%' }}
              />
            ) : (
              <div className="camera-icon" onClick={handleOpenCamera}></div>
            )}
          </div>
          <button className="capture-button" onClick={handleOpenCamera}>Open Camera</button>
          <button className="capture-button" onClick={handleCapture}>Capture Photos</button>
        </div>

        {/* Employee Details Form */}
        <div className="employee-details">
          <h2>Employee Details</h2>
          <form onSubmit={handleSubmit}>
            <label>Employee ID</label>
            <input
              value={emp.employeeId}
              onChange={e => setEmp({ ...emp, employeeId: e.target.value })}
              required
            />
            <label>Full Name</label>
            <input
              value={emp.fullName}
              onChange={e => setEmp({ ...emp, fullName: e.target.value })}
              required
            />
            <label>Department</label>
            <input
              value={emp.department}
              onChange={e => setEmp({ ...emp, department: e.target.value })}
              required
            />
            <label>Position</label>
            <input
              value={emp.position}
              onChange={e => setEmp({ ...emp, position: e.target.value })}
              required
            />
            <label>Email</label>
            <input
              type="email"
              value={emp.email}
              onChange={e => setEmp({ ...emp, email: e.target.value })}
              required
            />
            <button type="submit">Register</button>
          </form>
        </div>
      </div>
    </div>
  );
}
