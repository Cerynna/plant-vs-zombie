import { useActions, useGame } from '../store/gameStore';
import { WAVES } from '../data/waves';
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
      <div className="hud__sun" title="Soleil">☀️ {sun}</div>
      <div className="hud__wave">
        <div className="hud__wave-label">
          {betweenWaves
            ? `Pause inter-vague : ${(betweenWavesTimer / 1000).toFixed(1)}s`
            : `${waveLabel} (${waveIndex + 1}/${WAVES.length}) — ${cleared}/${total}`}
        </div>
        <div className="progress" title="Progression de la vague">
          <div
            className={`progress__bar${betweenWaves ? ' progress__bar--done' : ''}`}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
      <div className="hud__buttons">
        {status === 'idle' && (
          <button onClick={actions.start}>▶ Démarrer</button>
        )}
        {status === 'playing' && (
          <button onClick={actions.pause}>⏸</button>
        )}
        {status === 'paused' && (
          <button onClick={actions.resume}>▶</button>
        )}
        {(status === 'won' || status === 'lost') && (
          <button onClick={actions.start}>↻</button>
        )}
        <button onClick={actions.cycleSpeed} title="Vitesse de simulation">⏩ x{speed}</button>
        <PassivePanel />
        <button onClick={actions.reset} className="hud__reset">⟲</button>
      </div>
    </div>
  );
}
