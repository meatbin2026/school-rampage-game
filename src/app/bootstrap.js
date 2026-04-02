import { createStore } from './state/store.js';
import { createRouter } from './router.js';
import { DESIGN_TOKENS } from './config/design-tokens.js';
import { bindLegacyBridge } from '../bridge/legacy-game-bridge.js';
import { getLegacySnapshot } from '../bridge/legacy-meta-data.js';
import { DEFAULT_SHELL_STATE } from '../data/shell-state.js';
import { buildSelectionDetails } from './derived/loadout-insights.js';
import { refreshHomeMetaPanels } from './home-meta-panels.js';
import { renderResultsSummary } from '../ui/components/results-summary.js';
import { renderHomeScreen } from '../ui/screens/home-screen.js';
import { renderLoadoutScreen } from '../ui/screens/loadout-screen.js';
import { renderBattleScreen } from '../ui/screens/battle-screen.js';
import { renderResultsScreen } from '../ui/screens/results-screen.js';

const store = createStore(DEFAULT_SHELL_STATE);

const router = createRouter(store);
let battleMounted = false;
let resultsMounted = false;

function syncDerivedSelectionState() {
  const currentState = store.getState();
  const derived = buildSelectionDetails(currentState);
  store.setState(derived);
}

function refreshMetaPanels() {
  refreshHomeMetaPanels(getLegacySnapshot());
}

function syncBodyScene(screen) {
  document.body.dataset.scene = screen;
}

function mountScreens(state) {
  const homeTarget = document.getElementById('chromeHomeContent');
  const loadoutTarget = document.getElementById('chromeLoadoutContent');
  const battleTarget = document.getElementById('hud');
  const resultsTarget = document.getElementById('chromeResultsContent');

  if (homeTarget) {
    homeTarget.innerHTML = renderHomeScreen(state);
  }
  if (loadoutTarget) {
    loadoutTarget.innerHTML = renderLoadoutScreen(state);
  }
  if (battleTarget && !battleMounted) {
    battleTarget.innerHTML = renderBattleScreen(state);
    battleMounted = true;
  }
  if (resultsTarget && !resultsMounted) {
    resultsTarget.innerHTML = renderResultsScreen(state);
    resultsMounted = true;
  }
}

function updatePanels(state) {
  const homePanel = document.getElementById('chromeHomePanel');
  const loadoutPanel = document.getElementById('chromeLoadoutPanel');
  if (homePanel) homePanel.hidden = state.screen !== 'home';
  if (loadoutPanel) loadoutPanel.hidden = state.screen !== 'loadout';
  syncBodyScene(state.screen);
}

function bindStaticActions() {
  document.addEventListener('click', (event) => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'go-loadout') {
      router.go('loadout');
    }
    if (action === 'go-home') {
      router.go('home');
    }

    const weapon = event.target.closest('[data-weapon]')?.dataset.weapon;
    if (weapon) {
      store.setState({ selectedWeapon: weapon });
      requestAnimationFrame(syncDerivedSelectionState);
    }

    const character = event.target.closest('[data-character]')?.dataset.character;
    if (character) {
      store.setState({ selectedCharacter: character });
      requestAnimationFrame(syncDerivedSelectionState);
    }
  });
}

function listenToLegacyEvents() {
  window.addEventListener('schoolrampage:meta-updated', () => {
    syncDerivedSelectionState();
    refreshMetaPanels();
  });

  window.addEventListener('schoolrampage:scene', (event) => {
    if (!event.detail?.screen) return;
    syncBodyScene(event.detail.screen);
    if (event.detail.screen === 'home') {
      router.go('home');
      syncDerivedSelectionState();
      refreshMetaPanels();
    }
  });

  window.addEventListener('schoolrampage:gameover', (event) => {
    syncBodyScene('results');
    const panel = document.getElementById('resultsPanel');
    const state = store.getState();
    if (panel && event.detail) {
      panel.innerHTML = renderResultsSummary(event.detail, state);
    }
    refreshMetaPanels();
  });
}

function applyTheme() {
  document.documentElement.style.setProperty('--shell-ink', DESIGN_TOKENS.colors.ink);
  document.documentElement.style.setProperty('--shell-panel', DESIGN_TOKENS.colors.panel);
  document.documentElement.style.setProperty('--shell-panel-alt', DESIGN_TOKENS.colors.panelAlt);
}

function boot() {
  bindLegacyBridge();
  applyTheme();
  syncDerivedSelectionState();
  mountScreens(store.getState());
  updatePanels(store.getState());
  bindStaticActions();
  listenToLegacyEvents();
  refreshMetaPanels();

  store.subscribe((state) => {
    mountScreens(state);
    updatePanels(state);
    if (state.screen === 'home') {
      refreshMetaPanels();
    }
  });

  window.addEventListener('load', () => {
    syncDerivedSelectionState();
    refreshMetaPanels();
  });
}

window.AppShell = {
  getSelectedLoadout() {
    const state = store.getState();
    return {
      character: state.selectedCharacter,
      primaryWeapon: state.selectedWeapon
    };
  },
  goHome() {
    router.go('home');
  }
};

boot();
