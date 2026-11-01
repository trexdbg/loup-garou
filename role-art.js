/* Référencement d'illustrations authentiques, sans copie des images dans le dépôt.
 * Pour chaque rôle, une image précise et la page source. L'absence de visuel
 * vérifié donne une icône neutre, jamais la carte d'un rôle voisin.
 * Les planches externes sont recadrées uniquement par CSS à l'affichage.
 */
(() => {
  "use strict";
  const asmodee = "https://cdn.svc.asmodee.net/production-asmodeefrblog/uploads/2025/12/";
  const article = "https://www.asmodee.fr/les-roles-des-loups-garous-de-thiercelieux-que-vous-allez-adorer/";
  const anniversary = "https://www.asmodee.fr/tout-savoir-sur-les-nouveaux-personnages-des-loups-garous-de-thiercelieux-a-decouvrir-dans-ledition-collector-25-ans/";
  const playin = "https://www.play-in.com/en/produit/298465/les-loups-garous-de-thiercelieux-extension-personnages-2019";
  const plateOne = "https://media.play-in.com/img/product/secondary/les-loups-garous-de-thiercelieux-extension-personnages-jeu-zygomatic-personnages.jpg";
  const plateTwo = "https://media.play-in.com/img/product/secondary/les-loups-garous-de-thiercelieux-extension-personnages-jeu-zygomatic-personnages-2.jpg";
  const plateBase = "https://cdn.shopify.com/s/files/1/0776/4285/8827/files/cartes_jeu_loups-garous_de_Thiercelieux.jpg?v=1741960812";
  const baseSource = "https://www.delijeux.com/asmodee/les-loups-garous-de-thiercelieux";
  const villageoisUrl = "https://cdn-www.konbini.com/files/2024/10/Carte_SimpleVillaegois.webp?auto=webp&quality=75&width=828";
  const villageoisSource = "https://www.konbini.com/popculture/on-a-classe-objectivement-les-personnages-des-loups-garous-de-thiercelieux-du-plus-ennuyeux-au-plus-fun/";

  const verifiedFiles = {
    "sorciere": "role-loup-garou-sorciere-300x300.jpg",
    "voyante": "role-loup-garou-voyante-2-300x300.jpg",
    "chasseur": "role-loup-garou-chasseur-2-300x300.jpg",
    "cupidon": "loup-garou-role-cupidon-2-300x300.jpg",
    "renard": "role-loup-garou-renard-2-300x300.jpg",
    "soeurs": "role-loup-garou-soeurs-2-300x300.jpg",
    "freres": "role-loup-garou-les-3-freres-298x300.jpg",
    "enfant": "role-loup-garou-enfant-sauvage-2-300x300.jpg",
    "blanc": "role-loup-garou-blanc-300x300.jpg",
    "flute": "role-loup-garou-joueur-flute-300x300.jpg"
  };

  // Planches de l'extension Personnages : rangées et colonnes identifiées
  // grâce aux noms imprimés sous chaque illustration, sans deviner les cartes.
  const personOne = {
    "sectaire": [0, 0], "ange": [1, 0], "chevalier": [2, 0],
    "chien": [0, 1], "comedien": [1, 1], "grand-loup": [1, 2],
    "gitane": [2, 2]
  };
  const personTwo = {
    "infect": [0, 0], "juge": [1, 0], "montreur": [2, 0],
    "servante": [1, 1], "villageois-villageois": [0, 2]
  };
  // Planches originales des cartes de base : uniquement les dessins
  // identifiés sans ambiguïté (loup, petite fille, idiot, salvateur).
  const baseGrid = {
    "salvateur": [0, 0],
    "petite-fille": [0, 1],
    "idiot": [1, 1],
    "loup": [0, 2]
  };
  function cell(url, source, col, row, size, width, x0, y0, dx, dy) {
    return {url, source, crop:{
      size, width, x:x0 + col*dx, y:y0 + row*dy
    }};
  }
  const art = {};
  for (const [id,file] of Object.entries(verifiedFiles)) {
    art[id] = {url:asmodee + file, source:article};
  }
  for (const [id,[col,row]] of Object.entries(personOne)) {
    art[id] = cell(plateOne, playin, col,row,136,500,38,5,151,142);
  }
  for (const [id,[col,row]] of Object.entries(personTwo)) {
    art[id] = cell(plateTwo,playin,col,row,136,500,38,5,151,142);
  }
  for (const [id,[col,row]] of Object.entries(baseGrid)) {
    art[id] = cell(plateBase,baseSource,col,row,120,512,5,5,126,126);
  }
  art["villageois"]={url:villageoisUrl,source:villageoisSource};

  // Blasons originaux Nouvelle Lune visibles sur la planche officielle Asmodee :
  // Ancien = carte en haut à droite (arbre), Bouc = carte centrale (bouffon).
  const newMoonPlate = "https://cdn.svc.asmodee.net/production-asmodeeca/uploads/2023/07/LMELG02FREN-WEREWOLVES_OF_MILLER_HOLLOW-NEW_MOON-ML-COMPONENTS-1024x1024.png";
  const newMoonSource = "https://www.asmodee.ca/product/loups-garous-de-thiercelieux-les-nouvelle-lune/";
  art["ancien"] = {url:newMoonPlate, source:newMoonSource,
    crop:{size:240,width:512,x:269,y:5}};
  art["bouc"] = {url:newMoonPlate,source:newMoonSource,
    crop:{size:240,width:512,x:120,y:141}};
  // La véritable carte du Voleur (masque turquoise tenant deux cartes).
  art["voleur"] = {url:"https://babygloo.com/cdn/shop/files/38420.jpg?v=1758641542&width=800",
    source:"https://babygloo.com/products/les-loups-garous-de-thiercelieux"};


  const wikiTitles = Object.freeze({
    "villageois": "Simple Villageois", "loup": "Simple Loup-Garou",
    "voyante": "Voyante", "sorciere": "Sorcière", "chasseur": "Chasseur",
    "cupidon": "Cupidon", "petite-fille": "Petite Fille", "voleur": "Voleur",
    "ancien": "Ancien", "bouc": "Bouc Émissaire", "idiot": "Idiot du village",
    "salvateur": "Salvateur", "flute": "Joueur de Flûte",
    "corbeau": "Corbeau", "pyromane": "Pyromane",
    "grand-loup": "Grand-Méchant-Loup", "infect": "Infect Père des Loups",
    "chevalier": "Chevalier à l'Épée Rouillée", "renard": "Renard",
    "soeurs": "Deux Sœurs", "freres": "Trois Frères",
    "juge": "Juge Bègue", "montreur": "Montreur d'Ours",
    "comedien": "Comédien", "servante": "Servante Dévouée",
    "chien": "Chien-Loup", "enfant": "Enfant Sauvage",
    "villageois-villageois": "Villageois-Villageois", "ange": "Ange",
    "sectaire": "Abominable Sectaire", "blanc": "Loup Blanc",
    "gitane": "Gitane", "garde": "Garde Champêtre"
  });
  const source = role => role.edition === "Anniversaire 2026"
    ? anniversary
    : wikiTitles[role.id]
      ? "https://loupgarou.fandom.com/fr/wiki/" + encodeURIComponent(wikiTitles[role.id].replaceAll(" ", "_"))
      : "https://loupgarou.fandom.com/fr/wiki/Liste_des_r%C3%B4les";
  const imageUrl = role => art[role.id]?.url || null;
  const imageSource = role => art[role.id]?.source || null;
  const hasImage = role => Boolean(imageUrl(role));
  function image(role, variant = "small") {
    const frame = document.createElement("span");
    frame.className = "role-art role-art--" + variant;
    frame.setAttribute("aria-label", role.name);
    const fallback = document.createElement("span");
    fallback.className = "role-art-fallback";
    fallback.textContent = role.icon;
    const asset = art[role.id];
    fallback.hidden = Boolean(asset);
    if (asset) {
      const img = document.createElement("img");
      img.src = asset.url;
      img.alt = "Carte authentique du rôle " + role.name;
      img.loading = variant === "hero" ? "eager" : "lazy";
      img.decoding = "async";
      img.referrerPolicy = "no-referrer";
      if (asset.crop) {
        const c = asset.crop;
        img.className = "role-art-sprite";
        img.setAttribute("style",
          "width:"+(c.width/c.size*100)+"%;height:"+(c.width/c.size*100)+"%;"+
          "left:-"+(c.x/c.size*100)+"%;top:-"+(c.y/c.size*100)+"%;");
      }
      img.onerror = () => {img.hidden = true;fallback.hidden = false;};
      frame.append(img);
    }
    frame.append(fallback);
    return frame;
  }
  function external(url, label) {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = label;
    a.className = "role-source";
    return a;
  }
  const link = (role,label="Voir la fiche du rôle") => external(source(role),label);
  const credit = role => imageSource(role) ? external(imageSource(role),"Source de l'illustration ↗") : null;
  window.ROLE_ILLUSTRATIONS = Object.freeze({
    image, link, credit, source, imageSource, imageUrl, hasImage, article
  });
})();