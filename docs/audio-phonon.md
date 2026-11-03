# Phonon français — 14 PNJ + 1 narrateur

Le moteur principal du jeu est **Phonon 40M FR** (`gradium/phonon-40m-fr`) avec **15 voix françaises distinctes : 14 pour les PNJ, une réservée au narrateur**, issues du catalogue `gradium/phonon-voices`. Le modèle et les voix s'exécutent sur le runner GitHub Actions, **sans API de synthèse vocale facturée à l'utilisation**. La synthèse produit des MP3 légers publiés uniquement dans l'artefact GitHub Pages. La licence du modèle est **CC BY-NC 4.0 (usage non commercial)** ; elle s'applique aussi à l'utilisation dans le jeu.

## Étapes obligatoires pour activer Phonon

1. Ouvrir [le modèle français](https://huggingface.co/gradium/phonon-40m-fr), se connecter avec un compte Hugging Face et **accepter les conditions d'accès**. L'accès au modèle est restreint jusqu'à cette acceptation (normalement automatique après accord).
2. Créer un jeton Hugging Face **Read**, idéalement un jeton fine-grained limité à la lecture du modèle autorisé.
3. Dans [les secrets GitHub Actions de notre dépôt](https://github.com/trexdbg/loup-garou/settings/secrets/actions), ajouter un **nouveau repository secret** nommé exactement `HF_TOKEN`. Y coller le jeton Hugging Face, pas la clé Gemini. **Ne jamais coller de token dans le dépôt, GitHub Pages ou la conversation ChatGPT.**
4. Lancer [le workflow de publication Pages](https://github.com/trexdbg/loup-garou/actions/workflows/pages.yml) depuis **Run workflow**. Le même workflow se lancera après un commit des dialogues publics.
5. Dans **Mes parties**, actualiser, choisir une scène et garder le mode **🎙️ Phonon français · MP3 publiés**, puis cliquer sur **Écouter**. Sous le lecteur, un panneau indique la voix de chaque PNJ.

## Catalogue permanent

| Personnage | Voix Phonon | Personnage | Voix Phonon |
|---|---|---|---|
| Rose | Noémie | Hugo | Augustin |
| Salomé | Coralie | Marin | Arnaud |
| Inès | Tiphaine | Baptiste | Jules |
| Jade | Maëlys | Nils | Baptiste |
| Mila | Orianne | Léon | Lucien |
| Clémence | Solène | — | — |
| Iris | Ninon | | |
| Zoé | Lilou | | |
| Agathe | Hélène | | |

**Total : 14 PNJ (9 femmes, 5 hommes) + Narrateur (Marius), soit 15 timbres distincts.** Octave ne fait plus partie du casting des nouvelles parties, mais garde Marius dans les archives existantes. Le joueur humain parle lui-même, sans voix générée.

Le MJ choisit **3 à 14 PNJ** parmi ce casting dans l'onglet **Préparer** (7 par défaut). Chaque personnage conserve son nom, sa personnalité et son timbre, mais **sa carte et son camp changent à chaque partie**, selon les règles et les validations du MJ. Le JSON de lancement contient les noms et les voix ; ChatGPT doit les archiver dans `partie.json` sous `personnages_pnj` sans inclure de rôles secrets.

Les anciennes parties conservent leurs personnages et leurs voix, y compris Octave (ancienne attribution Marius). Le narrateur de toute nouvelle partie possède sa voix réservée indépendamment des rôles secrets.

## Fonctionnement technique

- `voices/phonon-fr.json` est le catalogue de référence, et `voice-pool.js` son miroir côté navigateur.
- Le workflow utilise `pip install ptts` (runtime Phonon officiel) uniquement lorsque `HF_TOKEN` est renseigné. Le code du projet lance `python -m ptts --model hf://gradium/phonon-40m-fr --lang fr --quant q8 --voice NOM ... -o fichier.wav`. FFmpeg convertit ensuite en MP3 mono 48 kbit/s.
- Le générateur ne lit que les répliques de PNJ et narrations avec `public: true` dans **la dernière scène** lors des publications automatiques. `dialogue_joueur`, `secrets_mj.json` et toute ligne non publique sont exclus.
- La génération automatique est limitée à 4 nouveaux clips Phonon par déploiement, ciblés sur la partie dont les dialogues viennent de changer (pour préserver le temps CPU), avec mise en cache par modèle, voix et texte. Les voix existantes sont réutilisées.
- **Priorité de lecture : Phonon → Gemini en cache → eSpeak-ng → navigateur.** De nouveaux clips Gemini ne sont plus générés automatiquement (`--max-lines 0`).
- Toute réplique portant `"audio": false` est exclue de la synthèse Phonon, Gemini et eSpeak et de la lecture vocale. Les nuits automatiques n'écrivent aucun nouveau dialogue ; les seuls changements d'état ou de secrets ne déclenchent pas de GitHub Action.
- Aucun poids du modèle français ni fichier MP3 n'est commité au dépôt. Le téléchargement du modèle et des voix sur le runner peut prendre un certain temps au premier lancement, et les quotas de durée de GitHub Actions restent applicables. Les sons générés restent éphémères : on ne garantit pas qu'une ancienne scène soit toujours publiée.
- Si le projet devient commercial ou monétisé, ne pas utiliser le modèle CC BY-NC sans licence commerciale adaptée.

**Validation :** les actions GitHub ont déjà produit de vrais MP3 Phonon pour plusieurs PNJ. Le catalogue et les 15 références uniques sont testés automatiquement, mais le rendu individuel des 15 voix n'a pas encore été testé auditivement. Vérifier les logs de l'étape **Générer les MP3 avec Phonon français (prioritaire)**.

Sources officielles : [modèle Phonon 40M FR](https://huggingface.co/gradium/phonon-40m-fr), [catalogue des voix](https://huggingface.co/gradium/phonon-voices), [runtime Phonon](https://github.com/gradium-ai/xn-ptts).
