## Plan: PvZ React MVP

On part sur un MVP jouable en React + TypeScript, avec Zustand comme source unique d’état, localStorage pour persister toute la partie, une grille 5x9, un style rétro en CSS, et une première boucle de vagues. Le bon découpage est de séparer strictement le moteur de simulation du rendu React, pour garder le gameplay testable et éviter que l’UI pilote la logique.

**Décisions verrouillées**
1. V1 jouable avec vagues progressives.
2. Grille 5 lignes x 9 colonnes.
3. Rendu rétro CSS sans assets externes obligatoires.
4. Persistance complète de l’état via localStorage.
5. Documentation dédiée pour futurs agents IA: architecture, conventions, roadmap.

**Étapes**
1. Initialiser le projet front greenfield avec Vite, React, TypeScript et Zustand.
2. Définir le modèle métier: plantes, zombies, projectiles, grille, ressources, vagues, snapshots de sauvegarde.
3. Construire le store Zustand central avec actions, sérialisation et restauration localStorage.
4. Implémenter la boucle de simulation hors React: tick fixe, déplacements, tirs, collisions, dégâts, tondeuses, victoire/défaite.
5. Construire l’interface jouable: plateau, HUD, cartes de plantes, compteur de soleil, contrôles pause/restart, overlays d’état.
6. Ajouter le contenu MVP: tournesol, lance-pois, noix; zombie normal et zombie cône; une carte unique; vagues prédictibles.
7. Finaliser la persistance complète: autosave, reprise de session, reset propre, version de snapshot.
8. Ajouter la documentation pour agents IA: architecture, règles de gameplay, carte du store, conventions, zones d’extension, roadmap.

**Architecture recommandée**
1. React sert uniquement au rendu et aux interactions utilisateur.
2. Zustand contient tout l’état du jeu.
3. Le moteur de jeu est composé de fonctions de simulation pures appelées par un scheduler.
4. Les stats des plantes et zombies restent dans des fichiers de données séparés pour simplifier l’équilibrage.
5. La doc IA est séparée entre lecture rapide projet et consignes opératoires plus détaillées.

**Vérification**
1. Jouer une partie complète: poser des plantes, générer du soleil, tirer, tuer des zombies, perdre et gagner.
2. Recharger la page en pleine partie et vérifier la reprise exacte.
3. Vérifier qu’un reset repart d’un état propre.
4. Tester la logique pure du tick, des collisions, du spawn de vagues et des conditions de fin.
5. Vérifier que l’interface reste utilisable sur desktop et mobile étroit.

Le plan est sauvegardé en session et prêt pour exécution. Si tu valides ce cadrage, l’étape suivante est de passer en implémentation pour scaffold le projet et livrer la première version jouable.
