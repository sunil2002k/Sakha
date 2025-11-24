import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";

const SOCKET_SERVER_URL =
  import.meta.env.VITE_APP_URL ??
  import.meta.env.VITE_API_URL ??
  (typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost:5500");

const Chatroom = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [ownerId, setOwnerId] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [status, setStatus] = useState("Connecting...");
  const socketRef = useRef(null);

  const userId = localStorage.getItem("userId") || "ANON";

  useEffect(() => {
    // load project owner
    (async () => {
      try {
        const APIURL = import.meta.env.VITE_APP_URL ?? "http://localhost:5500";
        const res = await axios.get(`${APIURL}/api/v1/projects/${projectId}`);
        const proj = res.data.project ?? res.data;
        const addedBy =
          proj?.addedBy && typeof proj.addedBy === "string"
            ? proj.addedBy
            : proj?.addedBy?._id ?? null;
        setOwnerId(addedBy);
        setIsOwner(String(userId) === String(addedBy));
      } catch (err) {
        console.error("Failed to fetch project:", err);
      }
    })();
  }, [projectId, userId]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const socket = io(SOCKET_SERVER_URL, {
      auth: { userId, token },
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;
    // expose for global UI actions (optional)
    window.__GLOBAL_SOCKET__ = socket;

    socket.on("connect", () => {
      setStatus("Connected");
      // join project room (server will notify owner about mentor join)
      socket.emit("join-room", projectId);
    });

    socket.on("disconnect", (reason) => {
      setStatus("Disconnected: " + reason);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connect_error:", err);
      setStatus("Connect error");
    });

    // chat messages (server must relay to room)
    socket.on("chat-message", (msg) => {
      setMessages((m) => [...m, msg]);
    });

    // mentor requests and pending list (owner receives)
    socket.on("mentor-request", (req) => {
      setPendingRequests((p) => [...p, req]);
    });
    socket.on("mentor-pending-list", (list) => setPendingRequests(list || []));

    // mentor approved -> navigate to video chat
    socket.on("mentor-approved", ({ projectId: pid }) => {
      if (String(pid) === String(projectId)) {
        navigate(`/video-chat/${projectId}`);
      }
    });

    socket.on("mentor-rejected", () => {
      setStatus("Request rejected by owner.");
    });

    return () => {
      socket.disconnect();
      if (window.__GLOBAL_SOCKET__ === socket) window.__GLOBAL_SOCKET__ = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, userId]);

  const sendMessage = () => {
    if (!text.trim()) return;
    const payload = {
      projectId,
      from: userId,
      text: text.trim(),
      createdAt: Date.now(),
    };
    // emit to server (server should relay to room)
    socketRef.current?.emit("chat-message", payload);
    setMessages((m) => [...m, payload]);
    setText("");
  };

  const requestCall = () => {
    // join-room already triggers mentor request server-side; also emit explicit request if you prefer
    socketRef.current?.emit("join-room", projectId);
    setStatus("Requested call. Waiting for owner...");
  };

  const approveRequest = (socketId, approve) => {
    socketRef.current?.emit("approve-mentor", { projectId, socketId, approve });
    setPendingRequests((p) => p.filter((r) => r.socketId !== socketId));
    if (approve) {
      // owner directly navigates to video chat
      navigate(`/video-chat/${projectId}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 bg-gray-900 text-white rounded-lg">
      <h2 className="text-xl font-semibold mb-2">Project Chatroom</h2>
      <p className="text-sm text-gray-300 mb-4">
        Project: {projectId} — Status: {status}
      </p>

      {!isOwner ? (
        <div className="mb-4">
          <button
            onClick={requestCall}
            className="px-4 py-2 bg-indigo-600 rounded mr-2"
          >
            Request Call with Owner
          </button>
          <button
            onClick={() => navigate(`/video-chat/${projectId}`)}
            className="px-4 py-2 bg-gray-700 rounded"
          >
            Open Video Chat (if allowed)
          </button>
        </div>
      ) : (
        <div className="mb-4">
          <div className="font-medium mb-2">Pending Mentor Requests</div>
          {pendingRequests.length === 0 && (
            <div className="text-sm text-gray-400">No requests</div>
          )}
          {pendingRequests.map((r) => (
            <div
              key={r.socketId}
              className="flex items-center justify-between bg-white/5 p-2 rounded my-1"
            >
              <div>
                <div className="text-sm">User: {r.userId}</div>
                {r.projectId && (
                  <div className="text-xs text-gray-400">
                    Project: {r.projectId}
                  </div>
                )}
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => approveRequest(r.socketId, true)}
                  className="px-2 py-1 bg-green-600 rounded"
                >
                  Accept
                </button>
                <button
                  onClick={() => approveRequest(r.socketId, false)}
                  className="px-2 py-1 bg-red-600 rounded"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-gray-700 pt-4">
        <div
          className="h-64 overflow-auto mb-2 bg-black/30 p-3 rounded"
          id="chatBox"
        >
          {messages.length === 0 && (
            <div className="text-sm text-gray-400">No messages yet</div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`mb-2 ${
                m.from === userId ? "text-right" : "text-left"
              }`}
            >
              <div className="text-xs text-gray-400">{m.from}</div>
              <div className="inline-block bg-white/5 px-3 py-1 rounded">
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 rounded bg-gray-800 border border-gray-700"
          />
          <button
            onClick={sendMessage}
            className="px-4 py-2 bg-blue-600 rounded"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatroom;