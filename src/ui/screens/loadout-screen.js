import { renderLoadoutSummary } from '../components/loadout-summary.js';
import { SCREEN_COPY } from '../../data/screen-copy.js';

export function renderLoadoutScreen(state) {
  return `
    <div class="loadout-shell">
      <section class="loadout-column loadout-hero-card">
        <div class="panel-label">${SCREEN_COPY.loadout.label}</div>
        <div class="loadout-hero-copy">
          <div class="loadout-hero-title">${SCREEN_COPY.loadout.title}</div>
          <p>${SCREEN_COPY.loadout.description}</p>
        </div>
      </section>

      <section class="loadout-column">
        <div class="panel-label">角色</div>
        <div class="character-select">
          ${state.characters.map((character) => `
            <button class="character-card ${state.selectedCharacter === character.id ? 'selected' : ''}" data-character="${character.id}">
              <div class="choice-topline">
                <span class="character-emoji">${character.emoji}</span>
                <span class="choice-badge">${state.selectedCharacter === character.id ? '已上场' : '待命'}</span>
              </div>
              <strong>${character.name}</strong>
              <span>${character.summary}</span>
            </button>
          `).join('')}
        </div>
      </section>

      <section class="loadout-column">
        <div class="panel-label">主武器</div>
        <div class="weapon-grid">
          ${state.starterWeapons.map((weapon) => `
            <button class="weapon-card ${state.selectedWeapon === weapon.id ? 'selected' : ''}" data-weapon="${weapon.id}">
              <div class="choice-topline">
                <span class="weapon-emoji">${weapon.emoji}</span>
                <span class="choice-badge">${state.selectedWeapon === weapon.id ? '主打' : '备选'}</span>
              </div>
              <strong>${weapon.name}</strong>
              <span>${weapon.tag}</span>
            </button>
          `).join('')}
        </div>
      </section>

      ${renderLoadoutSummary(state)}
    </div>
  `;
}
