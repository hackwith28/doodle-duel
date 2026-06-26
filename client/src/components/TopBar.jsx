import { useState } from "react";

export default function TopBar({ player, isDrawer, timeLeft, drawerWord, fullWord, isMuted, volume, toggleMute, setVolume, onLeaveRoom }) {
  const isUrgent = timeLeft !== null && timeLeft <= 10;
  const [confirming, setConfirming] = useState(false);

  const handleLeave = () => {
    if (confirming) {
      onLeaveRoom?.();
    } else {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
    }
  };

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-2xl"
      style={{
        background: "rgba(12,12,24,0.97)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.45)",
      }}
    >
      {/* LEFT: Doodle Duel logo — click to go home */}
      <button
        onClick={handleLeave}
        className="flex items-center gap-2 shrink-0 group"
        title="Leave room and go home"
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-base transition-all duration-200 group-hover:scale-110"
          style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)", boxShadow: "0 2px 10px rgba(168,85,247,0.4)" }}
        >
          🎨
        </div>
        <span
          className="font-bold hidden sm:block transition-colors duration-200 group-hover:text-fuchsia-400"
          style={{ fontFamily: "'Fredoka', sans-serif", fontSize: "1.1rem", color: "#e2e8f0" }}
        >
          Doodle <span style={{ color: "#e879f9" }}>Duel</span>
        </span>
      </button>

      {/* Leave confirmation pill */}
      {confirming && (
        <div
          className="flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-bold animate-pop-in shrink-0"
          style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", color: "#fca5a5" }}
        >
          <span>Leave room?</span>
          <button
            onClick={onLeaveRoom}
            className="px-2 py-0.5 rounded-lg font-black text-white transition-all hover:scale-105"
            style={{ background: "#ef4444" }}
          >
            Yes
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="px-2 py-0.5 rounded-lg font-bold transition-all hover:scale-105"
            style={{ background: "rgba(255,255,255,0.1)", color: "#94a3b8" }}
          >
            No
          </button>
        </div>
      )}

      {/* Separator */}
      <div className="w-px h-6 bg-white/10 shrink-0" />

      {/* Room code */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-600 hidden md:block">Room</span>
        <span
          className="font-black text-sm tracking-widest px-2.5 py-1 rounded-lg"
          style={{ background: "rgba(103,232,249,0.1)", border: "1px solid rgba(103,232,249,0.25)", color: "#67e8f9" }}
        >
          {player.roomId}
        </span>
      </div>

      {/* CENTER: Timer + badge + word — grows to fill */}
      <div className="flex items-center gap-2 flex-1 justify-center min-w-0">
        {/* YOUR TURN badge */}
        {isDrawer && (
          <span
            className="text-xs font-black px-2.5 py-1 rounded-lg shrink-0 hidden sm:block"
            style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.35)", color: "#fbbf24" }}
          >
            ✏️ YOUR TURN
          </span>
        )}

        {/* Timer */}
        <div
          className={`font-black text-lg px-3 py-1 rounded-xl shrink-0 ${isUrgent ? "animate-timer-urgent" : ""}`}
          style={{
            background: isUrgent ? "rgba(239,68,68,0.2)" : "rgba(236,72,153,0.15)",
            border: `1px solid ${isUrgent ? "rgba(239,68,68,0.5)" : "rgba(236,72,153,0.35)"}`,
            color: isUrgent ? "#f87171" : "#f9a8d4",
            fontFamily: "'Fredoka', sans-serif",
            minWidth: "58px",
            textAlign: "center",
          }}
        >
          {timeLeft}s
        </div>

        {/* Word / hint */}
        <div
          className="px-3 py-1.5 rounded-xl text-center min-w-0 max-w-45 sm:max-w-none truncate"
          style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.25)" }}
        >
          <div className="text-white font-black text-sm sm:text-base tracking-[0.2em]"
            style={{ fontFamily: "'Fredoka', sans-serif", letterSpacing: isDrawer ? "0.05em" : "0.22em" }}
          >
            {isDrawer ? fullWord : drawerWord}
          </div>
        </div>
      </div>

      {/* RIGHT: Sound */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={toggleMute}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-all hover:scale-110 active:scale-95"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          {isMuted ? "🔇" : "🔊"}
        </button>
        <input
          type="range" min="0" max="1" step="0.05"
          value={volume}
          onChange={(e) => setVolume(+e.target.value)}
          className="hidden md:block w-16 h-1 rounded-full cursor-pointer accent-fuchsia-400"
        />
      </div>
    </div>
  );
}
