# Thiercelieux — Régie privée du maître du jeu 🌙

Une aventure de **Loups-Garous de Thiercelieux** pour **1 joueur (dès 10 ans) et 1 maître du jeu adulte**. Le MJ humain conserve le dernier mot. ChatGPT raconte, incarne tous les PNJ et assure la continuité narrative. GitHub archive les étapes. L'application GitHub Pages est une **régie exclusivement destinée au MJ** : les joueurs ne consultent jamais l'écran. Elle permet de préparer et d'animer les parties, sans prendre de décisions ni écrire elle-même sur GitHub.

Projet indépendant, non officiel. Les illustrations officielles restent liées depuis leurs sources tierces, sans être copiées dans ce dépôt.

## Ouvrir l'application

**GitHub Pages :** https://trexdbg.github.io/loup-garou/

Si la page est absente, ouvrir Settings → Pages → Source → GitHub Actions et vérifier le workflow de déploiement.

## Régie du maître du jeu

L'application s'ouvre sur **Régie des parties**, et retrouve la dernière partie ouverte. La création d'une nouvelle partie se trouve dans l'onglet **+ Nouvelle partie**.

Dans une partie, le MJ voit, dans cet ordre :
- **Tableau de bord** : phase, jour/nuit, vivants, dernière scène, prochaines actions et étapes de nuit déjà jouées.
- **Consignes ChatGPT** : recopier la prochaine action, reprendre l'état ou demander une synchronisation GitHub. Aucune consigne n'exécute d'action tant que le MJ ne l'a pas transmise à ChatGPT.
- **Régie audio** : jouer, arrêter ou réécouter les dialogues publics ; voix Gemini si disponibles, sinon voix locales. Les messages de suite respectent la phase (pas de débat artificiel au milieu de la nuit).
- **Carnet secret** : rôles officiels, observation de la Voyante, victime désignée, décisions de la Sorcière et potions restantes ; ouvert directement sur l'écran du MJ, masquable d'un clic et automatiquement masqué si l'onglet perd sa visibilité.
- **Table LEGO** : placement circulaire, personnages retirés et contrôle confidentiel du Renard.
- **Notes du MJ** : notes conservées seulement dans la session du navigateur, non archivées automatiquement. Les archives complètes restent disponibles dans le panneau historique.

Le navigateur reste **en lecture seule sur GitHub** ; les boutons préparent seulement des consignes pour la conversation ChatGPT du MJ. Toute phase, vote, pouvoir du joueur ou élimination exige une décision ou validation explicite du MJ.

### Publication et confidentialité

GitHub Pages peut être légèrement en retard par rapport à la branche `main`. Pour l'état des parties, l'application privilégie les fichiers bruts du dépôt et dispose d'un bouton **Actualiser cette partie**. Les MP3 proviennent de l'artefact de publication Pages ; une réplique manquante utilise la voix locale. **Le dépôt est public : les rôles et les notes du MJ archivés en JSON ne sont pas secrets pour quiconque consulte GitHub.**

## Comment jouer

1. Dans l'onglet **+ Nouvelle partie**, choisir un mode **Classique**, **Avancé** ou **Expert**, puis remplir les paramètres : scénario, joueur, rôle choisi ou aléatoire, durée, nombre de PNJ, cartes autorisées, ambiance et aides au MJ.
2. Cliquer sur **Générer l'identifiant et le JSON**. Exemple d'ID : `LG-20261101-010203040506`. Cet ID n'est encore qu'une proposition locale : il ne crée pas directement de dossier GitHub.
3. Cliquer sur **Copier pour ChatGPT** (recommandé) puis coller le texte dans **une conversation du projet ChatGPT Loup garou**. Le prompt inclut le JSON et le protocole de création.
4. ChatGPT retrouve l'ID, vérifie qu'il n'existe pas, crée le répertoire `parties/<ID>/` via la connexion GitHub **si celle-ci est disponible**, met à jour `parties/index.json`, prépare uniquement **le prologue**, puis attend le MJ.
5. La conversation ChatGPT devient le **jeu**. L'enfant parle librement ; ChatGPT joue les PNJ, propose les scènes et rappelle les règles au MJ. Chaque action ou transition significative doit être validée par le MJ avant archivage.
6. Dans **Régie des parties**, retrouver l'ID et les archives. Le carnet du MJ affiche les rôles et notes secrètes après chargement GitHub, avec un bouton pour les masquer. La régie propose des consignes de continuation et de synchronisation à copier.
7. Dans la **régie audio**, ouvrir la partie, actualiser les dialogues puis cliquer sur **▶ Écouter**. L’application lit uniquement la scène sélectionnée, dans l’ordre, sans lecture automatique. Alex parle ensuite librement : ChatGPT archive un nouveau lot de dialogues après validation du MJ.

