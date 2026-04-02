import { ACHIEVEMENT_CATALOG } from './achievement-catalog.js';

export const ACHIEVEMENT_SHOWCASE_IDS = [
  'firstBlood',
  'killer10',
  'survivor',
  'level10',
  'combo50',
  'bossSlayer',
  'waveMaster',
  'rageMode'
];

export const ACHIEVEMENT_SHOWCASE = ACHIEVEMENT_SHOWCASE_IDS
  .map((id) => ACHIEVEMENT_CATALOG[id])
  .filter(Boolean);
