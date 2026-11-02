/* Lecture progressive des dialogues publics — aucun rôle/secret côté navigateur.
   Synthèse vocale à la volée, sans créer ni stocker de MP3.
   Un geste du MJ active la voix pour respecter les restrictions audio mobiles. */
(() => {
  "use strict";
  const base = "https://raw.githubusercontent.com/trexdbg/loup-garou/main/";
  const speakers = ["Narrateur", "Agathe", "Basile", "Clémence", "Gaston", "Iris", "Malo", "Rosalie"];
  const profiles = {
    Narrateur: { pitch: 0.90, rate: 0.89 },
    Agathe: { pitch: 1.17, rate: 1.00 },
    Basile: { pitch: 1.02, rate: 1.12 },
    "Clémence": { pitch: 1.14, rate: 0.94 },
    Gaston: { pitch: 0.76, rate: 0.88 },
    Iris: { pitch: 1.08, rate: 0.93 },
    Malo: { pitch: 0.86, rate: 0.96 },
    Rosalie: { pitch: 0.99, rate: 0.90 }
  };
  const validType = new Set(["dialogue_pnj", "dialogue", "replique", "narration", "narration_publique"]);
  const speechAvailable = !!(window.speechSynthesis && window.SpeechSynthesisUtterance);
  let active = null;

  function parseLines(raw) {
    const lines = [];
    for (const line of String(raw).split(/\r?\n/)) {
      if (!line.trim()) continue;
      try {
        const entry = JSON.parse(line);
        if (entry.public !== true || !validType.has(entry.type)) continue;
        if (!Number.isSafeInteger(entry.seq) || entry.seq <= 0) continue;
        if (typeof entry.texte !== "string" || !entry.texte.trim()) continue;
        lines.push({
          seq: entry.seq,
          texte: entry.texte.trim().slice(0, 2500),
          locuteur: typeof entry.locuteur === "string" ? entry.locuteur.trim() : "Narrateur"
        });
      } catch (_) { /* ligne incomplète : attendre le prochain chargement */ }
    }
    return lines.sort((a, b) => a.seq - b.seq);
  }

  function frenchVoices() {
    if (!speechAvailable) return [];
    return window.speechSynthesis.getVoices()
      .filter(voice => /^fr([-_]|$)/i.test(voice.lang || ""))
      .sort((a, b) => (a.name + a.voiceURI).localeCompare(b.name + b.voiceURI));
  }

  function voiceFor(speaker) {
    const all = frenchVoices();
    const index = Math.max(0, speakers.indexOf(speaker));
    return all.length ? all[index % all.length] : null;
  }

  function add(parent, tag, label, className) {
    const node = document.createElement(tag);
    if (label != null) node.textContent = label;
    if (className) node.className = className;
    parent.append(node);
    return node;
  }

  function attach(id, mount) {
    if (active) active.close();
    if (!/^[A-Za-z0-9][A-Za-z0-9_-]{5,63}$/.test(id)) return;
    const synth = window.speechSynthesis;
    const key = "lg-voice-progress:" + id;
    let savedSeq = 0;
    try { savedSeq = Math.max(0, Number(sessionStorage.getItem(key)) || 0); } catch (_) {}
    const state = {
      id, closed: false, enabled: false, busy: false, loading: false,
      loaded: false, rows: [], queue: [], lastSeq: savedSeq,
      maxQueued: savedSeq, interval: null
    };
    const box = add(mount, "section", null, "live-voice");
    add(box, "h4", "🎭 Voix automatiques des habitants");
    add(box, "p", "Un seul démarrage audio, puis les nouvelles répliques publiques sont lues automatiquement au fur et à mesure de leur publication sur GitHub.", "fine");
    const actions = add(box, "div", null, "live-voice-buttons");
    const start = add(actions, "button", "▶ Activer les voix", "primary");
    start.type = "button";
    const pause = add(actions, "button", "⏸ Mettre en pause", "secondary");
    pause.type = "button";
    const replay = add(actions, "button", "↻ Réécouter les 3 dernières", "ghost");
    replay.type = "button";
    const status = add(box, "p", "Chargement des dialogues…", "live-voice-status");
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    const current = add(box, "p", "", "live-voice-current");
    function setStatus(message) { if (!state.closed) status.textContent = message; }
    function saveSeq() {
      try { sessionStorage.setItem(key, String(state.lastSeq)); } catch (_) {}
    }
    function next() {
      if (!state.enabled || state.closed || state.busy || !speechAvailable) return;
      const item = state.queue.shift();
      if (!item) {
        current.textContent = "";
        setStatus("Voix actives · en attente des prochaines répliques d'Alex et des PNJ.");
        return;
      }
      const speaker = item.locuteur || "Narrateur";
      const profile = profiles[speaker] || profiles.Narrateur;
      const utterance = new SpeechSynthesisUtterance(item.texte);
      utterance.lang = "fr-FR";
      utterance.voice = voiceFor(speaker);
      utterance.pitch = profile.pitch;
      utterance.rate = profile.rate;
      utterance.volume = 1;
      state.busy = true;
      current.textContent = speaker + " : " + item.texte;
      setStatus("🔊 " + speaker + " parle");
      utterance.onend = () => {
        if (state.closed || !state.enabled) return;
        state.busy = false;
        state.lastSeq = Math.max(state.lastSeq, item.seq);
        saveSeq();
        next();
      };
      utterance.onerror = () => {
        if (state.closed || !state.enabled) return;
        state.busy = false;
        state.enabled = false;
        clearInterval(state.interval);
        state.interval = null;
        state.queue = [];
        state.maxQueued = state.lastSeq;
        setStatus("Lecture bloquée par le navigateur. Appuyer de nouveau sur « Activer les voix ».");
        start.disabled = false;
        pause.disabled = true;
      };
      try { synth.speak(utterance); }
      catch (_) { utterance.onerror(); }
    }
    function enqueue() {
      if (!state.enabled || state.closed) return;
      for (const row of state.rows) {
        if (row.seq <= state.maxQueued) continue;
        state.queue.push(row);
        state.maxQueued = row.seq;
      }
      next();
    }
    async function refresh() {
      if (state.closed || state.loading) return;
      state.loading = true;
      const path = "parties/" + encodeURIComponent(id) + "/dialogues.ndjson";
      const urls = [base + path, "./" + path];
      let raw = null;
      for (const url of urls) {
        try {
          const response = await fetch(url + "?v=" + Date.now(), { cache: "no-store" });
          if (response.ok) { raw = await response.text(); break; }
        } catch (_) { /* Essayer la source suivante */ }
      }
      state.loading = false;
      if (state.closed) return;
      if (raw == null) {
        setStatus("GitHub momentanément indisponible, nouvelle tentative automatique.");
        return;
      }
      state.loaded = true;
      state.rows = parseLines(raw);
      if (state.enabled) enqueue();
      else if (speechAvailable) setStatus("Prêt · cliquer une fois sur « Activer les voix ».");
    }
    function stop() {
      state.enabled = false;
      state.busy = false;
      if (state.interval !== null) clearInterval(state.interval);
      state.interval = null;
      state.queue = [];
      state.maxQueued = state.lastSeq;
      if (speechAvailable) synth.cancel();
      start.disabled = !speechAvailable;
      pause.disabled = true;
      current.textContent = "";
      setStatus("Lecture en pause. L'histoire reste dans ChatGPT.");
    }
    function startVoices() {
      if (!speechAvailable || state.closed) return;
      state.enabled = true;
      start.disabled = true;
      pause.disabled = false;
      enqueue(); // Synchrone avec le clic : nécessaire pour les règles audio mobiles.
      if (!state.busy) {
        // Déverrouillage vocal uniquement si les dialogues ne sont pas encore chargés.
        if (!state.loaded) {
          const unlock = new SpeechSynthesisUtterance("Les voix du village sont prêtes.");
          unlock.lang = "fr-FR";
          unlock.voice = voiceFor("Narrateur");
          unlock.rate = 0.94;
          synth.speak(unlock);
        }
        setStatus("Voix actives · attente de nouvelles répliques.");
      }
      if (state.interval === null) state.interval = setInterval(refresh, 6000);
      refresh();
    }
    start.addEventListener("click", startVoices);
    pause.addEventListener("click", stop);
    replay.addEventListener("click", () => {
      if (!speechAvailable || !state.rows.length) return;
      const tail = state.rows.slice(-3);
      if (!tail.length) return;
      if (speechAvailable) synth.cancel();
      state.busy = false;
      state.lastSeq = Math.max(0, tail[0].seq - 1);
      state.maxQueued = state.lastSeq;
      state.queue = [];
      saveSeq();
      startVoices();
    });
    function onVisible() { if (!document.hidden && state.enabled) refresh(); }
    document.addEventListener("visibilitychange", onVisible);
    state.close = () => {
      if (state.closed) return;
      stop();
      state.closed = true;
      document.removeEventListener("visibilitychange", onVisible);
    };
    active = state;
    if (!speechAvailable) {
      start.disabled = true;
      pause.disabled = true;
      replay.disabled = true;
      setStatus("Synthèse vocale indisponible dans ce navigateur. Les dialogues restent lisibles.");
    } else pause.disabled = true;
    refresh(); // Prélire pour lancer immédiatement après le clic du MJ.
    return state;
  }
  function stop() {
    if (active) {
      active.close();
      active = null;
    }
  }
  window.LG_VOICES = { attach, stop, parseLines, voiceFor };
})();
