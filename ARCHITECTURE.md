# 校园暴走项目架构说明

## 1. 项目形态

这是一个纯前端 HTML5 单页游戏项目，没有构建流程、没有模块打包器、没有后端依赖。

- 入口文件: `index.html`
- 核心逻辑: `js/game.js`
- 辅助模块:
  - `js/mobile.js`
  - `js/tutorial.js`
  - `js/version.js`
- 数据存储: 浏览器 `localStorage`

当前项目更接近“原型已成长为完整产品”的结构：功能已经很多，但仍以全局状态和单文件逻辑为主。

## 2. 运行结构

页面加载后由 `window.addEventListener('load', init)` 启动。

主启动流程:

1. `init()`
2. 初始化背景效果、音频、尺寸、输入事件、UI 事件
3. 启动 `requestAnimationFrame(gameLoop)`
4. `gameLoop()` 持续调用 `update(deltaTime)` 与 `render()`

核心循环职责:

- `update(deltaTime)`:
  - 更新时间缩放、屏幕震动、状态效果
  - 更新玩家移动与攻击
  - 更新子弹、敌人、Boss、道具、经验球、粒子
  - 更新波次与特殊事件
  - 更新 HUD

- `render()`:
  - 清屏与相机跟随
  - 绘制背景、网格、经验球、道具、粒子、敌人、Boss、玩家
  - 绘制慢镜头等屏幕级特效

## 3. 主要模块

### `index.html`

承担三类职责:

- 页面结构: 开始界面、HUD、移动端控件、升级弹窗、结算弹窗
- 全部 CSS: 当前样式基本都写在内联 `<style>` 中
- 脚本装配: 依次加载版本、移动端、教程、主游戏逻辑

### `js/game.js`

这是当前项目的“游戏内核”，内部混合了以下层次:

- 配置常量: `CONFIG`
- 数据表:
  - `CHARACTERS`
  - `ENEMY_TYPES`
  - `BOSSES`
  - `WEAPONS`
  - `ITEMS`
  - `UPGRADES`
- 全局运行状态: `gameState`
- 基础系统:
  - `ScreenShake`
  - `DeathAnimation`
  - `SlowMotion`
  - `VisualEffects`
  - `FloatingText`
  - `BackgroundEffects`
- 成长与存档:
  - `SaveSystem`
  - `WeaponMastery`
  - `TalentTree`
  - `Leaderboard`
  - `TitleSystem`
  - `ACHIEVEMENTS`
  - `TITLES`
- 音频:
  - `AudioSystem`
  - `BGM`
- 游戏流程:
  - `startGame()`
  - `gameOver()`
  - `showStartScreen()`
- 战斗逻辑:
  - 玩家移动/攻击
  - 子弹更新
  - 敌人生成与更新
  - Boss 行为
  - 经验与升级
  - 道具与效果
  - 波次、特殊波次、里程碑

### `js/mobile.js`

负责移动端输入兼容:

- 设备识别
- 虚拟摇杆
- 暴走/暂停触摸按钮
- 微信音频解锁
- 全局触摸防滚动、防双击缩放

### `js/tutorial.js`

负责首次玩家引导:

- 8 步教程配置
- `localStorage` 持久化完成状态
- 引导遮罩、高亮、完成提示

### `js/version.js`

负责版本信息显示:

- 当前版本号
- 更新历史
- 更新日志弹窗渲染

## 4. 数据流

### 运行时数据

运行时几乎所有状态都聚合在 `gameState`:

- 玩家状态
- 武器状态
- 敌人、子弹、粒子、经验球
- Boss、危险区域、特殊波次
- 道具效果
- 局内统计

这是当前最重要的共享状态中心。

### 持久化数据

持久化主要来自两个地方:

- `SaveSystem`
  - 最高分
  - 总击杀
  - 总游戏次数
  - 成就
  - 武器精通
  - 天赋点与天赋等级
  - 最佳记录
- `Leaderboard`
  - 本地排行榜前 10

## 5. 这次修复涉及的稳定性风险点

本轮检查确认了几个典型的运行时崩点:

- 特殊波次结束时调用不存在的 `checkLevelUp()`，会直接中断游戏循环
- Boss 掉落使用 `spawnItemAt()` 生成的道具字段不完整，渲染脉冲半径时存在异常风险
- 第 30 波 Boss 召唤的食物小兵不是标准敌人结构，渲染和击杀结算会崩
- 多处调用不存在的 `AudioSystem.play(...)`，一旦触发相关事件就会报错
- 开始界面的静音按钮调用 `AudioSystem.toggleMute()`，但原实现不存在该方法

## 6. 当前结构的优点与代价

优点:

- 没有构建成本，直接打开就能跑
- 数据、规则和渲染集中，改小功能很快
- 适合快速迭代玩法

代价:

- `js/game.js` 职责过多，阅读和回归成本高
- 很多系统通过全局状态和 DOM 直接耦合
- 运行时类型不统一时，很容易在后期事件里出现“打到某个波次才崩”的问题

## 7. 后续推荐拆分顺序

如果后续继续维护，建议按下面顺序拆，不要一次性大重构:

1. 先拆“纯数据表”
   - 角色、武器、敌人、Boss、道具、升级项
2. 再拆“运行系统”
   - 音频
   - 存档
   - 特效
   - 移动端输入
3. 最后拆“战斗逻辑”
   - 玩家
   - 子弹
   - 敌人
   - Boss
   - 波次系统

最小可行目标是先把 `js/game.js` 拆成:

- `data/`
- `systems/`
- `entities/`
- `ui/`
- `core/`

这样后续排查性能和崩溃问题会轻松很多。
