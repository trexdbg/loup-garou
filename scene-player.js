/* Lecteur manuel : une scène = un lot de dialogues publics, sans lecture automatique. */
(() => {
 "use strict";
 const ROOT="https://raw.githubusercontent.com/trexdbg/loup-garou/main/";
 const CAST=["Rose","Hugo","Salomé","Marin","Inès","Baptiste","Jade"];
 const PROFILES={
  Narrateur:[0.95,0.96],Rose:[1.15,0.95],Hugo:[0.88,1.07],
  "Salomé":[1.03,1.01],Marin:[0.83,0.95],"Inès":[1.10,0.93],
  Baptiste:[0.96,1.09],Jade:[1.20,1.05]
 };
 const TYPES=new Set(["narration","narration_publique","dialogue_pnj","dialogue","replique","dialogue_joueur"]);
 let active=null;
 const synth=window.speechSynthesis, Speech=window.SpeechSynthesisUtterance;
 const hasSpeech=!!(synth&&Speech);
 const AudioCtx=window.AudioContext||window.webkitAudioContext;
 function parseLines(raw){
  const lines=new Map();
  for(const text of String(raw||"").split(/\r?\n/)){
   if(!text.trim())continue;
   try{
    const x=JSON.parse(text);
    if(x.public!==true||!TYPES.has(x.type)||!Number.isSafeInteger(x.seq)||x.seq<1||typeof x.texte!=="string"||!x.texte.trim())continue;
    lines.set(x.seq,{seq:x.seq,type:x.type,texte:x.texte.trim().slice(0,2500),
     locuteur:String(x.locuteur||"Narrateur").slice(0,60),
     scene_id:typeof x.scene_id==="string"&&/^[\w-]{1,80}$/.test(x.scene_id)?x.scene_id:"archive",
     scene_label:typeof x.scene_label==="string"?x.scene_label.slice(0,90):""});
   }catch(_){}
  }
  return [...lines.values()].sort((a,b)=>a.seq-b.seq);
 }
 function sceneName(id){
  if(id==="prologue")return "Le prologue";
  if(id==="archive")return "Archives précédentes";
  if(/^tour_de_table_\d+$/.test(id))return "Tour de table · "+Number(id.split("_").at(-1));
  return id.replace(/[_-]/g," ");
 }
 function groupScenes(rows){
  const scenes=[],index=new Map();
  for(const row of rows){
   if(!index.has(row.scene_id)){
    index.set(row.scene_id,scenes.length);
    scenes.push({id:row.scene_id,label:row.scene_label||sceneName(row.scene_id),rows:[]});
   }
   scenes[index.get(row.scene_id)].rows.push(row);
  }
  return scenes;
 }
 function frenchVoices(){
  if(!hasSpeech)return [];
  return synth.getVoices().filter(x=>/^fr([-_]|$)/i.test(x.lang||""))
   .sort((a,b)=>/neural|natural|premium/i.test(b.name||"")- /neural|natural|premium/i.test(a.name||"") || (a.name||"").localeCompare(b.name||""));
 }
 function voiceFor(name,cast=CAST){
  const voices=frenchVoices();
  if(!voices.length)return null;
  const i=name==="Narrateur"?voices.length-1:cast.indexOf(name);
  const hash=[...String(name)].reduce((n,c)=>(31*n+c.charCodeAt(0))>>>0,17);
  return voices[(i<0?hash:i)%voices.length];
 }
 function add(to,tag,text,klass){
  const el=document.createElement(tag);
  if(text!==undefined&&text!==null)el.textContent=text;
  if(klass)el.className=klass;
  to.append(el);return el;
 }
 function attach(id,mount,party={}){
  stop();
  const cast=(party.personnages_pnj||[]).map(x=>typeof x==="string"?x:x.prenom).filter(Boolean);
  const savedKey="lg-scene-played:"+id, heard=new Set();
  try{for(const key of JSON.parse(sessionStorage.getItem(savedKey)||"[]"))heard.add(key);}catch(_){}
  const state={closed:false,playing:false,generation:0,scenes:[],selected:"",context:null,handle:null,loading:false,index:-1,audio:{},audioCount:0,audioStats:null};
  const box=add(mount,"section",null,"scene-player");
  add(box,"p","01 / LES DIALOGUES","scene-kicker");
  add(box,"h3","🎧 Écouter la scène");
  add(box,"p","Après actualisation, lance les répliques une par une dans l'ordre. Quand la scène se termine, Alex peut répondre librement.","scene-help");
  const head=add(box,"div",null,"scene-controls");
  const selectLabel=add(head,"label","Scène à écouter");
  const sceneSelect=add(selectLabel,"select");
  sceneSelect.setAttribute("aria-label","Scène audio");
  const refreshButton=add(head,"button","↻ Actualiser","secondary");refreshButton.type="button";
  const settings=add(box,"div",null,"scene-controls");
  const modeLabel=add(settings,"label","Synthèse vocale");
  const mode=add(modeLabel,"select");
  mode.append(new Option("✨ Gemini · voix des personnages","gemini"));
  mode.append(new Option("Voix françaises de l'appareil","native"));
  mode.append(new Option("Voix Piper gratuites (2 timbres)","piper"));
  const voiceNote=add(settings,"p","", "fine");
  const buttons=add(box,"div",null,"scene-buttons");
  const playButton=add(buttons,"button","▶ Écouter","primary");
  const stopButton=add(buttons,"button","■ Arrêter","secondary");
  const replayButton=add(buttons,"button","↺ Réécouter","ghost");
  [playButton,stopButton,replayButton].forEach(b=>b.type="button");
  const status=add(box,"p","Chargement...","scene-status");
  status.setAttribute("role","status");status.setAttribute("aria-live","polite");
  const transcript=add(box,"ol",null,"scene-transcript");
  const following=add(box,"div",null,"scene-followup");
  add(following,"strong","Après l'écoute : Alex reprend la parole.");
  add(following,"p","Les nouveaux échanges seront générés par ChatGPT et archivés dans une nouvelle scène. Le MJ décidera quand terminer ce tour de table.");
  const copyButton=add(following,"button","📋 Copier pour continuer dans ChatGPT","secondary");copyButton.type="button";
  const endRoundButton=add(following,"button","✓ Proposer la fin du tour","ghost");endRoundButton.type="button";
  const copied=add(following,"p","", "fine");
  function announce(text){if(!state.closed)status.textContent=text;}
  function details(){
   if(mode.value==="gemini"){
    const selected=state.scenes.find(s=>s.id===state.selected);
    const eligible=(selected?.rows||[]).filter(s=>s.type!=="dialogue_joueur");
    const ready=eligible.filter(line=>{
      const clip=state.audio[String(line.seq)];
      return clip&&clip.locuteur===line.locuteur&&clip.texte===line.texte&&
        /^audio\/[a-f0-9]{20}\.mp3$/.test(clip.file);
    }).length;
    const missing=eligible.length-ready;
    voiceNote.textContent=eligible.length
      ? ready+"/"+eligible.length+" répliques Gemini disponibles pour cette scène"+
        (missing?" · "+missing+" manquante"+(missing>1?"s":"")+" (voix locales en secours).":" · scène entièrement générée.")
      : "Aucune réplique vocale pour cette scène.";
    if(missing && state.audioStats?.quota_exhausted)
      voiceNote.textContent+=" Quota Gemini atteint lors de la dernière génération.";
    return;
   }
   const n=frenchVoices().length;
   const count=cast.length||CAST.length;
   voiceNote.textContent=n>=count? n+" voix françaises disponibles : "+count+" voix distinctes pour les habitants.":
    n? n+" voix françaises disponibles : certaines voix seront partagées, avec une intonation différente.":
    "Les voix disponibles dépendent du navigateur. Sans voix française détectée, le système utilisera la voix par défaut.";
   if(mode.value==="piper")voiceNote.textContent+=" Piper est gratuit mais utilise deux timbres de base et télécharge ses modèles au premier lancement.";
  }
  function shutdown(){
   state.generation++;state.playing=false;state.index=-1;
   if(state.handle){try{state.handle.stop();}catch(_){}state.handle=null;}
   if(hasSpeech)synth.cancel();
   stopButton.disabled=true;
   playButton.disabled=!state.scenes.length;
   for(const li of transcript.children)li.classList.remove("scene-speaking");
  }
  function paint(){
   transcript.replaceChildren();
   const scene=state.scenes.find(s=>s.id===state.selected);
   if(!scene){announce("Pas encore de scène audio.");playButton.disabled=true;replayButton.disabled=true;return;}
   playButton.disabled=false;replayButton.disabled=false;
   for(const line of scene.rows){
    const li=add(transcript,"li",null,"scene-line");
    li.dataset.seq=String(line.seq);
    if(line.type==="dialogue_joueur")li.classList.add("scene-player-line");
    if(line.type.startsWith("narration"))li.classList.add("scene-narrator-line");
    add(li,"strong",line.locuteur);add(li,"span",line.texte);
   }
   announce((heard.has(scene.id)?"✓ Déjà écoutée":"Prête à écouter")+" · "+scene.rows.length+" interventions");
  }
  function populate(preferred){
   sceneSelect.replaceChildren();
   for(const scene of state.scenes)sceneSelect.add(new Option((heard.has(scene.id)?"✓ ":"● ")+scene.label,scene.id));
   state.selected=state.scenes.some(s=>s.id===preferred)?preferred:state.scenes.at(-1)?.id||"";
   sceneSelect.value=state.selected;paint();
  }
  function finished(){
   const scene=state.scenes.find(s=>s.id===state.selected);
   shutdown();
   if(scene){heard.add(scene.id);try{sessionStorage.setItem(savedKey,JSON.stringify([...heard]));}catch(_){}populate(scene.id);}
   announce("✓ Scène terminée. Alex peut poser une question ou répondre.");
  }
  function advance(token,rows){
   if(state.closed||!state.playing||token!==state.generation)return;
   state.index++;
   if(state.index>=rows.length){finished();return;}
   const line=rows[state.index];
   for(const li of transcript.children)li.classList.toggle("scene-speaking",li.dataset.seq===String(line.seq));
   // Le joueur joue sa propre voix autour de la table.
   if(line.type==="dialogue_joueur"){advance(token,rows);return;}
   const browserSpeech=(geminiUnavailable=false)=>{
    if(!hasSpeech){shutdown();announce("Synthèse vocale indisponible sur cet appareil.");return;}
    const u=new Speech(line.texte), profile=PROFILES[line.locuteur]||[1,1];
    u.lang="fr-FR";u.voice=voiceFor(line.locuteur,cast.length?cast:CAST);
    u.pitch=profile[0];u.rate=profile[1];u.volume=1;
    u.onend=()=>advance(token,rows);
    u.onerror=()=>{if(token!==state.generation)return;shutdown();announce("Lecture interrompue : essaie une autre voix.");};
    announce((geminiUnavailable?"⚠ Voix locale (Gemini indisponible) · ":"🔊 Voix locale · ")+line.locuteur+" · "+(state.index+1)+"/"+rows.length);
    try{synth.speak(u);}catch(_){u.onerror();}
   };
   if(mode.value==="gemini"){
    const clip=state.audio[String(line.seq)];
    if(clip && clip.locuteur===line.locuteur && clip.texte===line.texte &&
       /^audio\/[a-f0-9]{20}\.mp3$/.test(clip.file)){
     const audio=new Audio("./parties/"+encodeURIComponent(id)+"/"+clip.file);
     audio.preload="auto";
     audio.onended=()=>{if(token===state.generation){state.handle=null;advance(token,rows);}};
     audio.onerror=()=>{if(token===state.generation){state.handle=null;browserSpeech(true);}};
     state.handle={stop:()=>{audio.onended=null;audio.onerror=null;audio.pause();audio.removeAttribute("src");audio.load();}};
     announce("✨ Voix Gemini · "+line.locuteur+" · "+(state.index+1)+"/"+rows.length);
     audio.play().catch(()=>{if(token===state.generation){state.handle=null;browserSpeech(true);}});
     return;
    }
    browserSpeech(true);return;
   }
   if(mode.value==="piper"&&state.context&&window.LG_PIPER?.supported()){
    announce("✨ "+line.locuteur+" · préparation de la voix Piper...");
    window.LG_PIPER.synthesize(line.texte,line.locuteur).then(blob=>{
     if(state.closed||token!==state.generation)return;
     return window.LG_PIPER.play(blob,line.locuteur,state.context,()=>advance(token,rows),browserSpeech)
      .then(handle=>{if(state.closed||token!==state.generation)handle?.stop();else state.handle=handle;});
    }).catch(()=>{if(token===state.generation)browserSpeech();});
   }else browserSpeech();
  }
  function play(){
   shutdown();
   const scene=state.scenes.find(s=>s.id===state.selected);
   if(!scene)return;
   if(mode.value==="piper"&&AudioCtx&&!state.context){try{state.context=new AudioCtx();}catch(_){}}
   if(state.context?.state==="suspended")state.context.resume().catch(()=>{});
   state.playing=true;state.index=-1;playButton.disabled=true;stopButton.disabled=false;
   advance(state.generation,scene.rows);
  }
  async function load(){
   if(state.loading||state.closed)return;
   state.loading=true;refreshButton.disabled=true;announce("Mise à jour des dialogues…");
   const path="parties/"+encodeURIComponent(id)+"/dialogues.ndjson";
   let raw=null;
   for(const origin of [ROOT,"./"]){
    try{
     const res=await fetch(origin+path+"?v="+Date.now(),{cache:"no-store"});
     if(res.ok){raw=await res.text();break;}
    }catch(_){}
   }
   let audio={},audioStats=null;
   try{
    const url="./parties/"+encodeURIComponent(id)+"/audio/manifest.json?v="+Date.now();
    const response=await fetch(url,{cache:"no-store"});
    if(response.ok){
     const manifest=await response.json();
     if(manifest.version===1&&manifest.provider==="gemini"&&manifest.lines &&
        typeof manifest.lines==="object"&&!Array.isArray(manifest.lines)){
         audio=manifest.lines;
         if(manifest.stats&&typeof manifest.stats==="object")audioStats=manifest.stats;
       }
    }
   }catch(_){}
   state.loading=false;refreshButton.disabled=false;
   if(state.closed)return;
   if(raw===null){announce("GitHub indisponible. Réessaie dans un instant.");return;}
   const latest=state.scenes.at(-1)?.id||"";
   shutdown();
   state.scenes=groupScenes(parseLines(raw));
   state.audio=audio;
   state.audioStats=audioStats;
   state.audioCount=Object.keys(audio).length;
   details();
   const incoming=state.scenes.at(-1)?.id||"";
   populate(latest!==incoming?incoming:state.selected);
   details();
  }
  sceneSelect.addEventListener("change",()=>{shutdown();state.selected=sceneSelect.value;paint();details();});
  refreshButton.addEventListener("click",()=>{void load();});
  mode.addEventListener("change",()=>{shutdown();details();});
  playButton.addEventListener("click",play);replayButton.addEventListener("click",play);
  stopButton.addEventListener("click",()=>{shutdown();announce("Lecture arrêtée ; relance la scène au début si nécessaire.");});
  copyButton.addEventListener("click",async()=>{
   const text="Partie LG "+id+". La scène "+state.selected+" est prête ou a été écoutée. Alex intervient à nouveau pendant le tour de table. Je vais indiquer ses paroles. Réponds avec les PNJ sans faire parler Alex à sa place. Après mon accord, archive uniquement le nouvel échange sous un nouvel identifiant scene_id dans dialogues.ndjson. Ne termine pas le tour de table, ne lance pas de vote ou de nuit sans accord explicite du MJ.\n\nAlex : ";
   try{await navigator.clipboard.writeText(text);copied.textContent="Consigne copiée ; colle-la dans notre conversation ChatGPT et ajoute les paroles d'Alex.";}
   catch(_){copied.textContent="Copie indisponible ; retourne dans ChatGPT et indique l'ID "+id+".";}
  });
  endRoundButton.addEventListener("click",async()=>{
   const text="Partie Loup-Garou "+id+". Je souhaite terminer le tour de table après les échanges déjà joués. Relis le journal et les derniers dialogues publics sur GitHub ; propose une courte conclusion des débats sans déclencher automatiquement de vote ou de nuit. Attends mon accord explicite avant de changer de phase, puis archive uniquement les événements validés.";
   try{await navigator.clipboard.writeText(text);copied.textContent="Consigne de fin de tour copiée. Colle-la dans ChatGPT pour validation.";}
   catch(_){copied.textContent="Retourne dans ChatGPT et demande la fin du tour pour "+id+".";}
  });
  const onVoices=()=>{if(!state.closed)details();};
  synth?.addEventListener?.("voiceschanged",onVoices);
  state.close=()=>{if(state.closed)return;shutdown();state.closed=true;synth?.removeEventListener?.("voiceschanged",onVoices);state.context?.close().catch(()=>{});};
  active=state;stopButton.disabled=true;playButton.disabled=replayButton.disabled=true;
  details();void load();return state;
 }
 function stop(){if(active){active.close();active=null;}}
 window.LG_SCENES={attach,stop,parseLines,groupScenes,voiceFor};
})();
