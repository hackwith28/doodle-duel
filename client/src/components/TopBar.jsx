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
    <div className="bg-white/10 backdrop-blur-xl px-3 py-2 sm:p-4 rounded-2xl border-2 border-purple-500 mb-3">
      <div className="flex flex-wrap items-center justify-between gap-2">

        {/* LEFT: ROOM CODE */}
        <div className="flex items-center gap-2">
          <div className="bg-yellow-400 text-black font-black px-2 py-1 rounded-lg text-xs sm:text-sm">
            ROOM CODE
          </div>
          <div className="text-white font-black text-sm sm:text-base">
            {player.roomId}
          </div>
        </div>

        {/* CENTER: TURN / TIMER / WORD */}
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center">
          {isDrawer && (
            <div className="bg-yellow-400 text-black font-black px-2 sm:px-4 py-1 sm:py-2 rounded-xl text-xs sm:text-sm">
              ✏️ YOUR TURN
            </div>
          )}
          <div className="bg-pink-500 text-white font-black px-2 sm:px-4 py-1 sm:py-2 rounded-xl text-xs sm:text-base">
            ⏱ {timeLeft}s
          </div>
          <div className="bg-purple-700 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-xl text-center">
            <div className="text-xs opacity-80 hidden sm:block">YOUR WORD</div>
            <div className="font-black text-xs sm:text-base">
              {isDrawer ? fullWord : drawerWord}
            </div>
          </div>
        </div>

        {/* RIGHT: SOUND */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="bg-white/20 px-2 py-1 sm:px-3 sm:py-2 rounded-lg text-white text-sm"
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
            className="hidden sm:block w-20"
          />
        </div>

      </div>
    </div>
  );
}
