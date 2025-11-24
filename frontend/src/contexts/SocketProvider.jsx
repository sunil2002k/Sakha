import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [connected, setConnected] = useState(false);

  const SOCKET_SERVER_URL =
    import.meta.env.VITE_APP_URL ??
    (typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:5500");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    socketRef.current = io(SOCKET_SERVER_URL, {
      auth: { token, userId },
      transports: ["websocket", "polling"],
    });

    const socket = socketRef.current;
    socket.on("connect", () => {
      console.log("Socket connected (global):", socket.id);
      setConnected(true);
    });

    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", (err) => {
      console.error("Socket connect_error (global):", err?.message || err);
    });

    // Incoming mentor request targeted at owner — show global notification
    socket.on("mentor-request", (payload) => {
      // payload: { socketId, userId, projectId }
      const id = `${Date.now()}-${Math.random()}`;
      setNotifications((prev) => [
        {
          id,
          type: "mentor-request",
          title: "Mentorship request",
          message: `User ${payload.userId} requested mentorship on project ${payload.projectId}`,
          payload,
        },
        ...prev,
      ]);
    });

    // optional: update pending list
    socket.on("mentor-pending-list", (list) => {
      const id = `pending-${Date.now()}`;
      setNotifications((prev) => [
        {
          id,
          type: "pending-list",
          title: "Pending mentorship requests",
          message: `You have ${
            Array.isArray(list) ? list.length : 0
          } pending requests`,
          payload: list,
        },
        ...prev,
      ]);
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismissNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        connected,
        notifications,
        dismissNotification,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};