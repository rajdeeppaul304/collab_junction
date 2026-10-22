import { io } from "socket.io-client";
import Cookies from "js-cookie";

let socket = null;

export const getSocket = () => {
  if (!socket) {
    const rawUrl = import.meta.env.VITE_API_BASE_URL || "";
    // If backend is on another origin, connect to that origin; else connect to window.location.origin
    const socketUrl = rawUrl.startsWith("http") ? rawUrl : window.location.origin;

    const token = Cookies.get("access_token");

    socket = io(socketUrl, {
      auth: { token },
      query: { token },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      autoConnect: true,
    });

    socket.on("connect", () => {
      console.log("[Socket.IO] Connected successfully with socket id:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("[Socket.IO] Disconnected:", reason);
    });

    socket.on("connect_error", (err) => {
      console.warn("[Socket.IO] Connection error:", err.message);
    });
  }

  return socket;
};

export const reconnectSocketWithToken = (token) => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  if (token) {
    Cookies.set("access_token", token);
  }
  return getSocket();
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
