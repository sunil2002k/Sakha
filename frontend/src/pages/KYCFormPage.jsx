import React, { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, UploadCloud, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useAuthUser from "../hooks/useAuthUser";

const KYCFormPage = () => {
  const navigate = useNavigate();
  const { authUser } = useAuthUser();

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
        setScriptsLoaded(true);
      })
      .catch((err) => console.error("Failed to load MediaPipe scripts", err));
  }, []);

  /* ----------------------------
      EAR (Eye Aspect Ratio) Math
     ----------------------------- */
  const calculateEAR = (p) => {
    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    const leftEAR = (dist(p[159], p[145]) + dist(p[158], p[153])) / (2 * dist(p[33], p[133]));
    const rightEAR = (dist(p[386], p[374]) + dist(p[385], p[380])) / (2 * dist(p[362], p[263]));
    return (leftEAR + rightEAR) / 2;
  };

  /* ----------------------------
      Capture Photo Logic
     ----------------------------- */
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/jpeg");
    setCapturedImage(imageData);

    if (cameraInstanceRef.current) {
        cameraInstanceRef.current.stop();
    }
    setCameraActive(false);
  }, []);

  /* ----------------------------
      Initialize MediaPipe
     ----------------------------- */
  useEffect(() => {
    if (!cameraActive || !scriptsLoaded) return;

    const initMediaPipe = async () => {
      if (!videoRef.current || !window.FaceMesh || !window.Camera) return;

      const mesh = new window.FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      mesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      mesh.onResults((results) => {
        if (meshInstanceRef.current?.shouldStop) return;

        if (results.multiFaceLandmarks?.length > 0) {
          const landmarks = results.multiFaceLandmarks[0];
          const ear = calculateEAR(landmarks);

          if (ear < 0.25) {
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
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleKycSubmit = async (e) => {
    e.preventDefault();
    if (!capturedImage) return alert("Please complete blink-based selfie capture.");

    const data = new FormData();
    data.append("fullName", formData.fullName);
    data.append("dob", formData.dob);
    data.append("address", formData.address);
    data.append("idCard", idCard);
    data.append("submittedBy", authUser._id);
    data.append("selfie", capturedImage); 

    try {
      await axios.post(`${import.meta.env.VITE_APP_URL}/api/v1/kyc/submit`, data);
      alert("KYC submitted successfully.");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("KYC submission failed.");
    }
  };

  return (
    <div className="min-h-screen flex justify-center px-4 py-10 bg-base-100 text-base-content transition-colors duration-300">
      <div className="max-w-xl w-full p-8 border border-base-300 bg-base-200/50 rounded-3xl shadow-xl backdrop-blur-xl h-fit pt-24">
        
        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost btn-sm gap-2 mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <h2 className="text-3xl font-black mb-2 tracking-tight">KYC Verification</h2>
        <p className="opacity-60 mb-8 text-sm font-medium">
          Verify your identity to unlock all platform features.
        </p>

        <form onSubmit={handleKycSubmit} className="space-y-6">

          {/* NAME */}
          <div className="form-control">
            <label className="label text-xs font-black uppercase tracking-widest opacity-70">Full Name</label>
            <input
              type="text"
              name="fullName"
              className="input input-bordered bg-base-100 focus:input-primary rounded-xl"
              placeholder="As it appears on your ID"
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* DOB */}
              <div className="form-control">
                <label className="label text-xs font-black uppercase tracking-widest opacity-70">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  className="input input-bordered bg-base-100 focus:input-primary rounded-xl"
                  onChange={handleChange}
                  required
                />
              </div>

              {/* ID CARD UPLOAD */}
              <div className="form-control">
                <label className="label text-xs font-black uppercase tracking-widest opacity-70">National ID</label>
                <label className="flex items-center justify-center gap-2 px-4 py-3 bg-base-100 border border-base-300 border-dashed rounded-xl cursor-pointer hover:border-primary transition-all">
                    <UploadCloud className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold truncate max-w-[120px]">
                        {idCard ? idCard.name : "Upload ID"}
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

          {/* ADDRESS */}
          <div className="form-control">
            <label className="label text-xs font-black uppercase tracking-widest opacity-70">Current Address</label>
            <textarea
              name="address"
              className="textarea textarea-bordered bg-base-100 focus:textarea-primary rounded-xl h-24"
              placeholder="Your permanent address..."
              onChange={handleChange}
              required
            />
          </div>

          {/* SELFIE CAPTURE */}
          <div className="pt-4 border-t border-base-300">
            <label className="label text-xs font-black uppercase tracking-widest opacity-70 mb-2">Liveness Detection (Selfie)</label>

            {!capturedImage && !cameraActive && (
              <button
                type="button"
                onClick={handleStartCamera}
                disabled={!scriptsLoaded}
                className="btn btn-primary btn-block rounded-xl h-16 shadow-lg shadow-primary/20"
              >
                <Camera className="w-5 h-5" /> 
                {scriptsLoaded ? "Start Camera & Blink" : "Loading AI Modules..."}
              </button>
            )}

            {cameraActive && (
              <div className="relative overflow-hidden rounded-2xl border-2 border-primary shadow-2xl">
                <video 
                    ref={videoRef} 
                    className="w-full h-auto transform scale-x-[-1] bg-black"
                    autoPlay 
                    playsInline 
                />
                <div className="absolute inset-0 border-[16px] border-primary/10 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 right-0 bg-primary text-primary-content p-3 text-center">
                  <p className="text-sm font-black animate-pulse uppercase tracking-wider">
                    Looking for eyes... Blink to capture!
                  </p>
                </div>
              </div>
            )}

            {capturedImage && (
              <div className="relative group">
                <img
                  src={capturedImage}
                  className="w-full rounded-2xl border-2 border-success shadow-lg"
                  alt="Captured selfie"
                />
                <button
                    type="button"
                    onClick={() => setCapturedImage(null)}
                    className="absolute top-4 right-4 btn btn-circle btn-sm bg-black/60 border-none text-white hover:bg-black"
                >
                    ✕
                </button>
                <div className="mt-3 flex items-center justify-center gap-2 text-success font-bold text-xs">
                    <span className="w-2 h-2 rounded-full bg-success animate-ping"></span>
                    VERIFIED SELFIE CAPTURED
                </div>
              </div>
            )}

            <canvas ref={canvasRef} className="hidden"></canvas>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg rounded-xl mt-4 font-black shadow-xl"
          >
            Submit KYC Application
          </button>
        </form>
      </div>
    </div>
  );
};

export default KYCFormPage;