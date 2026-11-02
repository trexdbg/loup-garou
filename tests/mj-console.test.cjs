const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");

function moduleApi() {
  const context = vm.createContext({window:{},document:{createElement(){throw new Error("Rendering only");}}});
  vm.runInContext(read("mj-console.js"),context);
  return context.window.LG_MJ_CONSOLE;
}

test("la régie guide la Voyante sans décider pour le joueur",()=>{
  const api=moduleApi();
  const g=api.guideFor({phase:"nuit",progression:{nuit:1},nuit_en_cours:{etape:"appel_voyante"}});
  assert.match(g.title,/Voyante/);
  assert.match(g.instructions,/secrets_mj\.json/);
  assert.match(g.instructions,/Alex/);
});
test("la régie guide la Sorcière PNJ et attend le réveil validé",()=>{
  const api=moduleApi();
  const g=api.guideFor({phase:"nuit",nuit_en_cours:{etape:"appel_sorciere"}});
  assert.match(g.instructions,/Incarne Rose/);
  const morning=api.guideFor({phase:"nuit",nuit_en_cours:{etape:"sorciere_rendormie"}});
  assert.match(morning.title,/Réveiller/);
  assert.match(morning.instructions,/MJ autorise/);
});
test("le jour 1 n'ouvre pas de vote automatiquement",()=>{
  const api=moduleApi();
  const state={phase:"jour",progression:{jour:1,nuit:1},scene_courante_id:"reveil_jour_1"};
  const g=api.guideFor(state);
  assert.match(g.instructions,/ne le lance pas/);
  const prompt=api.promptFor("LG-20261102-700F964A0A7E",state);
  assert.match(prompt,/relis|Relis/);
  assert.match(prompt,/sans validation explicite/);
  assert.match(prompt,/LG-20261102-700F964A0A7E/);
});
test("une synchronisation exige de vérifier main, les scènes et le déploiement",()=>{
  const prompt=moduleApi().promptFor("LG-20261102-700F964A0A7E",{phase:"jour"},"sync");
  assert.match(prompt,/Synchronise uniquement les événements validés/);
  assert.match(prompt,/déploiement/);
  assert.match(prompt,/commit exact/);
  assert.match(prompt,/sans prétendre avoir poussé/);
});
test("la régie MJ est livrée sur GitHub Pages et ouverte par défaut",()=>{
  const html=read("index.html");
  const workflow=read(".github/workflows/pages.yml");
  const launcher=read("launcher.js");
  assert.match(html,/mj-console\.js/);
  assert.match(html,/mj-console\.css/);
  assert.match(html,/id="prepareSection" hidden/);
  assert.match(html,/id="archiveSection" aria-label="Régie/);
  assert.match(workflow,/cp index\.html .*mj-console\.css mj-console\.js/);
  assert.match(launcher,/LG_MJ_CONSOLE\.attach/);
  assert.match(launcher,/setTab\("archives"\)/);
});
