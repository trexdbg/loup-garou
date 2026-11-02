/* Lecture progressive des dialogues publics — aucun rôle/secret côté navigateur.
   Synthèse vocale locale ou MP3 éphémères via serveur sécurisé, jamais dans Git.
   Un geste du MJ active la voix pour respecter les restrictions audio mobiles. */
(() => {
  "use strict";
  const base = "https://raw.githubusercontent.com/trexdbg/loup-garou/main/";
  const speakers = ["Narrateur", "Agathe", "Basile", "Clémence", "Gaston", "Iris", "Malo", "Rosalie"];
  const profiles = {
    Narrateur: { pitch: 0.97, rate: 0.94 },
    Agathe: { pitch: 1.07, rate: 1.01 },
    Basile: { pitch: 1.00, rate: 1.07 },
    "Clémence": { pitch: 1.04, rate: 0.98 },
    Gaston: { pitch: 0.93, rate: 0.94 },
    Iris: { pitch: 1.03, rate: 0.99 },
    Malo: { pitch: 0.97, rate: 0.98 },
    Rosalie: { pitch: 1.00, rate: 0.95 }
  };
  const validType = new Set(["dialogue_pnj", "dialogue", "replique", "narration", "narration_publique"]);
  const speechAvailable = !!(window.speechSynthesis && window.SpeechSynthesisUtterance);
  let active = null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  let endpoint = "";
  let piperEnabled = true;
  fetch("./tts-config.json?v=" + Date.now(), { cache: "no-store" })
    .then(res => res.ok ? res.json() : null)
    .then(config => {
      if (config && config.provider === "piper_local") {
        piperEnabled = config.enabled === true;
        if (active && active.qualityLabel) active.qualityLabel.textContent = "✨ Voix neuronales françaises gratuites (Piper) : premier chargement volumineux, génération sur cet appareil.";
      } else if (config && config.enabled === true && /^https:\/\/[a-z0-9.-]+$/i.test(config.worker_url || "")) {
        endpoint = config.worker_url.replace(/\/$/, "");
        if (active && active.qualityLabel) active.qualityLabel.textContent = "✨ Mode voix neuronales activé (ElevenLabs) : une vraie voix française par personnage, si le serveur est configuré.";
      }
    }).catch(() => {});

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
      .sort((a, b) => {
        function rank(v) {
          const name = (v.name || "").toLowerCase();
          let score = 0;
          if (/natural|premium|enhanced|neural|online|google|cloud/.test(name)) score += 12;
          if (/french|français|france/.test(name)) score += 2;
          if (v.localService === false) score += 4;
          return score;
        }
        return rank(b) - rank(a) || (a.name + a.voiceURI).localeCompare(b.name + b.voiceURI);
      });
  }

  function voiceFor(speaker) {
    const all = frenchVoices();
    const known = speakers.indexOf(speaker);
    const hash = [...speaker].reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 7);
    const index = known >= 0 ? known : hash;
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
      maxQueued: savedSeq, interval: null,
      audioCtx: null, source: null, localHandle: null, abort: null, generation: 0, piperUnavailable: false
    };
    const box = add(mount, "section", null, "live-voice");
    state.qualityLabel = add(box, "p", "✨ Voix neuronales gratuites Piper : deux timbres français de base, adaptés aux personnages. Le premier lancement peut télécharger environ 130 Mo de modèles. Sans abonnement ni paiement. Une voix locale classique prend le relais en cas d’échec.", "fine");
    add(box, "h4", "🎭 Voix automatiques des habitants");
    add(box, "p", "Les voix sont générées par synthèse vocale, et non enregistrées par des comédiens.", "fine");
    add(box, "p", "Un seul démarrage audio, puis les nouvelles répliques publiques sont lues automatiquement au fur et à mesure de leur publication sur GitHub.", "fine");
    const actions = add(box, "div", null, "live-voice-buttons");
    const start = add(actions, "button", "▶ Démarrer les voix gratuites", "primary");
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
      if (!state.enabled || state.closed || state.busy) return;
      const item = state.queue.shift();
      if (!item) {
        current.textContent = "";
        setStatus("Voix actives · en attente des prochaines répliques d'Alex et des PNJ.");
        return;
      }
      const speaker = item.locuteur || "Narrateur";
      const profile = profiles[speaker] || { pitch: 0.85 + (speaker.length % 6) * 0.07, rate: 0.89 + (speaker.length % 5) * 0.035 };
      const generation = ++state.generation;
      state.busy = true;
      current.textContent = speaker + " : " + item.texte;
      function finish() {
        if (state.closed || !state.enabled || generation !== state.generation) return;
        state.busy = false;
        state.source = null;
        state.abort = null;
        state.localHandle = null;
        state.lastSeq = Math.max(state.lastSeq, item.seq);
        saveSeq();
        next();
      }
      function speakLocal() {
        if (!state.enabled || state.closed || generation !== state.generation) return;
        if (!speechAvailable) {
          setStatus("Voix indisponibles : dialogue affiché en texte.");
          finish();
          return;
        }
        const utterance = new SpeechSynthesisUtterance(item.texte);
        utterance.lang = "fr-FR";
        utterance.voice = voiceFor(speaker);
        utterance.pitch = profile.pitch;
        utterance.rate = profile.rate;
        utterance.volume = 1;
        setStatus("🔊 " + speaker + " · voix de secours du navigateur");
        utterance.onend = finish;
        utterance.onerror = () => {
          if (state.closed || !state.enabled || generation !== state.generation) return;
          state.busy = false;
          state.enabled = false;
          if (state.interval !== null) clearInterval(state.interval);
          state.interval = null;
          state.queue = [];
          state.maxQueued = state.lastSeq;
          setStatus("Lecture bloquée par le navigateur. Appuyer sur « Activer les voix ».");
          start.disabled = false;
          pause.disabled = true;
        };
        try { synth.speak(utterance); }
        catch (_) { utterance.onerror(); }
      }
      if (piperEnabled && !state.piperUnavailable && state.audioCtx && window.LG_PIPER && window.LG_PIPER.supported()) {
        setStatus("✨ " + speaker + " · préparation de la voix gratuite (premier chargement parfois long)");
        let finished = false;
        let timer = null;
        function failure() {
          if (finished) return;
          finished = true;
          if (timer !== null) clearTimeout(timer);
          if (state.closed || !state.enabled || generation !== state.generation) return;
          state.piperUnavailable = true;
          setStatus("Piper indisponible sur cet appareil · retour automatique aux voix classiques");
          speakLocal();
        }
        // Un délai maximum évite de bloquer une partie sur mobile.
        timer = setTimeout(failure, 120000);
        window.LG_PIPER.synthesize(item.texte, speaker, progress => {
          if (state.enabled && generation === state.generation) {
            setStatus("✨ " + speaker + " · téléchargement voix : " + progress.percentage + " %");
          }
        }).then(blob => {
          if (finished || state.closed || !state.enabled || generation !== state.generation) return;
          return window.LG_PIPER.play(blob, speaker, state.audioCtx, () => {
            finished = true;
            if (timer !== null) clearTimeout(timer);
            finish();
          }, failure).then(handle => {
            if (finished || state.closed || !state.enabled || generation !== state.generation) handle?.stop();
            else {
              state.localHandle = handle;
              setStatus("✨ " + speaker + " · voix neuronale gratuite");
            }
          });
        }).catch(failure);
        return;
      }
      if (!endpoint || !state.audioCtx) {
        speakLocal();
        return;
      }
      setStatus("✨ " + speaker + " · génération de voix naturelle");
      state.abort = new AbortController();
      const url = endpoint + "/speak?id=" + encodeURIComponent(id) + "&seq=" + item.seq;
      fetch(url, { signal: state.abort.signal, cache: "no-store" })
        .then(async response => {
          if (!response.ok || !(response.headers.get("Content-Type") || "").includes("audio/")) {
            throw new Error("service vocal indisponible");
          }
          const bytes = await response.arrayBuffer();
          if (!bytes.byteLength || bytes.byteLength > 6000000) throw new Error("audio invalide");
          return state.audioCtx.decodeAudioData(bytes);
        })
        .then(buffer => {
          if (!state.enabled || state.closed || generation !== state.generation) return;
          const source = state.audioCtx.createBufferSource();
          state.source = source;
          source.buffer = buffer;
          source.connect(state.audioCtx.destination);
          source.onended = finish;
          setStatus("✨ " + speaker + " · voix naturelle");
          source.start();
        })
        .catch(() => {
          if (!state.enabled || state.closed || generation !== state.generation) return;
          speakLocal();
        });
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
      state.generation++;
      if (state.abort) state.abort.abort();
      state.abort = null;
      if (state.localHandle) { try { state.localHandle.stop(); } catch (_) {} }
      state.localHandle = null;
      if (state.source) { try { state.source.onended = null; state.source.stop(); } catch (_) {} }
      state.source = null;
      if (speechAvailable) synth.cancel();
      start.disabled = !speechAvailable && !AudioCtx;
      pause.disabled = true;
      current.textContent = "";
      setStatus("Lecture en pause. L'histoire reste dans ChatGPT.");
    }
    function startVoices() {
      if ((!speechAvailable && !AudioCtx) || state.closed) return;
      if (AudioCtx && !state.audioCtx) {
        try { state.audioCtx = new AudioCtx(); } catch (_) {}
      }
      if (state.audioCtx && state.audioCtx.state === "suspended") state.audioCtx.resume().catch(() => {});
      state.enabled = true;
      start.disabled = true;
      pause.disabled = false;
      enqueue(); // Synchrone avec le clic : nécessaire pour les règles audio mobiles.
      if (!state.busy) {
        // Le message confirme le son immédiatement, dans le geste utilisateur initial.
        if (speechAvailable && !piperEnabled) {
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
      if ((!speechAvailable && !AudioCtx) || !state.rows.length) return;
      const tail = state.rows.slice(-3);
      if (!tail.length) return;
      stop();
      state.lastSeq = Math.max(0, tail[0].seq - 1);
      state.maxQueued = state.lastSeq;
      saveSeq();
      startVoices();
    });
    function onVisible() { if (!document.hidden && state.enabled) refresh(); }
    document.addEventListener("visibilitychange", onVisible);
    state.close = () => {
      if (state.closed) return;
      stop();
      if (state.audioCtx) { state.audioCtx.close().catch(() => {}); state.audioCtx = null; }
      state.closed = true;
      document.removeEventListener("visibilitychange", onVisible);
    };
    active = state;
    if (!speechAvailable && !AudioCtx) {
      start.disabled = true;
      pause.disabled = true;
      replay.disabled = true;
      setStatus("Audio indisponible dans ce navigateur. Les dialogues restent lisibles.");
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
