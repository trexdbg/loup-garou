# Thiercelieux Solo — ChatGPT + GitHub + application d'affichage 🌙

Une aventure de **Loups-Garous de Thiercelieux** pour **1 joueur (dès 10 ans) et 1 maître du jeu adulte**. Le MJ humain conserve le dernier mot. ChatGPT raconte, incarne tous les PNJ et assure la continuité narrative. GitHub archive les étapes. L'application GitHub Pages sert exclusivement à **configurer** et **consulter** les parties.

Projet indépendant, non officiel. Les illustrations officielles restent liées depuis leurs sources tierces, sans être copiées dans ce dépôt.

## Ouvrir l'application

**GitHub Pages :** https://trexdbg.github.io/loup-garou/

Si la page est absente, ouvrir Settings → Pages → Source → GitHub Actions et vérifier le workflow de déploiement.

## Comment jouer

1. Dans l'onglet **Préparer**, choisir un mode **Classique**, **Avancé** ou **Expert**, puis remplir les paramètres : scénario, joueur, rôle choisi ou aléatoire, durée, nombre de PNJ, cartes autorisées, ambiance et aides au MJ.
2. Cliquer sur **Générer l'identifiant et le JSON**. Exemple d'ID : `LG-20261101-010203040506`. Cet ID n'est encore qu'une proposition locale : il ne crée pas directement de dossier GitHub.
3. Cliquer sur **Copier pour ChatGPT** (recommandé) puis coller le texte dans **une conversation du projet ChatGPT Loup garou**. Le prompt inclut le JSON et le protocole de création.
4. ChatGPT retrouve l'ID, vérifie qu'il n'existe pas, crée le répertoire `parties/<ID>/` via la connexion GitHub **si celle-ci est disponible**, met à jour `parties/index.json`, prépare uniquement **le prologue**, puis attend le MJ.
5. La conversation ChatGPT devient le **jeu**. L'enfant parle librement ; ChatGPT joue les PNJ, propose les scènes et rappelle les règles au MJ. Chaque action ou transition significative doit être validée par le MJ avant archivage.
6. Dans l'onglet **Mes parties**, retrouver l'ID et lire narrations, journal et dialogues publiés dans GitHub. Le bouton **🗝️ Afficher le carnet secret du MJ** charge automatiquement les rôles de la partie depuis `secrets_mj.json` et permet aussi de les modifier ou importer localement. Un bouton **Actualiser** recharge les données publiques.
7. Pour les **voix automatiques**, ouvrir la partie puis cliquer une seule fois sur « Activer les voix » (déblocage audio mobile). Chaque nouvelle réplique publique ajoutée par ChatGPT est ensuite détectée et prononcée avec la voix du personnage.

**Le lecteur vocal vérifie les dialogues publics sur GitHub environ toutes les 6 secondes après activation : un message dans ChatGPT n'est pas audible avant son archivage effectif. Il n'existe pas de synchronisation directe automatique depuis une conversation ChatGPT vers un navigateur.** Les écritures ont lieu lors des interventions explicites de ChatGPT disposant du connecteur GitHub. GitHub Pages se republie après chaque commit sur `main` ; un léger délai de publication est normal. Pour consulter un fichier qui vient d'être créé mais n'est pas encore disponible dans Pages, le lecteur tente aussi la version GitHub publique.

## Répartition des responsabilités

| Élément | Responsabilité | N'effectue jamais |
|---|---|---|
| Application GitHub Pages | Génération du JSON et de l'ID, modes, catalogue de 37 rôles, carnet local MJ et lecture des archives | Jeux de rôles, votes, choix des PNJ, écriture GitHub |
| ChatGPT | Prologue, interprétation des PNJ, dialogues, arbitrage proposé, écriture des fichiers autorisés | Remplacer les décisions du joueur ou les validations du MJ |
| MJ humain | Décisions définitives, rythme, interprétation, règles spéciales et révélations | Obligation de suivre une action suggérée |
| GitHub | Historique, fichiers publics de partie et index de consultation | Exécuter la partie lui-même |

### Protocole d'archivage

Documentation complète : [docs/contrat-chatgpt.md](docs/contrat-chatgpt.md).

```text
parties/
  index.json                  # liste des parties publiques (mise à jour par ChatGPT)
  LG-YYYYMMDD-XXXXXXXXXXXX/
    parametres.json           # paramètres complets, rôle fixé inclus
    partie.json               # statut, titre, phase, état visible par le joueur
    secrets_mj.json           # rôles et notes du MJ (accessible dans le dépôt public)
    narrations.md             # uniquement les scènes effectivement préparées ou jouées
    dialogues.ndjson          # dialogues publics confirmés, un JSON par ligne
    journal.md                # événements et décisions validées
```

Les narrations futures ne sont jamais écrites d'avance. Lors du lancement, seul le prologue est créé. À chaque étape suivante, le MJ choisit et ChatGPT ajoute seulement ce qui s'est passé.

