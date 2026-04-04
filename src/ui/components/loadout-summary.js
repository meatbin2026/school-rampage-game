export function renderLoadoutSummary(state) {
  return `
    <section class="loadout-column">
      <div class="panel-label">出击摘要</div>
      <div class="build-summary-card" id="selectedLoadoutSummary">
        <div class="summary-alert-strip">MISSION READY · WAVE 10 BOSS · RANDOM DROP ONLY</div>
        <div class="summary-head">
          <div>
            <div class="summary-title">${state.selectedCharacterLabel}</div>
            <div class="lobby-subtitle">本局主武器：${state.selectedWeaponLabel}</div>
          </div>
          <span class="summary-weapon">${state.selectedWeaponLabel}</span>
        </div>
        <p>${state.loadoutSummary}</p>
        <div class="build-tags">
          ${state.buildTags.map((tag) => `<span class="build-tag">${tag}</span>`).join('')}
        </div>
        <div class="loadout-stats">
          <div class="stat-chip"><span>生命</span><strong>${state.characterStats.hp}</strong></div>
          <div class="stat-chip"><span>攻击</span><strong>${state.characterStats.damage}</strong></div>
          <div class="stat-chip"><span>攻速</span><strong>${state.characterStats.attackSpeed}</strong></div>
          <div class="stat-chip"><span>武器倍率</span><strong>${state.weaponStats.damage}</strong></div>
        </div>
        <ul class="summary-list">
          ${state.loadoutBullets.map((item) => `<li>${item}</li>`).join('')}
        </ul>
        <div class="boss-preview">
          <div class="lobby-title-row">
            <div>
              <div class="lobby-title">Boss 预告</div>
              <div class="lobby-subtitle">第 10 / 20 / 30 波会迎来压轴战</div>
            </div>
          </div>
          <div class="boss-grid">
            ${(state.bossPreview || []).map((boss) => `
              <div class="boss-card">
                <div class="boss-wave">Wave ${boss.wave}</div>
                <div class="boss-name">${boss.emoji} ${boss.name}</div>
                <div class="boss-title">${boss.title}</div>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="hero-actions">
          <button class="arcade-button ghost" data-action="go-home">返回大厅</button>
          <button class="arcade-button primary" id="startBtn">开始战斗</button>
        </div>
      </div>
    </section>
  `;
}
