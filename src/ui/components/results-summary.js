import { buildResultsInsights } from '../../app/derived/results-insights.js';
import { getItemById } from '../../data/item-catalog.js';
import { getAchievementById } from '../../data/achievement-catalog.js';
import { getTitleById } from '../../data/title-catalog.js';

export function renderResultsSummary(result, state) {
  const insights = buildResultsInsights(result, state);
  const pickedItems = (result.items || [])
    .map((id) => getItemById(id))
    .filter(Boolean)
    .slice(0, 4);
  const unlockedAchievements = (insights.newAchievements || [])
    .map((id) => getAchievementById(id))
    .filter(Boolean)
    .slice(0, 4);
  const unlockedTitles = (insights.newTitles || [])
    .map((id) => getTitleById(id))
    .filter(Boolean)
    .slice(0, 3);

  return `
    <div class="panel-label">街机战报</div>
    <div class="results-hero">
      <div class="results-title">${state.selectedCharacterLabel} 完成本局出击</div>
      <p>主武器 ${state.selectedWeaponLabel} 贯穿全局，下面是这次闯关的核心数据。</p>
    </div>
    <div class="summary-head">
      <span class="summary-title">${state.selectedCharacterLabel}</span>
      <span class="summary-weapon">${insights.performanceTier}</span>
    </div>
    <div class="results-grid">
      <div><span>存活时间</span><strong>${result.time}</strong></div>
      <div><span>击败敌人</span><strong>${result.kills}</strong></div>
      <div><span>最高等级</span><strong>${result.level}</strong></div>
      <div><span>波次</span><strong>第${result.wave}波</strong></div>
    </div>
    <div class="results-build">
      <div class="lobby-title">本局构筑</div>
      <div class="results-build-grid">
        <div class="boss-card">
          <div class="boss-wave">主武器</div>
          <div class="boss-name">${insights.buildSummary.primary?.emoji || '🎯'} ${insights.buildSummary.primary?.name || state.selectedWeaponLabel}</div>
          <div class="boss-title">本局核心输出</div>
        </div>
        <div class="boss-card">
          <div class="boss-wave">副武器</div>
          <div class="boss-name">${insights.buildSummary.secondary ? `${insights.buildSummary.secondary.emoji} ${insights.buildSummary.secondary.name}` : '未形成'}</div>
          <div class="boss-title">已解锁武器 ${insights.buildSummary.unlockedCount}</div>
        </div>
      </div>
    </div>
    <div class="results-build">
      <div class="lobby-title">Boss 进度</div>
      ${insights.bossCards.length ? `
        <div class="boss-grid">
          ${insights.bossCards.map((boss) => `
            <div class="boss-card">
              <div class="boss-wave">Wave ${boss.wave}</div>
              <div class="boss-name">${boss.emoji} ${boss.name}</div>
              <div class="boss-title">${boss.title}</div>
            </div>
          `).join('')}
        </div>
      ` : '<p class="panel-copy">这局还没打到 Boss 高潮段，下一局可以继续往第 10 波冲。</p>'}
    </div>
    ${pickedItems.length ? `
      <div class="results-loot">
        <div class="lobby-title">本局拾取</div>
        <div class="loot-strip">
          ${pickedItems.map((item) => `<span class="threat-chip">${item.emoji} ${item.name}</span>`).join('')}
        </div>
      </div>
    ` : ''}
    ${(unlockedAchievements.length || unlockedTitles.length) ? `
      <div class="results-loot">
        <div class="lobby-title">本局成长</div>
        <div class="loot-strip">
          ${unlockedAchievements.map((achievement) => `<span class="threat-chip">${achievement.emoji} ${achievement.name}</span>`).join('')}
          ${unlockedTitles.map((title) => `<span class="threat-chip">${title.emoji} ${title.name}</span>`).join('')}
        </div>
      </div>
    ` : ''}
    <p class="panel-copy">${insights.highlight}</p>
    ${insights.talentPointsEarned ? `<p class="panel-copy">本局额外拿到 <strong>${insights.talentPointsEarned}</strong> 点天赋点。</p>` : ''}
    <p class="panel-copy">下一步建议：<strong>${insights.nextStep}</strong></p>
  `;
}
