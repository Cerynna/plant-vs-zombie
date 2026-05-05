# PvZ React MVP

Mini-clone Plants vs Zombies en React + TypeScript + Zustand.
Grille 5x9, 3 plantes (tournesol, lance-pois, noix), 2 zombies (normal, cône),
3 vagues progressives, persistance localStorage.

## Démarrer

```bash
npm install
npm run dev
```

Puis ouvrir http://localhost:5173.

## Scripts

- `npm run dev` — serveur Vite
- `npm run build` — build production (typecheck + bundle)
- `npm run preview` — preview du build

## Documentation pour agents IA

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — structure et flux de données
- [docs/GAMEPLAY.md](docs/GAMEPLAY.md) — règles, équilibrage, formules
- [docs/STORE.md](docs/STORE.md) — carte du store Zustand & actions
- [docs/CONVENTIONS.md](docs/CONVENTIONS.md) — conventions de code et zones d'extension
- [docs/ROADMAP.md](docs/ROADMAP.md) — état actuel et prochaines étapes

## Vérification rapide

1. Démarrer une partie, planter un tournesol, attendre la production de soleil.
2. Planter un lance-pois sur la même rangée qu'un zombie, vérifier les tirs.
3. Recharger la page en cours de partie : l'état est restauré (en pause).
4. Cliquer Reset : état propre, localStorage vidé.
