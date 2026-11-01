const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const root = path.join(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");

function launcher() {
  const nodes = Object.create(null);
  const values = {
    roleChoice:"random",heroName:"Alex",heroAge:"10",duration:"45",npcCount:"7",
    scenario:"originale",customTitle:"",environment:"village_thiercelieux",
    storyStyle:"mystere_enquete",themeFree:"",intensity:"4",humor:"3",difficulty:"3",fear:"2",
    wolfCount:"2",nightDuration:"3",nightOrder:"officiel_adapte"
  };
  const checks = {
    captain:true,couples:true,events:false,jobs:false,askValidation:true,
    allowImprovisation:true,mjGuidance:true,hints:true,pacingHelp:true,
    cardsOn:true,soundsOn:true,voiceOn:true
  };
  const context = vm.createContext({
    window:{crypto:{getRandomValues(bytes) { for(let i=0;i<bytes.length;i++) bytes[i]=i+1; }}},
    document:{
      readyState:"loading",
      addEventListener(){},
      getElementById(id) {
        return nodes[id] ||= {value:values[id] ?? "",checked:checks[id] ?? false};
      },
      querySelectorAll(){ return [{value:"loup"},{value:"voyante"},{value:"sorciere"}]; }
    },
    console
  });
  vm.runInContext(read("launcher.js"),context);
  return {api:context.window.LG_LAUNCHER,nodes};
}

test("le lanceur genere un identifiant solide, visible et valide", () => {
  const {api} = launcher();
  assert.match(api.sessionId(), /^LG-\d{8}-[0-9A-F]{12}$/);
  assert.equal(api.validId("LG-20261101-0123456789AB"),true);
  assert.equal(api.validId("../../secrets-mj.md"),false);
});

test("le JSON prepare l'histoire mais ne la joue pas localement", () => {
  const {api,nodes} = launcher();
  const config = api.config();
  assert.equal(config.fonctionnement.jeu,"ChatGPT dans le projet Loup garou");
  assert.equal(config.joueur.age,10);
  assert.equal(config.premiere_execution.ne_pas_generer_les_scenes_suivantes,true);
  assert.equal(config.premiere_execution.attendre_validation_mj_apres_prologue,true);
  assert.equal(config.publication.chemin,"parties/" + config.id);
  assert.equal(config.assistant_mj.jamais_reveler_secrets_sans_validation,true);
  assert.equal(config.publication.secrets_mj,"NE_JAMAIS_PUBLIER_DANS_CE_DEPOT_PUBLIC");
  nodes.roleChoice.value="voyante";
  assert.equal(api.config().joueur.role.id,"voyante");
  nodes.roleChoice.value="chasseur";
  assert.throws(() => api.config(), /rôle choisi/);
});

test("la consigne GPT impose une creation limitee au prologue et une copie publique expurgee", () => {
  const {api} = launcher();
  const prompt = api.promptFor(api.config());
  assert.match(prompt,/UNIQUEMENT le prologue/);
  assert.match(prompt,/COPIE EXPURGÉE/);
  assert.match(prompt,/attends l'accord du MJ/);
  assert.match(prompt,/n'affirme jamais que la synchronisation est faite/);
});

test("l'interface est statique, la publication est publique sans fichiers de secrets", () => {
  const html = read("index.html");
  const workflow = read(".github/workflows/pages.yml");
  const index = JSON.parse(read("parties/index.json"));
  assert.match(html,/id="buildButton"/);
  assert.match(html,/id="generatedId"/);
  assert.match(html,/id="archiveList"/);
  assert.match(html,/src="\.\/launcher\.js"/);
  assert.doesNotMatch(html,/src="\.\/app\.js"/);
  assert.match(workflow,/launcher\.css/);
  assert.match(workflow,/for filename in partie\.json narrations\.md journal\.md dialogues\.ndjson/);
  assert.ok(index.parties.some(x => x.id==="2026-11-01-001"));
});