(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const roles = window.ROLES || [];
  const stories = window.STORIES || [];
  const modeCatalog = window.LG_MODES;
  const voicePool = window.LG_VOICE_POOL?.entries || [];
  const repo = "trexdbg/loup-garou";
  const draftKey = "lg-launcher-draft-v2";
  const $v = id => $(id).value;
  const checked = id => $(id).checked;
  const make = (tag, text, className) => {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  };
  const clean = (value, max) => String(value || "").trim().slice(0, max);
  const num = (id, min, max) => Math.min(max, Math.max(min, Number($v(id)) || min));
  let generated = null;

  function sessionId() {
    const today = new Date();
    const date = String(today.getFullYear()) +
      String(today.getMonth() + 1).padStart(2, "0") +
      String(today.getDate()).padStart(2, "0");
    const bytes = new Uint8Array(6);
    if (window.crypto && typeof window.crypto.getRandomValues === "function") {
      window.crypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
    }
    return "LG-" + date + "-" + Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
  }

  function setTab(tab) {
    const archives = tab === "archives";
    if (!archives && window.LG_SCENES) window.LG_SCENES.stop();
    if (!archives && window.LG_MJ_PRIVATE) window.LG_MJ_PRIVATE.hide();
    $("prepareSection").hidden = archives;
    $("archiveSection").hidden = !archives;
    $("tabPrepare").setAttribute("aria-selected", String(!archives));
    $("tabArchives").setAttribute("aria-selected", String(archives));
    if (archives) refreshArchives();
  }

  function selectedCast() {
    if (!voicePool.length) return [];
    const names = new Set(Array.from(document.querySelectorAll(".voice-pool-check:checked"), x => x.value));
    return voicePool.filter(x => names.has(x.personnage));
  }
  function voicePoolStatus() {
    const label = $("voicePoolStatus");
    if (!label) return;
    const n = selectedCast().length;
    label.textContent = n + " PNJ sélectionnés sur 15 · une voix Phonon différente par habitant" +
      (n < 3 ? " (au moins 3 sont nécessaires)" : "");
  }
  function renderVoicePool() {
    const container = $("voicePoolList");
    if (!container || !voicePool.length) return;
    const standard = new Set(["Rose","Hugo","Salomé","Marin","Inès","Baptiste","Jade"]);
    container.replaceChildren();
    for (const person of voicePool) {
      const label = make("label", undefined, "voice-pool-person");
      const check = document.createElement("input");
      check.type = "checkbox";
      check.className = "voice-pool-check";
      check.value = person.personnage;
      check.checked = standard.has(person.personnage);
      label.append(check, make("strong", person.personnage));
      label.append(make("span", "🎙️ " + person.voix + " · " + person.caractere));
      check.addEventListener("change", () => {
        $("npcCount").value = selectedCast().length;
        voicePoolStatus();
        clearGenerated();
      });
      container.append(label);
    }
    $("npcCount").max = String(voicePool.length);
    $("npcCount").addEventListener("change", () => {
      const wanted = Math.min(voicePool.length, Math.max(3, Number($v("npcCount")) || 7));
      const all = Array.from(container.querySelectorAll(".voice-pool-check"));
      const chosen = all.filter(x => x.checked);
      const rest = all.filter(x => !x.checked);
      const keep = new Set([...chosen, ...rest].slice(0, wanted));
      all.forEach(x => x.checked = keep.has(x));
      $("npcCount").value = wanted;
      voicePoolStatus();
    });
    voicePoolStatus();
  }
  function populate() {
    renderVoicePool();
    const story = $("scenario");
    // Partie classique uniquement : les habitants connaissent déjà la présence des Loups-Garous.
    story.replaceChildren(new Option("🐺 Loups-Garous traditionnel — trouver les Loups", "originale"));
    const role = $("roleChoice");
    role.append(new Option("🎲 Tiré au sort par ChatGPT", "random"));
    for (const r of roles) role.append(new Option(r.icon + " " + r.name, r.id));

    const groups = [...new Set(roles.map(r => r.edition))];
    for (const group of groups) {
      const fieldset = make("fieldset", undefined, "roles-group");
      const legend = make("legend", group); fieldset.append(legend);
      for (const r of roles.filter(x => x.edition === group)) {
        const label = make("label", undefined, "role-choice");
        const input = document.createElement("input");
        input.type = "checkbox"; input.checked = true;
        input.value = r.id; input.className = "role-allowed";
        input.addEventListener("change", () => { updateRoleCount(); updateAvailableRoleChoices(); clearGenerated(); });
        label.append(input, document.createTextNode(" " + r.icon + " " + r.name));
        fieldset.append(label);
      }
      $("roleChecklist").append(fieldset);
    }
    $("gameMode").addEventListener("change", () => { applyMode(); clearGenerated(); });
    $("roleChoice").addEventListener("change", () => { updateRolePreview(); clearGenerated(); });
    applyMode();
  }

  function applyMode() {
    const mode = modeCatalog.modes[$v("gameMode")] || modeCatalog.modes.classique;
    const pool = new Set(modeCatalog.allowed(mode.id, roles));
    for (const input of document.querySelectorAll(".role-allowed")) input.checked = pool.has(input.value);
    for (const [id, value] of Object.entries(mode.regles)) $(id).checked = value;
    updateRoleCount();
    updateAvailableRoleChoices();
  }
  function updateAvailableRoleChoices() {
    const role = $("roleChoice"), wanted = role.value;
    const pool = new Set(allowedRoles());
    role.replaceChildren(new Option("🎲 Tiré au sort par ChatGPT", "random"));
    for (const r of roles.filter(item => pool.has(item.id))) role.append(new Option(r.icon + " " + r.name, r.id));
    role.value = pool.has(wanted) ? wanted : "random";
    updateRolePreview();
  }
  function allowedRoles() {
    return Array.from(document.querySelectorAll(".role-allowed:checked")).map(x => x.value);
  }
  function updateRoleCount() {
    $("rolePoolCount").textContent = allowedRoles().length + " rôle(s) autorisé(s) sur " + roles.length;
    const mode = modeCatalog.modes[$v("gameMode")] || modeCatalog.modes.classique;
    $("modeSummary").textContent = mode.description + " (" + allowedRoles().length + " rôles sélectionnés sur " + roles.length + " ; sélection personnalisable.)";
  }
  function updateRolePreview() {
    const id = $v("roleChoice");
    const role = roles.find(r => r.id === id);
    const area = $("rolePreview");
    area.replaceChildren();
    if (!role) {
      area.append(make("p", "ChatGPT attribuera un rôle au début de l'aventure, parmi ceux autorisés. Le MJ pourra approuver le résultat."));
      return;
    }
    if (window.ROLE_ILLUSTRATIONS) area.append(window.ROLE_ILLUSTRATIONS.image(role, "preview"));
    const description = make("div");
    description.append(make("strong", role.name), make("p", role.power), make("small", "Pouvoir : " + (role.support === "mj" ? "arbitrage MJ" : "règles suivies par ChatGPT")));
    if (window.ROLE_ILLUSTRATIONS) description.append(window.ROLE_ILLUSTRATIONS.link(role, "Fiche authentique"));
    area.append(description);
  }

  function config() {
    const pool = allowedRoles();
    if (!pool.length) throw new Error("Sélectionne au moins un rôle autorisé.");
    const requestedRole = $v("roleChoice");
    if (requestedRole !== "random" && !pool.includes(requestedRole)) {
      throw new Error("Le rôle choisi doit figurer parmi les rôles autorisés.");
    }
    const casting = selectedCast();
    if (voicePool.length && (casting.length < 3 || casting.length > 15)) {
      throw new Error("Choisis entre 3 et 15 personnages dans le casting vocal.");
    }
    const story = stories.find(s => s.id === $v("scenario"));
    const name = clean($v("heroName"), 40) || "Alex";
    const now = new Date().toISOString();
    const id = sessionId();
    return {
      schema_version: 2,
      id,
      cree_le: now,
      statut: "a_creer_sur_github",
      source: "Thiercelieux Solo / configurateur GitHub Pages",
      fonctionnement: {
        jeu: "ChatGPT dans le projet Loup garou",
        arbitre: "maitre_du_jeu_humain",
        joueurs_humains: 1,
        pnjs_joues_par: "ChatGPT",
        depot_archive: repo,
        application: "configuration et consultation exclusivement"
      },
      joueur: {
        prenom: name,
        age: num("heroAge", 6, 99),
        role: {
          attribution: requestedRole === "random" ? "tirage_par_chatgpt_avec_accord_mj" : "choix_fixe",
          id: requestedRole === "random" ? null : requestedRole,
          secret_vis_a_vis_du_public: true
        }
      },
      aventure: {
        scenario: story ? story.id : "originale",
        connaissance_loups_initiale: true,
        objectif_principal: "identifier_les_loups_par_dialogues_pouvoirs_et_votes",
        enigme_annexe_par_defaut: false,
        scenario_reference: story ? story.title : null,
        titre_libre: clean($v("customTitle"), 100) || null,
        duree_minutes: num("duration", 20, 120),
        pnj_nombre: voicePool.length ? casting.length : num("npcCount", 3, 15),
        casting_pnj: casting.map(x => ({
          prenom: x.personnage, caractere: x.caractere,
          voix_phonon: x.voix, voix_id_phonon: x.voice_id
        })),
        catalogue_voix: "voices/phonon-fr.json",
        regle_camp_voix: "Les personnages et leurs voix restent stables; les rôles sont tirés par partie.",
        monde: $v("environment"),
        ambiance: $v("storyStyle"),
        theme_personnalise: clean($v("themeFree"), 600) || null,
        mystere: num("intensity", 1, 5),
        humour: num("humor", 1, 5),
        difficulte_enquete: num("difficulty", 1, 5),
        frayeur: num("fear", 1, 5),
        violence_graphique: false,
        narration_adaptee_a_l_age: true
      },
      roles: {
        mode: $v("gameMode"),
        liste_personnalisee: JSON.stringify(pool) !== JSON.stringify(modeCatalog.allowed($v("gameMode"), roles)),
        niveau: modeCatalog.modes[$v("gameMode")].niveau,
        autorises: pool,
        loup_garou_nombre_cible: num("wolfCount", 1, 5),
        respecter_les_cartes_et_leurs_pouvoirs: true,
        variantes_et_compatibilite: "Arbitrer les interactions complexes avec le MJ. Ne pas inventer le pouvoir officiel d'une carte.",
        capitaine: checked("captain"),
        amoureux_cupidon: checked("couples"),
        evenements_nouvelle_lune: checked("events"),
        batiments_metiers_le_village: checked("jobs")
      },
      placement_table: {
        type: "circulaire",
        sens: "horaire",
        depart: "12h",
        ordre: null,
        statut: "a_proposer_puis_valider_par_le_mj_apres_creation_des_personnages",
        regle: "une_figurine_lego_par_personnage_carte_cachee_dessous"
      },
      rythme: {
        phases: ["prologue", "village_s_endort", "appels_nocturnes", "village_se_reveille", "dialogues_et_enquete", "vote_ou_resolution", "suite_validee_par_mj"],
        appel_roles_nocturnes: $v("nightOrder"),
        duree_nuit_cible_minutes: num("nightDuration", 1, 15),
        pause_entre_les_scenes: checked("askValidation"),
        improvisation_libre: checked("allowImprovisation")
      },
      assistant_mj: {
        mode: "copilote_du_mj",
        decision_finale: "MJ_humain",
        rappels_regles_et_ordre_pouvoirs: checked("mjGuidance"),
        aides_indices: checked("hints"),
        suggestions_relance: checked("pacingHelp"),
        conseils_separes_des_dialogues: true,
        jamais_reveler_secrets_sans_validation: true,
        instructions_privees: "Les secrets validés du MJ peuvent être archivés dans secrets_mj.json sur GitHub public. Ne jamais les révéler dans les scènes destinées au joueur sans validation du MJ."
      },
      media: {
        illustrations_cartes_authentiques_si_disponibles: checked("cardsOn"),
        textes_de_narration: true,
        indications_audio: checked("soundsOn"),
        synthese_vocale_si_disponible: checked("voiceOn"),
        fichiers_generes_ephemeres: true
      },
      publication: {
        git_public: true,
        chemin: "parties/" + id,
        index: "parties/index.json",
        secrets_mj: "secrets_mj.json (fichier public sur GitHub, réservé à l’usage du MJ dans l’interface)",
        fichiers_publics: ["parametres.json", "partie.json", "secrets_mj.json", "narrations.md", "journal.md", "dialogues.ndjson"],
        acces_application: "lecture_seule"
      },
      premiere_execution: {
        attendre_validation_roles_et_placement_lego_avant_creation_du_prologue: true,
        cree_uniquement: ["dossier_de_partie", "parametres.json", "partie.json_public", "secrets_mj.json_apres_validation", "prologue_seulement", "journal_initial", "index_json"],
        ne_pas_generer_les_scenes_suivantes: true,
        attendre_validation_mj_apres_prologue: true,
        ne_pas_simuler_les_decisions_du_joueur: true
      }
    };
  }

  function promptFor(value) {
    return [
      "PROJET LOUP GAROU — INITIALISATION D'UNE NOUVELLE PARTIE",
      "Voici la configuration produite par l'application. Lis son ID exact et utilise le dépôt GitHub " + repo + ".",
      "Tu es l'assistant du maître du jeu humain : tu incarnes les PNJ et proposes les scènes, mais le MJ valide les actions et décisions importantes.",
      "RÈGLE FONDAMENTALE : dès le début tous les habitants savent que des Loups-Garous se cachent dans le village. Le seul grand mystère est LEUR IDENTITÉ. Le jeu est le Loup-Garou traditionnel, pas une quête ou une enquête fantastique.",
      "NARRATION : commence par des discussions, soupçons, bluff, pouvoirs nocturnes, réveil, débats et vote. N’invente aucune lanterne magique, prophétie, cloche étrange, lettre codée, objet à récupérer ou énigme annexe. Les choix de décor et d’ambiance ne changent pas cette règle.",
      "1. Vérifie si parties/" + value.id + "/ existe déjà. S'il existe, demande au MJ s'il faut le reprendre, sans écraser ses données.",
      "2. Commence par proposer les personnages, leur distribution de rôles et le placement des LEGO ; attends l’accord explicite du MJ sur le rôle du joueur, les PNJ et l’ordre circulaire avant de rédiger le prologue. Une fois validé, crée parties/" + value.id + "/parametres.json (paramètres complets, y compris rôle fixé), partie.json (état visible par le joueur, incluant placement_table validé), secrets_mj.json (rôles validés et notes du MJ), narrations.md (UNIQUEMENT le prologue), journal.md et dialogues.ndjson (entrée initiale facultative). Ne dévoile aucun rôle secret dans les scènes destinées au joueur.",
      "3. Mets à jour parties/index.json pour référencer ce même ID, titre, date, statut, phase et dossier; n'écrase pas les autres parties.",
      "3 bis. Utilise EXACTEMENT aventure.casting_pnj comme liste des PNJ. Archive dans partie.json personnages_pnj avec prenom, caractere, voix_phonon et voix_id_phonon. Chaque PNJ conserve cette voix Phonon française d'une partie à l'autre, quel que soit son rôle secret. Alex est joué par l'enfant, sans voix synthétique.",
      "4. Après validation du MJ, conserve les identités, les rôles et les secrets dans parties/" + value.id + "/secrets_mj.json sur GitHub (y compris le rôle du joueur). Ne masque pas le rôle fixé dans parametres.json. Le dépôt GitHub est PUBLIC : les fichiers et leur historique sont lisibles par tous, même si l’application ne les affiche pas au joueur. N’inscris aucun spoiler non révélé dans partie.json, narrations.md ou dialogues.ndjson.",
      "4 bis. Applique le niveau roles.mode (classique, avance ou expert) et les rôles autorisés ; si roles.liste_personnalisee est vraie, la sélection manuelle du MJ prime sur le préréglage. Compose une distribution cohérente pour le nombre de personnages, le total de Loups, les pouvoirs et les camps ; le MJ valide la répartition avant le prologue.",
      "4 bis bis. Propose au MJ un placement CIRCULAIRE des personnages avec exactement une figurine LEGO par personne (joueur inclus). Place 1 à 12 h, parcours horaire, noms et numéros de place. Attends la validation du MJ AVANT d'affirmer que les places sont fixées ; archive seulement l'ordre public validé dans partie.json au champ placement_table. Les cartes physiques restent cachées sous les figurines ; leurs attributions sont archivées uniquement dans secrets_mj.json, et jamais dans placement_table. Toutes les interactions de voisinage, dont le flair du Renard, doivent utiliser cet ordre réel.",
      "4 ter. Après validation des rôles, fournis au MJ dans la conversation PRIVÉE un JSON valide comme {\"id\":\"ID_PARTIE\",\"roles\":[{\"personnage\":\"Alex\",\"role\":\"renard\"}]} avec chaque personnage et son ID exact de rôle issu de roles.js. Archive aussi ce JSON dans secrets_mj.json sur GitHub, sans le faire apparaître dans l’interface joueur ; le MJ peut également le coller dans le carnet secret de l’application.",
      "5. Après validation des LEGO et écriture sur GitHub, raconte un prologue TRÈS COURT (3 à 6 phrases) : les villageois savent déjà que des Loups se cachent parmi eux, ils se réunissent et se soupçonnent. Pas d’énigme annexe. Attends l’accord du MJ avant la première action puis la nuit ; ne simule ni nuit complète, ni vote, ni dénouement.",
      "6. Ensuite, au fil de nos échanges, écris seulement les nouveaux événements validés dans le dossier de cette partie et mets à jour l'index.",
      "7. Reste adapté à un joueur de 10 ans si c'est l'âge indiqué. Respecte les vraies cartes et demande au MJ en cas de règles ambiguës.",
      "8. Pour tout dialogue effectivement joué après le prologue, crée un lot de lignes dans dialogues.ndjson avec des seq croissants, scene_id commun à ce lot et scene_label lisible (ex. tour_de_table_01 puis tour_de_table_02). L'application relit une scène à la demande du MJ ; ne déclenche aucune lecture automatique et ne révèle aucun secret.",
      "9. En phase tour_de_table, laisse Alex intervenir à nouveau après chaque scène audio. Les PNJ peuvent débattre entre eux ; n'impose aucune parole ni action au joueur. Le MJ valide explicitement la fin du tour, le vote ou la nuit. Mets à jour phase et scene_courante_id dans partie.json et l'index sans toucher aux autres parties.",
      "Si tu ne peux pas écrire sur GitHub dans cette conversation, dis-le explicitement et fournis les fichiers à déposer : n'affirme jamais que la synchronisation est faite sans confirmation.",
      "",
      "JSON DE PARAMÈTRES :",
      JSON.stringify(value, null, 2)
    ].join("\n");
  }

  function clearGenerated() {
    if ($("generatedPanel").hidden) return;
    generated = null;
    $("generatedPanel").hidden = true;
    $("formStatus").textContent = "Paramètres modifiés : génère un nouvel identifiant et son JSON.";
  }
  function build() {
    try {
      generated = config();
      $("generatedId").textContent = generated.id;
      $("jsonOut").value = JSON.stringify(generated, null, 2);
      $("generatedPanel").hidden = false;
      $("formStatus").textContent = "";
      $("generatedWarning").hidden = true;
      $("exportStatus").textContent = "Configuration prête. Aucun dossier GitHub n'a encore été créé : transmets le JSON ou le prompt à ChatGPT.";
      try { localStorage.setItem(draftKey, JSON.stringify(generated)); } catch (_) {}
      $("generatedPanel").scrollIntoView({behavior:"smooth", block:"start"});
    } catch (error) {
      $("formStatus").textContent = error.message;
    }
  }

  async function copy(text, status) {
    try {
      await navigator.clipboard.writeText(text);
      $("exportStatus").textContent = status;
    } catch (_) {
      $("exportStatus").textContent = "Copie automatique indisponible : sélectionne le texte ci-dessous et copie-le manuellement.";
      $("jsonOut").focus(); $("jsonOut").select();
    }
  }
  function downloadJson() {
    if (!generated) return;
    const blob = new Blob([JSON.stringify(generated, null, 2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = generated.id + ".json";
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  async function readPublic(path) {
    // GitHub Pages est mis à jour par Actions; raw.githubusercontent sert de secours.
    const urls = ["https://raw.githubusercontent.com/" + repo + "/main/" + path + "?t=" + Date.now(),
      "./" + path + "?t=" + Date.now()];
    for (const url of urls) {
      try {
        const response = await fetch(url, {cache:"no-store"});
        if (response.ok) return await response.text();
      } catch (_) {}
    }
    throw new Error("Document non encore disponible : " + path);
  }
  const validId = id => /^[A-Za-z0-9][A-Za-z0-9_-]{5,63}$/.test(id);
  let loadingArchives = false;

  async function refreshArchives() {
    if (loadingArchives) return;
    loadingArchives = true;
    $("archiveStatus").textContent = "Lecture des parties publiques sur GitHub…";
    try {
      let rows = [];
      try {
        const index = JSON.parse(await readPublic("parties/index.json"));
        rows = Array.isArray(index) ? index : (index.parties || []);
      } catch (_) {
        // Le dossier public est énuméré sans clé API uniquement si l'index JSON est absent.
        const response = await fetch("https://api.github.com/repos/" + repo + "/contents/parties?ref=main");
        if (!response.ok) throw new Error("Index indisponible sur GitHub.");
        const data = await response.json();
        rows = data.filter(x => x.type === "dir").map(x => ({id:x.name, titre:x.name}));
      }
      rows = rows.filter(x => x && validId(x.id)).sort((a,b) => String(b.cree_le || b.id).localeCompare(String(a.cree_le || a.id)));
      $("archiveList").replaceChildren();
      for (const item of rows) {
        const button = make("button", undefined, "archive-item");
        button.type = "button";
        button.append(
          make("strong", item.titre || item.id),
          make("span", item.id, "archive-id"),
          make("small", [item.statut, item.phase].filter(Boolean).join(" · ") || "Ouvrir l'archive")
        );
        button.addEventListener("click", () => openArchive(item.id));
        $("archiveList").append(button);
      }
      $("archiveStatus").textContent = rows.length
        ? rows.length + " partie(s) répertoriée(s). Mise à jour par ChatGPT via GitHub."
        : "Aucune partie archivée. Le JSON créé localement n'est pas encore enregistré sur GitHub.";
      const query = new URLSearchParams(location.search).get("partie");
      let remembered = "";
      try { remembered = localStorage.getItem("lg-mj-last-party") || ""; } catch (_) {}
      const preferred = validId(query) ? query : (rows.some(x => x.id === remembered) ? remembered : rows[0]?.id);
      if (preferred && rows.some(x => x.id === preferred) && $("sessionDetail").hidden) await openArchive(preferred);
    } catch (error) {
      $("archiveStatus").textContent = error.message;
    } finally {
      loadingArchives = false;
    }
  }

  async function openArchive(id) {
    if (!validId(id)) return;
    if (window.LG_SCENES) window.LG_SCENES.stop();
    if (window.LG_MJ_PRIVATE) window.LG_MJ_PRIVATE.hide();
    $("sessionDetail").hidden = false;
    $("sessionContent").replaceChildren(make("p", "Chargement de " + id + "…"));
    try {
      const state = JSON.parse(await readPublic("parties/" + id + "/partie.json"));
      if (state.id !== id) throw new Error("L'identifiant de l'archive ne correspond pas.");
      const content = $("sessionContent"); content.replaceChildren();
      const title = state.titre || state.title || state.aventure?.titre || "Aventure à Thiercelieux";
      const meta = make("div", undefined, "archive-meta");
      meta.append(
        make("span", "ID : " + id),
        make("span", "Statut : " + (state.statut || "à confirmer")),
        make("span", "Phase : " + (state.phase || state.progression?.scene || "prologue"))
      );
      const phaseNames = {
        nuit: "Nuit · pouvoirs", jour: "Jour · débats", vote: "Vote",
        prologue: "Prologue", tour_de_table: "Débat · tour de table",
        village_s_endort: "Le village s'endort", appels_nocturnes: "Pouvoirs nocturnes",
        village_se_reveille: "Réveil du village", dialogues_et_enquete: "Débats",
        vote_ou_resolution: "Vote", suite_validee_par_mj: "Suite validée"
      };
      const header = make("div", undefined, "game-header");
      header.append(make("p", "PARTIE EN COURS · " + (phaseNames[state.phase] || state.phase || "À préparer"), "game-phase"));
      header.append(make("h3", title));
      header.append(meta);
      content.append(header);
      const command = make("div", undefined, "mj-command-strip");
      const refreshSession = make("button", "↻ Actualiser cette partie", "secondary mj-quick-reload");
      refreshSession.type = "button";
      refreshSession.addEventListener("click", () => openArchive(id));
      const changeSession = make("button", "← Choisir une autre partie", "ghost");
      changeSession.type = "button";
      changeSession.addEventListener("click", () => $("backToArchives").click());
      command.append(refreshSession, changeSession);
      content.append(command);
      try { localStorage.setItem("lg-mj-last-party", id); } catch (_) {}
      if (state.resume_public) content.append(make("p", state.resume_public, "game-synopsis"));
      const stage = make("div", undefined, "game-stage");
      content.append(stage);
      if (window.LG_MJ_CONSOLE) {
        const dashboard = make("div", undefined, "mj-console-host");
        stage.append(dashboard);
        window.LG_MJ_CONSOLE.attach(id, state, dashboard);
      }
      if (window.LG_SCENES) {
        const voiceMount = make("div", undefined, "game-audio");
        stage.append(voiceMount);
        window.LG_SCENES.attach(id, voiceMount, state);
      }
      const tableDetails = make("details", undefined, "game-details");
      tableDetails.open = false;
      const tableSummary = make("summary", "🧱 Plan de table — LEGO, voisinage et flair");
      tableDetails.append(tableSummary);
      if (window.LG_TABLE) {
        const tableMount = make("div", undefined, "game-table");
        tableDetails.append(tableMount);
        window.LG_TABLE.attach(id, state, tableMount);
      }
      stage.append(tableDetails);
      const privateSection = make("section", undefined, "game-private-section");
      privateSection.append(make("h4", "🗝️ Les cartes et pouvoirs secrets du MJ"));
      if (window.LG_MJ_PRIVATE) {
        const privateMount = make("div", undefined, "mj-private-slot");
        privateSection.append(privateMount);
        window.LG_MJ_PRIVATE.attach(id, state, privateMount);
      }
      stage.append(privateSection);
      
      if (state.dernier_evenement_public) content.append(make("p", "Dernier événement : " + state.dernier_evenement_public, "archive-public-summary"));
      if (state.aide_mj_publique) {
        const tip = make("div", undefined, "advice");
        tip.append(make("h4", "🎭 Conseil au MJ"), make("p", state.aide_mj_publique));
        content.append(tip);
      }
      const resumeButton = make("button", "📋 Copier une consigne de reprise pour ChatGPT", "secondary");
      resumeButton.type = "button";
      resumeButton.addEventListener("click", async () => {
        const message = "Reprenons la partie " + id + " du projet Loup garou. Relis sur GitHub son partie.json, secrets_mj.json si présent, journal.md et les derniers dialogues. Ne révèle pas les spoilers au joueur et attends mon choix de MJ avant de continuer.";
        try {
          await navigator.clipboard.writeText(message);
          $("archiveStatus").textContent = "Consigne de reprise copiée pour " + id + ".";
        } catch (_) {
          $("archiveStatus").textContent = "Copie automatique indisponible : ID à reprendre dans ChatGPT = " + id;
        }
      });
      content.append(resumeButton);
      const historyPanel = make("details", undefined, "game-details game-history");
      historyPanel.append(make("summary", "📜 Historique, narrations et journal GitHub"));
      content.append(historyPanel);
      const textFiles = [["narrations.md", "Narration"],["journal.md", "Journal"]];
      for (const [file, heading] of textFiles) {
        try {
          const text = await readPublic("parties/" + id + "/" + file);
          const section = make("section", undefined, "archive-document");
          section.append(make("h4", heading), make("pre", text));
          historyPanel.append(section);
        } catch (_) { /* Archives optionnelles. Les scènes audio prennent en charge dialogues.ndjson. */ }
      }
      if (history.replaceState) history.replaceState(null, "", "?partie=" + encodeURIComponent(id));
      $("sessionDetail").scrollIntoView({behavior:"smooth", block:"start"});
    } catch (error) {
      $("sessionContent").replaceChildren(make("p", "Impossible d'ouvrir la partie " + id + " : " + error.message));
    }
  }

  function init() {
    populate();
    $("tabPrepare").addEventListener("click", () => setTab("prepare"));
    $("tabArchives").addEventListener("click", () => setTab("archives"));
    $("buildButton").addEventListener("click", build);
    $("copyJson").addEventListener("click", () => generated && copy(JSON.stringify(generated, null, 2), "JSON copié. Colle-le dans la conversation du projet Loup garou."));
    $("copyPrompt").addEventListener("click", () => generated && copy(promptFor(generated), "Consigne et JSON copiés. Colle-les dans la conversation ChatGPT du projet."));
    $("downloadJson").addEventListener("click", downloadJson);
    $("archiveRefresh").addEventListener("click", async () => {
      await refreshArchives();
      const id = new URLSearchParams(location.search).get("partie");
      if (id && validId(id) && !$("sessionDetail").hidden) await openArchive(id);
    });
    $("backToArchives").addEventListener("click", () => { if (window.LG_MJ_PRIVATE) window.LG_MJ_PRIVATE.hide(); if (window.LG_SCENES) window.LG_SCENES.stop(); $("sessionDetail").hidden = true; if (history.replaceState) history.replaceState(null, "", location.pathname); });
    $("configForm").addEventListener("change", clearGenerated);
    $("configForm").addEventListener("input", clearGenerated);
    $("newConfig").addEventListener("click", () => { generated = null; $("generatedPanel").hidden = true; $("formStatus").textContent = ""; });
    try {
      const saved = JSON.parse(localStorage.getItem(draftKey) || "null");
      if (saved && validId(saved.id)) {
        generated = saved;
        $("generatedId").textContent = saved.id;
        $("jsonOut").value = JSON.stringify(saved, null, 2);
        $("generatedPanel").hidden = false;
        $("exportStatus").textContent = "Dernière configuration locale retrouvée. Vérifie-la avant de la transmettre.";
      }
    } catch (_) {}
    setTab("archives");
  }
  window.LG_LAUNCHER = {sessionId, config, promptFor, validId};
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();