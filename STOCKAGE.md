# Stockage et durée de conservation

Objectif : permettre des aventures de 30 à 60 minutes sans saturer le dépôt GitHub.

## Contenu permanent

On conserve le code, les rôles, les cinq histoires d'origine, les métadonnées et journaux de partie, les secrets du MJ et le petit nombre de sons génériques utiles à plusieurs parties.

## Contenu temporaire

- Les **voix** passent par la synthèse du navigateur. Aucun MP3 ni dialogue enregistré n'est généré par défaut.
- Les **ambiances et bruitages** sont calculés à la volée avec Web Audio : pas de fichier à télécharger, pas de stockage dans le dépôt.
- Les fichiers audio placés sous `assets/audio/` (hors `generated/`) sont des effets réutilisables permanents, et peuvent être lus dans le navigateur si l'option MP3 est activée.
- Les fichiers `assets/audio/generated/`, `parties/*/audio/generated/` et `parties/*/dialogues/generated/` sont ignorés par Git ; on les traite comme du cache et on les purge après utilisation.

## Nettoyage GitHub automatique

Chaque nuit, GitHub Actions exécute `scripts/prune_transient_assets.py --days 14 --max-mb 50 --apply` sur la branche principale, une fois le workflow fusionné.

**Protection contre la perte de partie :** aucune suppression tant que `partie.json` n'a pas un statut final explicite (`terminee`, `terminée`, `completed`, etc.). Pour une partie terminée, on supprime après **14 jours depuis la dernière mise à jour de la partie ou du fichier** : les audios de `parties/<id>/audio/` non marqués `archive` ou `permanent` dans leur `manifest.json`, et le fichier `dialogues.ndjson`. Si le volume des médias temporaires des parties terminées dépasse **50 Mio**, les plus anciens partent plus tôt. Les autres fichiers de la partie restent.

**Simulation** depuis la racine du projet : `python3 scripts/prune_transient_assets.py` ; exécution réelle : `python3 scripts/prune_transient_assets.py --apply`.

**Important :** supprimer des fichiers déjà commités ne fait **pas** disparaître leurs blobs de l'historique Git ; la taille historique du dépôt ne diminue pas automatiquement. Pour prévenir une croissance permanente de GitHub, ne jamais y commiter les nouveaux dialogues/ambiances régénérables. Pour une génération vocale de qualité via un service distant, stocker les caches hors Git (avec TTL 7 jours, plafond de taille et suppression après la partie) et ne garder que les scripts de narration dans le dépôt.
