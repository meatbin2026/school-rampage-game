export function renderHomeSpotlight(state) {
  return `
    <section class="info-card spotlight spotlight-card">
      <div class="spotlight-head">
        <div class="spotlight-mode">出击预告</div>
        <div class="spotlight-badge">第 10 波见 Boss</div>
      </div>
      <div class="spotlight-weapon">${state.selectedWeaponLabel} + 副武器补刀</div>
      <div class="build-tags">
        ${state.buildTags.map((tag) => `<span class="build-tag">${tag}</span>`).join('')}
      </div>
      <div class="spotlight-summary">${state.selectedCharacterLabel}开局，先站稳前两波，再把 Build 拉起来。</div>
      <div class="threat-strip">
        ${(state.enemyPreview || []).slice(0, 4).map((enemy) => `
          <span class="threat-chip">${enemy.emoji} ${enemy.name}</span>
        `).join('')}
      </div>
      <div class="spotlight-footer">推荐先用 ${state.selectedWeaponLabel} 开线，攒经验球，10 波前准备接 Boss。</div>
    </section>
  `;
}
