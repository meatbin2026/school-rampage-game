import { getWeaponDisplayById } from '../../data/weapon-catalog.js';
import { WEAPON_BUILD_PRESETS } from '../../data/build-presets.js';
import { BOSS_CATALOG } from '../../data/boss-catalog.js';

function getPerformanceTier(result) {
  if ((result.wave || 0) >= 20 || (result.kills || 0) >= 600) {
    return '街机传说';
  }
  if ((result.wave || 0) >= 12 || (result.kills || 0) >= 250) {
    return '强势一局';
  }
  return '热身完成';
}

export function buildResultsInsights(result, state) {
  const weapon = getWeaponDisplayById(state.selectedWeapon);
  const primaryWeapon = getWeaponDisplayById(result.primaryWeapon || state.selectedWeapon);
  const secondaryWeapon = getWeaponDisplayById(result.secondaryWeapon);
  const preset = WEAPON_BUILD_PRESETS[state.selectedWeapon] || {};
  const performanceTier = getPerformanceTier(result);
  const nextStep = preset.nextStep || '下一局继续围绕主武器去补足短板。';
  const highlight = weapon?.name
    ? `${weapon.name} 在这局里承担了主要清怪节奏。`
    : '这局主武器承担了主要清怪节奏。';
  const bossCards = (result.bossesDefeated || []).map((id) => BOSS_CATALOG[id]).filter(Boolean);
  const newAchievements = result.newAchievements || [];
  const newTitles = result.newTitles || [];

  return {
    performanceTier,
    highlight,
    nextStep,
    buildSummary: {
      primary: primaryWeapon,
      secondary: secondaryWeapon,
      unlockedCount: result.weaponsUnlocked || 1
    },
    bossCards,
    talentPointsEarned: result.talentPointsEarned || 0,
    newAchievements,
    newTitles
  };
}