### Narration des nouvelles parties — Loup-Garou traditionnel

**Dès le début, tous les habitants savent que des Loups-Garous se cachent au village.** Le seul grand mystère est leur identité. La partie consiste à échanger, mentir ou bluffer, utiliser les pouvoirs nocturnes, débattre puis voter, étape par étape avec validation du MJ. Prologue de 3 à 6 phrases ; aucun puzzle, lanterne magique, prophétie, énigme de cloche, objet à récupérer ni intrigue parallèle. L'ambiance peut varier, mais jamais le cœur du jeu. Le configurateur ne propose plus d'anciens scénarios d'enquête annexes.

## Modes de jeu (personnalisables)

| Mode | Rôles proposés | Fonctionnement |
|---|---|---|
| **Classique** | Simple Villageois, Loup-Garou, Voyante, Sorcière, Chasseur, Cupidon, Petite Fille | Parties accessibles, peu d'interactions difficiles à arbitrer. |
| **Avancé** | Classique + Voleur, Ancien, Bouc Émissaire, Idiot du Village, Salvateur, Corbeau, Chevalier à l'Épée Rouillée, Renard, Montreur d'Ours, Grand Méchant Loup | Plus de pouvoirs, stratégies et contraintes de voisinage. |
| **Expert** | Les 37 rôles disponibles, incluant loups spéciaux, indépendants, changements de camp et cartes de l'édition anniversaire | Les interactions complexes sont validées par le MJ, jamais inventées par l'application. |

Un mode initialise la **liste autorisée** des rôles, mais n'impose pas que toutes les cartes soient distribuées. On peut cocher/décocher individuellement les cartes avant de générer le JSON. ChatGPT compose une répartition adaptée au nombre de personnages et au nombre de Loups demandé, puis attend l'accord du MJ.

## Figurines LEGO et ordre de voisinage

Chaque partie comporte un plan circulaire validé par le MJ. Une figurine LEGO représente chaque personnage, avec une carte cachée sous la figurine. Dans **Mes parties**, les places se réorganisent avec ← / →, et les figurines retirées sont exclues des trios voisins. Le **carnet secret du MJ** vérifie le flair du Renard sans révéler l'identité du Loup au joueur. Le plan public n'est archivé qu'après copie de la consigne vers ChatGPT. [Règles détaillées du placement](docs/placement-lego.md).

## Carnet secret du MJ dans l'application

1. Ouvrir une partie depuis **Mes parties**, puis cliquer sur **Afficher le carnet secret du MJ**. Les noms du joueur et des habitants proviennent des données *publiques* de `partie.json` lorsqu'ils y figurent.
2. Le carnet charge automatiquement les rôles validés depuis `secrets_mj.json` quand le MJ ouvre son panneau. Si le chargement échoue, assigner les rôles avec les menus déroulants ou coller dans le champ d'import le **JSON des rôles** envoyé par ChatGPT. Format attendu :

```json
{
  "id": "LG-20261101-0123456789AB",
  "roles": [
    {"personnage": "Alex", "role": "renard"},
    {"personnage": "Agathe", "role": "loup"},
    {"personnage": "Basile", "role": "voyante"}
  ]
}
```

3. Les cartes sont présentées avec les images officielles **uniquement si elles sont vérifiées** par `role-art.js`. La liste peut être modifiée manuellement par le MJ. Un personnage dont le rôle n'est pas connu reste « Rôle inconnu ».
4. Le carnet est **masqué par défaut** et se conserve en mémoire de session du navigateur. La case facultative « Conserver sur cet appareil » utilise le stockage local non chiffré : **ne pas l'activer sur un appareil partagé**. On peut exporter un fichier privé et effacer les rôles locaux. Masquer systématiquement le panneau avant de passer l'écran à l'enfant.

**Important :** les rôles archivés dans `secrets_mj.json` sont chargés automatiquement **à l'ouverture du panneau secret du MJ uniquement**. Le dépôt GitHub étant public, ce panneau est une aide d'affichage et ne constitue pas une protection de confidentialité. L'import et l'édition manuels restent possibles ; les modifications locales ne réécrivent pas GitHub.

### ⚠️ Spoilers MJ et visibilité sur GitHub

**Décision du MJ (2 novembre 2026) :** pour les nouvelles parties, GitHub peut archiver les rôles, secrets, indices et notes du MJ dans `parties/<ID>/secrets_mj.json`. Le rôle choisi par le joueur peut rester dans `parametres.json`. `partie.json`, `narrations.md`, `journal.md` et `dialogues.ndjson` restent exempts de spoilers avant leur révélation dans le jeu.

**Attention : le dépôt `trexdbg/loup-garou` est public.** Toute personne qui visite le dépôt ou son historique peut lire `secrets_mj.json` et connaître les rôles. Masquer l'onglet MJ dans GitHub Pages ne procure aucune confidentialité technique. Ne stocker aucune donnée personnelle ou mot de passe dans ces fichiers. Si une protection réelle devient nécessaire, utiliser un dépôt privé.

