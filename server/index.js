import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

// game state and helpers are moved into separate modules (turnManager, socketHandlers, utils)
import "./gameManager.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["polling", "websocket"],
  allowEIO3: true,
});


// Turn manager moved to ./turnManager.js
import { attachTurnManager } from "./turnManager.js";
import { registerSocketHandlers } from "./socketHandlers.js";

attachTurnManager(io);
registerSocketHandlers(io);


server.listen(4000, () => console.log("🚀 Server running on port 4000"));
