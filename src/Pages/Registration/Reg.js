import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import './reg.css';

export default function Reg() {
  const navigate = useNavigate();

  const [showCamera, setShowCamera] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emp, setEmp] = useState({
    employeeId: '',
    fullName: '',
    department: '',
    position: '',
    email: '',
    faceEncodings: []
  });
  const [capturedImages, setCapturedImages] = useState([]);
  const [error, setError] = useState(null);

  const handleOpenCamera = () => {
    if (!emp.employeeId || !emp.fullName) {
      setError('Please fill Employee ID and Full Name first');
      return;
    }
    setError(null);
    setShowCamera(true);
  };

  const handleCapture = async () => {
    if (!emp.employeeId) {
      setError('Employee ID is required before capturing');
      return;
    }

    setIsCapturing(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:5000/capture_faces_local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: emp.employeeId })
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      
      if (data.success) {
        setEmp(prev => ({ 
          ...prev, 
          faceEncodings: [...prev.faceEncodings, ...data.encodings] 
        }));
        setCapturedImages(prev => [...prev, ...data.images]);
      } else {
        throw new Error(data.message || 'Failed to capture photos');
      }
    } catch (err) {
      setError(err.message);
      console.error('Capture error:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const adminId = localStorage.getItem('adminId');

    if (!adminId) {
      setError('No adminId found — please log in again');
      return;
    }

    if (emp.faceEncodings.length === 0) {
      setError('Please capture face photos before submitting');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:3001/api/register-employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId,
          employee: emp
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Error registering employee');
      }

      // Reset form on success
      setEmp({ 
        employeeId: '', 
        fullName: '', 
        department: '', 
        position: '', 
        email: '',
        faceEncodings: [] 
      });
      setCapturedImages([]);
      setShowCamera(false);
      setError(null);
      alert('Registration successful!');
      
    } catch (err) {
      setError(err.message);
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <h1>Employee Registration</h1>
      {error && <div className="error-message">{error}</div>}
      
      <div className="registration-form">
        {/* Face Capture Section */}
        <div className="face-capture">
          <h2>Face Capture</h2>
          <div className="capture-box">
            {showCamera ? (
              <>
                <img
                  src="http://localhost:5000/video_feed"
                  alt="Live Camera"
                  style={{ width: '100%', height: '100%' }}
                />
                <div className="captured-preview">
                  {capturedImages.map((img, i) => (
                    <img 
                      key={i} 
                      src={`data:image/jpeg;base64,${img}`} 
                      alt={`Capture ${i+1}`}
                      style={{ width: '80px', height: '80px', margin: '5px' }}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="camera-icon" onClick={handleOpenCamera}>
                <span>Click to open camera</span>
              </div>
            )}
          </div>
          {showCamera && (
            <button
              className="capture-button"
              onClick={handleCapture}
              disabled={isCapturing}
            >
              {isCapturing ? 'Capturing...' : 'Capture Photos'}
            </button>
          )}
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
          </form>
        </div>
      </div>
      <div className="footer">
        <button 
          className="submit-button" 
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
        <button className="attendance-button" onClick={() => navigate('/attendance')}>
          Mark Attendance
        </button>

      </div>
    </div>
  );
}