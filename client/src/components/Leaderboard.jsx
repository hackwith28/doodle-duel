export default function Leaderboard({ players }) {
  const sorted = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl border-2 border-purple-500 p-4 space-y-4">
      <div className="flex items-center gap-2 text-white font-black text-lg">
        <span>🏆</span>
        <span>LEADERBOARD</span>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center text-white/70 font-semibold py-6">
          🎯 No scores yet — let’s play!
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((p) => (
            <div
              key={p.id}
              className="flex justify-between items-center bg-white/10 rounded-lg px-3 py-2 text-white"
            >
              <span className="font-semibold">{p.name}</span>
              <span className="font-black">{p.score}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
