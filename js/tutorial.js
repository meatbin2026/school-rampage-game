// ==================== 新手引导系统 ====================
const TutorialSystem = {
  steps: [
    {
      id: 'welcome',
      title: '欢迎来到校园暴走！',
      content: '这是一款割草生存游戏，你需要击败源源不断的敌人，尽可能存活更久！',
      position: 'center',
      highlight: null
    },
    {
      id: 'character',
      title: '选择角色',
      content: '每个角色有不同的特点：\n😎 校霸：高攻击、高血量\n🤓 学霸：高攻速、高移速\n🏃 体育生：均衡型、暴走快',
      position: 'top',
      highlight: '.character-select'
    },
    {
      id: 'movement',
      title: '移动控制',
      content: 'PC端：使用 WASD 或方向键移动\n手机端：使用左下角虚拟摇杆',
      position: 'bottom',
      highlight: null
    },
    {
      id: 'attack',
      title: '自动攻击',
      content: '武器会自动攻击范围内的敌人，你只需要专注于移动和躲避！',
      position: 'center',
      highlight: null
    },
    {
      id: 'rage',
      title: '暴走模式',
      content: '击败敌人积累怒气，怒气满后点击暴走按钮（或按空格键）进入暴走模式，大幅提升战斗力！',
      position: 'bottom',
      highlight: '.rage-indicator'
    },
    {
      id: 'upgrade',
      title: '升级强化',
      content: '击败敌人获得经验，升级后可以选择强化武器或获得新能力！',
      position: 'center',
      highlight: null
    },
    {
      id: 'boss',
      title: 'Boss挑战',
      content: '每过几波会出现强大的Boss，击败他们可以获得丰厚奖励！',
      position: 'center',
      highlight: null
    },
    {
      id: 'tips',
      title: '游戏技巧',
      content: '💡 保持移动，不要站桩\n💡 优先拾取经验球升级\n💡 合理使用暴走模式\n💡 注意躲避精英怪的攻击',
      position: 'center',
      highlight: null
    }
  ],
  
  currentStep: 0,
  isActive: false,
  
  // 检查是否需要显示引导
  shouldShowTutorial() {
    const hasCompleted = localStorage.getItem('tutorialCompleted');
    return !hasCompleted;
  },
  
  // 开始引导
  start() {
    if (!this.shouldShowTutorial()) return;
    
    this.currentStep = 0;
    this.isActive = true;
    this.showStep();
  },
  
  // 显示当前步骤
  showStep() {
    const step = this.steps[this.currentStep];
    if (!step) {
      this.complete();
      return;
    }
    
    this.createTutorialOverlay(step);
  },
  
  // 创建引导界面
  createTutorialOverlay(step) {
    // 移除已存在的引导
    this.removeTutorial();
    
    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.id = 'tutorialOverlay';
    overlay.className = 'tutorial-overlay';
    
    // 高亮区域
    if (step.highlight) {
      const highlightEl = document.querySelector(step.highlight);
      if (highlightEl) {
        const rect = highlightEl.getBoundingClientRect();
        overlay.innerHTML += `
          <div class="tutorial-highlight" style="
            position: absolute;
            left: ${rect.left - 10}px;
            top: ${rect.top - 10}px;
            width: ${rect.width + 20}px;
            height: ${rect.height + 20}px;
          "></div>
        `;
      }
    }
    
    // 提示框
    const isLastStep = this.currentStep === this.steps.length - 1;
    overlay.innerHTML += `
      <div class="tutorial-box tutorial-${step.position}">
        <h3 class="tutorial-title">${step.title}</h3>
        <p class="tutorial-content">${step.content.replace(/\n/g, '<br>')}</p>
        <div class="tutorial-progress">
          ${this.steps.map((_, i) => `
            <span class="progress-dot ${i === this.currentStep ? 'active' : ''}"></span>
          `).join('')}
        </div>
        <div class="tutorial-buttons">
          ${this.currentStep > 0 ? '<button class="tutorial-btn btn-prev" onclick="TutorialSystem.prev()">上一步</button>' : ''}
          <button class="tutorial-btn btn-skip" onclick="TutorialSystem.skip()">跳过</button>
          <button class="tutorial-btn btn-next" onclick="TutorialSystem.next()">${isLastStep ? '开始游戏' : '下一步'}</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
  },
  
  // 下一步
  next() {
    this.currentStep++;
    if (this.currentStep >= this.steps.length) {
      this.complete();
    } else {
      this.showStep();
    }
  },
  
  // 上一步
  prev() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.showStep();
    }
  },
  
  // 跳过引导
  skip() {
    this.removeTutorial();
    this.isActive = false;
    localStorage.setItem('tutorialCompleted', 'true');
  },
  
  // 完成引导
  complete() {
    this.removeTutorial();
    this.isActive = false;
    localStorage.setItem('tutorialCompleted', 'true');
    
    // 显示完成提示
    this.showCompleteMessage();
  },
  
  // 显示完成提示
  showCompleteMessage() {
    const msg = document.createElement('div');
    msg.className = 'tutorial-complete';
    msg.innerHTML = `
      <div class="complete-content">
        <div class="complete-icon">🎉</div>
        <h3>准备就绪！</h3>
        <p>祝你游戏愉快！</p>
      </div>
    `;
    document.body.appendChild(msg);
    
    setTimeout(() => {
      msg.style.animation = 'fadeOut 0.5s ease forwards';
      setTimeout(() => msg.remove(), 500);
    }, 2000);
  },
  
  // 移除引导界面
  removeTutorial() {
    const existing = document.getElementById('tutorialOverlay');
    if (existing) existing.remove();
  },
  
  // 重置引导（用于测试）
  reset() {
    localStorage.removeItem('tutorialCompleted');
    this.currentStep = 0;
  }
};

// 导出新手指引系统
window.TutorialSystem = TutorialSystem;
