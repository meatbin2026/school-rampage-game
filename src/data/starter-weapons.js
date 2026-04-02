import { getWeaponDisplayById } from './weapon-catalog.js';

export const STARTER_WEAPON_IDS = ['textbook', 'chalk', 'basketball', 'triangle'];

export const STARTER_WEAPON_DATA = Object.fromEntries(
  STARTER_WEAPON_IDS.map((id) => [id, getWeaponDisplayById(id)])
);

export const STARTER_WEAPONS = STARTER_WEAPON_IDS.map((id) => getWeaponDisplayById(id)).filter(Boolean);

export const WEAPON_LABELS = Object.fromEntries(
  STARTER_WEAPONS.map((weapon) => [weapon.id, weapon.name])
);

export function getStarterWeaponById(id) {
  return STARTER_WEAPON_DATA[id] || getWeaponDisplayById(id) || null;
}
