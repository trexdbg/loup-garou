"use strict";
const assert = require("node:assert/strict");
const test = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");

test("Le casting possède 15 voix Phonon françaises uniques et stables", () => {
  const window = {};
  vm.runInNewContext(read("voice-pool.js"), {window});
  const list = window.LG_VOICE_POOL.entries;
  const reference = JSON.parse(read("voices/phonon-fr.json")).personnages;
  assert.equal(list.length, 15);
  assert.equal(new Set(list.map(x => x.personnage)).size, 15);
  assert.equal(new Set(list.map(x => x.voix)).size, 15);
  assert.equal(new Set(list.map(x => x.voice_id)).size, 15);
  assert.equal(list.filter(x => x.genre === "f").length, 9);
  assert.equal(list.filter(x => x.genre === "m").length, 6);
  assert.deepEqual(Array.from(list, x => ({...x})), reference);
  assert.equal(window.LG_VOICE_POOL.byName.Rose.voix, "Noémie");
  assert.equal(window.LG_VOICE_POOL.byName.Octave.voix, "Marius");
});

test("Le configurateur embarque la sélection de personnages à voix fixes", () => {
  const html = read("index.html");
  const script = read("launcher.js");
  const workflow = read(".github/workflows/pages.yml");
  assert.match(html, /id="voicePoolList"/);
  assert.match(html, /voice-pool\.js/);
  assert.match(html, /id="npcCount"[^>]*max="15"/);
  assert.match(script, /casting_pnj: casting\.map/);
  assert.match(script, /voix_id_phonon: x\.voice_id/);
  assert.match(workflow, /scripts\/generate_phonon_tts\.py/);
  assert.match(workflow, /secrets\.HF_TOKEN/);
  assert.match(workflow, /voices\/phonon-fr\.json/);
  assert.match(workflow, /voice-pool\.js/);
});

test("L'audio accepte les clips Phonon avant le moteur Gemini", () => {
  const player = read("scene-player.js");
  const gemini = read("scripts/generate_gemini_tts.py");
  assert.match(player, /clip\.provider==="phonon"/);
  assert.match(player, /\["gemini","mixed","phonon"\]/);
  assert.match(gemini, /previous_clip\.get\("provider"\) == "phonon"/);
});
