// 校园暴走 - 割草游戏核心逻辑
// 基于开源项目 suvivor 修改完善

// ==================== 存档系统 ====================
const SaveSystem = {
  key: 'schoolRampage_save_v1',
  
  load() {
    try {
      const data = localStorage.getItem(this.key);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('存档加载失败:', e);
    }
    return this.getDefaultData();
  },
  
  save(data) {
    try {
      localStorage.setItem(this.key, JSON.stringify(data));
    } catch (e) {
      console.error('存档失败:', e);
    }
  },
  
  getDefaultData() {
    return {
      highScore: 0,
      totalKills: 0,
      totalGames: 0,
      totalPlayTime: 0,
      achievements: {},
      unlockedCharacters: ['badboy'],
      bestRun: {
        kills: 0,
        time: 0,
        level: 0
      }
    };
  },
  
  updateStats(gameStats) {
    const data = this.load();
    
    // 更新最高分手
    if (gameStats.kills > data.highScore) {
      data.highScore = gameStats.kills;
    }
    
    // 更新总击杀
    data.totalKills += gameStats.kills;
    data.totalGames++;
    data.totalPlayTime += gameStats.playTime;
    
    // 更新最佳记录
    if (gameStats.kills > data.bestRun.kills) {
      data.bestRun = {
        kills: gameStats.kills,
        time: gameStats.playTime,
        level: gameStats.level
      };
    }
    
    // 检查成就
    this.checkAchievements(data, gameStats);
    
    this.save(data);
    return data;
  },
  
  checkAchievements(data, gameStats) {
    const achievements = ACHIEVEMENTS;
    
    for (const [id, achievement] of Object.entries(achievements)) {
      if (!data.achievements[id]) {
        const progress = achievement.check(gameStats, data);
        if (progress >= achievement.target) {
          data.achievements[id] = {
            unlocked: true,
            unlockedAt: Date.now()
          };
          showAchievementUnlock(achievement);
        }
      }
    }
  },
  
  reset() {
    localStorage.removeItem(this.key);
  }
};

// 成就系统
const ACHIEVEMENTS = {
  firstBlood: {
    id: 'firstBlood',
    name: '初露锋芒',
    description: '首次击杀敌人',
    emoji: '🩸',
    target: 1,
    check: (stats) => stats.kills
  },
  killer10: {
    id: 'killer10',
    name: '百人斩',
    description: '累计击杀100人',
    emoji: '💯',
    target: 100,
    check: (stats, data) => data.totalKills + stats.kills
  },
  killer100: {
    id: 'killer100',
    name: '千人斩',
    description: '累计击杀1000人',
    emoji: '👑',
    target: 1000,
    check: (stats, data) => data.totalKills + stats.kills
  },
  survivor: {
    id: 'survivor',
    name: '生存专家',
    description: '单局存活5分钟',
    emoji: '⏱️',
    target: 300,
    check: (stats) => Math.floor(stats.playTime / 1000)
  },
  level10: {
    id: 'level10',
    name: '成长达人',
    description: '单局达到10级',
    emoji: '📈',
    target: 10,
    check: (stats) => stats.level
  },
  level20: {
    id: 'level20',
    name: '满级大佬',
    description: '单局达到20级',
    emoji: '🏆',
    target: 20,
    check: (stats) => stats.level
  },
  combo50: {
    id: 'combo50',
    name: '连击大师',
    description: '达成50连击',
    emoji: '🔥',
    target: 50,
    check: (stats) => stats.maxCombo
  },
  bossSlayer: {
    id: 'bossSlayer',
    name: 'Boss克星',
    description: '击败教导主任',
    emoji: '👨‍🏫',
    target: 1,
    check: (stats) => stats.bossKilled
  },
  noDamage: {
    id: 'noDamage',
    name: '无伤通关',
    description: '单局不受伤存活3分钟',
    emoji: '🛡️',
    target: 1,
    check: (stats) => stats.noDamageRun && stats.playTime >= 180000
  },
  collector: {
    id: 'collector',
    name: '收藏家',
    description: '解锁所有武器',
    emoji: '📦',
    target: 9,
    check: (stats) => stats.weaponsUnlocked
  },
  rageMode: {
    id: 'rageMode',
    name: '暴走狂魔',
    description: '暴走状态下击杀50人',
    emoji: '😡',
    target: 50,
    check: (stats) => stats.rageKills
  },
  veteran: {
    id: 'veteran',
    name: '老兵',
    description: '累计游戏10次',
    emoji: '🎖️',
    target: 10,
    check: (stats, data) => data.totalGames + 1
  }
};

// ==================== 游戏配置 ====================
const CONFIG = {
  playerSpeed: 4,
  enemyBaseSpeed: 1.5,
  bulletSpeed: 8,
  spawnInterval: 2000,
  rageDuration: 5000,
  rageCooldown: 15000,
  comboTimeout: 3000,
  maxEnemies: 100,
  bossSpawnInterval: 180000 // 3分钟刷一次Boss
};

// 角色配置
const CHARACTERS = {
  badboy: {
    name: '校霸',
    emoji: '😎',
    hp: 150,
    damage: 25,
    attackSpeed: 1,
    moveSpeed: 1,
    rageBuild: 1,
    color: '#ff4757'
  },
  nerd: {
    name: '学霸',
    emoji: '🤓',
    hp: 80,
    damage: 15,
    attackSpeed: 1.5,
    moveSpeed: 1.3,
    rageBuild: 0.8,
    color: '#2ed573'
  },
  sporty: {
    name: '体育生',
    emoji: '🏃',
    hp: 120,
    damage: 20,
    attackSpeed: 1.2,
    moveSpeed: 1.2,
    rageBuild: 1.3,
    color: '#ffa502'
  }
};

// 敌人类型
const ENEMY_TYPES = {
  minion: {
    name: '小弟',
    emoji: '🧑',
    hp: 30,
    damage: 10,
    speed: 1,
    exp: 10,
    size: 25
  },
  runner: {
    name: '快腿',
    emoji: '🏃',
    hp: 20,
    damage: 8,
    speed: 1.8,
    exp: 15,
    size: 22
  },
  tank: {
    name: '壮汉',
    emoji: '💪',
    hp: 80,
    damage: 20,
    speed: 0.6,
    exp: 30,
    size: 35
  }
};

// Boss配置 - 教导主任
const BOSS_CONFIG = {
  name: '教导主任',
  emoji: '👨‍🏫',
  baseHp: 500,
  damage: 25,
  speed: 0.7,
  exp: 500,
  size: 60,
  
  // Boss技能
  skills: [
    {
      name: '作业轰炸',
      emoji: '📚',
      cooldown: 5000,
      lastUsed: 0,
      execute: (boss, player) => {
        // 向玩家发射8个方向的作业
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          gameState.bullets.push({
            x: boss.x,
            y: boss.y,
            vx: Math.cos(angle) * 4,
            vy: Math.sin(angle) * 4,
            damage: 15,
            isEnemyBullet: true,
            emoji: '📚',
            life: 3
          });
        }
        showBossSkillEffect(boss.x, boss.y, '📚 作业轰炸!');
      }
    },
    {
      name: '点名批评',
      emoji: '📢',
      cooldown: 8000,
      lastUsed: 0,
      execute: (boss, player) => {
        // 锁定玩家3秒，玩家减速
        gameState.activeEffects.slow = {
          active: true,
          endTime: Date.now() + 3000,
          multiplier: 0.5
        };
        showBossSkillEffect(player.x, player.y - 50, '📢 你被点名了!');
      }
    },
    {
      name: '大扫除',
      emoji: '🧹',
      cooldown: 12000,
      lastUsed: 0,
      execute: (boss, player) => {
        // 全屏旋风，向Boss吸引
        gameState.enemies.forEach(enemy => {
          const angle = Math.atan2(boss.y - enemy.y, boss.x - enemy.x);
          enemy.vx = Math.cos(angle) * 3;
          enemy.vy = Math.sin(angle) * 3;
          enemy.isPulled = true;
        });
        showBossSkillEffect(boss.x, boss.y, '🧹 大扫除!');
      }
    },
    {
      name: '叫家长',
      emoji: '📞',
      cooldown: 15000,
      lastUsed: 0,
      execute: (boss, player) => {
        // 召唤4个小弟
        for (let i = 0; i < 4; i++) {
          const angle = (i / 4) * Math.PI * 2;
          const dist = 100;
          spawnEnemyAt(
            boss.x + Math.cos(angle) * dist,
            boss.y + Math.sin(angle) * dist,
            'tank'
          );
        }
        showBossSkillEffect(boss.x, boss.y, '📞 叫家长!');
      }
    }
  ],
  
  // 阶段转换
  phases: [
    { hpPercent: 1.0, multiplier: 1 },
    { hpPercent: 0.7, multiplier: 1.3 },
    { hpPercent: 0.4, multiplier: 1.6 },
    { hpPercent: 0.2, multiplier: 2 }
  ]
};

