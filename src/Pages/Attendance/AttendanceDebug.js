import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

export default function AttendanceDebug() {
  const webcamRef = useRef(null);

  const [devices, setDevices] = useState([]);
  const [deviceId, setDeviceId] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [message, setMessage] = useState("");
  const [capturedImage, setCapturedImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [stats, setStats] = useState({});

  const adminId = localStorage.getItem("adminId");

  // 1) Ask permission once, then enumerate devices
  useEffect(() => {
    async function init() {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        const list = await navigator.mediaDevices.enumerateDevices();
        const cams = list.filter((d) => d.kind === "videoinput");
        setDevices(cams);
        // prefer non-virtual cam if present
        const preferred =
          cams.find(c => !/obs|droid|virtual/i.test(c.label)) || cams[0];
        if (preferred) setDeviceId(preferred.deviceId);
      } catch (e) {
        setMessage(`Camera permission error: ${e.message}`);
      }
    }
    init();
  }, []);

  const videoConstraints = deviceId
    ? { width: 640, height: 480, deviceId: { exact: deviceId } }
    : { width: 640, height: 480, facingMode: "user" };

  // helper: wait until video really playing
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
    setCapturedImage(null);
    setStats({});

    try {
      // 2) Ensure webcam is actually ready
      const ready = await waitForVideoReady();
      if (!ready) {
        setMessage("Camera not ready (video stream not started).");
        setIsScanning(false);
        return;
      }

      // 3) Try capture (retry once if null)
      let t0 = performance.now();
      let imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        await new Promise((r) => setTimeout(r, 100)); // tiny wait
        imageSrc = webcamRef.current.getScreenshot();
      }
      const t1 = performance.now();

      if (!imageSrc) {
        setMessage("Failed to capture image (getScreenshot returned null).");
        setIsScanning(false);
        return;
      }

      setCapturedImage(imageSrc);

      // 4) Send to Flask
      const t2 = performance.now();
      const res = await fetch("http://localhost:5000/recognize_face", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageSrc, adminId }),
      });
      const t3 = performance.now();
      const data = await res.json();
      const t4 = performance.now();

      setMessage(data.message || (data.success ? "Success" : "Failed"));
      if (data.processed_image) setProcessedImage(data.processed_image);

      setStats({
        screenshotMs: (t1 - t0).toFixed(1),
        fetchMs: (t3 - t2).toFixed(1),
        parseMs: (t4 - t3).toFixed(1),
        imageSize: imageSrc.length,
        processedSize: (data.processed_image || "").length,
        success: data.success,
        distance: data.distance,
        status: res.status,
      });
    } catch (e) {
      setMessage("Error: " + e.message);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <h1>Attendance Debug</h1>
      {message && (
        <div className={message.startsWith("Error") ? "error" : "success"}>
          {message}
        </div>
      )}

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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <h3>Webcam (Live) {isReady ? "✅" : "⏳"}</h3>
          <Webcam
            ref={webcamRef}
            audio={false}
            mirrored={true}
            screenshotFormat="image/jpeg"
            screenshotQuality={0.92}
            videoConstraints={videoConstraints}
            width={640}
            height={480}
            onUserMedia={() => setIsReady(true)}
            onUserMediaError={(e) => {
              setIsReady(false);
              setMessage("Camera error: " + (e?.message || "unknown"));
            }}
            style={{ width: "100%", background: "#000", borderRadius: 6 }}
          />
        </div>

        <div>
          <h3>Processed (Server)</h3>
          {processedImage ? (
            <img src={processedImage} alt="Processed" style={{ width: "100%", borderRadius: 6 }} />
          ) : (
            <div style={{ padding: 12, border: "1px dashed #ccc", borderRadius: 6 }}>
              No processed image yet
            </div>
          )}
        </div>

        <div>
          <h3>Captured (Client → Server)</h3>
          {capturedImage ? (
            <img src={capturedImage} alt="Captured" style={{ width: "100%", borderRadius: 6 }} />
          ) : (
            <div style={{ padding: 12, border: "1px dashed #ccc", borderRadius: 6 }}>
              Not captured yet
            </div>
          )}
        </div>

        <div>
          <h3>Debug Stats</h3>
          <pre style={{ background: "#f7f7f7", padding: 12, borderRadius: 6 }}>
{JSON.stringify(stats, null, 2)}
          </pre>
          <button
            onClick={captureAndRecognize}
            disabled={isScanning || !isReady}
            className="scan-button"
          >
            {isScanning ? "Processing..." : "Scan Face"}
          </button>
          <button
            onClick={() => { setMessage(""); setCapturedImage(null); setProcessedImage(null); setStats({}); }}
            className="reset-button"
            style={{ marginLeft: 8 }}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
