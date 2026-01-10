import { rooms, createRoom } from "./gameManager.js";
import { startRoundReady, startNextTurn } from "./turnManager.js";
import { getPlayersWithScores } from "./utils.js";

export function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log("🟢 Client connected:", socket.id);

    // CREATE ROOM
    socket.on("create_room", ({ roomId }) => {
      if (!rooms[roomId]) {
        createRoom(roomId);
        console.log("🏠 Room created:", roomId);
      }
    });

    // CHECK ROOM EXISTS
    socket.on("check_room", ({ roomId }, callback) => {
      callback(!!rooms[roomId]);
    });

    // JOIN ROOM
    socket.on("join_room", ({ roomId, name, isHost }) => {
      if (!rooms[roomId]) createRoom(roomId);

      const room = rooms[roomId];

      const existingPlayer = room.players.find((p) => p.id === socket.id);
      if (existingPlayer) {
        console.log(
          `[server] player ${socket.id} already in room ${roomId}, skipping duplicate join`
        );
        socket.join(roomId);
        io.to(roomId).emit("players_update", getPlayersWithScores(room));
        return;
      }

      const player = {
        id: socket.id,
        name,
        isHost: isHost !== undefined ? isHost : room.players.length === 0,
        ready: false,
      };

      room.players.push(player);

      socket.join(roomId);
      io.to(roomId).emit("players_update", getPlayersWithScores(room));
      io.to(roomId).emit("room_settings", {
        roundTime: room.roundTime,
        customWords: room.customWords,
      });
    });

    // PLAYER READY
    socket.on("player_ready", ({ roomId }) => {
      const room = rooms[roomId];
      const player = room.players.find((p) => p.id === socket.id);
      player.ready = true;
      console.log(`[server] player_ready: ${player.name} in ${roomId}`);

      io.to(roomId).emit("players_update", getPlayersWithScores(room));
      io.to(roomId).emit("room_settings", {
        roundTime: room.roundTime,
        customWords: room.customWords,
      });

      const nonHostPlayers = room.players.filter((p) => !p.isHost);
      const allReady =
        nonHostPlayers.length === 0 || nonHostPlayers.every((p) => p.ready);
      if (allReady) io.to(roomId).emit("all_ready");
    });

    // SEND MESSAGE
    socket.on("send_message", ({ roomId, message }) => {
      const room = rooms[roomId];
      if (!room) return;
      const player = room.players.find((p) => p.id === socket.id);
      if (!player) return;
      io.to(roomId).emit("new_message", { senderName: player.name, message });
    });

    // HOST STARTS GAME
    socket.on("start_game", ({ roomId }) => {
      const room = rooms[roomId];
      if (!room) return;

      room.gameStarted = true;
      room.turnActive = false;

      room.drawerIndex = 0;

      room.roundReady = {};
      room.players.forEach((p) => {
        room.roundReady[p.id] = true;
      });

      // ✅ ADD THIS
      room.scores = {};
      room.guessedCorrectly = new Set();

      io.to(roomId).emit("game_started");
      startRoundReady(roomId);
    });

    // HOST UPDATES SETTINGS
    socket.on("update_settings", ({ roomId, roundTime, customWords }) => {
      const room = rooms[roomId];
      if (!room) return;

      const host = room.players[0];
      if (socket.id !== host.id) return; // only host can update

      if (roundTime) room.roundTime = Number(roundTime);

      if (Array.isArray(customWords)) {
        room.customWords = customWords.map((w) => w.trim()).filter(Boolean);
      } else if (typeof customWords === "string") {
        room.customWords = customWords
          .split(",")
          .map((w) => w.trim())
          .filter(Boolean);
      }

      io.to(roomId).emit("room_settings", {
        roundTime: room.roundTime,
        customWords: room.customWords,
      });
    });

    // PLAYER ROUND READY
    socket.on("round_ready", ({ roomId }) => {
      const room = rooms[roomId];
      if (!room || !room.gameStarted) return;

      if (room.roundReady[socket.id]) {
        const readyCountNow = Object.keys(room.roundReady).filter((id) =>
          room.players.some((p) => p.id === id)
        ).length;
        socket.emit("round_ready_update", {
          readyCount: readyCountNow,
          total: room.players.length,
          readyIds: Object.keys(room.roundReady),
        });
        console.log(
          `[server] duplicate round_ready ignored from ${socket.id} in ${roomId}`
        );
        return;
      }

      room.roundReady[socket.id] = true;
      console.log(
        `[server] round_ready from ${socket.id} in ${roomId} -> readyCount=${
          Object.keys(room.roundReady).length
        }/${room.players.length}`
      );

      const readyCount = Object.keys(room.roundReady).filter((id) =>
        room.players.some((p) => p.id === id)
      ).length;

      io.to(roomId).emit("round_ready_update", {
        readyCount,
        total: room.players.length,
        readyIds: Object.keys(room.roundReady),
      });

      if (readyCount === room.players.length) {
        setTimeout(() => {
          console.log(
            `[server] all players ready in ${roomId}, starting next turn`
          );
          startNextTurn(roomId);
        }, 100);
      }
    });

    // DRAW SYNC
    socket.on("draw", (data) => {
      socket.to(data.roomId).emit("draw", data);
    });

    // FILL (bucket) tool sync
    socket.on("fill", (data) => {
      socket.to(data.roomId).emit("fill", data);
    });

    // Canvas full-state broadcast (used for undo/restore)
    socket.on("canvas_state", ({ roomId, dataUrl }) => {
      socket.to(roomId).emit("canvas_state", dataUrl);
    });

    // Provide current room state to clients
    socket.on("request_room_state", ({ roomId }, callback) => {
      const room = rooms[roomId];
      console.log(
        `[server] request_room_state from ${socket.id} for ${roomId}`
      );
      if (!room) return callback(null);

      const drawer = room.players[room.drawerIndex];
      const hint =
        room.hintObj ??
        (room.word
          ? { type: "letters", text: room.word.replace(/[A-Z]/gi, "_") }
          : null);

      const readyIds = Object.keys(room.roundReady || {}).filter((id) =>
        room.players.some((p) => p.id === id)
      );
      const readyCount = readyIds.length;

      const payload = {
        players: room.players,
        isStarted: !!room.gameStarted,
        drawer: drawer?.id ?? null,
        drawerName: drawer?.name ?? null,
        hint,
        timeLeft: room.timeLeft ?? null,
        roundTime: room.roundTime,
        totalRounds: room.totalRounds,
        scores: room.scores || {},
        readyCount,
        readyIds,
        turnActive: !!room.turnActive,
      };

      if (drawer && socket.id === drawer.id) {
        payload.word = room.word;
      }

      callback(payload);
    });

    // CHAT + GUESS + SCORE
    socket.on("chat_message", ({ roomId, name, message }) => {
      const room = rooms[roomId];

      if (!room) return;
      const drawer = room.players[room.drawerIndex];

      if (drawer && socket.id === drawer.id) {
        io.to(roomId).emit("chat_message", { name, message });
        return;
      }

      if (!room.scores) room.scores = {};
      if (!room.guessedCorrectly) room.guessedCorrectly = new Set();

      if (message.toLowerCase() === room.word?.toLowerCase()) {
        if (room.roundOver) return;
        if (!room.scores) room.scores = {};
        if (!room.guessedCorrectly) room.guessedCorrectly = new Set();

        if (room.guessedCorrectly.has(socket.id)) return;

        room.guessedCorrectly.add(socket.id);

        room.scores[socket.id] = {
          name,
          score: (room.scores[socket.id]?.score || 0) + 10,
        };

        io.to(roomId).emit("correct_guess", {
          name,
          scores: room.scores,
        });

        const nonDrawerCount = room.players.filter(
          (p) => p.id !== drawer.id
        ).length;

        if (room.guessedCorrectly.size === nonDrawerCount) {
          room.roundOver = true;

          if (room._turnTimer) {
            clearInterval(room._turnTimer);
            room._turnTimer = null;
          }
          if (room._revealTimeout) {
            clearTimeout(room._revealTimeout);
            room._revealTimeout = null;
          }

          room.turnActive = false;
          room.drawerIndex = (room.drawerIndex + 1) % room.players.length;

          setTimeout(() => {
            room.roundOver = false;
            room.guessedCorrectly.clear();
            startNextTurn(roomId);
          }, 800);
        }

        return;
      }

      io.to(roomId).emit("chat_message", { name, message });
    });

    // DISCONNECT
    socket.on("disconnect", () => {
      for (const roomId in rooms) {
        const room = rooms[roomId];

        const disconnecting = room.players.find((p) => p.id === socket.id);
        const wasHost = !!disconnecting?.isHost;

        room.players = room.players.filter((p) => p.id !== socket.id);

        if (wasHost && room.players.length > 0) {
          room.players.forEach((p) => (p.isHost = false));
          room.players[0].isHost = true;

          io.to(roomId).emit("host_changed", {
            newHost: room.players[0].name,
            newHostId: room.players[0].id,
          });
        }

        if (room.players.length === 0) {
          delete rooms[roomId];
        } else {
          io.to(roomId).emit("players_update", getPlayersWithScores(room));
          io.to(roomId).emit("room_settings", {
            roundTime: room.roundTime,
            customWords: room.customWords,
          });
        }
      }

      console.log("🔴 Client disconnected:", socket.id);
    });
  });
}
