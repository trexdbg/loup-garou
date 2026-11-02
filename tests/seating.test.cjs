"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const vm=require("node:vm");
const fs=require("node:fs");
const path=require("node:path");
const source=file=>fs.readFileSync(path.join(__dirname,"..",file),"utf8");
function model(){
 const window={};
 vm.runInNewContext(source("seating-model.js"),{window});
 return window.LG_SEATING_MODEL;
}
const sample={
 participants:{joueur:{prenom:"Alex"}},
 personnages_pnj:["Agathe","Basile","Clémence","Gaston","Iris","Malo","Rosalie"].map(prenom=>({prenom}))
};
test("8 personnages, dont le joueur, une seule fois",()=>{
 const m=model(),people=m.names(sample);
 assert.equal(people.length,8);
 assert.equal(people[0],"Alex");
 assert.equal(new Set(people).size,people.length);
});
test("le cercle traverse bien la dernière et la première place",()=>{
 const m=model(),people=m.names(sample);
 assert.deepEqual(Array.from(m.trio(people,"Alex")),["Rosalie","Alex","Agathe"]);
 assert.deepEqual(Array.from(m.trio(people,"Rosalie")),["Malo","Rosalie","Alex"]);
});
test("les LEGO retirés ne sont plus des voisins actifs",()=>{
 const m=model(),people=m.names(sample);
 assert.deepEqual(Array.from(m.trio(people,"Alex",["Rosalie","Agathe"])),["Malo","Alex","Basile"]);
 assert.deepEqual(Array.from(m.trio(people,"Alex",people.slice(2))),[]);
});
test("un placement inconnu reste non validé",()=>{
 const m=model(),r=m.remote(sample);
 assert.equal(r.valide,false);
 assert.equal(r.ordre.length,0);
 const provisional=m.reconcile(r.ordre,m.names(sample));
 assert.equal(provisional.length,8);
});
test("un plan validé est chargé depuis partie.json et les noms absents sont ajoutés",()=>{
 const m=model(),withSeats={...sample,placement_table:{ordre:["Malo","Alex","Agathe"],retire:["Agathe"],valide_par_mj:true}};
 const r=m.remote(withSeats);
 assert.equal(r.valide,true);
 assert.deepEqual(Array.from(m.reconcile(r.ordre,m.names(sample))).slice(0,3),["Malo","Alex","Agathe"]);
 assert.deepEqual(Array.from(m.trio(m.reconcile(r.ordre,m.names(sample)),"Malo",r.retire)),["Rosalie","Malo","Alex"]);
});
