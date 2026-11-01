# Thiercelieux Solo — Assistant de maître du jeu

Jeu de rôle solo (un joueur et un maître du jeu), avec les rôles et scénarios du projet.

## Salon de partie (nouveau)

Ouvrir [session.html](./session.html) pour créer une partie, obtenir un identifiant `LG-AAAAMMJJ-XXXXXX`, interroger les habitants, explorer, gérer les phases jour/nuit et accéder au journal.

- Fonctionne directement dans le navigateur, en local (stockage local du navigateur).
- Synchronisation facultative des états JSON via l'API GitHub dans la **branche `parties`**, dossier `sessions/`.
- ChatGPT connecté à GitHub peut retrouver la partie et y ajouter une narration ou la réponse d'un PNJ en suivant [le protocole](./docs/PROTOCOLE_CHATGPT.md).
- Les réponses vocales utilisent la synthèse du navigateur, sans serveur vocal.

### GitHub Pages

Pour l'interface HTML : choisir une source de publication dans **Settings → Pages**. Sur GitHub Free, un dépôt Pages doit être public. Pour conserver les dialogues et secrets privés, garder le dépôt de données `trexdbg/loup-garou` **privé** et publier l'interface dans un dépôt public séparé, ou utiliser GitHub Pro pour publier Pages depuis ce dépôt privé (le site lui-même reste public).

Pour accéder aux données privées depuis le navigateur, le maître du jeu peut saisir un **fine-grained personal access token** GitHub, limité à ce seul dépôt, autorisation **Contents: Read and write**. Ce jeton reste dans la mémoire de l'onglet : il n'est pas sauvegardé dans les parties ni dans le code et ne doit jamais être envoyé à ChatGPT ou à l'enfant. Les journaux peuvent contenir des données d'un enfant : ne pas publier les sauvegardes.

### Limites du prototype

ChatGPT ne reçoit pas automatiquement chaque clic : il faut lui demander oralement d'ouvrir une partie et de répondre aux événements en attente. Le salon vérifie régulièrement les modifications du dépôt quand il est connecté. Le moteur automatise les actions essentielles ; les rôles rares, les victimes et les règles spéciales sont arbitrés par le maître du jeu.

Le fichier `index.html` correspond à l'interface initiale du jeu, et `audio.js` à une expérimentation de bruitages et d'ambiances.
