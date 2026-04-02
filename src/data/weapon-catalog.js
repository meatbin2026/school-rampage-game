export const WEAPON_CATALOG = {
  textbook: {
    id: 'textbook',
    name: '课本飞弹',
    emoji: '📚',
    tag: '稳定直射',
    damage: 1,
    speed: 1,
    maxLevel: 8,
    description: '扔出课本攻击敌人'
  },
  chalk: {
    id: 'chalk',
    name: '粉笔散射',
    emoji: '🖍️',
    tag: '扇形清怪',
    damage: 0.8,
    speed: 1.2,
    maxLevel: 8,
    description: '散射粉笔攻击'
  },
  ruler: {
    id: 'ruler',
    name: '戒尺旋风',
    emoji: '📏',
    tag: '环绕护体',
    damage: 0.5,
    speed: 0.8,
    maxLevel: 8,
    description: '周围旋转的戒尺'
  },
  basketball: {
    id: 'basketball',
    name: '篮球轰炸',
    emoji: '🏀',
    tag: '爆发轰炸',
    damage: 2,
    speed: 0.6,
    maxLevel: 8,
    description: '篮球爆炸伤害'
  },
  eraser: {
    id: 'eraser',
    name: '橡皮擦除',
    emoji: '🧼',
    tag: '弹跳连锁',
    damage: 1.5,
    speed: 1.5,
    maxLevel: 8,
    description: '橡皮在敌人间弹跳'
  },
  broom: {
    id: 'broom',
    name: '扫把旋风',
    emoji: '🧹',
    tag: '击退控场',
    damage: 1.2,
    speed: 1,
    maxLevel: 8,
    description: '击退敌人的扫把攻击'
  },
  ink: {
    id: 'ink',
    name: '墨水炸弹',
    emoji: '🖊️',
    tag: '持续伤害',
    damage: 3,
    speed: 0.5,
    maxLevel: 8,
    description: '墨水持续伤害'
  },
  triangle: {
    id: 'triangle',
    name: '三角板飞镖',
    emoji: '📐',
    tag: '穿透清线',
    damage: 1.8,
    speed: 1.8,
    maxLevel: 8,
    description: '穿透多个敌人'
  },
  examPaper: {
    id: 'examPaper',
    name: '试卷风暴',
    emoji: '📃',
    tag: '覆盖清场',
    damage: 0.3,
    speed: 0.4,
    maxLevel: 8,
    description: '试卷席卷全场'
  },
  lunchBox: {
    id: 'lunchBox',
    name: '饭盒重击',
    emoji: '🍱',
    tag: '短程爆发',
    damage: 2.2,
    speed: 0.75,
    maxLevel: 5,
    description: '饭盒砸击并附带眩晕溅射'
  },
  waterBalloon: {
    id: 'waterBalloon',
    name: '水球乱斗',
    emoji: '🎈',
    tag: '减速控场',
    damage: 1,
    speed: 1.2,
    maxLevel: 5,
    description: '水球减速敌人'
  },
  firecracker: {
    id: 'firecracker',
    name: '鞭炮轰炸',
    emoji: '🧨',
    tag: '范围爆发',
    damage: 3.5,
    speed: 0.45,
    maxLevel: 5,
    description: '高伤害范围爆炸'
  },
  laser: {
    id: 'laser',
    name: '激光笔',
    emoji: '🔦',
    tag: '高速穿透',
    damage: 1.2,
    speed: 2,
    maxLevel: 5,
    description: '高速穿透激光'
  },
  iceStick: {
    id: 'iceStick',
    name: '冰棒投掷',
    emoji: '🍦',
    tag: '冻结控制',
    damage: 1,
    speed: 1.1,
    maxLevel: 5,
    description: '冰冻敌人'
  }
};

export const WEAPON_OPTIONS = Object.values(WEAPON_CATALOG);

export function getWeaponDisplayById(id) {
  return WEAPON_CATALOG[id] || null;
}
