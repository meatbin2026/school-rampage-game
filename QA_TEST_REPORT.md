# 校园暴走游戏 - QA测试报告

**测试日期**: 2025-04-01  
**测试人员**: QA工程师  
**游戏版本**: v1.7.2  

---

## 一、测试概述

本次测试对"校园暴走"HTML5割草游戏进行了全面测试，包括功能测试、性能测试、边界测试和兼容性测试。共发现 **8个Bug**，其中 **2个严重**、**3个中等**、**3个轻微**。

---

## 二、Bug列表（按严重程度排序）

### 🔴 严重级别

#### Bug #1: 双武器系统切换后武器不攻击
- **问题描述**: 当玩家解锁多个武器并尝试使用Q键切换武器时，切换后当前武器无法正常攻击
- **影响范围**: 影响v1.6新增的双武器系统功能
- **复现步骤**:
  1. 开始游戏并解锁至少2个武器
  2. 按Q键切换到副武器
  3. 观察武器攻击情况
- **根本原因**: `getCurrentWeaponId()`函数在双武器启用时返回正确的武器ID，但`updatePlayerAttack()`函数中检查`gameState.dualWeapon.primary`的逻辑存在问题，当主武器为null时导致武器无法攻击
- **修复方案**: 见下方修复代码

#### Bug #2: 连击系统在高连击时导致游戏卡顿
- **问题描述**: 当连击数达到50以上时，游戏帧率明显下降，连击UI更新过于频繁
- **影响范围**: 游戏性能，高连击时的游戏体验
- **复现步骤**:
  1. 进入游戏并快速击杀大量敌人
  2. 保持连击数在50以上
  3. 观察游戏卡顿情况
- **根本原因**: `showComboUI()`函数虽然做了节流处理，但`updateComboSystem()`每次击杀都会调用，且DOM操作和样式更新过于频繁
- **修复方案**: 见下方修复代码

### 🟡 中等级别

#### Bug #3: 移动端虚拟摇杆在某些设备上无法移动
- **问题描述**: 部分移动设备上虚拟摇杆无法正确控制角色移动
- **影响范围**: 移动端用户体验
- **根本原因**: `mobile.js`中`setupJoystick()`函数使用`touchstart`事件监听容器，但某些浏览器对passive事件的处理不同
- **修复方案**: 添加更完善的触摸事件处理

#### Bug #4: 游戏重新开始后部分状态未完全重置
- **问题描述**: 重新开始游戏后，某些游戏状态（如连击数、特殊波次状态）未完全重置
- **影响范围**: 游戏流程
- **根本原因**: `startGame()`函数中缺少对部分v1.6/v1.7新增状态的初始化
- **修复方案**: 已在v1.7.1中部分修复，但仍有遗漏

#### Bug #5: 成就解锁通知可能重复显示
- **问题描述**: 在某些情况下，同一个成就解锁通知会显示多次
- **影响范围**: 用户体验
- **根本原因**: `SaveSystem.checkAchievements()`函数没有检查成就是否已经在本次游戏中解锁
- **修复方案**: 添加已解锁成就缓存

### 🟢 轻微级别

#### Bug #6: 音效开关状态未保存到本地存储
- **问题描述**: 玩家关闭音效后，刷新页面音效又恢复开启状态
- **影响范围**: 用户体验
- **修复方案**: 将音效状态保存到localStorage

#### Bug #7: 暂停按钮在移动端显示不完整
- **问题描述**: 在某些小屏幕设备上，暂停按钮文字被截断
- **影响范围**: UI显示
- **修复方案**: 调整CSS样式

#### Bug #8: 版本号显示不一致
- **问题描述**: index.html中显示v1.5，但version.js中显示v1.7.2
- **影响范围**: 版本识别
- **修复方案**: 统一版本号

---

## 三、修复代码

### Bug #1 修复: 双武器系统

```javascript
// 在 game.js 中修改 getCurrentWeaponId 函数
function getCurrentWeaponId() {
  const dual = gameState.dualWeapon;
  
  // 如果双武器系统未启用或未设置主武器，返回第一个已解锁武器
  if (!CONFIG.dualWeapon.enabled || !dual.primary) {
    for (const [id, data] of Object.entries(gameState.weapons)) {
      if (data.unlocked && data.level > 0) {
        return id;
      }
    }
    return 'textbook'; // 默认武器
  }
  
  // 返回当前激活的武器
  return dual.current === 'primary' ? dual.primary : dual.secondary;
}

// 修改 updatePlayerAttack 函数中的武器选择逻辑
function updatePlayerAttack(deltaTime) {
  const player = gameState.player;
  const currentWeaponId = getCurrentWeaponId();
  
  // 如果没有当前武器，不执行攻击
  if (!currentWeaponId || !gameState.weapons[currentWeaponId]?.unlocked) {
    return;
  }
  
  const weaponData = gameState.weapons[currentWeaponId];
  const weapon = WEAPONS[currentWeaponId];
  
  if (!weapon || weaponData.level <= 0) return;
  
  const fireRate = 1 / (player.attackSpeed * weapon.speed * (player.rageActive ? 2 : 1));
  
  if (!weaponData.lastFire || Date.now() - weaponData.lastFire > fireRate * 1000) {
    fireWeapon(currentWeaponId, weapon, weaponData);
    weaponData.lastFire = Date.now();
  }
}
```

