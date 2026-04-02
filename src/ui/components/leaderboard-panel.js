export function renderLeaderboardPanel(entries) {
  if (!entries?.length) {
    return '<p class="panel-copy">还没有上榜战绩，先打一局冲进榜单。</p>';
  }

  return `
    <div class="achievement-overview">
      <div class="lobby-title-row">
        <div>
          <div class="lobby-title">街机榜</div>
          <div class="lobby-subtitle">本地前 5 名出击记录</div>
        </div>
        <div class="lobby-rank-chip">TOP ${entries.length}</div>
      </div>
    </div>
    <div class="leaderboard-list">
      ${entries.map((entry) => `
        <div class="leaderboard-row">
          <div class="leaderboard-rank">#${entry.rank}</div>
          <div class="leaderboard-score">
            <strong>${entry.score}</strong>
            <span>${entry.kills} 击败 · 第${entry.wave}波 · Lv.${entry.level}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}
