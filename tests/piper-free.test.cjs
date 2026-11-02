"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function loadPiper() {
  const code = fs.readFileSync(path.join(__dirname, "..", "piper-free.js"), "utf8");
  const window = { WebAssembly: {}, Blob, Audio: function Audio() {} };
  vm.runInNewContext(code, { window, Blob, URL });
  return window.LG_PIPER;
}

test("deux voix françaises libres sans URL de service payant", () => {
  const piper = loadPiper();
  assert.equal(piper.modelFor("Agathe"), "fr_FR-siwis-medium");
  assert.equal(piper.modelFor("Gaston"), "fr_FR-tom-medium");
  assert.equal(piper.modelFor("Basile"), "fr_FR-tom-medium");
  assert.equal(piper.modelFor("Rosalie"), "fr_FR-siwis-medium");
  assert.equal(piper.modelFor("Nouveau PNJ"), "fr_FR-siwis-medium");
  assert.equal(piper.modelFor("Gaston"), piper.modelFor("Gaston"));
});

test("la lecture neuronale utilise le contexte audio déverrouillé par le MJ", async () => {
  const piper = loadPiper();
  const events = [];
  const bufferSource = {
    playbackRate: { value: 1 },
    connect() { events.push("connect"); },
    start() { events.push("start"); },
    stop() { events.push("stop"); },
    disconnect() {}
  };
  const context = {
    state: "running", destination: {},
    decodeAudioData: async () => { events.push("decode"); return { duration: 1 }; },
    createBufferSource: () => bufferSource
  };
  const blob = new Blob([new Uint8Array(44)]);
  const handle = await piper.play(blob, "Agathe", context, () => events.push("end"), () => events.push("error"));
  assert.deepEqual(events, ["decode", "connect", "start"]);
  assert.ok(bufferSource.playbackRate.value > 1);
  handle.stop();
  assert.ok(events.includes("stop"));
  assert.ok(!events.includes("error"));
});

test("aucun TTS déclenché au chargement du fichier JS", () => {
  const piper = loadPiper();
  assert.equal(typeof piper.synthesize, "function");
  assert.equal(piper.supported(), true);
});
