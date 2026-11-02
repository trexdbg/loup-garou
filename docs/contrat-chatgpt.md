# Contrat d'échange — Configurateur ↔ ChatGPT ↔ GitHub

Version : 3 (politique de stockage MJ du 2 novembre 2026). Objectif : offrir au MJ humain un copilote narratif et des archives GitHub publiques, avec contenu visible par le joueur séparé des fichiers de secrets, pour **1 joueur**.

## 1. Entrée provenant de l'application

L'utilisateur copie le bouton **Copier pour ChatGPT** depuis GitHub Pages dans une conversation du projet *Loup garou*. La consigne contient un document JSON dont `schema_version` vaut `2` et dont l'`id` suit le format `LG-AAAAMMJJ-XXXXXXXXXXXX`.

Les champs déterminent l'âge du joueur, son prénom, le rôle (fixé ou tiré au sort sous contrôle du MJ), le **niveau** `roles.mode` (`classique`, `avance` ou `expert`), la réserve de rôles autorisés, le décor, le scénario, la durée, les difficultés, les options de pouvoirs, les sonorités et le degré d'intervention du MJ.

**La génération de cet identifiant ne crée aucun fichier GitHub.** L'application ne dispose ni de jeton GitHub ni de pouvoir de modification de partie. Le JSON est à transmettre manuellement à ChatGPT.

## 2. Initialisation par ChatGPT (une seule étape)

**Règle de narration (2 novembre 2026) :** jouer aux Loups-Garous de Thiercelieux, pas à une enquête fantastique. Dès le départ, tous les habitants savent qu'il y a des Loups-Garous dans le village ; seule leur identité est secrète. Prologue de 3 à 6 phrases au maximum, sans lanterne magique, cloche inquiétante, lettre codée, quête, disparition indépendante ou autre énigme. La progression tourne autour des dialogues, soupçons, bluff, pouvoirs nocturnes, réveils et votes, sous arbitrage du MJ. Les préférences de décor, mystère et ambiance ne doivent pas détourner de ces mécaniques.

1. Vérifier que `parties/<ID>/` n'existe pas. S'il existe, le considérer comme une reprise potentielle. Ne rien écraser sans validation du MJ.
2. Lire les options du JSON, valider leurs contradictions éventuelles avec les règles officielles et demander arbitrage du MJ quand nécessaire.
3. Dans la **conversation avec le MJ**, préparer les rôles des PNJ, leurs motivations, la solution possible et les événements futurs non dévoilés. Respecter le niveau `roles.mode`, le tableau `roles.autorises`, le nombre de personnages, les camps et le nombre cible de Loups. **Soumettre la répartition au MJ pour validation avant de continuer**. Conserver les identités stables au fil de la partie.
3 bis. **Après validation**, envoyer dans la conversation privée un JSON MJ contenant `id` (ID exact de partie) et `roles` (tableau de `{\"personnage\":\"Prénom\",\"role\":\"id_role\"}`). Chaque ID de rôle doit exister dans `roles.js`. Le MJ peut coller ce JSON dans son carnet de rôles local de l'application ; ChatGPT doit aussi l'archiver sur GitHub dans `secrets_mj.json` après validation.
4. Écrire dans GitHub :
   - `parties/<ID>/parametres.json` : paramètres complets, y compris le rôle joueur imposé si présent (dépôt public).
   - `parties/<ID>/partie.json` : uniquement l'état qui peut être montré au joueur, sans spoiler.
   - `parties/<ID>/secrets_mj.json` : **fichier GitHub public de secrets MJ**, avec `id`, `roles` (attributions de tous les personnages selon les IDs de `roles.js`), et éventuellement notes, indices et décisions MJ validés. La page destinée au joueur ne doit pas le charger.
   - `parties/<ID>/narrations.md` : un **prologue** et ses consignes non secrètes. Ne pas écrire la première nuit, l'aube ou la fin par anticipation.
   - `parties/<ID>/journal.md` : « partie initialisée », date, scénario et statut.
   - `parties/<ID>/dialogues.ndjson` : éventuellement la première narration ; pas de dialogues fictivement joués.
5. Mettre à jour `parties/index.json` sans effacer les entrées existantes. Ne jamais créer deux entrées pour le même ID.
6. Dire au MJ ce qui a réellement été écrit sur GitHub et **lire le prologue dans la conversation**. Attendre une validation ou action.

Exemple d'état public minimal dans `partie.json` :

