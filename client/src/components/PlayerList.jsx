const AVATAR_COLORS = ["#a855f7","#ec4899","#06b6d4","#f59e0b","#10b981","#ef4444","#8b5cf6","#f97316"];

function Avatar({ name, size = 32 }) {
  const color = AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
  return (
    <div
      className="flex items-center justify-center rounded-full font-bold text-white shrink-0"
      style={{ width: size, height: size, background: color, fontSize: size * 0.4, fontFamily: "'Fredoka', sans-serif" }}
    >
      {name?.[0]?.toUpperCase()}
    </div>
  );
}

export default function PlayerList({ players, currentDrawerId }) {
  return (
    <div
      className="h-full rounded-2xl p-3 flex flex-col gap-2"
      style={{
        background: "rgba(12,12,24,0.92)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-sm">👥</span>
        <h3 className="text-white font-black text-sm uppercase tracking-wider">Players</h3>
        <span
          className="ml-auto text-xs font-black px-1.5 py-0.5 rounded-full"
          style={{ background: "rgba(168,85,247,0.2)", color: "#c084fc" }}
        >
          {players.length}
        </span>
      </div>

      <div className="flex flex-col gap-1.5 overflow-y-auto">
        {players.map((p) => {
          const isDrawing = p.id === currentDrawerId;
          return (
            <div
              key={p.id}
              className="flex items-center gap-2 px-2.5 py-2 rounded-xl transition-all duration-200"
              style={{
                background: isDrawing ? "rgba(251,191,36,0.1)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${isDrawing ? "rgba(251,191,36,0.3)" : "rgba(255,255,255,0.06)"}`,
              }}
            >
              <Avatar name={p.name} size={28} />
              <span className="text-white text-xs font-bold truncate flex-1">{p.name}</span>
              {isDrawing && (
                <span className="text-base shrink-0" title="Drawing now">✏️</span>
              )}
              {p.isHost && !isDrawing && (
                <span className="text-xs shrink-0" title="Host">👑</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
