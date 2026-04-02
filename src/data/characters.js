export const CHARACTER_DATA = {
  badboy: {
    id: 'badboy',
    name: '校霸',
    emoji: '😎',
    hp: 150,
    damage: 25,
    attackSpeed: 1,
    moveSpeed: 1,
    rageBuild: 1,
    color: '#ff4757',
    summary: '高血量，高攻击'
  },
  nerd: {
    id: 'nerd',
    name: '学霸',
    emoji: '🤓',
    hp: 80,
    damage: 15,
    attackSpeed: 1.5,
    moveSpeed: 1.3,
    rageBuild: 0.8,
    color: '#2ed573',
    summary: '高速攻速，灵活走位'
  },
  sporty: {
    id: 'sporty',
    name: '体育生',
    emoji: '🏃',
    hp: 120,
    damage: 20,
    attackSpeed: 1.2,
    moveSpeed: 1.2,
    rageBuild: 1.3,
    color: '#ffa502',
    summary: '均衡耐打，怒气更快'
  }
};

export const CHARACTER_OPTIONS = Object.values(CHARACTER_DATA);

export const CHARACTER_LABELS = Object.fromEntries(
  CHARACTER_OPTIONS.map((character) => [character.id, character.name])
);

export function getCharacterById(id) {
  return CHARACTER_DATA[id] || null;
}
