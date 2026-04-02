export function renderHomeSpotlight(state) {
  return `
    <section class="info-card spotlight spotlight-card">
      <div class="spotlight-head">
        <div class="spotlight-mode">推荐出击</div>
        <div class="spotlight-badge">${state.selectedCharacterLabel}</div>
      </div>
      <div class="spotlight-weapon">${state.selectedWeaponLabel} + 自动副武器</div>
      <div class="build-tags">
        ${state.buildTags.map((tag) => `<span class="build-tag">${tag}</span>`).join('')}
      </div>
      <p class="panel-copy">${state.homeSummary}</p>
      <div class="threat-strip">
        ${(state.enemyPreview || []).slice(0, 4).map((enemy) => `
          <span class="threat-chip">${enemy.emoji} ${enemy.name}</span>
        `).join('')}
      </div>
      <div class="spotlight-footer">推荐先用 ${state.selectedWeaponLabel} 起手，清掉前两波再补流派核心。</div>
    </section>
  `;
}
