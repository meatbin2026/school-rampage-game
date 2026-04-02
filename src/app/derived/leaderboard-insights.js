export function buildLeaderboard(snapshot) {
  const entries = snapshot?.leaderboard || [];

  return entries.map((entry, index) => ({
    rank: index + 1,
    score: entry.score || 0,
    kills: entry.kills || 0,
    wave: entry.wave || 0,
    level: entry.level || 0
  }));
}
