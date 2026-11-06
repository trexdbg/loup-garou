# Placement physique des LEGO — règle de toutes les parties

## Sur la table

- Une personne = une figurine LEGO. Le joueur humain a également sa figurine.
- La carte du rôle est posée **face cachée sous la figurine** ; l'attribution peut être archivée dans `secrets_mj.json` sur GitHub public, mais jamais affichée sur le plan de table du joueur.
- Placer la place n° 1 à **12 heures**, puis les autres **dans le sens horaire**.
- Les figurines sont les sièges réels de la partie : les pouvoirs de voisinage utilisent **uniquement cet ordre validé**, pas l'ordre des noms d'un fichier.

## Préparation avec ChatGPT

ChatGPT propose un placement quand il a créé tous les personnages, puis **attend l'accord du MJ**. La validation du MJ détermine les places. Le plan public est enregistré uniquement après validation, dans `parties/<ID>/partie.json` :

```json
{
  "placement_table": {
    "type": "circulaire",
    "sens": "horaire",
    "depart": "12h",
    "ordre": ["Alex", "Agathe", "Basile", "Clémence"],
    "retire": [],
    "valide_par_mj": true
  }
}
```

Les noms ci-dessus sont des **exemples**, pas une partie réelle ni une disposition à réutiliser. Un changement de places pendant la partie doit être de nouveau validé. Le tableau ne doit contenir aucun rôle secret.

## Application GitHub Pages

Dans **Mes parties**, chaque archive affiche un **plan circulaire interactif**. Le MJ ajuste les positions avec les flèches, retire/remet une figurine, puis valide. Le plan est mémorisé localement dans le navigateur ; le bouton **Copier le plan pour ChatGPT** génère la consigne d'archivage public. Cette opération est manuelle : aucun navigateur n'écrit directement sur GitHub. Si aucun plan n'est archivé, les noms de l'archive servent uniquement de **proposition non validée**.

La place n° 1, le sens horaire et l'identité de chaque figurine doivent rester lisibles, même après des déplacements. « Retirer » exclut la figurine des calculs de voisinage sans renuméroter les autres places.

## Flair du Renard

Le Renard choisit **trois personnages encore présents et voisins sur le cercle** : le personnage central sélectionné et les deux voisins immédiats, en sautant les figurines retirées. Pour vérifier le résultat, ouvrir le **carnet secret du MJ** et cliquer sur **Vérifier le trio sélectionné**. Seul le MJ peut voir la réponse : oui/non/incertain. L'application ne dévoile pas quel joueur est Loup et ne déclenche ni ne consomme jamais le pouvoir.

Selon les règles du Renard, un groupe sans aucun Loup fait perdre le flair ; cette conséquence est appliquée par le MJ, pas par le plan de table. Si un rôle est inconnu ou a une appartenance variable (Chien-Loup, Enfant Sauvage...), la vérification reste incertaine sauf si un Loup est déjà confirmé parmi les trois.

Le **Montreur d'Ours** et les autres interactions dépendantes des voisins doivent également utiliser la disposition physique validée, en tenant compte des figurines retirées et des arbitrages des règles officielles.

## Plusieurs joueurs humains

Avec 2 à 4 joueurs humains, chacun possède une figurine LEGO et une carte cachée sous sa figurine, exactement comme un PNJ. Le plan circulaire public comprend **tous les prénoms humains** et tous les PNJ, chacun une seule fois ; les rôles restent dans le carnet secret MJ. Les effets de voisinage s'appliquent à tous sans distinguer humain et PNJ.
