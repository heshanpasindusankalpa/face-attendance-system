import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import './attendance.css';


export default function Attendance() {
  const webcamRef = useRef(null);

  const [devices, setDevices] = useState([]);
  const [deviceId, setDeviceId] = useState("");
  const [isReady, setIsReady] = useState(false);

  const [message, setMessage] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [processedImage, setProcessedImage] = useState(null);

  const adminId = localStorage.getItem("adminId");

  // Ask permission once, then enumerate cameras
  useEffect(() => {
    (async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        const list = await navigator.mediaDevices.enumerateDevices();
        const cams = list.filter((d) => d.kind === "videoinput");
        setDevices(cams);
        // prefer a non-virtual cam if available
        const preferred =
          cams.find((c) => !/obs|droid|virtual/i.test(c.label)) || cams[0];
        if (preferred) setDeviceId(preferred.deviceId);
      } catch (e) {
        setMessage(`Camera permission error: ${e.message}`);
      }
    })();
  }, []);

  const videoConstraints = deviceId
    ? { width: 640, height: 480, deviceId: { exact: deviceId } }
    : { width: 640, height: 480, facingMode: "user" };

  // Wait until the <video> element is actually playing
  const waitForVideoReady = async (maxMs = 1500) => {
    const start = performance.now();
    while (performance.now() - start < maxMs) {
      const v = webcamRef.current?.video;
      if (v && v.readyState === 4 && !v.paused && !v.ended) return true;
      await new Promise((r) => setTimeout(r, 50));
    }
    return false;
  };

  const captureAndRecognize = async () => {
    if (!adminId) {
      setMessage("Please login as admin first");
      return;
    }

    setIsScanning(true);
    setMessage("");
    setProcessedImage(null);

    try {
      // ensure webcam stream is up
      const ready = await waitForVideoReady();
      if (!ready) {
        setMessage("Camera not ready (video stream not started).");
        return;
      }

      // capture (retry once if null)
      let imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        await new Promise((r) => setTimeout(r, 100));
        imageSrc = webcamRef.current.getScreenshot();
      }
      if (!imageSrc) {
        throw new Error("Failed to capture image (getScreenshot returned null).");
      }

      const response = await fetch("http://localhost:5000/recognize_face", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageSrc, adminId }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`Attendance marked for ${data.employee?.name || "Unknown"}`);
      } else {
        setMessage(data.message || "Recognition failed");
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
    <div className="container2">
      <h1>Face Recognition Attendance</h1>

      {message && (
        <div className={message.startsWith("Error") ? "error" : "success"}>
          {message}
        </div>
      )}

      {/* Camera selector */}
      <div style={{ marginBottom: 8 }}>
        <label style={{ marginRight: 8 }}><b>Camera</b></label>
        <select
          value={deviceId}
          onChange={(e) => { setDeviceId(e.target.value); setIsReady(false); }}
          style={{ padding: 6 }}
        >
          {devices.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label || `Camera ${d.deviceId.slice(0, 6)}`}
            </option>
          ))}
        </select>
      </div>

      <div className="camera-container">
        {/* Webcam visible unless we’re showing the processed server image */}
        <div style={{ display: processedImage ? "none" : "block" }}>
          <Webcam
            audio={false}
            ref={webcamRef}
            mirrored={true}
            screenshotFormat="image/jpeg"
            screenshotQuality={0.92}
            width={640}
            height={480}
            videoConstraints={videoConstraints}
            onUserMedia={() => setIsReady(true)}
            onUserMediaError={(e) => {
              setIsReady(false);
              setMessage("Camera error: " + (e?.message || "unknown"));
            }}
          />
        </div>

        {processedImage && (
          <img
            src={processedImage}
            alt="Processed Result"
            style={{ width: 640, height: 480, borderRadius: 6 }}
          />
        )}

        <button
          onClick={captureAndRecognize}
          disabled={isScanning || !isReady}
          className="scan-button"
        >
          {isScanning ? "Processing..." : "Scan Face"}
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
