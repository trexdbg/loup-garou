(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const roles = window.ROLES || [];
  const stories = window.STORIES || [];
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
    if (!archives && window.LG_VOICES) window.LG_VOICES.stop();
    $("prepareSection").hidden = archives;
    $("archiveSection").hidden = !archives;
    $("tabPrepare").setAttribute("aria-selected", String(!archives));
    $("tabArchives").setAttribute("aria-selected", String(archives));
    if (archives) refreshArchives();
  }

  function populate() {
    const story = $("scenario");
    story.append(new Option("✨ Inventée par ChatGPT (recommandé)", "originale"));
    for (const s of stories) story.append(new Option(s.icon + " " + s.title, s.id));
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
        input.addEventListener("change", () => { updateRoleCount(); clearGenerated(); });
        label.append(input, document.createTextNode(" " + r.icon + " " + r.name));
        fieldset.append(label);
      }
      $("roleChecklist").append(fieldset);
    }
    $("roleChoice").addEventListener("change", () => { updateRolePreview(); clearGenerated(); });
    updateRolePreview();
    updateRoleCount();
  }

  function allowedRoles() {
    return Array.from(document.querySelectorAll(".role-allowed:checked")).map(x => x.value);
  }
  function updateRoleCount() {
    $("rolePoolCount").textContent = allowedRoles().length + " rôle(s) autorisé(s) sur " + roles.length;
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
        scenario_reference: story ? story.title : null,
        titre_libre: clean($v("customTitle"), 100) || null,
        duree_minutes: num("duration", 20, 120),
        pnj_nombre: num("npcCount", 3, 25),
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
        autorises: pool,
        loup_garou_nombre_cible: num("wolfCount", 1, 5),
        respecter_les_cartes_et_leurs_pouvoirs: true,
        variantes_et_compatibilite: "Arbitrer les interactions complexes avec le MJ. Ne pas inventer le pouvoir officiel d'une carte.",
        capitaine: checked("captain"),
        amoureux_cupidon: checked("couples"),
        evenements_nouvelle_lune: checked("events"),
        batiments_metiers_le_village: checked("jobs")
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
        instructions_privees: "Conserver dans la conversation ChatGPT, pas dans les fichiers publics GitHub"
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
        secrets_mj: "NE_JAMAIS_PUBLIER_DANS_CE_DEPOT_PUBLIC",
        fichiers_publics: ["parametres.json", "partie.json", "narrations.md", "journal.md", "dialogues.ndjson"],
        acces_application: "lecture_seule"
      },
      premiere_execution: {
        cree_uniquement: ["dossier_de_partie", "parametres.json", "partie.json_public", "prologue_seulement", "journal_initial", "index_json"],
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
      "1. Vérifie si parties/" + value.id + "/ existe déjà. S'il existe, demande au MJ s'il faut le reprendre, sans écraser ses données.",
      "2. Crée parties/" + value.id + "/parametres.json (COPIE EXPURGÉE de tous les rôles et secrets), partie.json (état PUBLIC de départ), narrations.md (UNIQUEMENT le prologue), journal.md et dialogues.ndjson (entrée initiale facultative). Garde le JSON complet dans notre conversation privée.",
      "3. Mets à jour parties/index.json pour référencer ce même ID, titre, date, statut, phase et dossier; n'écrase pas les autres parties.",
      "4. Prépare les identités et secrets uniquement dans notre conversation privée, sans les commiter au dépôt public. Ne publie pas le rôle secret du joueur ni ceux des PNJ. Si le rôle est fixé dans le JSON, remplace son ID par null dans la copie GitHub.",
      "5. Après écriture sur GitHub, raconte le prologue et attends l'accord du MJ. Ne génère ni nuit complète, ni vote, ni dénouement par anticipation.",
      "6. Ensuite, au fil de nos échanges, écris seulement les nouveaux événements validés dans le dossier de cette partie et mets à jour l'index.",
      "7. Reste adapté à un joueur de 10 ans si c'est l'âge indiqué. Respecte les vraies cartes et demande au MJ en cas de règles ambiguës.",
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
    const urls = ["./" + path + "?t=" + Date.now(),
      "https://raw.githubusercontent.com/" + repo + "/main/" + path + "?t=" + Date.now()];
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
      if (query && validId(query) && $("sessionDetail").hidden) await openArchive(query);
    } catch (error) {
      $("archiveStatus").textContent = error.message;
    } finally {
      loadingArchives = false;
    }
  }

  async function openArchive(id) {
    if (!validId(id)) return;
    if (window.LG_VOICES) window.LG_VOICES.stop();
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
      content.append(make("h3", title), meta);
      if (window.LG_VOICES) {
        const voiceMount = make("div");
        content.append(voiceMount);
        window.LG_VOICES.attach(id, voiceMount);
      }
      if (state.resume_public) content.append(make("p", state.resume_public, "archive-public-summary"));
      if (state.dernier_evenement_public) content.append(make("p", "Dernier événement : " + state.dernier_evenement_public, "archive-public-summary"));
      if (state.aide_mj_publique) {
        const tip = make("div", undefined, "advice");
        tip.append(make("h4", "🎭 Conseil au MJ"), make("p", state.aide_mj_publique));
        content.append(tip);
      }
      const resumeButton = make("button", "📋 Copier une consigne de reprise pour ChatGPT", "secondary");
      resumeButton.type = "button";
      resumeButton.addEventListener("click", async () => {
        const message = "Reprenons la partie " + id + " du projet Loup garou. Relis sur GitHub son partie.json, journal.md et les derniers dialogues, préserve tous les secrets de notre conversation, puis attends mon choix de MJ avant de continuer.";
        try {
          await navigator.clipboard.writeText(message);
          $("archiveStatus").textContent = "Consigne de reprise copiée pour " + id + ".";
        } catch (_) {
          $("archiveStatus").textContent = "Copie automatique indisponible : ID à reprendre dans ChatGPT = " + id;
        }
      });
      content.append(resumeButton);
      const textFiles = [["narrations.md", "📖 Narrations"],["journal.md", "📜 Journal"],["dialogues.ndjson", "💬 Dialogues archivés"]];
      for (const [file, heading] of textFiles) {
        try {
          const text = await readPublic("parties/" + id + "/" + file);
          const section = make("section", undefined, "archive-document");
          section.append(make("h4", heading), make("pre", text));
          content.append(section);
        } catch (_) { /* Les parties initiales ne contiennent pas nécessairement tous les fichiers. */ }
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
    $("archiveRefresh").addEventListener("click", refreshArchives);
    $("backToArchives").addEventListener("click", () => { if (window.LG_VOICES) window.LG_VOICES.stop(); $("sessionDetail").hidden = true; if (history.replaceState) history.replaceState(null, "", location.pathname); });
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
    if (new URLSearchParams(location.search).has("partie")) setTab("archives");
  }
  window.LG_LAUNCHER = {sessionId, config, promptFor, validId};
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();