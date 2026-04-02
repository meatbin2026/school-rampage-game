// 校园暴走 - 割草游戏核心逻辑
// 基于开源项目 suvivor 修改完善

// ==================== 屏幕震动系统 ====================
const ScreenShake = {
  intensity: 0,
  duration: 0,
  
  shake(intensity, duration) {
    this.intensity = intensity;
    this.duration = duration;
  },
  
  update(deltaTime) {
    if (this.duration > 0) {
      this.duration -= deltaTime * 1000;
      this.intensity *= 0.9;
      if (this.duration <= 0) {
        this.intensity = 0;
      }
    }
  },
  
  getOffset() {
    if (this.intensity <= 0) return { x: 0, y: 0 };
    return {
      x: (Math.random() - 0.5) * this.intensity,
      y: (Math.random() - 0.5) * this.intensity
    };
  }
};

// ==================== 死亡动画系统 ====================
const DeathAnimation = {
  animations: [],
  maxAnimations: 15, // 限制最大死亡动画数量
  
  // 创建死亡动画
  create(x, y, emoji, color, size, isElite = false) {
    // 如果超过最大数量，移除最旧的
    if (this.animations.length >= this.maxAnimations) {
      this.animations.shift();
    }
    const animation = {
      x, y,
      emoji,
      color,
      size,
      isElite,
      frame: 0,
      maxFrames: 30,
      particles: this.createDeathParticles(x, y, color, isElite),
      scale: 1,
      rotation: 0,
      opacity: 1
    };
    this.animations.push(animation);
  },
  
  // 创建死亡粒子
  createDeathParticles(x, y, color, isElite) {
    const count = isElite ? 20 : 10;
    const particles = [];
    
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 2 + Math.random() * 4;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        size: 3 + Math.random() * 5,
        color: color,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.3
      });
    }
    
    return particles;
  },
  
  // 更新所有死亡动画
  update() {
    this.animations = this.animations.filter(anim => {
      anim.frame++;
      
      // 缩放动画
      anim.scale = 1 + (anim.frame / anim.maxFrames) * 0.5;
      
      // 旋转动画
      anim.rotation += 0.1;
      
      // 透明度渐变
      anim.opacity = 1 - (anim.frame / anim.maxFrames);
      
      // 更新粒子
      anim.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.life -= 0.03;
        p.rotation += p.rotationSpeed;
      });
      anim.particles = anim.particles.filter(p => p.life > 0);
      
      return anim.frame < anim.maxFrames || anim.particles.length > 0;
    });
  },
  
  // 渲染死亡动画
  render(ctx, camera) {
    this.animations.forEach(anim => {
      ctx.save();
      
      // 渲染主体
      ctx.translate(anim.x - camera.x, anim.y - camera.y);
      ctx.rotate(anim.rotation);
      ctx.scale(anim.scale, anim.scale);
      ctx.globalAlpha = anim.opacity;
      
      ctx.font = `${anim.size}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(anim.emoji, 0, 0);
      
      ctx.restore();
      
      // 渲染粒子
      anim.particles.forEach(p => {
        ctx.save();
        ctx.translate(p.x - camera.x, p.y - camera.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.life;
        
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
        
        ctx.restore();
      });
    });
    ctx.globalAlpha = 1;
  }
};

// ==================== 慢镜头系统 ====================
const SlowMotion = {
  active: false,
  duration: 0,
  maxDuration: 30, // 30帧（约0.5秒）
  timeScale: 0.3, // 时间缩放比例
  
  // 触发慢镜头
  trigger() {
    this.active = true;
    this.duration = this.maxDuration;
  },
  
  // 更新慢镜头
  update() {
    if (!this.active) return 1; // 返回正常时间流速
    
    this.duration--;
    if (this.duration <= 0) {
      this.active = false;
      return 1;
    }
    
    return this.timeScale;
  },
  
  // 获取当前时间缩放
  getTimeScale() {
    return this.active ? this.timeScale : 1;
  },
  
  // 渲染慢镜头效果
  render(ctx, canvas) {
    if (!this.active) return;
    
    const progress = this.duration / this.maxDuration;
    
    // 边缘暗角效果
    const gradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height)
    );
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(0.7, `rgba(0,0,0,${0.3 * progress})`);
    gradient.addColorStop(1, `rgba(0,0,0,${0.6 * progress})`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 中心聚焦线
    ctx.strokeStyle = `rgba(255,255,255,${0.3 * progress})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 100 + (1 - progress) * 50, 0, Math.PI * 2);
    ctx.stroke();
  }
};

// ==================== 视觉特效系统 ====================
const VisualEffects = {
  // 创建爆炸粒子
  createExplosion(x, y, color, count = 15) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 3 + Math.random() * 5;
      gameState.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.8 + Math.random() * 0.4,
        color: color,
        size: 3 + Math.random() * 6,
        type: 'explosion',
        decay: 0.02
      });
    }
  },
  
  // 创建拖尾效果
  createTrail(x, y, color, size = 3) {
    gameState.particles.push({
      x: x + (Math.random() - 0.5) * 10,
      y: y + (Math.random() - 0.5) * 10,
      vx: 0,
      vy: 0,
      life: 0.3,
      color: color,
      size: size,
      type: 'trail',
      decay: 0.05
    });
  },
  
  // 创建吸收效果
  createAbsorb(x, y, targetX, targetY, color) {
    const angle = Math.atan2(targetY - y, targetX - x);
    gameState.particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * 8,
      vy: Math.sin(angle) * 8,
      life: 0.5,
      color: color,
      size: 4,
      type: 'absorb',
      targetX,
      targetY
    });
  },
  
  // 创建升级光环
  createLevelUpEffect(x, y) {
    // 外圈扩散
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20;
      gameState.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * 6,
        vy: Math.sin(angle) * 6,
        life: 1,
        color: '#2ed573',
        size: 5,
        type: 'ring',
        decay: 0.01
      });
    }
    // 上升粒子
    for (let i = 0; i < 10; i++) {
      gameState.particles.push({
        x: x + (Math.random() - 0.5) * 40,
        y: y,
        vx: 0,
        vy: -3 - Math.random() * 2,
        life: 1.2,
        color: '#7bed9f',
        size: 3 + Math.random() * 3,
        type: 'float',
        decay: 0.015
      });
    }
  },
  
  // 创建暴击特效
  createCritEffect(x, y) {
    // 星形爆发
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      gameState.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * 10,
        vy: Math.sin(angle) * 10,
        life: 0.5,
        color: '#ff3838',
        size: 6,
        type: 'crit',
        decay: 0.03
      });
    }
    // 中心闪光
    gameState.particles.push({
      x: x,
      y: y,
      vx: 0,
      vy: 0,
      life: 0.3,
      color: '#ffffff',
      size: 30,
      type: 'flash',
      decay: 0.1
    });
  },
  
  // 创建武器特效
  createWeaponEffect(weaponId, x, y) {
    const effects = {
      textbook: { color: '#ffa502', count: 5 },
      chalk: { color: '#dfe6e9', count: 8 },
      ruler: { color: '#74b9ff', count: 3 },
      basketball: { color: '#e17055', count: 10 },
      eraser: { color: '#fd79a8', count: 6 },
      broom: { color: '#00b894', count: 7 },
      ink: { color: '#2d3436', count: 12 },
      triangle: { color: '#0984e3', count: 4 },
      examPaper: { color: '#dfe6e9', count: 15 }
    };
    
    const effect = effects[weaponId];
    if (effect) {
      this.createExplosion(x, y, effect.color, effect.count);
    }
  }
};

// 飘字系统
const FloatingText = {
  texts: [],
  maxTexts: 30, // 限制最大飘字数量
  
  add(x, y, text, color, size = 16, duration = 1000) {
    // 如果超过最大数量，移除最旧的
    if (this.texts.length >= this.maxTexts) {
      this.texts.shift();
    }
    this.texts.push({
      x, y, text, color, size,
      createdAt: Date.now(),
      duration,
      vy: -2 - Math.random()
    });
  },
  
  update() {
    const now = Date.now();
    this.texts = this.texts.filter(t => {
      const elapsed = now - t.createdAt;
      if (elapsed > t.duration) return false;
      
      t.y += t.vy;
      return true;
    });
  },
  
  render(ctx, camera) {
    ctx.save();
    this.texts.forEach(t => {
      const elapsed = Date.now() - t.createdAt;
      const progress = elapsed / t.duration;
      const alpha = 1 - progress;
      
      ctx.globalAlpha = alpha;
      ctx.fillStyle = t.color;
      ctx.font = `bold ${t.size}px Arial`;
      ctx.textAlign = 'center';
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.lineWidth = 2;
      ctx.strokeText(t.text, t.x - camera.x, t.y - camera.y);
      ctx.fillText(t.text, t.x - camera.x, t.y - camera.y);
    });
    ctx.restore();
  }
};

// 背景效果
const BackgroundEffects = {
  particles: [],
  
  init() {
    // 初始化背景粒子
    for (let i = 0; i < 30; i++) {
      this.particles.push(this.createParticle());
    }
  },
  
  createParticle() {
    return {
      x: Math.random() * 3000,
      y: Math.random() * 3000,
      size: 1 + Math.random() * 2,
      speed: 0.2 + Math.random() * 0.5,
      opacity: 0.1 + Math.random() * 0.3,
      type: Math.random() > 0.5 ? 'sakura' : 'paper'
    };
  },
  
  update() {
    const time = Date.now() / 1000;
    this.particles.forEach(p => {
      p.y += p.speed;
      p.x += Math.sin(time + p.y) * 0.5;
      
      if (p.y > 3000) {
        p.y = 0;
        p.x = Math.random() * 3000;
      }
    });
  },
  
  render(ctx, camera) {
    ctx.save();
    this.particles.forEach(p => {
      if (p.x < camera.x - 100 || p.x > camera.x + ctx.canvas.width + 100 ||
          p.y < camera.y - 100 || p.y > camera.y + ctx.canvas.height + 100) {
        return;
      }
      
      ctx.globalAlpha = p.opacity;
      if (p.type === 'sakura') {
        // 樱花
        ctx.fillStyle = '#ffb7b2';
        ctx.beginPath();
        ctx.arc(p.x - camera.x, p.y - camera.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // 飘落的试卷
        ctx.fillStyle = '#dfe6e9';
        ctx.fillRect(p.x - camera.x, p.y - camera.y, p.size * 2, p.size * 3);
      }
    });
    ctx.restore();
  }
};

// ==================== 武器精通系统 ====================
const WeaponMastery = {
  // 武器经验配置
  expPerHit: 5,
  expPerKill: 20,
  expToNextLevel: [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000], // 每级所需经验
  maxLevel: 10,
  cache: null,
  saveTimer: null,
  saveToken: 0,

  ensureCache() {
    if (this.cache) return this.cache;

    const saveData = SaveSystem.load();
    this.cache = saveData.weaponMastery ? JSON.parse(JSON.stringify(saveData.weaponMastery)) : {};
    return this.cache;
  },

  getMasteryRecord(weaponId) {
    const cache = this.ensureCache();
    if (!cache[weaponId]) {
      cache[weaponId] = { level: 0, exp: 0, totalKills: 0 };
    }
    return cache[weaponId];
  },

  scheduleSave() {
    this.saveToken++;
    const currentToken = this.saveToken;

    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }

    this.saveTimer = setTimeout(() => {
      if (currentToken !== this.saveToken) {
        return;
      }
      this.flush();
    }, 300);
  },

  flush() {
    if (!this.cache) return;

    const saveData = SaveSystem.load();
    saveData.weaponMastery = JSON.parse(JSON.stringify(this.cache));
    SaveSystem.save(saveData);

    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
  },
  
  // 获取武器当前等级
  getLevel(weaponId) {
    return this.getMasteryRecord(weaponId).level || 0;
  },
  
  // 获取武器当前经验
  getExp(weaponId) {
    return this.getMasteryRecord(weaponId).exp || 0;
  },
  
  // 获取升级所需经验
  getExpToNext(weaponId) {
    const level = this.getLevel(weaponId);
    if (level >= this.maxLevel) return 0;
    return this.expToNextLevel[level] || this.expToNextLevel[this.expToNextLevel.length - 1];
  },
  
  // 添加武器经验
  addExp(weaponId, amount) {
    const mastery = this.getMasteryRecord(weaponId);
    if (mastery.level >= this.maxLevel) return false;
    
    mastery.exp += amount;
    
    // 检查升级
    let leveledUp = false;
    while (mastery.level < this.maxLevel && mastery.exp >= this.getExpToNext(weaponId)) {
      mastery.exp -= this.getExpToNext(weaponId);
      mastery.level++;
      leveledUp = true;
      this.onLevelUp(weaponId, mastery.level);
    }
    
    this.scheduleSave();
    return leveledUp;
  },
  
  // 记录武器击杀
  addKill(weaponId) {
    const mastery = this.getMasteryRecord(weaponId);
    mastery.totalKills++;
    this.scheduleSave();
  },
  
  // 升级时触发
  onLevelUp(weaponId, newLevel) {
    const weapon = WEAPONS[weaponId];
    if (!weapon) return;
    
    // 显示升级提示
    showWeaponLevelUp(weaponId, newLevel);
    
    // 解锁新特效
    const unlocks = this.getUnlocks(weaponId, newLevel);
    if (unlocks) {
      setTimeout(() => {
        showWeaponUnlock(weaponId, unlocks);
      }, 1500);
    }
  },
  
  // 获取等级解锁内容
  getUnlocks(weaponId, level) {
    const unlockTable = {
      textbook: {
        3: { type: 'effect', name: '弹跳', desc: '课本会在敌人间弹跳1次' },
        5: { type: 'stat', name: '伤害提升', desc: '课本伤害+20%' },
        7: { type: 'effect', name: '穿透', desc: '课本可以穿透2个敌人' },
        10: { type: 'ultimate', name: '知识洪流', desc: '同时发射3本课本' }
      },
      chalk: {
        3: { type: 'stat', name: '数量+1', desc: '粉笔数量+1' },
        5: { type: 'effect', name: '毒素', desc: '粉笔造成持续伤害' },
        7: { type: 'stat', name: '范围扩大', desc: '散射角度+30%' },
        10: { type: 'ultimate', name: '粉尘风暴', desc: '发射12支粉笔' }
      },
      ruler: {
        3: { type: 'stat', name: '范围+20%', desc: '戒尺范围扩大' },
        5: { type: 'effect', name: '眩晕', desc: '10%概率眩晕敌人' },
        7: { type: 'stat', name: '速度+30%', desc: '旋转速度提升' },
        10: { type: 'ultimate', name: '惩戒领域', desc: '同时有6把戒尺' }
      },
      basketball: {
        3: { type: 'stat', name: '爆炸+20%', desc: '爆炸范围扩大' },
        5: { type: 'effect', name: '燃烧', desc: '爆炸留下燃烧区域' },
        7: { type: 'stat', name: '伤害+30%', desc: '爆炸伤害提升' },
        10: { type: 'ultimate', name: '灌篮高手', desc: '篮球可以弹跳3次' }
      },
      eraser: {
        3: { type: 'stat', name: '弹跳+1', desc: '弹跳次数+1' },
        5: { type: 'effect', name: '净化', desc: '擦除敌人增益效果' },
        7: { type: 'stat', name: '速度+25%', desc: '飞行速度提升' },
        10: { type: 'ultimate', name: '完美擦除', desc: '可以弹射5次' }
      },
      broom: {
        3: { type: 'stat', name: '击退+30%', desc: '击退距离增加' },
        5: { type: 'effect', name: '清扫', desc: '击杀时清除周围子弹' },
        7: { type: 'stat', name: '范围+25%', desc: '攻击范围扩大' },
        10: { type: 'ultimate', name: '龙卷风', desc: '形成持续旋风' }
      },
      ink: {
        3: { type: 'stat', name: '持续+2秒', desc: '墨水持续时间增加' },
        5: { type: 'effect', name: '减速', desc: '墨水减速敌人' },
        7: { type: 'stat', name: '范围+30%', desc: '溅射范围扩大' },
        10: { type: 'ultimate', name: '墨海', desc: '形成大范围墨水池' }
      },
      triangle: {
        3: { type: 'stat', name: '穿透+1', desc: '穿透敌人数量+1' },
        5: { type: 'effect', name: '暴击', desc: '20%概率暴击' },
        7: { type: 'stat', name: '速度+40%', desc: '飞行速度提升' },
        10: { type: 'ultimate', name: '几何风暴', desc: '发射会分裂的飞镖' }
      },
      examPaper: {
        3: { type: 'stat', name: '密度+20%', desc: '试卷密度增加' },
        5: { type: 'effect', name: '致盲', desc: '敌人命中率降低' },
        7: { type: 'stat', name: '范围+25%', desc: '覆盖范围扩大' },
        10: { type: 'ultimate', name: '考试地狱', desc: '全屏试卷风暴' }
      },
      lunchBox: {
        3: { type: 'stat', name: '眩晕+10%', desc: '眩晕概率提升' },
        5: { type: 'effect', name: '砸扁', desc: '敌人体积暂时变小' },
        7: { type: 'stat', name: '伤害+25%', desc: '饭盒伤害提升' },
        10: { type: 'ultimate', name: '天降饭盒', desc: '随机掉落饭盒' }
      },
      waterBalloon: {
        3: { type: 'stat', name: '减速+20%', desc: '减速效果增强' },
        5: { type: 'effect', name: '溅射', desc: '水球会溅射到周围' },
        7: { type: 'stat', name: '范围+30%', desc: '影响范围扩大' },
        10: { type: 'ultimate', name: '洪水', desc: '形成持续水潭' }
      },
      firecracker: {
        3: { type: 'stat', name: '爆炸+25%', desc: '爆炸范围扩大' },
        5: { type: 'effect', name: '连爆', desc: '25%概率二次爆炸' },
        7: { type: 'stat', name: '伤害+35%', desc: '爆炸伤害提升' },
        10: { type: 'ultimate', name: '烟花盛宴', desc: '爆炸产生散射' }
      }
    };
    
    return unlockTable[weaponId]?.[level];
  },
  
  // 获取武器属性加成
  getBonuses(weaponId) {
    const level = this.getLevel(weaponId);
    const bonuses = {
      damage: 1 + (level * 0.05), // 每级+5%伤害
      speed: 1 + (level * 0.03),  // 每级+3%速度
      pierce: Math.floor(level / 3), // 每3级+1穿透
      critChance: level * 0.02 // 每级+2%暴击
    };
    
    // 特殊等级加成
    if (level >= 5) {
      bonuses.special = true;
    }
    if (level >= 10) {
      bonuses.ultimate = true;
    }
    
    return bonuses;
  },
  
  // 获取武器排行榜
  getLeaderboard() {
    const mastery = this.ensureCache();
    
    return Object.entries(mastery)
      .map(([id, data]) => ({
        id,
        name: WEAPONS[id]?.name || id,
        emoji: WEAPONS[id]?.emoji || '🔸',
        level: data.level,
        exp: data.exp,
        totalKills: data.totalKills || 0
      }))
      .sort((a, b) => b.level - a.level || b.exp - a.exp);
  }
};

// 显示武器升级提示
function showWeaponLevelUp(weaponId, level) {
  const weapon = WEAPONS[weaponId];
  if (!weapon) return;
  
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 60%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, rgba(255,193,7,0.95), rgba(255,152,0,0.95));
    border: 3px solid #ffd700;
    border-radius: 15px;
    padding: 20px 30px;
    text-align: center;
    z-index: 1000;
    animation: weaponLevelUp 2.5s ease-out forwards;
    box-shadow: 0 0 30px rgba(255,193,7,0.6);
  `;
  notification.innerHTML = `
    <div style="font-size:48px;margin-bottom:10px">${weapon.emoji}</div>
    <div style="font-size:14px;color:#fff;text-transform:uppercase;letter-spacing:2px">武器精通</div>
    <div style="font-size:24px;font-weight:bold;color:#fff;margin:5px 0">${weapon.name}</div>
    <div style="font-size:32px;font-weight:900;color:#ffd700;text-shadow:0 0 10px #ff6f00">Lv.${level}</div>
  `;
  document.body.appendChild(notification);
  
  setTimeout(() => notification.remove(), 2500);
}

// 显示武器解锁特效
function showWeaponUnlock(weaponId, unlock) {
  const weapon = WEAPONS[weaponId];
  if (!weapon) return;
  
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 70%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, rgba(156,39,176,0.95), rgba(103,58,183,0.95));
    border: 2px solid #e1bee7;
    border-radius: 12px;
    padding: 15px 25px;
    text-align: center;
    z-index: 999;
    animation: weaponUnlock 2s ease-out forwards;
  `;
  notification.innerHTML = `
    <div style="font-size:12px;color:#e1bee7;text-transform:uppercase">解锁新能力</div>
    <div style="font-size:20px;font-weight:bold;color:#fff;margin:5px 0">${unlock.name}</div>
    <div style="font-size:14px;color:#fff;opacity:0.9">${unlock.desc}</div>
  `;
  document.body.appendChild(notification);
  
  setTimeout(() => notification.remove(), 2000);
}

