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
    scenario:"originale",customTitle:"",environment:"village_thiercelieux",gameMode:"classique",
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
  vm.runInContext(read("roles.js"),context);
  vm.runInContext(read("modes.js"),context);
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
  assert.equal(config.premiere_execution.attendre_validation_mj_apres_prologue,false);
  assert.equal(config.publication.chemin,"parties/" + config.id);
  assert.equal(config.assistant_mj.jamais_reveler_secrets_sans_validation,true);
  assert.match(config.publication.secrets_mj,/secrets_mj\.json/);
  assert.equal(config.aventure.connaissance_loups_initiale,true);
  assert.equal(config.aventure.enigme_annexe_par_defaut,false);
  nodes.roleChoice.value="voyante";
  assert.equal(api.config().joueur.role.id,"voyante");
  nodes.roleChoice.value="chasseur";
  assert.throws(() => api.config(), /rôle choisi/);
});

test("la consigne GPT impose le jeu classique sans énigme annexe", () => {
  const {api} = launcher();
  const prompt = api.promptFor(api.config());
  assert.match(prompt,/prologue uniquement|UNIQUEMENT le prologue/i);
  assert.match(prompt,/MODE AUTONOME PAR DÉFAUT/);
  assert.match(prompt,/UN SEUL commit groupé/);
  assert.match(prompt,/des Loups-Garous se cachent dans le village/);
  assert.match(prompt,/secrets_mj\.json/);
  assert.match(prompt,/TRÈS COURT/);
  assert.match(prompt,/Attends UNE intervention d’Alex/i);
  assert.match(prompt,/n'affirme jamais que la synchronisation est faite/);
});

test("l'interface reste statique et les parties archivées sont uniques", () => {
  const html = read("index.html");
  const workflow = read(".github/workflows/pages.yml");
  const index = JSON.parse(read("parties/index.json"));
  assert.match(html,/id="buildButton"/);
  assert.match(html,/id="generatedId"/);
  assert.match(html,/id="archiveList"/);
  assert.match(html,/src="\.\/launcher\.js(?:\?[^"]*)?"/);
  assert.doesNotMatch(html,/src="\.\/app\.js"/);
  assert.match(workflow,/launcher\.css/);
  assert.match(workflow,/for filename in partie\.json narrations\.md journal\.md dialogues\.ndjson/);
  assert.ok(Array.isArray(index.parties));
  assert.equal(new Set(index.parties.map(x => x.id)).size,index.parties.length);
  assert.ok(index.parties.every(x => /^LG-\d{8}-[0-9A-F]{12}$/.test(x.id)));
  assert.match(html,/value="classique_loup_garou" selected/);
});
test("le configurateur accepte 2, 3 ou 4 humains avec des décisions indépendantes", () => {
  const {api,nodes} = launcher();
  nodes.humanCount = {value:"2"};
  nodes.humanName2 = {value:"Éloi"};
  nodes.humanAge2 = {value:"12"};
  nodes.humanRole2 = {value:"voyante"};
  let state = api.config();
  assert.equal(state.fonctionnement.joueurs_humains,2);
  assert.equal(state.joueurs_humains.length,2);
  assert.equal(state.joueur.prenom,"Alex");
  assert.equal(state.joueurs_humains[1].prenom,"Éloi");
  assert.equal(state.joueurs_humains[1].role.id,"voyante");
  assert.equal(state.premiere_execution.ne_pas_simuler_les_decisions_des_joueurs_humains,true);
  const prompt = api.promptFor(state);
  assert.match(prompt,/MODE MULTIJOUEUR RAPIDE/);
  assert.match(prompt,/TOUS les humains vivants habilités/);
  assert.match(prompt,/CHACUN des joueurs humains/);

  nodes.humanCount.value="3";
  nodes.humanName3={value:"Zoé"};
  nodes.humanAge3={value:"9"};
  nodes.humanRole3={value:"random"};
  assert.equal(api.config().joueurs_humains.length,3);
  nodes.humanCount.value="4";
  nodes.humanName4={value:"Nina"};
  nodes.humanAge4={value:"11"};
  nodes.humanRole4={value:"random"};
  assert.equal(api.config().joueurs_humains.length,4);
  nodes.humanName4.value="alex";
  assert.throws(()=>api.config(),/prénom distinct/);
  nodes.humanName4.value="Nina";
  nodes.humanRole2.value="chasseur";
  assert.throws(()=>api.config(),/rôle choisi pour/);
});

test("l'interface fournit la sélection de 1 à 4 joueurs et les rôles individuels",()=>{
  const html=read("index.html");
  assert.match(html,/id="humanCount"/);
  for(const n of [2,3,4]) {
    assert.match(html,new RegExp('id="humanPlayer'+n+'"'));
    assert.match(html,new RegExp('id="humanRole'+n+'"'));
  }
});
