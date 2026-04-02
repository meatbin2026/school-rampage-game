export const ITEM_CATALOG = {
  healthPack: {
    id: 'healthPack',
    name: '能量饮料',
    emoji: '🥤',
    effect: 'heal',
    description: '恢复50点生命值'
  },
  healthPackLarge: {
    id: 'healthPackLarge',
    name: '超级饮料',
    emoji: '🧃',
    effect: 'heal',
    description: '恢复100点生命值'
  },
  magnet: {
    id: 'magnet',
    name: '知识磁铁',
    emoji: '🧲',
    effect: 'magnet',
    description: '自动吸取经验'
  },
  shield: {
    id: 'shield',
    name: '作业护盾',
    emoji: '🛡️',
    effect: 'shield',
    description: '短时间无敌'
  },
  speedBoots: {
    id: 'speedBoots',
    name: '运动鞋',
    emoji: '👟',
    effect: 'speed',
    description: '短时间高速移动'
  },
  expBoost: {
    id: 'expBoost',
    name: '学霸笔记',
    emoji: '📝',
    effect: 'exp',
    description: '短时间双倍经验'
  },
  bomb: {
    id: 'bomb',
    name: '大扫除炸弹',
    emoji: '💣',
    effect: 'bomb',
    description: '清除全屏敌人'
  },
  revive: {
    id: 'revive',
    name: '复活币',
    emoji: '💎',
    effect: 'revive',
    description: '死亡时自动复活一次'
  },
  timeFreeze: {
    id: 'timeFreeze',
    name: '时间停止',
    emoji: '⏱️',
    effect: 'freeze',
    description: '冻结时间3秒'
  }
};

export const FEATURED_ITEMS = ['magnet', 'shield', 'bomb']
  .map((id) => ITEM_CATALOG[id])
  .filter(Boolean);

export function getItemById(id) {
  return ITEM_CATALOG[id] || null;
}
