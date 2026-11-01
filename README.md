# Thiercelieux Solo 🌙

**Assistant de maître du jeu pour un adulte + un seul joueur (dès 10 ans).** Aventures originales inspirées de l'univers et des mécaniques des *Loups-Garous de Thiercelieux*.

> Projet indépendant, non officiel. Les résumés sont originaux. Certaines illustrations officielles sont affichées depuis le site de l'éditeur, sans être copiées dans ce dépôt. Elles restent la propriété de leurs ayants droit. Pour arbitrer les pouvoirs, les cartes et livrets officiels font foi.

## ▶ Jouer immédiatement

1. Téléchargez le dépôt ou clonez-le : `git clone https://github.com/trexdbg/loup-garou.git`.
2. Ouvrez **`index.html`** dans un navigateur récent (Chrome, Edge, Firefox).
3. Choisissez un scénario, un prénom et un rôle **au choix ou tiré au sort**.
4. Lisez l'introduction à voix haute. Le MJ peut ouvrir le panneau **🔒 Secrets MJ**, à l'abri des regards du joueur.

**Aucun compte, serveur, paquet npm ni clé API n'est nécessaire pour jouer.** Les données sont sauvegardées dans le stockage local du navigateur. Le moteur de jeu fonctionne hors ligne ; **l'affichage des illustrations originales nécessite Internet**, et bascule sur les icônes de rôle si une image n'est pas disponible. Le bouton **Reprendre la partie sauvegardée** recharge la session en cours. L'option 🔊 utilise la synthèse vocale disponible dans certains navigateurs.

## 🎲 Déroulement d'une partie

1. **Prologue** : le MJ lit l'amorce et incarne les habitants. Le joueur reçoit sa carte de rôle (tous les autres rôles sont secrets).
2. **Le village s'endort** : le MJ lit l'annonce de nuit, fait fermer les yeux, appelle les personnages et laisse le joueur activer son pouvoir nocturne.
3. **Le village se réveille** : le moteur détermine la victime des Loups, en tenant compte des pouvoirs solo pris en charge. Il prépare une annonce à lire.
4. **Journée** : le joueur rencontre les habitants, choisit des sujets de conversation, peut poser des questions libres et explore des lieux pour découvrir des indices. Le MJ peut toujours improviser hors interface.
5. **Conseil et vote** : le joueur accuse une personne, les villageois non joueurs votent selon leurs soupçons et les indices récoltés. Une égalité n'entraîne pas d'élimination dans la variante solo.
6. **Nouvelle nuit** : on répète jusqu'à la victoire d'un camp, à une décision du MJ ou à la fin du nombre de tours prévu.

Le rythme visé est de **30 à 60 minutes**. La durée paramétrée influence le nombre maximal de tours (3, 4 ou 5). Une partie peut finir avant si une condition de victoire est atteinte.

## 🏘 Les cinq aventures originales

| Scénario | Ton | Durée indicative |
| --- | --- | --- |
| 💍 Le sac de Marcel | Neige, bague mystérieuse, suspicion | 45 min |
| 🔔 Les douze coups du clocher | Horloge sabotée, alibis | 35 min |
| 🏮 La nuit des lanternes | Fête de la moisson, indices dans les champs | 50 min |
| 🎭 Le bal des masques | Château, costumes, passage secret | 40 min |
| 🌲 Les murmures de la forêt | Exploration, pistes et cabane abandonnée | 60 min |

Chaque scénario contient **sept habitants joués par le MJ**, avec métier, caractère, alibi, rumeur, secret et détails à exploiter en dialogue, plus quatre lieux à fouiller. Les Loups sont attribués à la création de la partie. Les scènes et les réponses sont construites localement à partir de textes et de variables contextuelles : **ce n'est pas une IA conversationnelle libre**. Le MJ improvise si le joueur tente une action non prévue.

## 🃏 Catalogue de 37 rôles

Le sélecteur couvre les rôles des grandes éditions francophones :

- **Base** : Simple Villageois, Loup-Garou, Voyante, Sorcière, Chasseur, Cupidon, Petite Fille, Voleur.
- **Nouvelle Lune** : Ancien, Bouc Émissaire, Idiot du Village, Salvateur, Joueur de Flûte.
- **Le Village** : Corbeau, Pyromane.
- **Personnages** : Grand Méchant Loup, Infect Père des Loups, Chevalier à l'Épée Rouillée, Renard, Deux Sœurs, Trois Frères, Juge Bègue, Montreur d'Ours, Comédien, Servante Dévouée, Chien-Loup, Enfant Sauvage, Villageois-Villageois, Ange, Abominable Sectaire, Loup-Garou Blanc, ainsi que Gitane et Garde Champêtre (bonus).
- **Anniversaire 2026** : Colosse, Singe Savant, Marionnettiste, Puissante Mère des Loups.

Le Capitaine est une **fonction supplémentaire**, pas une carte de rôle unique ; les métiers de l'extension *Le Village* et les événements *Nouvelle Lune* sont des modules de règles distincts. Ils ne sont pas encore modélisés comme pouvoirs automatiques.

### Ce qui est automatisé / ce qui est arbitré

**Automatisé ou assisté** : distribution des rôles NPC, choix et révélation de la Voyante, protection du Salvateur, potions de la Sorcière (version simplifiée), flair du Renard, pénalité du Corbeau, attaque principale des Loups, protection initiale de l'Ancien, effet défensif du Marionnettiste, première condamnation de l'Idiot, votes et conditions de victoire village/Loups.

