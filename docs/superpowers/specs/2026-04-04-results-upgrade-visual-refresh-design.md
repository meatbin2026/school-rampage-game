## Results And Upgrade Visual Refresh

### Goal
Make the end-of-run and level-up moments feel rewarding and arcade-like instead of plain information modals.

### Direction
- Treat the results panel like a battle report, with clearer rank emphasis and a stronger "run complete" mood.
- Treat upgrade choices like reward cards, not a plain list of text options.
- Keep the existing game logic intact and limit changes to structure, copy, and styling.

### Experience Changes
- Results preview and live battle report both gain a story strip and stronger rank banner treatment.
- The legacy game-over modal becomes visually aligned with the rebuilt shell.
- Upgrade choices become card-based, with category badges and more obvious reward framing.

### Scope
- Update results copy and results screen structure.
- Update legacy modal markup in `index.html`.
- Update upgrade card HTML generated from `js/game.js`.
- Add shared visual styles for reward cards and battle report panels.