// ==================== 天赋树系统 ====================
const TalentTree = {
  // 天赋数据
  talents: {
    // 攻击系
    attack: {
      name: '攻击系',
      emoji: '⚔️',
      color: '#e74c3c',
      talents: [
        { id: 'atk1', name: '力量训练', desc: '攻击力+10%', maxLevel: 5, effect: { damage: 0.1 } },
        { id: 'atk2', name: '狂暴', desc: '暴走伤害+20%', maxLevel: 3, effect: { rageDamage: 0.2 }, requires: 'atk1' },
        { id: 'atk3', name: '弱点洞察', desc: '暴击率+5%', maxLevel: 5, effect: { critChance: 0.05 }, requires: 'atk1' },
        { id: 'atk4', name: '致命一击', desc: '暴击伤害+50%', maxLevel: 3, effect: { critDamage: 0.5 }, requires: 'atk3' },
        { id: 'atk5', name: '武器大师', desc: '武器伤害+15%', maxLevel: 3, effect: { weaponDamage: 0.15 }, requires: 'atk2' },
        { id: 'atk_ultimate', name: '毁灭者', desc: '所有伤害+25%', maxLevel: 1, effect: { allDamage: 0.25 }, requires: ['atk4', 'atk5'] }
      ]
    },
    // 防御系
    defense: {
      name: '防御系',
      emoji: '🛡️',
      color: '#3498db',
      talents: [
        { id: 'def1', name: '体能强化', desc: '最大生命+20', maxLevel: 5, effect: { maxHp: 20 } },
        { id: 'def2', name: '坚韧', desc: '受到伤害-10%', maxLevel: 5, effect: { damageReduction: 0.1 }, requires: 'def1' },
        { id: 'def3', name: '护盾掌握', desc: '护盾持续时间+50%', maxLevel: 3, effect: { shieldDuration: 0.5 }, requires: 'def1' },
        { id: 'def4', name: '荆棘', desc: '反弹20%伤害', maxLevel: 3, effect: { thorns: 0.2 }, requires: 'def2' },
        { id: 'def5', name: '不屈', desc: '生命值低于30%时防御+50%', maxLevel: 1, effect: { desperateDefense: 0.5 }, requires: 'def3' },
        { id: 'def_ultimate', name: '钢铁意志', desc: '免疫控制效果', maxLevel: 1, effect: { ccImmunity: true }, requires: ['def4', 'def5'] }
      ]
    },
    // 生存系
    survival: {
      name: '生存系',
      emoji: '💚',
      color: '#2ecc71',
      talents: [
        { id: 'sur1', name: '生命恢复', desc: '每秒恢复1点生命', maxLevel: 5, effect: { regen: 1 } },
        { id: 'sur2', name: '吸血', desc: '造成伤害的5%转化为生命', maxLevel: 5, effect: { lifesteal: 0.05 }, requires: 'sur1' },
        { id: 'sur3', name: '急救', desc: '使用道具恢复效果+30%', maxLevel: 3, effect: { healBoost: 0.3 }, requires: 'sur1' },
        { id: 'sur4', name: '复活强化', desc: '复活时恢复100%生命', maxLevel: 1, effect: { fullRevive: true }, requires: 'sur2' },
        { id: 'sur5', name: '顽强', desc: '受到致命伤害时保留1点生命(冷却60秒)', maxLevel: 1, effect: { cheatDeath: true }, requires: 'sur3' },
        { id: 'sur_ultimate', name: '不朽', desc: '生命恢复速度翻倍，吸血效果翻倍', maxLevel: 1, effect: { regenBoost: 2 }, requires: ['sur4', 'sur5'] }
      ]
    },
    // 特殊系
    special: {
      name: '特殊系',
      emoji: '✨',
      color: '#9b59b6',
      talents: [
        { id: 'spe1', name: '经验获取', desc: '经验获取+10%', maxLevel: 5, effect: { expGain: 0.1 } },
        { id: 'spe2', name: '拾取范围', desc: '拾取范围+20%', maxLevel: 5, effect: { pickupRange: 0.2 }, requires: 'spe1' },
        { id: 'spe3', name: '幸运', desc: '道具掉落率+15%', maxLevel: 5, effect: { itemLuck: 0.15 }, requires: 'spe1' },
        { id: 'spe4', name: '冷却缩减', desc: '技能冷却-10%', maxLevel: 3, effect: { cooldownReduction: 0.1 }, requires: 'spe2' },
        { id: 'spe5', name: '时间掌控', desc: '时间停止持续时间+50%', maxLevel: 3, effect: { timeFreezeBoost: 0.5 }, requires: 'spe3' },
        { id: 'spe_ultimate', name: '超能力者', desc: '所有特殊效果+30%', maxLevel: 1, effect: { specialBoost: 0.3 }, requires: ['spe4', 'spe5'] }
      ]
    }
  },

  // 获取天赋点
  getTalentPoints() {
    const saveData = SaveSystem.load();
    return saveData.talentPoints || 0;
  },

  // 添加天赋点
  addTalentPoints(amount) {
    const saveData = SaveSystem.load();
    saveData.talentPoints = (saveData.talentPoints || 0) + amount;
    SaveSystem.save(saveData);
  },

  // 获取已解锁的天赋
  getUnlockedTalents() {
    const saveData = SaveSystem.load();
    return saveData.unlockedTalents || [];
  },

  // 检查天赋是否已解锁
  isUnlocked(talentId) {
    const unlocked = this.getUnlockedTalents();
    return unlocked.includes(talentId);
  },

  // 获取天赋等级
  getTalentLevel(talentId) {
    const saveData = SaveSystem.load();
    return saveData.talentLevels?.[talentId] || 0;
  },

  // 解锁天赋
  unlockTalent(talentId) {
    const talent = this.findTalent(talentId);
    if (!talent) return false;

    const currentLevel = this.getTalentLevel(talentId);
    if (currentLevel >= talent.maxLevel) return false;

    const points = this.getTalentPoints();
    if (points < 1) return false;

    // 检查前置条件
    if (talent.requires) {
      const requires = Array.isArray(talent.requires) ? talent.requires : [talent.requires];
      const hasRequirements = requires.every(req => this.isUnlocked(req));
      if (!hasRequirements) return false;
    }

    const saveData = SaveSystem.load();
    if (!saveData.unlockedTalents) saveData.unlockedTalents = [];
    if (!saveData.talentLevels) saveData.talentLevels = {};

    // 扣除天赋点
    saveData.talentPoints--;

    // 升级天赋
    saveData.talentLevels[talentId] = currentLevel + 1;
    if (currentLevel === 0) {
      saveData.unlockedTalents.push(talentId);
    }

    SaveSystem.save(saveData);

    // 显示解锁提示
    showTalentUnlock(talent);

    return true;
  },

  // 查找天赋
  findTalent(talentId) {
    for (const branch of Object.values(this.talents)) {
      const talent = branch.talents.find(t => t.id === talentId);
      if (talent) return talent;
    }
    return null;
  },

  // 计算所有天赋加成
  getAllBonuses() {
    const bonuses = {
      damage: 1,
      rageDamage: 1,
      critChance: 0,
      critDamage: 1.5,
      maxHp: 0,
      damageReduction: 0,
      shieldDuration: 1,
      thorns: 0,
      desperateDefense: 0,
      ccImmunity: false,
      regen: 0,
      lifesteal: 0,
      healBoost: 1,
      fullRevive: false,
      cheatDeath: false,
      regenBoost: 1,
      expGain: 1,
      pickupRange: 1,
      itemLuck: 1,
      cooldownReduction: 1,
      timeFreezeBoost: 1,
      specialBoost: 1
    };

    const saveData = SaveSystem.load();
    const levels = saveData.talentLevels || {};

    for (const [talentId, level] of Object.entries(levels)) {
      const talent = this.findTalent(talentId);
      if (!talent || !talent.effect) continue;

      for (const [key, value] of Object.entries(talent.effect)) {
        if (typeof value === 'boolean') {
          bonuses[key] = value;
        } else if (key.includes('Damage') || key.includes('Gain') || key.includes('Boost') || key.includes('Duration')) {
          bonuses[key] += value * level;
        } else {
          bonuses[key] += value * level;
        }
      }
    }

    return bonuses;
  },

  // 重置天赋
  resetTalents() {
    const saveData = SaveSystem.load();
    const unlocked = saveData.unlockedTalents || [];
    const levels = saveData.talentLevels || {};

    // 计算返还的天赋点
    let pointsToReturn = 0;
    for (const level of Object.values(levels)) {
      pointsToReturn += level;
    }

    saveData.talentPoints = (saveData.talentPoints || 0) + pointsToReturn;
    saveData.unlockedTalents = [];
    saveData.talentLevels = {};

    SaveSystem.save(saveData);

    return pointsToReturn;
  },

  // 通过成就获取天赋点
  checkTalentPointsFromAchievements() {
    const saveData = SaveSystem.load();
    const achievements = saveData.achievements || {};
    let pointsEarned = 0;

    // 每解锁5个成就获得1点
    const unlockedCount = Object.keys(achievements).length;
    const pointsFromAchievements = Math.floor(unlockedCount / 5);

    // 检查是否已经发放过
    if (!saveData.talentPointsFromAchievements) saveData.talentPointsFromAchievements = 0;

    if (pointsFromAchievements > saveData.talentPointsFromAchievements) {
      pointsEarned = pointsFromAchievements - saveData.talentPointsFromAchievements;
      saveData.talentPointsFromAchievements = pointsFromAchievements;
      saveData.talentPoints = (saveData.talentPoints || 0) + pointsEarned;
      SaveSystem.save(saveData);
    }

    return pointsEarned;
  }
};

// ==================== 排行榜系统 ====================
const Leaderboard = {
  key: 'schoolRampage_leaderboard_v1',
  maxEntries: 10,
  
  // 添加新记录
  addEntry(entry) {
    const data = this.load();
    
    const newEntry = {
      ...entry,
      date: Date.now(),
      id: Date.now().toString(36) + Math.random().toString(36).substr(2)
    };
    
    data.entries.push(newEntry);
    
    // 按分数排序并限制数量
    data.entries.sort((a, b) => b.score - a.score);
    if (data.entries.length > this.maxEntries) {
      data.entries = data.entries.slice(0, this.maxEntries);
    }
    
    this.save(data);
    return this.getRank(newEntry.id);
  },
  
  // 获取排名
  getRank(entryId) {
    const data = this.load();
    const index = data.entries.findIndex(e => e.id === entryId);
    return index >= 0 ? index + 1 : null;
  },
  
  // 加载排行榜
  load() {
    try {
      const data = localStorage.getItem(this.key);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('排行榜加载失败:', e);
    }
    return { entries: [] };
  },
  
  // 保存排行榜
  save(data) {
    try {
      localStorage.setItem(this.key, JSON.stringify(data));
    } catch (e) {
      console.error('排行榜保存失败:', e);
    }
  },
  
  // 获取前N名
  getTop(n = 10) {
    const data = this.load();
    return data.entries.slice(0, n);
  },
  
  // 清空排行榜
  clear() {
    localStorage.removeItem(this.key);
  }
};