**Aide du MJ nécessaire** : pouvoirs liés aux amoureux, changements de camps, choix initiaux spéciaux, rôles solitaires, attaques supplémentaires, infections, interactions avec les bâtiments, événements, effets propres à la version 2026 et exceptions de règles. Le MJ peut attribuer manuellement n'importe quel rôle à chaque habitant, ainsi qu'éliminer ou rétablir un personnage.

**Adaptations assumées au format solo** : les PNJ remplacent les sept autres joueurs ; la cible automatique des Loups est un PNJ (le héros peut être mis en danger par le MJ) ; les débats sont des dialogues dirigés, le vote est une simulation pondérée, et les pouvoirs complexes suivent l'arbitrage du MJ. Les objectifs individuels des rôles solitaires doivent être contrôlés manuellement. Ne présentez pas ce mode comme une reproduction exhaustive du jeu à 8–28 joueurs.

## 💬 Conseils pour l'adulte MJ

- Chaque habitant possède une **voix, un métier et des motivations** : ne révélez pas sa carte pendant les interrogatoires.
- Posez des questions au joueur (« Qui veux-tu interroger ? », « Quel détail t'intrigue ? ») avant de lui proposer des boutons.
- Pour un enfant de 10 ans, privilégiez une peur légère, des révélations mystérieuses et des décisions sans violence graphique.
- Sur la nuit : **« Le village s'endort. Tous les habitants ferment les yeux… Les Loups-Garous, réveillez-vous. »** Faites une courte pause, puis appelez les rôles adaptés à la partie.
- Utilisez **Secrets MJ** seulement quand le joueur ne voit pas l'écran ; ce panneau affiche les vrais rôles et les secrets des dialogues.
- Si une carte de votre boîte diffère du résumé ici, **la carte/le livret officiel fait foi**.

## 🖼 Visuels des cartes

Le **catalogue**, l'**aperçu du rôle**, la **carte du joueur** et le panneau **Secrets MJ** affichent, lorsque leur correspondance a été vérifiée, l'illustration authentique du rôle. Les illustrations proviennent des publications [Asmodee](https://www.asmodee.fr/les-roles-des-loups-garous-de-thiercelieux-que-vous-allez-adorer/) ; les fiches de rôle pointent vers le [wiki Loup-Garou](https://loupgarou.fandom.com/fr/wiki/Liste_des_r%C3%B4les). Les images ne sont **pas** incluses dans les fichiers du dépôt.

Les 10 correspondances actuellement référencées : **Sorcière, Voyante, Chasseur, Cupidon, Renard, Deux Sœurs, Trois Frères, Enfant Sauvage, Loup-Garou Blanc et Joueur de Flûte**. Pour les autres rôles, une icône neutre apparaît en attendant de vérifier **leur propre illustration**. Il est interdit d'utiliser l'image du Grand Méchant Loup pour le Chien-Loup, ou inversement.

La provenance et l'identité des images sont centralisées dans `role-art.js` (une URL par ID de rôle). La mention sur un wiki, même sous licence générale CC BY-SA pour les textes communautaires, **ne constitue pas une autorisation de republier les dessins commerciaux**. Les visuels restent la propriété de leurs auteurs/éditeurs ; pour les embarquer localement ou les redistribuer, obtenir une autorisation explicite. L'intégration dépend de la disponibilité et des conditions d'accès du site source.

### GitHub Pages

Le projet est un site statique prêt à être publié sur GitHub Pages. Pour l'activer : dans le dépôt, ouvrir **Settings → Pages → Build and deployment → Deploy from a branch → `main` → `/(root)` → Save**. Une fois publié, l'adresse habituelle est `https://trexdbg.github.io/loup-garou/`. L'activation effective de Pages doit être vérifiée dans les paramètres du dépôt.

## 🧪 Tests

Une installation de **Node.js 18+** suffit :

```bash
npm test
```

Les tests vérifient la structure du catalogue, la cohérence des scénarios, le chemin prologue → nuit → jour → indices → vote, et le démarrage des 37 rôles.

## 🧱 Fichiers

- `index.html` : écran de préparation, narration, conversations, actions et secrets MJ.
- `styles.css` : interface responsive, lisible sur téléphone et ordinateur.
- `roles.js` : catalogue des rôles et leurs pouvoirs résumés.
- `role-art.js` : association stricte entre rôles, illustrations officielles vérifiées et fiches wiki, avec repli visuel.
- `stories.js` : les cinq aventures originales, leurs habitants et leurs indices.
- `app.js` : état de partie, rôles secrets, dialogues, votes, sauvegarde et phases.
- `tests/smoke.test.cjs` : tests de fumée sans dépendances.
- `docs/dialogues-ia.md` : mode d'emploi pour improviser des dialogues avec ChatGPT si vous le souhaitez.

## 🚧 Pistes d'évolution

1. Pack d'événements de *Nouvelle Lune*, métiers et bâtiments du *Village*, et rôle de Capitaine.
2. Moteur avancé de pouvoirs avec ordre de résolution nocturne, amoureux, contaminations et objectifs solitaires.
3. Dialogues véritablement générés par IA (optionnels) avec secrets MJ protégés, et mémoire narrative.
4. Campagnes en plusieurs épisodes, personnages persistants, carte du village et débrief des décisions.
5. Mode double écran ou téléphone MJ + écran joueur pour protéger les informations confidentielles.

**Références des rôles** : [Asmodee — gamme](https://www.asmodee.fr/gamme/les-loups-garous-de-thiercelieux/), [Extension Personnages](https://www.asmodee.fr/product/loups-garous-personnages-ext/), [Édition 25 ans](https://www.asmodee.fr/tout-savoir-sur-les-nouveaux-personnages-des-loups-garous-de-thiercelieux-a-decouvrir-dans-ledition-collector-25-ans/).
