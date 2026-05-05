import { useState } from 'react';
import {
  PASSIVES,
  PASSIVE_ORDER,
  nextPassiveCost,
  passiveLevel,
  passiveMaxLevel
} from '@data/passives';
import { useActions, useGame } from '@store/gameStore';

export function PassivePanel() {
  const [open, setOpen] = useState(false);
  const [resumeOnClose, setResumeOnClose] = useState(false);
  const points = useGame((s) => s.passivePoints);
  const passives = useGame((s) => s.passives);
  const status = useGame((s) => s.status);
  const actions = useActions();

  const handleOpen = () => {
    if (status === 'playing') {
      setResumeOnClose(true);
      actions.pause();
    } else {
      setResumeOnClose(false);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    if (resumeOnClose) {
      actions.resume();
      setResumeOnClose(false);
    }
  };

  return (
    <>
      <button
        className={`nes-btn${points > 0 ? ' is-success hud__passive--ready' : ''}`}
        onClick={handleOpen}
        title="Passifs"
      >
        🌳 {points}
      </button>
      {open && (
        <div className="modal" onClick={handleClose}>
          <div
            className="nes-container is-dark modal__panel passive-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="passive-panel__header">
              <h2 className="passive-panel__title">🌳 Arbre de talents</h2>
              <div className="passive-panel__points">Points : {points}</div>
              <button className="nes-btn is-error" onClick={handleClose}>✕</button>
            </header>
            <p className="passive-panel__hint">
              Tu gagnes 1 point par vague terminée. Les passifs sont conservés
              entre les parties (Reset les efface).
            </p>
            <div className="passive-grid">
              {PASSIVE_ORDER.map((id) => {
                const def = PASSIVES[id];
                const lvl = passiveLevel(passives, id);
                const max = passiveMaxLevel(id);
                const cost = nextPassiveCost(passives, id);
                const canBuy = cost != null && points >= cost;
                return (
                  <div key={id} className="passive-card">
                    <div className="passive-card__header">
                      <span className="passive-card__emoji">{def.emoji}</span>
                      <strong>{def.name}</strong>
                      <span className="passive-card__lvl">
                        {lvl}/{max}
                      </span>
                    </div>
                    <div className="passive-card__desc">{def.description}</div>
                    <div className="passive-card__pips">
                      {Array.from({ length: max }).map((_, i) => (
                        <span
                          key={i}
                          className={`pip${i < lvl ? ' pip--filled' : ''}`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => actions.buyPassive(id)}
                      disabled={!canBuy}
                      className={`nes-btn passive-card__buy${canBuy ? ' is-primary' : ''}`}
                    >
                      {cost == null
                        ? 'Niveau max'
                        : `Acheter (${cost} pt${cost > 1 ? 's' : ''})`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
