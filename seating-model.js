(() => {
"use strict";
const norm = x => String(x || "").trim();
const name = x => typeof x === "string" ? x : (x?.prenom || x?.name || x?.nom || "");
const uniq = a => [...new Set(a.map(norm).filter(Boolean))];
function names(state) {
 const p = state?.participants?.joueur?.prenom || state?.joueur?.prenom || "";
 const npcs = state?.personnages_pnj || state?.pnjs || state?.personnages || [];
 return uniq([p,...(Array.isArray(npcs)?npcs.map(name):[])]);
}
function remote(state) {
 const p = state?.placement_table || {};
 return {ordre:uniq((p.ordre||p.places||[]).map(name)),retire:uniq(p.retire||[]),valide:p.valide_par_mj===true};
}
function trio(ordre,centre,retire=[]) {
 const active=ordre.filter(n=>!retire.includes(n)),i=active.indexOf(centre);
 return i<0||active.length<3?[]:[active[(i+active.length-1)%active.length],centre,active[(i+1)%active.length]];
}
function reconcile(ordre,personnes) {
 const sorted=uniq(ordre).filter(x=>personnes.includes(x));
 return sorted.concat(personnes.filter(x=>!sorted.includes(x)));
}
window.LG_SEATING_MODEL={names,remote,trio,reconcile};
})();