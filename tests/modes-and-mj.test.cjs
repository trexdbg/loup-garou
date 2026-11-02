"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname, "..");
const load = name => fs.readFileSync(path.join(root, name), "utf8");

test("les trois modes utilisent uniquement les identifiants des vrais rôles", () => {
  const window = {};
  vm.runInNewContext(load("roles.js"), {window});
  vm.runInNewContext(load("modes.js"), {window});
  const ids = new Set(window.ROLES.map(x => x.id));
  const api = window.LG_MODES;
  assert.deepEqual(Object.keys(api.modes), ["classique", "avance", "expert"]);
  const classique = api.allowed("classique", window.ROLES);
  const avance = api.allowed("avance", window.ROLES);
  const expert = api.allowed("expert", window.ROLES);
  assert.ok(classique.every(id => ids.has(id)));
  assert.ok(avance.every(id => ids.has(id)));
  assert.ok(expert.every(id => ids.has(id)));
  assert.ok(classique.every(id => avance.includes(id)));
  assert.ok(avance.every(id => expert.includes(id)));
  assert.equal(expert.length, window.ROLES.length);
  assert.ok(!classique.includes("blanc"));
  assert.ok(avance.includes("renard"));
  assert.ok(expert.includes("blanc"));
  assert.ok(expert.includes("mere"));
});

class Element {
  constructor(tag) {
    this.tag = tag;
    this.children = [];
    this.listeners = {};
    this.hidden = false;
    this.value = "";
    this.checked = false;
    this.textContent = "";
  }
  append(...items) { this.children.push(...items); }
  replaceChildren(...items) { this.children = items; }
  addEventListener(type, fn) { this.listeners[type] = fn; }
  setAttribute(name, value) { this[name] = value; }
  fire(type) { assert.ok(this.listeners[type]); this.listeners[type](); }
  find(predicate) {
    if (predicate(this)) return this;
    for (const c of this.children) {
      if (c && typeof c.find === "function") {
        const found = c.find(predicate);
        if (found) return found;
      }
    }
    return null;
  }
}
class Storage {
  constructor() { this.data = new Map(); }
  getItem(k) { return this.data.has(k) ? this.data.get(k) : null; }
  setItem(k,v) { this.data.set(k, String(v)); }
  removeItem(k) { this.data.delete(k); }
}
test("le carnet MJ importe et conserve les rôles sans les publier", () => {
  const window = {};
  const document = {
    createElement: tag => new Element(tag),
    createTextNode: text => String(text)
  };
  const sessionStorage = new Storage(), localStorage = new Storage();
  vm.runInNewContext(load("roles.js"), {window});
  vm.runInNewContext(load("mj-private.js"), {
    window, document, sessionStorage, localStorage,
    Option: class { constructor(text, value) { this.text=text; this.value=value; } }
  });
  const id = "LG-20261101-010203040506";
  const state = {
    participants:{joueur:{prenom:"Alex"}},
    personnages_pnj:[{prenom:"Agathe"},{prenom:"Basile"}]
  };
  const mount = new Element("section");
  window.LG_MJ_PRIVATE.attach(id, state, mount);
  const toggle = mount.find(x => x.tag === "button" && x.textContent.includes("Afficher le carnet"));
  toggle.fire("click");
  const input = mount.find(x => x.tag === "textarea");
  const importButton = mount.find(x => x.tag === "button" && x.textContent === "Importer les rôles");
  input.value = JSON.stringify({id,roles:[
    {personnage:"Alex",role:"renard"}, {personnage:"Agathe",role:"loup"}
  ]});
  importButton.fire("click");
  const stored = JSON.parse(sessionStorage.getItem("lg-mj-private-v1:" + id));
  assert.equal(stored.roles.find(x => x.personnage === "Alex").role, "renard");
  assert.equal(stored.roles.find(x => x.personnage === "Agathe").role, "loup");
  assert.equal(stored.roles.find(x => x.personnage === "Basile").role, "");
  assert.equal(localStorage.getItem("lg-mj-private-v1:" + id), null);
  toggle.fire("click");
  assert.equal(mount.find(x => x.tag === "div" && x.className === "mj-character-card"), null);
});
