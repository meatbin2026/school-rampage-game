export function createRouter(store) {
  return {
    go(screen) {
      store.setState({ screen });
    }
  };
}