// 显示天赋解锁提示
function showTalentUnlock(talent) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, rgba(155,89,182,0.95), rgba(142,68,173,0.95));
    border: 2px solid #bb8fce;
    border-radius: 15px;
    padding: 20px 30px;
    text-align: center;
    z-index: 1000;
    animation: talentUnlock 2s ease-out forwards;
    box-shadow: 0 0 30px rgba(155,89,182,0.6);
  `;
  notification.innerHTML = `
    <div style="font-size:14px;color:#e8daef;text-transform:uppercase;letter-spacing:2px">天赋解锁</div>
    <div style="font-size:24px;font-weight:bold;color:#fff;margin:10px 0">${talent.name}</div>
    <div style="font-size:14px;color:#f5eef8">${talent.desc}</div>
  `;
  document.body.appendChild(notification);

  setTimeout(() => notification.remove(), 2000);
}

// ==================== 存档系统 ====================
const SaveSystem = {
  key: 'schoolRampage_save_v2',
  
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
      window.dispatchEvent(new CustomEvent('schoolrampage:meta-updated'));
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
      weaponMastery: {}, // 武器精通数据
      talentPoints: 0, // 天赋点
      unlockedTalents: [], // 已解锁天赋
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
  
  // 本次游戏已解锁的成就（防止重复显示）
  sessionUnlocked: new Set(),
  
  checkAchievements(data, gameStats) {
    const achievements = ACHIEVEMENTS;
    
    for (const [id, achievement] of Object.entries(achievements)) {
      // 检查是否已经在存档中解锁或本次游戏中已显示
      if (!data.achievements[id] && !this.sessionUnlocked.has(id)) {
        const progress = achievement.check(gameStats, data);
        if (progress >= achievement.target) {
          data.achievements[id] = {
            unlocked: true,
            unlockedAt: Date.now()
          };
          // 标记为本次游戏已解锁
          this.sessionUnlocked.add(id);
          showAchievementUnlock(achievement);
        }
      }
    }
  },
  
  // 重置会话缓存（游戏开始时调用）
  resetSession() {
    this.sessionUnlocked.clear();
  },
  
  reset() {
    localStorage.removeItem(this.key);
    this.sessionUnlocked.clear();
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
  },
  waveMaster: {
    id: 'waveMaster',
    name: '波次大师',
    description: '存活超过10波',
    emoji: '🌊',
    target: 10,
    check: (stats) => stats.wave
  },
  eliteHunter: {
    id: 'eliteHunter',
    name: '精英猎手',
    description: '击败50个精英怪',
    emoji: '👑',
    target: 50,
    check: (stats) => stats.eliteKills
  },
  bomberKiller: {
    id: 'bomberKiller',
    name: '拆弹专家',
    description: '击败100个炸弹人',
    emoji: '💣',
    target: 100,
    check: (stats) => stats.bomberKills
  },
  timeStopper: {
    id: 'timeStopper',
    name: '时间掌控者',
    description: '使用时间停止10次',
    emoji: '⏱️',
    target: 10,
    check: (stats) => stats.timeFreezes
  },
  // 新增成就
  killer500: {
    id: 'killer500',
    name: '万人斩',
    description: '累计击杀5000人',
    emoji: '💀',
    target: 5000,
    check: (stats, data) => data.totalKills + stats.kills
  },
  killer10000: {
    id: 'killer10000',
    name: '屠戮者',
    description: '累计击杀10000人',
    emoji: '🔱',
    target: 10000,
    check: (stats, data) => data.totalKills + stats.kills
  },
  survivor10: {
    id: 'survivor10',
    name: '生存王者',
    description: '单局存活10分钟',
    emoji: '⏰',
    target: 600,
    check: (stats) => Math.floor(stats.playTime / 1000)
  },
  combo100: {
    id: 'combo100',
    name: '连击之神',
    description: '达成100连击',
    emoji: '⚡',
    target: 100,
    check: (stats) => stats.maxCombo
  },
  combo200: {
    id: 'combo200',
    name: '连击传说',
    description: '达成200连击',
    emoji: '🌟',
    target: 200,
    check: (stats) => stats.maxCombo
  },
  bossSlayerAll: {
    id: 'bossSlayerAll',
    name: 'Boss终结者',
    description: '击败所有Boss',
    emoji: '🏆',
    target: 3,
    check: (stats) => stats.bossKilled
  },
  wave20: {
    id: 'wave20',
    name: '波次传奇',
    description: '存活超过20波',
    emoji: '🌊',
    target: 20,
    check: (stats) => stats.wave
  },
  wave30: {
    id: 'wave30',
    name: '无尽生存',
    description: '存活超过30波',
    emoji: '🌀',
    target: 30,
    check: (stats) => stats.wave
  },
  level30: {
    id: 'level30',
    name: '超越极限',
    description: '单局达到30级',
    emoji: '🚀',
    target: 30,
    check: (stats) => stats.level
  },
  level50: {
    id: 'level50',
    name: '神级存在',
    description: '单局达到50级',
    emoji: '👑',
    target: 50,
    check: (stats) => stats.level
  },
  rage100: {
    id: 'rage100',
    name: '狂暴之神',
    description: '暴走状态下击杀100人',
    emoji: '😤',
    target: 100,
    check: (stats) => stats.rageKills
  },
  rage200: {
    id: 'rage200',
    name: '暴走传说',
    description: '暴走状态下击杀200人',
    emoji: '💢',
    target: 200,
    check: (stats) => stats.rageKills
  },
  noDamage5: {
    id: 'noDamage5',
    name: '完美生存',
    description: '单局不受伤存活5分钟',
    emoji: '💎',
    target: 1,
    check: (stats) => stats.noDamageRun && stats.playTime >= 300000
  },
  eliteHunter100: {
    id: 'eliteHunter100',
    name: '精英克星',
    description: '击败100个精英怪',
    emoji: '👹',
    target: 100,
    check: (stats) => stats.eliteKills
  },
  eliteHunter500: {
    id: 'eliteHunter500',
    name: '精英终结者',
    description: '击败500个精英怪',
    emoji: '👺',
    target: 500,
    check: (stats) => stats.eliteKills
  },
  veteran50: {
    id: 'veteran50',
    name: '传说老兵',
    description: '累计游戏50次',
    emoji: '🎖️',
    target: 50,
    check: (stats, data) => data.totalGames + 1
  },
  veteran100: {
    id: 'veteran100',
    name: '百战不殆',
    description: '累计游戏100次',
    emoji: '🏅',
    target: 100,
    check: (stats, data) => data.totalGames + 1
  },
  collectorAll: {
    id: 'collectorAll',
    name: '全武器大师',
    description: '解锁所有武器并达到满级',
    emoji: '📚',
    target: 12,
    check: (stats) => stats.weaponsUnlocked
  },
  rich: {
    id: 'rich',
    name: '富豪',
    description: '单局获得10000分',
    emoji: '💰',
    target: 10000,
    check: (stats) => stats.kills * 10 + stats.bossKilled * 500 + stats.wave * 100
  },
  richSuper: {
    id: 'richSuper',
    name: '亿万富翁',
    description: '单局获得50000分',
    emoji: '💎',
    target: 50000,
    check: (stats) => stats.kills * 10 + stats.bossKilled * 500 + stats.wave * 100
  }
};

// ==================== 称号系统 ====================
const TITLES = {
  // 新手称号
  newbie: {
    id: 'newbie',
    name: '校园新生',
    emoji: '🎒',
    description: '刚开始校园生活',
    requirement: '默认称号',
    color: '#95a5a6'
  },
  // 击杀称号
  killer: {
    id: 'killer',
    name: '问题学生',
    emoji: '😤',
    description: '累计击杀100人',
    requirement: '解锁"百人斩"成就',
    color: '#e74c3c',
    requiresAchievement: 'killer10'
  },
  slayer: {
    id: 'slayer',
    name: '校园传说',
    emoji: '💀',
    description: '累计击杀1000人',
    requirement: '解锁"千人斩"成就',
    color: '#c0392b',
    requiresAchievement: 'killer100'
  },
  reaper: {
    id: 'reaper',
    name: '死神',
    emoji: '🔱',
    description: '累计击杀10000人',
    requirement: '解锁"屠戮者"成就',
    color: '#8e44ad',
    requiresAchievement: 'killer10000'
  },
  // 生存称号
  survivor: {
    id: 'survivor',
    name: '生存专家',
    emoji: '🏕️',
    description: '单局存活5分钟',
    requirement: '解锁"生存专家"成就',
    color: '#27ae60',
    requiresAchievement: 'survivor'
  },
  survivorKing: {
    id: 'survivorKing',
    name: '生存王者',
    emoji: '👑',
    description: '单局存活10分钟',
    requirement: '解锁"生存王者"成就',
    color: '#16a085',
    requiresAchievement: 'survivor10'
  },
  // 等级称号
  rookie: {
    id: 'rookie',
    name: '一年级',
    emoji: '📖',
    description: '单局达到10级',
    requirement: '解锁"成长达人"成就',
    color: '#3498db',
    requiresAchievement: 'level10'
  },
  senior: {
    id: 'senior',
    name: '毕业生',
    emoji: '🎓',
    description: '单局达到20级',
    requirement: '解锁"满级大佬"成就',
    color: '#2980b9',
    requiresAchievement: 'level20'
  },
  master: {
    id: 'master',
    name: '教授',
    emoji: '👨‍🏫',
    description: '单局达到50级',
    requirement: '解锁"神级存在"成就',
    color: '#8e44ad',
    requiresAchievement: 'level50'
  },
  // 连击称号
  comboMaster: {
    id: 'comboMaster',
    name: '连击大师',
    emoji: '⚡',
    description: '达成50连击',
    requirement: '解锁"连击大师"成就',
    color: '#f39c12',
    requiresAchievement: 'combo50'
  },
  comboGod: {
    id: 'comboGod',
    name: '连击之神',
    emoji: '🔥',
    description: '达成100连击',
    requirement: '解锁"连击之神"成就',
    color: '#e67e22',
    requiresAchievement: 'combo100'
  },
  // Boss称号
  bossSlayer: {
    id: 'bossSlayer',
    name: 'Boss克星',
    emoji: '🥊',
    description: '击败第一个Boss',
    requirement: '解锁"Boss克星"成就',
    color: '#e74c3c',
    requiresAchievement: 'bossSlayer'
  },
  bossEnder: {
    id: 'bossEnder',
    name: 'Boss终结者',
    emoji: '🏆',
    description: '击败所有Boss',
    requirement: '解锁"Boss终结者"成就',
    color: '#c0392b',
    requiresAchievement: 'bossSlayerAll'
  },
  // 波次称号
  waveMaster: {
    id: 'waveMaster',
    name: '波次大师',
    emoji: '🌊',
    description: '存活超过10波',
    requirement: '解锁"波次大师"成就',
    color: '#1abc9c',
    requiresAchievement: 'waveMaster'
  },
  waveLegend: {
    id: 'waveLegend',
    name: '波次传奇',
    emoji: '🌀',
    description: '存活超过20波',
    requirement: '解锁"波次传奇"成就',
    color: '#16a085',
    requiresAchievement: 'wave20'
  },
  // 精英称号
  eliteHunter: {
    id: 'eliteHunter',
    name: '精英猎手',
    emoji: '🎯',
    description: '击败50个精英怪',
    requirement: '解锁"精英猎手"成就',
    color: '#9b59b6',
    requiresAchievement: 'eliteHunter'
  },
  eliteSlayer: {
    id: 'eliteSlayer',
    name: '精英克星',
    emoji: '👑',
    description: '击败100个精英怪',
    requirement: '解锁"精英克星"成就',
    color: '#8e44ad',
    requiresAchievement: 'eliteHunter100'
  },
  // 老兵称号
  veteran: {
    id: 'veteran',
    name: '老兵',
    emoji: '🎖️',
    description: '累计游戏10次',
    requirement: '解锁"老兵"成就',
    color: '#34495e',
    requiresAchievement: 'veteran'
  },
  legend: {
    id: 'legend',
    name: '传说老兵',
    emoji: '🏅',
    description: '累计游戏50次',
    requirement: '解锁"传说老兵"成就',
    color: '#2c3e50',
    requiresAchievement: 'veteran50'
  },
  // 特殊称号
  collector: {
    id: 'collector',
    name: '收藏家',
    emoji: '📦',
    description: '解锁所有武器',
    requirement: '解锁"收藏家"成就',
    color: '#e67e22',
    requiresAchievement: 'collector'
  },
  noDamage: {
    id: 'noDamage',
    name: '完美主义者',
    emoji: '💎',
    description: '单局不受伤存活3分钟',
    requirement: '解锁"无伤通关"成就',
    color: '#00d2d3',
    requiresAchievement: 'noDamage'
  },
  rich: {
    id: 'rich',
    name: '富豪',
    emoji: '💰',
    description: '单局获得10000分',
    requirement: '解锁"富豪"成就',
    color: '#f1c40f',
    requiresAchievement: 'rich'
  }
};

// 称号系统
const TitleSystem = {
  // 获取当前装备的称号
  getCurrentTitle() {
    const saveData = SaveSystem.load();
    return saveData.currentTitle || 'newbie';
  },
  
  // 设置当前称号
  setCurrentTitle(titleId) {
    const title = TITLES[titleId];
    if (!title) return false;
    
    // 检查是否满足条件
    if (title.requiresAchievement) {
      const saveData = SaveSystem.load();
      if (!saveData.achievements[title.requiresAchievement]) {
        return false;
      }
    }
    
    const saveData = SaveSystem.load();
    saveData.currentTitle = titleId;
    SaveSystem.save(saveData);
    return true;
  },
  
  // 获取所有已解锁的称号
  getUnlockedTitles() {
    const saveData = SaveSystem.load();
    const achievements = saveData.achievements || {};
    
    return Object.values(TITLES).filter(title => {
      if (!title.requiresAchievement) return true;
      return achievements[title.requiresAchievement];
    });
  },
  
  // 获取称号信息
  getTitle(titleId) {
    return TITLES[titleId];
  },
  
  // 获取当前称号显示文本
  getCurrentTitleDisplay() {
    const titleId = this.getCurrentTitle();
    const title = TITLES[titleId];
    if (!title) return '';
    return `[${title.emoji} ${title.name}]`;
  }
};

// ==================== 音效系统 ====================
const AudioSystem = {
  enabled: true,
  volume: 0.5,
  ctx: null,

  play(soundName) {
    const handlers = {
      weapon_switch: () => this.playTone(900, 0.08, 'triangle'),
      special_wave: () => {
        [440, 660, 880].forEach((freq, i) => {
          setTimeout(() => this.playTone(freq, 0.12, 'sawtooth'), i * 70);
        });
      },
      milestone: () => {
        [523.25, 659.25, 783.99].forEach((freq, i) => {
          setTimeout(() => this.playTone(freq, 0.18, 'sine'), i * 120);
        });
      },
      destructible_break: () => this.playNoise(0.12)
    };

    handlers[soundName]?.();
  },
  
  // 从本地存储加载设置
  loadSettings() {
    try {
      const saved = localStorage.getItem('schoolRampage_audioSettings');
      if (saved) {
        const settings = JSON.parse(saved);
        this.enabled = settings.enabled !== undefined ? settings.enabled : true;
        this.volume = settings.volume || 0.5;
      }
    } catch (e) {
      console.warn('加载音效设置失败:', e);
    }
  },
  
  // 保存设置到本地存储
  saveSettings() {
    try {
      localStorage.setItem('schoolRampage_audioSettings', JSON.stringify({
        enabled: this.enabled,
        volume: this.volume
      }));
    } catch (e) {
      console.warn('保存音效设置失败:', e);
    }
  },
  
  // 初始化音频上下文
  init() {
    this.loadSettings();
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
      this.enabled = false;
    }
  },
  
  // 播放射击音效
  playShoot(weaponId) {
    if (!this.enabled || !this.ctx) return;
    
    const frequencies = {
      textbook: 800,
      chalk: 1200,
      ruler: 600,
      basketball: 400,
      eraser: 1000,
      broom: 500,
      ink: 300,
      triangle: 1500,
      examPaper: 700,
      lunchBox: 350,
      waterBalloon: 900,
      firecracker: 200
    };
    
    const freq = frequencies[weaponId] || 800;
    this.playTone(freq, 0.1, 'square');
  },
  
  // 播放命中音效
  playHit() {
    if (!this.enabled || !this.ctx) return;
    this.playTone(200, 0.05, 'sawtooth');
  },
  
  // 播放击杀音效
  playKill() {
    if (!this.enabled || !this.ctx) return;
    this.playTone(600, 0.15, 'square');
    setTimeout(() => this.playTone(800, 0.1, 'square'), 50);
  },
  
  // 播放爆炸音效
  playExplosion() {
    if (!this.enabled || !this.ctx) return;
    this.playNoise(0.3);
  },
  
  // 播放升级音效
  playLevelUp() {
    if (!this.enabled || !this.ctx) return;
    [400, 600, 800, 1000].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.1), i * 100);
    });
  },
  
  // 播放拾取音效
  playPickup() {
    if (!this.enabled || !this.ctx) return;
    this.playTone(1200, 0.05, 'sine');
  },
  
  // 播放受伤音效
  playHurt() {
    if (!this.enabled || !this.ctx) return;
    this.playTone(150, 0.2, 'sawtooth');
  },
  
  // 播放Boss警告音效
  playBossWarning() {
    if (!this.enabled || !this.ctx) return;
    [300, 250, 200].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.3, 'sawtooth'), i * 200);
    });
  },
  
  // 播放Boss死亡音效
  playBossDeath() {
    if (!this.enabled || !this.ctx) return;
    this.playNoise(0.5);
    setTimeout(() => this.playTone(400, 0.3), 100);
    setTimeout(() => this.playTone(300, 0.4), 300);
  },
  
  // 播放游戏结束音效
  playGameOver() {
    if (!this.enabled || !this.ctx) return;
    [600, 500, 400, 300, 200].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.3), i * 150);
    });
  },
  
  // 播放成就解锁音效
  playAchievement() {
    if (!this.enabled || !this.ctx) return;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.15, 'sine'), i * 100);
    });
  },
  
  // 播放时间停止音效
  playTimeFreeze() {
    if (!this.enabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.5);
    
    gain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.5);
  },
  
  // 播放暴走音效
  playRage() {
    if (!this.enabled || !this.ctx) return;
    [200, 300, 400, 500, 600].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, 'sawtooth'), i * 50);
    });
  },
  
  // 基础音调播放
  playTone(frequency, duration, type = 'square') {
    if (!this.ctx) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.frequency.value = frequency;
    osc.type = type;
    
    gain.gain.setValueAtTime(this.volume * 0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  },
  
  // 噪音生成（用于爆炸等效果）
  playNoise(duration) {
    if (!this.ctx) return;
    
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.volume * 0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    
    // 添加滤波器使噪音更低沉
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    
    noise.start();
  },
  
  // 设置音量
  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
  },
  
  // 切换音效开关
  toggle() {
    this.enabled = !this.enabled;
    this.saveSettings();
    return this.enabled;
  },

  toggleMute() {
    const enabled = this.toggle();
    const button = document.getElementById('muteBtn');
    if (button) {
      button.textContent = enabled ? '🔊 音效: 开' : '🔇 音效: 关';
    }
    return enabled;
  }
};

// ==================== BGM系统 ====================
const BGM = {
  enabled: false,
  currentTrack: null,
  volume: 0.2,
  ctx: null,
  nextNoteTime: 0,
  timerID: null,
  
  init() {
    this.ctx = AudioSystem.ctx;
  },
  
  playBattle() {
    if (!this.enabled || !this.ctx) return;
    this.stop();
    this.currentTrack = 'battle';
    this.nextNoteTime = this.ctx.currentTime;
    this.scheduleBattleMusic();
  },
  
  playBoss() {
    if (!this.enabled || !this.ctx) return;
    this.stop();
    this.currentTrack = 'boss';
    this.nextNoteTime = this.ctx.currentTime;
    this.scheduleBossMusic();
  },
  
  scheduleBattleMusic() {
    if (this.currentTrack !== 'battle') return;
    const bpm = 120;
    const secondsPerBeat = 60.0 / bpm;
    while (this.nextNoteTime < this.ctx.currentTime + 0.1) {
      this.playBeat(this.nextNoteTime, 'battle');
      this.nextNoteTime += secondsPerBeat;
    }
    this.timerID = setTimeout(() => this.scheduleBattleMusic(), 25);
  },
  
  scheduleBossMusic() {
    if (this.currentTrack !== 'boss') return;
    const bpm = 140;
    const secondsPerBeat = 60.0 / bpm;
    while (this.nextNoteTime < this.ctx.currentTime + 0.1) {
      this.playBeat(this.nextNoteTime, 'boss');
      this.nextNoteTime += secondsPerBeat;
    }
    this.timerID = setTimeout(() => this.scheduleBossMusic(), 25);
  },
  
  playBeat(time, type) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    if (type === 'battle') {
      osc.frequency.value = 220;
      osc.type = 'sine';
    } else {
      osc.frequency.value = 110;
      osc.type = 'sawtooth';
    }
    gain.gain.setValueAtTime(this.volume * 0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(time);
    osc.stop(time + 0.1);
  },
  
  stop() {
    this.currentTrack = null;
    if (this.timerID) {
      clearTimeout(this.timerID);
      this.timerID = null;
    }
  },
  
  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
  },
  
  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.stop();
    } else if (gameState.running) {
      if (gameState.boss) {
        this.playBoss();
      } else {
        this.playBattle();
      }
    }
    return this.enabled;
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
  comboTimeout: 3000, // 连击超时时间（3秒）
  maxEnemies: 100,
  bossSpawnInterval: 180000, // 3分钟刷一次Boss
  difficultyScaling: 0.06, // 难度递增系数（降低从0.08）
  eliteChance: 0.03, // 精英怪出现概率（降低从0.05）
  waveInterval: 60000, // 波次间隔
  
  // 新增：动态难度调整
  earlyGameBuff: 1.3, // 前3波玩家伤害加成
  midGameScaling: 0.08, // 中期难度系数
  lateGameScaling: 0.12, // 后期难度系数
  
  // 新增：新手保护
  newbieProtection: {
    enabled: true,
    duration: 30000, // 前30秒减伤
    damageReduction: 0.5 // 50%减伤
  },
  

  
  // v1.6 新增：双武器系统
  dualWeapon: {
    enabled: true,
    switchCooldown: 500 // 武器切换冷却（毫秒）
  },
  
  // v1.6 新增：击退系统
  knockback: {
    enabled: true,
    baseForce: 30, // 基础击退距离
    scaling: 0.5   // 随伤害缩放
  },
  
  // v1.7 新增：特殊波次配置
  specialWaves: {
    enabled: true,
    eliteWaveInterval: 5,    // 每5波一次精英波
    speedWaveInterval: 7,    // 每7波一次速度波
    tankWaveInterval: 11,    // 每11波一次坦克波
    chaosWaveInterval: 13    // 每13波一次混乱波
  },
  
  // v1.7 新增：里程碑奖励
  milestones: {
    enabled: true,
    waves: [50, 100], // 里程碑波次
    rewards: {
      50: { type: 'character', id: 'transfer', name: '转校生' },
      100: { type: 'title', id: 'legend', name: '校园传说' }
    }
  },
  
  // v1.7 新增：可破坏物体
  destructibles: {
    enabled: true,
    spawnRate: 0.15, // 生成概率
    types: ['desk', 'trash', 'hoop', 'locker']
  }
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
    size: 25,
    color: '#74b9ff'
  },
  runner: {
    name: '快腿',
    emoji: '🏃',
    hp: 20,
    damage: 8,
    speed: 1.8,
    exp: 15,
    size: 22,
    color: '#55efc4'
  },
  tank: {
    name: '壮汉',
    emoji: '💪',
    hp: 80,
    damage: 20,
    speed: 0.6,
    exp: 30,
    size: 35,
    color: '#ff7675'
  },
  // 新敌人类型
  bomber: {
    name: '炸弹人',
    emoji: '🤯',
    hp: 40,
    damage: 30,
    speed: 1.2,
    exp: 25,
    size: 28,
    color: '#ffa502',
    explodeOnDeath: true
  },
  healer: {
    name: '奶妈',
    emoji: '👩‍⚕️',
    hp: 50,
    damage: 5,
    speed: 0.8,
    exp: 35,
    size: 26,
    color: '#2ed573',
    healNearby: true
  },
  teleporter: {
    name: '瞬移怪',
    emoji: '👻',
    hp: 35,
    damage: 12,
    speed: 1.4,
    exp: 40,
    size: 24,
    color: '#a29bfe',
    canTeleport: true
  },
  foodMinion: {
    name: '食物小兵',
    emoji: '🍔',
    hp: 100,
    damage: 15,
    speed: 1.2,
    exp: 50,
    size: 35,
    color: '#e67e22'
  }
};

// ==================== Boss系统 ====================
const BOSSES = {
  // 第1个Boss - 教导主任 (波次10)
  disciplinarian: {
    id: 'disciplinarian',
    name: '教导主任',
    emoji: '👨‍🏫',
    title: '纪律守护者',
    baseHp: 800,
    damage: 20,
    speed: 0.8,
    exp: 500,
    size: 60,
    color: '#e74c3c',
    
    skills: [
      {
        name: '作业轰炸',
        emoji: '📚',
        cooldown: 6000,
        description: '发射8个方向的作业弹幕',
        execute: (boss, player) => {
          // 8方向作业弹幕
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const speed = 4 + boss.phase * 0.5;
            gameState.bullets.push({
              x: boss.x,
              y: boss.y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              damage: 15 + boss.phase * 3,
              isEnemyBullet: true,
              emoji: '📚',
              life: 4,
              size: 20
            });
          }
          // 额外向玩家方向发射
          const angleToPlayer = Math.atan2(player.y - boss.y, player.x - boss.x);
          for (let i = -1; i <= 1; i++) {
            const angle = angleToPlayer + i * 0.3;
            gameState.bullets.push({
              x: boss.x,
              y: boss.y,
              vx: Math.cos(angle) * 5,
              vy: Math.sin(angle) * 5,
              damage: 20 + boss.phase * 4,
              isEnemyBullet: true,
              emoji: '📖',
              life: 3,
              size: 22
            });
          }
          showBossSkillEffect(boss.x, boss.y, '📚 作业轰炸!', '#e74c3c');
          ScreenShake.shake(5, 300);
        }
      },
      {
        name: '点名批评',
        emoji: '📢',
        cooldown: 10000,
        description: '锁定玩家，降低移动速度',
        execute: (boss, player) => {
          // 玩家减速效果
          gameState.activeEffects.slow = {
            active: true,
            endTime: Date.now() + 4000,
            multiplier: 0.4
          };
          // 创建锁定标记
          gameState.particles.push({
            x: player.x,
            y: player.y - 40,
            vx: 0,
            vy: -1,
            life: 3,
            color: '#e74c3c',
            size: 30,
            type: 'lockOn',
            emoji: '🔒',
            target: player
          });
          showBossSkillEffect(player.x, player.y - 60, '📢 你被点名了!', '#e74c3c');
        }
      },
      {
        name: '叫家长',
        emoji: '📞',
        cooldown: 15000,
        description: '召唤4个小弟协助战斗',
        execute: (boss, player) => {
          for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const dist = 120;
            const enemyType = i % 2 === 0 ? 'tank' : 'minion';
            spawnEnemyAt(
              boss.x + Math.cos(angle) * dist,
              boss.y + Math.sin(angle) * dist,
              enemyType
            );
          }
          showBossSkillEffect(boss.x, boss.y, '📞 叫家长!', '#e74c3c');
        }
      },
      {
        name: '大扫除',
        emoji: '🧹',
        cooldown: 12000,
        description: '全屏吸引敌人到Boss周围',
        execute: (boss, player) => {
          gameState.enemies.forEach(enemy => {
            const angle = Math.atan2(boss.y - enemy.y, boss.x - enemy.x);
            enemy.vx = Math.cos(angle) * 5;
            enemy.vy = Math.sin(angle) * 5;
            enemy.isPulled = true;
            enemy.pullEndTime = Date.now() + 2000;
          });
          // 创建旋风特效
          for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            gameState.particles.push({
              x: boss.x + Math.cos(angle) * 50,
              y: boss.y + Math.sin(angle) * 50,
              vx: Math.cos(angle + Math.PI/2) * 3,
              vy: Math.sin(angle + Math.PI/2) * 3,
              life: 2,
              color: '#95a5a6',
              size: 8,
              type: 'whirlwind'
            });
          }
          showBossSkillEffect(boss.x, boss.y, '🧹 大扫除!', '#95a5a6');
        }
      }
    ],
    
    phases: [
      { hpPercent: 1.0, multiplier: 1, name: '第一阶段' },
      { hpPercent: 0.6, multiplier: 1.4, name: '第二阶段' },
      { hpPercent: 0.3, multiplier: 1.8, name: '狂暴阶段' }
    ]
  },
  
  // 第2个Boss - 校长 (波次20)
  principal: {
    id: 'principal',
    name: '校长',
    emoji: '👴',
    title: '学校统治者',
    baseHp: 1500,
    damage: 30,
    speed: 0.6,
    exp: 1000,
    size: 70,
    color: '#8e44ad',
    
    skills: [
      {
        name: '校规制裁',
        emoji: '📜',
        cooldown: 8000,
        description: '召唤校规法阵，在范围内持续伤害',
        execute: (boss, player) => {
          // 在玩家位置创建危险区域
          const zoneX = player.x;
          const zoneY = player.y;
          gameState.hazardZones = gameState.hazardZones || [];
          gameState.hazardZones.push({
            x: zoneX,
            y: zoneY,
            radius: 150,
            damage: 10 + boss.phase * 5,
            endTime: Date.now() + 5000,
            color: '#8e44ad',
            emoji: '📜'
          });
          showBossSkillEffect(zoneX, zoneY, '📜 校规制裁!', '#8e44ad');
        }
      },
      {
        name: '权威压制',
        emoji: '👑',
        cooldown: 12000,
        description: '全屏震慑，玩家无法攻击3秒',
        execute: (boss, player) => {
          gameState.activeEffects.silence = {
            active: true,
            endTime: Date.now() + 3000
          };
          // 创建震慑波
          for (let r = 50; r <= 400; r += 50) {
            setTimeout(() => {
              for (let i = 0; i < 16; i++) {
                const angle = (i / 16) * Math.PI * 2;
                gameState.particles.push({
                  x: boss.x + Math.cos(angle) * r,
                  y: boss.y + Math.sin(angle) * r,
                  vx: Math.cos(angle) * 2,
                  vy: Math.sin(angle) * 2,
                  life: 0.5,
                  color: '#8e44ad',
                  size: 10,
                  type: 'shockwave'
                });
              }
            }, (r / 50) * 100);
          }
          showBossSkillEffect(boss.x, boss.y, '👑 权威压制!', '#8e44ad');
          ScreenShake.shake(10, 500);
        }
      },
      {
        name: '全校通报',
        emoji: '📢',
        cooldown: 15000,
        description: '召唤大量学生围攻',
        execute: (boss, player) => {
          // 在屏幕边缘召唤8个学生
          const spawnPoints = [
            { x: boss.x - 400, y: boss.y },
            { x: boss.x + 400, y: boss.y },
            { x: boss.x, y: boss.y - 300 },
            { x: boss.x, y: boss.y + 300 },
            { x: boss.x - 300, y: boss.y - 300 },
            { x: boss.x + 300, y: boss.y - 300 },
            { x: boss.x - 300, y: boss.y + 300 },
            { x: boss.x + 300, y: boss.y + 300 }
          ];
          spawnPoints.forEach((point, i) => {
            setTimeout(() => {
              const types = ['runner', 'minion', 'tank'];
              spawnEnemyAt(point.x, point.y, types[i % 3]);
            }, i * 200);
          });
          showBossSkillEffect(boss.x, boss.y, '📢 全校通报!', '#8e44ad');
        }
      },
      {
        name: '终极审判',
        emoji: '⚖️',
        cooldown: 20000,
        description: '发射追踪弹幕，持续10秒',
        execute: (boss, player) => {
          // 持续发射追踪弹
          let shots = 0;
          const interval = setInterval(() => {
            if (!gameState.boss || gameState.boss.id !== boss.id || shots >= 10) {
              clearInterval(interval);
              return;
            }
            const angle = Math.atan2(player.y - boss.y, player.x - boss.x);
            gameState.bullets.push({
              x: boss.x,
              y: boss.y,
              vx: Math.cos(angle) * 3,
              vy: Math.sin(angle) * 3,
              damage: 25 + boss.phase * 5,
              isEnemyBullet: true,
              emoji: '⚖️',
              life: 5,
              size: 25,
              homing: true,
              target: player,
              homingStrength: 0.1
            });
            shots++;
          }, 800);
          showBossSkillEffect(boss.x, boss.y, '⚖️ 终极审判!', '#8e44ad');
        }
      }
    ],
    
    phases: [
      { hpPercent: 1.0, multiplier: 1, name: '威严姿态' },
      { hpPercent: 0.65, multiplier: 1.3, name: '愤怒形态' },
      { hpPercent: 0.35, multiplier: 1.7, name: '暴走模式' },
      { hpPercent: 0.15, multiplier: 2.2, name: '绝望挣扎' }
    ]
  },
  
  // 第3个Boss - 食堂大妈 (波次30)
  lunchLady: {
    id: 'lunchLady',
    name: '食堂大妈',
    emoji: '👩‍🍳',
    title: '黑暗料理王',
    baseHp: 2000,
    damage: 35,
    speed: 0.5,
    exp: 1500,
    size: 75,
    color: '#d35400',
    
    skills: [
      {
        name: '黑暗料理',
        emoji: '🍲',
        cooldown: 7000,
        description: '投掷各种食物造成不同效果',
        execute: (boss, player) => {
          const foods = [
            { emoji: '🌶️', effect: 'burn', damage: 30, color: '#e74c3c' },
            { emoji: '🧊', effect: 'freeze', damage: 15, color: '#3498db' },
            { emoji: '🍋', effect: 'slow', damage: 20, color: '#f1c40f' },
            { emoji: '🍖', effect: 'heal', damage: -20, color: '#27ae60' }
          ];
          // 发射6个食物
          for (let i = 0; i < 6; i++) {
            const food = foods[Math.floor(Math.random() * foods.length)];
            const angle = Math.atan2(player.y - boss.y, player.x - boss.x) + (Math.random() - 0.5) * 1;
            gameState.bullets.push({
              x: boss.x,
              y: boss.y,
              vx: Math.cos(angle) * (3 + Math.random()),
              vy: Math.sin(angle) * (3 + Math.random()),
              damage: food.damage * (1 + boss.phase * 0.3),
              isEnemyBullet: true,
              emoji: food.emoji,
              life: 4,
              size: 24,
              effect: food.effect,
              color: food.color
            });
          }
          showBossSkillEffect(boss.x, boss.y, '🍲 黑暗料理!', '#d35400');
        }
      },
      {
        name: '手抖攻击',
        emoji: '🥄',
        cooldown: 5000,
        description: '大范围随机投掷',
        execute: (boss, player) => {
          // 向随机方向发射大量投射物
          for (let i = 0; i < 12; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            gameState.bullets.push({
              x: boss.x,
              y: boss.y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              damage: 15 + boss.phase * 3,
              isEnemyBullet: true,
              emoji: ['🥄', '🍴', '🥢', '🥣'][Math.floor(Math.random() * 4)],
              life: 3,
              size: 18
            });
          }
          showBossSkillEffect(boss.x, boss.y, '🥄 手抖攻击!', '#d35400');
          ScreenShake.shake(8, 400);
        }
      },
      {
        name: '食物召唤',
        emoji: '🍔',
        cooldown: 10000,
        description: '召唤食物小兵',
        execute: (boss, player) => {
          // 召唤3个特殊食物怪
          for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2;
            const dist = 100;
            const foodEnemy = {
              type: 'foodMinion',
              x: boss.x + Math.cos(angle) * dist,
              y: boss.y + Math.sin(angle) * dist,
              hp: 100 + boss.phase * 50,
              maxHp: 100 + boss.phase * 50,
              damage: 15 + boss.phase * 5,
              speed: 1.2,
              exp: 50,
              size: 35,
              emoji: ['🍔', '🍟', '🌭'][i],
              color: '#e67e22',
              isFoodMinion: true,
              onDeath: () => {
                // 死亡时掉落治疗道具
                spawnItemAt(boss.x + Math.cos(angle) * dist, boss.y + Math.sin(angle) * dist, 'healthPack');
              }
            };
            gameState.enemies.push(foodEnemy);
          }
          showBossSkillEffect(boss.x, boss.y, '🍔 食物召唤!', '#d35400');
        }
      },
      {
        name: '食堂暴动',
        emoji: '🍽️',
        cooldown: 18000,
        description: '全屏食物雨',
        execute: (boss, player) => {
          // 从天上掉落大量食物
          let drops = 0;
          const interval = setInterval(() => {
            if (!gameState.boss || gameState.boss.id !== boss.id || drops >= 30) {
              clearInterval(interval);
              return;
            }
            const x = boss.x + (Math.random() - 0.5) * 600;
            const y = boss.y - 300;
            gameState.bullets.push({
              x: x,
              y: y,
              vx: 0,
              vy: 6 + Math.random() * 3,
              damage: 20 + boss.phase * 5,
              isEnemyBullet: true,
              emoji: ['🍎', '🍊', '🍇', '🍉', '🍌', '🍓'][Math.floor(Math.random() * 6)],
              life: 3,
              size: 22,
              gravity: true
            });
            drops++;
          }, 200);
          showBossSkillEffect(boss.x, boss.y - 100, '🍽️ 食堂暴动!', '#d35400');
          ScreenShake.shake(12, 1000);
        }
      }
    ],
    
    phases: [
      { hpPercent: 1.0, multiplier: 1, name: '准备食材' },
      { hpPercent: 0.7, multiplier: 1.2, name: '开始烹饪' },
      { hpPercent: 0.4, multiplier: 1.6, name: '大火爆炒' },
      { hpPercent: 0.2, multiplier: 2.0, name: '终极黑暗料理' }
    ]
  }
};

// Boss战斗配置
const BOSS_SPAWN_WAVES = [10, 20, 30]; // 哪些波次生成Boss
const BOSS_REWARDS = {
  disciplinarian: ['lunchBox', 'damage', 'hp'],
  principal: ['waterBalloon', 'attackSpeed', 'speed'],
  lunchLady: ['firecracker', 'crit', 'defense']
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
  },
  // 新武器 - v1.6 平衡调整
  lunchBox: {
    name: '饭盒重击',
    emoji: '🍱',
    damage: 2.2,
    speed: 0.75,
    stun: true,
    stunChance: 0.35, // 增加眩晕概率
    splashRange: 60,  // 添加溅射范围
    maxLevel: 5,
    description: '饭盒砸击，35%概率眩晕，有小范围溅射'
  },
  waterBalloon: {
    name: '水球乱斗',
    emoji: '🎈',
    damage: 1.0,
    speed: 1.2,
    slow: true,
    slowAmount: 0.4,
    slowDuration: 2000,
    maxLevel: 5,
    description: '水球减速敌人40%，持续2秒'
  },
  firecracker: {
    name: '鞭炮轰炸',
    emoji: '🧨',
    damage: 3.5,
    speed: 0.45,
    explode: true,
    aoe: true,
    maxLevel: 5,
    description: '高伤害范围爆炸'
  },
  // v1.6 新增武器 - 激光笔（削弱后）
  laser: {
    name: '激光笔',
    emoji: '🔦',
    damage: 1.2,
    speed: 2.0,
    pierce: 2, // 降低穿透次数
    maxLevel: 5,
    description: '高速穿透激光，穿透2个敌人'
  },
  // v1.6 新增武器 - 冰棒（冰冻效果）
  iceStick: {
    name: '冰棒投掷',
    emoji: '🍦',
    damage: 1.0,
    speed: 1.1,
    freeze: true,
    freezeDuration: 1500,
    maxLevel: 5,
    description: '冰冻敌人1.5秒'
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
  healthPackLarge: {
    name: '超级饮料',
    emoji: '🧃',
    effect: 'heal',
    value: 100,
    duration: 0,
    color: '#ff4757',
    description: '恢复100点生命值',
    spawnRate: 0.015
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
  },
  revive: {
    name: '复活币',
    emoji: '💎',
    effect: 'revive',
    value: 0,
    duration: 0,
    color: '#00d2d3',
    description: '死亡时自动复活一次',
    spawnRate: 0.008
  },
  timeFreeze: {
    name: '时间停止',
    emoji: '⏱️',
    effect: 'freeze',
    value: 0,
    duration: 3000,
    color: '#5f27cd',
    description: '冻结时间3秒',
    spawnRate: 0.012
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
  { type: 'weapon', id: 'lunchBox', name: '饭盒重击', emoji: '🍱', desc: '解锁饭盒眩晕攻击', unlockLevel: 5 },
  { type: 'weapon', id: 'waterBalloon', name: '水球乱斗', emoji: '🎈', desc: '解锁水球减速攻击', unlockLevel: 8 },
  { type: 'weapon', id: 'firecracker', name: '鞭炮轰炸', emoji: '🧨', desc: '解锁鞭炮范围爆炸', unlockLevel: 12 },
  // 属性强化
  { type: 'stat', id: 'damage', name: '力量强化', emoji: '💪', desc: '攻击力 +20%' },
  { type: 'stat', id: 'speed', name: '速度提升', emoji: '⚡', desc: '移动速度 +15%' },
  { type: 'stat', id: 'hp', name: '体能训练', emoji: '❤️', desc: '最大生命值 +30' },
  { type: 'stat', id: 'attackSpeed', name: '攻速强化', emoji: '🔥', desc: '攻击速度 +25%' },
  { type: 'stat', id: 'crit', name: '暴击训练', emoji: '💥', desc: '暴击率 +10%' },
  { type: 'stat', id: 'pickup', name: '拾取范围', emoji: '👋', desc: '经验拾取范围 +30%' },
  { type: 'stat', id: 'defense', name: '防御训练', emoji: '🛡️', desc: '受到伤害 -15%' },
  { type: 'stat', id: 'regen', name: '生命恢复', emoji: '💚', desc: '每秒恢复2点生命' },
  // 特殊能力
  { type: 'special', id: 'rageBoost', name: '怒气爆发', emoji: '😡', desc: '暴走时间 +2秒' },
  { type: 'special', id: 'healOnKill', name: '吸血', emoji: '🩸', desc: '击杀恢复5点生命' },
  { type: 'special', id: 'expBonus', name: '学霸天赋', emoji: '🎓', desc: '经验获取 +15%' },
  { type: 'special', id: 'itemLuck', name: '幸运星', emoji: '⭐', desc: '道具掉落率 +50%' },
  { type: 'special', id: 'pierceShot', name: '穿透射击', emoji: '➡️', desc: '子弹穿透+1' },
  { type: 'special', id: 'doubleShot', name: '双重射击', emoji: '👥', desc: '25%概率双倍子弹' }
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
    examPaper: { level: 0, unlocked: false },
    lunchBox: { level: 0, unlocked: false },
    waterBalloon: { level: 0, unlocked: false },
    firecracker: { level: 0, unlocked: false }
  },
  
  // 超武状态
  superWeapons: {},
  
  // 道具状态
  items: [],
  collectedItems: [],
  activeEffects: {
    magnet: { active: false, endTime: 0 },
    shield: { active: false, endTime: 0 },
    speed: { active: false, endTime: 0, multiplier: 1 },
    exp: { active: false, endTime: 0, multiplier: 1 },
    slow: { active: false, endTime: 0, multiplier: 1 },
    silence: { active: false, endTime: 0 },
    burn: { active: false, endTime: 0, damage: 0, lastTick: 0 }
  },
  
  // 解锁的能力
  unlocks: {
    rageBoost: false,
    healOnKill: false,
    expBonus: false,
    itemLuck: false,
    crit: false,
    pickup: false,
    defense: false,
    regen: false,
    pierceShot: false,
    doubleShot: false
  },
  
  // 额外属性
  regenAmount: 0,
  extraPierce: 0,
  doubleShotChance: 0,
  hasRevive: false,
  timeFrozen: false,
  timeFreezeEnd: 0,
  
  // 游戏对象
  enemies: [],
  bullets: [],
  particles: [],
  expOrbs: [],
  playerZones: [],
  
  // 波次系统
  wave: 1,
  waveStartTime: 0,
  nextWaveTime: CONFIG.waveInterval,
  
  // v1.7 新增：特殊波次状态
  specialWave: {
    active: false,
    type: null, // 'elite', 'speed', 'tank', 'chaos'
    startTime: 0,
    notified: false
  },
  
  // Boss系统
  boss: null,
  bossDefeated: [],
  hazardZones: [],
  bossFightActive: false,
  
  // v1.6 新增：连击系统
  combo: {
    count: 0,
    lastKillTime: 0,
    maxCombo: 0,
    bonusMultiplier: 1
  },
  
  // v1.6 新增：双武器系统
  dualWeapon: {
    primary: null,    // 主武器ID
    secondary: null,  // 副武器ID
    current: 'primary', // 当前使用的武器
    lastSwitchTime: 0
  },
  
  // v1.7 新增：可破坏物体
  destructibles: [],
  
  // 统计
  kills: 0,
  totalDamage: 0,
  maxCombo: 0,
  rageKills: 0,
  bossKilled: 0,
  weaponsUnlocked: 1,
  damageTaken: 0,
  noDamageRun: true,
  eliteKills: 0,
  bomberKills: 0,
  timeFreezes: 0,
  
  // v1.7 新增：里程碑记录
  milestonesReached: []
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
  
  // 初始化背景效果
  BackgroundEffects.init();
  
  // 初始化音效系统
  AudioSystem.init();
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('pagehide', () => WeaponMastery.flush());
  
  // 输入事件
  window.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (e.code === 'KeyP') togglePause();
    if (e.code === 'Space') activateRage();
    if (e.code === 'KeyQ') switchWeapon(); // v1.6 双武器切换
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
  showStartScreen();
  
  // 初始化移动端控制
  if (window.MobileControls) {
    MobileControls.init();
  }
  
  // 初始化性能优化
  if (window.PerformanceOptimizer) {
    PerformanceOptimizer.init();
  }
  
  // 开始游戏循环
  requestAnimationFrame(gameLoop);
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function setupUI() {
  // 使用事件委托支持新壳子中的动态重渲染
  document.addEventListener('click', e => {
    const card = e.target.closest('.character-card');
    if (card) {
      document.querySelectorAll('.character-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      gameState.player.character = card.dataset.character;
    }

    if (e.target.id === 'startBtn') {
      startGame();
    }

    if (e.target.id === 'restartBtn') {
      document.getElementById('gameOverModal').classList.remove('active');
      showStartScreen();
    }

    if (e.target.id === 'muteBtn') {
      AudioSystem.toggleMute();
    }
  });
  
  // 暂停按钮
  document.getElementById('pauseBtn').addEventListener('click', togglePause);
  
  // 初始化版本管理器
  if (window.VersionManager) {
    VersionManager.init();
  }

  const muteBtn = document.getElementById('muteBtn');
  if (muteBtn) {
    muteBtn.textContent = AudioSystem.enabled ? '🔊 音效: 开' : '🔇 音效: 关';
  }
}

// ==================== 游戏流程 ====================
function startGame() {
  // 重置成就会话缓存
  SaveSystem.resetSession();
  
  const selectedLoadout = window.AppShell?.getSelectedLoadout?.() || {};
  if (selectedLoadout.character) {
    gameState.player.character = selectedLoadout.character;
  }
  const primaryWeaponId = selectedLoadout.primaryWeapon || 'textbook';
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
    textbook: { level: primaryWeaponId === 'textbook' ? 1 : 0, unlocked: primaryWeaponId === 'textbook' },
    chalk: { level: 0, unlocked: false },
    ruler: { level: 0, unlocked: false },
    basketball: { level: 0, unlocked: false },
    eraser: { level: 0, unlocked: false },
    broom: { level: 0, unlocked: false },
    ink: { level: 0, unlocked: false },
    triangle: { level: 0, unlocked: false },
    examPaper: { level: 0, unlocked: false },
    lunchBox: { level: 0, unlocked: false },
    waterBalloon: { level: 0, unlocked: false },
    firecracker: { level: 0, unlocked: false }
  };
  if (gameState.weapons[primaryWeaponId]) {
    gameState.weapons[primaryWeaponId].level = 1;
    gameState.weapons[primaryWeaponId].unlocked = true;
  }
  
  // 重置超武
  gameState.superWeapons = {};
  
  // 重置解锁能力
  gameState.unlocks = {
    rageBoost: false,
    healOnKill: false,
    expBonus: false,
    itemLuck: false,
    crit: false,
    pickup: false,
    defense: false,
    regen: false,
    pierceShot: false,
    doubleShot: false
  };
  
  // 重置额外属性
  gameState.regenAmount = 0;
  gameState.extraPierce = 0;
  gameState.doubleShotChance = 0;
  
  // 重置道具和效果
  gameState.items = [];
  gameState.collectedItems = [];
  gameState.activeEffects = {
    magnet: { active: false, endTime: 0 },
    shield: { active: false, endTime: 0 },
    speed: { active: false, endTime: 0, multiplier: 1 },
    exp: { active: false, endTime: 0, multiplier: 1 },
    slow: { active: false, endTime: 0, multiplier: 1 },
    silence: { active: false, endTime: 0 },
    burn: { active: false, endTime: 0, damage: 0, lastTick: 0 }
  };
  
  // 重置游戏对象
  gameState.enemies = [];
  gameState.bullets = [];
  gameState.particles = [];
  gameState.expOrbs = [];
  gameState.playerZones = [];
  
  // 重置波次系统
  gameState.wave = 1;
  gameState.waveStartTime = 0;
  gameState.nextWaveTime = CONFIG.waveInterval;
  
  // 重置Boss系统
  gameState.boss = null;
  gameState.bossDefeated = [];
  gameState.hazardZones = [];
  gameState.bossFightActive = false;
  
  // 重置时间冻结
  gameState.timeFrozen = false;
  gameState.timeFreezeEnd = 0;
  
  // 重置复活币
  gameState.hasRevive = false;
  

  
  // v1.6 重置双武器系统
  gameState.dualWeapon = {
    primary: primaryWeaponId,
    secondary: null,
    current: 'primary',
    lastSwitchTime: 0
  };
  
  // v1.7 重置特殊波次
  gameState.specialWave = {
    active: false,
    type: null,
    startTime: 0,
    notified: false
  };
  
  // v1.7 重置可破坏物体
  gameState.destructibles = [];
  
  // v1.7 重置里程碑
  gameState.milestonesReached = [];
  
  // 重置统计
  gameState.kills = 0;
  gameState.totalDamage = 0;
  gameState.maxCombo = 0;
  gameState.eliteKills = 0;
  gameState.bomberKills = 0;
  gameState.timeFreezes = 0;
  gameState.startTime = Date.now();
  gameState.lastTime = Date.now();
  gameState.running = true;
  gameState.paused = false;
  gameState.gameOver = false;
  
  // 播放战斗BGM
  BGM.playBattle();
  
  // 隐藏开始界面
  document.getElementById('startScreen').classList.add('hidden');
  document.getElementById('hud').style.display = 'flex';
  document.getElementById('skillBar').style.display = 'flex';
  document.getElementById('hint').style.display = 'block';
  
  // 显示移动端控制
  if (gameState.isMobile || gameState.isWechat) {
    const mobileControls = document.getElementById('mobileControls');
    if (mobileControls) mobileControls.style.display = 'block';
  }
  
  updateSkillBar();
  if (window.LegacyGameBridge?.showBattle) {
    window.LegacyGameBridge.showBattle({
      character: gameState.player.character,
      weapon: primaryWeaponId
    });
  }
}

function showStartScreen() {
  document.getElementById('startScreen').classList.remove('hidden');
  document.getElementById('gameOverModal').classList.remove('active');
  document.getElementById('hud').style.display = 'none';
  document.getElementById('skillBar').style.display = 'none';
  document.getElementById('hint').style.display = 'none';
  document.getElementById('mobileControls').style.display = 'none';
  gameState.running = false;
  
  // 显示新手引导（首次游玩）
  if (window.TutorialSystem && TutorialSystem.shouldShowTutorial()) {
    setTimeout(() => TutorialSystem.start(), 500);
  }

  if (window.LegacyGameBridge?.showHome) {
    window.LegacyGameBridge.showHome();
  }
}

window.LegacyGameData = {
  getSaveData() {
    return SaveSystem.load();
  },
  getLeaderboard() {
    return Leaderboard.getTop(5);
  },
  getCurrentTitleId() {
    return TitleSystem.getCurrentTitle();
  }
};

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
  // 播放成就解锁音效
  AudioSystem.playAchievement();
  
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
  WeaponMastery.flush();

  // 检查是否有复活币
  if (gameState.hasRevive) {
    gameState.hasRevive = false;
    gameState.player.hp = gameState.player.maxHp * 0.5;
    
    // 清屏效果
    VisualEffects.createExplosion(gameState.player.x, gameState.player.y, '#00d2d3', 30);
    ScreenShake.shake(15, 500);
    
    // 击退周围敌人
    gameState.enemies.forEach(enemy => {
      const dist = Math.hypot(enemy.x - gameState.player.x, enemy.y - gameState.player.y);
      if (dist < 200) {
        const angle = Math.atan2(enemy.y - gameState.player.y, enemy.x - gameState.player.x);
        enemy.x += Math.cos(angle) * 150;
        enemy.y += Math.sin(angle) * 150;
        enemy.hp -= 50;
      }
    });
    
    // 显示复活提示
    showEffectIndicator('💎 复活!', '#00d2d3');
    FloatingText.add(gameState.player.x, gameState.player.y - 50, '复活!', '#00d2d3', 28);
    
    return; // 不结束游戏
  }
  
  gameState.gameOver = true;
  gameState.running = false;
  
  // 停止BGM
  BGM.stop();
  
  // 播放游戏结束音效
  AudioSystem.playGameOver();
  
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
    noDamageRun: gameState.noDamageRun,
    wave: gameState.wave,
    eliteKills: gameState.eliteKills,
    bomberKills: gameState.bomberKills,
    timeFreezes: gameState.timeFreezes
  };
  
  const saveData = SaveSystem.updateStats(gameStats);
  
  // 添加到排行榜
  const score = gameState.kills * 10 + gameState.bossKilled * 500 + gameState.wave * 100;
  const rank = Leaderboard.addEntry({
    score: score,
    kills: gameState.kills,
    time: surviveTime,
    level: gameState.player.level,
    wave: gameState.wave,
    bossKilled: gameState.bossKilled,
    character: gameState.player.character
  });
  
  // 检查天赋点奖励
  const newTalentPoints = TalentTree.checkTalentPointsFromAchievements();
  if (newTalentPoints > 0) {
    showEffectIndicator(`✨ 获得 ${newTalentPoints} 天赋点!`, '#9b59b6');
  }
  
  document.getElementById('finalTime').textContent = `${minutes}:${seconds}`;
  document.getElementById('finalKills').textContent = gameState.kills;
  document.getElementById('finalLevel').textContent = gameState.player.level;
  
  // 更新游戏结束界面显示存档数据
  updateGameOverStats(saveData);
  
  // 显示排行榜排名
  if (rank && rank <= 10) {
    setTimeout(() => {
      showLeaderboardRank(rank);
    }, 1000);
  }
  
  document.getElementById('gameOverModal').classList.add('active');
  if (window.LegacyGameBridge?.showResults) {
    const unlockedAchievements = Array.from(SaveSystem.sessionUnlocked);
    const unlockedTitles = TitleSystem.getUnlockedTitles()
      .filter(title => title.requiresAchievement && unlockedAchievements.includes(title.requiresAchievement))
      .map(title => title.id);

    window.LegacyGameBridge.showResults({
      time: `${minutes}:${seconds}`,
      kills: gameState.kills,
      level: gameState.player.level,
      wave: gameState.wave,
      items: gameState.collectedItems.slice(0, 8),
      primaryWeapon: gameState.dualWeapon.primary,
      secondaryWeapon: gameState.dualWeapon.secondary,
      bossesDefeated: gameState.bossDefeated.slice(),
      weaponsUnlocked: weaponsUnlocked,
      talentPointsEarned: newTalentPoints,
      newAchievements: unlockedAchievements,
      newTitles: unlockedTitles
    });
  }
}

// 显示排行榜排名
function showLeaderboardRank(rank) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, rgba(241,196,15,0.95), rgba(243,156,18,0.95));
    border: 3px solid #f39c12;
    border-radius: 20px;
    padding: 25px 40px;
    text-align: center;
    z-index: 1100;
    animation: rankPopup 3s ease-out forwards;
    box-shadow: 0 0 40px rgba(241,196,15,0.8);
  `;
  
  const rankEmoji = rank === 1 ? '👑' : (rank <= 3 ? '🥈' : '🏅');
  const rankText = rank === 1 ? '冠军' : (rank === 2 ? '亚军' : (rank === 3 ? '季军' : `第${rank}名`));
  
  notification.innerHTML = `
    <div style="font-size:56px;margin-bottom:10px">${rankEmoji}</div>
    <div style="font-size:16px;color:#fff;text-transform:uppercase;letter-spacing:3px">排行榜</div>
    <div style="font-size:42px;font-weight:900;color:#fff;margin:10px 0;text-shadow:0 0 20px rgba(0,0,0,0.3)">${rankText}</div>
    <div style="font-size:14px;color:#fef9e7">恭喜进入前10名!</div>
  `;
  document.body.appendChild(notification);
  
  setTimeout(() => notification.remove(), 3000);
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
  
  // 应用慢镜头时间缩放
  const timeScale = SlowMotion.getTimeScale();
  deltaTime *= timeScale;
  
  // 更新慢镜头
  SlowMotion.update();
  
  // 更新屏幕震动
  ScreenShake.update(deltaTime);
  
  // 更新时间冻结
  updateTimeFreeze();
  
  // 更新暴走状态
  updateRage(deltaTime);
  
  // 更新道具效果
  updateActiveEffects();
  
  // 更新死亡动画
  DeathAnimation.update();
  
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
  
  // 更新敌人（时间冻结时跳过）
  if (!gameState.timeFrozen) {
    updateEnemies(deltaTime);
  }
  
  // 更新道具
  updateItems(deltaTime);
  
  // 更新经验球
  updateExpOrbs(deltaTime);

  // 更新玩家武器区域效果
  updatePlayerZones(deltaTime);
  
  // v1.7 更新特殊波次
  updateSpecialWave();
  
  // v1.7 更新可破坏物体
  updateDestructibles(deltaTime);
  
  // 更新粒子
  updateParticles(deltaTime);
  
  // 生命恢复
  updateHealthRegen(deltaTime);
  
  // 更新UI
  updateUI();
}