### Bug #2 修复: 连击系统性能优化

```javascript
// 修改 updateComboSystem 函数
function updateComboSystem() {
  const now = Date.now();
  const combo = gameState.combo;
  
  // 检查连击是否中断
  if (combo.count > 0 && now - combo.lastKillTime > CONFIG.comboSystem.timeout) {
    if (combo.count > combo.maxCombo) {
      combo.maxCombo = combo.count;
    }
    if (combo.count >= 10) {
      FloatingText.add(gameState.player.x, gameState.player.y - 50, 
        `连击结束! ${combo.count}`, '#ffa502', 18);
    }
    combo.count = 0;
    combo.bonusMultiplier = 1;
    document.getElementById('comboDisplay')?.classList.remove('active');
  }
  
  // 增加连击数
  combo.count++;
  combo.lastKillTime = now;
  
  // 更新最高连击
  if (combo.count > combo.maxCombo) {
    combo.maxCombo = combo.count;
    gameState.maxCombo = combo.count;
  }
  
  // 计算连击加成
  combo.bonusMultiplier = 1 + getComboExpBonus();
  
  // 显示连击UI（使用节流）
  if (combo.count >= 5) {
    showComboUI();
  }
  
  // 连击里程碑提示（只在特定阈值触发）
  const milestones = [10, 20, 50, 100, 200];
  if (milestones.includes(combo.count)) {
    FloatingText.add(gameState.player.x, gameState.player.y - 60, 
      `${combo.count} 连击! 🔥`, '#ff3838', 24);
    ScreenShake.shake(3, 200);
    AudioSystem.play('combo_milestone');
  }
}

// 优化 showComboUI 函数
let comboUITimer = null;
function showComboUI() {
  const display = document.getElementById('comboDisplay');
  if (!display) return;
  
  const count = gameState.combo.count;
  if (count < 5) return;
  
  // 使用 requestAnimationFrame 优化渲染
  if (comboUITimer) {
    cancelAnimationFrame(comboUITimer);
  }
  
  comboUITimer = requestAnimationFrame(() => {
    const bonus = Math.floor(getComboExpBonus() * 100);
    display.innerHTML = `<span class="combo-count">x${count}</span> <span class="combo-bonus">+${bonus}%EXP</span>`;
    display.classList.add('active');
    
    // 只在里程碑时更新颜色
    if (count === 100 || count === 50 || count === 20 || count === 10) {
      updateComboColor(display, count);
    }
  });
}

function updateComboColor(display, count) {
  if (count >= 100) {
    display.style.color = '#ff3838';
    display.style.textShadow = '0 0 20px #ff3838';
  } else if (count >= 50) {
    display.style.color = '#ffa502';
    display.style.textShadow = '0 0 15px #ffa502';
  } else if (count >= 20) {
    display.style.color = '#2ed573';
    display.style.textShadow = '0 0 10px #2ed573';
  }
}
```

### Bug #3 修复: 移动端摇杆

```javascript
// 在 mobile.js 中修改 setupJoystick 函数
function setupJoystick() {
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
  
  // 触摸移动 - 改进处理
  const handleTouchMove = (e) => {
    if (!this.joystick.active) return;
    
    for (let i = 0; i < e.touches.length; i++) {
      if (e.touches[i].identifier === this.joystick.touchId) {
        e.preventDefault();
        this.updateJoystick(e.touches[i].clientX, e.touches[i].clientY, stick);
        break;
      }
    }
  };
  
  document.addEventListener('touchmove', handleTouchMove, { passive: false });
  
  // 触摸结束
  const handleTouchEnd = (e) => {
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
  
  document.addEventListener('touchend', handleTouchEnd);
  document.addEventListener('touchcancel', handleTouchEnd);
}
```

### Bug #4 修复: 游戏状态重置

