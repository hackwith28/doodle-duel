import WordHint from "./WordHint";

export default function TopBar({
  player,
  isDrawer,
  timeLeft,
  drawerWord,
  fullWord,
  isMuted,
  volume,
  toggleMute,
  setVolume,
}) {
  return (
    <div className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl border-2 border-purple-500 mb-4">
      <div className="flex items-center justify-between gap-4">
        {/* LEFT: ROOM CODE */}
        <div className="flex items-center gap-3">
          <div className="bg-yellow-400 text-black font-black px-3 py-1 rounded-lg">
            ROOM CODE
          </div>
          <div className="text-white font-black">
            {player.roomId}
          </div>
        </div>

        {/* CENTER: TURN / TIMER / WORD */}
        <div className="flex items-center gap-4">
          {isDrawer && (
            <div className="bg-yellow-400 text-black font-black px-4 py-2 rounded-xl">
              ✏️ YOUR TURN
            </div>
          )}

          <div className="bg-pink-500 text-white font-black px-4 py-2 rounded-xl">
            ⏱ {timeLeft}s
          </div>

          <div className="bg-purple-700 text-white px-4 py-2 rounded-xl text-center">
            <div className="text-xs opacity-80">YOUR WORD</div>
            <div className="font-black">
              {isDrawer ? fullWord : drawerWord}
            </div>
          </div>
        </div>

        {/* RIGHT: SOUND */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMute}
            className="bg-white/20 px-3 py-2 rounded-lg text-white"
          >
            {isMuted ? "🔇" : "🔊"}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(+e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