function updateHealthRegen(deltaTime) {
  if (gameState.unlocks.regen && gameState.player.hp < gameState.player.maxHp) {
    if (!gameState.lastRegen || Date.now() - gameState.lastRegen > 1000) {
      const regenAmount = gameState.regenAmount || 2;
      gameState.player.hp = Math.min(gameState.player.maxHp, gameState.player.hp + regenAmount);
      gameState.lastRegen = Date.now();
    }
  }
}

function applyDefense(damage) {
  if (gameState.unlocks.defense) {
    return damage * 0.85; // 15%伤害减免
  }
  return damage;
}

// ==================== 玩家逻辑 ====================
function updatePlayerMovement(deltaTime) {
  const player = gameState.player;
  let dx = 0, dy = 0;
  
  // 键盘控制
  if (keys['KeyW'] || keys['ArrowUp']) dy -= 1;
  if (keys['KeyS'] || keys['ArrowDown']) dy += 1;
  if (keys['KeyA'] || keys['ArrowLeft']) dx -= 1;
  if (keys['KeyD'] || keys['ArrowRight']) dx += 1;
  
  // 移动端虚拟摇杆控制
  if (window.MobileControls && MobileControls.joystick.active) {
    const joystickInput = MobileControls.getInput();
    dx = joystickInput.x;
    dy = joystickInput.y;
  }
  // 鼠标/触摸移动（仅在非移动端）
  else if (mouse.down && !gameState.isMobile) {
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
  const slowMultiplier = gameState.activeEffects.slow.active
    ? gameState.activeEffects.slow.multiplier
    : 1;
  player.x += dx * speed * slowMultiplier;
  player.y += dy * speed * slowMultiplier;
  
  // 边界限制
  const margin = 50;
  player.x = Math.max(margin, Math.min(3000 - margin, player.x));
  player.y = Math.max(margin, Math.min(3000 - margin, player.y));
}

function updatePlayerAttack(deltaTime) {
  const player = gameState.player;

  if (gameState.activeEffects.silence.active) {
    return;
  }
  
  // v1.7 性能优化：只攻击当前装备的武器
  const currentWeaponId = getCurrentWeaponId();
  
  // 如果没有当前武器，不执行攻击
  if (!currentWeaponId || !gameState.weapons[currentWeaponId]?.unlocked) {
    return;
  }
  
  const weaponData = gameState.weapons[currentWeaponId];
  const weapon = WEAPONS[currentWeaponId];
  
  // 检查武器是否有效
  if (!weapon || !weaponData || weaponData.level <= 0) return;
  
  const fireRate = 1 / (player.attackSpeed * weapon.speed * (player.rageActive ? 2 : 1));
  
  if (!weaponData.lastFire || Date.now() - weaponData.lastFire > fireRate * 1000) {
    fireWeapon(currentWeaponId, weapon, weaponData);
    weaponData.lastFire = Date.now();
  }
}

function fireWeapon(weaponId, weapon, weaponData) {
  const player = gameState.player;
  const count = weaponData.level;
  
  // 播放射击音效
  AudioSystem.playShoot(weaponId);
  
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
        createBullet(player.x, player.y, angle + spread, weapon, false, weaponId);
      }
      break;
      
    case 'chalk':
      for (let i = 0; i < 3; i++) {
        const spread = (i - 1) * 0.3;
        createBullet(player.x, player.y, angle + spread, weapon, false, weaponId);
      }
      break;
      
    case 'ruler':
      for (let i = 0; i < 4 + Math.min(2, Math.floor(count / 3)); i++) {
        const rotation = (Date.now() / 1000) + (i * Math.PI / 2);
        createBullet(player.x, player.y, rotation, weapon, true, weaponId);
      }
      break;
      
    case 'basketball':
      for (let i = 0; i < Math.min(1 + Math.floor(count / 4), 2); i++) {
        const spread = (i - (Math.min(1 + Math.floor(count / 4), 2) - 1) / 2) * 0.08;
        const bullet = createBullet(player.x, player.y, angle + spread, weapon, false, weaponId);
        if (bullet) {
          bullet.size = 13 + Math.min(4, count);
          bullet.life = 0.9;
          bullet.knockbackBoost = 35 + count * 4;
          bullet.explosionRadius = 100 + count * 4;
          bullet.explosionDamageScale = 0.95;
          bullet.trailColor = '#f39c12';
        }
      }
      break;
      
    case 'eraser':
      for (let i = 0; i < Math.min(1 + Math.floor(count / 3), 3); i++) {
        const spread = (i - Math.floor(Math.min(1 + Math.floor(count / 3), 3) / 2)) * 0.18;
        const bullet = createBullet(player.x, player.y, angle + spread, weapon, false, weaponId);
        if (bullet) {
          bullet.pierce = Math.max(bullet.pierce, 1 + Math.floor(count / 2));
        }
      }
      break;

    case 'broom':
      for (let i = 0; i < Math.min(3 + Math.floor(count / 2), 6); i++) {
        const total = Math.min(3 + Math.floor(count / 2), 6);
        const spread = (i - (total - 1) / 2) * 0.34;
        const bullet = createBullet(player.x, player.y, angle + spread, weapon, false, weaponId);
        if (bullet) {
          bullet.life = 0.3;
          bullet.size = 11;
          bullet.knockbackBoost = 48 + count * 3;
          bullet.pierce = Math.max(bullet.pierce, 1);
          bullet.stunChance = count >= 5 ? 0.18 : 0.08;
          bullet.trailColor = '#27ae60';
        }
      }
      break;

    case 'ink':
      for (let i = 0; i < Math.min(1 + Math.floor(count / 3), 3); i++) {
        const spread = (i - (Math.min(1 + Math.floor(count / 3), 3) - 1) / 2) * 0.12;
        const bullet = createBullet(player.x, player.y, angle + spread, weapon, false, weaponId);
        if (bullet) {
          bullet.dotEffect = true;
          bullet.dotDamage = Math.max(4, Math.floor(bullet.damage * 0.2));
        }
      }
      break;

    case 'triangle':
      for (let i = 0; i < Math.min(1 + Math.floor(count / 3), 3); i++) {
        const spread = (i - (Math.min(1 + Math.floor(count / 3), 3) - 1) / 2) * 0.16;
        createBullet(player.x, player.y, angle + spread, weapon, false, weaponId);
      }
      break;

    case 'examPaper':
      {
        const masteryBonuses = WeaponMastery.getBonuses(weaponId);
        const totalPapers = Math.min(
          6 + count + (masteryBonuses.special ? 2 : 0) + (masteryBonuses.ultimate ? 4 : 0),
          masteryBonuses.ultimate ? 20 : 14
        );
        const stormSpread = masteryBonuses.ultimate ? 2.8 : (masteryBonuses.special ? 2.2 : 1.8);
        const spawnRadius = masteryBonuses.ultimate ? 110 : 70;

        for (let i = 0; i < totalPapers; i++) {
          const spawnAngle = (Math.PI * 2 * i) / totalPapers + Math.random() * 0.35;
          const spawnX = player.x + Math.cos(spawnAngle) * (Math.random() * spawnRadius);
          const spawnY = player.y + Math.sin(spawnAngle) * (Math.random() * spawnRadius);
          const stormAngle = angle + (Math.random() - 0.5) * stormSpread;
          const bullet = createBullet(spawnX, spawnY, stormAngle, weapon, false, weaponId);
          if (!bullet) continue;

          bullet.life = masteryBonuses.ultimate ? 1.7 : 1.2;
          bullet.size = masteryBonuses.ultimate ? 10 : 8;
          bullet.pierce = Math.max(bullet.pierce, masteryBonuses.ultimate ? 2 : 1);
          bullet.vx *= masteryBonuses.ultimate ? 0.7 : 0.8;
          bullet.vy *= masteryBonuses.ultimate ? 0.7 : 0.8;
          bullet.vx += (Math.random() - 0.5) * 2.4;
          bullet.vy += (Math.random() - 0.5) * 2.4;
          bullet.blindEffect = masteryBonuses.special;
          bullet.paperStorm = true;
          bullet.trailColor = '#ecf0f1';
        }
      }
      break;
      
    case 'lunchBox':
      // 饭盒重击 - 短距离高伤害
      for (let i = 0; i < count; i++) {
        const spread = (i - count/2) * 0.15;
        const bullet = createBullet(player.x, player.y, angle + spread, weapon, false, weaponId);
        if (bullet) {
          bullet.life = 0.4; // 短距离
          bullet.stunChance = 0.3; // 眩晕概率
        }
      }
      break;
      
    case 'waterBalloon':
      // 水球乱斗 - 减速效果
      for (let i = 0; i < count; i++) {
        const spread = (i - count/2) * 0.25;
        const bullet = createBullet(player.x, player.y, angle + spread, weapon, false, weaponId);
        if (bullet) {
          bullet.slowEffect = true;
        }
      }
      break;
      
    case 'firecracker':
      // 鞭炮轰炸 - 范围爆炸
      createBullet(player.x, player.y, angle, weapon, false, weaponId);
      // 额外散射小鞭炮
      for (let i = 0; i < 2; i++) {
        const spread = (Math.random() - 0.5) * 0.5;
        createBullet(player.x, player.y, angle + spread, weapon, false, weaponId);
      }
      break;

    case 'laser':
      for (let i = 0; i < Math.min(1 + Math.floor(count / 2), 3); i++) {
        const spread = (i - (Math.min(1 + Math.floor(count / 2), 3) - 1) / 2) * 0.05;
        const bullet = createBullet(player.x, player.y, angle + spread, weapon, false, weaponId);
        if (bullet) {
          bullet.life = 0.55;
        }
      }
      break;

    case 'iceStick':
      for (let i = 0; i < Math.min(1 + Math.floor(count / 2), 3); i++) {
        const spread = (i - (Math.min(1 + Math.floor(count / 2), 3) - 1) / 2) * 0.14;
        const bullet = createBullet(player.x, player.y, angle + spread, weapon, false, weaponId);
        if (bullet) {
          bullet.freezeEffect = true;
        }
      }
      break;

    default:
      createBullet(player.x, player.y, angle, weapon, false, weaponId);
      break;
  }
}

