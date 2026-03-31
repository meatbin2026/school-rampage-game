// ==================== 移动端适配系统 ====================
const MobileControls = {
  // 虚拟摇杆状态
  joystick: {
    active: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    dx: 0,
    dy: 0,
    maxRadius: 60
  },
  
  // 技能按钮状态
  skillButtons: {
    rage: { active: false, cooldown: 0 },
    skill1: { active: false, cooldown: 0 }
  },
  
  // 初始化
  init() {
    this.setupJoystick();
    this.setupSkillButtons();
    this.setupTouchEvents();
    this.detectMobile();
  },
  
  // 检测是否为移动设备
  detectMobile() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isWechat = /MicroMessenger/i.test(navigator.userAgent);
    
    gameState.isMobile = isMobile;
    gameState.isWechat = isWechat;
    
    if (isMobile || isWechat) {
      document.body.classList.add('mobile');
      this.showMobileControls();
    }
    
    // 微信浏览器特殊处理
    if (isWechat) {
      this.setupWechatCompat();
    }
  },
  
  // 显示移动端控制UI
  showMobileControls() {
    const joystick = document.getElementById('mobileJoystick');
    const buttons = document.getElementById('mobileButtons');
    if (joystick) joystick.style.display = 'block';
    if (buttons) buttons.style.display = 'flex';
  },
  
  // 设置虚拟摇杆
  setupJoystick() {
    const joystick = document.getElementById('joystickBase');
    const stick = document.getElementById('joystickStick');
    if (!joystick || !stick) return;
    
    let touchId = null;
    
    joystick.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      touchId = touch.identifier;
      
      const rect = joystick.getBoundingClientRect();
      this.joystick.startX = rect.left + rect.width / 2;
      this.joystick.startY = rect.top + rect.height / 2;
      this.joystick.active = true;
      
      this.updateJoystick(touch.clientX, touch.clientY);
    }, { passive: false });
    
    joystick.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (!this.joystick.active) return;
      
      for (let touch of e.touches) {
        if (touch.identifier === touchId) {
          this.updateJoystick(touch.clientX, touch.clientY);
          break;
        }
      }
    }, { passive: false });
    
    const endJoystick = (e) => {
      if (!this.joystick.active) return;
      
      for (let touch of e.changedTouches) {
        if (touch.identifier === touchId) {
          this.joystick.active = false;
          this.joystick.dx = 0;
          this.joystick.dy = 0;
          stick.style.transform = `translate(-50%, -50%)`;
          touchId = null;
          break;
        }
      }
    };
    
    joystick.addEventListener('touchend', endJoystick);
    joystick.addEventListener('touchcancel', endJoystick);
  },
  
  // 更新摇杆位置
  updateJoystick(clientX, clientY) {
    const stick = document.getElementById('joystickStick');
    if (!stick) return;
    
    let dx = clientX - this.joystick.startX;
    let dy = clientY - this.joystick.startY;
    
    // 限制在最大半径内
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > this.joystick.maxRadius) {
      const ratio = this.joystick.maxRadius / distance;
      dx *= ratio;
      dy *= ratio;
    }
    
    this.joystick.dx = dx / this.joystick.maxRadius;
    this.joystick.dy = dy / this.joystick.maxRadius;
    
    stick.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  },
  
  // 设置技能按钮
  setupSkillButtons() {
    // 暴走按钮
    const rageBtn = document.getElementById('rageBtn');
    if (rageBtn) {
      rageBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        activateRage();
        rageBtn.classList.add('active');
      }, { passive: false });
      
      rageBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        rageBtn.classList.remove('active');
      });
    }
    
    // 暂停按钮
    const pauseBtn = document.getElementById('mobilePauseBtn');
    if (pauseBtn) {
      pauseBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        togglePause();
      }, { passive: false });
    }
  },
  
  // 设置触摸事件
  setupTouchEvents() {
    // 防止默认触摸行为（如缩放、滚动）
    document.addEventListener('touchmove', (e) => {
      if (e.target.closest('#gameCanvas') || e.target.closest('.mobile-control')) {
        e.preventDefault();
      }
    }, { passive: false });
    
    // 防止双击缩放
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, { passive: false });
  },
  
  // 微信浏览器兼容性设置
  setupWechatCompat() {
    // 微信需要用户交互才能播放音频
    document.addEventListener('touchstart', () => {
      if (AudioSystem.ctx && AudioSystem.ctx.state === 'suspended') {
        AudioSystem.ctx.resume();
      }
    }, { once: true });
    
    // 微信分享设置
    if (typeof wx !== 'undefined') {
      wx.ready(() => {
        wx.updateAppMessageShareData({
          title: '校园暴走 - 放学别走！',
          desc: '我在校园暴走中击败了' + (SaveSystem.load().totalKills || 0) + '个敌人，来挑战我吧！',
          link: window.location.href,
          success: () => console.log('分享设置成功')
        });
      });
    }
  },
  
  // 获取移动输入（用于游戏循环）
  getInput() {
    if (!this.joystick.active) return { x: 0, y: 0 };
    return {
      x: this.joystick.dx,
      y: this.joystick.dy
    };
  }
};