// 武器/技能类型
const WEAPONS = {
  textbook: {
    name: '课本飞弹',
    emoji: '📚',
    damage: 1,
    speed: 1,
    pierce: 0,
    maxLevel: 8,
    description: '扔出课本攻击敌人'
  },
  chalk: {
    name: '粉笔散射',
    emoji: '🖍️',
    damage: 0.8,
    speed: 1.2,
    count: 3,
    spread: 30,
    maxLevel: 8,
    description: '散射粉笔攻击'
  },
  ruler: {
    name: '戒尺旋风',
    emoji: '📏',
    damage: 0.5,
    speed: 0.8,
    aoe: true,
    maxLevel: 8,
    description: '周围旋转的戒尺'
  },
  basketball: {
    name: '篮球轰炸',
    emoji: '🏀',
    damage: 2,
    speed: 0.6,
    explode: true,
    maxLevel: 8,
    description: '篮球爆炸伤害'
  },
  eraser: {
    name: '橡皮擦除',
    emoji: '🧼',
    damage: 1.5,
    speed: 1.5,
    bounce: true,
    maxLevel: 8,
    description: '橡皮在敌人间弹跳'
  },
  broom: {
    name: '扫把旋风',
    emoji: '🧹',
    damage: 1.2,
    speed: 1,
    knockback: true,
    maxLevel: 8,
    description: '击退敌人的扫把攻击'
  },
  ink: {
    name: '墨水炸弹',
    emoji: '🖊️',
    damage: 3,
    speed: 0.5,
    dot: true,
    maxLevel: 8,
    description: '墨水持续伤害'
  },
  triangle: {
    name: '三角板飞镖',
    emoji: '📐',
    damage: 1.8,
    speed: 1.8,
    pierce: 3,
    maxLevel: 8,
    description: '穿透多个敌人'
  },
  examPaper: {
    name: '试卷风暴',
    emoji: '📃',
    damage: 0.3,
    speed: 0.4,
    storm: true,
    maxLevel: 8,
    description: '试卷席卷全场'
  }
};

// 超武合成配方 (满级武器合成)
const SUPER_WEAPONS = {
  textbook: {
    name: '知识海洋',
    emoji: '🌊',
    damage: 5,
    speed: 1.5,
    pierce: 5,
    description: '课本+粉笔合成：知识海啸',
    requires: ['textbook', 'chalk']
  },
  ruler: {
    name: '终极惩戒',
    emoji: '⚡',
    damage: 4,
    speed: 2,
    stun: true,
    description: '戒尺+扫把合成：天罚之尺',
    requires: ['ruler', 'broom']
  }
};

// 道具类型
const ITEMS = {
  healthPack: {
    name: '能量饮料',
    emoji: '🥤',
    effect: 'heal',
    value: 50,
    duration: 0,
    color: '#ff6b6b',
    description: '恢复50点生命值',
    spawnRate: 0.05
  },
  magnet: {
    name: '知识磁铁',
    emoji: '🧲',
    effect: 'magnet',
    value: 0,
    duration: 8000,
    color: '#ffd93d',
    description: '8秒内自动吸取经验',
    spawnRate: 0.03
  },
  shield: {
    name: '作业护盾',
    emoji: '🛡️',
    effect: 'shield',
    value: 0,
    duration: 5000,
    color: '#74b9ff',
    description: '5秒无敌护盾',
    spawnRate: 0.02
  },
  speedBoots: {
    name: '运动鞋',
    emoji: '👟',
    effect: 'speed',
    value: 2,
    duration: 6000,
    color: '#55efc4',
    description: '6秒移速翻倍',
    spawnRate: 0.03
  },
  expBoost: {
    name: '学霸笔记',
    emoji: '📝',
    effect: 'exp',
    value: 2,
    duration: 10000,
    color: '#a29bfe',
    description: '10秒双倍经验',
    spawnRate: 0.02
  },
  bomb: {
    name: '大扫除炸弹',
    emoji: '💣',
    effect: 'bomb',
    value: 200,
    duration: 0,
    color: '#ff7675',
    description: '清除全屏敌人',
    spawnRate: 0.01
  }
};

// 道具掉落系统
let droppedItems = [];
let activeEffects = {
  magnet: { active: false, endTime: 0 },
  shield: { active: false, endTime: 0 },
  speed: { active: false, endTime: 0, multiplier: 1 },
  exp: { active: false, endTime: 0, multiplier: 1 }
};

// 升级选项
const UPGRADES = [
  // 基础武器
  { type: 'weapon', id: 'textbook', name: '课本飞弹', emoji: '📚', desc: '增加课本伤害和数量' },
  { type: 'weapon', id: 'chalk', name: '粉笔散射', emoji: '🖍️', desc: '解锁粉笔散射攻击' },
  { type: 'weapon', id: 'ruler', name: '戒尺旋风', emoji: '📏', desc: '解锁戒尺环绕攻击' },
  { type: 'weapon', id: 'basketball', name: '篮球轰炸', emoji: '🏀', desc: '解锁篮球爆炸攻击' },
  { type: 'weapon', id: 'eraser', name: '橡皮擦除', emoji: '🧼', desc: '解锁橡皮弹跳攻击' },
  // 新武器
  { type: 'weapon', id: 'broom', name: '扫把旋风', emoji: '🧹', desc: '解锁扫把击退攻击' },
  { type: 'weapon', id: 'ink', name: '墨水炸弹', emoji: '🖊️', desc: '解锁墨水持续伤害' },
  { type: 'weapon', id: 'triangle', name: '三角板飞镖', emoji: '📐', desc: '解锁穿透飞镖' },
  { type: 'weapon', id: 'examPaper', name: '试卷风暴', emoji: '📃', desc: '解锁全屏试卷攻击' },
  // 属性强化
  { type: 'stat', id: 'damage', name: '力量强化', emoji: '💪', desc: '攻击力 +20%' },
  { type: 'stat', id: 'speed', name: '速度提升', emoji: '⚡', desc: '移动速度 +15%' },
  { type: 'stat', id: 'hp', name: '体能训练', emoji: '❤️', desc: '最大生命值 +30' },
  { type: 'stat', id: 'attackSpeed', name: '攻速强化', emoji: '🔥', desc: '攻击速度 +25%' },
  { type: 'stat', id: 'crit', name: '暴击训练', emoji: '💥', desc: '暴击率 +10%' },
  { type: 'stat', id: 'pickup', name: '拾取范围', emoji: '👋', desc: '经验拾取范围 +30%' },
  // 特殊能力
  { type: 'special', id: 'rageBoost', name: '怒气爆发', emoji: '😡', desc: '暴走时间 +2秒' },
  { type: 'special', id: 'healOnKill', name: '吸血', emoji: '🩸', desc: '击杀恢复5点生命' },
  { type: 'special', id: 'expBonus', name: '学霸天赋', emoji: '🎓', desc: '经验获取 +15%' },
  { type: 'special', id: 'itemLuck', name: '幸运星', emoji: '⭐', desc: '道具掉落率 +50%' }
];

