# Thiercelieux Solo — ChatGPT + GitHub + application d'affichage 🌙

Une aventure de **Loups-Garous de Thiercelieux** pour **1 joueur (dès 10 ans) et 1 maître du jeu adulte**. Le MJ humain conserve le dernier mot. ChatGPT raconte, incarne tous les PNJ et assure la continuité narrative. GitHub archive les étapes. L'application GitHub Pages sert exclusivement à **configurer** et **consulter** les parties.

Projet indépendant, non officiel. Les illustrations officielles restent liées depuis leurs sources tierces, sans être copiées dans ce dépôt.

## Ouvrir l'application

**GitHub Pages :** https://trexdbg.github.io/loup-garou/

Si la page est absente, ouvrir Settings → Pages → Source → GitHub Actions et vérifier le workflow de déploiement.

## Comment jouer

1. Dans l'onglet **Préparer**, remplir les paramètres : scénario libre ou existant, joueur, rôle choisi ou aléatoire, durée, nombre de PNJ, sélection des cartes, difficulté, ambiance, options de règles et aides au MJ.
2. Cliquer sur **Générer l'identifiant et le JSON**. Exemple d'ID : `LG-20261101-010203040506`. Cet ID n'est encore qu'une proposition locale : il ne crée pas directement de dossier GitHub.
3. Cliquer sur **Copier pour ChatGPT** (recommandé) puis coller le texte dans **une conversation du projet ChatGPT Loup garou**. Le prompt inclut le JSON et le protocole de création.
4. ChatGPT retrouve l'ID, vérifie qu'il n'existe pas, crée le répertoire `parties/<ID>/` via la connexion GitHub **si celle-ci est disponible**, met à jour `parties/index.json`, prépare uniquement **le prologue**, puis attend le MJ.
5. La conversation ChatGPT devient le **jeu**. L'enfant parle librement ; ChatGPT joue les PNJ, propose les scènes et rappelle les règles au MJ. Chaque action ou transition significative doit être validée par le MJ avant archivage.
6. Dans l'onglet **Mes parties**, retrouver l'ID et lire narrations, journal et dialogues publiés dans GitHub. Un bouton **Actualiser** recharge les dernières données.
7. Pour les **voix automatiques**, ouvrir la partie puis cliquer une seule fois sur « Activer les voix » (déblocage audio mobile). Chaque nouvelle réplique publique ajoutée par ChatGPT est ensuite détectée et prononcée avec la voix du personnage.

**Le lecteur vocal vérifie les dialogues publics sur GitHub environ toutes les 6 secondes après activation : un message dans ChatGPT n'est pas audible avant son archivage effectif. Il n'existe pas de synchronisation directe automatique depuis une conversation ChatGPT vers un navigateur.** Les écritures ont lieu lors des interventions explicites de ChatGPT disposant du connecteur GitHub. GitHub Pages se republie après chaque commit sur `main` ; un léger délai de publication est normal. Pour consulter un fichier qui vient d'être créé mais n'est pas encore disponible dans Pages, le lecteur tente aussi la version GitHub publique.

## Répartition des responsabilités

| Élément | Responsabilité | N'effectue jamais |
|---|---|---|
| Application GitHub Pages | Génération du JSON et de l'ID, catalogue de 37 rôles, lecture des archives | Jeux de rôles, votes, choix des PNJ, écriture GitHub |
| ChatGPT | Prologue, interprétation des PNJ, dialogues, arbitrage proposé, écriture des fichiers autorisés | Remplacer les décisions du joueur ou les validations du MJ |
| MJ humain | Décisions définitives, rythme, interprétation, règles spéciales et révélations | Obligation de suivre une action suggérée |
| GitHub | Historique, fichiers publics de partie et index de consultation | Exécuter la partie lui-même |

### Protocole d'archivage

Documentation complète : [docs/contrat-chatgpt.md](docs/contrat-chatgpt.md).

```text
parties/
  index.json                  # liste des parties publiques (mise à jour par ChatGPT)
  LG-YYYYMMDD-XXXXXXXXXXXX/
    parametres.json           # paramètres EXPURGÉS des secrets
    partie.json               # statut, titre, phase, état PUBLIC
    narrations.md             # uniquement les scènes effectivement préparées ou jouées
    dialogues.ndjson          # dialogues publics confirmés, un JSON par ligne
    journal.md                # événements et décisions validées
```

Les narrations futures ne sont jamais écrites d'avance. Lors du lancement, seul le prologue est créé. À chaque étape suivante, le MJ choisit et ChatGPT ajoute seulement ce qui s'est passé.

### ⚠️ Confidentialité des rôles et secrets du MJ

**Le dépôt `trexdbg/loup-garou` est public.** Cacher un fichier sur GitHub Pages n'empêche pas sa lecture dans le dépôt ou son historique. Les rôles secrets du joueur et des PNJ, indices futurs, solutions et notes MJ doivent rester dans la conversation ChatGPT privée ou dans un autre dépôt privé.

Le JSON complet copié vers ChatGPT peut contenir un rôle imposé. **Ne le commitez pas tel quel dans le dépôt public :** ChatGPT doit retirer cet ID et tout secret de la copie `parametres.json` publiée. Les fichiers `partie.json` et `dialogues.ndjson` doivent rester sans spoilers non dévoilés. Le fichier historique `parties/2026-11-01-001/secrets-mj.md` est déjà dans le dépôt public : il ne constitue pas un lieu confidentiel et ne doit pas être reproduit pour les nouvelles parties.

L'interface Pages publie uniquement `partie.json`, `journal.md`, `narrations.md`, `dialogues.ndjson` et l'index public, pas les fichiers de notes du MJ.

## Ressources conservées

- [roles.js](roles.js) : catalogue des **37 rôles** et leurs résumés.
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
- Les textes privés et les secrets du MJ ne sont jamais transmis au lecteur public.

### Voix neuronales haute qualité (option payante)

Le mode local Web Speech est gratuit, mais peut sonner robotique. Pour des voix françaises plus expressives avec un timbre distinct par PNJ, le projet contient désormais un **pont ElevenLabs sécurisé côté Cloudflare Worker**, qui génère l'audio uniquement après la publication d'une nouvelle réplique jouée. Le son est lu dans l'application et n'est pas commité dans GitHub.

**Ce mode n'est pas actif par défaut :** aucun compte ElevenLabs, aucune clé ni aucun Worker n'a été configuré par ChatGPT. Le fichier `tts-config.json` reste désactivé. La mise en service nécessite un compte/API ElevenLabs, un Worker Cloudflare et un choix de voix françaises ; les secrets ne doivent jamais être ajoutés à ce dépôt public.

- Instructions d'installation : [tts-worker/README.md](tts-worker/README.md).
- Le coût dépend du fournisseur et de l'utilisation : définir un plafond de dépense et garder le limiteur de requêtes activé.
- Une panne du fournisseur fait automatiquement revenir l'application à la voix locale ; la partie et les dialogues publics restent utilisables.
- Une courte annonce dans l'application signale que les voix générées par l'IA ne sont pas des acteurs humains.
