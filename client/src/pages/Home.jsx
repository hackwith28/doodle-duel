import { useState } from "react";
import { socket } from "../socket";

const CARD = {
  background: "rgba(12,12,24,0.92)",
  backdropFilter: "blur(24px)",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 32px 64px rgba(0,0,0,0.6)",
};

export default function Home({ setPlayer, username, onLogout }) {
  const [roomId, setRoomId] = useState("");
  const [notification, setNotification] = useState(null);

  const createRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(newRoomId);
    setNotification(`Room ${newRoomId} created!`);
    setTimeout(() => setNotification(null), 3000);

    const playerData = { name: username, roomId: newRoomId, isHost: true };
    socket.emit("create_room", { roomId: newRoomId });
    setPlayer(playerData);
    localStorage.setItem("player", JSON.stringify(playerData));
    localStorage.setItem("playerTimestamp", Date.now().toString());
  };

  const joinRoom = () => {
    if (!roomId.trim()) {
      alert("Please enter a room code!");
      return;
    }
    const playerData = { name: username, roomId: roomId.trim(), isHost: false };
    setPlayer(playerData);
    localStorage.setItem("player", JSON.stringify(playerData));
    localStorage.setItem("playerTimestamp", Date.now().toString());
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center overflow-hidden relative bg-[#0a0a14]">
      {/* Ambient glows */}
      <div className="absolute pointer-events-none" style={{ top: "-80px", left: "-80px", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(168,85,247,0.25) 0%, transparent 70%)", filter: "blur(50px)" }} />
      <div className="absolute pointer-events-none" style={{ bottom: "-80px", right: "-80px", width: "440px", height: "440px", background: "radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)", filter: "blur(50px)" }} />
      <div className="absolute pointer-events-none" style={{ top: "35%", right: "20%", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)", filter: "blur(40px)" }} />

      {/* Floating doodles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {[
          ["✏️", { top: "8%", left: "4%" }, "3.5s", "0s"],
          ["🎨", { top: "12%", right: "7%" }, "4s", "0.5s"],
          ["🖌️", { bottom: "16%", left: "5%" }, "3.8s", "1s"],
          ["🏆", { bottom: "8%", right: "4%" }, "4.2s", "0.3s"],
          ["🎯", { top: "50%", left: "2%" }, "3.2s", "0.8s"],
          ["⭐", { top: "30%", right: "3%" }, "4.5s", "1.3s"],
        ].map(([icon, pos, dur, delay], i) => (
          <div key={i} className="absolute text-2xl opacity-[0.15] animate-bounce" style={{ ...pos, animationDuration: dur, animationDelay: delay }}>
            {icon}
          </div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-sm mx-4 animate-slide-in-up">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="font-bold text-white leading-none mb-2 font-fredoka" style={{ fontSize: "3.8rem" }}>
            Doodle <span style={{ color: "#e879f9" }}>Duel</span>
          </h1>
          <div className="flex items-center justify-center gap-3 text-sm font-semibold text-slate-500">
            <span>✏️ Draw</span>
            <span style={{ color: "#e879f9" }}>•</span>
            <span>🤔 Guess</span>
            <span style={{ color: "#67e8f9" }}>•</span>
            <span>🏆 Win</span>
          </div>
        </div>

        <div className="rounded-3xl p-6" style={CARD}>
          {/* Success notification */}
          {notification && (
            <div className="mb-4 rounded-xl px-4 py-3 text-sm font-bold text-center animate-pop-in" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "#86efac" }}>
              ✓ {notification}
            </div>
          )}

          {/* User badge */}
          <div className="flex items-center justify-between rounded-xl px-4 py-3 mb-5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)" }}>
                {username?.[0]?.toUpperCase()}
              </div>
              <span className="text-white font-bold text-sm">{username}</span>
            </div>
            <button
              onClick={onLogout}
              className="text-xs font-semibold text-slate-600 hover:text-red-400 transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Room code input */}
          <div className="mb-4">
            <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-slate-500">
              Room Code
            </label>
            <input
              type="text"
              className="w-full py-4 px-5 rounded-xl text-white font-black text-xl text-center tracking-[0.35em] outline-none transition-all duration-200 bg-white/6 border border-white/10 focus:border-fuchsia-400/50 focus:bg-white/9 placeholder:text-slate-700 placeholder:tracking-widest"
              placeholder="XXXXXX"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              maxLength={6}
            />
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button
              onClick={createRoom}
              className="py-4 rounded-xl font-bold text-white transition-all duration-200 hover:scale-[1.04] active:scale-[0.97] hover:shadow-lg"
              style={{ background: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)", boxShadow: "0 6px 20px rgba(245,158,11,0.3)" }}
            >
              <div className="text-xl mb-0.5">✨</div>
              <div className="text-sm font-black tracking-wider">CREATE</div>
            </button>
            <button
              onClick={joinRoom}
              disabled={!roomId.trim()}
              className="py-4 rounded-xl font-bold text-white transition-all duration-200 hover:scale-[1.04] active:scale-[0.97] disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed hover:shadow-lg"
              style={{ background: "linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)", boxShadow: "0 6px 20px rgba(6,182,212,0.3)" }}
            >
              <div className="text-xl mb-0.5">🚀</div>
              <div className="text-sm font-black tracking-wider">JOIN</div>
            </button>
          </div>

          <p className="text-center text-xs font-semibold text-slate-700">
            Create a room or enter a code to join
          </p>
        </div>
      </div>
    </div>
  );
}
