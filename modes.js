/* Listes de rôles proposées par niveau. Le MJ peut modifier chaque sélection.
 * Les IDs correspondent exclusivement à roles.js ; aucun pouvoir n'est inventé. */
(() => {
  "use strict";
  const classique = ["villageois","loup","voyante","sorciere","chasseur","cupidon","petite-fille"];
  const avances = ["voleur","ancien","bouc","idiot","salvateur","corbeau","chevalier","renard","montreur","grand-loup"];
  const modes = {
    classique: {
      id: "classique", titre: "🌙 Classique", niveau: 1,
      description: "Les cartes fondamentales : enquête, bluff, vote et pouvoirs faciles à suivre.",
      roles: classique,
      regles: {events:false,jobs:false,captain:true,couples:true}
    },
    avance: {
      id: "avance", titre: "🦊 Avancé", niveau: 2,
      description: "Ajoute protections, indices de voisinage, votes spéciaux et un Loup plus redoutable.",
      roles: [...classique,...avances],
      regles: {events:false,jobs:false,captain:true,couples:true}
    },
    expert: {
      id: "expert", titre: "🐺 Expert", niveau: 3,
      description: "Tout le catalogue : camps indépendants, changements de camp, rôles à interactions et arbitrages complexes.",
      roles: null, // Tous les rôles disponibles, y compris les éditions additionnelles.
      regles: {events:true,jobs:true,captain:true,couples:true}
    }
  };
  const allowed = (id, allRoles) => {
    const mode = modes[id] || modes.classique;
    const ids = new Set(allRoles.map(role => role.id));
    return (mode.roles || allRoles.map(role => role.id)).filter(roleId => ids.has(roleId));
  };
  window.LG_MODES = {modes, allowed};
})();
