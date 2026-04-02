function emit(name, detail = {}) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

export function bindLegacyBridge() {
  window.LegacyGameBridge = {
    showHome() {
      emit('schoolrampage:scene', { screen: 'home' });
    },
    showBattle(detail = {}) {
      emit('schoolrampage:scene', { screen: 'battle', ...detail });
    },
    showResults(detail = {}) {
      emit('schoolrampage:gameover', detail);
    }
  };
}
