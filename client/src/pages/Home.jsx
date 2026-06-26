import { useState } from "react";
import { socket } from "../socket";

export default function Home({ setPlayer, username, onLogout }) {
  const [roomId, setRoomId] = useState("");
  const [showRoomCreated, setShowRoomCreated] = useState(false);

  // Create a new room
  const createRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(newRoomId);
    setShowRoomCreated(true);
    setTimeout(() => setShowRoomCreated(false), 3000);

    const playerData = { name: username, roomId: newRoomId, isHost: true };
    socket.emit("create_room", { roomId: newRoomId });
    setPlayer(playerData);
    localStorage.setItem("player", JSON.stringify(playerData));
    localStorage.setItem("playerTimestamp", Date.now().toString());
  };

  // Join an existing room
  const joinRoom = () => {
    if (!roomId.trim()) {
      alert("✏️ Please enter a room code!");
      return;
    }

    const playerData = { name: username, roomId: roomId.trim(), isHost: false };
    setPlayer(playerData);
    localStorage.setItem("player", JSON.stringify(playerData));
    localStorage.setItem("playerTimestamp", Date.now().toString());
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 flex items-center justify-center relative overflow-hidden">
      {/* Animated floating doodles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-10 left-10 text-6xl opacity-20 animate-bounce"
          style={{ animationDuration: "3s" }}
        >
          ✏️
        </div>
        <div
          className="absolute top-20 right-20 text-5xl opacity-20 animate-bounce"
          style={{ animationDuration: "4s", animationDelay: "0.5s" }}
        >
          🖍️
        </div>
        <div
          className="absolute bottom-20 left-20 text-7xl opacity-20 animate-bounce"
          style={{ animationDuration: "3.5s", animationDelay: "1s" }}
        >
          🎨
        </div>
        <div
          className="absolute bottom-10 right-10 text-6xl opacity-20 animate-bounce"
          style={{ animationDuration: "4.5s", animationDelay: "1.5s" }}
        >
          🖌️
        </div>
        <div
          className="absolute top-1/2 left-1/4 text-5xl opacity-20 animate-bounce"
          style={{ animationDuration: "3.8s", animationDelay: "0.8s" }}
        >
          ✨
        </div>
        <div
          className="absolute top-1/3 right-1/3 text-4xl opacity-20 animate-bounce"
          style={{ animationDuration: "4.2s", animationDelay: "1.2s" }}
        >
          🌈
        </div>
      </div>

      {/* Colorful gradient orbs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-pink-500/30 to-transparent rounded-full blur-3xl animate-pulse"></div>
      <div
        className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-yellow-500/30 to-transparent rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="absolute top-1/2 right-1/4 w-72 h-72 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>

      {/* Main card container */}
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-white/10 backdrop-blur-2xl border-4 border-white/20 rounded-3xl p-8 shadow-2xl transform hover:scale-[1.02] transition-transform duration-300">
          {/* Decorative corner dots */}
          <div className="absolute top-4 left-4 w-3 h-3 bg-yellow-400 rounded-full"></div>
          <div className="absolute top-4 right-4 w-3 h-3 bg-pink-400 rounded-full"></div>
          <div className="absolute bottom-4 left-4 w-3 h-3 bg-cyan-400 rounded-full"></div>
          <div className="absolute bottom-4 right-4 w-3 h-3 bg-green-400 rounded-full"></div>

          {/* Header section */}
          <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-2 mb-4">
              <span
                className="text-6xl animate-bounce"
                style={{ animationDuration: "2s" }}
              >
                🎨
              </span>
              <span
                className="text-6xl animate-bounce"
                style={{ animationDuration: "2s", animationDelay: "0.2s" }}
              >
                ✏️
              </span>
              <span
                className="text-6xl animate-bounce"
                style={{ animationDuration: "2s", animationDelay: "0.4s" }}
              >
                🖍️
              </span>
            </div>

            <h1 className="text-5xl font-black mb-3 tracking-tight">
              <span className="bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent drop-shadow-lg">
                Doodle Duel
              </span>
            </h1>

            <div className="flex items-center justify-center gap-3 text-white/90 text-lg font-bold">
              <span className="flex items-center gap-1">
                <span className="text-yellow-300">✏️</span> Draw
              </span>
              <span className="text-pink-300">•</span>
              <span className="flex items-center gap-1">
                <span className="text-pink-300">🤔</span> Guess
              </span>
              <span className="text-cyan-300">•</span>
              <span className="flex items-center gap-1">
                <span className="text-cyan-300">🏆</span> Win
              </span>
            </div>
          </div>

          {/* Room created notification */}
          {showRoomCreated && (
            <div className="mb-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-400 rounded-2xl p-4 animate-pulse">
              <div className="flex items-center justify-center gap-2 text-green-300 font-black text-lg">
                <span className="text-2xl">✓</span>
                <span>Room Created: </span>
                <span className="text-yellow-300 text-xl">{roomId}</span>
              </div>
            </div>
          )}

          {/* Logged-in user banner */}
          <div className="flex items-center justify-between bg-white/10 border-2 border-white/20 rounded-2xl px-4 py-3 mb-6">
            <span className="text-white font-bold text-sm">
              👤 <span className="text-yellow-300">{username}</span>
            </span>
            <button
              onClick={onLogout}
              className="text-white/50 hover:text-red-400 text-xs font-black uppercase tracking-wider transition-colors duration-200"
            >
              Logout
            </button>
          </div>

          {/* Room code input */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-white font-bold mb-2 text-sm tracking-wide">
              <span className="text-xl">🚪</span>
              <span className="text-pink-300">ROOM CODE</span>
            </label>
            <input
              type="text"
              className="w-full py-4 px-5 bg-white/15 border-3 border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-pink-400 focus:bg-white/20 focus:ring-4 focus:ring-pink-400/20 transition-all duration-200 text-lg font-bold uppercase tracking-widest"
              placeholder="Enter room code to join..."
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              maxLength={6}
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={createRoom}
              className="flex-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 hover:from-yellow-300 hover:via-orange-300 hover:to-pink-300 text-black font-black text-lg py-4 px-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white/30"
            >
              <span className="flex items-center justify-center gap-2">
                <span className="text-xl">✨</span>
                CREATE
              </span>
            </button>

            <button
              onClick={joinRoom}
              disabled={!roomId.trim()}
              className="flex-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 hover:from-cyan-300 hover:via-blue-300 hover:to-purple-300 disabled:from-gray-600 disabled:to-gray-700 text-black font-black text-lg py-4 px-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 border-2 border-white/30"
            >
              <span className="flex items-center justify-center gap-2">
                <span className="text-xl">🚀</span>
                JOIN
              </span>
            </button>
          </div>

          {/* Divider with instruction */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-dashed border-white/20"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-gradient-to-r from-purple-900 to-indigo-900 px-4 py-2 rounded-full text-white/80 text-xs font-bold uppercase tracking-wider border-2 border-white/20">
                🎮 Ready to Play?
              </span>
            </div>
          </div>

          {/* Footer tip */}
          <div className="text-center">
            <p className="text-white/60 text-sm font-semibold">
              💡 <span className="text-yellow-300">Tip:</span> Create a room or
              enter an existing code to start!
            </p>
          </div>
        </div>

        {/* Playful footer text */}
        <div className="text-center mt-6">
          <p className="text-white/40 text-sm font-bold">
            Made with <span className="text-pink-400 animate-pulse">❤️</span>{" "}
            for doodle lovers
          </p>
        </div>
      </div>
    </div>
  );
}
