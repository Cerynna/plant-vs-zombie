import { PLANTS, PLANT_ORDER } from '@data/plants';
import { PLANT_UNLOCK_WAVE, isPlantUnlocked } from '@data/progression';
import { useActions, useGame } from '@store/gameStore';

export function SeedBar() {
  const sun = useGame((s) => s.sun);
  const cooldowns = useGame((s) => s.cooldowns);
  const selected = useGame((s) => s.selectedPlant);
  const shovelMode = useGame((s) => s.shovelMode);
  const waveIndex = useGame((s) => s.waveIndex);
  const actions = useActions();

  return (
    <div className="seedbar">
      {PLANT_ORDER.map((kind, idx) => {
        const def = PLANTS[kind];
        const cd = cooldowns[kind];
        const unlocked = isPlantUnlocked(kind, waveIndex);
        const disabled = !unlocked || cd > 0 || sun < def.cost;
        const active = selected === kind;
        const title = unlocked
          ? `${def.name} — ${def.cost} ☀️`
          : `${def.name} — débloqué à la vague ${PLANT_UNLOCK_WAVE[kind]}`;
        return (
          <button
            key={kind}
            className={`seedcard${active ? ' seedcard--active' : ''}${disabled ? ' seedcard--disabled' : ''}${!unlocked ? ' seedcard--locked' : ''}`}
            onClick={() => unlocked && actions.selectPlant(active ? null : kind)}
            disabled={disabled && !active}
            style={{ borderColor: def.color }}
            title={title}
          >
            <div className="seedcard__key">{idx + 1}</div>
            <div className="seedcard__emoji">{def.emoji}</div>
            <div className="seedcard__name">{def.name}</div>
            <div className="seedcard__cost">☀️ {def.cost}</div>
            {cd > 0 && unlocked && (
              <div
                className="seedcard__cd"
                style={{ height: `${(cd / def.cooldownMs) * 100}%` }}
              />
            )}
            {!unlocked && (
              <div className="seedcard__lock">🔒 V{PLANT_UNLOCK_WAVE[kind]}</div>
            )}
          </button>
        );
      })}
      <button
        className={`seedcard seedcard--shovel${shovelMode ? ' seedcard--active' : ''}`}
        onClick={() => actions.toggleShovel()}
        title="Pelle : retirer une plante"
      >
        <div className="seedcard__key">S</div>
        <div className="seedcard__emoji">🧹</div>
        <div className="seedcard__name">Pelle</div>
        <div className="seedcard__cost">retirer</div>
      </button>
    </div>
  );
}
