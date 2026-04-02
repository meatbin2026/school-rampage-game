export const ENEMY_CATALOG = {
  minion: { id: 'minion', name: '小弟', emoji: '🧑', role: '标准杂兵' },
  runner: { id: 'runner', name: '快腿', emoji: '🏃', role: '高速突脸' },
  tank: { id: 'tank', name: '壮汉', emoji: '💪', role: '高血量顶前' },
  bomber: { id: 'bomber', name: '炸弹人', emoji: '🤯', role: '贴脸爆炸' },
  healer: { id: 'healer', name: '奶妈', emoji: '👩‍⚕️', role: '后排支援' },
  teleporter: { id: 'teleporter', name: '瞬移怪', emoji: '👻', role: '扰乱走位' },
  foodMinion: { id: 'foodMinion', name: '食物小兵', emoji: '🍔', role: 'Boss召唤物' }
};

export const ENEMY_PREVIEW = ['minion', 'runner', 'tank', 'bomber'].map((id) => ENEMY_CATALOG[id]);
