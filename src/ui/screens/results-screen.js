import { SCREEN_COPY } from '../../data/screen-copy.js';

export function renderResultsScreen() {
  return `
    <div class="results-summary" id="resultsPanel">
      <div class="panel-label">${SCREEN_COPY.results.label}</div>
      <div class="results-hero">
        <div class="results-title">${SCREEN_COPY.results.title}</div>
        <p>${SCREEN_COPY.results.description}</p>
      </div>
      <div class="results-grid">
        <div><span>主武器</span><strong>待结算</strong></div>
        <div><span>副武器</span><strong>战斗中形成</strong></div>
        <div><span>成长</span><strong>精通 / 成就 / 称号</strong></div>
        <div><span>下一步</span><strong>再来一局</strong></div>
      </div>
    </div>
  `;
}
