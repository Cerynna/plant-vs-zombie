import { useEffect } from 'react';
import { useActions, useGame } from '@store/gameStore';
import { TICK_MS } from '@engine/constants';
import { PLANT_ORDER } from '@data/plants';
import { Board } from './Board';
import { Hud } from './Hud';
import { SeedBar } from './SeedBar';
import { Overlay } from './Overlay';

export function App() {
  const actions = useActions();
  const status = useGame((s) => s.status);
  const speed = useGame((s) => s.speed);
  const selected = useGame((s) => s.selectedPlant);
  const shovelMode = useGame((s) => s.shovelMode);

  // Load saved state on mount
  useEffect(() => {
    actions.loadFromStorage();
  }, [actions]);

  // Keyboard shortcuts: 1–7 select plants, S toggles shovel, Escape deselects
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      // e.code is layout-independent (works for AZERTY, QWERTY, etc.)
      const digitMatch = e.code.match(/^Digit(\d)$/);
      if (digitMatch) {
        const idx = parseInt(digitMatch[1]) - 1;
        if (idx >= 0 && idx < PLANT_ORDER.length) {
          const kind = PLANT_ORDER[idx];
          actions.selectPlant(selected === kind ? null : kind);
        }
      } else if (e.code === 'KeyS') {
        actions.toggleShovel();
      } else if (e.code === 'Escape') {
        if (shovelMode) actions.toggleShovel();
        else actions.selectPlant(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [actions, selected, shovelMode]);

  // Game loop using setInterval driven by real time deltas
  useEffect(() => {
    if (status !== 'playing') return;
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      const dt = Math.min(250, now - last); // clamp to avoid jumps
      last = now;
      actions.tick(dt * speed);
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [status, speed, actions]);

  return (
    <div className="app">
      <header className="nes-container is-dark app__header">
        <Hud />
      </header>
      <main className="app__main">
        <div className="board-wrap">
          <Board />
          <Overlay />
        </div>
        <SeedBar />
      </main>
      <footer className="app__footer">
        <small>Created by Cerynna with ❤️</small>
      </footer>
    </div>
  );
}