// ==================== 性能优化系统 ====================
const PerformanceOptimizer = {
  // 对象池
  pools: {
    bullets: [],
    particles: [],
    enemies: [],
    expOrbs: []
  },
  
  // 渲染优化
  render: {
    lastFrameTime: 0,
    targetFPS: 60,
    frameInterval: 1000 / 60,
    skipFrames: 0,
    currentSkip: 0
  },
  
  // 初始化
  init() {
    this.setupObjectPools();
    this.optimizeForMobile();
    this.setupFPSMonitor();
  },
  
  // 设置对象池
  setupObjectPools() {
    // 预创建常用对象
    for (let i = 0; i < 100; i++) {
      this.pools.bullets.push(this.createBulletTemplate());
      this.pools.particles.push(this.createParticleTemplate());
    }
    
    for (let i = 0; i < 50; i++) {
      this.pools.expOrbs.push(this.createExpOrbTemplate());
    }
  },
  
  createBulletTemplate() {
    return {
      x: 0, y: 0, vx: 0, vy: 0,
      damage: 0, life: 0, maxLife: 0,
      weaponId: null, piercing: 0,
      active: false
    };
  },
  
  createParticleTemplate() {
    return {
      x: 0, y: 0, vx: 0, vy: 0,
      life: 0, color: '', size: 0,
      active: false
    };
  },
  
  createExpOrbTemplate() {
    return {
      x: 0, y: 0, vx: 0, vy: 0,
      exp: 0, active: false
    };
  },
  
  // 从对象池获取对象
  getFromPool(type) {
    const pool = this.pools[type];
    for (let obj of pool) {
      if (!obj.active) {
        obj.active = true;
        return obj;
      }
    }
    // 池满了，创建新对象
    const newObj = this.createTemplate(type);
    newObj.active = true;
    pool.push(newObj);
    return newObj;
  },
  
  createTemplate(type) {
    switch(type) {
      case 'bullets': return this.createBulletTemplate();
      case 'particles': return this.createParticleTemplate();
      case 'expOrbs': return this.createExpOrbTemplate();
      default: return {};
    }
  },
  
  // 归还对象到池
  returnToPool(obj, type) {
    obj.active = false;
    // 重置对象状态
    Object.keys(obj).forEach(key => {
      if (key !== 'active') {
        obj[key] = typeof obj[key] === 'boolean' ? false : 
                   typeof obj[key] === 'string' ? '' : 0;
      }
    });
  },
  
  // 移动端优化
  optimizeForMobile() {
    if (!gameState.isMobile) return;
    
    // 降低粒子数量
    CONFIG.particleCount = 0.5;
    
    // 降低敌人最大数量
    CONFIG.maxEnemies = Math.floor(CONFIG.maxEnemies * 0.7);
    
    // 降低渲染质量
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
    }
    
    // 调整目标帧率
    this.render.targetFPS = 30;
    this.render.frameInterval = 1000 / 30;
  },
  
  // 设置FPS监控
  setupFPSMonitor() {
    let frameCount = 0;
    let lastTime = performance.now();
    
    setInterval(() => {
      const now = performance.now();
      const fps = Math.round(frameCount * 1000 / (now - lastTime));
      frameCount = 0;
      lastTime = now;
      
      gameState.currentFPS = fps;
      
      // 动态调整质量
      if (fps < 25 && gameState.isMobile) {
        this.reduceQuality();
      }
    }, 2000);
    
    // 计数帧
    const originalGameLoop = gameLoop;
    gameLoop = (timestamp) => {
      frameCount++;
      return originalGameLoop(timestamp);
    };
  },
  
  // 降低质量以提高性能
  reduceQuality() {
    CONFIG.particleCount *= 0.8;
    CONFIG.maxEnemies = Math.max(20, CONFIG.maxEnemies - 5);
    
    // 清理多余粒子
    if (gameState.particles && gameState.particles.length > 50) {
      gameState.particles = gameState.particles.slice(0, 50);
    }
  },
  
  // 检查是否应该渲染这一帧
  shouldRender() {
    if (!gameState.isMobile) return true;
    
    this.render.currentSkip++;
    if (this.render.currentSkip >= this.render.skipFrames + 1) {
      this.render.currentSkip = 0;
      return true;
    }
    return false;
  }
};

// 导岀模块
window.MobileControls = MobileControls;
window.PerformanceOptimizer = PerformanceOptimizer;
