/* Visuels authentiques vérifiés, hébergés par leurs ayants droit.
 * Ne pas recopier les fichiers : la présence sur un wiki ou chez l'éditeur
 * n'autorise pas leur redistribution dans ce dépôt.
 */
(() => {
  "use strict";
  const base = "https://cdn.svc.asmodee.net/production-asmodeefrblog/uploads/2025/12/";
  const article = "https://www.asmodee.fr/les-roles-des-loups-garous-de-thiercelieux-que-vous-allez-adorer/";
  const anniversary = "https://www.asmodee.fr/tout-savoir-sur-les-nouveaux-personnages-des-loups-garous-de-thiercelieux-a-decouvrir-dans-ledition-collector-25-ans/";
  // Un rôle = une image vérifiée. Ne jamais réutiliser l'image d'un autre rôle.
  const artFiles = Object.freeze({
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
  });
  const wikiTitles = Object.freeze({
    "villageois": "Simple Villageois", "loup": "Simple Loup-Garou",
    "voyante": "Voyante", "sorciere": "Sorcière", "chasseur": "Chasseur",
    "cupidon": "Cupidon", "petite-fille": "Petite Fille", "voleur": "Voleur",
    "ancien": "Ancien", "bouc": "Bouc Émissaire", "idiot": "Idiot du village",
    "salvateur": "Salvateur", "flute": "Joueur de Flûte",
    "corbeau": "Corbeau", "pyromane": "Pyromane (le village)",
    "grand-loup": "Grand-Méchant-Loup", "infect": "Infect Père des Loups",
    "chevalier": "Chevalier à l'Épée Rouillée", "renard": "Renard",
    "soeurs": "Deux Sœurs", "freres": "Trois Frères",
    "juge": "Juge bègue", "montreur": "Montreur d'ours",
    "comedien": "Comédien", "servante": "Servante Dévouée",
    "chien": "Chien-loup", "enfant": "Enfant Sauvage",
    "villageois-villageois": "Villageois-Villageois",
    "ange": "Ange", "sectaire": "Abominable Sectaire",
    "blanc": "Loup Blanc", "gitane": "Gitane",
    "garde": "Garde Champêtre"
  });
  const source = role => role.edition === "Anniversaire 2026"
    ? anniversary
    : wikiTitles[role.id]
      ? "https://loupgarou.fandom.com/fr/wiki/" + encodeURIComponent(wikiTitles[role.id].replaceAll(" ", "_"))
      : "https://loupgarou.fandom.com/fr/wiki/Liste_des_r%C3%B4les";
  const imageUrl = role => artFiles[role.id] ? base + artFiles[role.id] : null;
  const hasImage = role => Boolean(imageUrl(role));
  function image(role, variant = "small") {
    const frame = document.createElement("span");
    frame.className = "role-art role-art--" + variant;
    frame.setAttribute("aria-label", role.name);
    const fallback = document.createElement("span");
    fallback.className = "role-art-fallback";
    fallback.textContent = role.icon;
    const src = imageUrl(role);
    fallback.hidden = Boolean(src);
    if (src) {
      const img = document.createElement("img");
      img.src = src;
      img.alt = "Illustration officielle du rôle " + role.name;
      img.loading = "lazy";
      img.decoding = "async";
      img.referrerPolicy = "no-referrer";
      img.onerror = () => { img.hidden = true; fallback.hidden = false; };
      frame.append(img);
    }
    frame.append(fallback);
    return frame;
  }
  function link(role, label = "Voir la fiche du rôle") {
    const a = document.createElement("a");
    a.href = source(role);
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = label;
    a.className = "role-source";
    return a;
  }
  window.ROLE_ILLUSTRATIONS = Object.freeze({image, link, source, imageUrl, hasImage, article});
})();