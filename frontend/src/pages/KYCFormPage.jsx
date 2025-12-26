import React, { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, UploadCloud, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useAuthUser from "../hooks/useAuthUser";

const KYCFormPage = () => {
  const navigate = useNavigate();
  const {authUser} = useAuthUser();

  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    address: "",
  });
  const [idCard, setIdCard] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const cameraInstanceRef = useRef(null);
  const meshInstanceRef = useRef(null);

  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [isProcessingBlink, setIsProcessingBlink] = useState(false);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);

  // --- Load MediaPipe Scripts Dynamically ---
  useEffect(() => {
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    Promise.all([
      loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js"),
      loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"),
    ])
      .then(() => {
        console.log("MediaPipe scripts loaded");
        setScriptsLoaded(true);
      })
      .catch((err) => console.error("Failed to load MediaPipe scripts", err));
  }, []);

  /* ----------------------------
      EAR (Eye Aspect Ratio) Math
     ----------------------------- */
  const calculateEAR = (p) => {
    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    // Left Eye
    const leftEAR =
      (dist(p[159], p[145]) + dist(p[158], p[153])) /
      (2 * dist(p[33], p[133]));
    // Right Eye
    const rightEAR =
      (dist(p[386], p[374]) + dist(p[385], p[380])) /
      (2 * dist(p[362], p[263]));
    return (leftEAR + rightEAR) / 2;
  };

  /* ----------------------------
      Capture Photo Logic
     ----------------------------- */
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video stream
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/jpeg");
    setCapturedImage(imageData);

    // Stop Camera and cleanup
    if (cameraInstanceRef.current) {
        cameraInstanceRef.current.stop();
    }
    setCameraActive(false);
    setIsProcessingBlink(false);
  }, []);

  /* ----------------------------
      Initialize MediaPipe
      (Triggered when cameraActive becomes true and scripts are loaded)
     ----------------------------- */
  useEffect(() => {
    if (!cameraActive || !scriptsLoaded) return;

    const initMediaPipe = async () => {
      if (!videoRef.current || !window.FaceMesh || !window.Camera) return;

      const mesh = new window.FaceMesh({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      mesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      mesh.onResults((results) => {
        // If we are already capturing, ignore new frames
        if (meshInstanceRef.current?.shouldStop) return;

        if (results.multiFaceLandmarks?.length > 0) {
          const landmarks = results.multiFaceLandmarks[0];
          const ear = calculateEAR(landmarks);

          // EAR Threshold: < 0.25 usually indicates closed eyes
          if (ear < 0.25) {
             // Use a flag to prevent multiple triggers
             if (!meshInstanceRef.current?.shouldStop) {
                 meshInstanceRef.current.shouldStop = true;
                 capturePhoto();
             }
          }
        }
      });

      meshInstanceRef.current = mesh;

      const camera = new window.Camera(videoRef.current, {
        onFrame: async () => {
          if (meshInstanceRef.current && !meshInstanceRef.current.shouldStop) {
             await mesh.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480,
      });

      cameraInstanceRef.current = camera;
      await camera.start();
    };

    initMediaPipe();

    // Cleanup function
    return () => {
      if (cameraInstanceRef.current) {
        cameraInstanceRef.current.stop();
        cameraInstanceRef.current = null;
      }
      if (meshInstanceRef.current) {
        meshInstanceRef.current.close();
        meshInstanceRef.current = null;
      }
    };
  }, [cameraActive, scriptsLoaded, capturePhoto]);

  /* ----------------------------
      Handlers
     ----------------------------- */
  const handleStartCamera = () => {
    setCapturedImage(null);
    setCameraActive(true);
    setIsProcessingBlink(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleKycSubmit = async (e) => {
    e.preventDefault();
    const submittedBy = authUser._id; 
    if (!capturedImage) {
      alert("Please complete blink-based selfie capture.");
      return;
    }

    const data = new FormData();
    data.append("fullName", formData.fullName);
    data.append("dob", formData.dob);
    data.append("address", formData.address);
    data.append("idCard", idCard);
    data.append("submittedBy", submittedBy);
    data.append("selfie", capturedImage); 

    try {
      const res = await axios.post("http://localhost:5500/api/v1/kyc/submit", data);
      alert("KYC submitted successfully.");
      setFormData({
        fullName: "",
        dob: "",
        address: "",
  })
    } catch (err) {
      console.error(err);
      alert("KYC submission failed.");
    }
  };

  return (
    <div className="min-h-screen flex justify-center px-4 py-10 bg-slate-950 text-white font-sans">
      <div className="max-w-xl w-full p-8 border border-slate-800 bg-slate-900/40 rounded-3xl shadow-xl backdrop-blur-xl">
        
        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-300 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" /> Back
        </button>

        <h2 className="text-2xl font-bold mb-3">KYC Verification</h2>
        <p className="text-slate-400 mb-8 text-sm">
          Complete the form below and blink to capture your selfie.
        </p>

        <form onSubmit={handleKycSubmit} className="space-y-6">

          {/* NAME */}
          <div>
            <label className="text-sm text-slate-300 font-medium">Full Name</label>
            <input
              type="text"
              name="fullName"
              className="w-full mt-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              placeholder="Enter your full name"
              onChange={handleChange}
              required
            />
          </div>

          {/* DOB */}
          <div>
            <label className="text-sm text-slate-300 font-medium">Date of Birth</label>
            <input
              type="date"
              name="dob"
              className="w-full mt-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              onChange={handleChange}
              required
            />
          </div>

          {/* ADDRESS */}
          <div>
            <label className="text-sm text-slate-300 font-medium">Address</label>
            <textarea
              name="address"
              className="w-full mt-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              rows="3"
              onChange={handleChange}
              required
            />
          </div>

          {/* ID CARD */}
          <div>
            <label className="text-sm text-slate-300 font-medium">National ID</label>
            <div className="mt-2 p-4 rounded-xl bg-slate-800 border border-slate-700 hover:border-purple-500 transition-colors border-dashed">
              <label className="flex flex-col items-center justify-center cursor-pointer">
                <UploadCloud className="w-8 h-8 text-purple-400 mb-2" />
                <span className="text-slate-300 text-sm font-medium">
                  {idCard ? idCard.name : "Click to Upload ID Card"}
                </span>
                <span className="text-slate-500 text-xs mt-1">
                  Supports JPG, PNG
                </span>

                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => setIdCard(e.target.files[0])}
                  required
                />
              </label>
            </div>
          </div>

          {/* SELFIE CAPTURE */}
          <div>
            <label className="text-sm text-slate-300 font-medium block mb-2">Live Selfie</label>

            {/* Start Camera Button */}
            {!capturedImage && !cameraActive && (
              <button
                type="button"
                onClick={handleStartCamera}
                disabled={!scriptsLoaded}
                className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 transition-all font-medium shadow-lg ${
                  scriptsLoaded 
                    ? "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/20" 
                    : "bg-slate-700 text-slate-400 cursor-not-allowed"
                }`}
              >
                <Camera className="w-5 h-5" /> 
                {scriptsLoaded ? "Start Camera & Blink" : "Loading Camera..."}
              </button>
            )}

            {/* Video Preview */}
            {cameraActive && (
              <div className="relative overflow-hidden rounded-xl border border-purple-500 shadow-2xl shadow-purple-900/30">
                <video 
                    ref={videoRef} 
                    className="w-full h-auto transform scale-x-[-1]" // Mirror effect
                    autoPlay 
                    playsInline 
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-3 text-center">
                  <p className="text-purple-300 text-sm font-medium animate-pulse">
                    Looking for eyes... Blink to capture!
                  </p>
                </div>
              </div>
            )}

            {/* Captured Result */}
            {capturedImage && (
              <div className="relative">
                <img
                  src={capturedImage}
                  className="w-full rounded-xl border border-green-500 shadow-lg"
                  alt="Captured selfie"
                />
                <button
                    type="button"
                    onClick={() => setCapturedImage(null)}
                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-md transition-colors"
                >
                    Retake
                </button>
                <p className="text-green-400 text-xs mt-2 text-center">
                    Selfie captured successfully!
                </p>
              </div>
            )}

            {/* Hidden Canvas for processing */}
            <canvas ref={canvasRef} className="hidden"></canvas>
          </div>

          <button
            type="submit"
            className="w-full mt-6 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-4 text-sm font-bold text-white shadow-lg hover:shadow-purple-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Submit KYC Application
          </button>
        </form>
      </div>
    </div>
  );
};

export default KYCFormPage;