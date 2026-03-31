// ==================== 版本管理系统 ====================
const VersionManager = {
  // 当前版本号
  currentVersion: '1.2',
  
  // 版本历史记录
  changelog: [
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
