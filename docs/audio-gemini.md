# Gemini TTS pour les dialogues du Loup-Garou

Le lecteur `scene-player.js` offre le mode **Gemini** et conserve les modes **voix du navigateur** et **Piper**. Les dialogues sont uniquement rédigés par ChatGPT dans `parties/<ID>/dialogues.ndjson`. Le joueur prononce lui-même les répliques de type `dialogue_joueur`, qui ne sont jamais synthétisées.

## Activer Gemini sans exposer la clé

1. Créer une clé API Google AI Studio sur https://aistudio.google.com/apikey, dans un projet **sans facturation activée** si vous souhaitez rester strictement dans le quota gratuit.
2. Ouvrir https://github.com/trexdbg/loup-garou/settings/secrets/actions, puis **New repository secret**.
3. Nom exact du secret : **`GEMINI_API_KEY`**. Dans *Secret*, coller la valeur de la clé, puis enregistrer. Ne jamais coller cette clé dans ChatGPT, un commit, une issue, un JSON ou GitHub Pages.
4. Dans **Actions**, ouvrir **Publier Thiercelieux Solo sur GitHub Pages** et lancer **Run workflow** (branche main). Lors des modifications ultérieures de dialogues validés, le workflow démarre aussi via le push GitHub.
5. Ouvrir https://trexdbg.github.io/loup-garou/ → **Mes parties** → **Actualiser** → sélectionner une scène → **✨ Gemini · voix des personnages** → **▶ Écouter**.

Le secret GitHub n'est consommé que par le runner GitHub Actions sur le workflow principal. Aucun appel Gemini n'est envoyé directement depuis le navigateur, et la clé n'est jamais présente dans les fichiers de publication.

## Fonctionnement et coûts

- Modèle par défaut : **gemini-3.8-flash-lite-tts** (API Interactions REST) et quota gratuit Google AI Studio. Aucun modèle payant ne se déclenche automatiquement.
- **7 profils Gemini** pour les sept PNJ (association stable dans l'ordre du casting de `partie.json`) et **1 voix de narrateur**. Chaque réplique est générée séparément pour préserver la cohérence du personnage et respecter l'ordre de la scène.
- Maximum **8 nouvelles répliques par déploiement**, sur les **3 dernières scènes** de chaque partie. Seule la partie active la plus récente peut demander de nouvelles voix ; les anciens MP3 de toutes les parties restent servis depuis le cache. Une erreur 429 interrompt les nouveaux appels pendant ce déploiement.
- Les MP3 et les manifests ne sont placés que dans l'artefact **GitHub Pages**. **Aucun MP3 n'est commité au dépôt**, y compris après nettoyage. Les anciennes scènes sans MP3 conservent la lecture locale.
- Si la clé est absente, invalide, le modèle retiré, le quota atteint, le MP3 en erreur, ou la publication en cours, le lecteur bascule vers une voix française locale pour la réplique manquante. Aucune scène n'est démarrée automatiquement.
- Pour éviter toute dépense, **ne pas activer la facturation** sur le projet Google AI Studio utilisé. Le secret seul ne garantit pas l'absence de coûts si vous configurez un projet Google payant : surveillez les quotas. Le workflow n'impose pas de facturation.
- Le workflow utilise explicitement Gemini 3.8 Flash-Lite pour empêcher une variable GitHub obsolète de réactiver le modèle précédent. Modifier ce choix requiert de changer le workflow.

## Confidentialité

Seules les lignes avec `public: true` et un type de narration ou de PNJ sont envoyées à Google pour synthèse. Les lignes de joueur sont exclues, et le script **ne lit jamais** `secrets_mj.json`. Le contenu des textes publics envoyés au service Google peut être utilisé selon les conditions applicables au niveau gratuit. Vérifier ces conditions avant d'utiliser des données privées.

## Dépannage

Si les répliques ont encore les voix du téléphone, vérifier les logs de **Actions → Publier Thiercelieux Solo → Préparer les voix Gemini**, et consulter le nombre de clips indiqués dans l'application. Un échec de quota (HTTP 429) ou d'autorisation (HTTP 403) empêche uniquement la synthèse Gemini ; la publication du site et le jeu restent disponibles.

La génération est **déclenchée par l'archivage/commits des dialogues**, et non en direct à chaque question dans le navigateur ; actualiser après publication. Le bouton **Écouter** reste manuel pour le MJ.

## Suivi des répliques et des quotas

Le lecteur affiche pour chaque scène le nombre de répliques Gemini disponibles et celles qui manquent. Les paroles du joueur ne sont jamais synthétisées.

Chaque publication écrit un résumé « Gemini status » dans le journal GitHub Actions et des statistiques total, available, reused, generated, missing, quota_exhausted dans le manifeste audio de la partie. Lorsque Google répond HTTP 429, les autres requêtes de la publication sont interrompues. Les clips existants sont conservés et la publication Pages continue.

Il n’y a **aucune relance automatique en boucle** : une prochaine mise à jour validée ou un déclenchement manuel du workflow Actions réessaiera seulement les fichiers manquants. Les quotas réels par modèle sont consultables sur https://aistudio.google.com/rate-limit .

L’objectif 0 € suppose une clé d’un projet Google **sans facturation activée**. Le code ne peut ni connaître le quota restant exact ni désactiver la facturation sur le compte Google.

Référence API : https://ai.google.dev/gemini-api/docs/speech-generation .