```json
{
  "id": "LG-20261101-0123456789AB",
  "schema_version": 2,
  "titre": "Les Loups de Thiercelieux",
  "cree_le": "2026-11-01T20:00:00.000Z",
  "statut": "en_cours",
  "phase": "prologue",
  "progression": {"jour": 0, "nuit": 0, "scene": "prologue"},
  "resume_public": "Les habitants savent que des Loups-Garous se cachent parmi eux.",
  "aide_mj_publique": "Demander au joueur ce qu'il veut examiner.",
  "dernier_evenement_public": "Prologue préparé"
}
```

`aide_mj_publique` est un conseil générique. Ne jamais écrire dans un état public « X est Loup » ou un indice futur.

Index conseillé `parties/index.json` :

```json
{
  "schema_version": 1,
  "parties": [
    {
      "id": "LG-20261101-0123456789AB",
      "cree_le": "2026-11-01",
      "titre": "Les Loups de Thiercelieux",
      "statut": "en_cours",
      "phase": "prologue"
    }
  ]
}
```

Les exemples sont des modèles, **pas des parties réelles à insérer**.

## Placement circulaire obligatoire des personnages

Avant de commencer les séquences de jeu dépendant du voisinage, **proposer au MJ l'ordre complet des figurines LEGO, joueur compris**, sous forme de table circulaire. Départ à 12 h, numérotation dans le sens horaire. Attendre l'accord du MJ : **une liste de personnages ne constitue pas en elle-même un placement validé**. Après confirmation, écrire le champ public `placement_table` de `parties/<ID>/partie.json` avec `type: "circulaire"`, `sens: "horaire"`, `depart: "12h"`, `ordre` (tableau des prénoms dans l'ordre), `retire` (liste des figurines retirées) et `valide_par_mj: true`.

Une carte secrète est placée physiquement **sous chaque LEGO** ; ne pas inclure les identités secrètes dans `placement_table`. Les attributions peuvent être archivées séparément dans `secrets_mj.json` sur GitHub public. Les déplacements des LEGO invalident l'ancien plan jusqu'à nouvel accord du MJ. L'application propose les changements localement, puis le MJ copie le plan vers la conversation pour archivage explicite.

Pour le Renard, le flair s'applique au **personnage ciblé et à ses deux voisins directs encore présents** dans l'ordre circulaire. Le carnet secret vérifie oui/non/incertain à partir des cartes attribuées localement, mais n'applique pas le pouvoir ni ses conséquences. Les pouvoirs de voisinage comme le Montreur d'Ours doivent employer le même plan. Détails : [placement LEGO](placement-lego.md).

## 3. Cycle de jeu : une étape validée à la fois

- **MJ :** accepte le prologue et laisse le joueur agir.
- **ChatGPT :** répond comme le PNJ concerné et décrit brièvement ce qui est visible/audible. Réserve au MJ les instructions confidentielles.
- **MJ :** valide l'action ou l'arbitre. ChatGPT met ensuite à jour le journal public si l'action est jouée et non une simple hypothèse.
- **Nuit :** annoncer « Le village s'endort », appeler uniquement les rôles pertinents dans un ordre cohérent, attendre les décisions du MJ, résoudre les pouvoirs et annoncer le réveil.
- **Jour :** paroles libres, questions, indices, déplacements, débat ; jamais forcer un vote ou éliminer un personnage sans conséquence logique et arbitrage.
- **Fin :** archiver le résultat, changer le statut en `terminee` et proposer un debrief accessible à l'âge du joueur.

Le MJ peut interrompre, revenir sur une scène, changer un personnage, demander un indice, ralentir ou accélérer, et accorder une exception de règle. Ces décisions priment sur les propositions de l'assistant.

Les conseils au MJ sont **séparés** du dialogue à lire au joueur. Une information non révélée reste dans la conversation MJ et, si validée, dans `secrets_mj.json`, sans apparaître dans les textes destinés au joueur.

## 4. Mise à jour et récupération

Les écritures GitHub sont explicites, via les actions de GitHub connectées à la conversation. La réponse de ChatGPT doit distinguer : données réellement écrites, fichiers simplement proposés et absence d'accès.

Chaque reprise part de l'ID et relit `partie.json`, `secrets_mj.json` s'il existe, `journal.md` et les derniers dialogues. Si l'ancien dossier n'a pas de fichier de secrets, **ne pas inventer un état caché certain** : demander au MJ sa fiche ou préparer une reprise validée.

La page publique lit l'état, le journal et les dialogues de GitHub Pages. Le carnet MJ est masqué par défaut ; lorsqu'il est ouvert, il charge les rôles de `secrets_mj.json` (dépôt public), puis peut les conserver en `sessionStorage` ou en `localStorage` **non chiffré** sur demande. La saisie et l'import manuels restent possibles. Les attributions validées peuvent en parallèle être conservées dans `secrets_mj.json` sur GitHub ; ne jamais les afficher dans les dialogues non révélés, la synthèse vocale ou la vue destinée au joueur. Un clic sur **Actualiser** met à jour la liste et les archives.

## 5. Rôles et visuels

Les 37 rôles du catalogue `roles.js` peuvent être sélectionnés. Les règles des cartes physiques priment sur le résumé du dépôt. Les images de `role-art.js` sont référencées depuis les sources authentifiées ; un rôle sans image vérifiée conserve son icône. Ne jamais prendre la carte d'un autre personnage « par ressemblance ».

## 6. Sécurité et stockage

- **Dépôt public = données publiques**, y compris les secrets et l'historique Git. Le MJ autorise explicitement l'archivage des rôles et secrets dans `secrets_mj.json` pour les nouvelles parties, en acceptant la possibilité de spoilers pour quiconque consulte le dépôt.
- Conserver les paramètres complets, mais séparer les secrets MJ du déroulement visible par le joueur. Ne jamais commiter de données personnelles sensibles, jetons, mots de passe ou clés.
- Ne pas commiter les voix et ambiances régénérables à répétition. Préférer la lecture vocale à la volée et conserver seulement les métadonnées nécessaires à rejouer une scène.
- Nettoyage après fin de partie selon [STOCKAGE.md](../STOCKAGE.md).
- Une publication GitHub Pages n'est pas instantanée et ne représente pas une « synchronisation en direct » de ChatGPT.

## 7. Scènes audio à la demande et tour de table

Après validation d'une intervention d'Alex par le MJ, ChatGPT publie **uniquement les nouveaux événements validés** dans `parties/<ID>/dialogues.ndjson`. Les entrées se suivent sans modifier les anciennes : `seq` est un entier strictement croissant, `public` vaut `true`, et l'entrée comprend `type`, `locuteur`, `texte`, `scene_id` et `scene_label`.

Chaque nouvelle intervention du joueur entraîne un **nouveau groupe de répliques** sous un `scene_id` stable pour tout le lot, par exemple `tour_de_table_03` puis `tour_de_table_04`. Le lecteur manuel affiche et joue une scène à la fois ; l'ordre des répliques est donné par `seq`. Les types autorisés sont `dialogue_pnj`, `narration` ou `dialogue_joueur` (ce dernier est visible, mais non synthétisé : l'enfant a déjà prononcé ses propres paroles).

