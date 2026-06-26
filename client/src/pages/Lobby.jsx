import { useState, useEffect, useRef } from "react";
import { socket } from "../socket";

export default function Lobby({ player, setStage }) {
  const [players, setPlayers] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [startError, setStartError] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);
  const [roomSettings, setRoomSettings] = useState({
    roundTime: 60,
    customWords: [],
  });

  const [hostRoundTime, setHostRoundTime] = useState(60);
  const [hostWordsText, setHostWordsText] = useState("");
  const [isHost, setIsHost] = useState(!!player?.isHost);

  const joinedRef = useRef(false);
  const listenersRef = useRef(null);

  const clientId = socket?.id;

  useEffect(() => {
    const joinRoom = () => {
      if (joinedRef.current) return;
      joinedRef.current = true;

      // Join the room
      socket.emit("join_room", {
        roomId: player.roomId,
        isHost: player.isHost,
      });
    };

    if (socket.connected) {
      joinRoom();
    } else {
      socket.on("connect", joinRoom);
    }

    // Remove old listeners if they exist
    if (listenersRef.current) {
      socket.off("players_update", listenersRef.current.handlePlayersUpdate);
      socket.off("all_ready", listenersRef.current.handleAllReady);
      socket.off("game_started", listenersRef.current.handleGameStarted);
      socket.off("start_failed", listenersRef.current.handleStartFailed);
      socket.off("room_settings", listenersRef.current.handleRoomSettings);
    }

    // Listen for player updates
    const handlePlayersUpdate = (updatedPlayers) => {
      setPlayers(updatedPlayers);
      const myPlayer = updatedPlayers.find((p) => p.id === socket?.id);
      if (myPlayer) setIsHost(myPlayer.isHost);
    };

    // Listen for all players ready
    const handleAllReady = () => {
      setInfoMessage("All players ready! Starting game...");

      // ✅ Use socket.id + authoritative server role
      if (player.isHost) {
        socket.emit("start_game", { roomId: player.roomId });
      }
    };

    // Listen for game start
    const handleGameStarted = () => {
      setStage("game");
    };

    // Listen for start failed
    const handleStartFailed = (data) => {
      setStartError(data.message);
      setTimeout(() => setStartError(null), 3000);
    };

    // Listen for room settings
    const handleRoomSettings = (settings) => {
      setRoomSettings(settings);
      setHostRoundTime(settings.roundTime);
      setHostWordsText(settings.customWords.join(", "));
    };

    // Store listeners for cleanup
    listenersRef.current = {
      handlePlayersUpdate,
      handleAllReady,
      handleGameStarted,
      handleStartFailed,
      handleRoomSettings,
    };

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

  const startGame = () => {
    socket.emit("start_game", { roomId: player.roomId });

    // 👉 Switch to game instantly for host
  };

  const saveSettings = () => {
    socket.emit("update_settings", {
      roomId: player.roomId,
      roundTime: Number(hostRoundTime),
      customWords: hostWordsText
        .split(",")
        .map((w) => w.trim())
        .filter(Boolean),
    });

    setInfoMessage("Settings saved!");
    setTimeout(() => setInfoMessage(null), 2000);
  };

  return (
    <div className="w-screen min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Animated floating doodles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-10 left-10 text-6xl opacity-10 animate-bounce"
          style={{ animationDuration: "3s" }}
        >
          ✏️
        </div>
        <div
          className="absolute top-20 right-20 text-5xl opacity-10 animate-bounce"
          style={{ animationDuration: "4s", animationDelay: "0.5s" }}
        >
          🖍️
        </div>
        <div
          className="absolute bottom-20 left-20 text-7xl opacity-10 animate-bounce"
          style={{ animationDuration: "3.5s", animationDelay: "1s" }}
        >
          🎨
        </div>
        <div
          className="absolute bottom-10 right-10 text-6xl opacity-10 animate-bounce"
          style={{ animationDuration: "4.5s", animationDelay: "1.5s" }}
        >
          🖌️
        </div>
        <div
          className="absolute top-1/2 left-1/4 text-5xl opacity-10 animate-bounce"
          style={{ animationDuration: "3.8s", animationDelay: "0.8s" }}
        >
          ✨
        </div>
        <div
          className="absolute top-1/3 right-1/3 text-4xl opacity-10 animate-bounce"
          style={{ animationDuration: "4.2s", animationDelay: "1.2s" }}
        >
          🌈
        </div>
      </div>

      {/* Colorful gradient orbs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-pink-500/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
      <div
        className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-yellow-500/20 to-transparent rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="absolute top-1/2 right-1/4 w-72 h-72 bg-gradient-to-br from-cyan-500/15 to-transparent rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>

      <div className="relative z-10 p-6 md:p-8 min-h-screen overflow-y-auto max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="flex justify-center items-center gap-2 mb-4">
            <span
              className="text-5xl md:text-6xl animate-bounce"
              style={{ animationDuration: "2s" }}
            >
              🎭
            </span>
            <span
              className="text-5xl md:text-6xl animate-bounce"
              style={{ animationDuration: "2s", animationDelay: "0.2s" }}
            >
              ✨
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-3">
            <span className="bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent drop-shadow-lg">
              GAME LOBBY
            </span>
          </h2>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl border-2 border-white/30 rounded-full px-6 py-2">
            <span className="text-yellow-300 text-xl">🚪</span>
            <span className="text-white/80 font-bold">Room:</span>
            <span className="text-white font-black text-lg tracking-wider">
              {player.roomId}
            </span>
          </div>
        </div>

        {/* Players Grid */}
        <div className="bg-white/10 backdrop-blur-2xl border-4 border-pink-400/50 rounded-3xl p-6 md:p-8 mb-6 md:mb-8 shadow-2xl transform hover:scale-[1.01] transition-all duration-300">
          {/* Decorative dots */}
          <div className="absolute top-6 left-6 w-3 h-3 bg-yellow-400 rounded-full"></div>
          <div className="absolute top-6 right-6 w-3 h-3 bg-pink-400 rounded-full"></div>
          <div className="absolute bottom-6 left-6 w-3 h-3 bg-cyan-400 rounded-full"></div>
          <div className="absolute bottom-6 right-6 w-3 h-3 bg-green-400 rounded-full"></div>

          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="text-3xl">👥</span>
            <h3 className="text-2xl md:text-3xl font-black text-white">
              Players in Room
            </h3>
            <span className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-black text-lg px-4 py-1 rounded-full">
              {players.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.map((p, index) => (
              <div
                key={p.id}
                className={`relative bg-gradient-to-br ${
                  p.isHost
                    ? "from-yellow-400/20 via-orange-400/20 to-pink-400/20 border-yellow-400"
                    : "from-cyan-400/20 via-blue-400/20 to-purple-400/20 border-cyan-400"
                } border-3 rounded-2xl p-5 backdrop-blur-xl shadow-lg transform hover:scale-105 hover:rotate-1 transition-all duration-300`}
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="text-4xl animate-bounce"
                    style={{
                      animationDuration: "2s",
                      animationDelay: `${index * 0.2}s`,
                    }}
                  >
                    {p.isHost ? "👑" : "🎨"}
                  </div>
                  <div className="flex-1">
                    <div className="font-black text-white text-lg mb-1">
                      {p.name}
                    </div>
                    <div className="flex items-center gap-2">
                      {p.isHost ? (
                        <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-black text-xs px-3 py-1 rounded-full">
                          HOST
                        </span>
                      ) : p.ready ? (
                        <span className="bg-gradient-to-r from-green-400 to-emerald-400 text-black font-black text-xs px-3 py-1 rounded-full flex items-center gap-1">
                          <span>✓</span> READY
                        </span>
                      ) : (
                        <span className="bg-white/20 text-white/70 font-bold text-xs px-3 py-1 rounded-full">
                          Waiting...
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* HOST CONTROLS */}
        {isHost && (
          <div className="bg-gradient-to-br from-yellow-400/10 via-orange-400/10 to-pink-400/10 backdrop-blur-2xl border-4 border-yellow-400/50 rounded-3xl p-6 md:p-8 mb-6 md:mb-8 relative shadow-2xl">
            <div className="absolute top-6 left-6 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
            <div className="absolute top-6 right-6 w-3 h-3 bg-pink-400 rounded-full animate-pulse"></div>
            <div className="absolute bottom-6 left-6 w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
            <div className="absolute bottom-6 right-6 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>

            <div className="text-center mb-8">
              <div className="text-5xl mb-3 animate-bounce">👑</div>
              <h3 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                HOST CONTROLS
              </h3>
            </div>

            {/* Error/Info Messages */}
            {startError && (
              <div className="bg-red-500/20 border-3 border-red-400 rounded-2xl p-4 mb-6 backdrop-blur-xl">
                <div className="flex items-center justify-center gap-2 text-red-300 font-black text-base">
                  <span className="text-2xl">⚠️</span>
                  <span>{startError}</span>
                </div>
              </div>
            )}

            {infoMessage && (
              <div className="bg-green-500/20 border-3 border-green-400 rounded-2xl p-4 mb-6 backdrop-blur-xl animate-pulse">
                <div className="flex items-center justify-center gap-2 text-green-300 font-black text-base">
                  <span className="text-2xl">✓</span>
                  <span>{infoMessage}</span>
                </div>
              </div>
            )}

            {/* Settings Form */}
            <div className="space-y-6 mb-8">
              <div>
                <label className="flex items-center gap-2 text-white font-black mb-3 text-sm tracking-wide">
                  <span className="text-xl">⏰</span>
                  <span className="text-yellow-300">ROUND TIME (SECONDS)</span>
                </label>
                <input
                  type="number"
                  min="10"
                  max="180"
                  value={hostRoundTime}
                  onChange={(e) => setHostRoundTime(e.target.value)}
                  className="w-full py-4 px-5 bg-white/15 border-3 border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 focus:bg-white/20 focus:ring-4 focus:ring-yellow-400/20 transition-all duration-200 text-lg font-bold"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-white font-black mb-3 text-sm tracking-wide">
                  <span className="text-xl">📝</span>
                  <span className="text-pink-300">
                    CUSTOM WORDS (COMMA SEPARATED)
                  </span>
                </label>
                <textarea
                  value={hostWordsText}
                  onChange={(e) => setHostWordsText(e.target.value)}
                  placeholder="cat, mountain, guitar, pizza, rainbow..."
                  rows={4}
                  className="w-full py-4 px-5 bg-white/15 border-3 border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-pink-400 focus:bg-white/20 focus:ring-4 focus:ring-pink-400/20 transition-all duration-200 resize-none text-base font-semibold"
                />
              </div>

              <button
                onClick={saveSettings}
                className="w-full bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 hover:from-green-300 hover:via-emerald-300 hover:to-teal-300 text-black font-black text-lg py-4 px-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white/30"
              >
                <span className="flex items-center justify-center gap-2">
                  <span className="text-xl">💾</span>
                  SAVE SETTINGS
                </span>
              </button>
            </div>

            {/* Start Game Button */}
            {(() => {
              const nonHostPlayers = players.filter((p) => !p.isHost);
              const allReady =
                nonHostPlayers.length > 0 &&
                nonHostPlayers.every((p) => p.ready);
              const notEnoughPlayers = players.length < 2;

              return (
                <div className="text-center">
                  <button
                    onClick={startGame}
                    disabled={!allReady || notEnoughPlayers}
                    className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 hover:from-pink-300 hover:via-purple-300 hover:to-indigo-300 disabled:from-gray-600 disabled:to-gray-700 text-black font-black py-5 px-12 rounded-2xl text-xl shadow-lg hover:shadow-2xl disabled:shadow-none transform hover:scale-110 active:scale-95 disabled:scale-100 transition-all duration-200 border-3 border-white/30 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                  >
                    <span className="flex items-center justify-center gap-3">
                      <span className="text-2xl">🚀</span>
                      START GAME!
                    </span>
                  </button>

                  <p className="text-white/80 font-bold text-base">
                    {notEnoughPlayers ? (
                      <span className="flex items-center justify-center gap-2 text-yellow-300">
                        <span className="text-xl">👥</span>
                        Need at least 2 players to start!
                      </span>
                    ) : allReady ? (
                      <span className="flex items-center justify-center gap-2 text-green-300 animate-pulse">
                        <span className="text-xl">✓</span>
                        Everyone is ready! Let's go!
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <span className="text-xl">⏳</span>
                        Waiting for all players to click I'M READY...
                      </span>
                    )}
                  </p>
                </div>
              );
            })()}
          </div>
        )}

        {/* PLAYER READY BUTTON */}
        {!isHost && (
          <div className="bg-gradient-to-br from-cyan-400/10 via-blue-400/10 to-purple-400/10 backdrop-blur-2xl border-4 border-cyan-400/50 rounded-3xl p-8 relative shadow-2xl">
            <div className="absolute top-6 left-6 w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
            <div className="absolute top-6 right-6 w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
            <div className="absolute bottom-6 left-6 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="absolute bottom-6 right-6 w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>

            <div className="text-center">
              <div className="text-5xl mb-6 animate-bounce">🎨</div>
              {!isReady ? (
                <>
                  <button
                    onClick={markReady}
                    className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 hover:from-green-300 hover:via-emerald-300 hover:to-teal-300 text-black font-black py-5 px-12 rounded-2xl text-xl shadow-lg hover:shadow-2xl transform hover:scale-110 active:scale-95 transition-all duration-200 border-3 border-white/30 mb-4"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span className="text-2xl">✓</span>
                      I'M READY!
                    </span>
                  </button>
                  <p className="text-white/70 font-bold text-sm">
                    Click when you're ready to start!
                  </p>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="text-green-300 font-black text-2xl animate-pulse flex items-center justify-center gap-3">
                    <span className="text-3xl">⏳</span>
                    <span>Waiting for host...</span>
                  </div>
                  <p className="text-white/60 font-semibold">
                    The host will start the game when everyone is ready!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-white/40 text-sm font-bold">
            Get ready to draw and guess!{" "}
            <span className="text-pink-400 animate-pulse">✏️</span>
          </p>
        </div>
      </div>
    </div>
  );
}
