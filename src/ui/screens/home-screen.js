import { HOME_COPY } from '../../data/home-copy.js';
import { SCREEN_COPY } from '../../data/screen-copy.js';
import { renderHomeSpotlight } from '../components/home-spotlight.js';

export function renderHomeScreen(state) {
  return `
    <div class="mobile-home-shell">
      <section class="mobile-title-card">
        <div class="mobile-title-top">
          <div class="eyebrow">${HOME_COPY.eyebrow}</div>
          <button class="mini-ghost-btn" id="muteBtn">🔊</button>
        </div>

        <div class="mobile-title-art">
          <div class="poster-burst"></div>
          <div class="poster-character">${state.selectedCharacter === 'badboy' ? '😎' : state.selectedCharacter === 'nerd' ? '🤓' : '🏃'}</div>
          <div class="poster-copy">
            <h1>${HOME_COPY.title}</h1>
            <p>${HOME_COPY.description}</p>
          </div>
        </div>

        <div class="home-quick-stats">
          <div class="quick-pill">
            <span>角色</span>
            <strong>${state.selectedCharacterLabel}</strong>
          </div>
          <div class="quick-pill">
            <span>主武器</span>
            <strong>${state.selectedWeaponLabel}</strong>
          </div>
          <div class="quick-pill">
            <span>风格</span>
            <strong>${state.buildTags[0]}</strong>
          </div>
        </div>

        <button class="arcade-button primary mobile-start-btn" data-action="go-loadout">开始游戏</button>
        <p class="mobile-home-tip">${SCREEN_COPY.home.tip}</p>
      </section>

      ${renderHomeSpotlight(state)}

      <section class="info-card compact-card">
        <div class="panel-label">生涯卡</div>
        <div id="saveStats"></div>
      </section>

      <section class="info-card compact-card">
        <div class="panel-label">勋章墙</div>
        <div class="achievement-grid" id="achievementsList"></div>
      </section>

      <section class="info-card compact-card">
        <div class="panel-label">街机榜</div>
        <div id="leaderboardList"></div>
      </section>
    </div>
  `;
}
