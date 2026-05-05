import { useActions, useGame } from '@store/gameStore';

export function Overlay() {
  const status = useGame((s) => s.status);
  const actions = useActions();

  if (status === 'playing') return null;

  let title = '';
  let body = '';
  let cta = '';
  let onClick = () => actions.start();

  switch (status) {
    case 'idle':
      title = 'Pret a defendre la maison';
      body = 'Récolte du soleil, plante tes défenses, survis aux 3 vagues.';
      cta = 'Demarrer';
      break;
    case 'paused':
      title = 'Pause';
      body = 'Reprends quand tu veux. La partie est sauvegardée.';
      cta = 'Reprendre';
      onClick = () => actions.resume();
      break;
    case 'won':
      title = 'Victoire';
      body = 'Tu as repoussé toutes les vagues. Bravo.';
      cta = 'Rejouer';
      break;
    case 'lost':
      title = 'Defaite';
      body = 'Les zombies sont entrés dans la maison.';
      cta = 'Rejouer';
      break;
  }

  return (
    <div className="overlay">
      <div className={`overlay__panel overlay__panel--${status}`}>
        <h2>{title}</h2>
        <p>{body}</p>
        <button onClick={onClick}>{cta}</button>
      </div>
    </div>
  );
}
