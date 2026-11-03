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
3. Dans la **conversation avec le MJ**, préparer les rôles, les personnalités et le placement circulaire des LEGO en **une seule proposition**, en respectant les options, les rôles autorisés et le nombre de Loups. **Une seule validation du MJ couvre cette proposition d'ensemble** (rôles + voisinage), sauf demande de modification. Conserver les identités stables au fil de la partie.
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

## 3. Cycle de jeu : mode rapide et économique (par défaut)

### Mode autonome prioritaire : JOUR → NUIT → JOUR → VOTE

Ce mode remplace les validations étape-par-étape décrites ailleurs dans ce document ; il s'applique aux nouvelles parties et aux reprises, sauf demande contraire du MJ.

1. **Jour 1** : courte présentation (2 à 4 répliques PNJ), puis une seule intervention libre d'Alex. Les PNJ répondent et le village s'endort immédiatement : **aucun vote au premier jour**.
2. **Nuit N** : enchaîner automatiquement dans l'ordre légal les pouvoirs actifs et les décisions de tous les PNJ (Voyante, Loups-Garous, Sorcière, etc.). Les PNJ raisonnent à partir de leur mémoire, des dialogues précédents, de leurs objectifs et de leurs propres informations : un rôle secret non connu ne doit pas être pris en compte par les autres. Ne pas faire choisir leurs cibles au MJ. **Pause seulement pour un choix personnel d'Alex si son rôle l'exige**, ou pour une véritable ambiguïté de règles. Reprendre aussitôt après son choix. Les rôles passifs ne demandent rien.
3. **Jour N+1** : résoudre les effets de nuit et de mort (notamment les pouvoirs des PNJ éliminés), annoncer le réveil et révéler seulement les cartes légalement dévoilées. Vérifier immédiatement la victoire. Débat très bref entre PNJ, puis **une seule intervention d'Alex**.
4. **Vote** : les PNJ vivants votent d'un bloc selon leurs soupçons, leur personnalité et leur stratégie de camp ; demander seulement le vote d'Alex s'il est habilité. Dès qu'il vote, dépouiller, appliquer les conséquences et les pouvoirs spéciaux, vérifier la victoire et passer **automatiquement à la nuit suivante**, sans nouvelle validation MJ. Respecter les règles particulières des égalités et des personnages.
5. **Continuité** : enchaîner jusqu'à la prochaine intervention d'Alex ou la victoire. Le MJ peut à tout moment arrêter, rectifier ou ralentir la partie, mais n'a plus à valider les transitions normales ni les éliminations déterminées par les règles.

**Nuit = zéro dialogue public, zéro audio, zéro appel GitHub, zéro GitHub Action.** Les actions PNJ et les secrets provisoires restent dans la conversation pendant la nuit. Un **unique commit atomique au réveil / à la nouvelle scène de jour** archive l'état et les effets résolus avec le journal et les nouveaux dialogues publics. Même si Alex doit intervenir pendant la nuit, conserver ses décisions en contexte jusqu'au prochain réveil ; ne pas commiter d'étapes intermédiaires. L'application lit `partie.json` et `parties/index.json` directement sur la branche principale : modifier ces fichiers ou les secrets MJ ne doit pas déclencher de reconstruction Pages.

**Synthèse vocale** : ne produire que 2 à 4 courtes répliques PNJ par scène publique utile. Marquer `"audio":false` toute ligne non destinée à la TTS ; aucune ligne nocturne. Réutiliser les clips existants. Les tables de vote et les mécaniques ne sont pas des scripts audio. Une publication audio n'est justifiée que lorsque `dialogues.ndjson` comporte une véritable nouvelle scène publique.

**Priorités d'efficacité** : relire seulement les événements et dialogues récents, les secrets utiles, les ressources restantes et les soupçons par personnage ; ne jamais relire tout le dossier sans nécessité. Retourner directement le récit et la prochaine question destinée à Alex, pas des validations administratives.

**Objectif : moins de tours de conversation, moins de commits, moins de générations audio**, sans retirer l'autorité du MJ. La partie progresse en **unités jouables complètes** et non en micro-étapes administratives.

