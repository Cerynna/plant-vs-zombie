# Roadmap

## V0 — Livré (MVP jouable)

- [x] Scaffold Vite + React 18 + TypeScript + Zustand
- [x] Grille 5x9, rendu rétro CSS sans assets externes
- [x] 3 plantes : tournesol, lance-pois, noix
- [x] 2 zombies : normal, cône
- [x] 3 vagues progressives, victoire/défaite
- [x] Soleil du ciel + soleil tournesol cliquable
- [x] Tondeuses (1 par ligne)
- [x] HUD : soleil, vague, pause/reprise/restart/reset
- [x] Persistance complète localStorage avec version de snapshot
- [x] Reprise auto en pause au reload
- [x] Documentation IA (architecture, gameplay, store, conventions)

## V1 — Polish proche

- [ ] Tests unitaires sur `engine/tick.ts` (vitest)
- [ ] Animation tondeuse qui traverse la ligne
- [ ] Pelle (retirer une plante)
- [ ] Indicateur visuel de cellule survolée en mode pose
- [ ] Sons rétro (bip de tir, slurp zombie)

## V2 — Contenu

- [ ] Nouvelles plantes : cerise (zone), neige (slow), répéteur
- [ ] Nouveaux zombies : seau, journal, course
- [ ] Mode nuit (champignons, sans soleil du ciel)
- [ ] Carte « piscine » (lignes aquatiques)

## V3 — Méta

- [ ] Sélection de 6 plantes avant la partie
- [ ] Multiples niveaux avec scénarios scriptés
- [ ] Achievements persistés séparément
- [ ] Mode endless

## Dette technique connue

- `actions.tick` clone systématiquement les tableaux ; OK pour un MVP, à passer en immer ou structures immuables si on monte en complexité.
- IDs générés via `Math.random` : suffisant pour un mono-joueur local, à seeder si on veut des replays déterministes.
- Pas de séparation simulation/render-time : un onglet en arrière-plan voit `setInterval` ralenti par le navigateur. Pour un mode strict, passer à `requestAnimationFrame` + accumulateur.
