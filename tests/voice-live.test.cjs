"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function setup() {
  const source = fs.readFileSync(path.join(__dirname, "..", "voice-live.js"), "utf8");
  const french = Array.from({ length: 8 }, (_, i) => ({
    name: "français" + i, voiceURI: "fr" + i, lang: "fr-FR"
  }));
  const window = {
    speechSynthesis: { getVoices: () => french },
    SpeechSynthesisUtterance: function SpeechSynthesisUtterance(text) { this.text = text; }
  };
  vm.runInNewContext(source, { window, document: {}, fetch: async () => ({ok: false}) });
  return window.LG_VOICES;
}

test("ignore les données privées, système et non vocales", () => {
  const voice = setup();
  const data = [
    { seq: 0, type: "systeme", public: true, texte: "Initialisation" },
    { seq: 1, type: "dialogue_pnj", public: true, locuteur: "Agathe", texte: "Bonjour Alex !" },
    { seq: 2, type: "dialogue_pnj", public: false, locuteur: "Basile", texte: "Secret !" },
    { seq: 3, type: "narration", public: true, texte: "Une cloche sonne." },
    { seq: 4, type: "note_mj", public: true, texte: "Ne pas prononcer" }
  ].map(row => JSON.stringify(row)).join("\n");
  const rows = voice.parseLines(data);
  assert.deepEqual(Array.from(rows, row => row.seq), [1, 3]);
  assert.equal(rows[0].locuteur, "Agathe");
});

test("les identités de voix sont stables pour les PNJ connus et nouveaux", () => {
  const voice = setup();
  assert.equal(voice.voiceFor("Agathe").name, voice.voiceFor("Agathe").name);
  assert.notEqual(voice.voiceFor("Agathe").name, voice.voiceFor("Gaston").name);
  assert.equal(voice.voiceFor("Autre PNJ").name, voice.voiceFor("Autre PNJ").name);
});

test("ignore les lignes partielles mal formées sans perdre les répliques valides", () => {
  const voice = setup();
  const lines = '{"seq":1,"type":"dialogue_pnj","public":true,"texte":"Coucou !"}\n{"seq":';
  assert.equal(voice.parseLines(lines).length, 1);
});
