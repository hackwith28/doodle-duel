import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";

import "./gameManager.js";
import { attachTurnManager } from "./turnManager.js";
import { registerSocketHandlers } from "./socketHandlers.js";
import { socketAuthMiddleware } from "./middleware/auth.js";
import authRoutes from "./routes/auth.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://doddle-duel.netlify.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["polling", "websocket"],
  allowEIO3: true,
});

// Verify JWT on every socket connection
io.use(socketAuthMiddleware);

attachTurnManager(io);
registerSocketHandlers(io);

const PORT = process.env.PORT || 4000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