function createBullet(x, y, angle, weapon, orbit = false, weaponId = null) {
  // 检查双倍射击
  if (gameState.unlocks.doubleShot && Math.random() < (gameState.doubleShotChance || 0.25)) {
    // 创建额外子弹
    setTimeout(() => {
      createSingleBullet(x, y, angle, weapon, orbit, weaponId);
    }, 50);
  }
  
  return createSingleBullet(x, y, angle, weapon, orbit, weaponId);
}

// ==================== v1.6 双武器系统 ====================
function switchWeapon() {
  if (!CONFIG.dualWeapon.enabled) return;
  
  const dual = gameState.dualWeapon;
  const now = Date.now();
  
  // 检查冷却
  if (now - dual.lastSwitchTime < CONFIG.dualWeapon.switchCooldown) {
    return;
  }
  
  // 检查是否有副武器
  if (!dual.secondary) {
    FloatingText.add(gameState.player.x, gameState.player.y - 30, '没有副武器!', '#ff3838', 14);
    return;
  }
  
  // 切换武器
  dual.current = dual.current === 'primary' ? 'secondary' : 'primary';
  dual.lastSwitchTime = now;
  
  // 显示切换提示
  const weaponName = WEAPONS[getCurrentWeaponId()].name;
  FloatingText.add(gameState.player.x, gameState.player.y - 40, `切换: ${weaponName}`, '#2ed573', 16);
  
  // 播放切换音效
  AudioSystem.play('weapon_switch');
}

function getCurrentWeaponId() {
  const dual = gameState.dualWeapon;
  if (!CONFIG.dualWeapon.enabled || !dual.primary) {
    // 返回第一个已解锁的武器
    for (const [id, data] of Object.entries(gameState.weapons)) {
      if (data.unlocked && data.level > 0) {
        return id;
      }
    }
    return 'textbook';
  }
  return dual.current === 'primary' ? dual.primary : dual.secondary;
}

function setPrimaryWeapon(weaponId) {
  if (!gameState.weapons[weaponId]?.unlocked) return;
  
  const dual = gameState.dualWeapon;
  
  // 如果当前副武器和新主武器相同，交换
  if (dual.secondary === weaponId) {
    dual.secondary = dual.primary;
  }
  
  dual.primary = weaponId;
  dual.current = 'primary';
}

function setSecondaryWeapon(weaponId) {
  if (!gameState.weapons[weaponId]?.unlocked) return;
  
  const dual = gameState.dualWeapon;
  
  // 不能和主武器相同
  if (dual.primary === weaponId) {
    FloatingText.add(gameState.player.x, gameState.player.y - 30, '已是主武器!', '#ff3838', 14);
    return false;
  }
  
  dual.secondary = weaponId;
  FloatingText.add(gameState.player.x, gameState.player.y - 40, `副武器: ${WEAPONS[weaponId].name}`, '#2ed573', 14);
  return true;
}

// ==================== v1.6 击退系统 ====================
function applyKnockback(enemy, bullet, angle) {
  if (!CONFIG.knockback.enabled) return;
  
  // 计算击退力
  const baseForce = CONFIG.knockback.baseForce;
  const damageScaling = CONFIG.knockback.scaling;
  const knockbackForce = baseForce + (bullet.damage * damageScaling);
  
  // 应用击退
  enemy.x += Math.cos(angle) * knockbackForce;
  enemy.y += Math.sin(angle) * knockbackForce;
  
  // 添加击退状态（影响敌人AI）
  enemy.knockback = {
    vx: Math.cos(angle) * knockbackForce * 0.5,
    vy: Math.sin(angle) * knockbackForce * 0.5,
    duration: 200 // 毫秒
  };
  enemy.knockbackEndTime = Date.now() + 200;
}

function updateEnemyKnockback(enemy, deltaTime) {
  if (!enemy.knockbackEndTime || Date.now() > enemy.knockbackEndTime) {
    enemy.knockback = null;
    return;
  }
  
  // 应用击退速度
  if (enemy.knockback) {
    enemy.x += enemy.knockback.vx * deltaTime;
    enemy.y += enemy.knockback.vy * deltaTime;
    
    // 击退速度衰减
    enemy.knockback.vx *= 0.9;
    enemy.knockback.vy *= 0.9;
  }
}

