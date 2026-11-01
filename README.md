# Thiercelieux — Assistant de maître du jeu

Application web pour **un maître du jeu humain et un seul joueur**, inspirée des mécaniques du Loup-Garou. Histoires et dialogues originaux, rôles cachés, alternance jour/nuit, cinq scénarios de 30 à 60 minutes et cartes des différentes éditions.

## Jouer

Ouvrir [index.html](index.html) dans un navigateur récent (Chrome, Edge, Firefox, Safari selon leurs capacités audio). Choisir un scénario, un rôle ou le hasard, puis démarrer. La partie est sauvegardée dans le navigateur, et les secrets MJ sont dans un panneau distinct.

**La régie sonore** déclenche des ambiances le soir et au matin, une cloche au conseil, des bruitages manuels (loup, porte, pas, suspense...), la narration et les réponses vocales des habitants. Le MJ peut régler les volumes et couper immédiatement les sons. La lecture audio doit être amorcée par une interaction sur la page. Le navigateur ou l'appareil détermine les voix françaises disponibles ; certaines voix ne fonctionnent pas hors connexion.

- Les effets et ambiances sont **synthétisés directement** : aucun fichier requis et pas d'accumulation de MP3.
- Si souhaité, déposer de petits fichiers réutilisables dans [assets/audio](assets/audio/README.md) et activer « Préférer les MP3 locaux » ; à défaut de fichier le bruitage synthétisé reste disponible.
- Les pouvoirs de certains rôles complexes nécessitent encore l'arbitrage du MJ.

## Gérer la capacité GitHub

**Ne pas stocker les fichiers vocaux éphémères dans le dépôt.** Conserver les histoires, les règles et les résumés de parties, et régénérer les voix à la lecture.

Le [guide de stockage](STOCKAGE.md) détaille la politique de conservation. Une action GitHub planifiée lance chaque nuit un nettoyage des **dialogues et sons temporaires des parties terminées** (14 jours par défaut, budget 50 Mio), après fusion de cette fonctionnalité sur la branche principale. Les parties en cours et les audios marqués « archive » sont protégés. Supprimer un fichier GitHub déjà commité **ne réduit pas automatiquement la taille de l'historique Git**, d'où l'importance de ne pas commiter les nouveaux caches.

Simulation locale : \`python3 scripts/prune_transient_assets.py\`. Suppression effective : \`python3 scripts/prune_transient_assets.py --apply\`.

Application indépendante et non officielle, conçue pour jouer avec ses propres cartes physiques.
