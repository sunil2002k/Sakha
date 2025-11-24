import React from "react";
import { useSocket } from "../contexts/SocketProvider.jsx";

const GlobalNotification = () => {
  const { notifications, dismissNotification } = useSocket();

  if (!notifications || notifications.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 12,
        right: 12,
        zIndex: 9999,
        width: 360,
      }}
    >
      {notifications.map((n) => (
        <div
          key={n.id}
          className="bg-white/10 backdrop-blur p-3 mb-3 rounded-lg border border-white/20 text-white"
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="font-semibold">{n.title}</div>
              <div className="text-sm text-gray-200 mt-1">{n.message}</div>
            </div>
            <div className="ml-3 flex flex-col gap-2">
              {/* if mentor-request show quick actions */}
              {n.type === "mentor-request" && (
                <>
                  <button
                    onClick={() => {
                      // emit approve (true) via socket if owner wants to accept
                      const socket = window.__GLOBAL_SOCKET__ || null;
                      // if socket available via window, use it; otherwise callers can open VideoChat to approve
                      if (
                        socket &&
                        n.payload?.projectId &&
                        n.payload?.socketId
                      ) {
                        socket.emit("approve-mentor", {
                          projectId: n.payload.projectId,
                          socketId: n.payload.socketId,
                          approve: true,
                        });
                      }
                      dismissNotification(n.id);
                    }}
                    className="px-2 py-1 bg-green-600 rounded text-sm"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => {
                      const socket = window.__GLOBAL_SOCKET__ || null;
                      if (
                        socket &&
                        n.payload?.projectId &&
                        n.payload?.socketId
                      ) {
                        socket.emit("approve-mentor", {
                          projectId: n.payload.projectId,
                          socketId: n.payload.socketId,
                          approve: false,
                        });
                      }
                      dismissNotification(n.id);
                    }}
                    className="px-2 py-1 bg-red-600 rounded text-sm"
                  >
                    Reject
                  </button>
                </>
              )}
              <button
                onClick={() => dismissNotification(n.id)}
                className="px-2 py-1 bg-gray-700 rounded text-sm"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GlobalNotification;