# Voix neuronales — serveur sécurisé optionnel

Le navigateur Web Speech offre une voix de secours, parfois robotique. Pour un rendu beaucoup plus naturel, ce **Cloudflare Worker** convertit *une réplique publique déjà jouée à la fois* en MP3 via ElevenLabs **Multilingual v2**, avec un timbre distinct par personnage.

### Pourquoi un serveur ?

GitHub Pages est public : il ne doit **jamais** contenir de clé ElevenLabs. Ce Worker garde la clé chez Cloudflare et refuse toute demande de texte libre. Il retrouve lui-même la réplique autorisée dans `parties/<ID>/dialogues.ndjson`, uniquement si elle est marquée `public: true`. Le lecteur public envoie seulement `id` et `seq` — jamais les secrets du MJ, ni une clé.

### Mise en service (une seule fois)

1. Disposer d'un compte ElevenLabs avec accès API et sélectionner huit **voix françaises** (Agathe, Basile, Clémence, Gaston, Iris, Malo, Rosalie, Narrateur). Relever leurs identifiants exacts dans la bibliothèque de voix. Le nombre de voix disponibles dépend de l'abonnement.
2. Installer Wrangler : `npm install -g wrangler`, se connecter : `wrangler login`. Dans `tts-worker/`, exécuter `wrangler deploy` pour déployer ce Worker.
3. Définir les variables secrètes via `wrangler secret put ELEVENLABS_API_KEY` et `wrangler secret put VOICE_MAP_JSON`. Pour cette dernière, copier un objet JSON associant les **noms publics** aux ID ElevenLabs réels, par exemple :
   `{"Narrateur":"VOICE_ID_0","Agathe":"VOICE_ID_1","Basile":"VOICE_ID_2","Clémence":"VOICE_ID_3","Gaston":"VOICE_ID_4","Iris":"VOICE_ID_5","Malo":"VOICE_ID_6","Rosalie":"VOICE_ID_7"}`
4. Consulter `https://<nom-du-worker>.<compte>.workers.dev/health` et vérifier `"configured": true`. Ce point ne révèle pas la clé.
5. Dans le fichier public à la racine `tts-config.json`, renseigner `"enabled": true` et `"worker_url": "https://<nom-du-worker>.<compte>.workers.dev"` (ne pas y mettre de secret). Actualiser l'application.

### Fonctionnement

- Chaque ligne de dialogue est créée par ChatGPT **après** la validation/action du MJ et transmise à GitHub ; le lecteur interroge les nouvelles lignes publiques à intervalle régulier.
- Quand les voix sont activées, le navigateur demande à Cloudflare le MP3 de la ligne exacte (ID+seq), et la joue ; les lignes suivantes sont traitées séquentiellement. En cas d'erreur ou d'absence de configuration, Web Speech reprend automatiquement.
- **Audio éphémère** : MP3 conservés dans le cache périphérique de Cloudflare au maximum ~1 heure, jamais commités ni archivés dans Git. Relecture dans cette fenêtre sans refaire la synthèse quand le cache est disponible.
- Le Worker impose une limite d'utilisation par IP (20 requêtes/minute et par emplacement Cloudflare) pour limiter les coûts, mais cela ne remplace **pas** un plafond de dépense chez ElevenLabs. L'origine autorisée et CORS ne constituent pas une authentification forte ; ne pas déployer un service public payé sans prévoir aussi un budget maximal et, si nécessaire, une authentification.
- Attention : les dialogues publics sont envoyés à ElevenLabs pour synthèse ; n'y inscrire jamais des secrets ni des informations privées sur l'enfant.

**Limites connues :** l'application Github Pages ne peut ni déclencher directement ChatGPT, ni garantir un temps réel strict. Il faut laisser la page ouverte avec le son autorisé. Le cache GitHub peut retarder l'arrivée d'une ligne ; la génération ElevenLabs peut ajouter de la latence. Le Worker, ses secrets et le compte ElevenLabs **ne sont pas déployés automatiquement** par l'ajout de ces fichiers au dépôt.
