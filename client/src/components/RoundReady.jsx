export default function RoundReady({
  players,
  readyIds,
  roundReadyCount,
  markedRoundReady,
  markRoundReady,
}) {
  return (
    <div className="flex flex-col items-center justify-center text-white">
      <h2 className="text-3xl font-black">Get Ready!</h2>
      <p>
        {roundReadyCount}/{players.length} ready
      </p>

      {!markedRoundReady && <button onClick={markRoundReady}>I'M READY</button>}
    </div>
  );
}
