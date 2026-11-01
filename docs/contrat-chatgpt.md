# Contrat d'échange — Configurateur ↔ ChatGPT ↔ GitHub

Version : 2. Objectif : offrir au MJ humain un copilote narratif et des archives publiques en lecture seule pour **1 joueur**.

## 1. Entrée provenant de l'application

L'utilisateur copie le bouton **Copier pour ChatGPT** depuis GitHub Pages dans une conversation du projet *Loup garou*. La consigne contient un document JSON dont `schema_version` vaut `2` et dont l'`id` suit le format `LG-AAAAMMJJ-XXXXXXXXXXXX`.

Les champs déterminent l'âge du joueur, son prénom, le rôle (fixé ou tiré au sort sous contrôle du MJ), la réserve de rôles autorisés, le décor, le scénario, la durée, les difficultés, les options de pouvoirs, les sonorités et le degré d'intervention du MJ.

**La génération de cet identifiant ne crée aucun fichier GitHub.** L'application ne dispose ni de jeton GitHub ni de pouvoir de modification de partie. Le JSON est à transmettre manuellement à ChatGPT.

## 2. Initialisation par ChatGPT (une seule étape)

1. Vérifier que `parties/<ID>/` n'existe pas. S'il existe, le considérer comme une reprise potentielle. Ne rien écraser sans validation du MJ.
2. Lire les options du JSON, valider leurs contradictions éventuelles avec les règles officielles et demander arbitrage du MJ quand nécessaire.
3. Dans la **conversation privée uniquement**, préparer les rôles des PNJ, leurs motivations, la solution possible et les événements futurs non dévoilés. Conserver leurs identités stables au fil de la partie.
4. Écrire dans GitHub :
   - `parties/<ID>/parametres.json` : **version expurgée du JSON** : mettre à `null` tout champ contenant une identité secrète ou un spoiler, y compris un rôle joueur imposé.
   - `parties/<ID>/partie.json` : uniquement l'état qui peut être montré sans divulguer de secrets.
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
  "titre": "Le secret du vieux puits",
  "cree_le": "2026-11-01T20:00:00.000Z",
  "statut": "en_cours",
  "phase": "prologue",
  "progression": {"jour": 0, "nuit": 0, "scene": "prologue"},
  "resume_public": "Un village cache une énigme.",
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
      "titre": "Le secret du vieux puits",
      "statut": "en_cours",
      "phase": "prologue"
    }
  ]
}
```

Les exemples sont des modèles, **pas des parties réelles à insérer**.

## 3. Cycle de jeu : une étape validée à la fois

- **MJ :** accepte le prologue et laisse le joueur agir.
- **ChatGPT :** répond comme le PNJ concerné et décrit brièvement ce qui est visible/audible. Réserve au MJ les instructions confidentielles.
- **MJ :** valide l'action ou l'arbitre. ChatGPT met ensuite à jour le journal public si l'action est jouée et non une simple hypothèse.
- **Nuit :** annoncer « Le village s'endort », appeler uniquement les rôles pertinents dans un ordre cohérent, attendre les décisions du MJ, résoudre les pouvoirs et annoncer le réveil.
- **Jour :** paroles libres, questions, indices, déplacements, débat ; jamais forcer un vote ou éliminer un personnage sans conséquence logique et arbitrage.
- **Fin :** archiver le résultat, changer le statut en `terminee` et proposer un debrief accessible à l'âge du joueur.

Le MJ peut interrompre, revenir sur une scène, changer un personnage, demander un indice, ralentir ou accélérer, et accorder une exception de règle. Ces décisions priment sur les propositions de l'assistant.

Les conseils au MJ sont **séparés** du dialogue à lire au joueur. Une information non révélée reste dans la conversation privée.

## 4. Mise à jour et récupération

Les écritures GitHub sont explicites, via les actions de GitHub connectées à la conversation. La réponse de ChatGPT doit distinguer : données réellement écrites, fichiers simplement proposés et absence d'accès.

Chaque reprise part de l'ID et relit `partie.json`, `journal.md` et les derniers dialogues. Les identités secrètes restent dans la conversation privée de jeu ; si elle a disparu, **ne pas inventer un état caché certain**. Demander au MJ sa fiche de secrets ou préparer une reprise validée.

La page publique se contente de lire les archives, via GitHub Pages, avec secours en lecture sur les fichiers publics de GitHub si le déploiement n'est pas encore fait. Un clic sur **Actualiser** met à jour la liste et les archives.

## 5. Rôles et visuels

Les 37 rôles du catalogue `roles.js` peuvent être sélectionnés. Les règles des cartes physiques priment sur le résumé du dépôt. Les images de `role-art.js` sont référencées depuis les sources authentifiées ; un rôle sans image vérifiée conserve son icône. Ne jamais prendre la carte d'un autre personnage « par ressemblance ».

## 6. Sécurité et stockage

- **Dépôt public = données publiques**, y compris son historique Git. Ne pas commiter les secrets et les fiches du MJ. Un fichier appelé `secrets-mj.md` dans un dépôt public n'est pas protégé.
- Le JSON initial complet, contenant éventuellement un rôle secret choisi, ne doit jamais être copié intégralement dans le dépôt. La copie publique est expurgée.
- Ne pas commiter les voix et ambiances régénérables à répétition. Préférer la lecture vocale à la volée et conserver seulement les métadonnées nécessaires à rejouer une scène.
- Nettoyage après fin de partie selon [STOCKAGE.md](../STOCKAGE.md).
- Une publication GitHub Pages n'est pas instantanée et ne représente pas une « synchronisation en direct » de ChatGPT.
