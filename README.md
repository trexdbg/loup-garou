# Thiercelieux Solo 🌙

**Assistant de maître du jeu pour un adulte + un seul joueur (dès 10 ans).** Aventures originales inspirées de l'univers et des mécaniques des *Loups-Garous de Thiercelieux*.

> Projet indépendant, non officiel. Les illustrations officielles sont liées depuis des sites tiers et ne sont pas copiées dans le dépôt ; les résumés de règles sont originaux. Pour arbitrer les pouvoirs spéciaux, utilisez les cartes et livrets dont vous disposez.

## ▶ Jouer immédiatement

1. Téléchargez le dépôt ou clonez-le : `git clone https://github.com/trexdbg/loup-garou.git`.
2. Ouvrez **`index.html`** dans un navigateur récent (Chrome, Edge, Firefox).
3. Choisissez un scénario, un prénom et un rôle **au choix ou tiré au sort**.
4. Lisez l'introduction à voix haute. Le MJ peut ouvrir le panneau **🔒 Secrets MJ**, à l'abri des regards du joueur.

**Aucun compte, serveur, paquet npm ou clé API n'est nécessaire. Le moteur fonctionne hors ligne, mais les illustrations authentiques sont chargées via Internet.** Les données sont sauvegardées dans le stockage local du navigateur. Le bouton **Reprendre la partie sauvegardée** recharge la session en cours. L'option 🔊 utilise la synthèse vocale disponible dans certains navigateurs.

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

## 🖼 Cartes de rôles authentiques

**30 des 37 rôles** possèdent une illustration identifiable. Les vrais dessins du jeu viennent notamment d'illustrations publiées par [Asmodee](https://www.asmodee.fr/les-roles-des-loups-garous-de-thiercelieux-que-vous-allez-adorer/) et de planches légendées de [l'extension Personnages](https://www.play-in.com/en/produit/298465/les-loups-garous-de-thiercelieux-extension-personnages-2019). Les planches sont recadrées uniquement par CSS, sans copier les images dans le dépôt. Chaque rôle conserve sa propre correspondance et un lien vers sa [fiche wiki](https://loupgarou.fandom.com/fr/wiki/Liste_des_r%C3%B4les). Un lien supplémentaire renvoie vers l'hébergeur de l'illustration.

**Restent sans illustration vérifiée :** Corbeau, Pyromane, Garde Champêtre, Colosse, Singe Savant, Marionnettiste et Puissante Mère des Loups. Les rôles concernés affichent leur icône ; ils ne reçoivent jamais l'image d'une autre carte. Les images appartiennent à leurs ayants droit, leur présence sur un wiki ou chez un marchand n'autorise pas leur redistribution. Leur affichage dépend de l'autorisation de chargement des sites tiers.

### Publication GitHub Pages

Le workflow [`.github/workflows/pages.yml`](.github/workflows/pages.yml) exécute les tests et publie exclusivement les fichiers statiques nécessaires à l'interface, sans inclure les archives de parties. **Une activation initiale reste nécessaire dans GitHub : Settings → Pages → Source : GitHub Actions.** Puis vérifier le déploiement dans l'onglet Actions. Adresse attendue après succès : `https://trexdbg.github.io/loup-garou/`. Les sauvegardes restent stockées dans le navigateur tant qu'une synchronisation de partie n'a pas été mise en place.

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
- `role-art.js` : correspondance entre rôles et illustrations, avec liens de source et affichage de secours.
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


## 🎧 Régie sonore et espace de stockage

Une régie permet au maître du jeu de déclencher les ambiances (nuit, journée, forêt), les hurlements de loup, la cloche, les pas, les portes, le suspense et les révélations. Le narrateur lit les scènes, et chaque habitant dispose d'une voix différenciée dans la limite des voix françaises disponibles sur l'appareil. Les consignes réservées au MJ ne sont pas prononcées. Le volume et les types de sons sont réglables ; l'arrêt est immédiat. Certaines voix système demandent une connexion Internet.

Les bruitages et ambiances sont générés par Web Audio sans stocker de fichier. Des petits MP3 réutilisables sont facultatifs dans [assets/audio](assets/audio/README.md) : en leur absence, la synthèse sonore reste active.

**Les fichiers vocaux propres à chaque partie ne doivent pas être commités sur GitHub.** Consulter [STOCKAGE.md](STOCKAGE.md) : un nettoyage automatique quotidien efface, après **14 jours**, les dialogues et sons temporaires des parties **explicitement terminées**, avec un budget cible de **50 Mio**. Les parties en cours, les scènes, les notes du MJ et les sons marqués « archive » sont préservés. Une suppression dans Git ne réduit pas automatiquement la taille de son historique, d'où l'importance de générer le contenu éphémère hors dépôt.

Simulation : \`python3 scripts/prune_transient_assets.py\` ; purge effective : \`python3 scripts/prune_transient_assets.py --apply\`.
