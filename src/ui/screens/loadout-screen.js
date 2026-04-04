import { renderLoadoutSummary } from '../components/loadout-summary.js';
import { SCREEN_COPY } from '../../data/screen-copy.js';

export function renderLoadoutScreen(state) {
  return `
    <div class="loadout-shell">
      <section class="loadout-column loadout-hero-card">
        <div class="panel-label">${SCREEN_COPY.loadout.label}</div>
        <div class="loadout-hero-strip">铃声响起 · 操场清场 · 只带主武器进场</div>
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
              <div class="choice-flag">${state.selectedCharacter === character.id ? '上场中' : '待命中'}</div>
              <div class="choice-topline fighter-topline">
                <span class="character-emoji">${character.emoji}</span>
                <span class="choice-badge">${character.roleTag || character.summary}</span>
              </div>
              <div class="choice-title-row">
                <strong>${character.name}</strong>
                <span class="choice-mini-tag">${character.style || '灵活开打'}</span>
              </div>
              <span class="choice-summary">${character.summary}</span>
              <div class="choice-chip-row">
                <span class="choice-chip accent">${character.perk || '随时开冲'}</span>
                <span class="choice-chip">怒气 ${character.rageBuild}x</span>
              </div>
              <div class="choice-meter-row">
                <span>血 ${character.hp}</span>
                <span>攻 ${character.damage}</span>
                <span>速 ${character.attackSpeed}</span>
              </div>
            </button>
          `).join('')}
        </div>
      </section>

      <section class="loadout-column">
        <div class="panel-label">主武器</div>
        <div class="weapon-grid">
          ${state.starterWeapons.map((weapon) => `
            <button class="weapon-card ${state.selectedWeapon === weapon.id ? 'selected' : ''}" data-weapon="${weapon.id}">
              <div class="choice-flag">${state.selectedWeapon === weapon.id ? '主打' : '备选'}</div>
              <div class="choice-topline fighter-topline">
                <span class="weapon-emoji">${weapon.emoji}</span>
                <span class="choice-badge">${weapon.lane || weapon.tag}</span>
              </div>
              <div class="choice-title-row">
                <strong>${weapon.name}</strong>
                <span class="choice-mini-tag">${weapon.impact || '火力'}</span>
              </div>
              <span class="choice-summary">${weapon.tag}</span>
              <div class="choice-chip-row">
                <span class="choice-chip accent">${weapon.rhythm || '标准节奏'}</span>
                <span class="choice-chip">倍率 ${weapon.damage}x</span>
              </div>
              <div class="choice-meter-row">
                <span>伤害 ${weapon.damage}</span>
                <span>节奏 ${weapon.speed}</span>
                <span>上限 ${weapon.maxLevel}</span>
              </div>
            </button>
          `).join('')}
        </div>
      </section>

      ${renderLoadoutSummary(state)}
    </div>
  `;
}
