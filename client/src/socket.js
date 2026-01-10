import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_SOCKET_URL, {
  transports: ["websocket"],
  reconnection: true,
  autoConnect: true,
});

socket.on("connect", () => {
  console.log("🟢 Connected to server", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("🔴 Socket connection failed:", err.message);
});
