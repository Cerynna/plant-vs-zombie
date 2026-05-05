import { useEffect } from 'react';
import { useActions, useGame } from '@store/gameStore';
import { TICK_MS } from '@engine/constants';
import { Board } from './Board';
import { Hud } from './Hud';
import { SeedBar } from './SeedBar';
import { Overlay } from './Overlay';

export function App() {
  const actions = useActions();
  const status = useGame((s) => s.status);
  const speed = useGame((s) => s.speed);

  // Load saved state on mount
  useEffect(() => {
    actions.loadFromStorage();
  }, [actions]);

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
      <header className="app__header">
        <h1>🌻 Plants vs Zombies</h1>
        <Hud />
      </header>
      <main className="app__main">
        <SeedBar />
        <div className="board-wrap">
          <Board />
          <Overlay />
        </div>
      </main>
      <footer className="app__footer">
        <small>État sauvegardé automatiquement dans localStorage.</small>
      </footer>
    </div>
  );
}