- **Initialisation :** présenter distribution secrète des rôles + placement circulaire dans la même proposition ; un seul « je valide » du MJ suffit à archiver la configuration et le prologue.
- **Chaque tour :** quand le MJ rapporte des paroles, valide une action ou dit « on continue », faire d'un seul tenant les réactions des PNJ, les effets mécaniques déjà déterminés, le bref texte à jouer et la préparation de la prochaine décision. Ne pas demander de deuxième confirmation pour la même action.
- **PNJ autonomes :** les personnages joués par ChatGPT raisonnent, bluffent, votent ou choisissent leur pouvoir selon leurs informations et leurs personnalités. Le MJ n'a pas à choisir chaque réaction PNJ. Ne jamais inventer le choix d'Alex.
- **Nuit :** regrouper les appels et effets de rôles PNJ qui ne réclament pas d'arbitrage. Respecter l'ordre réel des pouvoirs ; s'arrêter **au premier choix humain nécessaire** (Alex ou MJ). Ne pas révéler/résoudre une mort non encore approuvée.
- **Jour et vote :** faire des échanges courts entre PNJ pertinents, puis laisser Alex parler. Une demande explicite « on lance le vote » autorise directement l'ouverture du scrutin, sans nouvelle validation préalable. Le dépouillement et les éliminations restent sous validation du MJ.
- **Écriture GitHub :** un seul **commit atomique par scène ou décision validée**, contenant les seuls fichiers effectivement modifiés (état, secrets le cas échéant, dialogue public et journal). Mettre à jour `parties/index.json` uniquement si une donnée de l'index change (phase, statut, titre), pas à chaque réplique. Ne pas multiplier les commits par fichier. En cas d'échec, ne pas prétendre que GitHub est à jour.
- **Audio :** regrouper les répliques en une scène cohérente, viser **2 à 5 répliques PNJ courtes** lors d'un échange ordinaire et réutiliser les clips existants. Ne pas synthétiser la parole du joueur, les informations secrètes ou les scènes sans intérêt vocal. Ne publier que les répliques réellement jouées/validées.
- **Réponse au MJ :** afficher directement les paroles à lire, l'effet résolu et **la prochaine décision attendue** ; supprimer les récapitulatifs, demandes de permission et annonces techniques répétitives. Mentionner la synchronisation uniquement si elle échoue ou si le MJ la demande.
- **Contrôles obligatoires :** validation initiale des rôles/LEGO ; choix et pouvoirs du joueur ; début de nuit ou de vote ; verdict et éliminations ; choix douteux ou irréversible. Une instruction explicite du MJ vaut validation de l'action nommée. Ne pas en déduire une autorisation pour les autres éliminations ou les transitions non demandées.
- **Fin :** après verdict validé, contrôler immédiatement la victoire, archiver en un commit, puis annoncer la fin si les conditions sont remplies. Aucun aller-retour « dois-je vérifier la victoire ? ».

Le MJ peut demander une progression détaillée ; le mode rapide reste la valeur par défaut. Le MJ peut interrompre, corriger, ralentir ou modifier une règle. Ses choix priment toujours.

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

Après validation par le MJ d'un **lot cohérent d'échanges déjà joués**, ChatGPT publie **uniquement les nouveaux événements validés** dans `parties/<ID>/dialogues.ndjson`. Les entrées se suivent sans modifier les anciennes : `seq` est un entier strictement croissant, `public` vaut `true`, et l'entrée comprend `type`, `locuteur`, `texte`, `scene_id` et `scene_label`.

Une même scène peut contenir **plusieurs interventions du joueur et les réactions correspondantes** sous un `scene_id` stable pour tout le lot, par exemple `tour_de_table_03` puis `tour_de_table_04`. Le lecteur manuel affiche et joue une scène à la fois ; l'ordre des répliques est donné par `seq`. Les types autorisés sont `dialogue_pnj`, `narration` ou `dialogue_joueur` (ce dernier est visible, mais non synthétisé : l'enfant a déjà prononcé ses propres paroles).

