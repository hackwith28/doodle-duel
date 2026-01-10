import { io } from "socket.io-client";

export const socket = io(" https://doodle-duel-1.onrender.com
==> ", {
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
