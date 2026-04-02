import { SCREEN_COPY } from '../../data/screen-copy.js';

export function renderBattleScreen(state) {
  const featuredItems = state.featuredItems || [];

  return `
    <div class="battle-chrome">
      <div class="hud-cluster hud-cluster-left">
        <div class="battle-banner">
          <div class="battle-mode">${SCREEN_COPY.battle.mode}</div>
          <div class="battle-tip">${SCREEN_COPY.battle.tip}</div>
        </div>
        <div class="stat-bar"><span class="stat-label">HP</span><div class="bar-container"><div class="bar-fill hp-fill" id="hpBar"></div></div><span class="stat-value" id="hpText">100/100</span></div>
        <div class="stat-bar"><span class="stat-label">EXP</span><div class="bar-container"><div class="bar-fill exp-fill" id="expBar"></div></div><span class="stat-value" id="levelText">Lv.1</span></div>
        <div class="stat-bar rage-row" id="rageBarContainer" style="opacity:0;"><span class="stat-label">怒</span><div class="bar-container"><div class="bar-fill rage-fill" id="rageBar"></div></div><span class="stat-value" id="rageText">0%</span></div>
      </div>

      <div class="hud-cluster hud-cluster-right">
        <div class="pill level-pill" id="levelPill">Lv.1</div>
        <div class="pill wave-pill" id="wavePill">第1波</div>
        <div class="pill" id="timePill">00:00</div>
        <div class="pill" id="killPill">击败: 0</div>
        <button class="pill btn" id="pauseBtn">暂停</button>
      </div>
    </div>

    <div class="build-strip" id="skillBar" style="display:none;">
      <div class="build-slot"><span class="slot-label">主武器</span><div class="skill-slot" id="skill1"></div></div>
      <div class="build-slot"><span class="slot-label">副武器</span><div class="skill-slot" id="skill2"></div></div>
      <div class="build-slot"><span class="slot-label">联动</span><div class="skill-slot" id="skill3"></div></div>
      <div class="build-slot"><span class="slot-label">特效</span><div class="skill-slot" id="skill4"></div></div>
    </div>

    <div class="item-rack">
      <div class="item-slot">
        <span>${SCREEN_COPY.battle.itemLabel}</span>
        <strong>${SCREEN_COPY.battle.itemValue}</strong>
        <div class="item-mini-list">
          ${featuredItems.map((item) => `<span>${item.emoji} ${item.name}</span>`).join('')}
        </div>
      </div>
      <div class="item-slot"><span>${SCREEN_COPY.battle.buildLabel}</span><strong>${SCREEN_COPY.battle.buildValue}</strong></div>
    </div>
  `;
}
