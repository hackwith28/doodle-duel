import { rooms, pickWord } from "./gameManager.js";
import { getPlayersWithScores } from "./utils.js";

let io = null;

export function attachTurnManager(ioInstance) {
  io = ioInstance;
}

export function startRoundReady(roomId) {
  const room = rooms[roomId];
  if (!room || !room.players.length) return;

  room.roundReady = {}; // reset ready status

  for (const p of room.players) {
    if (p.isHost || p.ready) {
      room.roundReady[p.id] = true;
    }
  }

  const readyIdsNow = Object.keys(room.roundReady).filter((id) =>
    room.players.some((p) => p.id === id)
  );
  console.log(
    `[server] startRoundReady room=${roomId} readyCount=${readyIdsNow.length}/${
      room.players.length
    } readyIds=${readyIdsNow.join(",")}`
  );

  // Broadcast a progress update so clients can show how many are ready
  io.to(roomId).emit("round_ready_update", {
    readyCount: readyIdsNow.length,
    total: room.players.length,
    readyIds: readyIdsNow,
  });

  io.to(roomId).emit("round_start"); // tell clients to show ready screen

  if (readyIdsNow.length === room.players.length) {
    setTimeout(() => {
      console.log(`[server] all ready in room=${roomId}, auto-starting turn`);
      startNextTurn(roomId);
    }, 100);
  }
}

export async function startNextTurn(roomId) {
  const room = rooms[roomId];
  if (!room || !room.players.length) return;
  if (room.drawerIndex >= room.players.length) {
    room.drawerIndex = 0;
  }

  if (room.turnActive) {
    console.log("[server] startNextTurn BLOCKED (already active)");
    return;
  }

  room.turnActive = true;
  room.roundOver = false;
  room.guessedCorrectly = new Set();

  if (room._turnTimer) {
    clearInterval(room._turnTimer);
    room._turnTimer = null;
  }
  if (room._revealTimeout) {
    clearTimeout(room._revealTimeout);
    room._revealTimeout = null;
  }

  const drawer = room.players[room.drawerIndex];

  room.word = await pickWord(room);
  if (typeof room.word !== "string") {
    console.error("[server] Invalid word picked:", room.word);
    room.word = "apple";
  }

  console.log(
    `[server] startNextTurn: room=${roomId} drawer=${drawer?.name} word=${room.word}`
  );

  // drawer gets full word
  io.to(drawer.id).emit("drawer_word", room.word);

  // others get blanks
  const hint = room.word.replace(/[A-Z]/gi, "_");
  room.hintObj = { type: "letters", text: hint };

  io.to(roomId).emit("turn_start", {
    drawer: drawer.id,
    drawerName: drawer.name,
    hint,
  });

  io.to(roomId).emit("players_update", getPlayersWithScores(room));

  const initialRound = Number(room.roundTime) || 60;
  let timeLeft = initialRound;
  room.timeLeft = timeLeft;

  io.to(roomId).emit("timer_update", timeLeft);

  const revealAfterMs =
    initialRound > 2 ? Math.floor(initialRound * 0.75) * 1000 : null;

  console.log(
    `[server] startNextTurn room=${roomId} round=${initialRound}s revealAfterMs=${revealAfterMs}`
  );

  if (revealAfterMs) {
    room._revealTimeout = setTimeout(() => {
      if (!room.turnActive) return;

      const word = room.word || "";
      let hint = word.replace(/[A-Z]/gi, "_");

      const letterIndices = [];
      for (let i = 0; i < word.length; i++) {
        if (/[A-Za-z]/.test(word[i])) letterIndices.push(i);
      }

      let revealCount = Math.min(3, letterIndices.length);
      if (revealCount >= 2) revealCount = 2;

      for (let i = letterIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [letterIndices[i], letterIndices[j]] = [
          letterIndices[j],
          letterIndices[i],
        ];
      }

      hint = hint.split("");
      for (const idx of letterIndices.slice(0, revealCount)) {
        hint[idx] = word[idx];
      }
      hint = hint.join("");

      const wordCount =
        word.trim().length === 0 ? 0 : word.trim().split(/\s+/).length;

      const hintObj = {
        type: "word-count",
        count: wordCount,
        text: `${wordCount} ${wordCount === 1 ? "word" : "words"}`,
      };

      room.hintObj = hintObj;
      io.to(roomId).emit("reveal_hint", hintObj);
    }, revealAfterMs);
  }

  const timer = setInterval(() => {
    timeLeft--;
    room.timeLeft = timeLeft;
    io.to(roomId).emit("timer_update", timeLeft);

    if (timeLeft <= 0) {
      clearInterval(timer);
      room._turnTimer = null;

      if (room._revealTimeout) {
        clearTimeout(room._revealTimeout);
        room._revealTimeout = null;
      }

      io.to(roomId).emit("round_end");

      room.turnActive = false;

      room.drawerIndex = (room.drawerIndex + 1) % room.players.length;

      startNextTurn(roomId);
    }
  }, 1000);

  room._turnTimer = timer;
}
