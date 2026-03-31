// ==================== 移动端适配系统 ====================
const MobileControls = {
  // 虚拟摇杆状态
  joystick: {
    active: false,
    startX: 0,
    startY: 0,
    dx: 0,
    dy: 0,
    maxRadius: 60,
    touchId: null
  },
  
  // 初始化
  init() {
    this.detectMobile();
    this.setupJoystick();
    this.setupButtons();
    this.setupGlobalTouch();
  },
  
  // 检测是否为移动设备
  detectMobile() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isWechat = /MicroMessenger/i.test(navigator.userAgent);
    
    gameState.isMobile = isMobile;
    gameState.isWechat = isWechat;
    
    if (isMobile || isWechat) {
      document.body.classList.add('mobile');
    }
    
    // 微信浏览器特殊处理
    if (isWechat) {
      this.setupWechatCompat();
    }
  },
  
  // 设置虚拟摇杆
  setupJoystick() {
    const container = document.getElementById('mobileJoystick');
    const base = document.getElementById('joystickBase');
    const stick = document.getElementById('joystickStick');
    
    if (!container || !base || !stick) {
      console.log('摇杆元素未找到');
      return;
    }
    
    // 触摸开始
    container.addEventListener('touchstart', (e) => {
      if (!gameState.running || gameState.paused || gameState.gameOver) return;
      
      e.preventDefault();
      const touch = e.touches[0];
      
      this.joystick.touchId = touch.identifier;
      this.joystick.active = true;
      
      const rect = base.getBoundingClientRect();
      this.joystick.startX = rect.left + rect.width / 2;
      this.joystick.startY = rect.top + rect.height / 2;
      
      this.updateJoystick(touch.clientX, touch.clientY, stick);
    }, { passive: false });
    
    // 触摸移动 - 使用全局监听
    document.addEventListener('touchmove', (e) => {
      if (!this.joystick.active) return;
      
      for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier === this.joystick.touchId) {
          e.preventDefault();
          this.updateJoystick(e.touches[i].clientX, e.touches[i].clientY, stick);
          break;
        }
      }
    }, { passive: false });
    
    // 触摸结束 - 使用全局监听
    const endTouch = (e) => {
      if (!this.joystick.active) return;
      
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === this.joystick.touchId) {
          this.joystick.active = false;
          this.joystick.dx = 0;
          this.joystick.dy = 0;
          this.joystick.touchId = null;
          stick.style.transform = 'translate(-50%, -50%)';
          break;
        }
      }
    };
    
    document.addEventListener('touchend', endTouch);
    document.addEventListener('touchcancel', endTouch);
  },
  
  // 更新摇杆位置和方向
  updateJoystick(clientX, clientY, stick) {
    let dx = clientX - this.joystick.startX;
    let dy = clientY - this.joystick.startY;
    
    // 限制在最大半径内
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > this.joystick.maxRadius) {
      const ratio = this.joystick.maxRadius / distance;
      dx *= ratio;
      dy *= ratio;
    }
    
    // 更新方向值（-1 到 1）
    this.joystick.dx = dx / this.joystick.maxRadius;
    this.joystick.dy = dy / this.joystick.maxRadius;
    
    // 更新视觉位置
    stick.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  },
  
  // 设置按钮
  setupButtons() {
    // 暴走按钮
    const rageBtn = document.getElementById('rageBtn');
    if (rageBtn) {
      rageBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (gameState.running && !gameState.paused) {
          activateRage();
          rageBtn.classList.add('active');
        }
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
        e.stopPropagation();
        if (gameState.running) {
          togglePause();
        }
      }, { passive: false });
    }
  },
  
  // 全局触摸设置
  setupGlobalTouch() {
    // 防止页面滚动和缩放
    document.addEventListener('touchmove', (e) => {
      if (gameState.running) {
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
  
  // 微信浏览器兼容性
  setupWechatCompat() {
    // 微信需要用户交互才能播放音频
    const unlockAudio = () => {
      if (AudioSystem.ctx && AudioSystem.ctx.state === 'suspended') {
        AudioSystem.ctx.resume();
      }
      document.removeEventListener('touchstart', unlockAudio);
    };
    document.addEventListener('touchstart', unlockAudio);
  },
  
  // 获取移动输入
  getInput() {
    if (!this.joystick.active) {
      return { x: 0, y: 0 };
    }
    return {
      x: this.joystick.dx,
      y: this.joystick.dy
    };
  }
};

// 导岀模块
window.MobileControls = MobileControls;