Exemple public de deux lignes dans une même scène :

```ndjson
{"seq":23,"scene_id":"tour_de_table_03","scene_label":"Alex répond à Rose","type":"dialogue_joueur","locuteur":"Alex","texte":"Pourquoi tu sembles si calme ?","public":true}
{"seq":24,"scene_id":"tour_de_table_03","scene_label":"Alex répond à Rose","type":"dialogue_pnj","locuteur":"Rose","texte":"Parce que nous devons nous écouter avant de voter !","public":true}
```

**Ces lignes sont illustratives et ne doivent pas être ajoutées à une partie réelle.** ChatGPT garde une séparation absolue entre le texte joué publiquement et `secrets_mj.json` ; ne pas y inscrire d'identité cachée non révélée.

Dans `partie.json`, maintenir `phase: "tour_de_table"`, `scene_courante_id` et l'état `tour_de_table` durant les échanges. Mettre à jour `parties/index.json` avec la phase et sans supprimer les autres parties. Le déroulement attendu est **écouter → intervention d'Alex → réaction des habitants → archivage → actualiser → réécouter**. Les PNJ peuvent débattre entre eux, se contredire et bluffer, en respectant les secrets et les rôles. Ne jamais pré-écrire le choix d'Alex.

Le MJ seul valide la fin du tour, le lancement d'un vote et l'endormissement du village. Les boutons de l'application pour poursuivre ou terminer le tour **copient des consignes destinées à ChatGPT**, ils ne changent pas l'état de jeu automatiquement.

## 8. Synthèse vocale gratuite et commande manuelle

Le lecteur actif `scene-player.js` propose **Web Speech par défaut** : une voix française distincte par PNJ si le navigateur en dispose d'au moins sept. Sinon, les timbres disponibles sont réutilisés avec des hauteurs et vitesses différentes. **Piper reste une alternative locale gratuite** (`fr_FR-siwis-medium` et `fr_FR-tom-medium`) : deux timbres réels seulement, avec téléchargement initial volumineux. La qualité varie suivant le téléphone et le navigateur.

Le MJ clique explicitement sur **▶ Écouter** ; aucune lecture ne démarre au chargement et aucun sondage vocal toutes les six secondes n'est nécessaire. Seules les paroles archivées et déjà validées sont lues. `secrets_mj.json` n'est jamais transmis au lecteur audio. L'application reste en lecture seule, sans abonnement, API payante ou génération de MP3 dans le dépôt.
