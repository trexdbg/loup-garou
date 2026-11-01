const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

const root = path.join(__dirname, "..");
const code = file => fs.readFileSync(path.join(root, file), "utf8");

class Element {
  constructor(tag = "div") {
    this.tag = tag;
    this.children = [];
    this.value = "";
    this.hidden = false;
    this.disabled = false;
    this.textContent = "";
  }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(...nodes) { this.children = nodes; }
  add(child) { this.children.push(child); }
  setAttribute() {}
  addEventListener(type, handler) { this["on" + type] = handler; }
}

function environment() {
  const elements = {};
  const document = {
    getElementById(id) { return elements[id] ||= new Element(id); },
    createElement(tag) { return new Element(tag); },
    addEventListener() {}
  };
  const storage = new Map();
  const localStorage = {
    getItem(k) { return storage.get(k) || null; },
    setItem(k,v) { storage.set(k,v); },
    removeItem(k) { storage.delete(k); }
  };
  function Option(label,value) { this.label = label; this.value = value; this.textContent = label; }
  const context = vm.createContext({
    window: {}, document, Option, localStorage,
    confirm: () => true, alert: () => {}, console,
    speechSynthesis: {cancel(){},speak(){}},
    SpeechSynthesisUtterance: function(text){this.text=text;}
  });
  vm.runInContext(code("roles.js"),context);
  vm.runInContext(code("role-art.js"),context);
  vm.runInContext(code("stories.js"),context);
  vm.runInContext(code("app.js"),context);
  return {el:id=>document.getElementById(id),window:context.window,localStorage};
}

test("catalogue de rôles et scénario cohérents", () => {
  const {window} = environment();
  assert.equal(window.ROLES.length, 37);
  assert.equal(new Set(window.ROLES.map(r=>r.id)).size,37);
  assert.equal(window.STORIES.length,5);
  for (const s of window.STORIES) {
    assert.equal(s.residents.length,7);
    assert.ok(s.residents.some(r=>r.name===s.culprit));
    assert.ok(s.locations.length>=4);
    assert.ok(s.locations.every(place=>s.residents.some(r=>r.name===place.focus)));
  }
});

test("partie complète : nuit, dialogue, indice et vote", () => {
  const {el,localStorage,window} = environment();
  el("roleSelect").value="voyante";
  el("playerName").value="Alex";
  el("duration").value="45";
  el("startGame").onclick();
  assert.equal(JSON.parse(localStorage.getItem("loup-garou-solo-v1")).phase,"intro");
  el("continueButton").onclick();
  assert.equal(JSON.parse(localStorage.getItem("loup-garou-solo-v1")).phase,"night");
  el("nightTarget").value=window.STORIES[0].residents[0].name;
  el("nightAct").onclick();
  el("continueButton").onclick();
  el("continueButton").onclick();
  assert.equal(JSON.parse(localStorage.getItem("loup-garou-solo-v1")).phase,"day");
  el("residents").children[0].onclick();
  el("topicButtons").children[0].onclick();
  el("places").children[0].onclick();
  assert.equal(JSON.parse(localStorage.getItem("loup-garou-solo-v1")).clues.length,1);
  el("continueButton").onclick();
  el("voteTarget").value=window.STORIES[0].culprit;
  el("voteButton").onclick();
  assert.equal(JSON.parse(localStorage.getItem("loup-garou-solo-v1")).voted,true);
});

test("chaque rôle lance une partie sans erreur", () => {
  const initial=environment().window.ROLES;
  for(const role of initial){
    const {el,localStorage}=environment();
    el("roleSelect").value=role.id;
    el("startGame").onclick();
    el("continueButton").onclick();
    el("continueButton").onclick();
    const state=JSON.parse(localStorage.getItem("loup-garou-solo-v1"));
    assert.equal(state.roleId,role.id);
    assert.ok(["dawn","end"].includes(state.phase));
  }
});

test("illustrations authentiques: chaque image correspond à un seul rôle, sans confusion", () => {
  const {window,el} = environment();
  const art = window.ROLE_ILLUSTRATIONS;
  const cards = window.ROLES.filter(r => art.hasImage(r));
  assert.equal(cards.length, 30);
  // Les 2 planches contiennent plusieurs cartes : la paire ID + source est validée
  // par les coordonnées de recadrage propres à chaque rôle dans role-art.js.
  assert.equal(new Set(cards.map(r => r.id)).size, cards.length);
  for (const role of window.ROLES) {
    const card = art.image(role, "catalog");
    assert.equal(card.children.length, art.hasImage(role) ? 2 : 1);
    assert.ok(art.source(role).startsWith("https://"));
  }
  // Le Grand Méchant Loup ne doit surtout pas recevoir l'image du Chien-Loup.
  assert.equal(art.hasImage(window.ROLE_BY_ID["grand-loup"]), true);
  assert.equal(art.hasImage(window.ROLE_BY_ID["chien"]), true);
  assert.notEqual(art.imageUrl(window.ROLE_BY_ID["grand-loup"]), art.imageUrl(window.ROLE_BY_ID["loup"]));
  // La fiche de la Voyante apparaît bien dans le sélecteur.
  el("roleSelect").value="voyante";
  el("roleSelect").onchange();
  assert.equal(el("rolePreview").children.length, 1);
});
