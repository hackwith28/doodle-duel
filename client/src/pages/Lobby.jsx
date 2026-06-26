import { useState, useEffect, useRef } from "react";
import { socket } from "../socket";

const CARD = {
  background: "rgba(12,12,24,0.92)",
  backdropFilter: "blur(24px)",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 24px 48px rgba(0,0,0,0.55)",
};

function Avatar({ name, size = 40 }) {
  const colors = ["#a855f7","#ec4899","#06b6d4","#f59e0b","#10b981","#ef4444"];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  return (
    <div className="flex items-center justify-center rounded-full font-bold text-white shrink-0"
      style={{ width: size, height: size, background: color, fontSize: size * 0.4, fontFamily: "'Fredoka', sans-serif" }}>
      {name?.[0]?.toUpperCase()}
    </div>
  );
}

export default function Lobby({ player, setStage, onLeaveRoom }) {
  const [players, setPlayers] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [startError, setStartError] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);
  const [hostRoundTime, setHostRoundTime] = useState(60);
  const [hostWordsText, setHostWordsText] = useState("");
  const [isHost, setIsHost] = useState(!!player?.isHost);

  const joinedRef = useRef(false);
  const listenersRef = useRef(null);

  useEffect(() => {
    const joinRoom = () => {
      if (joinedRef.current) return;
      joinedRef.current = true;
      socket.emit("join_room", { roomId: player.roomId, isHost: player.isHost });
    };

    if (socket.connected) joinRoom();
    else socket.on("connect", joinRoom);

    if (listenersRef.current) {
      socket.off("players_update", listenersRef.current.handlePlayersUpdate);
      socket.off("all_ready", listenersRef.current.handleAllReady);
      socket.off("game_started", listenersRef.current.handleGameStarted);
      socket.off("start_failed", listenersRef.current.handleStartFailed);
      socket.off("room_settings", listenersRef.current.handleRoomSettings);
    }

    const handlePlayersUpdate = (updatedPlayers) => {
      setPlayers(updatedPlayers);
      const myPlayer = updatedPlayers.find((p) => p.id === socket?.id);
      if (myPlayer) setIsHost(myPlayer.isHost);
    };

    const handleAllReady = () => {
      setInfoMessage("All players ready! Starting game...");
      if (player.isHost) socket.emit("start_game", { roomId: player.roomId });
    };

    const handleGameStarted = () => setStage("game");

    const handleStartFailed = (data) => {
      setStartError(data.message);
      setTimeout(() => setStartError(null), 3000);
    };

    const handleRoomSettings = (settings) => {
      setHostRoundTime(settings.roundTime);
      setHostWordsText(settings.customWords.join(", "));
    };

    listenersRef.current = { handlePlayersUpdate, handleAllReady, handleGameStarted, handleStartFailed, handleRoomSettings };

    socket.on("players_update", handlePlayersUpdate);
    socket.on("all_ready", handleAllReady);
    socket.on("game_started", handleGameStarted);
    socket.on("start_failed", handleStartFailed);
    socket.on("room_settings", handleRoomSettings);

    return () => {
      socket.off("players_update", handlePlayersUpdate);
      socket.off("all_ready", handleAllReady);
      socket.off("game_started", handleGameStarted);
      socket.off("start_failed", handleStartFailed);
      socket.off("room_settings", handleRoomSettings);
    };
  }, []);

  const markReady = () => {
    socket.emit("player_ready", { roomId: player.roomId });
    setIsReady(true);
  };

  const startGame = () => socket.emit("start_game", { roomId: player.roomId });

  const saveSettings = () => {
    socket.emit("update_settings", {
      roomId: player.roomId,
      roundTime: Number(hostRoundTime),
      customWords: hostWordsText.split(",").map((w) => w.trim()).filter(Boolean),
    });
    setInfoMessage("Settings saved!");
    setTimeout(() => setInfoMessage(null), 2000);
  };

  const nonHostPlayers = players.filter((p) => !p.isHost);
  const allReady = nonHostPlayers.length > 0 && nonHostPlayers.every((p) => p.ready);
  const notEnoughPlayers = players.length < 2;

  const inputCls = "w-full py-3 px-4 rounded-xl font-semibold text-sm text-white placeholder:text-slate-600 outline-none transition-all duration-200 bg-white/6 border border-white/10 focus:border-fuchsia-400/50";

  return (
    <div className="min-h-screen w-screen overflow-y-auto relative bg-[#0a0a14]">
      {/* Ambient glows */}
      <div className="fixed pointer-events-none" style={{ top: "-100px", left: "-100px", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(168,85,247,0.22) 0%, transparent 70%)", filter: "blur(60px)" }} />
      <div className="fixed pointer-events-none" style={{ bottom: "-80px", right: "-80px", width: "420px", height: "420px", background: "radial-gradient(circle, rgba(6,182,212,0.18) 0%, transparent 70%)", filter: "blur(60px)" }} />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onLeaveRoom}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95 group"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#64748b" }}
          >
            <span className="group-hover:text-fuchsia-400 transition-colors">←</span>
            <span className="group-hover:text-slate-300 transition-colors hidden sm:block">Leave</span>
          </button>

          <div className="text-center">
            <h1 className="font-bold text-white font-fredoka mb-1" style={{ fontSize: "2.4rem" }}>
              Game <span style={{ color: "#e879f9" }}>Lobby</span>
            </h1>
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-sm font-bold" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <span style={{ color: "#67e8f9" }}>Room:</span>
              <span className="text-white tracking-widest font-black">{player.roomId}</span>
            </div>
          </div>

          {/* Spacer to balance the leave button */}
          <div className="w-20 hidden sm:block" />
          <div className="w-10 sm:hidden" />
        </div>

        {/* Players section */}
        <div className="rounded-2xl p-6 mb-5" style={CARD}>
          <div className="flex items-center gap-2 mb-5">
            <span className="text-lg">👥</span>
            <h2 className="text-white font-black text-lg">Players in Room</h2>
            <span className="ml-auto text-xs font-black px-2.5 py-1 rounded-full" style={{ background: "linear-gradient(135deg, #ec4899, #a855f7)", color: "#fff" }}>
              {players.length}
            </span>
          </div>

          {players.length === 0 ? (
            <p className="text-slate-600 text-sm text-center py-4">Waiting for players to join...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {players.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 rounded-xl p-3 transition-all duration-200 animate-slide-in-up"
                  style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${p.isHost ? "rgba(251,191,36,0.25)" : "rgba(255,255,255,0.07)"}`, animationDelay: `${i * 0.06}s` }}>
                  <Avatar name={p.name} size={40} />
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-bold text-sm truncate">{p.name}</div>
                    <div className="mt-0.5">
                      {p.isHost ? (
                        <span className="text-xs font-black px-2 py-0.5 rounded-full" style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)" }}>
                          👑 HOST
                        </span>
                      ) : p.ready ? (
                        <span className="text-xs font-black px-2 py-0.5 rounded-full" style={{ background: "rgba(34,197,94,0.15)", color: "#86efac", border: "1px solid rgba(34,197,94,0.3)" }}>
                          ✓ READY
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-600">Waiting...</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* HOST CONTROLS */}
        {isHost && (
          <div className="rounded-2xl p-6 mb-5" style={{ ...CARD, border: "1px solid rgba(251,191,36,0.2)" }}>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xl">👑</span>
              <h2 className="font-black font-fredoka text-white" style={{ fontSize: "1.4rem" }}>
                Host <span style={{ color: "#fbbf24" }}>Controls</span>
              </h2>
            </div>

            {startError && (
              <div className="rounded-xl px-4 py-3 text-sm font-semibold mb-4" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}>
                ⚠️ {startError}
              </div>
            )}
            {infoMessage && (
              <div className="rounded-xl px-4 py-3 text-sm font-semibold mb-4" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "#86efac" }}>
                ✓ {infoMessage}
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1.5 text-slate-500">
                  ⏱ Round Time (seconds)
                </label>
                <input
                  type="number" min="10" max="180" value={hostRoundTime}
                  onChange={(e) => setHostRoundTime(e.target.value)}
                  className={inputCls}
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1.5 text-slate-500">
                  📝 Custom Words (comma separated)
                </label>
                <textarea
                  value={hostWordsText}
                  onChange={(e) => setHostWordsText(e.target.value)}
                  placeholder="cat, mountain, guitar, pizza, rainbow..."
                  rows={3}
                  className={`${inputCls} resize-none`}
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                />
              </div>

              <button
                onClick={saveSettings}
                className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)", boxShadow: "0 6px 20px rgba(16,185,129,0.3)" }}
              >
                💾 Save Settings
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={startGame}
                disabled={!allReady || notEnoughPlayers}
                className="py-4 px-12 rounded-2xl font-black text-white text-lg transition-all duration-200 hover:scale-[1.05] active:scale-[0.97] disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed mb-3"
                style={{ background: "linear-gradient(135deg, #ec4899 0%, #a855f7 100%)", boxShadow: "0 8px 28px rgba(236,72,153,0.4)", fontFamily: "'Fredoka', sans-serif", letterSpacing: "0.05em" }}
              >
                🚀 START GAME
              </button>
              <p className="text-sm font-semibold">
                {notEnoughPlayers ? (
                  <span style={{ color: "#fbbf24" }}>Need at least 2 players to start</span>
                ) : allReady ? (
                  <span style={{ color: "#86efac" }} className="animate-pulse">Everyone is ready — let's go!</span>
                ) : (
                  <span className="text-slate-600">Waiting for all players to click I'M READY...</span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* PLAYER READY */}
        {!isHost && (
          <div className="rounded-2xl p-8 text-center" style={{ ...CARD, border: "1px solid rgba(6,182,212,0.2)" }}>
            {!isReady ? (
              <>
                <div className="text-5xl mb-4 animate-bounce" style={{ animationDuration: "2s" }}>🎨</div>
                <p className="text-slate-500 text-sm font-semibold mb-5">Click when you're ready to start!</p>
                <button
                  onClick={markReady}
                  className="py-4 px-12 rounded-2xl font-black text-white text-lg transition-all duration-200 hover:scale-[1.06] active:scale-[0.97]"
                  style={{ background: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)", boxShadow: "0 8px 28px rgba(16,185,129,0.35)", fontFamily: "'Fredoka', sans-serif", letterSpacing: "0.05em" }}
                >
                  ✓ I'M READY!
                </button>
              </>
            ) : (
              <div className="space-y-3">
                <div className="text-4xl animate-bounce" style={{ animationDuration: "1.5s" }}>⏳</div>
                <p className="font-black text-lg animate-pulse" style={{ color: "#67e8f9", fontFamily: "'Fredoka', sans-serif" }}>
                  Waiting for host to start...
                </p>
                <p className="text-sm text-slate-600 font-semibold">
                  The host will start the game when everyone is ready!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
