/* Moteur de partie solo : scénarios, enquête, dialogues, rôles, sauvegarde et audio. */
(() => {
  "use strict";
  const $=id=>document.getElementById(id);
  const KEY="thiercelieux.solo.v1";
  const fresh=()=>({storyId:null,roleId:null,phase:"setup",day:0,visited:[],eliminated:[],suspects:[],actionDone:false,activeResident:null,spoken:null,nightAction:null,witchLife:false,witchDeath:false,foxLost:false,lastProtected:null,ending:null});
  let game=fresh();
  const story=()=>window.STORIES.find(s=>s.id===game.storyId);
  const role=()=>window.ROLE_BY_ID[game.roleId];
  const resident=name=>story()?.residents.find(r=>r.name===name);
  const alive=()=>story()?.residents.filter(r=>!game.eliminated.includes(r.name))||[];
  const log=msg=>{const list=$("history"),li=document.createElement("li");li.textContent=msg;list.prepend(li);while(list.children.length>28)list.lastElementChild.remove();};
  const persist=()=>{if(game.phase==="setup")localStorage.removeItem(KEY);else localStorage.setItem(KEY,JSON.stringify(game));};
  const show=(id,visible)=>$(id).classList.toggle("hidden",!visible);
  const choose=(select,choices,placeholder="Choisir un habitant")=>{
    select.replaceChildren();
    choices.forEach(({value,label})=>{const opt=document.createElement("option");opt.value=value;opt.textContent=label;select.append(opt);});
    if(!choices.length){const o=document.createElement("option");o.textContent=placeholder;select.append(o);}
  };
  const lines={
    intro:"Prologue",night:"Le village s'endort",dawn:"Le village s'éveille",
    day:"L'enquête",vote:"Le conseil du village",end:"Épilogue"
  };
  function currentNarration(){
    const s=story();if(!s)return "";
    if(game.phase==="intro")return s.opening;
    if(game.phase==="night")return s.night+"\n\nLe maître du jeu invite les personnages concernés à agir, en secret.";
    if(game.phase==="dawn")return s.dawn+(game.nightAction?.type==="attack"?"\n\nUn habitant manque à l'appel ce matin. Le mystère s'épaissit.":"");
    if(game.phase==="day")return s.day+"\n\nDiscute avec les habitants et visite les lieux avant le conseil.";
    if(game.phase==="vote")return "Tous les habitants se rassemblent. Le joueur doit écouter les témoignages, puis désigner son suspect. Le maître du jeu peut demander : « Sur quels indices t'appuies-tu ? »";
    if(game.phase==="end")return game.ending==="village"?s.endVillage:s.endWolves;
    return "";
  }
  function speech(text,speaker="Narrateur"){window.SOUND.speak(text,speaker);}
  function enter(autoplay=true){
    render();persist();
    const phase=game.phase,s=story();
    if(phase==="night"){window.SOUND.scene("night");window.SOUND.effect("night");}
    else if(phase==="dawn"){window.SOUND.scene("day");window.SOUND.effect("dawn");}
    else if(phase==="day"){window.SOUND.scene(s?.setting?.toLowerCase().includes("forêt")?"forest":"day");}
    else if(phase==="intro"){window.SOUND.scene(s?.setting?.toLowerCase().includes("forêt")?"forest":"night");}
    else if(phase==="vote"){window.SOUND.scene("night");window.SOUND.effect("vote");}
    else if(phase==="end"){window.SOUND.scene("day");window.SOUND.effect("reveal");}
    if(autoplay)speech(currentNarration());
  }
  function start(){
    game=fresh();
    const chosen=$("roleSelect").value;
    game.storyId=$("storySelect").value;
    game.roleId=chosen==="random"?window.ROLES[Math.floor(Math.random()*window.ROLES.length)].id:chosen;
    game.phase="intro";
    $("history").replaceChildren();
    log("Aventure : "+story().title+" · rôle : "+role().name);
    enter(true);
  }
  function next(){
    if(game.phase==="intro"){game.phase="night";game.day=1;game.actionDone=false;game.nightAction=null;}
    else if(game.phase==="night"){game.phase="dawn";}
    else if(game.phase==="dawn"){game.phase="day";}
    else if(game.phase==="day"){game.phase="vote";}
    else if(game.phase==="vote")return;
    else if(game.phase==="end"){reset();return;}
    game.activeResident=null;
    log(lines[game.phase]+" · jour "+game.day);
    enter();
  }
  function reset(){
    window.SOUND.stop();game=fresh();$("history").replaceChildren();
    log("Choisis un scénario et lance l'aventure.");
    persist();render();
  }
  function render(){
    const running=game.phase!=="setup",s=story(),r=role();
    show("setupCard",!running);
    show("storyCard",running);
    show("investigationCard",running&&game.phase==="day");
    show("residentsCard",running&&game.phase==="day");
    show("actionCard",running&&game.phase==="night");
    show("voteCard",running&&game.phase==="vote");
    if(!running)return;
    $("storyTitle").textContent=s.icon+" "+s.title;
    $("phaseName").textContent=lines[game.phase];
    $("dayCount").textContent=game.day?"Nuit/jour "+game.day:"Début";
    $("narration").textContent=currentNarration();
    $("roleDetail").textContent="Rôle du joueur : "+r.icon+" "+r.name+" — "+r.power+(r.support==="mj"?" (arbitrage du MJ)":"");
    $("continueBtn").textContent=game.phase==="end"?"Nouvelle aventure":game.phase==="night"?"Faire lever le soleil →":game.phase==="day"?"Réunir le conseil →":game.phase==="intro"?"Le village s'endort →":"Continuer →";
    $("continueBtn").disabled=game.phase==="vote";
    $("readBtn").disabled=!currentNarration();
    if(game.phase==="day"){renderLocations();renderResidents();}
    if(game.phase==="night")renderAction();
    if(game.phase==="vote")renderVote();
  }
  function renderLocations(){
    const root=$("locations");root.replaceChildren();
    story().locations.forEach(loc=>{
      const btn=document.createElement("button");
      btn.className="item"+(game.visited.includes(loc.id)?" visited":"");
      const caption=document.createElement("span");caption.textContent=loc.icon+" "+loc.name+" — "+loc.text;
      const right=document.createElement("small");right.textContent=game.visited.includes(loc.id)?"✓ indice":"Explorer";
      btn.append(caption,right);btn.addEventListener("click",()=>{
        const first=!game.visited.includes(loc.id);
        if(first)game.visited.push(loc.id);
        $("clueText").textContent="🔎 "+loc.clue;
        window.SOUND.effect(first?"clue":"steps");
        speech(loc.clue);
        if(first)log("Indice trouvé : "+loc.name);
        persist();renderLocations();
      });
      root.append(btn);
    });
    if(!game.visited.length)$("clueText").textContent="Aucun indice trouvé pour le moment.";
  }
  function renderResidents(){
    const box=$("residents");box.replaceChildren();
    alive().forEach(p=>{
      const btn=document.createElement("button");
      btn.className=game.activeResident===p.name?"selected":"";
      btn.textContent=p.name+" · "+p.job;
      btn.addEventListener("click",()=>{
        game.activeResident=p.name;persist();renderResidents();
        const greeting="Bonjour, je suis "+p.name+", "+p.job+". On dit que je suis "+p.trait+". Que veux-tu savoir ?";
        displayDialogue(p.name,greeting);
      });
      box.append(btn);
    });
    const selected=game.activeResident&&resident(game.activeResident);
    show("dialoguePanel",!!selected);
    if(selected){$("speakerName").textContent=selected.name+" · "+selected.job;
      $("speakerLine").textContent=game.spoken||"Choisis une question, ou pose la tienne.";}
  }
  function displayDialogue(name,text){
    game.spoken=text;$("speakerName").textContent=name+" · "+resident(name)?.job;
    $("speakerLine").textContent=text;window.SOUND.effect("steps");speech(text,name);
    persist();
  }
  function ask(topic){
    const p=resident(game.activeResident);if(!p||game.phase!=="day")return;
    const mapping={alibi:p.alibi,rumor:p.rumor,secret:p.secret,hint:p.hint};
    const reply=mapping[topic]||p.rumor;
    displayDialogue(p.name,reply);
    log("Dialogue avec "+p.name+" : "+topic);
  }
  function askFree(text){
    const t=text.toLowerCase();
    let topic="rumor";
    if(/o[uù]|étais|alibi|nuit|hier|heure|vu/.test(t))topic="alibi";
    else if(/cach|secret|mens|avou|vérit/.test(t))topic="secret";
    else if(/indice|preuve|aide|piste|remarqu/.test(t))topic="hint";
    else if(/sai|entend|connais|pens|soup/.test(t))topic="rumor";
    ask(topic);
  }
  function renderAction(){
    const r=role(),target=$("actionTarget"),btn=$("actionBtn"),title=$("actionTitle"),help=$("actionHelp");
    const type=r.action;
    title.textContent=r.icon+" "+r.name+" · pouvoir nocturne";
    help.textContent=r.power;
    $("actionResult").textContent=game.nightAction?.result||"";
    if(type==="none"||type==="manual"){
      target.disabled=true;btn.disabled=true;
      choose(target,[]);help.textContent+=" Le maître du jeu gère ce rôle à l'oral pendant la nuit.";return;
    }
    target.disabled=false;btn.disabled=game.actionDone;
    let players=alive();
    if(type==="fox"||type==="monkey"){help.textContent+=" Sélectionne un habitant central : trois voisins seront observés.";}
    if(type==="witch"){
      if(game.witchLife&&!game.witchDeath)help.textContent+=" La potion de vie est épuisée ; il te reste celle de mort.";
      else if(!game.witchLife)help.textContent+=" La prochaine action utilise la potion de vie.";
      btn.disabled=game.witchLife&&game.witchDeath;
    }
    if(type==="fox"&&game.foxLost)btn.disabled=true;
    choose(target,players.map(p=>({value:p.name,label:p.name+" · "+p.job})));
    if(!players.length)btn.disabled=true;
  }
  function act(){
    if(game.phase!=="night"||game.actionDone)return;
    const r=role(),t=$("actionTarget").value,type=r.action,persons=alive(),index=persons.findIndex(p=>p.name===t);
    if(index<0)return;
    let result="";
    if(type==="inspect")result=t===story().culprit?"La boule de cristal révèle une présence de Loup-Garou !":"Tu ne détectes pas de Loup-Garou chez "+t+".";
    else if(type==="protect"){
      if(game.lastProtected===t){result="Le Salvateur ne peut pas protéger deux nuits de suite la même personne.";return actionNotice(result);}
      game.lastProtected=t;result=t+" est protégé pour cette nuit.";
    }
    else if(type==="fox"||type==="monkey"){
      const trio=[persons[(index+persons.length-1)%persons.length],persons[index],persons[(index+1)%persons.length]];
      const names=[...new Set(trio.map(p=>p.name))],found=names.includes(story().culprit);
      result="Tu sondes "+names.join(", ")+". "+(found?"Une présence inquiétante rôde dans ce groupe.":"Aucun signe de Loup dans ce groupe.");
      if(type==="fox"&&!found){game.foxLost=true;result+=" Le Renard perd son flair pour le reste de la partie.";}
    }else if(type==="witch"){
      if(!game.witchLife){game.witchLife=true;result="La potion de vie protège "+t+" cette nuit.";}
      else if(!game.witchDeath){game.witchDeath=true;result="La potion de mort a été confiée au MJ pour arbitrer le sort de "+t+".";}
      else return actionNotice("Les deux potions ont déjà été utilisées.");
    }else if(type==="charm")result=t+" est charmé : le maître du jeu suit les personnages charmés.";
    else if(type==="mark")result="Le Corbeau désigne "+t+" : deux voix de pénalité lors du prochain conseil, à appliquer par le MJ.";
    else if(type==="attack"){
      result="La meute a choisi "+t+". Le maître du jeu décide des conséquences au matin.";
      game.nightAction={type:"attack",target:t};
    }else return actionNotice("Ce rôle nécessite une décision du maître du jeu.");
    game.actionDone=true;
    game.nightAction={...(game.nightAction||{}),result};
    log("Pouvoir de "+r.name+" utilisé pendant la nuit.");
    actionNotice(result);
    persist();renderAction();
  }
  function actionNotice(msg){
    $("actionResult").textContent=msg;
    window.SOUND.effect("reveal");speech(msg);
  }
  function renderVote(){
    choose($("voteTarget"),alive().map(p=>({value:p.name,label:p.name+" · "+p.job})));
    $("voteBtn").disabled=!alive().length;
  }
  function vote(){
    if(game.phase!=="vote")return;
    const target=$("voteTarget").value;if(!target||!resident(target))return;
    log("Conseil "+game.day+" : accusation de "+target);
    game.suspects.push(target);
    if(target===story().culprit){
      game.ending="village";game.phase="end";
      log("L'identité du Loup est découverte.");
    } else {
      if(!game.eliminated.includes(target))game.eliminated.push(target);
      if(game.day>=3||alive().length<2){
        game.ending="loups";game.phase="end";
        log("Les Loups-Garous ont échappé au conseil.");
      }else {
        game.day++;game.phase="night";game.actionDone=false;game.nightAction=null;
        log("Mauvaise piste. Une nouvelle nuit commence.");
      }
    }
    enter();
  }
  function populate(){
    choose($("storySelect"),window.STORIES.map(s=>({value:s.id,label:s.icon+" "+s.title+" · "+s.minutes+" min"})));
    window.ROLES.forEach(r=>{
      const opt=document.createElement("option");
      opt.value=r.id;opt.textContent=r.icon+" "+r.name+" · "+r.edition+(r.support==="mj"?" [MJ]":"");
      $("roleSelect").append(opt);
    });
    const info=()=>{
      const s=window.STORIES.find(o=>o.id===$("storySelect").value);
      $("storyInfo").textContent=s.setting+" · "+s.tone+" · "+s.residents.length+" habitants à interroger.";
    };
    $("storySelect").addEventListener("change",info);info();
  }
  function bind(){
    populate();
    $("startBtn").addEventListener("click",start);
    $("resumeBtn").addEventListener("click",()=>{const raw=localStorage.getItem(KEY);if(raw)resume(raw,true);});
    $("continueBtn").addEventListener("click",next);
    $("resetBtn").addEventListener("click",()=>{if(confirm("Abandonner cette partie et revenir au choix d'aventure ?"))reset();});
    $("readBtn").addEventListener("click",()=>speech(currentNarration()));
    document.querySelectorAll("[data-question]").forEach(btn=>btn.addEventListener("click",()=>ask(btn.dataset.question)));
    $("dialogueInput").addEventListener("submit",e=>{e.preventDefault();const input=$("questionInput"),text=input.value.trim();if(text){askFree(text);input.value="";}});
    $("actionBtn").addEventListener("click",act);
    $("voteBtn").addEventListener("click",vote);
    const raw=localStorage.getItem(KEY);
    if(raw)try{
      const save=JSON.parse(raw);
      if(window.ROLE_BY_ID[save.roleId]&&window.STORIES.some(s=>s.id===save.storyId)&&save.phase!=="setup"){
        show("resumeBtn",true);
      }
    }catch(e){localStorage.removeItem(KEY);}
    render();
  }
  function resume(raw,autoplay){
    try{
      const save=JSON.parse(raw);
      if(!window.ROLE_BY_ID[save.roleId]||!window.STORIES.some(s=>s.id===save.storyId))return;
      game={...fresh(),...save};
      if(!["intro","night","dawn","day","vote","end"].includes(game.phase))throw Error("Phase invalide");
      $("history").replaceChildren();
      log("Partie reprise : "+story().title+" · "+role().name);
      enter(autoplay);
    }catch(e){localStorage.removeItem(KEY);reset();}
  }
  document.addEventListener("DOMContentLoaded",bind);
})();