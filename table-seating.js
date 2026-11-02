(() => {
"use strict";
const M=window.LG_SEATING_MODEL, sessions=new Map();
const key=id=>"lg-placement-v1:"+id;
const elt=(tag,txt,cls)=>{const e=document.createElement(tag);if(txt!==undefined)e.textContent=txt;if(cls)e.className=cls;return e;};
const saved=id=>{try{return JSON.parse(localStorage.getItem(key(id))||"null");}catch{return null;}};
const orderOf=id=>sessions.get(id)?.ordre.slice()||[];
const trioOf=id=>{const s=sessions.get(id);return s?M.trio(s.ordre,s.centre,s.retire):[];};
function attach(id,state,mount){
 const names=M.names(state),r=M.remote(state),local=saved(id),base=local?.id===id?local:r;
 const exact=(base.ordre||[]).length===names.length && names.every(person=>(base.ordre||[]).includes(person));
 const s={ordre:M.reconcile(base.ordre||[],names),retire:(base.retire||[]).filter(x=>names.includes(x)),valide:base.valide===true && exact,centre:null};
 sessions.set(id,s);
 mount.replaceChildren();
 const title=elt("h4","🧱 Plan de table des LEGO"),info=elt("p","Place n° 1 en haut (12 h), puis dans le sens horaire. Une figurine par personnage, avec sa carte de rôle cachée dessous.","fine");
 const status=elt("p","","seating-status");status.setAttribute("role","status");
 const scroller=elt("div",undefined,"seating-scroll"),ring=elt("div",undefined,"seating-ring");scroller.append(ring);
 const rows=elt("div",undefined,"seating-rows"),fox=elt("p","","seating-fox");
 const actions=elt("div",undefined,"seating-actions"),validate=elt("button","✓ Valider le placement","secondary"),copy=elt("button","📋 Copier le plan pour ChatGPT","secondary");
 validate.type=copy.type="button";actions.append(validate,copy);
 const foot=elt("p","Clique sur une figurine pour voir les 3 voisins que le Renard pourrait flairer. Retire une figurine si elle quitte la table : le voisinage saute alors cette place. Le MJ décide quand employer les pouvoirs.","fine");
 const fallback=elt("textarea");fallback.hidden=true;fallback.readOnly=true;fallback.setAttribute("aria-label","Plan à copier dans ChatGPT");
 mount.append(title,info,status,scroller,rows,fox,actions,foot,fallback);
 const payload=()=>({id,placement_table:{type:"circulaire",sens:"horaire",depart:"12h",ordre:s.ordre.slice(),retire:s.retire.slice(),valide_par_mj:s.valide}});
 const matchesRemote=()=>r.valide && JSON.stringify(r.ordre)===JSON.stringify(s.ordre) && JSON.stringify(r.retire.slice().sort())===JSON.stringify(s.retire.slice().sort());
 function persist(){try{localStorage.setItem(key(id),JSON.stringify({id,ordre:s.ordre,retire:s.retire,valide:s.valide}));}catch{}}
 function update(){
  ring.replaceChildren();rows.replaceChildren();
  const active=s.ordre.filter(x=>!s.retire.includes(x));
  if(s.centre && !active.includes(s.centre))s.centre=null;
  const selected=M.trio(s.ordre,s.centre,s.retire);
  const radius=Math.max(140,s.ordre.length*16),size=2*radius+126;
  ring.style.width=size+"px";ring.style.height=size+"px";
  ring.append(elt("span","TABLE","seating-table-label"));
  s.ordre.forEach((person,i)=>{
    const retired=s.retire.includes(person),theta=-Math.PI/2+2*Math.PI*i/s.ordre.length;
    const seat=elt("button",undefined,"seating-seat"+(retired?" is-out":"")+(selected.includes(person)?" is-trio":"")+(s.centre===person?" is-center":""));
    seat.type="button";seat.style.left=(size/2+radius*Math.cos(theta))+"px";seat.style.top=(size/2+radius*Math.sin(theta))+"px";
    seat.setAttribute("aria-label","Place "+(i+1)+", "+person+(retired?", retiré":", choisir pour le flair"));
    seat.append(elt("span","🧍","lego-icon"),elt("span",(i+1)+". "+person,"lego-name"));
    seat.addEventListener("click",()=>{if(!retired){s.centre=person;update();}});ring.append(seat);
    const item=elt("div",undefined,"seating-row"),label=elt("strong",(i+1)+". "+person),controls=elt("div",undefined,"seating-row-buttons");
    for(const [symbol,delta] of [["←",-1],["→",1]]){
      const b=elt("button",symbol,"ghost small");b.type="button";b.disabled=s.ordre.length<2;
      b.setAttribute("aria-label","Déplacer "+person+(delta<0?" vers la gauche":" vers la droite"));
      b.addEventListener("click",()=>{const j=(i+delta+s.ordre.length)%s.ordre.length;[s.ordre[i],s.ordre[j]]=[s.ordre[j],s.ordre[i]];s.valide=false;persist();update();});controls.append(b);
    }
    const out=elt("button",retired?"↩ Remettre":"✕ Retirer","ghost small");out.type="button";
    out.setAttribute("aria-label",retired?"Remettre la figurine de "+person:"Retirer la figurine de "+person);
    out.addEventListener("click",()=>{s.retire=retired?s.retire.filter(x=>x!==person):s.retire.concat(person);s.valide=false;persist();update();});
    controls.append(out);item.append(label,controls);rows.append(item);
  });
  fox.textContent=selected.length?"Flair sur 3 voisins : "+selected.join(" · "):active.length<3?"Il faut au moins 3 figurines présentes pour utiliser le flair.":"Clique sur une figurine centrale pour sélectionner le trio du Renard.";
  validate.disabled=names.length<3;
  status.textContent=names.length<3?"Il manque des personnages : prépare-les avec ChatGPT.":matchesRemote()?"Plan validé et archivé sur GitHub.":s.valide?"Plan validé ici. Copie-le vers ChatGPT pour l'archiver.":"Ordre provisoire : ajuste les LEGO et valide le placement réel.";
 }
 validate.addEventListener("click",()=>{s.valide=true;persist();update();});
 copy.addEventListener("click",async()=>{
  if(!s.valide){status.textContent="Valide le placement des figurines avant de copier le plan.";return;}
  const message=["LOUP GAROU — PLACEMENT DES LEGO POUR LA PARTIE "+id,
   "Voici la disposition circulaire validée par le MJ. Écris uniquement le champ PUBLIC placement_table dans parties/"+id+"/partie.json du dépôt trexdbg/loup-garou.",
   "Place 1 à 12 h, ordre horaire. Utilise cet ordre pour tous les pouvoirs de voisinage, dont Renard et Montreur d'Ours. N'invente aucun autre placement.",
   "Les personnages retirés ne participent plus aux groupes de voisins. Conserve l'ordre des autres.",
   "Ne publier aucun rôle ni carte secrète. Ne pas changer le déroulement de la partie.",
   JSON.stringify(payload(),null,2),"Confirme l'écriture et attends la prochaine instruction du MJ."].join("\n\n");
  try{await navigator.clipboard.writeText(message);fallback.hidden=true;status.textContent="Plan copié. Colle-le dans la conversation ChatGPT pour enregistrer ce placement sur GitHub.";}
  catch{fallback.value=message;fallback.hidden=false;fallback.select?.();status.textContent="Copie impossible automatiquement : copie le texte affiché ci-dessous.";}
 });
 update();
}
window.LG_TABLE={attach,getOrder:orderOf,getTrio:trioOf};
})();