Exemple public de deux lignes dans une même scène :

```ndjson
{"seq":23,"scene_id":"tour_de_table_03","scene_label":"Alex répond à Rose","type":"dialogue_joueur","locuteur":"Alex","texte":"Pourquoi tu sembles si calme ?","public":true}
{"seq":24,"scene_id":"tour_de_table_03","scene_label":"Alex répond à Rose","type":"dialogue_pnj","locuteur":"Rose","texte":"Parce que nous devons nous écouter avant de voter !","public":true}
```

**Ces lignes sont illustratives et ne doivent pas être ajoutées à une partie réelle.** ChatGPT garde une séparation absolue entre le texte joué publiquement et `secrets_mj.json` ; ne pas y inscrire d'identité cachée non révélée.

Dans `partie.json`, maintenir `phase: "tour_de_table"`, `scene_courante_id` et l'état `tour_de_table` durant les échanges. Mettre à jour `parties/index.json` **seulement lorsque sa phase ou son statut change**, sans supprimer les autres parties. Le déroulement rapide est **écouter → interventions d'Alex et réactions → un archivage groupé → actualiser → écouter**. Les PNJ peuvent débattre entre eux, se contredire et bluffer, en respectant les secrets et les rôles. Ne jamais pré-écrire le choix d'Alex.

Le MJ seul valide la fin du tour, le lancement d'un vote et l'endormissement du village. Les boutons de l'application pour poursuivre ou terminer le tour **copient des consignes destinées à ChatGPT**, ils ne changent pas l'état de jeu automatiquement.

## 8. Casting permanent et synthèse vocale Phonon française

Le MJ dispose dans l'application d'un **catalogue permanent de 14 PNJ et un narrateur** (`voice-pool.js` / `voices/phonon-fr.json`). Le joueur humain Alex n'en fait pas partie : il parle réellement. Les 14 voix des PNJ sont stables entre les parties ; Marius est réservé au Narrateur. Le MJ choisit **entre 3 et 14 PNJ**, 7 par défaut. Les parties archivées avec Octave conservent l'ancienne attribution Marius.

**Pour toute nouvelle partie**, le JSON de configuration transmis à ChatGPT comporte `aventure.casting_pnj` : tableau des PNJ imposés avec `prenom`, `caractere`, `voix_phonon` et `voix_id_phonon`. **Ne pas inventer de nouveaux PNJ à la place de cette liste.** Après validation du MJ, archiver exactement ces PNJ et leurs voix dans `partie.json.personnages_pnj`. Les noms des personnages ne changent pas pendant la partie. Les cartes et les camps sont tirés indépendamment, puis archivés dans `secrets_mj.json` (jamais transmis à la synthèse vocale). Pour les parties déjà existantes, utiliser le catalogue par prénom quand les champs de voix sont absents.

**Phonon 40M FR est le moteur vocal principal.** Son modèle `gradium/phonon-40m-fr`, sous licence CC BY-NC 4.0, impose une acceptation des conditions sur Hugging Face puis le secret GitHub Actions `HF_TOKEN`. Le workflow `pages.yml` prépare les MP3 via `scripts/generate_phonon_tts.py` et le catalogue de 14 voix PNJ et de la voix dédiée au narrateur. Les clips sont publiés dans l'artefact Pages, sans les commiter. Si Phonon échoue, les clips Gemini `GEMINI_API_KEY` existants sont préservés comme secours ; eSpeak-ng puis les voix locales assurent la continuité.

Les dialogues audio doivent être publics et **déjà validés par le MJ**. Seuls `dialogue_pnj` et `narration` (et les variantes publiques autorisées) sont synthétisés. Les lignes `dialogue_joueur` restent affichées et ne sont jamais lues. Aucun contenu de `secrets_mj.json` n'est envoyé au moteur Phonon/Gemini. Le MJ clique lui-même sur **▶ Écouter** ; aucun vote, nuit ou dialogue ne démarre automatiquement.

Guide pratique : [audio-phonon.md](audio-phonon.md). Pour l'ancien système et son quota : [audio-gemini.md](audio-gemini.md).
