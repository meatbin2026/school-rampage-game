import { buildAchievementShowcase, buildMetaStats } from './derived/meta-insights.js';
import { buildLeaderboard } from './derived/leaderboard-insights.js';
import { renderMetaStatsPanel } from '../ui/components/meta-stats-panel.js';
import { renderAchievementWall } from '../ui/components/achievement-wall.js';
import { renderLeaderboardPanel } from '../ui/components/leaderboard-panel.js';

export function refreshHomeMetaPanels(snapshot) {
  const statsNode = document.getElementById('saveStats');
  if (statsNode) {
    statsNode.innerHTML = renderMetaStatsPanel(buildMetaStats(snapshot));
  }

  const achievementsNode = document.getElementById('achievementsList');
  if (achievementsNode) {
    achievementsNode.innerHTML = renderAchievementWall(buildAchievementShowcase(snapshot));
  }

  const leaderboardNode = document.getElementById('leaderboardList');
  if (leaderboardNode) {
    leaderboardNode.innerHTML = renderLeaderboardPanel(buildLeaderboard(snapshot));
  }
}