// ==================== 游戏状态 ====================
let gameState = {
  running: false,
  paused: false,
  gameOver: false,
  startTime: 0,
  lastTime: 0,
  
  // 玩家状态
  player: {
    x: 0,
    y: 0,
    hp: 100,
    maxHp: 100,
    level: 1,
    exp: 0,
    expToNext: 100,
    damage: 20,
    speed: 4,
    attackSpeed: 1,
    rage: 0,
    rageActive: false,
    rageEndTime: 0,
    rageCooldownEnd: 0,
    combo: 0,
    comboLastTime: 0,
    character: 'badboy'
  },
  
  // 武器状态
  weapons: {
    textbook: { level: 1, unlocked: true },
    chalk: { level: 0, unlocked: false },
    ruler: { level: 0, unlocked: false },
    basketball: { level: 0, unlocked: false },
    eraser: { level: 0, unlocked: false },
    broom: { level: 0, unlocked: false },
    ink: { level: 0, unlocked: false },
    triangle: { level: 0, unlocked: false },
    examPaper: { level: 0, unlocked: false }
  },
  
  // 超武状态
  superWeapons: {},
  
  // 道具状态
  items: [],
  activeEffects: {
    magnet: { active: false, endTime: 0 },
    shield: { active: false, endTime: 0 },
    speed: { active: false, endTime: 0, multiplier: 1 },
    exp: { active: false, endTime: 0, multiplier: 1 }
  },
  
  // 解锁的能力
  unlocks: {
    rageBoost: false,
    healOnKill: false,
    expBonus: false,
    itemLuck: false,
    crit: false,
    pickup: false
  },
  
  // 游戏对象
  enemies: [],
  bullets: [],
  particles: [],
  expOrbs: [],
  
  // Boss状态
  boss: null,
  bossSpawnTimer: 0,
  nextBossSpawn: CONFIG.bossSpawnInterval,
  
  // 统计
  kills: 0,
  totalDamage: 0,
  maxCombo: 0,
  rageKills: 0,
  bossKilled: 0,
  weaponsUnlocked: 1,
  damageTaken: 0,
  noDamageRun: true
};

// 输入状态
let keys = {};
let mouse = { x: 0, y: 0, down: false };

// Canvas
let canvas, ctx;
let camera = { x: 0, y: 0 };

// ==================== 初始化 ====================
function init() {
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // 输入事件
  window.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (e.code === 'KeyP') togglePause();
    if (e.code === 'Space') activateRage();
  });
  
  window.addEventListener('keyup', e => keys[e.code] = false);
  
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  
  canvas.addEventListener('mousedown', () => mouse.down = true);
  canvas.addEventListener('mouseup', () => mouse.down = false);
  
  // 触摸支持
  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.touches[0].clientX - rect.left;
    mouse.y = e.touches[0].clientY - rect.top;
    mouse.down = true;
  });
  
  canvas.addEventListener('touchend', () => mouse.down = false);
  
  // UI事件
  setupUI();
  
  // 开始游戏循环
  requestAnimationFrame(gameLoop);
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function setupUI() {
  // 角色选择
  document.querySelectorAll('.character-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.character-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      gameState.player.character = card.dataset.character;
    });
  });
  
  // 开始按钮
  document.getElementById('startBtn').addEventListener('click', startGame);
  
  // 暂停按钮
  document.getElementById('pauseBtn').addEventListener('click', togglePause);
  
  // 重新开始
  document.getElementById('restartBtn').addEventListener('click', () => {
    document.getElementById('gameOverModal').classList.remove('active');
    showStartScreen();
  });
}

// ==================== 游戏流程 ====================
function startGame() {
  const charConfig = CHARACTERS[gameState.player.character];
  
  // 初始化玩家状态
  gameState.player.x = canvas.width / 2;
  gameState.player.y = canvas.height / 2;
  gameState.player.hp = charConfig.hp;
  gameState.player.maxHp = charConfig.hp;
  gameState.player.damage = charConfig.damage;
  gameState.player.speed = CONFIG.playerSpeed * charConfig.moveSpeed;
  gameState.player.attackSpeed = charConfig.attackSpeed;
  gameState.player.level = 1;
  gameState.player.exp = 0;
  gameState.player.expToNext = 100;
  gameState.player.rage = 0;
  gameState.player.rageActive = false;
  gameState.player.combo = 0;
  
  // 重置武器
  gameState.weapons = {
    textbook: { level: 1, unlocked: true },
    chalk: { level: 0, unlocked: false },
    ruler: { level: 0, unlocked: false },
    basketball: { level: 0, unlocked: false },
    eraser: { level: 0, unlocked: false },
    broom: { level: 0, unlocked: false },
    ink: { level: 0, unlocked: false },
    triangle: { level: 0, unlocked: false },
    examPaper: { level: 0, unlocked: false }
  };
  
  // 重置超武
  gameState.superWeapons = {};
  
  // 重置解锁能力
  gameState.unlocks = {
    rageBoost: false,
    healOnKill: false,
    expBonus: false,
    itemLuck: false,
    crit: false,
    pickup: false
  };
  
  // 重置道具和效果
  gameState.items = [];
  gameState.activeEffects = {
    magnet: { active: false, endTime: 0 },
    shield: { active: false, endTime: 0 },
    speed: { active: false, endTime: 0, multiplier: 1 },
    exp: { active: false, endTime: 0, multiplier: 1 }
  };
  
  // 重置游戏对象
  gameState.enemies = [];
  gameState.bullets = [];
  gameState.particles = [];
  gameState.expOrbs = [];
  
  // 重置统计
  gameState.kills = 0;
  gameState.totalDamage = 0;
  gameState.maxCombo = 0;
  gameState.startTime = Date.now();
  gameState.lastTime = Date.now();
  gameState.running = true;
  gameState.paused = false;
  gameState.gameOver = false;
  
  // 隐藏开始界面
  document.getElementById('startScreen').classList.add('hidden');
  document.getElementById('hud').style.display = 'flex';
  document.getElementById('skillBar').style.display = 'flex';
  document.getElementById('hint').style.display = 'block';
  
  updateSkillBar();
}

function showStartScreen() {
  document.getElementById('startScreen').classList.remove('hidden');
  document.getElementById('hud').style.display = 'none';
  document.getElementById('skillBar').style.display = 'none';
  document.getElementById('hint').style.display = 'none';
  gameState.running = false;
  
  // 加载并显示存档数据
  updateStartScreenStats();
}

function updateStartScreenStats() {
  const saveData = SaveSystem.load();
  
  // 更新统计显示
  const statsHtml = `
    <div class="save-stats">
      <div class="stat-item">
        <span class="stat-label">最高分</span>
        <span class="stat-value">${saveData.highScore}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">总击杀</span>
        <span class="stat-value">${saveData.totalKills}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">游戏次数</span>
        <span class="stat-value">${saveData.totalGames}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">成就解锁</span>
        <span class="stat-value">${Object.keys(saveData.achievements).length}/${Object.keys(ACHIEVEMENTS).length}</span>
      </div>
    </div>
  `;
  
  const statsContainer = document.getElementById('saveStats');
  if (statsContainer) {
    statsContainer.innerHTML = statsHtml;
  }
  
  // 更新成就列表
  updateAchievementsList(saveData);
}

function updateAchievementsList(saveData) {
  const container = document.getElementById('achievementsList');
  if (!container) return;
  
  const html = Object.entries(ACHIEVEMENTS).map(([id, achievement]) => {
    const unlocked = saveData.achievements[id];
    return `
      <div class="achievement-item ${unlocked ? 'unlocked' : 'locked'}">
        <span class="achievement-emoji">${achievement.emoji}</span>
        <div class="achievement-info">
          <div class="achievement-name">${achievement.name}</div>
          <div class="achievement-desc">${achievement.description}</div>
        </div>
        ${unlocked ? '<span class="achievement-check">✓</span>' : ''}
      </div>
    `;
  }).join('');
  
  container.innerHTML = html;
}

function updateGameOverStats(saveData) {
  // 可以在这里更新游戏结束界面显示更多统计
  const container = document.getElementById('gameOverStats');
  if (container) {
    const minutes = Math.floor(saveData.totalPlayTime / 60000);
    container.innerHTML = `
      <div class="save-info">
        <div>历史最高分: <strong>${saveData.highScore}</strong></div>
        <div>累计击杀: <strong>${saveData.totalKills}</strong></div>
        <div>游戏次数: <strong>${saveData.totalGames}</strong></div>
        <div>总游戏时长: <strong>${minutes}分钟</strong></div>
      </div>
    `;
  }
}