function createSingleBullet(x, y, angle, weapon, orbit = false, weaponId = null) {
  // 获取武器精通加成
  const masteryBonuses = weaponId ? WeaponMastery.getBonuses(weaponId) : { damage: 1, speed: 1, pierce: 0, critChance: 0 };
  
  // 计算最终伤害（应用精通加成）
  let finalDamage = gameState.player.damage * weapon.damage * masteryBonuses.damage;
  
  // 暴击判定
  const critChance = (gameState.player.critChance || 0) + masteryBonuses.critChance;
  const isCrit = Math.random() < critChance;
  if (isCrit) {
    finalDamage *= 2;
  }
  
  const bulletStyles = {
    basketball: { color: '#e17055', size: 12 },
    broom: { color: '#00b894', size: 10 },
    ink: { color: '#6c3483', size: 9 },
    triangle: { color: '#0984e3', size: 8 },
    examPaper: { color: '#dfe6e9', size: 7 },
    lunchBox: { color: '#f39c12', size: 10 },
    waterBalloon: { color: '#74b9ff', size: 9 },
    firecracker: { color: '#ff7675', size: 11 },
    laser: { color: '#f9ca24', size: 6 },
    iceStick: { color: '#81ecec', size: 8 }
  };
  const bulletStyle = bulletStyles[weaponId] || { color: '#ffa502', size: 8 };

  const bullet = {
    x, y,
    vx: Math.cos(angle) * CONFIG.bulletSpeed * weapon.speed * masteryBonuses.speed,
    vy: Math.sin(angle) * CONFIG.bulletSpeed * weapon.speed * masteryBonuses.speed,
    damage: finalDamage,
    weapon,
    weaponId, // 记录武器ID用于精通系统
    orbit,
    orbitAngle: angle,
    pierce: (weapon.pierce || 0) + (gameState.extraPierce || 0) + masteryBonuses.pierce,
    hitEnemies: new Set(),
    life: 1,
    isCrit, // 记录是否暴击
    color: bulletStyle.color,
    size: bulletStyle.size,
    trailColor: bulletStyle.color
  };
  gameState.bullets.push(bullet);
  return bullet;
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
  
  // 播放暴走音效
  AudioSystem.playRage();
  
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
  gameState.collectedItems.push(item.id);
  
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
    case 'revive':
      gameState.hasRevive = true;
      showEffectIndicator('💎 复活币已获得!', '#00d2d3');
      break;
    case 'freeze':
      activateTimeFreeze(itemConfig.duration);
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

function activateTimeFreeze(duration) {
  showEffectIndicator('⏱️ 时间停止!', '#5f27cd');
  
  // 播放时间停止音效
  AudioSystem.playTimeFreeze();
  
  // 冻结所有敌人
  gameState.timeFrozen = true;
  gameState.timeFreezeEnd = Date.now() + duration;
  
  // 统计
  gameState.timeFreezes++;
  
  // 视觉特效
  VisualEffects.createExplosion(gameState.player.x, gameState.player.y, '#5f27cd', 30);
  
  // 屏幕震动
  ScreenShake.shake(10, duration);
}

function updateTimeFreeze() {
  if (gameState.timeFrozen && Date.now() > gameState.timeFreezeEnd) {
    gameState.timeFrozen = false;
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
  
  for (const [effect, data] of Object.entries(gameState.activeEffects)) {
    if (data.active && now > data.endTime) {
      data.active = false;
      if (effect === 'speed') data.multiplier = 1;
      if (effect === 'exp') data.multiplier = 1;
      if (effect === 'slow') data.multiplier = 1;
      if (effect === 'burn') {
        data.damage = 0;
        data.lastTick = 0;
      }
    }
  }

  if (gameState.activeEffects.burn.active && now - (gameState.activeEffects.burn.lastTick || 0) >= 1000) {
    const burnDamage = gameState.activeEffects.burn.damage || 0;
    if (burnDamage > 0 && !gameState.activeEffects.shield.active) {
      const damage = applyDefense(burnDamage);
      gameState.player.hp -= damage;
      gameState.damageTaken += damage;
      gameState.noDamageRun = false;
      FloatingText.add(gameState.player.x, gameState.player.y - 30, `-${Math.floor(damage)}`, '#ff6b6b', 14);
      if (gameState.player.hp <= 0) {
        gameOver();
      }
    }
    gameState.activeEffects.burn.lastTick = now;
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
  if (gameState.activeEffects.slow.active) {
    const remaining = Math.ceil((gameState.activeEffects.slow.endTime - now) / 1000);
    effects.push({ type: 'slow', icon: '🧊', name: '减速', time: remaining });
  }
  if (gameState.activeEffects.silence.active) {
    const remaining = Math.ceil((gameState.activeEffects.silence.endTime - now) / 1000);
    effects.push({ type: 'silence', icon: '🔇', name: '沉默', time: remaining });
  }
  if (gameState.activeEffects.burn.active) {
    const remaining = Math.ceil((gameState.activeEffects.burn.endTime - now) / 1000);
    effects.push({ type: 'burn', icon: '🔥', name: '灼烧', time: remaining });
  }
  
  const html = effects.map(e => `
    <div class="effect-badge ${e.type}">
      <span>${e.icon}</span>
      <span>${e.name}</span>
      <span style="margin-left:auto;color:#888;">${e.time}s</span>
    </div>
  `).join('');

  if (container.dataset.lastHtml !== html) {
    container.innerHTML = html;
    container.dataset.lastHtml = html;
  }
}

function showEffectIndicator(text, color) {
  let indicator = document.getElementById('effectIndicator');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'effectIndicator';
    indicator.style.cssText = `
      position: fixed;
      top: 30%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 24px;
      font-weight: bold;
      pointer-events: none;
      z-index: 1000;
      opacity: 0;
    `;
    document.body.appendChild(indicator);
  }

  indicator.style.color = color;
  indicator.style.textShadow = `0 0 20px ${color}`;
  indicator.style.animation = 'none';
  indicator.textContent = text;
  void indicator.offsetWidth;
  indicator.style.animation = 'effectPulse 2s ease-out forwards';

  if (showEffectIndicator.timer) {
    clearTimeout(showEffectIndicator.timer);
  }
  showEffectIndicator.timer = setTimeout(() => {
    indicator.style.opacity = '0';
  }, 2000);
}

function showFloatingText(x, y, text, color) {
  FloatingText.add(x, y, text, color, 16, 1000);
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
  // Boss战期间暂停普通敌人生成（但Boss可以召唤）
  if (gameState.bossFightActive && gameState.boss) {
    // 检查波次更新（用于触发Boss）
    updateWaveSystem();
    return;
  }
  
  // 计算当前难度系数（基于波次和时间）
  const gameTime = Date.now() - gameState.startTime;
  const waveBonus = (gameState.wave - 1) * 0.3;
  const timeBonus = Math.floor(gameTime / 60000) * 0.1;
  const difficultyMultiplier = 1 + waveBonus + timeBonus;
  
  // 动态生成间隔（随难度降低）
  const baseSpawnRate = Math.max(150, CONFIG.spawnInterval - gameState.player.level * 40);
  const spawnRate = baseSpawnRate / difficultyMultiplier;
  
  if (!gameState.lastSpawn || Date.now() - gameState.lastSpawn > spawnRate) {
    // 波次越高，生成敌人越多
    const enemiesToSpawn = Math.min(3, 1 + Math.floor(gameState.wave / 3));
    for (let i = 0; i < enemiesToSpawn; i++) {
      spawnEnemy(difficultyMultiplier);
    }
    gameState.lastSpawn = Date.now();
  }
  
  // 检查波次更新
  updateWaveSystem();
}

// ==================== v1.7 特殊波次系统 ====================
function updateWaveSystem() {
  const gameTime = Date.now() - gameState.startTime;
  
  if (gameTime > gameState.nextWaveTime) {
    gameState.wave++;
    gameState.nextWaveTime = gameState.wave * CONFIG.waveInterval;
    
    // 检查是否是Boss波次
    if (BOSS_SPAWN_WAVES.includes(gameState.wave)) {
      showWaveNotification(gameState.wave, true);
    } else {
      // v1.7 检查特殊波次
      const specialWaveType = checkSpecialWave(gameState.wave);
      if (specialWaveType && CONFIG.specialWaves.enabled) {
        startSpecialWave(specialWaveType);
      } else {
        // 普通波次提升提示
        showWaveNotification(gameState.wave, false);
      }
    }
    
    // v1.7 检查里程碑
    checkMilestones();
    
    // 每3波给一个奖励（Boss波次和特殊波次除外）
    if (gameState.wave % 3 === 0 && !BOSS_SPAWN_WAVES.includes(gameState.wave) && !gameState.specialWave.active) {
      spawnWaveReward();
    }
  }
}

function checkSpecialWave(wave) {
  const cfg = CONFIG.specialWaves;
  if (!cfg.enabled) return null;
  
  // 检查各类特殊波次
  if (wave % cfg.eliteWaveInterval === 0 && wave > 5) return 'elite';
  if (wave % cfg.speedWaveInterval === 0 && wave > 7) return 'speed';
  if (wave % cfg.tankWaveInterval === 0 && wave > 10) return 'tank';
  if (wave % cfg.chaosWaveInterval === 0 && wave > 13) return 'chaos';
  
  return null;
}

function startSpecialWave(type) {
  const specialWave = gameState.specialWave;
  specialWave.active = true;
  specialWave.type = type;
  specialWave.startTime = Date.now();
  specialWave.notified = false;
  
  // 显示特殊波次通知
  showSpecialWaveNotification(type);
  
  // 播放特殊音效
  AudioSystem.play('special_wave');
}

function showSpecialWaveNotification(type) {
  const configs = {
    elite: { emoji: '👑', name: '精英波次', color: '#ffd700', desc: '全是精英怪!' },
    speed: { emoji: '⚡', name: '速度波次', color: '#00d2ff', desc: '敌人速度翻倍!' },
    tank: { emoji: '🛡️', name: '坦克波次', color: '#ff6b6b', desc: '敌人血量翻倍!' },
    chaos: { emoji: '🔥', name: '混乱波次', color: '#ff3838', desc: '所有敌人类型混合!' }
  };
  
  const config = configs[type];
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 25%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 40px;
    font-weight: 900;
    color: ${config.color};
    text-shadow: 0 0 30px ${config.color}, 0 0 60px #fff;
    pointer-events: none;
    z-index: 1000;
    animation: specialWaveWarning 4s ease-out forwards;
    text-align: center;
  `;
  notification.innerHTML = `
    <div style="font-size:60px;margin-bottom:10px">${config.emoji}</div>
    <div>第 ${gameState.wave} 波 - ${config.name}!</div>
    <div style="font-size:18px;color:#fff;margin-top:10px">${config.desc}</div>
  `;
  
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 4000);
  
  // 屏幕震动
  ScreenShake.shake(8, 500);
}

function updateSpecialWave() {
  const specialWave = gameState.specialWave;
  if (!specialWave.active) return;
  
  // 特殊波次持续60秒或直到下一波
  const elapsed = Date.now() - specialWave.startTime;
  if (elapsed > 60000) {
    endSpecialWave();
  }
}

function endSpecialWave() {
  const specialWave = gameState.specialWave;
  if (!specialWave.active) return;
  
  // 显示波次结束提示
  FloatingText.add(gameState.player.x, gameState.player.y - 60, 
    '特殊波次完成!', '#2ed573', 22);
  
  // 奖励经验
  const bonusExp = 50 * gameState.wave;
  gameState.player.exp += bonusExp;
  checkLevelUp();
  
  specialWave.active = false;
  specialWave.type = null;
}

// ==================== v1.7 里程碑系统 ====================
function checkMilestones() {
  if (!CONFIG.milestones.enabled) return;
  
  const wave = gameState.wave;
  const milestones = CONFIG.milestones.waves;
  
  if (milestones.includes(wave) && !gameState.milestonesReached.includes(wave)) {
    gameState.milestonesReached.push(wave);
    grantMilestoneReward(wave);
  }
}

function grantMilestoneReward(wave) {
  const reward = CONFIG.milestones.rewards[wave];
  if (!reward) return;
  
  // 显示里程碑达成
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 30px 50px;
    border-radius: 20px;
    box-shadow: 0 0 50px rgba(102, 126, 234, 0.8);
    pointer-events: none;
    z-index: 2000;
    animation: milestonePopup 5s ease-out forwards;
    text-align: center;
  `;
  notification.innerHTML = `
    <div style="font-size:24px;color:#fff;margin-bottom:10px">🏆 里程碑达成!</div>
    <div style="font-size:48px;color:#ffd700;font-weight:900">${wave}波</div>
    <div style="font-size:20px;color:#fff;margin-top:15px">解锁: ${reward.name}</div>
  `;
  
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 5000);
  
  // 应用奖励
  if (reward.type === 'character') {
    // 解锁隐藏角色
    FloatingText.add(gameState.player.x, gameState.player.y - 80, 
      `解锁角色: ${reward.name}!`, '#ffd700', 24);
  } else if (reward.type === 'title') {
    // 授予称号
    FloatingText.add(gameState.player.x, gameState.player.y - 80, 
      `获得称号: ${reward.name}!`, '#ffd700', 24);
  }
  
  // 播放庆祝音效
  AudioSystem.play('milestone');
  ScreenShake.shake(10, 1000);
}

function showWaveNotification(wave, isBossWave) {
  const notification = document.createElement('div');
  
  if (isBossWave) {
    const bossIds = ['disciplinarian', 'principal', 'lunchLady'];
    const bossIndex = BOSS_SPAWN_WAVES.indexOf(wave);
    const bossId = bossIds[bossIndex];
    const bossConfig = BOSSES[bossId];
    
    notification.style.cssText = `
      position: fixed;
      top: 25%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 48px;
      font-weight: 900;
      color: ${bossConfig.color};
      text-shadow: 0 0 40px ${bossConfig.color}, 0 0 80px #ff3838;
      pointer-events: none;
      z-index: 1000;
      animation: bossWarning 3s ease-out forwards;
      text-align: center;
    `;
    notification.innerHTML = `
      <div style="font-size:72px;margin-bottom:10px">${bossConfig.emoji}</div>
      <div>第 ${wave} 波 - BOSS战!</div>
      <div style="font-size:22px;color:#fff;margin-top:10px">${bossConfig.name}即将登场</div>
      <div style="font-size:16px;color:#aaa">${bossConfig.title}</div>
    `;
    ScreenShake.shake(10, 500);
  } else {
    notification.style.cssText = `
      position: fixed;
      top: 25%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 42px;
      font-weight: 900;
      color: #ffa502;
      text-shadow: 0 0 30px #ffa502, 0 0 60px #ff4757;
      pointer-events: none;
      z-index: 1000;
      animation: wavePulse 2s ease-out forwards;
      text-align: center;
    `;
    notification.innerHTML = `第 ${wave} 波<br><span style="font-size:18px">敌人变得更强大了!</span>`;
  }
  
  document.body.appendChild(notification);
  
  setTimeout(() => notification.remove(), isBossWave ? 4000 : 2500);
}

function spawnWaveReward() {
  // 在玩家附近生成奖励道具
  const angle = Math.random() * Math.PI * 2;
  const distance = 200;
  const x = gameState.player.x + Math.cos(angle) * distance;
  const y = gameState.player.y + Math.sin(angle) * distance;
  
  // 随机选择奖励类型
  const rewards = ['healthPackLarge', 'magnet', 'expBoost', 'bomb'];
  const reward = rewards[Math.floor(Math.random() * rewards.length)];
  spawnItem(x, y, reward);
  
  // 显示奖励提示
  showFloatingText(x, y, '波次奖励!', '#ffd93d');
}

// v1.7 修改：支持特殊波次的敌人生成
function spawnEnemy(difficultyMultiplier = 1) {
  if (gameState.enemies.length >= CONFIG.maxEnemies) return;
  
  const player = gameState.player;
  const angle = Math.random() * Math.PI * 2;
  const distance = 400 + Math.random() * 200;
  
  // 根据等级和波次选择敌人类型
  let type = 'minion';
  const rand = Math.random();
  const level = player.level;
  const wave = gameState.wave;
  
  // v1.7 特殊波次处理
  const specialWave = gameState.specialWave;
  let isElite = Math.random() < CONFIG.eliteChance * difficultyMultiplier;
  let eliteMultiplier = isElite ? 2 : 1;
  let speedMultiplier = 1;
  let hpMultiplier = 1;
  
  if (specialWave.active) {
    switch (specialWave.type) {
      case 'elite':
        // 精英波：全是精英怪
        isElite = true;
        eliteMultiplier = 2.5;
        break;
      case 'speed':
        // 速度波：速度翻倍
        speedMultiplier = 2;
        // 优先生成速度型敌人
        if (rand < 0.6) type = 'runner';
        break;
      case 'tank':
        // 坦克波：血量翻倍
        hpMultiplier = 2;
        // 优先生成坦克型敌人
        if (rand < 0.5) type = 'tank';
        break;
      case 'chaos':
        // 混乱波：随机混合所有类型
        const types = ['minion', 'runner', 'tank', 'bomber', 'healer', 'teleporter'];
        type = types[Math.floor(Math.random() * types.length)];
        // 小幅增强
        speedMultiplier = 1.3;
        hpMultiplier = 1.3;
        break;
    }
  }
  
  // 基础类型选择（非混乱波）
  if (specialWave.type !== 'chaos') {
    if (level > 3 && rand < 0.25) type = 'runner';
    if (level > 7 && rand < 0.15) type = 'tank';
    
    // 高级敌人类型（需要更高等级和波次）
    if (wave >= 2 && level > 5 && rand < 0.08) type = 'bomber';
    if (wave >= 3 && level > 8 && rand < 0.06) type = 'healer';
    if (wave >= 4 && level > 10 && rand < 0.05) type = 'teleporter';
  }
  
  const enemyType = ENEMY_TYPES[type];
  
  const enemy = {
    x: player.x + Math.cos(angle) * distance,
    y: player.y + Math.sin(angle) * distance,
    type,
    hp: enemyType.hp * (1 + level * CONFIG.difficultyScaling) * difficultyMultiplier * eliteMultiplier * hpMultiplier,
    maxHp: enemyType.hp * (1 + level * CONFIG.difficultyScaling) * difficultyMultiplier * eliteMultiplier * hpMultiplier,
    damage: enemyType.damage * difficultyMultiplier * (isElite ? 1.5 : 1),
    speed: enemyType.speed * CONFIG.enemyBaseSpeed * (isElite ? 1.2 : 1) * speedMultiplier,
    exp: Math.floor(enemyType.exp * difficultyMultiplier * (isElite ? 2 : 1) * (specialWave.active ? 1.5 : 1)),
    size: enemyType.size * (isElite ? 1.3 : 1),
    isElite,
    color: enemyType.color,
    // 特殊敌人类型属性
    explodeOnDeath: enemyType.explodeOnDeath || false,
    healNearby: enemyType.healNearby || false,
    canTeleport: enemyType.canTeleport || false,
    lastTeleport: 0,
    lastHeal: 0
  };
  
  // 精英怪视觉效果
  if (isElite) {
    enemy.glowColor = '#ffd700';
    enemy.name = '精英' + enemyType.name;
  }
  
  // 特殊波次视觉标记
  if (specialWave.active) {
    enemy.specialWave = true;
    enemy.glowColor = getSpecialWaveColor(specialWave.type);
  }
  
  gameState.enemies.push(enemy);
}

function getSpecialWaveColor(type) {
  const colors = {
    elite: '#ffd700',
    speed: '#00d2ff',
    tank: '#ff6b6b',
    chaos: '#ff3838'
  };
  return colors[type] || '#fff';
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

// ==================== v1.7 可破坏物体系统 ====================
const DESTRUCTIBLE_TYPES = {
  desk: {
    name: '课桌',
    emoji: '🪑',
    hp: 50,
    exp: 15,
    size: 40,
    color: '#8b4513'
  },
  trash: {
    name: '垃圾桶',
    emoji: '🗑️',
    hp: 30,
    exp: 10,
    size: 35,
    color: '#2ecc71'
  },
  hoop: {
    name: '篮球架',
    emoji: '🏀',
    hp: 80,
    exp: 25,
    size: 50,
    color: '#e67e22'
  },
  locker: {
    name: '储物柜',
    emoji: '🚪',
    hp: 60,
    exp: 20,
    size: 45,
    color: '#3498db'
  }
};

function spawnDestructible() {
  if (!CONFIG.destructibles.enabled) return;
  if (Math.random() > CONFIG.destructibles.spawnRate) return;
  
  const player = gameState.player;
  const angle = Math.random() * Math.PI * 2;
  const distance = 300 + Math.random() * 400;
  
  const types = CONFIG.destructibles.types;
  const type = types[Math.floor(Math.random() * types.length)];
  const config = DESTRUCTIBLE_TYPES[type];
  
  gameState.destructibles.push({
    x: player.x + Math.cos(angle) * distance,
    y: player.y + Math.sin(angle) * distance,
    type,
    hp: config.hp,
    maxHp: config.hp,
    exp: config.exp,
    size: config.size,
    emoji: config.emoji,
    color: config.color,
    destroyed: false
  });
}

function updateDestructibles(deltaTime) {
  // 生成新的可破坏物体
  if (gameState.destructibles.length < 10 && Math.random() < 0.01) {
    spawnDestructible();
  }
  
  // 移除已销毁的物体
  gameState.destructibles = gameState.destructibles.filter(d => !d.destroyed);
}

function damageDestructible(destructible, damage) {
  destructible.hp -= damage;
  
  // 受击特效
  VisualEffects.createExplosion(destructible.x, destructible.y, destructible.color, 5);
  
  if (destructible.hp <= 0) {
    destroyDestructible(destructible);
  }
}

function destroyDestructible(destructible) {
  destructible.destroyed = true;
  
  const config = DESTRUCTIBLE_TYPES[destructible.type];
  
  // 爆炸特效
  VisualEffects.createExplosion(destructible.x, destructible.y, destructible.color, 15);
  ScreenShake.shake(3, 150);
  
  // 掉落经验
  gameState.expOrbs.push({
    x: destructible.x,
    y: destructible.y,
    exp: config.exp,
    vx: (Math.random() - 0.5) * 3,
    vy: (Math.random() - 0.5) * 3
  });
  
  // 随机掉落道具（30%概率）
  if (Math.random() < 0.3) {
    const items = ['healthPack', 'magnet', 'shield'];
    const item = items[Math.floor(Math.random() * items.length)];
    spawnItem(destructible.x, destructible.y, item);
  }
  
  // 飘字
  FloatingText.add(destructible.x, destructible.y - 20, `+${config.exp} XP`, '#2ed573', 14);
  FloatingText.add(destructible.x, destructible.y - 40, '破坏!', '#ffa502', 16);
  
  // 音效
  AudioSystem.play('destructible_break');
}

// ==================== Boss系统 ====================

// 检查是否应该生成Boss（基于波次）
function checkBossSpawn() {
  const currentWave = gameState.wave;
  
  // 检查是否是Boss波次
  if (!BOSS_SPAWN_WAVES.includes(currentWave)) return;
  
  // 检查该Boss是否已经被击败过（防止重复生成）
  const bossIndex = BOSS_SPAWN_WAVES.indexOf(currentWave);
  const bossIds = ['disciplinarian', 'principal', 'lunchLady'];
  const bossId = bossIds[bossIndex];
  
  if (gameState.bossDefeated.includes(bossId)) return;
  
  // 生成Boss
  spawnBoss(bossId);
}

function spawnBoss(bossId) {
  const bossConfig = BOSSES[bossId];
  if (!bossConfig) return;
  
  const player = gameState.player;
  const angle = Math.random() * Math.PI * 2;
  const distance = 500;
  
  // 根据波次增加Boss血量
  const waveMultiplier = 1 + (gameState.wave / 10) * 0.3;
  
  gameState.boss = {
    id: bossId,
    x: player.x + Math.cos(angle) * distance,
    y: player.y + Math.sin(angle) * distance,
    hp: bossConfig.baseHp * waveMultiplier,
    maxHp: bossConfig.baseHp * waveMultiplier,
    damage: bossConfig.damage,
    speed: bossConfig.speed,
    size: bossConfig.size,
    emoji: bossConfig.emoji,
    name: bossConfig.name,
    title: bossConfig.title,
    color: bossConfig.color,
    phase: 0,
    phaseData: bossConfig.phases[0],
    vx: 0,
    vy: 0,
    skills: JSON.parse(JSON.stringify(bossConfig.skills)), // 深拷贝技能
    lastSkillUse: {}
  };
  
  // 初始化技能冷却
  bossConfig.skills.forEach((skill, index) => {
    gameState.boss.lastSkillUse[index] = Date.now();
  });
  
  // 暂停普通敌人生成
  gameState.bossFightActive = true;
  
  // 播放Boss战BGM
  BGM.playBoss();
  
  // 显示Boss出现警告
  showBossWarning(bossConfig);
  
  // 更新Boss血条UI
  updateBossHealthBar();
}

function updateBoss(deltaTime) {
  if (!gameState.boss) {
    // 检查是否需要生成Boss
    checkBossSpawn();
    return;
  }
  
  const boss = gameState.boss;
  const player = gameState.player;
  const now = Date.now();
  const bossConfig = BOSSES[boss.id];
  
  // 计算当前阶段
  const hpPercent = boss.hp / boss.maxHp;
  let currentPhaseIndex = 0;
  for (let i = 0; i < bossConfig.phases.length; i++) {
    if (hpPercent <= bossConfig.phases[i].hpPercent) {
      currentPhaseIndex = i;
    }
  }
  
  // 阶段切换检测
  if (currentPhaseIndex !== boss.phase) {
    boss.phase = currentPhaseIndex;
    boss.phaseData = bossConfig.phases[currentPhaseIndex];
    showBossPhaseChange(boss);
  }
  
  const currentPhase = bossConfig.phases[currentPhaseIndex];
  
  // Boss移动 - 始终朝向玩家，但保持一定距离
  const distToPlayer = Math.hypot(player.x - boss.x, player.y - boss.y);
  const angle = Math.atan2(player.y - boss.y, player.x - boss.x);
  
  // 如果距离太近，后退；如果太远，靠近
  let moveSpeed = boss.speed * currentPhase.multiplier;
  if (distToPlayer < 100) {
    boss.vx = -Math.cos(angle) * moveSpeed;
    boss.vy = -Math.sin(angle) * moveSpeed;
  } else if (distToPlayer > 200) {
    boss.vx = Math.cos(angle) * moveSpeed;
    boss.vy = Math.sin(angle) * moveSpeed;
  } else {
    // 保持距离，横向移动
    boss.vx = Math.cos(angle + Math.PI/2) * moveSpeed * 0.5;
    boss.vy = Math.sin(angle + Math.PI/2) * moveSpeed * 0.5;
  }
  
  boss.x += boss.vx;
  boss.y += boss.vy;
  
  // Boss技能释放
  bossConfig.skills.forEach((skill, index) => {
    const lastUsed = boss.lastSkillUse[index] || 0;
    const cooldown = skill.cooldown / currentPhase.multiplier;
    
    if (now - lastUsed > cooldown) {
      skill.execute(boss, player);
      boss.lastSkillUse[index] = now;
    }
  });
  
  // 碰撞检测 - Boss攻击玩家
  if (distToPlayer < 40 + boss.size) {
    if (!gameState.activeEffects.shield.active) {
      let damage = boss.damage * currentPhase.multiplier;
      damage = applyDefense(damage);
      player.hp -= damage;
      gameState.damageTaken += damage;
      gameState.noDamageRun = false;
      
      // 显示伤害数字
      FloatingText.add(player.x, player.y - 30, `-${Math.floor(damage)}`, '#ff3838', 18);
    }
    
    // 击退
    boss.x -= Math.cos(angle) * 20;
    boss.y -= Math.sin(angle) * 20;
  }
  
  // 更新Boss血条
  updateBossHealthBar();
  
  // 更新危险区域
  updateHazardZones();
  
  // 更新敌人子弹（包括追踪弹）
  updateEnemyBullets(deltaTime);
}

function showBossWarning(bossConfig) {
  // 播放Boss警告音效
  AudioSystem.playBossWarning();
  
  const warning = document.createElement('div');
  warning.className = 'boss-warning';
  warning.style.cssText = `
    position: fixed;
    top: 30%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 42px;
    font-weight: 900;
    color: ${bossConfig.color};
    text-shadow: 0 0 40px ${bossConfig.color}, 0 0 80px ${bossConfig.color};
    pointer-events: none;
    z-index: 1000;
    text-align: center;
    animation: bossWarning 4s ease-out forwards;
  `;
  warning.innerHTML = `
    <div style="font-size:60px;margin-bottom:10px">${bossConfig.emoji}</div>
    <div>⚠️ ${bossConfig.name}来了! ⚠️</div>
    <div style="font-size:20px;color:#fff;margin-top:10px">${bossConfig.title}</div>
    <div style="font-size:16px;color:#aaa;margin-top:5px">准备战斗!</div>
  `;
  document.body.appendChild(warning);
  
  // 屏幕震动
  ScreenShake.shake(20, 1000);
  
  setTimeout(() => warning.remove(), 4000);
}

function showBossPhaseChange(boss) {
  const phaseNames = ['第一阶段', '第二阶段', '狂暴阶段', '绝望阶段'];
  const phaseName = phaseNames[boss.phase] || '未知阶段';
  
  const effect = document.createElement('div');
  effect.style.cssText = `
    position: fixed;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 32px;
    font-weight: 900;
    color: ${boss.color};
    text-shadow: 0 0 30px ${boss.color};
    pointer-events: none;
    z-index: 999;
    animation: phaseChange 2s ease-out forwards;
  `;
  effect.textContent = `${phaseName}`;
  document.body.appendChild(effect);
  
  ScreenShake.shake(10, 500);
  
  setTimeout(() => effect.remove(), 2000);
}

function showBossSkillEffect(x, y, text, color = '#ff6b6b') {
  FloatingText.add(x, y, text, color, 20, 1500);
}

function updateBossHealthBar() {
  const boss = gameState.boss;
  if (!boss) {
    const existingBar = document.getElementById('bossHealthBar');
    if (existingBar) existingBar.remove();
    updateBossHealthBar.lastRender = '';
    updateBossHealthBar.lastUpdate = 0;
    return;
  }

  const now = Date.now();
  if (updateBossHealthBar.lastUpdate && now - updateBossHealthBar.lastUpdate < 100) {
    return;
  }
  
  let healthBar = document.getElementById('bossHealthBar');
  if (!healthBar) {
    healthBar = document.createElement('div');
    healthBar.id = 'bossHealthBar';
    healthBar.style.cssText = `
      position: fixed;
      top: 80px;
      left: 50%;
      transform: translateX(-50%);
      width: 500px;
      background: rgba(0,0,0,0.8);
      border: 2px solid ${boss.color};
      border-radius: 10px;
      padding: 10px 15px;
      z-index: 200;
      box-shadow: 0 0 20px ${boss.color};
    `;
    document.body.appendChild(healthBar);
  }
  
  const hpPercent = (boss.hp / boss.maxHp * 100).toFixed(1);
  const phaseNames = ['一', '二', '三', '四'];
  const phaseName = phaseNames[boss.phase] || '?';
  
  healthBar.style.borderColor = boss.color;
  healthBar.style.boxShadow = `0 0 20px ${boss.color}`;
  
  const markup = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px">
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:28px">${boss.emoji}</span>
        <div>
          <div style="font-weight:bold;color:${boss.color};font-size:16px">${boss.name}</div>
          <div style="font-size:12px;color:#aaa">${boss.title} · 第${phaseName}阶段</div>
        </div>
      </div>
      <div style="font-size:14px;color:#fff;font-weight:bold">${Math.floor(boss.hp)}/${boss.maxHp}</div>
    </div>
    <div style="width:100%;height:12px;background:rgba(0,0,0,0.5);border-radius:6px;overflow:hidden">
      <div style="width:${hpPercent}%;height:100%;background:linear-gradient(90deg,${boss.color},#ff6b6b);transition:width 0.3s;box-shadow:0 0 10px ${boss.color}"></div>
    </div>
  `;

  if (markup !== updateBossHealthBar.lastRender) {
    healthBar.innerHTML = markup;
    updateBossHealthBar.lastRender = markup;
  }
  updateBossHealthBar.lastUpdate = now;
}

function updateHazardZones() {
  if (!gameState.hazardZones) return;
  
  const now = Date.now();
  gameState.hazardZones = gameState.hazardZones.filter(zone => {
    // 检查玩家是否在危险区域内
    const dist = Math.hypot(gameState.player.x - zone.x, gameState.player.y - zone.y);
    if (dist < zone.radius && !gameState.activeEffects.shield.active) {
      // 每秒造成伤害
      if (Math.random() < 0.05) { // 约每秒3次伤害
        gameState.player.hp -= zone.damage;
        gameState.damageTaken += zone.damage;
        gameState.noDamageRun = false;
        FloatingText.add(gameState.player.x, gameState.player.y - 30, `-${zone.damage}`, zone.color, 16);
      }
    }
    
    return zone.endTime > now;
  });
}

function updateEnemyBullets(deltaTime) {
  gameState.bullets = gameState.bullets.filter(bullet => {
    if (!bullet.isEnemyBullet) return true;
    
    // 追踪弹逻辑
    if (bullet.homing && bullet.target && !bullet.target.dead) {
      const angleToTarget = Math.atan2(bullet.target.y - bullet.y, bullet.target.x - bullet.x);
      bullet.vx += Math.cos(angleToTarget) * bullet.homingStrength;
      bullet.vy += Math.sin(angleToTarget) * bullet.homingStrength;
      
      // 限制最大速度
      const speed = Math.hypot(bullet.vx, bullet.vy);
      if (speed > 5) {
        bullet.vx = (bullet.vx / speed) * 5;
        bullet.vy = (bullet.vy / speed) * 5;
      }
    }
    
    bullet.x += bullet.vx;
    bullet.y += bullet.vy;
    bullet.life -= deltaTime;
    
    // 检测与玩家碰撞
    const dist = Math.hypot(gameState.player.x - bullet.x, gameState.player.y - bullet.y);
    if (dist < 25 + (bullet.size || 10) && !gameState.activeEffects.shield.active) {
      let damage = bullet.damage;
      
      // 特殊效果
      if (bullet.effect === 'burn') {
        gameState.activeEffects.burn = { active: true, endTime: Date.now() + 3000, damage: 5 };
      } else if (bullet.effect === 'freeze') {
        gameState.activeEffects.slow = { active: true, endTime: Date.now() + 2000, multiplier: 0.3 };
      } else if (bullet.effect === 'slow') {
        gameState.activeEffects.slow = { active: true, endTime: Date.now() + 4000, multiplier: 0.5 };
      }
      
      damage = applyDefense(damage);
      gameState.player.hp -= damage;
      gameState.damageTaken += damage;
      gameState.noDamageRun = false;
      
      FloatingText.add(gameState.player.x, gameState.player.y - 30, `-${Math.floor(damage)}`, '#ff3838', 16);
      
      return false;
    }
    
    return bullet.life > 0;
  });
}

function killBoss() {
  const boss = gameState.boss;
  if (!boss) return;
  
  const bossConfig = BOSSES[boss.id];
  
  // 播放Boss死亡音效
  AudioSystem.playBossDeath();
  
  // 记录击败
  gameState.bossDefeated.push(boss.id);
  gameState.bossKilled++;
  
  // 大量经验
  for (let i = 0; i < 30; i++) {
    gameState.expOrbs.push({
      x: boss.x + (Math.random() - 0.5) * 150,
      y: boss.y + (Math.random() - 0.5) * 150,
      exp: Math.floor(bossConfig.exp / 30),
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6
    });
  }
  
  // Boss奖励 - 解锁武器或强化
  const rewards = BOSS_REWARDS[boss.id];
  if (rewards) {
    rewards.forEach((reward, index) => {
      setTimeout(() => {
        if (WEAPONS[reward]) {
          // 解锁武器
          if (!gameState.weapons[reward].unlocked) {
            gameState.weapons[reward].unlocked = true;
            gameState.weapons[reward].level = 1;
            showRewardEffect(boss.x, boss.y, `解锁: ${WEAPONS[reward].name}`, WEAPONS[reward].emoji);
          }
        } else {
          // 属性强化
          applyBossReward(reward);
          const rewardNames = { damage: '攻击力+20%', attackSpeed: '攻速+15%', speed: '移速+10%', hp: '生命+50', crit: '暴击+10%', defense: '防御+10%' };
          showRewardEffect(boss.x, boss.y, rewardNames[reward] || reward, '✨');
        }
      }, index * 500);
    });
  }
  
  // 必定掉落高级道具
  const rareItems = ['healthPackLarge', 'shield', 'bomb', 'revive', 'timeFreeze'];
  rareItems.forEach((itemId, index) => {
    setTimeout(() => {
      spawnItemAt(boss.x + (Math.random() - 0.5) * 100, boss.y + (Math.random() - 0.5) * 100, itemId);
    }, index * 300);
  });
  
  // 爆炸特效
  VisualEffects.createExplosion(boss.x, boss.y, boss.color, 50);
  ScreenShake.shake(25, 1500);
  
  // 显示击败信息
  showBossDefeatMessage(boss);
  
  // 清除Boss
  gameState.boss = null;
  gameState.bossFightActive = false;
  
  // 切换回战斗BGM
  BGM.playBattle();
  
  // 移除血条
  const healthBar = document.getElementById('bossHealthBar');
  if (healthBar) healthBar.remove();
}

function showRewardEffect(x, y, text, emoji) {
  FloatingText.add(x, y - 20, `${emoji} ${text}`, '#ffd700', 18, 2000);
}

function applyBossReward(reward) {
  switch(reward) {
    case 'damage':
      gameState.player.damage *= 1.2;
      break;
    case 'attackSpeed':
      gameState.player.attackSpeed *= 1.15;
      break;
    case 'speed':
      gameState.player.speed *= 1.1;
      break;
    case 'hp':
      gameState.player.maxHp += 50;
      gameState.player.hp += 50;
      break;
    case 'crit':
      if (!gameState.unlocks.crit) {
        gameState.unlocks.crit = true;
      } else {
        gameState.player.critChance = (gameState.player.critChance || 0) + 0.1;
      }
      break;
    case 'defense':
      if (!gameState.unlocks.defense) {
        gameState.unlocks.defense = true;
      }
      break;
  }
}

function showBossDefeatMessage(boss) {
  const messages = {
    disciplinarian: '教导主任被击败了！学校纪律暂时松懈...',
    principal: '校长倒下了！学校陷入混乱！',
    lunchLady: '食堂大妈被打败了！今天的午餐安全了！'
  };
  
  const message = document.createElement('div');
  message.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0,0,0,0.9);
    border: 3px solid ${boss.color};
    border-radius: 15px;
    padding: 30px 50px;
    text-align: center;
    z-index: 1000;
    animation: victoryPopup 0.5s ease-out;
  `;
  message.innerHTML = `
    <div style="font-size:60px;margin-bottom:15px">${boss.emoji}</div>
    <div style="font-size:28px;font-weight:bold;color:${boss.color};margin-bottom:10px">${boss.name}被击败!</div>
    <div style="font-size:16px;color:#fff">${messages[boss.id] || 'Boss被击败!'}</div>
  `;
  document.body.appendChild(message);
  
  setTimeout(() => {
    message.style.animation = 'fadeOut 0.5s ease forwards';
    setTimeout(() => message.remove(), 500);
  }, 3000);
}

// 在指定位置生成道具
function spawnItemAt(x, y, itemId) {
  const item = ITEMS[itemId];
  if (!item) return;
  
  gameState.items.push({
    x: x,
    y: y,
    id: itemId,
    emoji: item.emoji,
    color: item.color,
    life: 15000,
    createdAt: Date.now(),
    pulse: 0
  });
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

function checkLevelUp() {
  const player = gameState.player;
  let leveledUp = false;

  while (player.exp >= player.expToNext) {
    player.exp -= player.expToNext;
    player.level++;
    player.expToNext = Math.floor(player.expToNext * 1.2);
    player.hp = Math.min(player.maxHp, player.hp + 20);

    VisualEffects.createLevelUpEffect(player.x, player.y);
    FloatingText.add(player.x, player.y - 50, 'LEVEL UP!', '#2ed573', 24);
    leveledUp = true;
  }

  if (leveledUp) {
    showUpgradeModal();
  }
}

function updateEnemies(deltaTime) {
  const player = gameState.player;
  const now = Date.now();
  
  // v1.7 性能优化：限制敌人数量
  const maxEnemies = CONFIG.maxEnemies || 100;
  if (gameState.enemies.length > maxEnemies) {
    // 按距离玩家远近排序，优先移除远处的敌人
    gameState.enemies.sort((a, b) => {
      const distA = Math.hypot(player.x - a.x, player.y - a.y);
      const distB = Math.hypot(player.x - b.x, player.y - b.y);
      return distB - distA; // 远的在前
    });
    // 移除超出限制的远处敌人
    const removed = gameState.enemies.splice(maxEnemies);
    removed.forEach(enemy => {
      // 给玩家一些经验补偿
      gameState.player.exp += Math.floor(enemy.exp * 0.5);
    });
  }
  
  gameState.enemies = gameState.enemies.filter(enemy => {
    if (enemy.dotActive && now > enemy.dotEndTime) {
      enemy.dotActive = false;
      enemy.dotDamage = 0;
    }

    if (enemy.blinded && now > enemy.blindEndTime) {
      enemy.blinded = false;
    }

    if (enemy.dotActive && now > (enemy.lastDotTick || 0) + 500) {
      enemy.hp -= enemy.dotDamage || 0;
      enemy.lastDotTick = now;
      if (enemy.dotDamage) {
        FloatingText.add(enemy.x, enemy.y - 25, `-${enemy.dotDamage}`, '#8e44ad', 12);
      }
    }

    // 击退优先于追击，让控场武器能真正把怪群推出去
    if (enemy.knockback) {
      updateEnemyKnockback(enemy, deltaTime);
      if (enemy.knockback) {
        return enemy.hp > 0;
      }
    }

    // 检查眩晕状态
    if (enemy.stunned) {
      if (now > enemy.stunEndTime) {
        enemy.stunned = false;
      } else {
        // 眩晕时不移动，显示眩晕效果（降低频率）
        if (now % 500 < 50) { // 每500ms显示一次
          FloatingText.add(enemy.x, enemy.y - enemy.size - 15, '💫', '#ffa502', 16);
        }
        // 眩晕时跳过移动逻辑
        return enemy.hp > 0;
      }
    }
    
    // 检查减速状态恢复
    if (enemy.slowed && now > enemy.slowEndTime) {
      enemy.slowed = false;
      if (enemy.originalSpeed) {
        enemy.speed = enemy.originalSpeed;
      }
    }
    
    // 特殊敌人：瞬移怪
    if (enemy.canTeleport && now - enemy.lastTeleport > 4000) {
      const distToPlayer = Math.hypot(player.x - enemy.x, player.y - enemy.y);
      if (distToPlayer < 150) {
        // 瞬移到玩家另一侧
        const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        enemy.x = player.x - Math.cos(angle) * 200;
        enemy.y = player.y - Math.sin(angle) * 200;
        enemy.lastTeleport = now;
        
        // 瞬移特效
        VisualEffects.createExplosion(enemy.x, enemy.y, '#a29bfe', 8);
      }
    }
    
    // 特殊敌人：奶妈治疗
    if (enemy.healNearby && now - enemy.lastHeal > 2000) {
      gameState.enemies.forEach(other => {
        if (other !== enemy && other.hp < other.maxHp) {
          const dist = Math.hypot(other.x - enemy.x, other.y - enemy.y);
          if (dist < 150) {
            other.hp = Math.min(other.maxHp, other.hp + 15);
            // 治疗特效
            VisualEffects.createExplosion(other.x, other.y - 20, '#2ed573', 5);
          }
        }
      });
      enemy.lastHeal = now;
    }
    
    // 向玩家移动
    let angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
    let moveSpeed = enemy.speed;
    if (enemy.blinded) {
      angle += Math.sin((now + enemy.x + enemy.y) / 120) * 0.9;
      moveSpeed *= 0.72;
      if (now % 700 < 50) {
        FloatingText.add(enemy.x, enemy.y - enemy.size - 12, '📄', '#ecf0f1', 14);
      }
    }

    enemy.x += Math.cos(angle) * moveSpeed;
    enemy.y += Math.sin(angle) * moveSpeed;
    
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
        let damage = enemy.damage * (player.rageActive ? 0.5 : 1);
        damage = applyDefense(damage);
        player.hp -= damage;
        gameState.damageTaken += damage;
        gameState.noDamageRun = false;
        
        // 屏幕震动
        ScreenShake.shake(5, 200);
        
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

function killEnemy(enemy, weaponId) {
  const enemyType = ENEMY_TYPES[enemy.type] || {
    name: '特殊敌人',
    emoji: enemy.emoji || '❓',
    color: enemy.color || '#ffa502'
  };
  
  // 武器经验获取（击杀）
  if (weaponId) {
    WeaponMastery.addExp(weaponId, WeaponMastery.expPerKill * (enemy.isElite ? 3 : 1));
    WeaponMastery.addKill(weaponId);
  }
  
  // 播放击杀音效
  AudioSystem.playKill();
  
  // 炸弹人爆炸效果
  if (enemy.explodeOnDeath) {
    VisualEffects.createExplosion(enemy.x, enemy.y, '#ffa502', 25);
    ScreenShake.shake(8, 300);
    AudioSystem.playExplosion();
    
    // 对范围内所有敌人造成伤害
    gameState.enemies.forEach(other => {
      if (other !== enemy) {
        const dist = Math.hypot(other.x - enemy.x, other.y - enemy.y);
        if (dist < 120) {
          other.hp -= 50;
          if (other.hp <= 0) {
            killEnemy(other);
          }
        }
      }
    });
    
    // 对玩家造成伤害
    const distToPlayer = Math.hypot(gameState.player.x - enemy.x, gameState.player.y - enemy.y);
    if (distToPlayer < 120 && !gameState.activeEffects.shield.active) {
      gameState.player.hp -= 20;
      gameState.damageTaken += 20;
      gameState.noDamageRun = false;
      FloatingText.add(gameState.player.x, gameState.player.y - 30, '-20', '#ff3838', 16);
    }
  }
  
  // 掉落经验 (应用经验加成)
  const expMultiplier = gameState.activeEffects.exp.active ? gameState.activeEffects.exp.multiplier : 1;
  gameState.expOrbs.push({
    x: enemy.x,
    y: enemy.y,
    exp: Math.floor(enemy.exp * expMultiplier),
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2
  });
  
  // 道具掉落（精英怪必掉）
  const itemLuck = gameState.unlocks.itemLuck ? 1.5 : 1;
  const rand = Math.random();
  let cumulativeRate = 0;
  let dropped = false;
  
  if (enemy.isElite || rand < 0.3 * itemLuck) {
    for (const [itemId, item] of Object.entries(ITEMS)) {
      cumulativeRate += item.spawnRate * itemLuck;
      if (rand < cumulativeRate) {
        spawnItem(enemy.x, enemy.y, itemId);
        dropped = true;
        break;
      }
    }
  }
  
  // 吸血效果
  if (gameState.unlocks.healOnKill) {
    healPlayer(enemy.isElite ? 10 : 5);
  }
  
  // 增加怒气（精英怪给更多）
  addRage(enemy.isElite ? 15 : 5);

  if (typeof enemy.onDeath === 'function') {
    enemy.onDeath();
  }
  
  // 暴走击杀统计
  if (gameState.player.rageActive) {
    gameState.rageKills++;
  }
  
  // 创建死亡动画
  DeathAnimation.create(
    enemy.x, 
    enemy.y, 
    enemyType.emoji, 
    enemy.color || '#ffa502', 
    enemy.size,
    enemy.isElite
  );
  
  // 增强版击杀特效
  const explosionColor = enemy.isElite ? '#ffd700' : (enemy.color || '#ffa502');
  VisualEffects.createExplosion(enemy.x, enemy.y, explosionColor, enemy.isElite ? 20 : 12);
  
  // 飘字显示经验
  FloatingText.add(enemy.x, enemy.y - 20, `+${enemy.exp} XP`, '#2ed573', 14);
  
  // 精英怪击杀提示
  if (enemy.isElite) {
    FloatingText.add(enemy.x, enemy.y - 50, '精英击杀!', '#ffd700', 20);
    ScreenShake.shake(3, 150);
    gameState.eliteKills++;
  }
  
  // 炸弹人击杀统计
  if (enemy.type === 'bomber') {
    gameState.bomberKills++;
  }
  
  // 暴击飘字（性能优化：只在非精英怪时显示，避免与精英击杀飘字重叠）
  if (gameState.player.rageActive && !enemy.isElite) {
    FloatingText.add(enemy.x, enemy.y - 40, '暴击!', '#ff3838', 18);
  }
  
  gameState.kills++;
}

function explodePlayerBullet(bullet, x, y, primaryTarget = null) {
  const radius = bullet.explosionRadius || (bullet.weaponId === 'firecracker' ? 90 : (bullet.weaponId === 'basketball' ? 110 : 70));
  const splashDamage = bullet.damage * (bullet.explosionDamageScale || (bullet.weaponId === 'firecracker' ? 0.8 : (bullet.weaponId === 'basketball' ? 0.95 : 0.6)));
  const shockwaveForce = bullet.knockbackBoost || (bullet.weaponId === 'basketball' ? 45 : 0);

  VisualEffects.createExplosion(x, y, bullet.color || '#ffa502', bullet.weaponId === 'firecracker' ? 18 : (bullet.weaponId === 'basketball' ? 24 : 12));
  if (bullet.weaponId === 'basketball') {
    ScreenShake.shake(8, 180);
    VisualEffects.createCritEffect(x, y);
  }

  gameState.enemies.forEach(enemy => {
    if (enemy === primaryTarget) return;

    const dist = Math.hypot(enemy.x - x, enemy.y - y);
    if (dist > radius) return;

    enemy.hp -= splashDamage;
    if (shockwaveForce > 0) {
      const angle = Math.atan2(enemy.y - y, enemy.x - x);
      applyKnockback(enemy, { damage: splashDamage + shockwaveForce }, angle);
    }
    if (enemy.hp <= 0) {
      killEnemy(enemy, bullet.weaponId);
    }
  });

  if (gameState.boss) {
    const distToBoss = Math.hypot(gameState.boss.x - x, gameState.boss.y - y);
    if (distToBoss <= radius) {
      gameState.boss.hp -= splashDamage * 0.5;
      if (gameState.boss.hp <= 0) {
        killBoss();
      }
    }
  }
}

function spawnPlayerZone(type, x, y, options = {}) {
  const zone = {
    type,
    x,
    y,
    radius: options.radius || 80,
    damage: options.damage || 0,
    slowMultiplier: options.slowMultiplier || 1,
    color: options.color || '#8e44ad',
    emoji: options.emoji || '',
    createdAt: Date.now(),
    endTime: Date.now() + (options.duration || 2500),
    lastTick: 0,
    sourceWeaponId: options.sourceWeaponId || null
  };

  gameState.playerZones.push(zone);
  return zone;
}

function updatePlayerZones(deltaTime) {
  const now = Date.now();

  gameState.playerZones = gameState.playerZones.filter(zone => {
    if (zone.endTime <= now) {
      return false;
    }

    if (now - zone.lastTick >= 300) {
      gameState.enemies.forEach(enemy => {
        const dist = Math.hypot(enemy.x - zone.x, enemy.y - zone.y);
        if (dist > zone.radius) return;

        if (zone.damage > 0) {
          enemy.hp -= zone.damage;
          if (enemy.hp <= 0) {
            killEnemy(enemy, zone.sourceWeaponId);
          }
        }

        if (zone.slowMultiplier < 1) {
          enemy.slowed = true;
          enemy.slowEndTime = now + 500;
          enemy.originalSpeed = enemy.originalSpeed || enemy.speed;
          enemy.speed = enemy.originalSpeed * zone.slowMultiplier;
        }
      });

      zone.lastTick = now;
    }

    return true;
  });
}

// ==================== 子弹逻辑 ====================
function updateBullets(deltaTime) {
  const player = gameState.player;
  
  // v1.7 性能优化：限制子弹数量
  const maxBullets = 200;
  if (gameState.bullets.length > maxBullets) {
    // 优先保留环绕子弹（戒尺）和敌人子弹
    gameState.bullets.sort((a, b) => {
      if (a.orbit && !b.orbit) return -1;
      if (!a.orbit && b.orbit) return 1;
      if (a.isEnemyBullet && !b.isEnemyBullet) return -1;
      if (!a.isEnemyBullet && b.isEnemyBullet) return 1;
      return 0;
    });
    gameState.bullets = gameState.bullets.slice(0, maxBullets);
  }
  
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
      if (bullet.trailColor) {
        VisualEffects.createTrail(bullet.x, bullet.y, bullet.trailColor, Math.max(2, (bullet.size || 8) * 0.35));
      }
    }
    
    // 跳过敌人子弹
    if (bullet.isEnemyBullet) return true;
    
    // v1.7 性能优化：只检测距离子弹较近的敌人
    let hit = false;
    const checkRadius = 100; // 只检测子弹周围100像素的敌人
    
    // v1.7 子弹与可破坏物体碰撞检测
    gameState.destructibles.forEach(d => {
      if (d.destroyed) return;
      const dx = bullet.x - d.x;
      const dy = bullet.y - d.y;
      if (Math.abs(dx) > checkRadius || Math.abs(dy) > checkRadius) return;
      
      const dist = Math.hypot(dx, dy);
      if (dist < d.size + 10) {
        damageDestructible(d, bullet.damage);
        if (bullet.pierce <= 0) {
          hit = true;
        } else {
          bullet.pierce--;
        }
      }
    });
    
    if (hit) return false;
    
    gameState.enemies.forEach(enemy => {
      if (bullet.hitEnemies.has(enemy)) return;
      
      // 快速距离检查，避免不必要的Math.hypot
      const dx = bullet.x - enemy.x;
      const dy = bullet.y - enemy.y;
      if (Math.abs(dx) > checkRadius || Math.abs(dy) > checkRadius) return;
      
      const dist = Math.hypot(dx, dy);
      if (dist < enemy.size + 10) {
        enemy.hp -= bullet.damage;
        bullet.hitEnemies.add(enemy);
        
        // 暴击时触发慢镜头
        if (bullet.isCrit && Math.random() < 0.3) {
          SlowMotion.trigger();
        }
        
        // 应用子弹特殊效果
        applyBulletEffects(bullet, enemy);

        if (bullet.weaponId === 'triangle' && !bullet.hasSplit && bullet.hitEnemies.size >= 1 && bullet.pierce <= 1) {
          bullet.hasSplit = true;
          createBullet(bullet.x, bullet.y, Math.atan2(enemy.y - bullet.y, enemy.x - bullet.x) + 0.22, bullet.weapon, false, bullet.weaponId);
          createBullet(bullet.x, bullet.y, Math.atan2(enemy.y - bullet.y, enemy.x - bullet.x) - 0.22, bullet.weapon, false, bullet.weaponId);
        }

        if (bullet.weapon?.explode) {
          explodePlayerBullet(bullet, bullet.x, bullet.y, enemy);
        }
        
        if (bullet.pierce <= 0) {
          hit = true;
        } else {
          bullet.pierce--;
        }
        
        // 武器经验获取（命中）
        if (bullet.weaponId) {
          WeaponMastery.addExp(bullet.weaponId, WeaponMastery.expPerHit);
        }
        
        if (enemy.hp <= 0) {
          killEnemy(enemy, bullet.weaponId);
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
        
        if (bullet.weapon?.explode) {
          explodePlayerBullet(bullet, bullet.x, bullet.y);
        }

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
    
    // 子弹生命周期检查
    if (bullet.life !== undefined && bullet.life > 0) {
      bullet.life -= deltaTime;
      if (bullet.life <= 0) {
        hit = true;
      }
    }
    
    // 边界检查
    const outOfBounds = Math.abs(bullet.x - player.x) > 600 || Math.abs(bullet.y - player.y) > 600;
    
    return !hit && !outOfBounds;
  });
}

// 处理子弹特殊效果
function applyBulletEffects(bullet, enemy) {
  if (bullet.weapon?.knockback || bullet.knockbackBoost) {
    const angle = Math.atan2(enemy.y - bullet.y, enemy.x - bullet.x);
    applyKnockback(enemy, { damage: bullet.damage + (bullet.knockbackBoost || 0) }, angle);
  }

  // 眩晕效果
  if (bullet.stunChance && Math.random() < bullet.stunChance) {
    enemy.stunned = true;
    enemy.stunEndTime = Date.now() + 1500;
    FloatingText.add(enemy.x, enemy.y - 30, '眩晕!', '#ffa502', 16);
  }
  
  // 减速效果
  if (bullet.slowEffect) {
    enemy.slowed = true;
    enemy.slowEndTime = Date.now() + 2000;
    enemy.originalSpeed = enemy.originalSpeed || enemy.speed;
    enemy.speed = enemy.originalSpeed * 0.5;
    FloatingText.add(enemy.x, enemy.y - 30, '减速!', '#74b9ff', 14);
  }

  if (bullet.freezeEffect) {
    enemy.stunned = true;
    enemy.stunEndTime = Date.now() + 1500;
    enemy.slowed = true;
    enemy.slowEndTime = Date.now() + 1500;
    enemy.originalSpeed = enemy.originalSpeed || enemy.speed;
    enemy.speed = enemy.originalSpeed * 0.2;
    FloatingText.add(enemy.x, enemy.y - 30, '冰冻!', '#74b9ff', 14);
  }

  if (bullet.blindEffect) {
    enemy.blinded = true;
    enemy.blindEndTime = Date.now() + 1800;
    FloatingText.add(enemy.x, enemy.y - 30, '致盲!', '#ecf0f1', 14);
  }

  if (bullet.dotEffect) {
    enemy.dotActive = true;
    enemy.dotDamage = bullet.dotDamage || Math.max(3, Math.floor(bullet.damage * 0.15));
    enemy.lastDotTick = Date.now();
    enemy.dotEndTime = Date.now() + 2500;
    FloatingText.add(enemy.x, enemy.y - 30, '染墨!', '#8e44ad', 14);

    if (bullet.weaponId === 'ink') {
      spawnPlayerZone('ink', enemy.x, enemy.y, {
        radius: 75,
        damage: Math.max(2, Math.floor(bullet.damage * 0.08)),
        slowMultiplier: 0.7,
        color: '#6c3483',
        emoji: '🖊️',
        duration: 2800,
        sourceWeaponId: bullet.weaponId
      });
    }
  }
}

// ==================== 经验球逻辑 ====================
function updateExpOrbs(deltaTime) {
  const player = gameState.player;
  // 磁铁效果增加吸附范围
  const magnetActive = gameState.activeEffects.magnet.active;
  const pickupRange = 100 + (gameState.unlocks.pickup ? 30 : 0);
  const attractRange = magnetActive ? 300 : pickupRange;
  const attractSpeed = magnetActive ? 1.5 : 0.5;
  
  // v1.7 性能优化：限制经验球数量，优先保留离玩家近的
  const maxOrbs = 100;
  if (gameState.expOrbs.length > maxOrbs) {
    // 按距离排序，保留最近的
    gameState.expOrbs.sort((a, b) => {
      const distA = Math.hypot(player.x - a.x, player.y - a.y);
      const distB = Math.hypot(player.x - b.x, player.y - b.y);
      return distA - distB;
    });
    gameState.expOrbs = gameState.expOrbs.slice(0, maxOrbs);
  }
  
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

  checkLevelUp();
}

// ==================== 升级系统 ====================
function showUpgradeModal() {
  gameState.paused = true;
  
  const options = [];
  const playerLevel = gameState.player.level;
  const availableUpgrades = UPGRADES.filter(u => {
    // 检查解锁等级
    if (u.unlockLevel && playerLevel < u.unlockLevel) {
      return false;
    }
    
    if (u.type === 'weapon') {
      // 检查武器是否已解锁且未满级
      return !gameState.weapons[u.id].unlocked || gameState.weapons[u.id].level < WEAPONS[u.id].maxLevel;
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
        case 'defense':
          gameState.unlocks.defense = true;
          break;
        case 'regen':
          gameState.unlocks.regen = true;
          gameState.regenAmount = (gameState.regenAmount || 0) + 2;
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
        case 'pierceShot':
          gameState.unlocks.pierceShot = true;
          gameState.extraPierce = (gameState.extraPierce || 0) + 1;
          break;
        case 'doubleShot':
          gameState.unlocks.doubleShot = true;
          gameState.doubleShotChance = (gameState.doubleShotChance || 0) + 0.25;
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
  const now = Date.now();

  // v1.7 性能优化：限制粒子数量
  const maxParticles = 150;
  if (gameState.particles.length > maxParticles) {
    // 保留最新的粒子
    gameState.particles = gameState.particles.slice(-maxParticles);
  }
  
  gameState.particles = gameState.particles.filter(p => {
    // 根据粒子类型更新
    switch (p.type) {
      case 'absorb':
        // 向目标移动
        const dx = p.targetX - p.x;
        const dy = p.targetY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 10) {
          p.vx = (dx / dist) * 15;
          p.vy = (dy / dist) * 15;
        }
        p.x += p.vx;
        p.y += p.vy;
        break;
        
      case 'ring':
        // 扩散效果
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.size *= 0.99;
        break;
        
      case 'float':
        // 上升效果
        p.y += p.vy;
        p.x += Math.sin(now / 200 + p.y) * 0.5;
        break;
        
      case 'flash':
        // 闪光效果
        p.size *= 1.1;
        break;
        
      default:
        // 默认物理
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.95;
        p.vy *= 0.95;
    }
    
    p.life -= p.decay || deltaTime;
    return p.life > 0;
  });
  
  // 更新飘字
  FloatingText.update();
  
  // 更新背景效果
  BackgroundEffects.update();
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
  
  // 应用屏幕震动
  const shakeOffset = ScreenShake.getOffset();
  
  ctx.save();
  ctx.translate(-camera.x + shakeOffset.x, -camera.y + shakeOffset.y);
  
  // 时间冻结视觉效果
  if (gameState.timeFrozen) {
    ctx.save();
    ctx.fillStyle = 'rgba(95, 39, 205, 0.15)';
    ctx.fillRect(camera.x, camera.y, canvas.width, canvas.height);
    ctx.restore();
  }
  
  // 绘制动态背景
  BackgroundEffects.render(ctx, camera);
  
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
  
  // 绘制粒子（增强版）
  gameState.particles.forEach(p => {
    ctx.globalAlpha = Math.min(1, p.life);
    
    if (p.type === 'flash') {
      // 闪光效果
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === 'crit') {
      // 暴击星形
      ctx.fillStyle = p.color;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const x = p.x + Math.cos(angle) * p.size;
        const y = p.y + Math.sin(angle) * p.size;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
    } else {
      // 普通粒子带发光
      ctx.shadowBlur = p.size;
      ctx.shadowColor = p.color;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  });
  ctx.globalAlpha = 1;
  
  // 绘制死亡动画
  DeathAnimation.render(ctx, camera);
  
  // 绘制飘字
  FloatingText.render(ctx, camera);
  
  // v1.7 绘制可破坏物体
  gameState.destructibles.forEach(d => {
    if (d.destroyed) return;
    
    // 血条
    const hpPercent = d.hp / d.maxHp;
    ctx.fillStyle = '#2d3436';
    ctx.fillRect(d.x - 20, d.y - d.size - 8, 40, 3);
    ctx.fillStyle = hpPercent > 0.5 ? '#74b9ff' : '#ff4757';
    ctx.fillRect(d.x - 20, d.y - d.size - 8, 40 * hpPercent, 3);
    
    // 物体图标
    ctx.save();
    ctx.font = `${d.size}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(d.emoji, d.x, d.y);
    ctx.restore();
    
    // 光晕效果
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.size * 0.8, 0, Math.PI * 2);
    ctx.fillStyle = d.color;
    ctx.fill();
    ctx.restore();
  });

  gameState.playerZones.forEach(zone => {
    const lifeProgress = Math.max(0, (zone.endTime - Date.now()) / Math.max(1, zone.endTime - zone.createdAt));
    const alpha = 0.12 + lifeProgress * 0.18;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2);
    ctx.fillStyle = zone.color;
    ctx.fill();

    ctx.globalAlpha = alpha + 0.15;
    ctx.lineWidth = 2;
    ctx.strokeStyle = zone.color;
    ctx.stroke();

    if (zone.emoji) {
      ctx.globalAlpha = alpha + 0.2;
      ctx.font = '18px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(zone.emoji, zone.x, zone.y);
    }
    ctx.restore();
  });
  
  // 绘制敌人
  gameState.enemies.forEach(enemy => {
    const enemyType = ENEMY_TYPES[enemy.type] || {
      emoji: enemy.emoji || '❓',
      color: enemy.color || '#ffa502'
    };
    
    // 血条
    const hpPercent = enemy.hp / enemy.maxHp;
    ctx.fillStyle = '#2d3436';
    ctx.fillRect(enemy.x - 20, enemy.y - enemy.size - 10, 40, 4);
    ctx.fillStyle = hpPercent > 0.5 ? '#2ed573' : '#ff4757';
    ctx.fillRect(enemy.x - 20, enemy.y - enemy.size - 10, 40 * hpPercent, 4);
    
    // 精英怪光环
    if (enemy.isElite) {
      ctx.save();
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ffd700';
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.size * 0.8, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    }
    
    // 特殊敌人标识
    if (enemy.explodeOnDeath) {
      ctx.save();
      ctx.fillStyle = '#ffa502';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('💣', enemy.x + enemy.size * 0.6, enemy.y - enemy.size * 0.6);
      ctx.restore();
    }
    
    if (enemy.healNearby) {
      ctx.save();
      ctx.fillStyle = '#2ed573';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('💚', enemy.x + enemy.size * 0.6, enemy.y - enemy.size * 0.6);
      ctx.restore();
    }
    
    if (enemy.canTeleport) {
      ctx.save();
      ctx.fillStyle = '#a29bfe';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('✨', enemy.x + enemy.size * 0.6, enemy.y - enemy.size * 0.6);
      ctx.restore();
    }
    
    // 敌人
    ctx.font = `${enemy.size}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(enemy.emoji || enemyType.emoji, enemy.x, enemy.y);
  });
  
  // 绘制危险区域
  if (gameState.hazardZones) {
    gameState.hazardZones.forEach(zone => {
      const timeLeft = (zone.endTime - Date.now()) / 1000;
      const alpha = Math.min(1, timeLeft / 2) * 0.4;
      
      // 区域外圈警告
      ctx.beginPath();
      ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2);
      ctx.fillStyle = zone.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      ctx.fill();
      
      // 内圈伤害区域
      ctx.beginPath();
      ctx.arc(zone.x, zone.y, zone.radius * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = zone.color + Math.floor(alpha * 1.5 * 255).toString(16).padStart(2, '0');
      ctx.fill();
      
      // 旋转警示线
      ctx.save();
      ctx.translate(zone.x, zone.y);
      ctx.rotate(Date.now() / 500);
      ctx.strokeStyle = zone.color;
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(zone.radius, 0);
        ctx.stroke();
        ctx.rotate(Math.PI / 2);
      }
      ctx.restore();
      
      // 中心图标
      ctx.font = '30px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(zone.emoji, zone.x, zone.y);
    });
  }
  
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
    gradient.addColorStop(0, boss.color);
    gradient.addColorStop(0.5, '#ff6b6b');
    gradient.addColorStop(1, boss.color);
    ctx.fillStyle = gradient;
    ctx.fillRect(boss.x - barWidth/2, boss.y - boss.size - 25, barWidth * hpPercent, barHeight);
    
    // 血条边框
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(boss.x - barWidth/2, boss.y - boss.size - 25, barWidth, barHeight);
    
    // Boss名字
    ctx.fillStyle = boss.color;
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${boss.emoji} ${boss.name}`, boss.x, boss.y - boss.size - 35);
    
    // Boss本体 - 带呼吸效果和阶段光环
    const pulse = Math.sin(Date.now() / 200) * 3;
    const phaseIntensity = 1 + boss.phase * 0.3;
    
    // 阶段光环
    ctx.save();
    ctx.shadowBlur = 30 * phaseIntensity;
    ctx.shadowColor = boss.color;
    ctx.beginPath();
    ctx.arc(boss.x, boss.y, boss.size * 0.9 + pulse, 0, Math.PI * 2);
    ctx.strokeStyle = boss.color;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
    
    // Boss图标
    ctx.font = `${boss.size + pulse}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 20;
    ctx.shadowColor = boss.color;
    ctx.fillText(boss.emoji, boss.x, boss.y);
    ctx.shadowBlur = 0;
    
    // Boss阶段指示器
    const phaseColors = ['#2ed573', '#ffa502', '#ff4757', '#ff3838'];
    ctx.fillStyle = phaseColors[Math.min(boss.phase, 3)];
    ctx.beginPath();
    ctx.arc(boss.x + boss.size, boss.y - boss.size, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 绘制Boss技能冷却指示（简化版）
    const bossConfig = BOSSES[boss.id];
    if (bossConfig && bossConfig.skills) {
      const skillY = boss.y + boss.size + 20;
      bossConfig.skills.forEach((skill, index) => {
        const lastUsed = boss.lastSkillUse[index] || 0;
        const cooldown = skill.cooldown / (boss.phaseData?.multiplier || 1);
        const progress = Math.min(1, (Date.now() - lastUsed) / cooldown);
        
        const iconX = boss.x - 40 + index * 30;
        
        // 背景
        ctx.fillStyle = progress >= 1 ? '#2ed573' : '#2d3436';
        ctx.beginPath();
        ctx.arc(iconX, skillY, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // 冷却遮罩
        if (progress < 1) {
          ctx.fillStyle = 'rgba(0,0,0,0.7)';
          ctx.beginPath();
          ctx.arc(iconX, skillY, 10, -Math.PI/2, -Math.PI/2 + (1-progress) * Math.PI * 2);
          ctx.lineTo(iconX, skillY);
          ctx.fill();
        }
        
        // 图标
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(skill.emoji, iconX, skillY);
      });
    }
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
    if (bullet.isEnemyBullet) return;
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.size || 8, 0, Math.PI * 2);
    ctx.fillStyle = bullet.color || '#ffa502';
    ctx.fill();
    ctx.shadowBlur = bullet.size || 10;
    ctx.shadowColor = bullet.color || '#ffa502';
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
  
  // 绘制慢镜头效果（在相机变换之外）
  SlowMotion.render(ctx, canvas);
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
// 性能优化：UI更新节流
let uiLastUpdate = 0;
const UI_UPDATE_INTERVAL = 50; // 每50ms更新一次UI

function updateUI() {
  const now = Date.now();
  if (now - uiLastUpdate < UI_UPDATE_INTERVAL) return;
  uiLastUpdate = now;
  
  const player = gameState.player;
  
  // HP
  const hpBar = document.getElementById('hpBar');
  const hpText = document.getElementById('hpText');
  if (hpBar && hpText) {
    const hpPercent = (player.hp / player.maxHp) * 100;
    hpBar.style.width = hpPercent + '%';
    hpText.textContent = `${Math.ceil(player.hp)}/${player.maxHp}`;
  }
  
  // EXP
  const expBar = document.getElementById('expBar');
  const levelText = document.getElementById('levelText');
  if (expBar && levelText) {
    const expPercent = (player.exp / player.expToNext) * 100;
    expBar.style.width = expPercent + '%';
    levelText.textContent = `Lv.${player.level}`;
  }
  
  // 怒气
  if (player.rage > 0 || player.rageActive) {
    const rageBarContainer = document.getElementById('rageBarContainer');
    const rageBar = document.getElementById('rageBar');
    const rageText = document.getElementById('rageText');
    if (rageBarContainer && rageBar && rageText) {
      rageBarContainer.style.opacity = '1';
      rageBar.style.width = player.rageActive ? '100%' : player.rage + '%';
      rageText.textContent = player.rageActive ? '暴走中!' : Math.floor(player.rage) + '%';
    }
  }
  
  // 等级
  const levelPill = document.getElementById('levelPill');
  if (levelPill) {
    levelPill.textContent = `Lv.${player.level}`;
  }
  
  // 波次
  const wavePill = document.getElementById('wavePill');
  if (wavePill) {
    wavePill.textContent = `第${gameState.wave}波`;
  }
  
  // 时间
  const timePill = document.getElementById('timePill');
  if (timePill) {
    const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const seconds = (elapsed % 60).toString().padStart(2, '0');
    timePill.textContent = `${minutes}:${seconds}`;
  }
  
  // 击杀
  const killPill = document.getElementById('killPill');
  if (killPill) {
    killPill.textContent = `击败: ${gameState.kills}`;
  }
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
