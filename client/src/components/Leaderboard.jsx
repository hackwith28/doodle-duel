const MEDALS = ["🥇", "🥈", "🥉"];
const MEDAL_COLORS = [
  { bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.3)", text: "#fbbf24" },
  { bg: "rgba(148,163,184,0.1)",  border: "rgba(148,163,184,0.25)", text: "#94a3b8" },
  { bg: "rgba(234,88,12,0.1)",    border: "rgba(234,88,12,0.25)",  text: "#fb923c" },
];

export default function Leaderboard({ players }) {
  const sorted = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));

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
        <span className="text-sm">🏆</span>
        <h3 className="text-white font-black text-sm uppercase tracking-wider">Scores</h3>
      </div>

      {sorted.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-700 text-xs font-semibold text-center">No scores yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5 overflow-y-auto">
          {sorted.map((p, i) => {
            const mc = i < 3 ? MEDAL_COLORS[i] : null;
            return (
              <div
                key={p.id}
                className="flex items-center gap-2 px-2.5 py-2 rounded-xl transition-all duration-200"
                style={{
                  background: mc ? mc.bg : "rgba(255,255,255,0.04)",
                  border: `1px solid ${mc ? mc.border : "rgba(255,255,255,0.06)"}`,
                }}
              >
                <span className="text-base w-5 text-center shrink-0">
                  {i < 3 ? MEDALS[i] : <span className="text-xs font-bold text-slate-600">#{i + 1}</span>}
                </span>
                <span
                  className="text-xs font-bold truncate flex-1"
                  style={{ color: mc ? mc.text : "#cbd5e1" }}
                >
                  {p.name}
                </span>
                <span
                  className="text-xs font-black shrink-0 px-1.5 py-0.5 rounded-md"
                  style={{
                    background: mc ? `${mc.bg}` : "rgba(255,255,255,0.06)",
                    color: mc ? mc.text : "#94a3b8",
                  }}
                >
                  {p.score || 0}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
