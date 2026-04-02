export function renderMetaStatsPanel(metaStats) {
  if (!metaStats) {
    return '<p class="panel-copy">正在读取存档数据...</p>';
  }

  return `
    <div class="lobby-summary">
      <div class="lobby-title-row">
        <div>
          <div class="lobby-title">生涯卡</div>
          <div class="lobby-subtitle">记录你的暴走学园传说</div>
        </div>
        <div class="lobby-rank-chip">${metaStats.currentTitle.emoji} ${metaStats.currentTitle.name}</div>
      </div>
    </div>
    <div class="build-tags">
      ${metaStats.progression.map((item) => `<span class="build-tag">${item.label} ${item.value}</span>`).join('')}
    </div>
    <div class="save-stats save-stats-mobile">
      ${metaStats.stats.map((item) => `
        <div class="stat-item ${item.featured ? 'stat-item-featured' : ''}">
          <span class="stat-label">${item.label}</span>
          <span class="stat-value">${item.value}</span>
        </div>
      `).join('')}
    </div>
  `;
}
