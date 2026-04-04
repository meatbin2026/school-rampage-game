import { SCREEN_COPY } from '../../data/screen-copy.js';

export function renderBattleScreen(state) {
  const featuredItems = state.featuredItems || [];

  return `
    <div class="battle-chrome">
      <div class="hud-cluster hud-cluster-left">
        <div class="battle-banner battle-banner-live">
          <div class="battle-live-row">
            <div class="battle-alert">${SCREEN_COPY.battle.live}</div>
            <div class="battle-warning">${SCREEN_COPY.battle.alert}</div>
          </div>
          <div class="battle-mode">${SCREEN_COPY.battle.mode}</div>
          <div class="battle-tip">${SCREEN_COPY.battle.tip}</div>
        </div>
        <div class="stat-bar hp-stat-bar"><span class="stat-icon">❤️</span><span class="stat-label">生命</span><div class="bar-container"><div class="bar-fill hp-fill" id="hpBar"></div></div><span class="stat-value" id="hpText">100/100</span></div>
        <div class="stat-bar exp-stat-bar"><span class="stat-icon">⚡</span><span class="stat-label">经验</span><div class="bar-container"><div class="bar-fill exp-fill" id="expBar"></div></div><span class="stat-value" id="levelText">Lv.1</span></div>
        <div class="stat-bar rage-row rage-stat-bar" id="rageBarContainer" style="opacity:0;"><span class="stat-icon">🔥</span><span class="stat-label">怒气</span><div class="bar-container"><div class="bar-fill rage-fill" id="rageBar"></div></div><span class="stat-value" id="rageText">0%</span></div>
      </div>

      <div class="hud-cluster hud-cluster-right">
        <div class="pill level-pill combat-pill" id="levelPill">Lv.1</div>
        <div class="pill wave-pill combat-pill" id="wavePill">第1波</div>
        <div class="pill combat-pill" id="timePill">00:00</div>
        <div class="pill combat-pill" id="killPill">击败: 0</div>
        <button class="pill btn combat-pill combat-pill-action" id="pauseBtn">暂停</button>
      </div>
    </div>

    <div class="build-strip" id="skillBar" style="display:none;">
      <div class="build-strip-label">武装链</div>
      <div class="build-slot"><span class="slot-label">主武器</span><div class="skill-slot" id="skill1"></div></div>
      <div class="build-slot"><span class="slot-label">副武器</span><div class="skill-slot" id="skill2"></div></div>
      <div class="build-slot"><span class="slot-label">联动</span><div class="skill-slot" id="skill3"></div></div>
      <div class="build-slot"><span class="slot-label">特效</span><div class="skill-slot" id="skill4"></div></div>
    </div>

    <div class="item-rack">
      <div class="item-slot">
        <div class="item-slot-label">战场补给</div>
        <span>${SCREEN_COPY.battle.itemLabel}</span>
        <strong>${SCREEN_COPY.battle.itemValue}</strong>
        <div class="item-mini-list">
          ${featuredItems.map((item) => `<span>${item.emoji} ${item.name}</span>`).join('')}
        </div>
      </div>
      <div class="item-slot item-slot-secondary"><div class="item-slot-label">武器构筑</div><span>${SCREEN_COPY.battle.buildLabel}</span><strong>${SCREEN_COPY.battle.buildValue}</strong></div>
    </div>
  `;
}
