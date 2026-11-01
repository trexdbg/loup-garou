(() => {
"use strict";
const $ = id => document.getElementById(id);
const roles = window.ROLES, stories = window.STORIES, byId = window.ROLE_BY_ID;
const KEY = "loup-garou-solo-v1", SELF = "__joueur__";
let game = null, storyId = stories[0].id, selected = null, secrets = false, spoken = "";
const rand = arr => arr[Math.floor(Math.random()*arr.length)];
const alive = () => game.npcs.filter(n => n.alive);
const npc = name => game.npcs.find(n => n.name === name);
const story = () => stories.find(s => s.id === game.storyId);
const wolf = id => byId[id]?.team === "loups" || id === "blanc";
const set = (id,text) => { $(id).textContent = text ?? ""; };
const visible = (id,on) => { $(id).hidden = !on; };
const node = (tag,text,cls) => { const x=document.createElement(tag); if(text!==undefined)x.textContent=text; if(cls)x.className=cls;return x; };
const choice = (el, values, desired) => {
  const value = desired ?? el.value; el.replaceChildren();
  for(const item of values){const o=new Option(item.label,item.value);el.add(o);}
  if(values.some(x=>x.value===value))el.value=value;
};
const save = () => { if(game) try{localStorage.setItem(KEY,JSON.stringify(game));}catch(_){} };
const log = txt => {game.journal.unshift("Tour "+game.day+" : "+txt);game.journal.length=Math.min(game.journal.length,70);};
function listen(text){
  if(!("speechSynthesis" in window)){alert("Lecture vocale non disponible.");return;}
  speechSynthesis.cancel();const s=new SpeechSynthesisUtterance(text||spoken);s.lang="fr-FR";s.rate=.9;speechSynthesis.speak(s);
}
function setup(){
  $("storyChoices").replaceChildren();
  for(const s of stories){
    const b=node("button",undefined,"story-option"+(storyId===s.id?" selected":""));
    b.append(node("span",s.icon,"big"),node("strong",s.title),node("span",s.tone+" · "+s.minutes+" min"));
    b.setAttribute("aria-pressed",String(storyId===s.id));
    b.onclick=()=>{storyId=s.id;setup();};$("storyChoices").append(b);
  }
  const old=$("roleSelect").value||"random";const options=[{value:"random",label:"🎲 Tirage au hasard"}];
  for(const r of roles)options.push({value:r.id,label:r.icon+" "+r.name+" ("+r.edition+")"});
  choice($("roleSelect"),options,old);preview();
  $("roleCatalog").replaceChildren();
  for(const r of roles){
    const e=node("div",undefined,"catalog-item");
    e.append(node("b",r.icon+" "+r.name),node("div",r.edition+" · "+window.CAMPS[r.team],"edition"),
      node("p",r.power),node("small",r.support==="mj"?"Arbitrage MJ":"Assistance automatique"));
    $("roleCatalog").append(e);
  }
  try{visible("resumeGame",!!localStorage.getItem(KEY));}catch(_){}
}
function preview(){
  const r=byId[$("roleSelect").value];
  set("rolePreview",r?r.power+" · "+(r.support==="mj"?"Arbitrage du MJ.":"Pouvoir assisté."):"Un des "+roles.length+" rôles sera attribué au hasard.");
}
function start(){
  const r=$("roleSelect").value==="random"?rand(roles).id:$("roleSelect").value;
  const s=stories.find(x=>x.id===storyId);
  const accomplice=wolf(r)?null:rand(s.residents.filter(x=>x.name!==s.culprit)).name;
  const support=["voyante","sorciere","salvateur","ancien","idiot","chasseur","corbeau","montreur","villageois"].sort(()=>Math.random()-.5);
  let next=0;
  const npcs=s.residents.map(person=>({
    name:person.name,roleId:person.name===s.culprit||person.name===accomplice?"loup":support[next++%support.length],
    alive:true,trust:0,shield:1,muted:false,revealed:false
  }));
  game={version:1,storyId,roleId:r,name:$("playerName").value.trim().slice(0,28)||"Alex",
    duration:Number($("duration").value),day:1,phase:"intro",npcs,playerAlive:true,
    journal:[],clues:[],visited:[],nightChoice:null,attack:null,nightSummary:"",voted:false,voteSummary:"",
    life:true,death:true,fox:true,monkey:true,protected:null,mark:null,charmed:[],outcome:null};
  selected=null;log("La partie commence. Les habitants se réunissent.");
  visible("setup",false);visible("game",true);scene();save();
}
function resume(){
  try{
    const v=JSON.parse(localStorage.getItem(KEY));
    if(!v||v.version!==1||!byId[v.roleId]||!stories.some(s=>s.id===v.storyId))throw Error("Format inconnu");
    game=v;selected=null;visible("setup",false);visible("game",true);scene();
  }catch(e){alert("Impossible de reprendre cette partie : "+e.message);}
}
function reset(){
  if(!confirm("Recommencer avec une nouvelle aventure ?"))return;
  game=null;selected=null;try{localStorage.removeItem(KEY);}catch(_){}
  visible("setup",true);visible("game",false);toggleSecrets(false);setup();
}
function enterNight(){
  game.phase="night";game.nightChoice=null;game.mark=null;game.voted=false;
  const possibles=alive().filter(n=>!wolf(n.roleId));
  game.attack=possibles.length?rand(possibles).name:null;
  set("nightResult","");log("Le village s'endort. Les Loups-Garous ouvrent les yeux.");
}
function kill(name,reason){
  const person=npc(name);
  if(!person||!person.alive)return false;
  if(reason==="attaque nocturne"&&(person.roleId==="ancien"||person.roleId==="marionnette")&&person.shield>0){
    person.shield--;
    if(person.roleId==="marionnette")person.muted=true;
    log(person.name+" résiste à une première attaque grâce à son pouvoir.");return false;
  }
  if(reason==="vote"&&person.roleId==="idiot"&&!person.revealed){
    person.revealed=true;log(person.name+" est l'Idiot du Village : il survit mais ne votera plus.");return false;
  }
  person.alive=false;log(name+" éliminé ("+reason+"). Rôle révélé : "+byId[person.roleId].name+".");return true;
}
function outcome(){
  if(!game.playerAlive){finish("loups");return;}
  const w=alive().filter(n=>wolf(n.roleId)).length+(wolf(game.roleId)?1:0);
  const v=alive().filter(n=>!wolf(n.roleId)).length+(wolf(game.roleId)?0:1);
  if(w===0)finish("village");else if(w>=v)finish("loups");
}
function finish(camp){
  game.outcome=camp;game.phase="end";log("Fin de l'aventure : "+(camp==="village"?"victoire du village.":"victoire des Loups."));
}
function resolveNight(){
  const a=game.nightChoice;
  const victim=wolf(game.roleId)&&a?.ability==="attack"?a.target:game.attack;
  let saved=false,phrase="";
  if(a?.ability==="heal"&&game.life){game.life=false;saved=true;phrase="La Sorcière a sauvé la victime. ";}
  if(a?.ability==="protect"&&a.target===victim){saved=true;phrase="Le Salvateur a empêché l'attaque. ";}
  if(!saved&&victim){
    const lost=kill(victim,"attaque nocturne");
    phrase+=lost?victim+" a disparu. Son rôle était "+byId[npc(victim).roleId].name+".":"Une attaque a eu lieu, mais la victime a survécu.";
  }else if(!victim)phrase+="La nuit est restée calme.";
  if(a?.ability==="poison"&&game.death){
    game.death=false;if(a.target!==victim&&kill(a.target,"potion"))phrase+=" "+a.target+" a été victime d'une potion.";
  }
  if(game.roleId==="montreur"){
    phrase+=alive().slice(0,2).some(x=>wolf(x.roleId))?" Ton ours grogne au matin.":" Ton ours reste silencieux.";
  }
  game.nightSummary=phrase;game.phase="dawn";log(phrase);outcome();
}
function advance(){
  if(!game||game.phase==="end")return;
  if(game.phase==="intro")enterNight();
  else if(game.phase==="night")resolveNight();
  else if(game.phase==="dawn")game.phase="day";
  else if(game.phase==="day")game.phase="vote";
  else if(game.phase==="vote"&&game.voted){
    game.day++;
    if(game.day>({30:3,45:4,60:5}[game.duration]||4))finish("loups");
    else enterNight();
  }
  scene();save();
}
function scene(){
  const s=story();let title="",desc="",label="",icon="🌙",next="Continuer ➜";
  if(game.phase==="intro"){
    title="Une histoire commence";label="PROLOGUE";icon="📖";
    desc=s.opening+"\n\nMJ : présente les habitants et donne sa carte au joueur. Il peut commencer à poser ses questions.";
    next="🌙 Le village s'endort";
  }else if(game.phase==="night"){
    title="Le village s'endort…";label="NUIT "+game.day;icon="🌙";
    desc=s.night+"\n\nMJ : tous les yeux se ferment. Appelle à voix basse les rôles de nuit, puis propose au joueur d'utiliser son pouvoir.";
    next="☀️ Faire venir le matin";
  }else if(game.phase==="dawn"){
    title="Le village se réveille";label="AUBE "+game.day;icon="🌅";
    desc=s.dawn+"\n\n"+game.nightSummary;next="☀️ Débuter les discussions";
  }else if(game.phase==="day"){
    title="L'enquête commence";label="JOUR "+game.day;icon="☀️";
    desc=s.day+"\n\nMJ : le joueur peut librement questionner les habitants, explorer des lieux et formuler des théories.";
    next="⚖️ Le conseil du village";
  }else if(game.phase==="vote"){
    title="Le village doit voter";label="CONSEIL "+game.day;icon="⚖️";
    desc="La cloche sonne. Les habitants se réunissent pour désigner un suspect."+(game.voteSummary?"\n\n"+game.voteSummary:"");
    next="🌙 Nuit suivante";
  }else{
    title=game.outcome==="village"?"Le village est sauvé !":"Les Loups ont gagné…";
    label="ÉPILOGUE";icon=game.outcome==="village"?"🏆":"🐺";
    desc=game.outcome==="village"?s.endVillage:s.endWolves;
    desc+="\n\nMJ : dévoile les rôles, raconte les motivations et demande au joueur quel indice lui a paru le plus important.";
  }
  set("currentTitle",s.title);set("storySetting",s.setting);set("phaseDescription",s.tone);
  set("sceneTitle",title);set("phaseIcon",icon);set("phaseLabel",label);
  set("sceneText",desc);set("continueButton",next);spoken=desc;render();
}
function nightOptions(){
  const r=byId[game.roleId],action=r.action;
  if(action==="witch")return [
    ...(game.life?[{value:"heal",label:"Sauver la victime (potion de vie)"}]:[]),
    ...(game.death?[{value:"poison",label:"Éliminer une cible (potion de mort)"}]:[])
  ];
  return [{value:action,label:{
    inspect:"Observer la véritable carte",attack:"Attaquer",protect:"Protéger",
    fox:"Flairer trois voisins",mark:"Ajouter deux votes",charm:"Charmer une personne",
    monkey:"Observer un rôle",manual:"Signaler au MJ"
  }[action]||"Activer le pouvoir"}];
}
function actionNight(){
  if(game.phase!=="night"||game.nightChoice)return;
  const ability=$("nightAbility").value,target=$("nightTarget").value;
  const r=byId[game.roleId];
  if(target!==SELF&&!npc(target)?.alive)return;
  if(ability==="protect"&&target===game.protected){set("nightResult","Le Salvateur ne protège pas deux nuits de suite la même personne.");return;}
  game.nightChoice={ability,target};
  let msg="Décision enregistrée. Le maître du jeu poursuit la nuit.";
  if(ability==="inspect")msg="La carte de "+target+" est : "+byId[npc(target).roleId].name+". Garde ce secret.";
  if(ability==="fox"){
    const people=alive(),i=people.findIndex(n=>n.name===target);
    const three=[people[(i+people.length-1)%people.length],people[i],people[(i+1)%people.length]];
    const found=three.some(x=>wolf(x.roleId));
    msg="Le Renard flaire "+three.map(x=>x.name).join(", ")+": "+(found?"au moins un Loup !":"aucun Loup. Son flair est perdu.");
    if(!found)game.fox=false;
  }
  if(ability==="monkey"){
    game.monkey=false;
    msg="Le Singe découvre que "+target+" est "+byId[npc(target).roleId].name+".";
    if(wolf(npc(target).roleId)){game.playerAlive=false;msg+=" Il a pris trop de risques et a été démasqué !";}
  }
  if(ability==="mark"){game.mark=target;msg="Deux voix supplémentaires viseront "+target+" au prochain conseil.";}
  if(ability==="protect"){game.protected=target;msg="Protection préparée pour "+(target===SELF?game.name:target)+".";}
  if(ability==="charm"){game.charmed.push(target);msg=target+" a été charmé (objectif solitaire à vérifier par le MJ).";}
  if(ability==="heal")msg="La potion de vie attend la victime annoncée à la Sorcière : "+game.attack+".";
  if(ability==="poison")msg="La potion de mort est destinée à "+target+".";
  if(r.support==="mj")msg+=" Le MJ doit appliquer les conditions officielles de ce pouvoir.";
  log("Le personnage du joueur a agi pendant la nuit.");save();render();set("nightResult",msg);
}
function chat(n,topic,q=""){
  const source=story().residents.find(p=>p.name===n.name),w=wolf(n.roleId);
  n.trust=Math.min(n.trust+1,5);
  if(topic==="hello")return "Bonsoir "+game.name+". Je suis "+source.job+". "+source.rumor;
  if(topic==="alibi")return source.alibi+(w?" Pourquoi m'interroger ?":" Tu peux vérifier.");
  if(topic==="rumor")return source.rumor;
  if(topic==="hint")return source.hint+(n.trust>=3?" Je t'avoue aussi : "+source.secret:" Parle encore un peu avec moi, j'ai peut-être autre chose à confier.");
  if(topic==="suspect"){
    if(w)return "Je me méfie de "+(alive().find(x=>!wolf(x.roleId)&&x.name!==n.name)?.name||"tout le monde")+".";
    return game.clues.length>1?"Il faudrait examiner "+story().culprit+" de plus près.":"J'ai besoin de plus de preuves avant de soupçonner quelqu'un.";
  }
  if(topic==="accuse")return w?"Moi ? Impossible ! Tu n'as aucune preuve.":"Tu te trompes peut-être. Vérifie d'abord mon histoire.";
  const text=q.toLocaleLowerCase("fr-FR");
  if(/hier|nuit|heure|alibi|où|faisai/.test(text))return chat(n,"alibi");
  if(/suspect|loup|accus|coupable|ment/.test(text))return chat(n,"suspect");
  if(/sac|bague|clé|masque|lanterne|forêt|cloche|trace|secret|indice/.test(text))return chat(n,"hint");
  return "Je n'en suis pas sûr. "+source.rumor+" Tu devrais aussi demander à mes voisins.";
}
function speech(text){set("dialogueText","« "+text+" »");spoken=text;}
function talk(name){
  selected=name;const n=npc(name);
  speech(n.muted?"Ce personnage ne peut répondre que par gestes.":chat(n,"hello"));
  log("Conversation avec "+name+".");save();render();
}
function question(topic,free=""){
  if(!selected||!npc(selected)?.alive)return;
  speech(npc(selected).muted?"La marionnette ne peut plus parler.":chat(npc(selected),topic,free));
  log("Question posée à "+selected+".");save();render();
}
function explore(id){
  const p=story().locations.find(x=>x.id===id);
  if(!p)return;
  const first=!game.visited.includes(id);
  if(first){
    game.visited.push(id);game.clues.push({place:p.name,text:p.clue,focus:p.focus});
    log("Indice découvert à "+p.name+": "+p.clue);
  }
  set("placeResult",p.text+"\n"+(first?"🔍 Nouvel indice : ":"Indice déjà connu : ")+p.clue);
  save();render();
}
function vote(){
  if(game.phase!=="vote"||game.voted)return;
  const target=$("voteTarget").value; if(!npc(target)?.alive)return;
  const tally=Object.fromEntries(alive().map(x=>[x.name,0]));
  tally[target]++;
  for(const voter of alive()){
    if(voter.roleId==="idiot"&&voter.revealed)continue;
    const targets=alive().filter(n=>n.name!==voter.name&&(!wolf(voter.roleId)||!wolf(n.roleId)));
    if(!targets.length)continue;
    const ballots=[];
    for(const n of targets){
      let weight=1;
      if(!wolf(voter.roleId)&&n.name===story().culprit)weight+=game.clues.length*2;
      if(n.name===target&&game.clues.length)weight+=Math.min(game.clues.length,3);
      for(let z=0;z<weight;z++)ballots.push(n.name);
    }
    const choice=rand(ballots);if(choice)tally[choice]++;
  }
  if(game.mark&&tally[game.mark]!=null)tally[game.mark]+=2;
  const sorted=Object.entries(tally).sort((a,b)=>b[1]-a[1]);
  let message="Votes : "+sorted.map(([name,v])=>name+" "+v).join(" · ")+". ";
  if(sorted.length>1&&sorted[0][1]===sorted[1][1])message+="Égalité : personne n'est éliminé (adaptation solo).";
  else if(sorted.length){
    const removed=kill(sorted[0][0],"vote");
    message+=removed?sorted[0][0]+" est condamné. Son rôle est dévoilé.":"Ce personnage est sauvé par son pouvoir.";
  }
  game.voted=true;game.voteSummary=message;log(message);outcome();scene();set("voteResult",message);save();
}
function render(){
  if(!game)return;
  const r=byId[game.roleId];
  set("dayBadge",game.phase==="intro"?"Prologue":"Tour "+game.day);
  set("livingBadge",(alive().length+(game.playerAlive?1:0))+" habitants");
  set("clueBadge",game.clues.length+" indices");
  set("heroName",game.name);set("heroRole",r.name);set("heroPower",r.power);
  set("playerIcon",r.icon);set("heroTeam",window.CAMPS[r.team]);
  set("heroRoleNote",r.support==="mj"?"Pouvoir complexe : arbitrage du MJ nécessaire.":"Pouvoir pris en charge dans le mode solo.");
  visible("continueButton",game.phase!=="end"&&(game.phase!=="vote"||game.voted));
  visible("discussionSection",game.phase==="day");
  visible("investigationSection",game.phase==="day");
  visible("nightSection",game.phase==="night");
  visible("voteSection",game.phase==="vote");
  const residents=$("residents");residents.replaceChildren();
  for(const n of game.npcs){
    const p=story().residents.find(x=>x.name===n.name);
    const b=node("button",undefined,"resident"+(selected===n.name?" active":"")+(!n.alive?" dead":""));
    b.disabled=!n.alive;b.append(node("strong",n.name),node("small",p.job+(n.alive?"":" · éliminé")));
    b.onclick=()=>talk(n.name);residents.append(b);
  }
  visible("conversationPanel",!!selected&&npc(selected)?.alive&&game.phase==="day");
  if(selected&&npc(selected)?.alive&&game.phase==="day"){
    set("conversationName",selected);
    set("conversationJob",story().residents.find(x=>x.name===selected).job);
    $("topicButtons").replaceChildren();
    for(const [topic,label] of [["alibi","Où étais-tu ?"],["rumor","Qu'as-tu entendu ?"],["hint","Que caches-tu ?"],["suspect","Qui soupçonnes-tu ?"],["accuse","Je t'accuse !"]]){
      const b=node("button",label);b.onclick=()=>question(topic);$("topicButtons").append(b);
    }
  }
  $("places").replaceChildren();
  for(const p of story().locations){
    const done=game.visited.includes(p.id),b=node("button",undefined,"place"+(done?" visited":""));
    b.append(node("strong",p.icon+" "+p.name),node("span",done?"✓ Indice découvert":p.text));
    b.onclick=()=>explore(p.id);$("places").append(b);
  }
  $("clueList").replaceChildren();
  if(!game.clues.length)$("clueList").append(node("p","Aucun indice. Explore un lieu pendant le jour.","muted"));
  for(const clue of game.clues){
    const c=node("div",undefined,"clue-card");c.append(node("b",clue.place),node("div",clue.text));$("clueList").append(c);
  }
  $("journal").replaceChildren();
  for(const entry of game.journal)$("journal").append(node("div",entry,"log-row"));
  if(game.phase==="night"){
    const a=nightOptions(),enabled=r.action!=="none"&&!game.nightChoice&&a.length&&
      !(r.action==="fox"&&!game.fox)&&!(r.action==="monkey"&&!game.monkey);
    visible("nightControls",enabled);
    set("nightHelp",r.power+(r.support==="mj"?" Le MJ complète les effets selon le livret.":"")+
      (wolf(game.roleId)?" Tes compagnons Loups sont : "+alive().filter(n=>wolf(n.roleId)).map(n=>n.name).join(", ")+".":"")+
      (r.action==="witch"?" La victime des Loups est : "+(game.attack||"personne")+".":"")+
      (!enabled?" Aucune autre action cette nuit.":""));
    if(enabled){
      const targets=alive().filter(n=>r.action!=="attack"||!wolf(n.roleId)).map(n=>({value:n.name,label:n.name}));
      if(r.action==="protect"||r.action==="manual")targets.unshift({value:SELF,label:game.name+" (toi)"});
      choice($("nightTarget"),targets);choice($("nightAbility"),a);
    }
  }
  if(game.phase==="vote"){
    choice($("voteTarget"),alive().map(n=>({value:n.name,label:n.name})));
    $("voteButton").disabled=game.voted;
    if(game.voted)set("voteResult",game.voteSummary);
  }
  renderSecrets();
}
function toggleSecrets(open){secrets=open;visible("gmPanel",open);$("gmToggle").setAttribute("aria-expanded",String(open));if(open)renderSecrets();}
function renderSecrets(){
  if(!secrets)return;
  const box=$("gmContent");box.replaceChildren();
  if(!game){box.append(node("p","Commence une partie pour voir les secrets."));return;}
  box.append(node("h3","Secret de l'histoire"));
  box.append(node("p","Piste principale : "+story().culprit+". Des Loups supplémentaires peuvent avoir été attribués par hasard."));
  box.append(node("p","Tour "+game.day+" · Attaque nocturne prévue : "+(game.attack||"aucune")));
  box.append(node("h3","Identités secrètes et révélations"));
  const list=node("div",undefined,"gm-list");
  for(const n of game.npcs){
    const source=story().residents.find(x=>x.name===n.name),row=node("div",undefined,"gm-row"),details=node("div");
    details.append(node("strong",n.name+(n.alive?"":" ✝")),node("div",source.trait+". "+source.secret));
    const sel=document.createElement("select");sel.setAttribute("aria-label","Rôle de "+n.name);
    choice(sel,roles.map(r=>({value:r.id,label:r.name})),n.roleId);
    sel.onchange=()=>{n.roleId=sel.value;log("Le MJ modifie une carte.");save();render();};
    row.append(details,sel);list.append(row);
  }
  box.append(list);
  box.append(node("h3","Arbitrage MJ"));
  box.append(node("p","Tous les rôles peuvent être attribués à des habitants. Les pouvoirs complexes (amoureux, infections, chevalier, métiers, événements, rôles solitaires et nouvelle édition) restent à arbitrer à partir des cartes officielles."));
  const controls=node("div",undefined,"gm-controls"),sel=document.createElement("select");
  choice(sel,alive().map(n=>({value:n.name,label:n.name})));
  const remove=node("button","Éliminer","danger");
  remove.onclick=()=>{if(sel.value){kill(sel.value,"décision MJ");outcome();scene();save();}};
  const restore=node("button","Rétablir","secondary");
  restore.onclick=()=>{const n=npc(sel.value);if(n){n.alive=true;log("Le MJ rétablit "+n.name+".");scene();save();}};
  controls.append(sel,remove,restore);box.append(controls);
  box.append(node("h3","Conseil de mise en scène"));
  box.append(node("p","Change ta voix selon les personnages. Les alibis servent de base ; accepte les idées et actions libres du joueur. Pour les pouvoirs non automatisés, utilise les cartes que vous possédez."));
}
$("roleSelect").onchange=preview;
$("startGame").onclick=start;$("resumeGame").onclick=resume;
$("newGame").onclick=reset;$("continueButton").onclick=advance;
$("nightAct").onclick=actionNight;$("voteButton").onclick=vote;
$("gmToggle").onclick=()=>toggleSecrets(!secrets);
$("gmClose").onclick=()=>toggleSecrets(false);
$("readButton").onclick=()=>listen(spoken);
$("sceneRead").onclick=()=>listen($("sceneText").textContent);
$("askQuestion").onclick=()=>{
  const q=$("freeQuestion").value.trim();if(q){question("free",q);$("freeQuestion").value="";}
};
$("freeQuestion").addEventListener("keydown",e=>{if(e.key==="Enter"){$("askQuestion").click();}});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&secrets)toggleSecrets(false);});
setup();
})();