import { COLS, ROWS } from '@engine/constants';
import { PLANTS } from '@data/plants';
import { ZOMBIES } from '@data/zombies';
import { useActions, useGame } from '@store/gameStore';

export function Board() {
  const plants = useGame((s) => s.plants);
  const zombies = useGame((s) => s.zombies);
  const projectiles = useGame((s) => s.projectiles);
  const sunTokens = useGame((s) => s.sunTokens);
  const floatingTexts = useGame((s) => s.floatingTexts);
  const lawnmowers = useGame((s) => s.lawnmowers);
  const selected = useGame((s) => s.selectedPlant);
  const shovelMode = useGame((s) => s.shovelMode);
  const actions = useActions();

  return (
    <div
      className={`board${selected ? ' board--placing' : ''}${shovelMode ? ' board--shovel' : ''}`}
      style={{
        gridTemplateColumns: `repeat(${COLS}, var(--cell))`,
        gridTemplateRows: `repeat(${ROWS}, var(--cell))`
      }}
    >
      {Array.from({ length: ROWS * COLS }).map((_, idx) => {
        const row = Math.floor(idx / COLS);
        const col = idx % COLS;
        return (
          <div
            key={idx}
            className={`cell cell--${(row + col) % 2 ? 'a' : 'b'}`}
            onClick={() => actions.placePlant(row, col)}
          />
        );
      })}

      {/* lawnmowers (left of grid, overlay on row) */}
      {lawnmowers.map((alive, row) =>
        alive ? (
          <div
            key={`mower_${row}`}
            className="lawnmower"
            style={{ top: `calc(${row} * var(--cell))` }}
          >
            ❤️
          </div>
        ) : null
      )}

      {/* plants */}
      {plants.map((p) => {
        const def = PLANTS[p.kind];
        return (
          <div
            key={p.id}
            className="entity entity--plant"
            style={{
              left: `calc(${p.col} * var(--cell))`,
              top: `calc(${p.row} * var(--cell))`,
              background: def.color
            }}
            title={`${def.name} HP ${Math.ceil(p.hp)}/${def.maxHp}`}
          >
            <span className="entity__emoji">{def.emoji}</span>
            <div
              className="hpbar"
              style={{ ['--hp' as any]: `${Math.max(0, Math.min(100, (p.hp / def.maxHp) * 100))}%` }}
            />
          </div>
        );
      })}

      {/* zombies */}
      {zombies.map((z) => {
        const def = ZOMBIES[z.kind];
        return (
          <div
            key={z.id}
            className={`entity entity--zombie${z.slowMs > 0 ? ' entity--slow' : ''}`}
            style={{
              left: `calc(${z.x} * var(--cell))`,
              top: `calc(${z.row} * var(--cell))`,
              background: def.color
            }}
            title={`${def.name} HP ${Math.ceil(z.hp)}/${def.maxHp}`}
          >
            <span className="entity__emoji">{def.emoji}</span>
            <div
              className="hpbar"
              style={{ ['--hp' as any]: `${Math.max(0, Math.min(100, (z.hp / def.maxHp) * 100))}%` }}
            />
          </div>
        );
      })}

      {/* projectiles */}
      {projectiles.map((p) => (
        <div
          key={p.id}
          className="projectile"
          style={{
            left: `calc(${p.x} * var(--cell))`,
            top: `calc(${p.row} * var(--cell) + var(--cell) / 2 - 6px)`
          }}
        />
      ))}

      {/* sun tokens */}
      {sunTokens.map((s) => (
        <button
          key={s.id}
          className="suntoken"
          style={{
            left: `calc(${s.col} * var(--cell) + var(--cell) / 4)`,
            top: `calc(${s.row} * var(--cell) + var(--cell) / 4)`
          }}
          onClick={(e) => {
            e.stopPropagation();
            actions.collectSun(s.id);
          }}
          title={`+${s.value} soleil`}
        >
          ☀️
        </button>
      ))}

      {/* floating combat texts */}
      {floatingTexts.map((f) => {
        const progress = 1 - f.ttl / f.life; // 0 → 1
        return (
          <div
            key={f.id}
            className={`floattext floattext--${f.kind}`}
            style={{
              left: `calc(${f.x} * var(--cell) + var(--cell) / 2)`,
              top: `calc(${f.row} * var(--cell) + var(--cell) / 2)`,
              opacity: 1 - progress,
              transform: `translate(-50%, calc(-50% - ${progress * 28}px))`
            }}
          >
            {f.text}
          </div>
        );
      })}
    </div>
  );
}
