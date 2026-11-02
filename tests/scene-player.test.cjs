"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
function load(voiceCount = 8) {
  const code = fs.readFileSync(path.join(__dirname, "..", "scene-player.js"), "utf8");
  const voices = Array.from({length: voiceCount}, (_,i) =>
    ({name: "Voix française " + i, lang: "fr-FR", voiceURI: "fr" + i}));
  const window = {speechSynthesis: {getVoices: () => voices}, SpeechSynthesisUtterance: function(){}};
  vm.runInNewContext(code, {window, document: {}});
  return window.LG_SCENES;
}
test("seules les répliques publiques et valides entrent dans le lecteur", () => {
 const player = load();
 const lines = [
  {seq:1,scene_id:"tour_de_table_01",type:"dialogue_pnj",locuteur:"Rose",texte:"Bonjour !",public:true},
  {seq:2,scene_id:"tour_de_table_01",type:"dialogue_pnj",locuteur:"Marin",texte:"Je suis Loup",public:false},
  {seq:3,type:"note_mj",texte:"Ne pas jouer",public:true},
  {seq:4,scene_id:"tour_de_table_02",type:"dialogue_joueur",locuteur:"Alex",texte:"Rose ?",public:true}
 ].map(JSON.stringify).join("\n");
 assert.deepEqual(Array.from(player.parseLines(lines),x=>x.seq),[1,4]);
});
test("les lots de dialogues donnent des scènes distinctes et ordonnées", () => {
 const player=load();
 const rows=player.parseLines([
  '{"seq":8,"type":"dialogue_pnj","texte":"2","public":true,"scene_id":"tour_de_table_02"}',
  '{"seq":4,"type":"narration","texte":"1","public":true,"scene_id":"tour_de_table_01"}',
  '{"seq":9,"type":"dialogue_pnj","texte":"3","public":true,"scene_id":"tour_de_table_02"}'
 ].join("\n"));
 const groups=player.groupScenes(rows);
 assert.deepEqual(Array.from(groups,x=>x.id),["tour_de_table_01","tour_de_table_02"]);
 assert.deepEqual(Array.from(groups[1].rows,x=>x.seq),[8,9]);
});
test("sept voix françaises distinctes lorsqu'elles existent sur l'appareil",()=>{
 const player=load(8);
 const cast=["Rose","Hugo","Salomé","Marin","Inès","Baptiste","Jade"];
 assert.equal(new Set(cast.map(x=>player.voiceFor(x).voiceURI)).size,7);
 assert.equal(player.voiceFor("Rose").voiceURI,player.voiceFor("Rose").voiceURI);
});
test("un nombre réduit de voix est géré sans prétendre créer de nouveaux timbres",()=>{
 const player=load(2);
 const cast=["Rose","Hugo","Salomé","Marin","Inès","Baptiste","Jade"];
 assert.equal(new Set(cast.map(x=>player.voiceFor(x).voiceURI)).size,2);
});
