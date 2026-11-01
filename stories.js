/* Histoires et dialogues originaux adaptés à une partie solo (MJ + 1 joueur). */
window.STORIES = [
  {
    "id": "sac",
    "title": "Le sac de Marcel",
    "minutes": 45,
    "icon": "💍",
    "tone": "Mystère au coin du feu",
    "culprit": "Marcel",
    "setting": "Le hameau sous la neige",
    "opening": "Le vent cogne aux volets. Sur la table de l'auberge repose un sac de toile fermé par une ficelle rouge. Marcel a demandé qu'on ne l'ouvre surtout pas avant le matin. Mais, depuis une heure, quelqu'un frappe à la porte... en portant une bague identique à la sienne.",
    "night": "Le village s'endort. Les dernières chandelles vacillent, puis s'éteignent. Au loin, un chien aboie trois fois. Une silhouette passe devant la fenêtre givrée. Les Loups-Garous, eux, ouvrent les yeux...",
    "day": "La neige est fraîche et les traces se voient parfaitement. Sur la place, les habitants se réunissent sous le vieux réverbère. Personne ne souhaite être le premier à parler.",
    "dawn": "Le soleil blafard révèle des empreintes près de la fontaine. Hector clame qu'il n'a fermé l'œil de la nuit. Quelqu'un a laissé tomber un fil de laine rouge.",
    "endVillage": "Le sac s'ouvre enfin : il contient une vieille photographie et une lettre d'avertissement. Les Loups ne menaceront plus le hameau ce soir.",
    "endWolves": "La dernière bougie s'éteint dans l'auberge. Personne n'ose plus prononcer le nom de Marcel.",
    "locations": [
      {
        "id": "auberge",
        "name": "L'auberge",
        "icon": "🍲",
        "text": "Une table, un sac fermé et des tasses encore tièdes.",
        "clue": "Le nœud du sac est fait comme celui des ballots de laine de Marcel.",
        "focus": "Marcel"
      },
      {
        "id": "fenetre",
        "name": "La fenêtre",
        "icon": "🪟",
        "text": "La vitre est couverte de buée et la neige n'a pas encore fondu.",
        "clue": "Sur le bois, une rayure en forme d'anneau a laissé de minuscules paillettes d'argent.",
        "focus": "Marcel"
      },
      {
        "id": "fontaine",
        "name": "La fontaine",
        "icon": "⛲",
        "text": "Une bassine renversée et des traces qui se croisent.",
        "clue": "Un fil rouge est coincé dans la pierre. Il ressemble à celui du manteau de Marcel.",
        "focus": "Marcel"
      },
      {
        "id": "forge",
        "name": "La forge",
        "icon": "🔨",
        "text": "Une enclume, des fers à cheval et plusieurs outils soigneusement rangés.",
        "clue": "Hector montre le reçu d'une réparation de bague commandée par Marcel.",
        "focus": "Marcel"
      }
    ],
    "residents": [
      {
        "name": "Marcel",
        "job": "berger",
        "trait": "parle doucement et évite de regarder les mains",
        "alibi": "Je réparais ma clôture près de la bergerie, seul.",
        "rumor": "Ce sac ne doit pas être ouvert avant l'aube. Je le promets.",
        "secret": "J'ai retrouvé cette bague dans la forêt, mais je ne veux pas expliquer pourquoi.",
        "hint": "Il serre son gant droit dès qu'on parle d'argent."
      },
      {
        "name": "Hector",
        "job": "forgeron",
        "trait": "franc, un peu bourru",
        "alibi": "Je terminais une commande à la forge ; Victor a entendu le marteau.",
        "rumor": "Marcel m'a fait réparer une bague fendue.",
        "secret": "Je garde une pièce de métal qui pourrait identifier le propriétaire de la bague.",
        "hint": "Il a la facture de la réparation."
      },
      {
        "name": "Victor",
        "job": "garde du village",
        "trait": "impulsif, protecteur",
        "alibi": "Je gardais l'entrée du village puis je suis passé à la forge.",
        "rumor": "Une silhouette en manteau brun est passée à la fenêtre.",
        "secret": "J'ai cru voir Marcel mais je n'en suis pas certain.",
        "hint": "Il sait d'où viennent les traces de bottes."
      },
      {
        "name": "Agathe",
        "job": "aubergiste",
        "trait": "observatrice, chaleureuse",
        "alibi": "Je faisais bouillir de l'eau dans la cuisine.",
        "rumor": "Quelqu'un a déplacé le sac pendant que je préparais le repas.",
        "secret": "J'ai vu la ficelle rouge bien avant que Marcel arrive.",
        "hint": "Elle reconnaît les nœuds des gens du village."
      },
      {
        "name": "Lucie",
        "job": "factrice",
        "trait": "vive, curieuse",
        "alibi": "Je triais les lettres au bureau de poste.",
        "rumor": "Une lettre adressée à Marcel est revenue sans cachet.",
        "secret": "Je sais lire l'écriture de la lettre cachée dans le sac.",
        "hint": "Elle propose d'examiner les courriers."
      },
      {
        "name": "Solène",
        "job": "guérisseuse",
        "trait": "calme, très précise",
        "alibi": "Je préparais une tisane pour l'ancien.",
        "rumor": "Les loups craignent certaines plantes, pas les vieilles histoires.",
        "secret": "J'ai soigné une griffure ce matin sans demander le nom de son propriétaire.",
        "hint": "Elle sait distinguer une vraie blessure d'un déguisement."
      },
      {
        "name": "Bastien",
        "job": "bûcheron",
        "trait": "nerveux, honnête",
        "alibi": "Je rentrais le bois avant la tempête.",
        "rumor": "J'ai entendu hurler du côté de la bergerie.",
        "secret": "Mon bonnet rouge a disparu hier.",
        "hint": "Il a vu des empreintes dans la neige."
      }
    ]
  },
  {
    "id": "clocher",
    "title": "Les douze coups du clocher",
    "minutes": 35,
    "icon": "🔔",
    "tone": "Enquête et fausses pistes",
    "culprit": "Émile",
    "setting": "Le village de la vallée",
    "opening": "À minuit, le clocher de Thiercelieux a sonné douze coups... puis un treizième. Depuis, le sonneur a disparu et les habitants s'accusent mutuellement. Au pied des marches, une clé cassée brille dans la poussière.",
    "night": "Quand la cloche se tait, le village s'endort. Les aiguilles de l'horloge s'arrêtent un instant. On entend courir dans l'escalier du clocher. Les Loups-Garous ouvrent les yeux.",
    "day": "Sur la place, chacun prétend avoir reconnu la personne qui a touché aux cloches. Personne ne raconte la même histoire.",
    "dawn": "Une corde humide pend du clocher. La vieille horloge indique une heure impossible.",
    "endVillage": "Le mécanisme est réparé. À minuit, il sonne à nouveau douze fois, pas une de plus.",
    "endWolves": "La cloche sonne treize fois, puis le silence règne sur les ruelles.",
    "locations": [
      {
        "id": "clocher",
        "name": "Le clocher",
        "icon": "🔔",
        "text": "L'escalier de pierre serpente jusqu'à la grande cloche.",
        "clue": "Un morceau de ruban bleu est coincé dans une poulie, comme sur la veste d'Émile.",
        "focus": "Émile"
      },
      {
        "id": "atelier",
        "name": "L'atelier d'horlogerie",
        "icon": "⏰",
        "text": "Rouages et outils sont disposés sur un établi.",
        "clue": "La dent d'un engrenage a été limée avec l'outil d'Émile.",
        "focus": "Émile"
      },
      {
        "id": "puits",
        "name": "Le vieux puits",
        "icon": "🪣",
        "text": "On aperçoit un reflet dans l'eau sombre.",
        "clue": "La clé cassée n'ouvre pas le clocher, mais un coffre d'Émile.",
        "focus": "Émile"
      },
      {
        "id": "place",
        "name": "La grande place",
        "icon": "🏘️",
        "text": "Les voisins viennent expliquer où ils étaient à minuit.",
        "clue": "Plusieurs témoins ont vu Émile près de l'horloge après le couvre-feu.",
        "focus": "Émile"
      }
    ],
    "residents": [
      {
        "name": "Émile",
        "job": "horloger",
        "trait": "méticuleux et souvent impatient",
        "alibi": "Je réparais une montre pour la mairie, chez moi.",
        "rumor": "Le sonneur a sûrement perdu la tête.",
        "secret": "J'ai gardé la deuxième clé de la tour.",
        "hint": "Il reconnaît trop vite les rouages cassés."
      },
      {
        "name": "Jeanne",
        "job": "sonneuse de cloche",
        "trait": "fière, bavarde",
        "alibi": "J'étais souffrante et je n'ai pas monté l'escalier.",
        "rumor": "Quelqu'un a touché à la poulie.",
        "secret": "Je garde la vieille clé originale.",
        "hint": "Elle connaît chaque marche du clocher."
      },
      {
        "name": "Louis",
        "job": "boulanger",
        "trait": "fatigué mais fiable",
        "alibi": "Je pétrissais mon pain, comme chaque nuit.",
        "rumor": "J'ai entendu un bruit de métal peu après minuit.",
        "secret": "J'ai accepté de faire un pain pour Émile tard hier.",
        "hint": "Ses horaires fournissent une bonne chronologie."
      },
      {
        "name": "Mina",
        "job": "couturière",
        "trait": "imaginative",
        "alibi": "Je raccommodais des manteaux.",
        "rumor": "Un ruban bleu a été demandé par quelqu'un.",
        "secret": "Émile m'a demandé de raccourcir sa veste.",
        "hint": "Elle sait identifier les tissus."
      },
      {
        "name": "Romain",
        "job": "garde",
        "trait": "méfiant",
        "alibi": "Je faisais la ronde du pont.",
        "rumor": "J'ai vu de la lumière dans l'atelier.",
        "secret": "J'ai quitté mon poste dix minutes.",
        "hint": "Ses rondes sont consignées sur un carnet."
      },
      {
        "name": "Claire",
        "job": "institutrice",
        "trait": "patiente",
        "alibi": "J'écrivais des exercices pour les enfants.",
        "rumor": "Treize coups peuvent être faits à la main.",
        "secret": "J'ai entendu deux personnes discuter près du puits.",
        "hint": "Elle peut aider à reconstituer les événements."
      },
      {
        "name": "Nestor",
        "job": "meunier",
        "trait": "souriant, distrait",
        "alibi": "Je dormais au moulin.",
        "rumor": "Le son du clocher résonne jusque dans mes sacs de farine.",
        "secret": "Je crains de raconter que j'étais dehors.",
        "hint": "Il a ramassé une petite pièce d'horlogerie."
      }
    ]
  },
  {
    "id": "moisson",
    "title": "La nuit des lanternes",
    "minutes": 50,
    "icon": "🏮",
    "tone": "Fête devenue inquiétante",
    "culprit": "Odette",
    "setting": "La fête de la moisson",
    "opening": "Ce soir, tout Thiercelieux prépare la fête des lanternes. Mais les lanternes s'éteignent l'une après l'autre et des messages mystérieux apparaissent dans le champ de blé. L'une des lanternes porte une marque de griffe.",
    "night": "Les musiciens cessent de jouer. Un à un, les habitants ferment leurs volets. Les lanternes oscillent au vent tandis que les Loups-Garous ouvrent les yeux.",
    "day": "Les décorations semblent intactes, mais tout le monde a vu quelque chose de différent dans les champs.",
    "dawn": "Une lanterne est posée à l'envers sur les marches de la mairie. La terre autour est encore humide.",
    "endVillage": "La fête reprend avec une nouvelle lanterne au centre de la place. Chacun ose enfin rire.",
    "endWolves": "Les lanternes s'éteignent définitivement ; seuls deux yeux brillent entre les épis.",
    "locations": [
      {
        "id": "champ",
        "name": "Le champ de blé",
        "icon": "🌾",
        "text": "Les tiges sont couchées en un cercle irrégulier.",
        "clue": "Des empreintes vont du champ jusqu'au hangar où Odette garde ses outils.",
        "focus": "Odette"
      },
      {
        "id": "hangar",
        "name": "Le hangar",
        "icon": "🛖",
        "text": "Des lanternes sont alignées le long du mur.",
        "clue": "Une boîte de mèches porte les initiales d'Odette et une marque de griffe récente.",
        "focus": "Odette"
      },
      {
        "id": "mairie",
        "name": "La mairie",
        "icon": "🏛️",
        "text": "Les affiches annoncent la fête du village.",
        "clue": "Le plan des lanternes a été modifié par Odette la veille.",
        "focus": "Odette"
      },
      {
        "id": "verger",
        "name": "Le verger",
        "icon": "🍎",
        "text": "Les fruits mûrs embaument encore le chemin.",
        "clue": "Une lanterne retrouvée ici est nouée avec le ruban violet d'Odette.",
        "focus": "Odette"
      }
    ],
    "residents": [
      {
        "name": "Odette",
        "job": "organisatrice de la fête",
        "trait": "autoritaires mais rassurante",
        "alibi": "Je vérifiais les lanternes, puis je suis rentrée.",
        "rumor": "Les enfants ont probablement déplacé les décorations.",
        "secret": "J'ai dessiné moi-même le nouvel itinéraire des lanternes.",
        "hint": "Elle veut éviter qu'on regarde le hangar."
      },
      {
        "name": "Paul",
        "job": "fermier",
        "trait": "terre à terre",
        "alibi": "Je rentrais les outils agricoles.",
        "rumor": "Je n'ai jamais vu d'empreintes aussi grandes.",
        "secret": "Une de mes bottes a disparu.",
        "hint": "Il connaît toutes les entrées des champs."
      },
      {
        "name": "Inès",
        "job": "musicienne",
        "trait": "expressive",
        "alibi": "Je répétais sur la scène jusqu'au dernier morceau.",
        "rumor": "Une femme au ruban violet a traversé la foule.",
        "secret": "J'ai manqué mon entrée pour suivre une ombre.",
        "hint": "Elle sait l'heure exacte du dernier morceau."
      },
      {
        "name": "Gaspard",
        "job": "garde forestier",
        "trait": "discret",
        "alibi": "Je surveillais la lisière.",
        "rumor": "Les loups empruntent rarement les grands chemins.",
        "secret": "J'ai aidé Odette à porter des lampes.",
        "hint": "Il a dessiné des pistes dans son carnet."
      },
      {
        "name": "Léonie",
        "job": "boulangère",
        "trait": "bienveillante",
        "alibi": "Je servais les tartes au verger.",
        "rumor": "Les lanternes se sont éteintes par groupes.",
        "secret": "J'ai trouvé un ruban dans ma corbeille.",
        "hint": "Elle remarque les nœuds des rubans."
      },
      {
        "name": "Théo",
        "job": "charpentier",
        "trait": "blagueur",
        "alibi": "Je montais la scène de spectacle.",
        "rumor": "Le hangar était fermé quand j'y suis passé.",
        "secret": "Je possède un double de la clé.",
        "hint": "Il sait si une porte a été forcée."
      },
      {
        "name": "Rose",
        "job": "herboriste",
        "trait": "réservée",
        "alibi": "Je préparais les bouquets près de la fontaine.",
        "rumor": "Une odeur de cire s'échappait du hangar.",
        "secret": "J'ai vu Odette courir sans lanterne.",
        "hint": "Elle distingue la cire d'abeille des autres cires."
      }
    ]
  },
  {
    "id": "masques",
    "title": "Le bal des masques",
    "minutes": 40,
    "icon": "🎭",
    "tone": "Mensonges et identités",
    "culprit": "Armand",
    "setting": "Le château de Thiercelieux",
    "opening": "Le châtelain a invité tout le village à un grand bal. À la dernière danse, une personne masquée a quitté la salle par un passage secret. Depuis, un masque de loup a été retrouvé derrière un rideau et personne n'ose enlever le sien.",
    "night": "Une dernière valse résonne dans les couloirs vides. Les torches s'éteignent dans la galerie. Derrière les masques, les Loups-Garous ouvrent les yeux.",
    "day": "Au grand salon, chacun décrit une silhouette différente. Le portier affirme que personne n'a franchi la grande porte.",
    "dawn": "Le parquet est couvert de confettis. Des traces de cire se prolongent vers une tapisserie déplacée.",
    "endVillage": "Les masques tombent, la vérité éclate et le bal peut reprendre au son des violons.",
    "endWolves": "Au petit matin, seuls les masques restent sur la piste de danse.",
    "locations": [
      {
        "id": "salon",
        "name": "Le grand salon",
        "icon": "🪞",
        "text": "Une immense piste de danse et des lustres.",
        "clue": "Un masque cassé porte les initiales d'Armand sous le ruban.",
        "focus": "Armand"
      },
      {
        "id": "galerie",
        "name": "La galerie",
        "icon": "🖼️",
        "text": "De vieux portraits observent les visiteurs.",
        "clue": "La poussière derrière une tapisserie a été frottée par la manche dorée d'Armand.",
        "focus": "Armand"
      },
      {
        "id": "cuisine",
        "name": "Les cuisines",
        "icon": "🍽️",
        "text": "Des plateaux ont été abandonnés précipitamment.",
        "clue": "Une serviette cache un billet signé A., demandant l'ouverture du passage.",
        "focus": "Armand"
      },
      {
        "id": "jardin",
        "name": "Le jardin d'hiver",
        "icon": "🌿",
        "text": "Des pas ont laissé de la terre sur les dalles.",
        "clue": "Les chaussures d'Armand ont la même semelle dentelée que ces empreintes.",
        "focus": "Armand"
      }
    ],
    "residents": [
      {
        "name": "Armand",
        "job": "intendant du château",
        "trait": "très poli et trop sûr de lui",
        "alibi": "J'accueillais les invités dans l'entrée.",
        "rumor": "Le château possède des dizaines de passages oubliés.",
        "secret": "Je connais les passages secrets mieux que le châtelain.",
        "hint": "Il évite toute question sur sa manche dorée."
      },
      {
        "name": "Élise",
        "job": "danseuse",
        "trait": "rêveuse",
        "alibi": "Je dansais avec Lucien à minuit.",
        "rumor": "Un masque doré est passé derrière les rideaux.",
        "secret": "Je me suis éclipsée pour retrouver ma broche.",
        "hint": "Elle connaît l'ordre des danses."
      },
      {
        "name": "Lucien",
        "job": "violoniste",
        "trait": "précis",
        "alibi": "Je jouais sans arrêt jusqu'au dernier morceau.",
        "rumor": "La musique a été interrompue brièvement.",
        "secret": "J'ai vu Armand quitter l'entrée.",
        "hint": "Il se souvient des sons et des heures."
      },
      {
        "name": "Berthe",
        "job": "cuisinière",
        "trait": "directe",
        "alibi": "Je servais le dessert en cuisine.",
        "rumor": "Quelqu'un m'a demandé d'ouvrir une porte condamnée.",
        "secret": "J'ai gardé le billet.",
        "hint": "Elle montre les messages écrits."
      },
      {
        "name": "Malo",
        "job": "jardinier",
        "trait": "timide",
        "alibi": "Je surveillais la serre.",
        "rumor": "Des souliers sales ont traversé le jardin d'hiver.",
        "secret": "J'ai perdu une clé de service.",
        "hint": "Il sait reconnaître les traces de pas."
      },
      {
        "name": "Camille",
        "job": "costumière",
        "trait": "élégante",
        "alibi": "Je réparais des masques à l'étage.",
        "rumor": "J'ai cousu une doublure unique à la veste d'Armand.",
        "secret": "Je garde un catalogue des costumes.",
        "hint": "Elle reconnaît le fil doré."
      },
      {
        "name": "Firmin",
        "job": "portier",
        "trait": "fidèle",
        "alibi": "Je tenais la grande porte toute la soirée.",
        "rumor": "Personne n'est sorti par cette porte.",
        "secret": "J'ai quitté mon poste pendant cinq minutes.",
        "hint": "Son registre est exact à cinq minutes près."
      }
    ]
  },
  {
    "id": "foret",
    "title": "Les murmures de la forêt",
    "minutes": 60,
    "icon": "🌲",
    "tone": "Grande aventure nocturne",
    "culprit": "Sylvain",
    "setting": "La forêt des Trois Chênes",
    "opening": "Un vieil arbre semble parler depuis trois nuits. Des villageois ont entendu leurs propres noms murmurés dans les branches. Le garde forestier a disparu et une petite carte tachée de sève apparaît sous la porte de la mairie.",
    "night": "La forêt devient noire. Les grenouilles se taisent, les branches craquent. Le village s'endort. Au milieu des chênes, les Loups-Garous ouvrent les yeux.",
    "day": "Les habitants discutent près du sentier. Chacun a entendu un nom différent dans la forêt.",
    "dawn": "Un nouveau symbole est gravé sur l'écorce. Des brindilles fraîches jonchent la piste.",
    "endVillage": "Les murmures cessent enfin. Le garde forestier retrouve le chemin du village, guidé par la lumière du jour.",
    "endWolves": "La forêt referme ses branches sur le chemin. Les murmures deviennent des hurlements.",
    "locations": [
      {
        "id": "chene",
        "name": "Le Grand Chêne",
        "icon": "🌳",
        "text": "Trois arbres anciens entourent une souche.",
        "clue": "Une empreinte fraîche correspond aux bottes à boucle de Sylvain.",
        "focus": "Sylvain"
      },
      {
        "id": "cabane",
        "name": "La cabane",
        "icon": "🪵",
        "text": "Une vieille cabane de guet se cache sous les feuilles.",
        "clue": "Une carte annotée par Sylvain indique la clairière interdite.",
        "focus": "Sylvain"
      },
      {
        "id": "ruisseau",
        "name": "Le ruisseau",
        "icon": "💧",
        "text": "L'eau emporte les feuilles mortes vers l'aval.",
        "clue": "Une boucle de chaussure semblable à celle de Sylvain est prise dans les racines.",
        "focus": "Sylvain"
      },
      {
        "id": "clairiere",
        "name": "La clairière",
        "icon": "🌙",
        "text": "La lune éclaire un cercle d'herbe aplatie.",
        "clue": "Des marques de sève sur la veste de Sylvain correspondent à l'arbre.",
        "focus": "Sylvain"
      }
    ],
    "residents": [
      {
        "name": "Sylvain",
        "job": "bûcheron",
        "trait": "souriant mais très secret",
        "alibi": "Je coupais du bois près de l'ancien chemin.",
        "rumor": "La forêt invente des voix pour nous faire peur.",
        "secret": "Je connais la clairière interdite depuis l'enfance.",
        "hint": "Il regarde souvent vers les Trois Chênes."
      },
      {
        "name": "Adèle",
        "job": "cartographe",
        "trait": "patiente",
        "alibi": "Je dessinais les sentiers à la maison.",
        "rumor": "La carte retrouvée n'est pas ancienne.",
        "secret": "J'ai prêté mon compas à Sylvain.",
        "hint": "Elle sait reconnaître les modifications du plan."
      },
      {
        "name": "Grégoire",
        "job": "chasseur de traces",
        "trait": "taciturne",
        "alibi": "Je suivais des cerfs près du ruisseau.",
        "rumor": "Les pistes reviennent vers la cabane.",
        "secret": "J'ai vu une personne courir avec un manteau vert.",
        "hint": "Il peut comparer les semelles."
      },
      {
        "name": "Nina",
        "job": "apicultrice",
        "trait": "énergique",
        "alibi": "Je protégeais mes ruches.",
        "rumor": "J'ai senti une odeur de sève près du village.",
        "secret": "J'ai trouvé la boucle d'une chaussure.",
        "hint": "Elle connaît les passages du sous-bois."
      },
      {
        "name": "Basile",
        "job": "maire",
        "trait": "prudent",
        "alibi": "Je rédigeais l'avis de recherche.",
        "rumor": "Le garde forestier m'avait parlé d'un chemin disparu.",
        "secret": "Je cache une deuxième carte pour éviter la panique.",
        "hint": "Il a le journal du garde."
      },
      {
        "name": "Maëlle",
        "job": "herboriste",
        "trait": "douce",
        "alibi": "Je ramassais du thym au soleil couchant.",
        "rumor": "Les voix semblent venir d'un seul arbre.",
        "secret": "Je connais la plante qui colore la sève.",
        "hint": "Elle reconnaît les taches de résine."
      },
      {
        "name": "Oscar",
        "job": "messager",
        "trait": "enthousiaste",
        "alibi": "Je portais une lettre au moulin.",
        "rumor": "Une personne portant des bottes à boucle a traversé le pont.",
        "secret": "Je n'ai pas livré une lettre ; j'ai eu peur.",
        "hint": "Il se souvient de tous les trajets."
      }
    ]
  }
];
