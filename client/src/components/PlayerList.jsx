export default function PlayerList({ players, currentDrawerId }) {
  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl border-2 border-purple-500 p-4 space-y-2">
      <h3 className="text-white font-black text-lg mb-2">👥 PLAYERS</h3>

      {players.map((p) => (
        <div
          key={p.id}
          className={`flex justify-between items-center px-3 py-2 rounded-lg text-white ${
            p.id === currentDrawerId
              ? "bg-yellow-500/20 border border-yellow-400"
              : "bg-white/5"
          }`}
        >
          <span>{p.name}</span>
          {p.id === currentDrawerId && <span>✏️</span>}
        </div>
      ))}
    </div>
  );
}
