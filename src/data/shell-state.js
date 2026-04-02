import { CHARACTER_OPTIONS, getCharacterById } from './characters.js';
import { STARTER_WEAPONS, getStarterWeaponById } from './starter-weapons.js';
import { BOSS_PREVIEW } from './boss-catalog.js';
import { ENEMY_PREVIEW } from './enemy-catalog.js';
import { FEATURED_ITEMS } from './item-catalog.js';

export const DEFAULT_CHARACTER_ID = 'badboy';
export const DEFAULT_WEAPON_ID = 'textbook';

const defaultCharacter = getCharacterById(DEFAULT_CHARACTER_ID);
const defaultWeapon = getStarterWeaponById(DEFAULT_WEAPON_ID);

export const DEFAULT_SHELL_STATE = {
  screen: 'home',
  selectedCharacter: DEFAULT_CHARACTER_ID,
  selectedWeapon: DEFAULT_WEAPON_ID,
  selectedCharacterLabel: defaultCharacter?.name || '校霸',
  selectedWeaponLabel: defaultWeapon?.name || '课本飞弹',
  starterWeapons: STARTER_WEAPONS,
  characters: CHARACTER_OPTIONS,
  bossPreview: BOSS_PREVIEW,
  enemyPreview: ENEMY_PREVIEW,
  featuredItems: FEATURED_ITEMS,
  characterStats: { hp: defaultCharacter?.hp || 150, damage: defaultCharacter?.damage || 25, attackSpeed: defaultCharacter?.attackSpeed || 1 },
  weaponStats: { damage: defaultWeapon?.damage || 1, speed: defaultWeapon?.speed || 1, description: defaultWeapon?.description || '扔出课本攻击敌人' },
  buildTags: [defaultWeapon?.tag || '稳定直射', '自动攻击', '随机掉落道具'],
  homeSummary: '主武器决定前期打法，副武器和升级决定这局的走向。道具只在局内随机掉落，专注战斗节奏。',
  loadoutSummary: '开局以主武器建立节奏，副武器和升级会在战斗内逐步成形。道具仅通过局内随机掉落获得。',
  loadoutBullets: ['主副武器自动攻击', '无主动技能按键干扰', '道具偏救场与爆发']
};
