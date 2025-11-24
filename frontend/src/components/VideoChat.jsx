import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";

// 💡 NOTE: Replace the mock user with your real auth user/context
// import { useAuthContext } from '../context/AuthContext';

// prefer explicit env (set to your ngrok https URL), fallback to same origin as the page
const SOCKET_SERVER_URL =
  import.meta.env.VITE_APP_URL ??
  import.meta.env.VITE_API_URL ??
  (typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost:5500");
const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

const VideoChat = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  // Replace this mock with your real user object (from auth/context)
  const user = { _id: localStorage.getItem("userId") || "MOCK_USER_ID_123" };

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);

  const cameraStreamRef = useRef(null); // original camera stream
  const screenStreamRef = useRef(null); // screen share stream
  const originalVideoTrackRef = useRef(null); // original camera video track

  const [status, setStatus] = useState("Connecting to server...");
  const [isCallActive, setIsCallActive] = useState(false);
  const [ownerId, setOwnerId] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [partnerSocketId, setPartnerSocketId] = useState(null);

  // helper: determine if client is mentor (not owner)
  const isMentorClient = () => {
    return !!ownerId && String(user._id) !== String(ownerId);
  };

  useEffect(() => {
    // fetch project to learn ownerId
    const fetchProjectOwner = async () => {
      try {
        const APIURL =
          import.meta.env.VITE_APP_URL ??
          "http://localhost:5500";
        const res = await axios.get(`${APIURL}/api/v1/projects/${projectId}`);
        const proj = res.data.project ?? res.data;
        const addedById =
          proj?.addedBy &&
          (typeof proj.addedBy === "string"
            ? proj.addedBy
            : proj.addedBy._id ?? proj.addedBy);
        setOwnerId(addedById);
        setIsOwner(String(user._id) === String(addedById));
      } catch (err) {
        console.error("Failed to fetch project owner:", err);
      }
    };

    fetchProjectOwner();
  }, [projectId, user._id]);

  useEffect(() => {
    console.log("Connecting socket to:", SOCKET_SERVER_URL);
    // 1. Initialize socket
    const token = localStorage.getItem("token"); // if you want to send auth
    socketRef.current = io(SOCKET_SERVER_URL, {
      auth: { userId: user._id, token },
      transports: ["websocket", "polling"],
      // upgrade:true (default) — keep websocket primary transport
    });
    const socket = socketRef.current;

    socket.on("connect", () => {
      socket.emit("join-room", projectId);
    });

    socket.on("mentor-request", (req) =>
      setPendingRequests((prev) => [...prev, req])
    );
    socket.on("mentor-pending-list", (list) => setPendingRequests(list || []));
    socket.on("waiting-for-approval", () =>
      setStatus("Waiting for owner approval...")
    );
    socket.on("waiting-for-owner", () =>
      setStatus("Waiting for owner to join...")
    );
    socket.on("mentor-approved", () => {
      setStatus("Mentor approved. Call starting...");
      if (isMentorClient()) createOffer();
    });
    socket.on("mentor-rejected", () => {
      alert("Owner rejected your mentorship request.");
      navigate(`/project/${projectId}`);
    });

    socket.on("user-ready", (msg) => {
      setStatus(msg);
      if (msg.includes("Waiting for partner")) setIsCallActive(true);
    });

    socket.on("user-joined", (partnerId) => {
      setStatus("Partner joined. Starting call...");
      setPartnerSocketId(partnerId);
      if (isCallActive) createOffer();
    });

    socket.on("offer", async (offer) => {
      setStatus("Received offer. Creating answer...");
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      await createAnswer();
    });

    socket.on("answer", (answer) => {
      setStatus("Received answer. Call established.");
      peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    });

    socket.on("ice-candidate", (candidate) => {
      peerConnectionRef.current
        .addIceCandidate(new RTCIceCandidate(candidate))
        .catch((e) => console.error(e));
    });

    socket.on("partner-left", () => {
      setStatus("Partner disconnected. Ending call...");
      resetCall();
      alert("Your partner has ended the session.");
    });

    socket.on("room-full", () => {
      alert("This mentorship session is full (2 people max).");
      navigate("/");
    });

    // Setup WebRTC
    const setupWebRTC = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        cameraStreamRef.current = stream;
        originalVideoTrackRef.current = stream.getVideoTracks()[0] || null;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        peerConnectionRef.current = new RTCPeerConnection(ICE_SERVERS);
        const pc = peerConnectionRef.current;

        // add local tracks
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        pc.ontrack = (event) => {
          if (
            remoteVideoRef.current &&
            remoteVideoRef.current.srcObject !== event.streams[0]
          ) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };

        pc.onicecandidate = (event) => {
          if (event.candidate) socket.emit("ice-candidate", event.candidate);
        };

        setStatus("Media access granted. Signaling...");
      } catch (error) {
        console.error("Error starting media stream:", error);
        setStatus("Error: Could not access camera or microphone.");
      }
    };

    const createOffer = async () => {
      try {
        const pc = peerConnectionRef.current;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer", pc.localDescription);
        setStatus("Sending offer...");
      } catch (e) {
        console.error("createOffer error:", e);
      }
    };

    const createAnswer = async () => {
      try {
        const pc = peerConnectionRef.current;
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", pc.localDescription);
        setStatus("Sending answer. Call established.");
      } catch (e) {
        console.error("createAnswer error:", e);
      }
    };

    setupWebRTC();

    // cleanup
    return () => {
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        localVideoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
      if (peerConnectionRef.current) peerConnectionRef.current.close();
      if (socketRef.current) socketRef.current.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, ownerId]);

  // Replace the current outbound video track with a new MediaStreamTrack (screen)
  const startScreenShare = async () => {
    if (!peerConnectionRef.current) return;
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      screenStreamRef.current = screenStream;
      const screenTrack = screenStream.getVideoTracks()[0];

      // replace sender track
      const senders = peerConnectionRef.current.getSenders();
      const videoSender = senders.find(
        (s) => s.track && s.track.kind === "video"
      );
      if (videoSender) {
        await videoSender.replaceTrack(screenTrack);
      }

      // show the screen in local video element
      if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;

      // when screen sharing stops, restore camera track
      screenTrack.onended = async () => {
        await stopScreenShare();
      };

      setStatus("You are sharing your screen");
    } catch (err) {
      console.error("Screen share error:", err);
    }
  };

  const stopScreenShare = async () => {
    try {
      // stop screen tracks
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
      }

      // restore original camera track to the sender
      const pc = peerConnectionRef.current;
      const senders = pc ? pc.getSenders() : [];
      const videoSender = senders.find(
        (s) => s.track && s.track.kind === "video"
      );
      if (videoSender && originalVideoTrackRef.current) {
        await videoSender.replaceTrack(originalVideoTrackRef.current);
      }

      // restore local video preview to camera stream
      if (cameraStreamRef.current && localVideoRef.current) {
        localVideoRef.current.srcObject = cameraStreamRef.current;
      }

      setStatus("Screen sharing stopped");
    } catch (err) {
      console.error("stopScreenShare error:", err);
    }
  };

  const resetCall = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      localVideoRef.current.srcObject
        .getTracks()
        .forEach((track) => track.stop());
    }
    if (peerConnectionRef.current) peerConnectionRef.current.close();
    if (socketRef.current) socketRef.current.disconnect();
    navigate(`/project/${projectId}`);
  };

  const handleApprove = (socketId, approve) => {
    if (!socketRef.current) return;
    socketRef.current.emit("approve-mentor", { projectId, socketId, approve });
    setPendingRequests((prev) => prev.filter((p) => p.socketId !== socketId));
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-4 text-purple-400">
        Mentorship Session: {projectId}
      </h1>
      <p className="mb-6 text-lg text-yellow-300">{status}</p>

      <div className="flex justify-center w-full max-w-5xl space-x-8">
        {/* Local Video Stream */}
        <div className="flex flex-col items-center bg-gray-800 p-4 rounded-lg shadow-xl w-1/2">
          <h2 className="text-xl mb-2">My Feed (Local)</h2>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            className="w-full h-80 bg-black rounded-lg border-2 border-purple-500"
          />
          {isOwner && (
            <div className="mt-3 flex gap-2">
              <button
                onClick={startScreenShare}
                className="px-3 py-2 bg-indigo-600 rounded"
              >
                Start Screen Share
              </button>
              <button
                onClick={stopScreenShare}
                className="px-3 py-2 bg-gray-600 rounded"
              >
                Stop Screen Share
              </button>
            </div>
          )}
        </div>

        {/* Remote Video Stream */}
        <div className="flex flex-col items-center bg-gray-800 p-4 rounded-lg shadow-xl w-1/2">
          <h2 className="text-xl mb-2">Partner's Feed (Remote)</h2>
          <video
            ref={remoteVideoRef}
            autoPlay
            className="w-full h-80 bg-black rounded-lg border-2 border-green-500"
          />
        </div>
      </div>

      {/* Control Buttons */}
      <div className="mt-8 space-x-4">
        <button
          onClick={resetCall}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded transition duration-300"
        >
          End Call
        </button>
      </div>

      {/* Pending Requests Panel (Owner only) */}
      {isOwner && pendingRequests.length > 0 && (
        <div className="fixed top-24 right-6 z-60 bg-white/5 p-4 rounded-lg border border-white/10">
          <h3 className="text-white font-semibold mb-2">Mentor Requests</h3>
          {pendingRequests.map((r) => (
            <div
              key={r.socketId}
              className="flex items-center justify-between mb-2"
            >
              <span className="text-sm text-gray-200">{r.userId}</span>
              <div className="space-x-2">
                <button
                  onClick={() => handleApprove(r.socketId, true)}
                  className="px-3 py-1 bg-green-500 rounded text-white"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleApprove(r.socketId, false)}
                  className="px-3 py-1 bg-red-500 rounded text-white"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoChat;