import { ACHIEVEMENT_SHOWCASE } from '../../data/achievement-showcase.js';
import { getTitleById } from '../../data/title-catalog.js';

export function buildMetaStats(snapshot) {
  if (!snapshot?.saveData) {
    return null;
  }

  const { saveData, currentTitleId } = snapshot;
  const currentTitle = getTitleById(currentTitleId) || { name: '校园新生', emoji: '🎒' };
  const bestMinutes = Math.floor((saveData.bestRun?.time || 0) / 60000);
  const totalHours = Math.max(1, Math.floor((saveData.totalPlayTime || 0) / 3600000));
  const unlockedAchievements = Object.keys(saveData.achievements || {}).length;

  return {
    currentTitle,
    progression: [
      { label: '天赋点', value: saveData.talentPoints || 0 },
      { label: '总时长', value: `${totalHours}小时+` },
      { label: '已解锁成就', value: unlockedAchievements }
    ],
    stats: [
      { label: '最高击败', value: saveData.highScore, featured: true },
      { label: '总击杀', value: saveData.totalKills },
      { label: '游戏次数', value: saveData.totalGames },
      { label: '最佳等级', value: saveData.bestRun?.level || 0 },
      { label: '最佳时长', value: `${bestMinutes}分+` }
    ]
  };
}

export function buildAchievementShowcase(snapshot) {
  if (!snapshot?.saveData) {
    return null;
  }

  const { saveData } = snapshot;

  const unlockedCount = ACHIEVEMENT_SHOWCASE.filter((achievement) => Boolean(saveData.achievements?.[achievement.id])).length;
  const progress = ACHIEVEMENT_SHOWCASE.length ? Math.round((unlockedCount / ACHIEVEMENT_SHOWCASE.length) * 100) : 0;

  return {
    unlockedCount,
    totalCount: ACHIEVEMENT_SHOWCASE.length,
    progress,
    items: ACHIEVEMENT_SHOWCASE.map((achievement) => ({
      id: achievement.id,
      name: achievement.name,
      emoji: achievement.emoji,
      unlocked: Boolean(saveData.achievements?.[achievement.id])
    }))
  };
}
