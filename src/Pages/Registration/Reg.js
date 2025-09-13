import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import "./reg.css";

export default function Reg() {
  const navigate = useNavigate();
  const webcamRef = useRef(null);

  const [isCapturing, setIsCapturing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [capturedImages, setCapturedImages] = useState([]);

  const [emp, setEmp] = useState({
    employeeId: "",
    fullName: "",
    department: "",
    position: "",
    email: "",
    faceEncodings: [], 
  });
  const departments = ["HR", "Finance", "Engineering", "Sales", "Marketing"];
  const positions = ["Manager", "Engineer", "Technician", "Admin", "Intern"];

  
  const captureFrames = async () => {
    if (!emp.employeeId || !emp.fullName) {
      setError("Please fill Employee ID and Full Name before capturing.");
      return;
    }
    setError(null);

    setIsCapturing(true);
    const encodings = [];
    const images = [];

    try {
      for (let i = 0; i < 5; i++) {
        
        const imageSrc = webcamRef.current?.getScreenshot();
        if (!imageSrc) {
          
          await new Promise((r) => setTimeout(r, 120));
          const retry = webcamRef.current?.getScreenshot();
          if (!retry) continue;
          images.push(retry);
          
          const res = await fetch("http://localhost:5000/encode_from_image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: retry }),
          });
          const data = await res.json();
          if (data.success && data.encoding) encodings.push(data.encoding);
        } else {
          images.push(imageSrc);
          const res = await fetch("http://localhost:5000/encode_from_image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: imageSrc }),
          });
          const data = await res.json();
          if (data.success && data.encoding) encodings.push(data.encoding);
        }

       
        await new Promise((r) => setTimeout(r, 350));
      }

      setCapturedImages(images);
      setEmp((prev) => ({ ...prev, faceEncodings: encodings }));
      if (encodings.length < 5) {
        setError(
          `Only captured ${encodings.length} valid face(s). Try again for 5 clear shots.`
        );
      }
    } catch (e) {
      setError(e.message || "Capture failed.");
    } finally {
      setIsCapturing(false);
    }
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const adminId = localStorage.getItem("adminId");

    if (!adminId) {
      setError("No adminId found — please log in again.");
      return;
    }
    if (!emp.faceEncodings?.length) {
      setError("Please capture face photos before submitting.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:3001/api/register-employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId, employee: emp }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Error registering employee.");
      }

    
      setEmp({
        employeeId: "",
        fullName: "",
        department: "",
        position: "",
        email: "",
        faceEncodings: [],
      });
      setCapturedImages([]);
      alert("Registration successful!");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="reg-container">
      <h1>Employee Registration</h1>
      {error && <div className="error-message">{error}</div>}

      <div className="registration-form">
       
        <div className="face-capture">
          <h2>Face Capture</h2>
          <div className="capture-box">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              screenshotQuality={0.92}
              style={{ width: "100%", height: "100%", borderRadius: 10 }}
            />
          </div>

          <button
            className="capture-button"
            onClick={captureFrames}
            disabled={isCapturing}
          >
            {isCapturing ? "Capturing..." : "Capture 5 Photos"}
          </button>

          <div className="captured-preview">
            {capturedImages.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Capture ${i + 1}`}
                style={{ width: 80, height: 80, margin: 5, borderRadius: 6 }}
              />
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="employee-details">
          <h2>Employee Details</h2>
          <form onSubmit={handleSubmit}>
            <label>Employee ID</label>
            <input
              value={emp.employeeId}
              onChange={(e) => setEmp({ ...emp, employeeId: e.target.value })}
              required
            />

            <label>Full Name</label>
            <input
              value={emp.fullName}
              onChange={(e) => setEmp({ ...emp, fullName: e.target.value })}
              required
            />

            <label>Department</label>
            <select
              value={emp.department}
              onChange={(e) => setEmp({ ...emp, department: e.target.value })}
              required
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            <label>Position</label>
            <select
              value={emp.position}
              onChange={(e) => setEmp({ ...emp, position: e.target.value })}
              required
            >
              <option value="">Select Position</option>
              {positions.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>

            <label>Email</label>
            <input
              type="email"
              value={emp.email}
              onChange={(e) => setEmp({ ...emp, email: e.target.value })}
              required
            />

            <div style={{ marginTop: 12 }}>
              <button
                className="submit-button"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>

              <button
                type="button"
                className="attendance-button"
                onClick={() => navigate("/attendance")}
                style={{ marginLeft: 8 }}
              >
                Mark Attendance
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