function showAchievementUnlock(achievement) {
  const notification = document.createElement('div');
  notification.className = 'achievement-notification';
  notification.innerHTML = `
    <div class="achievement-unlock-icon">${achievement.emoji}</div>
    <div class="achievement-unlock-info">
      <div class="achievement-unlock-title">成就解锁!</div>
      <div class="achievement-unlock-name">${achievement.name}</div>
      <div class="achievement-unlock-desc">${achievement.description}</div>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // 播放音效提示（视觉反馈）
  notification.animate([
    { transform: 'translateX(100%)', opacity: 0 },
    { transform: 'translateX(0)', opacity: 1 },
    { transform: 'translateX(0)', opacity: 1 },
    { transform: 'translateX(0)', opacity: 1 }
  ], {
    duration: 3000,
    easing: 'ease-out'
  });
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.5s ease forwards';
    setTimeout(() => notification.remove(), 500);
  }, 4000);
}

function togglePause() {
  if (!gameState.running || gameState.gameOver) return;
  gameState.paused = !gameState.paused;
  document.getElementById('pauseBtn').textContent = gameState.paused ? '继续' : '暂停';
}

function gameOver() {
  gameState.gameOver = true;
  gameState.running = false;
  
  const surviveTime = Math.floor((Date.now() - gameState.startTime) / 1000);
  const minutes = Math.floor(surviveTime / 60).toString().padStart(2, '0');
  const seconds = (surviveTime % 60).toString().padStart(2, '0');
  const playTime = Date.now() - gameState.startTime;
  
  // 统计武器解锁数
  let weaponsUnlocked = 0;
  for (const weapon of Object.values(gameState.weapons)) {
    if (weapon.unlocked) weaponsUnlocked++;
  }
  
  // 保存游戏数据
  const gameStats = {
    kills: gameState.kills,
    playTime: playTime,
    level: gameState.player.level,
    maxCombo: gameState.maxCombo,
    bossKilled: gameState.bossKilled,
    rageKills: gameState.rageKills,
    weaponsUnlocked: weaponsUnlocked,
    noDamageRun: gameState.noDamageRun
  };
  
  const saveData = SaveSystem.updateStats(gameStats);
  
  document.getElementById('finalTime').textContent = `${minutes}:${seconds}`;
  document.getElementById('finalKills').textContent = gameState.kills;
  document.getElementById('finalLevel').textContent = gameState.player.level;
  
  // 更新游戏结束界面显示存档数据
  updateGameOverStats(saveData);
  
  document.getElementById('gameOverModal').classList.add('active');
}

// ==================== 游戏循环 ====================
function gameLoop() {
  const now = Date.now();
  const deltaTime = (now - gameState.lastTime) / 1000;
  gameState.lastTime = now;
  
  if (gameState.running && !gameState.paused) {
    update(deltaTime);
  }
  
  render();
  
  requestAnimationFrame(gameLoop);
}

function update(deltaTime) {
  const player = gameState.player;
  
  // 更新暴走状态
  updateRage(deltaTime);
  
  // 更新道具效果
  updateActiveEffects();
  
  // 玩家移动
  updatePlayerMovement(deltaTime);
  
  // 玩家攻击
  updatePlayerAttack(deltaTime);
  
  // 更新子弹
  updateBullets(deltaTime);
  
  // 生成敌人
  updateEnemySpawning(deltaTime);
  
  // 更新Boss
  updateBoss(deltaTime);
  
  // 更新敌人
  updateEnemies(deltaTime);
  
  // 更新道具
  updateItems(deltaTime);
  
  // 更新经验球
  updateExpOrbs(deltaTime);
  
  // 更新粒子
  updateParticles(deltaTime);
  
  // 更新连击
  updateCombo(deltaTime);
  
  // 更新UI
  updateUI();
}

// ==================== 玩家逻辑 ====================
function updatePlayerMovement(deltaTime) {
  const player = gameState.player;
  let dx = 0, dy = 0;
  
  if (keys['KeyW'] || keys['ArrowUp']) dy -= 1;
  if (keys['KeyS'] || keys['ArrowDown']) dy += 1;
  if (keys['KeyA'] || keys['ArrowLeft']) dx -= 1;
  if (keys['KeyD'] || keys['ArrowRight']) dx += 1;
  
  // 鼠标/触摸移动
  if (mouse.down) {
    const angle = Math.atan2(mouse.y - canvas.height/2, mouse.x - canvas.width/2);
    dx = Math.cos(angle);
    dy = Math.sin(angle);
  }
  
  // 归一化
  if (dx !== 0 || dy !== 0) {
    const len = Math.sqrt(dx * dx + dy * dy);
    dx /= len;
    dy /= len;
  }
  
  // 应用移动 (暴走 + 道具加速)
  let speedMultiplier = player.rageActive ? 1.5 : 1;
  if (gameState.activeEffects.speed.active) {
    speedMultiplier *= gameState.activeEffects.speed.multiplier;
  }
  const speed = player.speed * speedMultiplier;
  player.x += dx * speed;
  player.y += dy * speed;
  
  // 边界限制
  const margin = 50;
  player.x = Math.max(margin, Math.min(3000 - margin, player.x));
  player.y = Math.max(margin, Math.min(3000 - margin, player.y));
}

function updatePlayerAttack(deltaTime) {
  const player = gameState.player;
  
  // 遍历所有已解锁的武器
  Object.entries(gameState.weapons).forEach(([weaponId, weaponData]) => {
    if (!weaponData.unlocked) return;
    
    const weapon = WEAPONS[weaponId];
    const fireRate = 1 / (player.attackSpeed * weapon.speed * (player.rageActive ? 2 : 1));
    
    if (!weaponData.lastFire || Date.now() - weaponData.lastFire > fireRate * 1000) {
      fireWeapon(weaponId, weapon, weaponData);
      weaponData.lastFire = Date.now();
    }
  });
}

function fireWeapon(weaponId, weapon, weaponData) {
  const player = gameState.player;
  const count = weaponData.level;
  
  // 寻找最近敌人
  let target = null;
  let minDist = Infinity;
  
  gameState.enemies.forEach(enemy => {
    const dist = Math.hypot(enemy.x - player.x, enemy.y - player.y);
    if (dist < minDist && dist < 500) {
      minDist = dist;
      target = enemy;
    }
  });
  
  const angle = target 
    ? Math.atan2(target.y - player.y, target.x - player.x)
    : 0;
  
  switch (weaponId) {
    case 'textbook':
      for (let i = 0; i < count; i++) {
        const spread = (i - count/2) * 0.2;
        createBullet(player.x, player.y, angle + spread, weapon);
      }
      break;
      
    case 'chalk':
      for (let i = 0; i < 3; i++) {
        const spread = (i - 1) * 0.3;
        createBullet(player.x, player.y, angle + spread, weapon);
      }
      break;
      
    case 'ruler':
      for (let i = 0; i < 4; i++) {
        const rotation = (Date.now() / 1000) + (i * Math.PI / 2);
        createBullet(player.x, player.y, rotation, weapon, true);
      }
      break;
      
    case 'basketball':
      createBullet(player.x, player.y, angle, weapon);
      break;
      
    case 'eraser':
      createBullet(player.x, player.y, angle, weapon);
      break;
  }
}

function createBullet(x, y, angle, weapon, orbit = false) {
  gameState.bullets.push({
    x, y,
    vx: Math.cos(angle) * CONFIG.bulletSpeed * weapon.speed,
    vy: Math.sin(angle) * CONFIG.bulletSpeed * weapon.speed,
    damage: gameState.player.damage * weapon.damage,
    weapon,
    orbit,
    orbitAngle: angle,
    pierce: weapon.pierce || 0,
    hitEnemies: new Set()
  });
}

// ==================== 暴走系统 ====================
function updateRage(deltaTime) {
  const player = gameState.player;
  const now = Date.now();
  
  // 暴走结束
  if (player.rageActive && now > player.rageEndTime) {
    player.rageActive = false;
    player.rageCooldownEnd = now + CONFIG.rageCooldown;
    document.getElementById('rageIndicator').classList.remove('active');
    document.getElementById('rageBarContainer').style.opacity = '0';
  }
  
  // 自然衰减怒气
  if (!player.rageActive && player.rage > 0 && now > player.rageCooldownEnd) {
    player.rage = Math.max(0, player.rage - deltaTime * 5);
  }
}

function activateRage() {
  const player = gameState.player;
  const now = Date.now();
  
  if (player.rageActive || now < player.rageCooldownEnd || player.rage < 100) {
    return;
  }
  
  player.rageActive = true;
  player.rageEndTime = now + CONFIG.rageDuration;
  player.rage = 0;
  
  document.getElementById('rageIndicator').classList.add('active');
  
  // 暴走特效
  createRageEffect();
}

function addRage(amount) {
  const player = gameState.player;
  if (player.rageActive) return;
  
  const charConfig = CHARACTERS[player.character];
  player.rage = Math.min(100, player.rage + amount * charConfig.rageBuild);
  
  if (player.rage >= 100) {
    document.getElementById('rageBarContainer').style.opacity = '1';
  }
}

// ==================== 道具系统 ====================
function spawnItem(x, y, itemId) {
  const item = ITEMS[itemId];
  gameState.items.push({
    x: x,
    y: y,
    id: itemId,
    emoji: item.emoji,
    color: item.color,
    life: 15000, // 15秒后消失
    createdAt: Date.now(),
    pulse: 0
  });
}

function updateItems(deltaTime) {
  const now = Date.now();
  const player = gameState.player;
  
  gameState.items = gameState.items.filter(item => {
    // 更新脉冲动画
    item.pulse += deltaTime * 5;
    
    // 检查是否过期
    if (now - item.createdAt > item.life) {
      return false;
    }
    
    // 检查玩家是否拾取
    const dx = player.x - item.x;
    const dy = player.y - item.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < 40) {
      pickupItem(item);
      return false;
    }
    
    return true;
  });
}

function pickupItem(item) {
  const itemConfig = ITEMS[item.id];
  const now = Date.now();
  
  // 播放拾取音效 (视觉反馈)
  showFloatingText(item.x, item.y, itemConfig.name, itemConfig.color);
  
  switch (itemConfig.effect) {
    case 'heal':
      healPlayer(itemConfig.value);
      break;
    case 'magnet':
      gameState.activeEffects.magnet.active = true;
      gameState.activeEffects.magnet.endTime = now + itemConfig.duration;
      showEffectIndicator('🧲 知识磁铁!', '#ffd93d');
      break;
    case 'shield':
      gameState.activeEffects.shield.active = true;
      gameState.activeEffects.shield.endTime = now + itemConfig.duration;
      showEffectIndicator('🛡️ 作业护盾!', '#74b9ff');
      break;
    case 'speed':
      gameState.activeEffects.speed.active = true;
      gameState.activeEffects.speed.endTime = now + itemConfig.duration;
      gameState.activeEffects.speed.multiplier = itemConfig.value;
      showEffectIndicator('👟 极速模式!', '#55efc4');
      break;
    case 'exp':
      gameState.activeEffects.exp.active = true;
      gameState.activeEffects.exp.endTime = now + itemConfig.duration;
      gameState.activeEffects.exp.multiplier = itemConfig.value;
      showEffectIndicator('📝 双倍经验!', '#a29bfe');
      break;
    case 'bomb':
      activateBomb(itemConfig.value);
      break;
  }
  
  // 粒子特效
  for (let i = 0; i < 8; i++) {
    gameState.particles.push({
      x: item.x,
      y: item.y,
      vx: (Math.random() - 0.5) * 15,
      vy: (Math.random() - 0.5) * 15,
      life: 0.8,
      color: itemConfig.color,
      size: Math.random() * 6 + 4
    });
  }
}

function healPlayer(amount) {
  const player = gameState.player;
  const oldHp = player.hp;
  player.hp = Math.min(player.maxHp, player.hp + amount);
  const healed = player.hp - oldHp;
  
  if (healed > 0) {
    showFloatingText(player.x, player.y - 30, `+${healed} ❤️`, '#ff6b6b');
  }
}

function activateBomb(damage) {
  showEffectIndicator('💣 大扫除炸弹!', '#ff7675');
  
  // 全屏爆炸效果
  gameState.enemies.forEach(enemy => {
    enemy.hp -= damage;
    
    // 爆炸粒子
    for (let i = 0; i < 3; i++) {
      gameState.particles.push({
        x: enemy.x,
        y: enemy.y,
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.5) * 20,
        life: 1,
        color: '#ff7675',
        size: Math.random() * 8 + 5
      });
    }
    
    if (enemy.hp <= 0) {
      killEnemy(enemy);
    }
  });
}

function updateActiveEffects() {
  const now = Date.now();
  let effectsChanged = false;
  
  for (const [effect, data] of Object.entries(gameState.activeEffects)) {
    if (data.active && now > data.endTime) {
      data.active = false;
      if (effect === 'speed') data.multiplier = 1;
      if (effect === 'exp') data.multiplier = 1;
      effectsChanged = true;
    }
  }
  
  // 更新效果指示器UI
  updateEffectIndicators();
}

function updateEffectIndicators() {
  const container = document.getElementById('activeEffects');
  if (!container) return;
  
  const effects = [];
  const now = Date.now();
  
  if (gameState.activeEffects.magnet.active) {
    const remaining = Math.ceil((gameState.activeEffects.magnet.endTime - now) / 1000);
    effects.push({ type: 'magnet', icon: '🧲', name: '磁铁', time: remaining });
  }
  if (gameState.activeEffects.shield.active) {
    const remaining = Math.ceil((gameState.activeEffects.shield.endTime - now) / 1000);
    effects.push({ type: 'shield', icon: '🛡️', name: '护盾', time: remaining });
  }
  if (gameState.activeEffects.speed.active) {
    const remaining = Math.ceil((gameState.activeEffects.speed.endTime - now) / 1000);
    effects.push({ type: 'speed', icon: '👟', name: '加速', time: remaining });
  }
  if (gameState.activeEffects.exp.active) {
    const remaining = Math.ceil((gameState.activeEffects.exp.endTime - now) / 1000);
    effects.push({ type: 'exp', icon: '📝', name: '双倍经验', time: remaining });
  }
  
  container.innerHTML = effects.map(e => `
    <div class="effect-badge ${e.type}">
      <span>${e.icon}</span>
      <span>${e.name}</span>
      <span style="margin-left:auto;color:#888;">${e.time}s</span>
    </div>
  `).join('');
}

function showEffectIndicator(text, color) {
  const indicator = document.createElement('div');
  indicator.style.cssText = `
    position: fixed;
    top: 30%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 24px;
    font-weight: bold;
    color: ${color};
    text-shadow: 0 0 20px ${color};
    pointer-events: none;
    z-index: 1000;
    animation: effectPulse 2s ease-out forwards;
  `;
  indicator.textContent = text;
  document.body.appendChild(indicator);
  
  setTimeout(() => indicator.remove(), 2000);
}

function showFloatingText(x, y, text, color) {
  // 转换为屏幕坐标
  const screenX = x - camera.x;
  const screenY = y - camera.y;
  
  const el = document.createElement('div');
  el.style.cssText = `
    position: absolute;
    left: ${screenX}px;
    top: ${screenY}px;
    font-size: 16px;
    font-weight: bold;
    color: ${color};
    pointer-events: none;
    z-index: 100;
    animation: floatUp 1s ease-out forwards;
  `;
  el.textContent = text;
  document.getElementById('gameCanvas').parentElement.appendChild(el);
  
  setTimeout(() => el.remove(), 1000);
}

function createRageEffect() {
  // 清屏伤害
  gameState.enemies.forEach(enemy => {
    enemy.hp -= gameState.player.damage * 5;
    if (enemy.hp <= 0) {
      killEnemy(enemy);
    }
  });
  
  // 粒子特效
  for (let i = 0; i < 50; i++) {
    gameState.particles.push({
      x: gameState.player.x,
      y: gameState.player.y,
      vx: (Math.random() - 0.5) * 20,
      vy: (Math.random() - 0.5) * 20,
      life: 1,
      color: '#ff3838',
      size: Math.random() * 10 + 5
    });
  }
}

// ==================== 敌人逻辑 ====================
function updateEnemySpawning(deltaTime) {
  const spawnRate = Math.max(200, CONFIG.spawnInterval - gameState.player.level * 50);
  
  if (!gameState.lastSpawn || Date.now() - gameState.lastSpawn > spawnRate) {
    spawnEnemy();
    gameState.lastSpawn = Date.now();
  }
}

function spawnEnemy() {
  if (gameState.enemies.length >= CONFIG.maxEnemies) return;
  
  const player = gameState.player;
  const angle = Math.random() * Math.PI * 2;
  const distance = 400 + Math.random() * 200;
  
  // 根据等级选择敌人类型
  let type = 'minion';
  const rand = Math.random();
  if (player.level > 5 && rand < 0.2) type = 'runner';
  if (player.level > 10 && rand < 0.1) type = 'tank';
  
  const enemyType = ENEMY_TYPES[type];
  
  gameState.enemies.push({
    x: player.x + Math.cos(angle) * distance,
    y: player.y + Math.sin(angle) * distance,
    type,
    hp: enemyType.hp * (1 + player.level * 0.1),
    maxHp: enemyType.hp * (1 + player.level * 0.1),
    damage: enemyType.damage,
    speed: enemyType.speed * CONFIG.enemyBaseSpeed,
    exp: enemyType.exp,
    size: enemyType.size
  });
}

function spawnEnemyAt(x, y, type) {
  const enemyType = ENEMY_TYPES[type];
  gameState.enemies.push({
    x: x,
    y: y,
    type,
    hp: enemyType.hp * (1 + gameState.player.level * 0.1),
    maxHp: enemyType.hp * (1 + gameState.player.level * 0.1),
    damage: enemyType.damage,
    speed: enemyType.speed * CONFIG.enemyBaseSpeed,
    exp: enemyType.exp,
    size: enemyType.size
  });
}

// ==================== Boss系统 ====================
function updateBoss(deltaTime) {
  // 检查是否应该生成Boss
  if (!gameState.boss && Date.now() - gameState.startTime > gameState.nextBossSpawn) {
    spawnBoss();
  }
  
  if (!gameState.boss) return;
  
  const boss = gameState.boss;
  const player = gameState.player;
  const now = Date.now();
  
  // 计算当前阶段
  const hpPercent = boss.hp / boss.maxHp;
  let currentPhase = BOSS_CONFIG.phases[0];
  for (const phase of BOSS_CONFIG.phases) {
    if (hpPercent <= phase.hpPercent) {
      currentPhase = phase;
    }
  }
  boss.phase = currentPhase;
  
  // Boss移动 - 始终朝向玩家
  const angle = Math.atan2(player.y - boss.y, player.x - boss.x);
  boss.vx = Math.cos(angle) * boss.speed * currentPhase.multiplier;
  boss.vy = Math.sin(angle) * boss.speed * currentPhase.multiplier;
  
  boss.x += boss.vx;
  boss.y += boss.vy;
  
  // Boss技能
  for (const skill of BOSS_CONFIG.skills) {
    if (now - skill.lastUsed > skill.cooldown / currentPhase.multiplier) {
      skill.execute(boss, player);
      skill.lastUsed = now;
    }
  }
  
  // 碰撞检测 - Boss攻击玩家
  const dist = Math.hypot(player.x - boss.x, player.y - boss.y);
  if (dist < 50 + boss.size) {
    if (!gameState.activeEffects.shield.active) {
      const damage = boss.damage * currentPhase.multiplier;
      player.hp -= damage;
      gameState.damageTaken += damage;
      gameState.noDamageRun = false;
    }
    
    // 击退
    boss.x -= Math.cos(angle) * 30;
    boss.y -= Math.sin(angle) * 30;
  }
  
  // 更新敌人子弹
  updateEnemyBullets(deltaTime);
}

function spawnBoss() {
  const player = gameState.player;
  const angle = Math.random() * Math.PI * 2;
  const distance = 500;
  
  gameState.boss = {
    x: player.x + Math.cos(angle) * distance,
    y: player.y + Math.sin(angle) * distance,
    hp: BOSS_CONFIG.baseHp * (1 + gameState.bossKilled * 0.5),
    maxHp: BOSS_CONFIG.baseHp * (1 + gameState.bossKilled * 0.5),
    damage: BOSS_CONFIG.damage,
    speed: BOSS_CONFIG.speed,
    size: BOSS_CONFIG.size,
    phase: BOSS_CONFIG.phases[0],
    vx: 0,
    vy: 0,
    skills: JSON.parse(JSON.stringify(BOSS_CONFIG.skills)) // 深拷贝技能
  };
  
  // 显示Boss出现警告
  showBossWarning();
}

function showBossWarning() {
  const warning = document.createElement('div');
  warning.style.cssText = `
    position: fixed;
    top: 30%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 36px;
    font-weight: 900;
    color: #ff3838;
    text-shadow: 0 0 30px #ff3838;
    pointer-events: none;
    z-index: 1000;
    animation: bossWarning 3s ease-out forwards;
    text-align: center;
  `;
  warning.innerHTML = '⚠️ 教导主任来了! ⚠️<br><span style="font-size:18px">准备战斗!</span>';
  document.body.appendChild(warning);
  
  setTimeout(() => warning.remove(), 3000);
}

function showBossSkillEffect(x, y, text) {
  const effect = document.createElement('div');
  effect.style.cssText = `
    position: absolute;
    left: ${x - camera.x}px;
    top: ${y - camera.y}px;
    font-size: 20px;
    font-weight: bold;
    color: #ff6b6b;
    text-shadow: 0 0 10px #ff6b6b;
    pointer-events: none;
    z-index: 100;
    animation: floatUp 1.5s ease-out forwards;
  `;
  effect.textContent = text;
  document.getElementById('gameCanvas').parentElement.appendChild(effect);
  
  setTimeout(() => effect.remove(), 1500);
}

function updateEnemyBullets(deltaTime) {
  gameState.bullets = gameState.bullets.filter(bullet => {
    if (!bullet.isEnemyBullet) return true;
    
    bullet.x += bullet.vx;
    bullet.y += bullet.vy;
    bullet.life -= deltaTime;
    
    // 检测与玩家碰撞
    const dist = Math.hypot(gameState.player.x - bullet.x, gameState.player.y - bullet.y);
    if (dist < 30 && !gameState.activeEffects.shield.active) {
      gameState.player.hp -= bullet.damage;
      gameState.damageTaken += bullet.damage;
      gameState.noDamageRun = false;
      return false;
    }
    
    return bullet.life > 0;
  });
}

function killBoss() {
  const boss = gameState.boss;
  
  // 大量经验
  for (let i = 0; i < 20; i++) {
    gameState.expOrbs.push({
      x: boss.x + (Math.random() - 0.5) * 100,
      y: boss.y + (Math.random() - 0.5) * 100,
      exp: Math.floor(BOSS_CONFIG.exp / 20),
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4
    });
  }
  
  // 必定掉落道具
  const itemIds = Object.keys(ITEMS);
  const randomItem = itemIds[Math.floor(Math.random() * itemIds.length)];
  spawnItem(boss.x, boss.y, randomItem);
  
  // 爆炸特效
  for (let i = 0; i < 30; i++) {
    gameState.particles.push({
      x: boss.x,
      y: boss.y,
      vx: (Math.random() - 0.5) * 20,
      vy: (Math.random() - 0.5) * 20,
      life: 1.5,
      color: '#ff3838',
      size: Math.random() * 10 + 5
    });
  }
  
  gameState.bossKilled++;
  gameState.boss = null;
  gameState.nextBossSpawn = Date.now() - gameState.startTime + CONFIG.bossSpawnInterval;
  
  // 显示击败提示
  showBossDefeated();
}

function showBossDefeated() {
  const msg = document.createElement('div');
  msg.style.cssText = `
    position: fixed;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 32px;
    font-weight: 900;
    color: #2ed573;
    text-shadow: 0 0 20px #2ed573;
    pointer-events: none;
    z-index: 1000;
    animation: bossWarning 2s ease-out forwards;
  `;
  msg.textContent = '🎉 教导主任被击败了!';
  document.body.appendChild(msg);
  
  setTimeout(() => msg.remove(), 2000);
}

function updateEnemies(deltaTime) {
  const player = gameState.player;
  
  gameState.enemies = gameState.enemies.filter(enemy => {
    // 向玩家移动
    const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
    enemy.x += Math.cos(angle) * enemy.speed;
    enemy.y += Math.sin(angle) * enemy.speed;
    
    // 碰撞检测
    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    if (dist < 30 + enemy.size) {
      // 护盾效果 - 无敌
      if (gameState.activeEffects.shield.active) {
        // 击退敌人但不受伤
        enemy.x -= Math.cos(angle) * 80;
        enemy.y -= Math.sin(angle) * 80;
      } else {
        // 伤害玩家
        const damage = enemy.damage * (player.rageActive ? 0.5 : 1);
        player.hp -= damage;
        gameState.damageTaken += damage;
        gameState.noDamageRun = false;
        
        // 击退
        enemy.x -= Math.cos(angle) * 50;
        enemy.y -= Math.sin(angle) * 50;
        
        if (player.hp <= 0) {
          gameOver();
        }
      }
    }
    
    return enemy.hp > 0;
  });
}

function killEnemy(enemy) {
  const enemyType = ENEMY_TYPES[enemy.type];
  
  // 掉落经验 (应用经验加成)
  const expMultiplier = gameState.activeEffects.exp.active ? gameState.activeEffects.exp.multiplier : 1;
  gameState.expOrbs.push({
    x: enemy.x,
    y: enemy.y,
    exp: Math.floor(enemyType.exp * expMultiplier),
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2
  });
  
  // 道具掉落
  const itemLuck = gameState.unlocks.itemLuck ? 1.5 : 1;
  const rand = Math.random();
  let cumulativeRate = 0;
  
  for (const [itemId, item] of Object.entries(ITEMS)) {
    cumulativeRate += item.spawnRate * itemLuck;
    if (rand < cumulativeRate) {
      spawnItem(enemy.x, enemy.y, itemId);
      break;
    }
  }
  
  // 吸血效果
  if (gameState.unlocks.healOnKill) {
    healPlayer(5);
  }
  
  // 增加怒气
  addRage(5);
  
  // 连击
  gameState.player.combo++;
  gameState.player.comboLastTime = Date.now();
  if (gameState.player.combo > gameState.maxCombo) {
    gameState.maxCombo = gameState.player.combo;
  }
  showCombo();
  
  // 暴走击杀统计
  if (gameState.player.rageActive) {
    gameState.rageKills++;
  }
  
  // 粒子特效
  for (let i = 0; i < 5; i++) {
    gameState.particles.push({
      x: enemy.x,
      y: enemy.y,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10,
      life: 0.5,
      color: '#ffa502',
      size: Math.random() * 5 + 3
    });
  }
  
  gameState.kills++;
}

// ==================== 子弹逻辑 ====================
function updateBullets(deltaTime) {
  const player = gameState.player;
  
  gameState.bullets = gameState.bullets.filter(bullet => {
    if (bullet.orbit) {
      // 环绕子弹
      bullet.orbitAngle += deltaTime * 3;
      bullet.x = player.x + Math.cos(bullet.orbitAngle) * 80;
      bullet.y = player.y + Math.sin(bullet.orbitAngle) * 80;
    } else {
      // 普通子弹
      bullet.x += bullet.vx;
      bullet.y += bullet.vy;
    }
    
    // 跳过敌人子弹
    if (bullet.isEnemyBullet) return true;
    
    // 碰撞检测 - 普通敌人
    let hit = false;
    gameState.enemies.forEach(enemy => {
      if (bullet.hitEnemies.has(enemy)) return;
      
      const dist = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);
      if (dist < enemy.size + 10) {
        enemy.hp -= bullet.damage;
        bullet.hitEnemies.add(enemy);
        
        if (bullet.pierce <= 0) {
          hit = true;
        } else {
          bullet.pierce--;
        }
        
        if (enemy.hp <= 0) {
          killEnemy(enemy);
        }
      }
    });
    
    // 碰撞检测 - Boss
    if (gameState.boss && !hit) {
      const boss = gameState.boss;
      const dist = Math.hypot(bullet.x - boss.x, bullet.y - boss.y);
      if (dist < boss.size + 10) {
        boss.hp -= bullet.damage;
        
        // Boss受伤特效
        gameState.particles.push({
          x: bullet.x,
          y: bullet.y,
          vx: (Math.random() - 0.5) * 5,
          vy: (Math.random() - 0.5) * 5,
          life: 0.5,
          color: '#ff3838',
          size: 5
        });
        
        if (bullet.pierce <= 0) {
          hit = true;
        } else {
          bullet.pierce--;
        }
        
        if (boss.hp <= 0) {
          killBoss();
        }
      }
    }
    
    // 边界检查
    const outOfBounds = Math.abs(bullet.x - player.x) > 600 || Math.abs(bullet.y - player.y) > 600;
    
    return !hit && !outOfBounds;
  });
}

// ==================== 经验球逻辑 ====================
function updateExpOrbs(deltaTime) {
  const player = gameState.player;
  // 磁铁效果增加吸附范围
  const magnetActive = gameState.activeEffects.magnet.active;
  const pickupRange = 100 + (gameState.unlocks.pickup ? 30 : 0);
  const attractRange = magnetActive ? 300 : pickupRange;
  const attractSpeed = magnetActive ? 1.5 : 0.5;
  
  gameState.expOrbs = gameState.expOrbs.filter(orb => {
    // 向玩家吸附
    const dist = Math.hypot(player.x - orb.x, player.y - orb.y);
    
    if (dist < attractRange) {
      const angle = Math.atan2(player.y - orb.y, player.x - orb.x);
      orb.vx += Math.cos(angle) * attractSpeed;
      orb.vy += Math.sin(angle) * attractSpeed;
    }
    
    orb.x += orb.vx;
    orb.y += orb.vy;
    orb.vx *= 0.95;
    orb.vy *= 0.95;
    
    // 拾取 (磁铁效果下范围更大)
    const pickupDist = magnetActive ? 50 : 30;
    if (dist < pickupDist) {
      gainExp(orb.exp);
      return false;
    }
    
    return true;
  });
}

function gainExp(amount) {
  const player = gameState.player;
  player.exp += amount;
  
  if (player.exp >= player.expToNext) {
    player.exp -= player.expToNext;
    player.level++;
    player.expToNext = Math.floor(player.expToNext * 1.2);
    
    // 升级恢复
    player.hp = Math.min(player.maxHp, player.hp + 20);
    
    showUpgradeModal();
  }
}

// ==================== 升级系统 ====================
function showUpgradeModal() {
  gameState.paused = true;
  
  const options = [];
  const availableUpgrades = UPGRADES.filter(u => {
    if (u.type === 'weapon') {
      return !gameState.weapons[u.id].unlocked || gameState.weapons[u.id].level < 5;
    }
    return true;
  });
  
  while (options.length < 3 && availableUpgrades.length > 0) {
    const idx = Math.floor(Math.random() * availableUpgrades.length);
    const upgrade = availableUpgrades.splice(idx, 1)[0];
    options.push(upgrade);
  }
  
  const container = document.getElementById('upgradeOptions');
  container.innerHTML = options.map(upgrade => `
    <div class="upgrade-card" onclick="selectUpgrade('${upgrade.type}', '${upgrade.id}')">
      <div class="upgrade-icon">${upgrade.emoji}</div>
      <div class="upgrade-name">${upgrade.name}</div>
      <div class="upgrade-desc">${upgrade.desc}</div>
    </div>
  `).join('');
  
  document.getElementById('upgradeModal').classList.add('active');
}

function selectUpgrade(type, id) {
  const player = gameState.player;
  
  switch (type) {
    case 'weapon':
      if (!gameState.weapons[id].unlocked) {
        gameState.weapons[id].unlocked = true;
      }
      gameState.weapons[id].level++;
      break;
      
    case 'stat':
      switch (id) {
        case 'damage':
          player.damage *= 1.2;
          break;
        case 'speed':
          player.speed *= 1.15;
          break;
        case 'hp':
          player.maxHp += 30;
          player.hp += 30;
          break;
        case 'attackSpeed':
          player.attackSpeed *= 1.25;
          break;
        case 'crit':
          gameState.unlocks.crit = true;
          break;
        case 'pickup':
          gameState.unlocks.pickup = true;
          break;
      }
      break;
      
    case 'special':
      switch (id) {
        case 'rageBoost':
          CONFIG.rageDuration += 2000;
          gameState.unlocks.rageBoost = true;
          break;
        case 'healOnKill':
          gameState.unlocks.healOnKill = true;
          break;
        case 'expBonus':
          gameState.unlocks.expBonus = true;
          break;
        case 'itemLuck':
          gameState.unlocks.itemLuck = true;
          break;
      }
      break;
  }
  
  document.getElementById('upgradeModal').classList.remove('active');
  gameState.paused = false;
  updateSkillBar();
}

// ==================== 粒子系统 ====================
function updateParticles(deltaTime) {
  gameState.particles = gameState.particles.filter(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.life -= deltaTime;
    p.vx *= 0.95;
    p.vy *= 0.95;
    return p.life > 0;
  });
}

// ==================== 连击系统 ====================
function updateCombo(deltaTime) {
  const player = gameState.player;
  if (player.combo > 0 && Date.now() - player.comboLastTime > CONFIG.comboTimeout) {
    player.combo = 0;
    document.getElementById('comboDisplay').classList.remove('active');
  }
}

function showCombo() {
  const display = document.getElementById('comboDisplay');
  if (gameState.player.combo >= 5) {
    display.textContent = `x${gameState.player.combo} 连击!`;
    display.classList.add('active');
  }
}

// ==================== 渲染 ====================
function render() {
  const player = gameState.player;
  
  // 清空画布
  ctx.fillStyle = '#1e272e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // 相机跟随
  camera.x = player.x - canvas.width / 2;
  camera.y = player.y - canvas.height / 2;
  
  ctx.save();
  ctx.translate(-camera.x, -camera.y);
  
  // 绘制网格背景
  drawGrid();
  
  // 绘制经验球
  gameState.expOrbs.forEach(orb => {
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#2ed573';
    ctx.fill();
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#2ed573';
  });
  ctx.shadowBlur = 0;
  
  // 绘制道具
  gameState.items.forEach(item => {
    const pulse = Math.sin(item.pulse) * 3;
    const itemConfig = ITEMS[item.id];
    
    // 光晕
    ctx.beginPath();
    ctx.arc(item.x, item.y, 18 + pulse, 0, Math.PI * 2);
    ctx.fillStyle = itemConfig.color + '40';
    ctx.fill();
    
    // 背景圆
    ctx.beginPath();
    ctx.arc(item.x, item.y, 15, 0, Math.PI * 2);
    ctx.fillStyle = '#2d3436';
    ctx.fill();
    ctx.strokeStyle = itemConfig.color;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 图标
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(itemConfig.emoji, item.x, item.y);
  });
  
  // 绘制粒子
  gameState.particles.forEach(p => {
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
  });
  ctx.globalAlpha = 1;
  
  // 绘制敌人
  gameState.enemies.forEach(enemy => {
    const enemyType = ENEMY_TYPES[enemy.type];
    
    // 血条
    const hpPercent = enemy.hp / enemy.maxHp;
    ctx.fillStyle = '#2d3436';
    ctx.fillRect(enemy.x - 20, enemy.y - enemy.size - 10, 40, 4);
    ctx.fillStyle = hpPercent > 0.5 ? '#2ed573' : '#ff4757';
    ctx.fillRect(enemy.x - 20, enemy.y - enemy.size - 10, 40 * hpPercent, 4);
    
    // 敌人
    ctx.font = `${enemy.size}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(enemyType.emoji, enemy.x, enemy.y);
  });
  
  // 绘制Boss
  if (gameState.boss) {
    const boss = gameState.boss;
    
    // Boss血条背景
    const barWidth = 200;
    const barHeight = 12;
    ctx.fillStyle = '#2d3436';
    ctx.fillRect(boss.x - barWidth/2, boss.y - boss.size - 25, barWidth, barHeight);
    
    // Boss血条
    const hpPercent = boss.hp / boss.maxHp;
    const gradient = ctx.createLinearGradient(boss.x - barWidth/2, 0, boss.x + barWidth/2, 0);
    gradient.addColorStop(0, '#ff3838');
    gradient.addColorStop(0.5, '#ff6b6b');
    gradient.addColorStop(1, '#ff3838');
    ctx.fillStyle = gradient;
    ctx.fillRect(boss.x - barWidth/2, boss.y - boss.size - 25, barWidth * hpPercent, barHeight);
    
    // 血条边框
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(boss.x - barWidth/2, boss.y - boss.size - 25, barWidth, barHeight);
    
    // Boss名字
    ctx.fillStyle = '#ff6b6b';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('👨‍🏫 教导主任', boss.x, boss.y - boss.size - 35);
    
    // Boss本体 - 带呼吸效果
    const pulse = Math.sin(Date.now() / 200) * 3;
    ctx.font = `${boss.size + pulse}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ff3838';
    ctx.fillText('👨‍🏫', boss.x, boss.y);
    ctx.shadowBlur = 0;
    
    // Boss阶段指示
    const phaseColors = ['#2ed573', '#ffa502', '#ff4757', '#ff3838'];
    const phaseIndex = Math.floor((1 - hpPercent) * 4);
    ctx.fillStyle = phaseColors[Math.min(phaseIndex, 3)];
    ctx.beginPath();
    ctx.arc(boss.x + boss.size, boss.y - boss.size, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // 绘制敌人子弹
  gameState.bullets.forEach(bullet => {
    if (bullet.isEnemyBullet) {
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(bullet.emoji, bullet.x, bullet.y);
    }
  });
  
  // 绘制子弹
  gameState.bullets.forEach(bullet => {
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#ffa502';
    ctx.fill();
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ffa502';
  });
  ctx.shadowBlur = 0;
  
  // 绘制玩家
  const charConfig = CHARACTERS[player.character];
  
  // 护盾光环
  if (gameState.activeEffects.shield.active) {
    ctx.beginPath();
    ctx.arc(player.x, player.y, 45, 0, Math.PI * 2);
    ctx.strokeStyle = '#74b9ff';
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#74b9ff';
    
    // 护盾旋转效果
    const shieldAngle = Date.now() / 500;
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(shieldAngle);
    ctx.strokeStyle = '#74b9ff80';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(0, 0, 50, (i * Math.PI / 2), (i * Math.PI / 2) + 0.5);
      ctx.stroke();
    }
    ctx.restore();
  }
  
  // 暴走光环
  if (player.rageActive) {
    ctx.beginPath();
    ctx.arc(player.x, player.y, 50, 0, Math.PI * 2);
    ctx.strokeStyle = '#ff3838';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ff3838';
  }
  
  // 加速效果拖尾
  if (gameState.activeEffects.speed.active) {
    ctx.globalAlpha = 0.3;
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(charConfig.emoji, player.x - 10, player.y);
    ctx.fillText(charConfig.emoji, player.x - 5, player.y);
    ctx.globalAlpha = 1;
  }
  
  ctx.font = '40px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(charConfig.emoji, player.x, player.y);
  ctx.shadowBlur = 0;
  
  ctx.restore();
}

function drawGrid() {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  
  const gridSize = 100;
  const startX = Math.floor(camera.x / gridSize) * gridSize;
  const startY = Math.floor(camera.y / gridSize) * gridSize;
  
  for (let x = startX; x < camera.x + canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, camera.y);
    ctx.lineTo(x, camera.y + canvas.height);
    ctx.stroke();
  }
  
  for (let y = startY; y < camera.y + canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(camera.x, y);
    ctx.lineTo(camera.x + canvas.width, y);
    ctx.stroke();
  }
}

// ==================== UI更新 ====================
function updateUI() {
  const player = gameState.player;
  
  // HP
  const hpPercent = (player.hp / player.maxHp) * 100;
  document.getElementById('hpBar').style.width = hpPercent + '%';
  document.getElementById('hpText').textContent = `${Math.ceil(player.hp)}/${player.maxHp}`;
  
  // EXP
  const expPercent = (player.exp / player.expToNext) * 100;
  document.getElementById('expBar').style.width = expPercent + '%';
  document.getElementById('levelText').textContent = `Lv.${player.level}`;
  
  // 怒气
  if (player.rage > 0 || player.rageActive) {
    document.getElementById('rageBarContainer').style.opacity = '1';
    document.getElementById('rageBar').style.width = player.rageActive ? '100%' : player.rage + '%';
    document.getElementById('rageText').textContent = player.rageActive ? '暴走中!' : Math.floor(player.rage) + '%';
  }
  
  // 等级
  document.getElementById('levelPill').textContent = `Lv.${player.level}`;
  
  // 时间
  const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
  const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
  const seconds = (elapsed % 60).toString().padStart(2, '0');
  document.getElementById('timePill').textContent = `${minutes}:${seconds}`;
  
  // 击杀
  document.getElementById('killPill').textContent = `击败: ${gameState.kills}`;
}

function updateSkillBar() {
  const slots = document.querySelectorAll('.skill-slot');
  let slotIdx = 0;
  
  Object.entries(gameState.weapons).forEach(([id, data]) => {
    if (data.unlocked && slotIdx < slots.length) {
      const weapon = WEAPONS[id];
      slots[slotIdx].textContent = weapon.emoji;
      slots[slotIdx].classList.add('active');
      if (gameState.player.rageActive) {
        slots[slotIdx].classList.add('rage-skill');
      } else {
        slots[slotIdx].classList.remove('rage-skill');
      }
      slotIdx++;
    }
  });
  
  // 清空未使用的槽
  for (let i = slotIdx; i < slots.length; i++) {
    slots[i].textContent = '';
    slots[i].classList.remove('active', 'rage-skill');
  }
}

// ==================== 启动 ====================
window.addEventListener('load', init);