**Le lecteur audio est manuel** : il lit `dialogues.ndjson` quand le MJ ouvre ou actualise la partie. Aucun polling toutes les six secondes et aucune synchronisation directe de ChatGPT vers le navigateur. Il faut que les dialogues soient d’abord archivés dans GitHub ; l’application ne modifie pas la partie.

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
- [voice-pool.js](voice-pool.js) + [voices/phonon-fr.json](voices/phonon-fr.json) : 15 personnages récurrents, 15 voix fixes et catalogue Phonon français.
- [role-art.js](role-art.js) : association vérifiée aux illustrations authentiques et fiches wiki ; pas d'image empruntée à un autre rôle.
- [stories.js](stories.js) : cinq trames facultatives (ChatGPT peut en créer de nouvelles).
- [launcher.js](launcher.js) + [launcher.css](launcher.css) + [index.html](index.html) : nouvelle application de configuration / consultation.
- [app.js](app.js) + [audio.js](audio.js) : ancien moteur local conservé à titre historique, **non chargé par le nouveau site**.
- [STOCKAGE.md](STOCKAGE.md) : conservation limitée des médias et journaux.
- [tests](tests) : tests sans dépendances, lancer avec `npm test` sous Node.js 18+.

Les enregistrements audio propres aux parties sont facultatifs et éphémères : ne pas commiter de longs MP3 générés dans GitHub. Un workflow de nettoyage existe pour les parties terminées.

L'univers, les règles et les cartes appartiennent à leurs ayants droit. Pour vérifier un pouvoir complexe, se référer aux cartes physiques et aux livrets officiels.

## Scènes audio manuelles — depuis le 2 novembre 2026

Le lecteur actif est `scene-player.js` (l'ancien `voice-live.js` reste conservé comme référence, mais n'est plus chargé). Chaque nouvelle réplique publique doit avoir un numéro `seq`, un identifiant `scene_id` et idéalement un `scene_label`. Les répliques de la même scène sont jouées dans l'ordre numérique ; les paroles déjà prononcées par le joueur (`dialogue_joueur`) sont affichées mais pas synthétisées.

**Parcours :** ouvrir la partie → **↻ Actualiser** → sélectionner la dernière scène → **▶ Écouter** → Alex interagit en vrai → le MJ transmet son intervention à ChatGPT → ChatGPT archive le prochain échange avec un nouvel identifiant → rafraîchir et réécouter. Les scènes déjà écoutées sont indiquées dans la session du navigateur. Le MJ peut copier une consigne pour continuer ou proposer la fin du tour de table, sans déclencher automatiquement de vote ni de nuit.

### Casting de 15 PNJ, chacun avec une vraie voix française Phonon

- **15 personnages permanents**, sélectionnables dans l'onglet Préparer (3 à 15 PNJ, 7 par défaut) : Rose, Salomé, Inès, Jade, Mila, Clémence, Iris, Zoé, Agathe, Hugo, Marin, Baptiste, Nils, Léon, Octave.
- **15 timbres Phonon différents**, issus du catalogue officiel Gradium (9 féminins, 6 masculins), attribués de manière fixe aux habitants, indépendamment de leurs rôles ou de leur camp secret. Le narrateur réutilise une des 15 voix ; Alex parle réellement.
- **Phonon 40M FR est prioritaire** : les répliques publiques sont transformées en MP3 lors de GitHub Actions. Les MP3 ne sont publiés que dans GitHub Pages et sont mis en cache dans Actions, **jamais commités**.
- Pour activer : accepter les conditions du modèle `gradium/phonon-40m-fr` sur Hugging Face, puis créer un secret GitHub **`HF_TOKEN`** en lecture. **Phonon français est sous licence CC BY-NC 4.0 (non commercial)**.
- **Secours** : Gemini (`GEMINI_API_KEY` déjà pris en charge), puis eSpeak-ng local, puis voix du navigateur. Aucune lecture automatique ; le MJ clique sur **▶ Écouter**.
- **Limites** : uniquement les scènes déjà validées, cache de 3 scènes récentes et plafond de 20 nouveaux clips Phonon par déploiement. Les requêtes Gemini restent soumises à leurs quotas si la génération Phonon échoue.

**Guide complet : [Configuration Phonon et attribution des 15 voix](docs/audio-phonon.md).**

La publication GitHub Pages peut prendre un court délai après les commits. L'application est en lecture seule ; toutes les décisions et écritures du jeu restent dans ChatGPT avec l’accord du MJ.
