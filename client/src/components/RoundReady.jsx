function Avatar({ name, size = 44 }) {
  const COLORS = ["#a855f7", "#ec4899", "#06b6d4", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#f97316"];
  const color = COLORS[(name?.charCodeAt(0) || 0) % COLORS.length];
  return (
    <div
      className="flex items-center justify-center rounded-full font-bold text-white shrink-0"
      style={{ width: size, height: size, background: color, fontSize: size * 0.38, fontFamily: "'Fredoka', sans-serif" }}
    >
      {name?.[0]?.toUpperCase()}
    </div>
  );
}

export default function RoundReady({ players, readyIds, roundReadyCount, markedRoundReady, markRoundReady }) {
  return (
    <div className="w-full max-w-lg mx-auto animate-slide-in-up">
      <div
        className="rounded-3xl p-8 text-center"
        style={{
          background: "rgba(12,12,24,0.95)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(232,121,249,0.2)",
          boxShadow: "0 32px 64px rgba(0,0,0,0.6), 0 0 80px rgba(168,85,247,0.08)",
        }}
      >
        {/* Icon */}
        <div className="text-6xl mb-4 animate-bounce" style={{ animationDuration: "1.8s" }}>🎨</div>

        {/* Title */}
        <h2
          className="font-bold text-white mb-1 font-fredoka"
          style={{ fontSize: "2.6rem", letterSpacing: "-0.01em" }}
        >
          Get <span style={{ color: "#e879f9" }}>Ready!</span>
        </h2>
        <p className="text-slate-500 text-sm font-semibold mb-7">
          {roundReadyCount}/{players.length} players ready
        </p>

        {/* Player grid */}
        {players.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-7">
            {players.map((p, i) => {
              const isReady = readyIds.includes(p.id);
              return (
                <div
                  key={p.id}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-300 animate-pop-in"
                  style={{
                    background: isReady ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${isReady ? "rgba(34,197,94,0.35)" : "rgba(255,255,255,0.07)"}`,
                    animationDelay: `${i * 0.07}s`,
                  }}
                >
                  <div className="relative">
                    <Avatar name={p.name} size={44} />
                    {isReady && (
                      <div
                        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black"
                        style={{ background: "#22c55e", border: "2px solid #0a0a14" }}
                      >
                        ✓
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-bold text-white truncate w-full text-center">{p.name}</span>
                  <span
                    className="text-xs font-black px-2 py-0.5 rounded-full"
                    style={isReady
                      ? { background: "rgba(34,197,94,0.15)", color: "#86efac" }
                      : { background: "rgba(255,255,255,0.05)", color: "#475569" }
                    }
                  >
                    {isReady ? "Ready" : "Waiting"}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Ready button */}
        {!markedRoundReady ? (
          <button
            onClick={markRoundReady}
            className="py-4 px-12 rounded-2xl font-black text-white text-lg transition-all duration-200 hover:scale-[1.06] active:scale-[0.97]"
            style={{
              background: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
              boxShadow: "0 8px 28px rgba(16,185,129,0.4)",
              fontFamily: "'Fredoka', sans-serif",
              letterSpacing: "0.05em",
            }}
          >
            ✓ I'M READY!
          </button>
        ) : (
          <div
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold animate-pulse"
            style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "#86efac" }}
          >
            <span>⏳</span>
            <span>Waiting for others...</span>
          </div>
        )}
      </div>
    </div>
  );
}
