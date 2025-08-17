import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';

export default function Attendance() {
  const [message, setMessage] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [processedImage, setProcessedImage] = useState(null);
  const webcamRef = useRef(null);
  const adminId = localStorage.getItem('adminId');

  const captureAndRecognize = async () => {
    if (!adminId) {
      setMessage('Please login as admin first');
      return;
    }

    if (!webcamRef.current) {
      setMessage('Camera not ready');
      return;
    }

    setIsScanning(true);
    setMessage('');
    setProcessedImage(null);

    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        throw new Error('Failed to capture image');
      }
      console.log('Screenshot length:', imageSrc.length); // should be thousands of chars
      console.log('Screenshot prefix:', imageSrc.slice(0, 30)); // should start with "data:image/jpeg;base64,"

      const response = await fetch('http://localhost:5000/recognize_face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageSrc,
          adminId: adminId
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`Attendance marked for ${data.employee?.name || 'Unknown'}`);
      } else {
        setMessage(data.message);
      }

      if (data.processed_image) {
        setProcessedImage(data.processed_image);
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="container">
      <h1>Face Recognition Attendance</h1>

      {message && (
        <div className={message.includes('Error') ? 'error' : 'success'}>
          {message}
        </div>
      )}
      

      <div className="camera-container">
        {/* Webcam always mounted but hidden if processedImage is shown */}
        <div style={{ display: processedImage ? 'none' : 'block' }}>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={640}
            height={480}
            videoConstraints={{ width: 640, height: 480, facingMode: 'user' }}
          />
        </div>

        {processedImage && (
          <img
            src={processedImage}
            alt="Processed Result"
            style={{ width: '640px', height: '480px' }}
          />
        )}

        <button
          onClick={captureAndRecognize}
          disabled={isScanning}
          className="scan-button"
        >
          {isScanning ? 'Processing...' : 'Scan Face'}
        </button>

        {processedImage && (
          <button
            onClick={() => setProcessedImage(null)}
            className="reset-button"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
