import { useActions, useGame } from '@store/gameStore';
import { WAVES } from '@data/waves';
import { PassivePanel } from './PassivePanel';

export function Hud() {
  const sun = useGame((s) => s.sun);
  const status = useGame((s) => s.status);
  const speed = useGame((s) => s.speed);
  const waveIndex = useGame((s) => s.waveIndex);
  const waveSpawnCursor = useGame((s) => s.waveSpawnCursor);
  const aliveZombies = useGame((s) => s.zombies.length);
  const betweenWaves = useGame((s) => s.betweenWaves);
  const betweenWavesTimer = useGame((s) => s.betweenWavesTimer);
  const actions = useActions();

  const wave = WAVES[waveIndex];
  const waveLabel = wave?.name ?? '—';
  const total = wave?.spawns.length ?? 0;
  const cleared = Math.max(0, waveSpawnCursor - aliveZombies);
  const progress = betweenWaves
    ? 1
    : total === 0
      ? 0
      : Math.min(1, cleared / total);

  return (
    <div className="hud">
      <span className="nes-badge hud__sun" title="Soleil">
        <span className="is-warning">☀️ {sun}</span>
      </span>
      <div className="hud__wave">
        <div className="hud__wave-label">
          {betweenWaves
            ? `⏱ ${(betweenWavesTimer / 1000).toFixed(1)}s`
            : `Vague : ${waveIndex + 1}/${WAVES.length}`}
        </div>
        <progress
          className={`nes-progress${betweenWaves ? ' is-warning' : ' is-success'}`}
          value={Math.round(progress * 100)}
          max={100}
          title="Progression de la vague"
        />
      </div>
      <div className="hud__buttons">
        {status === 'idle' && (
          <button className="nes-btn is-primary" onClick={actions.start}>▶ Démarrer</button>
        )}
        {status === 'playing' && (
          <button className="nes-btn" onClick={actions.pause}>⏸</button>
        )}
        {status === 'paused' && (
          <button className="nes-btn is-primary" onClick={actions.resume}>▶</button>
        )}
        {(status === 'won' || status === 'lost') && (
          <button className="nes-btn is-primary" onClick={actions.start}>↻</button>
        )}
        <button className="nes-btn is-warning" onClick={actions.cycleSpeed} title="Vitesse de simulation">⏩ x{speed}</button>
        <PassivePanel />
        <button className="nes-btn is-error hud__reset" onClick={actions.reset}>⟲</button>
      </div>
    </div>
  );
}
