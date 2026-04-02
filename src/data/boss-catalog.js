export const BOSS_CATALOG = {
  disciplinarian: {
    id: 'disciplinarian',
    wave: 10,
    name: '教导主任',
    emoji: '👨‍🏫',
    title: '纪律守护者'
  },
  principal: {
    id: 'principal',
    wave: 20,
    name: '校长',
    emoji: '👴',
    title: '学校统治者'
  },
  lunchLady: {
    id: 'lunchLady',
    wave: 30,
    name: '食堂大妈',
    emoji: '👩‍🍳',
    title: '黑暗料理王'
  }
};

export const BOSS_PREVIEW = Object.values(BOSS_CATALOG)
  .sort((a, b) => a.wave - b.wave);
