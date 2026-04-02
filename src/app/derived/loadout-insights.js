import { getCharacterById } from '../../data/characters.js';
import { getWeaponDisplayById } from '../../data/weapon-catalog.js';
import { CHARACTER_STYLE_PRESETS, WEAPON_BUILD_PRESETS } from '../../data/build-presets.js';

export function buildSelectionDetails(state) {
  const character = getCharacterById(state.selectedCharacter) || {};
  const weapon = getWeaponDisplayById(state.selectedWeapon) || {};
  const characterPreset = CHARACTER_STYLE_PRESETS[state.selectedCharacter] || {};
  const weaponPreset = WEAPON_BUILD_PRESETS[state.selectedWeapon] || {};
  const selectedCharacterLabel = character.name || state.selectedCharacterLabel || '未选择角色';
  const selectedWeaponLabel = weapon.name || state.selectedWeaponLabel || '未选择武器';

  const buildTags = [
    weaponPreset.role || weapon.tag || '构筑核心',
    characterPreset.style || (character.attackSpeed > 1.2 ? '高频压制' : (character.hp >= 120 ? '正面强攻' : '灵活游走')),
    '随机掉落道具'
  ];

  const homeSummary = `${selectedCharacterLabel} 使用 ${selectedWeaponLabel} 开局，${weaponPreset.combatNote || weapon.description || '围绕自动攻击推进 Build'}。${characterPreset.lane || (character.hp >= 120 ? '更适合顶住前线压力。' : '更适合拉扯与绕怪。')}`;
  const loadoutSummary = `${selectedCharacterLabel} 的基础属性会决定你前 3 波的容错，${selectedWeaponLabel} 则决定清怪形态。${weaponPreset.opener || '副武器和升级将在战斗内自然成形。'}`;
  const loadoutBullets = [
    `基础生命 ${character.hp || '-'}，攻击 ${character.damage || '-'}，攻速 ${character.attackSpeed || '-'}`,
    `${selectedWeaponLabel}：${weapon.description || '自动攻击武器'}`,
    weaponPreset.nextStep || (weapon.pierce ? `武器自带穿透 ${weapon.pierce}` : '前期依赖走位和升级拉开空间')
  ];
  const bossPreview = (state.bossPreview || []).slice(0, 3);
  const enemyPreview = (state.enemyPreview || []).slice(0, 4);

  return {
    selectedCharacterLabel,
    selectedWeaponLabel,
    characterStats: {
      hp: character.hp || '-',
      damage: character.damage || '-',
      attackSpeed: character.attackSpeed || '-'
    },
    weaponStats: {
      damage: weapon.damage || '-',
      speed: weapon.speed || '-',
      description: weapon.description || ''
    },
    bossPreview,
    enemyPreview,
    buildTags,
    homeSummary,
    loadoutSummary,
    loadoutBullets
  };
}
