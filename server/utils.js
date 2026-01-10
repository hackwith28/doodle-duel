// utils.js
export function getPlayersWithScores(room) {
  return room.players.map((p) => ({
    ...p,
    score: room.scores?.[p.id]?.score || 0,
  }));
}
