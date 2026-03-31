// ==================== 版本管理系统 ====================
const VersionManager = {
  // 当前版本号
  currentVersion: '1.7',
  
  // 版本历史记录
  changelog: [
    {
      version: '1.7',
      date: '2025-03-31',
      title: '无尽模式深化',
      changes: [
        '🔥 特殊波次系统：精英波、速度波、坦克波、混乱波',
        '🏆 里程碑奖励：50波解锁转校生、100波获得校园传说称号',
        '🪑 可破坏物体：课桌、垃圾桶、篮球架、储物柜',
        '📢 波次预告：提前告知下一波类型',
        '🎁 特殊波次完成奖励'
      ]
    },
    {
      version: '1.6',
      date: '2025-03-31',
      title: '武器平衡与深度优化',
      changes: [
        '⚖️ 武器平衡调整：增强饭盒（溅射+眩晕），削弱水球',
        '🔫 新增武器：激光笔、冰棒投掷',
        '🔥 增强连击系统：连击经验加成（最高+100%）',
        '⚔️ 双武器系统：主副武器切换（Q键）',
        '💥 击退效果：敌人受击击退',
        '🎯 连击里程碑：10/20/50/100连击特效',
        '🎨 连击UI优化：显示经验加成百分比'
      ]
    },
    {
      version: '1.5',
      date: '2025-03-31',
      title: '移动端控制修复',
      changes: [
        '📱 修复虚拟摇杆无法移动的问题',
        '🔧 优化触摸事件处理逻辑',
        '🔧 修复移动端控制UI显示问题',
        '⚡ 提升移动端响应速度'
      ]
    },
    {
      version: '1.4',
      date: '2025-03-31',
      title: '游戏体验优化',
      changes: [
        '📚 添加新手引导教程（8步引导）',
        '⚖️ 优化游戏平衡性（降低难度曲线）',
        '🔇 添加音效静音按钮',
        '🛡️ 添加新手保护机制（前30秒减伤）',
        '📖 添加查看教程按钮',
        '🎨 优化视觉反馈效果'
      ]
    },
    {
      version: '1.3',
      date: '2025-03-31',
      title: '移动端适配与性能优化',
      changes: [
        '📱 添加虚拟摇杆控制（移动端）',
        '🔘 添加触摸技能按钮（暴走/暂停）',
        '📐 添加横屏提示',
        '⚡ 性能优化：对象池、动态质量调整',
        '🔧 微信浏览器兼容性处理',
        '📲 响应式UI适配手机端'
      ]
    },
    {
      version: '1.2',
      date: '2025-03-31',
      title: '版本历史功能优化',
      changes: [
        '📋 版本更新弹窗现在显示所有历史版本',
        '🎨 优化版本历史UI样式',
        '🏷️ 当前版本高亮标记'
      ]
    },
    {
      version: '1.1',
      date: '2025-03-31',
      title: 'Bug修复',
      changes: [
        '🐛 修复游戏无法开始的语法错误',
        '🔧 删除重复的代码块',
        '🔧 修复重复变量声明问题'
      ]
    },
    {
      version: '1.0',
      date: '2025-03-31',
      title: '初始版本',
      changes: [
        '🎮 游戏核心玩法：割草生存模式',
        '👤 3个可选角色：校霸、学霸、体育生',
        '🔫 12种武器系统',
        '📈 角色升级系统',
        '⚡ 暴走模式机制',
        '🏆 成就系统（26个成就）',
        '👹 Boss战系统（3个Boss）',
        '🎯 武器精通系统',
        '🌳 天赋树系统',
        '💾 本地数据持久化',
        '🔊 音效系统',
        '🎵 BGM系统',
        '✨ 视觉特效（死亡动画、慢镜头）'
      ]
    }
  ],
  
  // 获取当前版本信息
  getCurrentVersion() {
    return {
      version: this.currentVersion,
      info: this.changelog.find(c => c.version === this.currentVersion)
    };
  },
  
  // 获取所有版本历史
  getAllVersions() {
    return this.changelog;
  },
  
  // 获取最新版本（用于检查更新）
  getLatestVersion() {
    return this.changelog[0];
  },
  
  // 格式化版本显示
  formatVersion(version) {
    return `v${version}`;
  },
  
  // 渲染版本信息到UI
  renderVersionInfo() {
    const versionInfo = this.getCurrentVersion();
    const versionElements = document.querySelectorAll('.version-display');
    versionElements.forEach(el => {
      el.textContent = this.formatVersion(versionInfo.version);
    });
  },
  
  // 渲染更新日志弹窗
  renderChangelogModal() {
    const allVersions = this.getAllVersions();
    return `
      <div class="changelog-modal" id="changelogModal">
        <div class="changelog-content">
          <div class="changelog-header">
            <h2>📋 版本更新历史</h2>
            <span class="changelog-date">共 ${allVersions.length} 个版本</span>
          </div>
          <div class="changelog-body">
            ${allVersions.map(v => `
              <div class="version-section ${v.version === this.currentVersion ? 'current' : ''}">
                <div class="version-header">
                  <span class="version-number">v${v.version}</span>
                  <span class="version-date">${v.date}</span>
                  ${v.version === this.currentVersion ? '<span class="version-badge">当前</span>' : ''}
                </div>
                <h4 class="version-title">${v.title}</h4>
                <ul class="changelog-list">
                  ${v.changes.map(change => `<li>${change}</li>`).join('')}
                </ul>
              </div>
            `).join('')}
          </div>
          <button class="changelog-close" onclick="VersionManager.closeChangelog()">知道了</button>
        </div>
      </div>
    `;
  },
  
  // 显示更新日志
  showChangelog() {
    const existingModal = document.getElementById('changelogModal');
    if (existingModal) {
      existingModal.remove();
    }
    
    const modalHTML = this.renderChangelogModal();
    const div = document.createElement('div');
    div.innerHTML = modalHTML;
    document.body.appendChild(div.firstElementChild);
    
    // 保存到本地存储，标记已查看
    localStorage.setItem('lastViewedVersion', this.currentVersion);
  },
  
  // 关闭更新日志
  closeChangelog() {
    const modal = document.getElementById('changelogModal');
    if (modal) {
      modal.style.animation = 'fadeOut 0.3s ease forwards';
      setTimeout(() => modal.remove(), 300);
    }
  },
  
  // 检查是否有新版本（用于显示更新提示）
  hasNewVersion() {
    const lastViewed = localStorage.getItem('lastViewedVersion');
    return lastViewed !== this.currentVersion;
  },
  
  // 初始化版本显示
  init() {
    this.renderVersionInfo();
    
    // 如果有新版本，显示更新提示
    if (this.hasNewVersion()) {
      setTimeout(() => this.showChangelog(), 1000);
    }
  }
};

// 导出版本管理器
window.VersionManager = VersionManager;
