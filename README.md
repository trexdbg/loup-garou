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

**Il n'existe pas de synchronisation directe automatique depuis une conversation ChatGPT vers un navigateur.** Les écritures ont lieu lors des interventions explicites de ChatGPT disposant du connecteur GitHub. GitHub Pages se republie après chaque commit sur `main` ; un léger délai de publication est normal. Pour consulter un fichier qui vient d'être créé mais n'est pas encore disponible dans Pages, le lecteur tente aussi la version GitHub publique.

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
