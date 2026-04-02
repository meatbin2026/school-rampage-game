export function getLegacySnapshot() {
  const api = window.LegacyGameData;
  if (!api) return null;

  return {
    saveData: api.getSaveData?.() || null,
    leaderboard: api.getLeaderboard?.() || [],
    currentTitleId: api.getCurrentTitleId?.() || 'newbie'
  };
}