```javascript
// 在 startGame 函数中添加以下重置代码
function startGame() {
  // ... 现有代码 ...
  
  // v1.6 重置连击系统
  gameState.combo = {
    count: 0,
    lastKillTime: 0,
    maxCombo: 0,
    bonusMultiplier: 1
  };
  
  // v1.6 重置双武器系统
  gameState.dualWeapon = {
    primary: null,
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
  
  // 重置其他统计
  gameState.kills = 0;
  gameState.totalDamage = 0;
  gameState.maxCombo = 0;
  gameState.eliteKills = 0;
  gameState.bomberKills = 0;
  gameState.timeFreezes = 0;
  gameState.damageTaken = 0;
  gameState.noDamageRun = true;
  gameState.rageKills = 0;
  gameState.bossKilled = 0;
  gameState.weaponsUnlocked = 1;
  
  // ... 其余代码 ...
}
```

### Bug #5 修复: 成就重复显示

```javascript
// 在 SaveSystem 中添加本次游戏已解锁成就缓存
const SaveSystem = {
  // ... 现有代码 ...
  
  // 本次游戏已解锁的成就（防止重复显示）
  sessionUnlockedAchievements: new Set(),
  
  checkAchievements(data, gameStats) {
    const achievements = ACHIEVEMENTS;
    
    for (const [id, achievement] of Object.entries(achievements)) {
      // 检查是否已经在存档中解锁或本次游戏中已显示
      if (!data.achievements[id] && !this.sessionUnlockedAchievements.has(id)) {
        const progress = achievement.check(gameStats, data);
        if (progress >= achievement.target) {
          data.achievements[id] = {
            unlocked: true,
            unlockedAt: Date.now()
          };
          // 标记为本次游戏已解锁
          this.sessionUnlockedAchievements.add(id);
          showAchievementUnlock(achievement);
        }
      }
    }
  },
  
  // 重置会话缓存（游戏开始时调用）
  resetSessionCache() {
    this.sessionUnlockedAchievements.clear();
  }
};

// 在 startGame 中调用重置
function startGame() {
  SaveSystem.resetSessionCache();
  // ... 其余代码 ...
}
```

### Bug #6 修复: 音效状态保存

```javascript
// 在 AudioSystem 中添加状态保存
const AudioSystem = {
  enabled: true,
  volume: 0.5,
  ctx: null,
  
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
  
  // 切换静音时保存
  toggleMute() {
    this.enabled = !this.enabled;
    this.saveSettings();
    this.updateMuteButton();
    return this.enabled;
  },
  
  updateMuteButton() {
    const btn = document.getElementById('muteBtn');
    if (btn) {
      btn.textContent = this.enabled ? '🔊 音效: 开' : '🔇 音效: 关';
    }
  },
  
  init() {
    this.loadSettings();
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
      this.enabled = false;
    }
    this.updateMuteButton();
  }
};
```

### Bug #7 修复: 移动端暂停按钮样式

```css
/* 在 index.html 的 style 部分添加 */
@media (max-width: 768px) {
  #pauseBtn {
    padding: 6px 10px;
    font-size: 12px;
    min-width: 50px;
  }
}
```

### Bug #8 修复: 版本号统一

```html
<!-- 修改 index.html 中的版本显示 -->
<div class="version-info" style="margin: 15px 0; font-size: 14px; color: var(--text-dim); cursor: pointer;" onclick="VersionManager.showChangelog()">
  <span>当前版本: <strong class="version-display" style="color: var(--accent);">v1.7.2</strong></span>
  <span style="margin-left: 10px; font-size: 12px; opacity: 0.6;">点击查看更新日志</span>
</div>

<!-- 修改底部的版本显示 -->
<div class="version-display" id="versionDisplay" onclick="VersionManager.showChangelog()">v1.7.2</div>
```

---

## 四、性能优化建议

1. **对象池优化**: 子弹、敌人、粒子等频繁创建销毁的对象应使用对象池
2. **渲染优化**: 使用离屏Canvas进行批量渲染
3. **碰撞检测优化**: 已实现空间分割，可进一步优化为四叉树
4. **内存管理**: 定期清理不再使用的DOM元素引用

---

## 五、测试结论

### 总体评价
游戏整体质量良好，核心玩法稳定，但存在以下需要改进的地方：

1. **双武器系统**存在功能性Bug，需要优先修复
2. **连击系统**在高负载时性能下降，需要优化
3. **移动端适配**需要进一步完善
4. **状态管理**需要更加严谨，避免状态残留

### 修复优先级
1. 🔴 高优先级: Bug #1, Bug #2
2. 🟡 中优先级: Bug #3, Bug #4, Bug #5
3. 🟢 低优先级: Bug #6, Bug #7, Bug #8

### 建议
1. 建议增加自动化测试，特别是状态重置相关的测试
2. 建议增加性能监控，及时发现性能瓶颈
3. 建议在发布前进行更全面的兼容性测试

---

**报告生成时间**: 2025-04-01 11:30  
**测试完成状态**: ✅ 已完成
