# Protocole ChatGPT ↔ GitHub ↔ Salon

## Emplacement et identification

- Dépôt de données : `trexdbg/loup-garou` (à conserver privé).
- Branche : `parties`, dossier : `sessions/`.
- Une partie = `sessions/LG-AAAAMMJJ-XXXXXX.json`, exemple `sessions/LG-20261101-A1B2C3.json`.
- L'identifiant permet de retrouver la partie : **ce n'est pas une autorisation d'accès**.

## Démarrer

**Depuis l'application** : choisir l'aventure, le nom du héros et son rôle, créer la partie, copier son identifiant et l'envoyer sur GitHub avec la connexion du MJ.

**Depuis ChatGPT** : sur ordre du MJ, créer un fichier JSON conforme au schéma v1 dans la branche `parties`, avec un code neuf, en utilisant les personnages de `stories.js` et les rôles de `roles.js`. Donner le code au MJ. Ne pas annoncer un lien GitHub Pages opérationnel tant que sa publication n'a pas été activée et vérifiée.

## Format JSON attendu

```json
{
  "schemaVersion": 1,
  "id": "LG-20261101-A1B2C3",
  "storyId": "sac",
  "title": "Le sac de Marcel",
  "createdAt": "2026-11-01T20:30:00.000Z",
  "updatedAt": "2026-11-01T20:31:00.000Z",
  "duration": 45,
  "phase": "day",
  "day": 1,
  "status": "active",
  "player": {"name": "Alex", "roleId": "voyante", "alive": true},
  "residents": [{"name": "Marcel", "job": "berger", "roleId": "loup", "alive": true}],
  "scene": {"title": "La place du village", "text": "Le soleil revient...", "speaker": "Narrateur"},
  "events": [
    {"id": "evt-1", "at": "2026-11-01T20:31:00.000Z", "kind": "player_question", "speaker": "Alex", "text": "Où étais-tu ?", "target": "Marcel", "status": "waiting"}
  ],
  "clues": [],
  "explored": [],
  "nightActions": [],
  "votes": [],
  "pending": {"type": "npc_reply", "resident": "Marcel", "question": "Où étais-tu ?", "day": 1}
}
```

L'exemple est volontairement raccourci. En production, **tous les habitants du scénario** doivent être présents dans `residents` et toutes les entrées historiques déjà écrites doivent être conservées.

## Demande « Partie LG-… : fais répondre Marcel »

1. Lire la sauvegarde dans la branche `parties`, y compris `pending`, le journal `events` et les indices `clues`. Récupérer aussi le scénario dans `stories.js` si nécessaire.
2. Garder la cohérence de l'histoire, des alibis, des secrets et des rôles cachés. La narration est destinée à un enfant de 10 ans : suspense et mystère, pas d'horreur graphique.
3. Ajouter **un nouvel événement** à la fin de `events`, sans supprimer les anciens :

```json
{
  "id": "evt-20261101T203200Z-marcel",
  "at": "2026-11-01T20:32:00.000Z",
  "kind": "npc_reply",
  "speaker": "Marcel",
  "target": "Marcel",
  "text": "J'étais près de la bergerie. Mais j'ai entendu quelque chose derrière la haie..."
}
```

4. Mettre `pending` à `null` et actualiser `updatedAt`.
5. Si le MJ demande une nouvelle narration, actualiser `scene` et ajouter un événement `kind: "scene"`. Ne changer `phase`, `day`, rôles ou personnes éliminées que sur décision du MJ ou selon les règles convenues.
6. Remplacer le fichier sur GitHub avec son **SHA à jour**. En cas de conflit, relire le fichier, réappliquer uniquement les nouveaux événements et recommencer ; ne jamais écraser les derniers choix du joueur.
7. Confirmer au MJ que la réplique est enregistrée. L'application la récupère en vérifiant le dépôt lorsque la synchronisation est active.

## Limites techniques et sécurité

GitHub Pages est statique : les clics de l'application **ne déclenchent pas directement** un message ChatGPT ; il faut que le MJ lui demande de continuer. L'application peut récupérer les nouveaux événements à intervalle régulier via l'API GitHub.

Le navigateur nécessite un jeton GitHub fine-grained limité au dépôt et à la permission `Contents: Read and write` pour les données privées. Il est conservé **en mémoire de l'onglet uniquement**, jamais dans le dépôt ni dans le JSON, et ne doit jamais être envoyé dans le chat.

Pour conserver la confidentialité des dialogues d'un enfant, les sauvegardes restent dans un dépôt privé et ne doivent pas être publiées dans un dépôt Pages public. Même un dépôt Pages privé autorisé par l'abonnement peut produire un **site public**.

La lecture vocale locale (`speechSynthesis`) est disponible ; la génération et l'archivage de fichiers audio ne sont pas encore inclus dans le salon. Les rôles spéciaux restent soumis à l'arbitrage du MJ.
