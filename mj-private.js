/* Carnet secret du MJ : les rôles sont lus depuis secrets_mj.json seulement à l'ouverture du panneau secret. L'écriture sur GitHub reste gérée par ChatGPT, pas par ce module.
 * Session de navigateur par défaut ; sauvegarde durable locale uniquement sur consentement.
 * Un écran partagé n'est pas un mécanisme d'authentification : masquer avant de le montrer. */
(() => {
  "use strict";
  const allRoles = window.ROLES || [];
  const byId = window.ROLE_BY_ID || {};
  const secretKey = id => "lg-mj-private-v1:" + id;
  const make = (tag, text, className) => {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  };
  const labelFor = roleId => byId[roleId] ? byId[roleId].name : "Rôle à définir";
  const nameOf = value => typeof value === "string" ? value : (value?.prenom || value?.name || value?.nom || "");
  const cleanName = value => String(value || "").trim().slice(0, 60);

  function publicNames(state) {
    const list = [];
    const add = name => { name = cleanName(name); if (name && !list.includes(name)) list.push(name); };
    const humans = state.joueurs_humains || state.participants?.joueurs_humains;
    if (Array.isArray(humans) && humans.length) humans.forEach(player => add(nameOf(player)));
    else add(state.participants?.joueur?.prenom || state.joueur?.prenom || state.joueur?.nom);
    const inhabitants = state.personnages_pnj || state.pnjs || state.pnj || state.personnages || state.habitants || [];
    if (Array.isArray(inhabitants)) inhabitants.forEach(item => add(nameOf(item)));
    return list;
  }

  function readStorage(storage, id) {
    try {
      const data = JSON.parse(storage.getItem(secretKey(id)) || "null");
      if (!data || data.id !== id || !Array.isArray(data.roles)) return null;
      return data.roles
        .filter(x => x && cleanName(x.personnage) && (!x.role || byId[x.role]))
        .slice(0, 50)
        .map(x => ({personnage:cleanName(x.personnage), role: x.role || ""}));
    } catch (_) { return null; }
  }

  let activeHide = () => {};
  function attach(id, state, mount) {
    mount.replaceChildren();
    const names = publicNames(state);
    const storedLocal = readStorage(localStorage, id);
    const storedSession = readStorage(sessionStorage, id);
    let entries = (storedSession || storedLocal || []).map(x => ({...x}));
    for (const name of names) if (!entries.some(x => x.personnage === name)) entries.push({personnage:name,role:""});
    let keepLocal = Boolean(storedLocal);
    let open = false;
    let lectureNumero = 0;

    const toggle = make("button", "🗝️ Afficher le carnet secret du MJ", "secondary mj-private-toggle");
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", "false");
    const region = make("div", undefined, "mj-private-region");
    region.hidden = true;
    const note = make("p", "Régie réservée au maître du jeu : les cartes sont chargées depuis les archives GitHub. Les joueurs n’utilisent pas cet écran. Cliquez sur Masquer si vous devez dissimuler les informations.", "fine");
    const stats = make("p", "", "mj-private-stats");
    const secretTimeline = make("section", undefined, "mj-secret-timeline");
    const list = make("div", undefined, "mj-character-grid");
    const status = make("p", "", "mj-private-status");
    status.setAttribute("role", "status");
    const importLabel = make("label", "Coller le JSON privé envoyé par ChatGPT", "wide-label");
    const importInput = make("textarea");
    importInput.rows = 5;
    importInput.spellcheck = false;
    importInput.placeholder = '{"id":"'+id+'","roles":[{"personnage":"Alex","role":"renard"}]}';
    importInput.setAttribute("aria-label", "JSON de répartition secrète des rôles");
    importLabel.append(importInput);
    const importButton = make("button", "Importer les rôles", "secondary");
    importButton.type = "button";
    const newName = make("input");
    newName.placeholder = "Nom d'un autre personnage";
    newName.maxLength = 60;
    newName.setAttribute("aria-label", "Nom du nouveau personnage");
    const addButton = make("button", "Ajouter", "ghost");
    addButton.type = "button";
    const entryRow = make("div", undefined, "mj-private-controls");
    entryRow.append(newName, addButton);
    const savedLabel = make("label", undefined, "mj-private-save");
    const remember = make("input");
    remember.type = "checkbox"; remember.checked = keepLocal;
    savedLabel.append(remember, document.createTextNode(" Conserver les rôles sur cet appareil après fermeture du navigateur (moins confidentiel)."));
    const exportButton = make("button", "Exporter le JSON privé", "ghost");
    exportButton.type = "button";
    const clearButton = make("button", "Effacer les rôles de cet appareil", "ghost");
    clearButton.type = "button";
    const buttons = make("div", undefined, "mj-private-controls");
    buttons.append(importButton, exportButton, clearButton);
    const foxPanel = make("section", undefined, "mj-fox-check");
    const foxHeading = make("h4", "🦊 Contrôle privé du flair du Renard");
    const foxHint = make("p", "Choisir d'abord une figurine au centre du trio sur le plan de table. Ici, seul le MJ voit si le trio contient au moins un Loup-Garou. Ce contrôle n'utilise pas le pouvoir et ne décide pas de sa perte.", "fine");
    const foxButton = make("button", "Vérifier le trio sélectionné", "secondary");
    foxButton.type = "button";
    const foxAnswer = make("p", "", "mj-fox-answer");
    foxPanel.append(foxHeading, foxHint, foxButton, foxAnswer);
    region.append(note, stats, secretTimeline, list, foxPanel, entryRow, importLabel, buttons, savedLabel, status);
    mount.append(toggle, region);

    foxButton.addEventListener("click", () => {
      const group = window.LG_TABLE?.getTrio(id) || [];
      if (group.length !== 3) {
        foxAnswer.textContent = "Impossible : il faut trois figurines encore présentes et une cible sélectionnée sur la table.";
        return;
      }
      const identities = group.map(personnage => entries.find(x => x.personnage.toLocaleLowerCase("fr") === personnage.toLocaleLowerCase("fr"))?.role || "");
      const certainWolf = identities.some(roleId => byId[roleId]?.team === "loups" || roleId === "blanc");
      const uncertain = identities.some(roleId => !roleId || byId[roleId]?.team === "variable");
      const label = "Groupe : " + group.join(" · ") + ". ";
      foxAnswer.textContent = certainWolf
        ? label + "OUI — le flair détecte au moins un Loup-Garou. Ne révèle pas lequel au joueur."
        : uncertain
          ? label + "RÉSULTAT INCERTAIN — un rôle manque ou peut changer de camp. Le MJ doit vérifier les affiliations secrètes."
          : label + "NON — aucun Loup-Garou détecté. Selon la règle du Renard, son flair est perdu après ce résultat, si le MJ valide l'action.";
    });

    function persist() {
      const data = JSON.stringify({id, roles:entries});
      try { sessionStorage.setItem(secretKey(id), data); } catch (_) {}
      try {
        if (keepLocal) localStorage.setItem(secretKey(id), data);
        else localStorage.removeItem(secretKey(id));
      } catch (_) {}
    }

    function render() {
      list.replaceChildren();
      const placement = window.LG_TABLE?.getOrder(id) || [];
      const ordered = entries.slice().sort((a, b) => {
        const ai = placement.indexOf(a.personnage), bi = placement.indexOf(b.personnage);
        return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi);
      });
      for (const item of ordered) {
        const card = make("div", undefined, "mj-character-card");
        const index = placement.indexOf(item.personnage);
        const heading = make("strong", (index < 0 ? "" : "LEGO " + (index + 1) + " · ") + item.personnage, "mj-character-name");
        const select = make("select");
        select.setAttribute("aria-label", "Rôle de " + item.personnage);
        select.append(new Option("— Rôle inconnu —", ""));
        for (const role of allRoles) select.append(new Option(role.icon + " " + role.name, role.id));
        select.value = byId[item.role] ? item.role : "";
        const details = make("div", undefined, "mj-role-details");
        const refreshDetails = () => {
          details.replaceChildren();
          const role = byId[item.role];
          if (!role) { details.append(make("small", "Non attribué")); return; }
          if (window.ROLE_ILLUSTRATIONS) details.append(window.ROLE_ILLUSTRATIONS.image(role, "preview"));
          const info = make("div");
          info.append(make("b", labelFor(item.role)), make("p", role.power), make("small", (window.CAMPS || {})[role.team] || role.team));
          details.append(info);
        };
        select.addEventListener("change", () => {
          item.role = select.value;
          persist(); refreshDetails();
          stats.textContent = entries.filter(x => x.role).length + " rôle(s) attribué(s) sur " + entries.length + " personnage(s).";
          status.textContent = "Répartition modifiée sur cet appareil uniquement.";
        });
        refreshDetails();
        card.append(heading, select, details);
        list.append(card);
      }
      stats.textContent = entries.filter(x => x.role).length + " rôle(s) attribué(s) sur " + entries.length + " personnage(s).";
    }

    function renderNightNotes(notes) {
      secretTimeline.replaceChildren();
      if (!notes || typeof notes !== "object") return;
      const night = notes.nuit_1;
      const potions = notes.etat_initial?.potions_sorciere;
      const title = make("h4", "🌙 Carnet secret — suivi des pouvoirs");
      secretTimeline.append(title);
      const rows = [];
      if (night?.voyante) {
        const target = night.voyante.cible || "à choisir";
        const observed = night.voyante.role_revele || "en attente";
        rows.push(["Voyante", (night.voyante.observatrice || "Voyante") + " a observé " + target + " : " + observed]);
      }
      if (night?.loups) rows.push(["Loups-Garous", "Victime désignée : " + (night.loups.victime_designee || "en attente") + (night.loups.attaque_resolue ? " · attaque arbitrée" : " · attente de résolution")]);
      if (night?.sorciere) {
        const decision = night.sorciere.decision;
        rows.push(["Sorcière", decision
          ? (decision.sauve ? "Sauvetage : " + decision.sauve : "Potion de vie : " + (decision.potion_vie || "non utilisée")) + " · Potion de mort : " + (decision.potion_mort || "non utilisée")
          : "En attente de sa décision"]);
      }
      if (potions) rows.push(["Potions restantes", "Vie : " + (potions.vie ?? "?") + " · Mort : " + (potions.mort ?? "?")]);
      if (notes.etat_initial?.voyante_observations?.length)
        rows.push(["Observations", notes.etat_initial.voyante_observations.length + " observation(s) archivées"]);
      if (night?.victimes_confirmees) rows.push(["Victimes de la nuit", night.victimes_confirmees.length ? night.victimes_confirmees.join(", ") : "Aucune"]);
      if (!rows.length) { secretTimeline.append(make("p","Aucune action nocturne enregistrée.","fine"));return; }
      const grid = make("div",undefined,"mj-night-ledger");
      for (const [label,value] of rows) {
        const card = make("div",undefined,"mj-night-ledger-item");
        card.append(make("small",label),make("strong",value));
        grid.append(card);
      }
      secretTimeline.append(grid);
      secretTimeline.append(make("p","Réservé au MJ · informations lues depuis les archives GitHub. Ne jamais les lire aux joueurs.","fine"));
    }

    async function chargerRolesArchives() {
      const numero = ++lectureNumero;
      status.textContent = "Chargement des cartes du MJ depuis GitHub…";
      try {
        const url = "https://raw.githubusercontent.com/trexdbg/loup-garou/main/parties/" +
          encodeURIComponent(id) + "/secrets_mj.json";
        const reponse = await fetch(url, {cache:"no-store"});
        if (!reponse.ok) throw new Error("HTTP " + reponse.status);
        const data = await reponse.json();
        if (data.id !== id || !Array.isArray(data.roles) || data.roles.length > 50) {
          throw new Error("Archive invalide");
        }
        const attribues = [];
        for (const item of data.roles) {
          const personnage = cleanName(item.personnage);
          const role = item.role;
          if (!personnage || !byId[role] || attribues.some(e => e.personnage === personnage)) {
            throw new Error("Rôles invalides");
          }
          attribues.push({personnage, role});
        }
        if (!open || numero !== lectureNumero) return;
        for (const name of names) {
          if (!attribues.some(e => e.personnage === name)) attribues.push({personnage:name,role:""});
        }
        entries = attribues;
        persist();
        render();
        renderNightNotes(data.notes_mj);
        status.textContent = "Cartes attribuées : " + data.roles.length +
          ". Chargées depuis l'archive GitHub (publique).";
      } catch (e) {
        if (open && numero === lectureNumero) {
          status.textContent = "Chargement GitHub indisponible : tu peux importer le JSON manuellement.";
        }
      }
    }

    activeHide = () => { if (open) toggle.click(); };
    toggle.addEventListener("click", () => {
      open = !open;
      region.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "🔒 Masquer les rôles secrets" : "🗝️ Afficher le carnet secret du MJ";
      if (open) {
        render();
        void chargerRolesArchives();
      } else {
        ++lectureNumero;
        importInput.value = "";
        foxAnswer.textContent = "";
        secretTimeline.replaceChildren();
        list.replaceChildren(); // Retire les secrets du DOM quand le panneau est masqué.
      }
    });

    addButton.addEventListener("click", () => {
      const name = cleanName(newName.value);
      if (!name) { status.textContent = "Indique un nom de personnage."; return; }
      if (entries.some(x => x.personnage.toLocaleLowerCase("fr") === name.toLocaleLowerCase("fr"))) {
        status.textContent = "Ce personnage est déjà présent."; return;
      }
      if (entries.length >= 50) { status.textContent = "Limite de 50 personnages."; return; }
      entries.push({personnage:name,role:""}); newName.value = "";
      persist(); render(); status.textContent = "Personnage ajouté à ce carnet privé.";
    });

    importButton.addEventListener("click", () => {
      let parsed;
      try { parsed = JSON.parse(importInput.value); }
      catch (_) { status.textContent = "JSON invalide : copie le bloc complet envoyé par ChatGPT."; return; }
      if (!parsed || parsed.id !== id || !Array.isArray(parsed.roles)) {
        status.textContent = "L'ID doit correspondre à cette partie et « roles » doit être une liste."; return;
      }
      if (parsed.roles.length < 1 || parsed.roles.length > 50) {
        status.textContent = "Le JSON doit contenir entre 1 et 50 personnages."; return;
      }
      const imported = [];
      for (const item of parsed.roles) {
        const name = cleanName(item?.personnage || item?.prenom || item?.nom || item?.name);
        const roleId = item?.role || item?.roleId || item?.role_id || "";
        if (!name || !byId[roleId]) {
          status.textContent = "Entrée invalide : nom manquant ou rôle inconnu (« " + String(roleId).slice(0, 50) + " »).";
          return;
        }
        if (imported.some(x => x.personnage.toLocaleLowerCase("fr") === name.toLocaleLowerCase("fr"))) {
          status.textContent = "Personnage en double : " + name; return;
        }
        imported.push({personnage:name, role:roleId});
      }
      // Conserver les noms publics non encore renseignés.
      for (const name of names) if (!imported.some(x => x.personnage === name)) imported.push({personnage:name,role:""});
      entries = imported;
      importInput.value = "";
      persist(); render();
      status.textContent = "Rôles importés localement. Cette action ne publie rien ; l’archivage GitHub des rôles validés est géré séparément par ChatGPT.";
    });

    remember.addEventListener("change", () => {
      keepLocal = remember.checked; persist();
      status.textContent = keepLocal
        ? "Rôles conservés sans chiffrement sur cet appareil. Pense à masquer le panneau."
        : "Sauvegarde persistante retirée : rôles gardés seulement durant cette session.";
    });
    exportButton.addEventListener("click", () => {
      const data = JSON.stringify({id, roles:entries}, null, 2);
      const url = URL.createObjectURL(new Blob([data], {type:"application/json"}));
      const a = make("a");
      a.href = url; a.download = id + "-roles-mj-PRIVE.json";
      document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      status.textContent = "Fichier de rôles exporté localement. Le MJ peut demander à ChatGPT de le conserver dans secrets_mj.json sur GitHub public.";
    });
    clearButton.addEventListener("click", () => {
      entries = names.map(personnage => ({personnage,role:""}));
      keepLocal = false; remember.checked = false;
      try { localStorage.removeItem(secretKey(id)); sessionStorage.removeItem(secretKey(id)); } catch (_) {}
      importInput.value = "";
      render();
      status.textContent = "Rôles effacés du carnet de cet appareil.";
    });
    // Espace exclusivement MJ : cartes affichées dès l’ouverture, mais masquables en un clic.
    if (typeof toggle.click === "function") toggle.click();
  }
  if (document.addEventListener) document.addEventListener("visibilitychange", () => { if (document.hidden) activeHide(); });
  window.LG_MJ_PRIVATE = {attach, hide:() => activeHide()};
})();