La page de consultation et le lecteur audio ne chargent pas automatiquement `secrets_mj.json` ; seuls les fichiers de narration et d'état destinés au joueur sont affichés dans le parcours ordinaire.

## Ressources conservées

- [roles.js](roles.js) + [modes.js](modes.js) : catalogue des **37 rôles**, presets Classique / Avancé / Expert et leurs résumés.
- [mj-private.js](mj-private.js) : carnet de rôles privé, assignation locale par personnage, import/export du JSON MJ.
- [role-art.js](role-art.js) : association vérifiée aux illustrations authentiques et fiches wiki ; pas d'image empruntée à un autre rôle.
- [stories.js](stories.js) : cinq trames facultatives (ChatGPT peut en créer de nouvelles).
- [launcher.js](launcher.js) + [launcher.css](launcher.css) + [index.html](index.html) : nouvelle application de configuration / consultation.
- [app.js](app.js) + [audio.js](audio.js) : ancien moteur local conservé à titre historique, **non chargé par le nouveau site**.
- [STOCKAGE.md](STOCKAGE.md) : conservation limitée des médias et journaux.
- [tests](tests) : tests sans dépendances, lancer avec `npm test` sous Node.js 18+.

Les enregistrements audio propres aux parties sont facultatifs et éphémères : ne pas commiter de longs MP3 générés dans GitHub. Un workflow de nettoyage existe pour les parties terminées.

L'univers, les règles et les cartes appartiennent à leurs ayants droit. Pour vérifier un pouvoir complexe, se référer aux cartes physiques et aux livrets officiels.

## Voix automatiques progressives

- `voice-live.js` associe une voix française et un profil de hauteur/débit à Agathe, Basile, Clémence, Gaston, Iris, Malo, Rosalie et au Narrateur. Les voix disponibles varient selon le navigateur et l'appareil du MJ.
- **Activation initiale une seule fois** : les navigateurs peuvent bloquer le son tant que l'utilisateur n'a pas touché le site. Ensuite, les nouvelles lignes publiques du `dialogues.ndjson` de la partie sont prononcées dans l'ordre avec la voix du personnage, sans clic par dialogue. Il faut laisser la page ouverte.
- La progression de lecture est mémorisée dans la session du navigateur. Le bouton pause interrompt la lecture ; « Réécouter les 3 dernières » permet de répéter une scène courte.
- Les voix sont **synthétisées à la volée (Web Speech)** : aucun MP3 n'est produit ni conservé dans GitHub. La qualité et la diversité des voix dépendent de l'appareil.
- ChatGPT continue de gérer les réactions et les décisions dans la conversation, sous validation du MJ, et doit écrire chaque nouveau dialogue dans GitHub. L'application reste en **lecture seule**.
- Les secrets archivés dans `secrets_mj.json` ne sont pas envoyés au lecteur vocal ; seul le dialogue joué est prononcé.

### Voix neuronales gratuites : Piper (mode principal)

**Aucun abonnement, aucune API, aucune clé, aucun paiement.** L'application utilise désormais Piper TTS (voix de synthèse neuronales françaises exécutées directement par le téléphone ou le navigateur) lorsque le MJ clique sur « Démarrer les voix gratuites ».

- Deux voix françaises de base, `fr_FR-siwis-medium` et `fr_FR-tom-medium`, sont associées de manière fixe aux PNJ, avec de petites variations de débit pour distinguer leurs personnalités. Cela ne crée pas huit comédiens différents ; la qualité est à écouter et à ajuster sur l'appareil.
- Téléchargement **à la demande au premier usage** : environ 127 Mo de modèles pour les deux voix, plus le moteur de synthèse et ses ressources. Les modèles sont normalement mis en cache par le navigateur ; ils ne sont jamais commités sur GitHub.
- Chaque nouvelle réplique validée est lue dans l'ordre. La génération s'effectue sur l'appareil, sans coût par caractère. Certains téléphones peuvent prendre du temps ou échouer à charger les modèles : dans ce cas, retour automatique au moteur vocal classique.
- Le texte des dialogues reste public dans les archives comme auparavant ; les secrets MJ peuvent désormais être archivés séparément dans `secrets_mj.json` sur GitHub.
- Librairie de synthèse : `@diffusionstudio/vits-web@1.0.3` (MIT) chargée dynamiquement depuis esm.sh ; modèles Piper disponibles sur Hugging Face. Connexion nécessaire au premier téléchargement, performances variables selon la mémoire et le navigateur.
- Configuration : `tts-config.json` définit `provider: piper_local` et `enabled: true`. L'ancienne intégration ElevenLabs sous `tts-worker/` est un prototype **désactivé, non nécessaire et non déployé** ; l'utilisation normale reste gratuite.

Ce changement concerne uniquement la lecture vocale des archives publiques et ne remplace ni ChatGPT (dialogues et progression) ni le MJ (décisions). Aucun événement supplémentaire de la partie en cours n'est généré.
