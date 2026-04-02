export function renderAchievementWall(showcase) {
  if (!showcase) {
    return '<p class="panel-copy">正在读取成就数据...</p>';
  }

  return `
    <div class="achievement-overview">
      <div class="lobby-title-row">
        <div>
          <div class="lobby-title">勋章墙</div>
          <div class="lobby-subtitle">解锁更多称号和开局派头</div>
        </div>
        <div class="lobby-rank-chip">${showcase.unlockedCount}/${showcase.totalCount}</div>
      </div>
      <div class="panel-copy">当前收藏进度 ${showcase.progress}% ，继续冲波次和击杀纪录就会亮更多勋章。</div>
    </div>
    <div class="medal-grid">
      ${showcase.items.map((item) => `
        <div class="medal-card ${item.unlocked ? 'unlocked' : 'locked'}">
          <div class="medal-emoji">${item.unlocked ? item.emoji : '🔒'}</div>
          <div class="medal-name">${item.name}</div>
        </div>
      `).join('')}
    </div>
  `;
}
