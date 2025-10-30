import React, { useEffect, useRef, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";

// 💡 NOTE: Replace 'useAuthContext' with your actual user context/hook
// import { useAuthContext } from '../context/AuthContext';

const SOCKET_SERVER_URL = import.meta.env.VITE_APP_URL;
const ICE_SERVERS = {
  // Use public STUN servers for testing connectivity
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

const VideoChat = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  // const { user } = useAuthContext(); // 💡 Get the current user
  const user = { _id: "MOCK_USER_ID_123" }; // Mock user object for demonstration

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);

  const [status, setStatus] = useState("Connecting to server...");
  const [isCallActive, setIsCallActive] = useState(false);
  const [partnerSocketId, setPartnerSocketId] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    // 1. Initialize Socket.IO connection
    socketRef.current = io(SOCKET_SERVER_URL, {
      auth: {
        userId: user._id,
      },
    });
    const socket = socketRef.current;

    socket.on("connect", () => {
      socket.emit("join-room", projectId);
    });

    // owner receives pending mentor requests
    socket.on("mentor-request", (req) => {
      // only owner will get this; show UI to accept/reject
      setPendingRequests((prev) => [...prev, req]);
    });

    socket.on("mentor-pending-list", (list) => {
      setPendingRequests(list || []);
    });

    socket.on("waiting-for-approval", () => {
      setStatus("Waiting for owner approval...");
    });

    socket.on("waiting-for-owner", () => {
      setStatus("Waiting for owner to join...");
    });

    socket.on("mentor-approved", () => {
      setStatus("Mentor approved. Call starting...");
      // proceed with offer/answer flow; if you're the mentor, createOffer will occur when owner signals
      if (isMentorClient()) createOffer();
    });

    socket.on("mentor-rejected", () => {
      alert("Owner rejected your mentorship request.");
      // close
      navigate(`/project/${projectId}`);
    });

    // --- Socket Event Handlers ---

    socket.on("user-ready", (msg) => {
      setStatus(msg);
      // If we are the first to join, we become the 'offerer' when the second person joins.
      if (msg.includes("Waiting for partner")) {
        setIsCallActive(true);
      }
    });

    socket.on("user-joined", (partnerId) => {
      setStatus("Partner joined. Starting call...");
      setPartnerSocketId(partnerId);
      // If we are the offerer (the first user), create the offer now
      if (isCallActive) {
        createOffer();
      }
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
        .catch((e) => console.error("Error adding received ICE candidate:", e));
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

    // --- WebRTC Setup ---

    const setupWebRTC = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        peerConnectionRef.current = new RTCPeerConnection(ICE_SERVERS);
        const pc = peerConnectionRef.current;

        // Add local tracks to the peer connection
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        // Listener for receiving remote tracks (partner's video/audio)
        pc.ontrack = (event) => {
          if (
            remoteVideoRef.current &&
            remoteVideoRef.current.srcObject !== event.streams[0]
          ) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };

        // Listener for gathering ICE candidates (network info)
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            // Send the candidate to the partner via the signaling server
            socket.emit("ice-candidate", event.candidate);
          }
        };

        setStatus("Media access granted. Signaling...");
      } catch (error) {
        console.error("Error starting media stream:", error);
        setStatus("Error: Could not access camera or microphone.");
      }
    };

    const createOffer = async () => {
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      socket.emit("offer", peerConnectionRef.current.localDescription);
      setStatus("Sending offer...");
    };

    const createAnswer = async () => {
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      socket.emit("answer", peerConnectionRef.current.localDescription);
      setStatus("Sending answer. Call established.");
    };

    setupWebRTC();

    // --- Cleanup ---
    return () => {
      // 1. Stop local media streams
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        localVideoRef.current.srcObject
          .getTracks()
          .forEach((track) => track.stop());
      }

      // 2. Close peer connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }

      // 3. Disconnect socket
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [projectId, navigate, user._id, isCallActive]);

  const resetCall = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      localVideoRef.current.srcObject
        .getTracks()
        .forEach((track) => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    window.location.href = `/project/${projectId}`;
  };

  const handleApprove = (socketId, approve) => {
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
      {pendingRequests.length > 0 && (
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
