/* Piper libre dans le navigateur : pas d'API payante ni de serveur de synthèse.
   Le paquet @diffusionstudio/vits-web (MIT) fournit Piper via WASM et ONNX.
   Modèles français distincts, chargés et mis en cache sur l'appareil à la demande.
   La qualité dépend des ressources du téléphone et des voix libres disponibles. */
(() => {
  "use strict";
  // Liens indépendants du dépôt public. Pas de clé ni de service facturé.
  const LIBRARY_URL = "https://esm.sh/@diffusionstudio/vits-web@1.0.3?bundle";
  const VOICE_MODELS = Object.freeze({
    Narrateur: "fr_FR-siwis-medium",
    Agathe: "fr_FR-siwis-medium",
    Basile: "fr_FR-tom-medium",
    "Clémence": "fr_FR-siwis-medium",
    Gaston: "fr_FR-tom-medium",
    Iris: "fr_FR-siwis-medium",
    Malo: "fr_FR-tom-medium",
    Rosalie: "fr_FR-siwis-medium"
  });
  const RATES = Object.freeze({
    Narrateur: 0.96, Agathe: 1.05, Basile: 1.10,
    "Clémence": 1.00, Gaston: 0.94, Iris: 0.96,
    Malo: 1.05, Rosalie: 0.93
  });
  let sdkPromise = null;
  const sessionAudio = new Map();

  function modelFor(speaker) {
    return VOICE_MODELS[speaker] || VOICE_MODELS.Narrateur;
  }
  function importEngine() {
    if (!sdkPromise) {
      sdkPromise = import(LIBRARY_URL).then(module => {
        if (typeof module.predict !== "function") throw new Error("Module Piper non compatible");
        return module;
      }).catch(error => {
        sdkPromise = null;
        throw error;
      });
    }
    return sdkPromise;
  }
  async function synthesize(text, speaker, progress) {
    if (!String(text || "").trim()) throw new Error("Texte vide");
    const sdk = await importEngine();
    const voiceId = modelFor(speaker);
    const blob = await sdk.predict({
      text: String(text).trim().slice(0, 1400), voiceId
    }, event => {
      if (typeof progress === "function" && event && event.total > 0) {
        progress({ voiceId, percentage: Math.round(event.loaded * 100 / event.total) });
      }
    });
    if (!(blob instanceof Blob) || blob.size < 44) throw new Error("Réponse Piper invalide");
    return blob;
  }
  function playbackRate(speaker) {
    return RATES[speaker] || 1;
  }
  function play(blob, speaker, onEnded, onFailure) {
    // Un seul objet URL actif par lecture. Ne pas garder les WAV volumineux dans Git.
    const audio = new Audio();
    const url = URL.createObjectURL(blob);
    let disposed = false;
    function cleanup() {
      if (disposed) return;
      disposed = true;
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      URL.revokeObjectURL(url);
    }
    audio.preload = "auto";
    audio.src = url;
    audio.preservesPitch = true;
    audio.playbackRate = playbackRate(speaker);
    const handle = { stop: cleanup };
    audio.onended = () => { cleanup(); if (onEnded) onEnded(); };
    audio.onerror = () => { cleanup(); if (onFailure) onFailure(); };
    audio.play().catch(() => { cleanup(); if (onFailure) onFailure(); });
    return handle;
  }
  window.LG_PIPER = {
    synthesize, play, modelFor, playbackRate,
    // informational only: no audio generation or download before activation
    supported: () => !!(window.WebAssembly && window.Blob && window.Audio)
  };
})();
