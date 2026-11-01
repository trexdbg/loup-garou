/* Audio interactif léger : Web Audio pour les ambiances/bruitages, Web Speech pour les voix.
   Aucune ressource sonore distante. Les voix disponibles dépendent du navigateur/appareil. */
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const state = { volume:.65, voice:true, ambient:true, sfx:true, selectedVoice:"", audioFiles:false, scene:"", speaking:false };
  let ctx, master, bed=[], interval=null, noiseBuffer=null, voices=[], fileBed=null;
  const status=(message)=>{if($("audioStatus")) $("audioStatus").textContent=message;};
  const speechState=(message)=>{if($("speechState")) $("speechState").textContent=message;};
  const supported=!!(window.AudioContext||window.webkitAudioContext);
  function init(){
    if(!supported){status("Web Audio non pris en charge.");return false;}
    if(!ctx){
      const C=window.AudioContext||window.webkitAudioContext;
      ctx=new C();master=ctx.createGain();master.gain.value=state.volume;master.connect(ctx.destination);
    }
    if(ctx.state==="suspended")ctx.resume().catch(()=>{});
    return true;
  }
  function setVolume(value){
    state.volume=Math.max(0,Math.min(1,Number(value)));
    if(master&&ctx)master.gain.setTargetAtTime(state.volume,ctx.currentTime,.03);
    if(fileBed)fileBed.volume=state.volume*.45;
    if(state.speaking && window.speechSynthesis) { /* prochain texte appliquera le volume */ }
  }
  function noise(){
    if(noiseBuffer)return noiseBuffer;
    const rate=ctx.sampleRate,length=Math.floor(rate*2);
    noiseBuffer=ctx.createBuffer(1,length,rate);
    const data=noiseBuffer.getChannelData(0);
    for(let i=0;i<length;i++)data[i]=Math.random()*2-1;
    return noiseBuffer;
  }
  function connectNode(node,out=master){node.connect(out);return node;}
  function sine(freq,duration=.4,level=.15,wave="sine",at=0,toFreq=null){
    if(!init())return;
    const now=ctx.currentTime+at,osc=ctx.createOscillator(),amp=ctx.createGain();
    osc.type=wave;osc.frequency.setValueAtTime(Math.max(10,freq),now);
    if(toFreq)osc.frequency.exponentialRampToValueAtTime(Math.max(10,toFreq),now+duration);
    amp.gain.setValueAtTime(.0001,now);
    amp.gain.exponentialRampToValueAtTime(Math.max(.0002,level),now+Math.min(.04,duration/5));
    amp.gain.exponentialRampToValueAtTime(.0001,now+duration);
    osc.connect(amp);connectNode(amp);osc.start(now);osc.stop(now+duration+.03);
    return osc;
  }
  function burst(at=.0,seconds=.22,vol=.08,lowpass=1000){
    if(!init())return;
    const now=ctx.currentTime+at,source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();
    source.buffer=noise();filter.type="lowpass";filter.frequency.value=lowpass;
    gain.gain.setValueAtTime(.0001,now);
    gain.gain.exponentialRampToValueAtTime(Math.max(.0002,vol),now+.02);
    gain.gain.exponentialRampToValueAtTime(.0001,now+seconds);
    source.connect(filter);filter.connect(gain);connectNode(gain);source.start(now);source.stop(now+seconds+.03);
  }
  const sfx={
    wolf(){sine(250,1.5,.085,"sawtooth",0,430);sine(360,1.6,.06,"triangle",.35,180);burst(.12,1.15,.013,600);},
    bell(){[0,.17,.35].forEach((at)=>{sine(610,.9,.11,"sine",at);sine(910,1.3,.045,"sine",at);sine(1518,.6,.018,"sine",at);});},
    door(){burst(0,.6,.12,550);sine(360,.6,.08,"sawtooth",.08,105);burst(.55,.26,.16,1200);},
    steps(){for(let i=0;i<5;i++)burst(i*.34,.12,.09,480);},
    dawn(){[0,.2,.5,.72,1.1].forEach((t,i)=>sine(920+i*115,.19,.05,"sine",t,1450+i*100));},
    night(){sine(165,.55,.07,"sine");sine(132,.9,.04,"triangle",.1);},
    reveal(){[392,523,659,784].forEach((f,i)=>sine(f,.92,.064,"sine",i*.14));},
    heartbeat(){[0,.25,1.15,1.40].forEach(t=>{sine(65,.15,.24,"sine",t,42);burst(t,.14,.038,130);});},
    vote(){sine(210,.25,.08,"triangle");sine(185,.35,.09,"triangle",.28);},
    clue(){sine(740,.22,.045,"sine");sine(990,.25,.05,"sine",.16);}
  };
  function effect(name){
    if(!state.sfx||!sfx[name])return;
    if(state.audioFiles){
      const file=new Audio("assets/audio/"+name+".mp3");
      file.volume=state.volume;
      let didFallback=false;
      const fallback=()=>{if(!didFallback){didFallback=true;sfx[name]();}};
      file.addEventListener("error",fallback,{once:true});
      file.play().catch(fallback);
    }else sfx[name]();
    status("Bruitage : "+name);
  }
  function endBed(){
    if(interval){clearInterval(interval);interval=null;}
    if(fileBed){fileBed.pause();fileBed.currentTime=0;fileBed=null;}
    if(!ctx){bed=[];return;}
    const t=ctx.currentTime;
    for(const track of bed){
      try{track.gain.gain.cancelScheduledValues(t);track.gain.gain.setTargetAtTime(.0001,t,.18);setTimeout(()=>{try{track.source.stop();}catch(e){}},1200);}catch(e){}
    }
    bed=[];
  }
  function drone(kind){
    if(!init())return;
    const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();
    source.buffer=noise();source.loop=true;
    filter.type="lowpass";filter.frequency.value=kind==="night"?240:kind==="rain"?1800:650;
    gain.gain.value=.0001;
    gain.gain.setTargetAtTime(kind==="night"?.075:kind==="rain"?.13:.045,ctx.currentTime,.6);
    source.connect(filter);filter.connect(gain);connectNode(gain);source.start();
    bed.push({source,gain});
  }
  function scene(name){
    state.scene=name;endBed();
    if(!state.ambient || !name)return;
    if(!init())return;
    if(state.audioFiles){
      const track=new Audio("assets/audio/ambient_"+name+".mp3");
      track.loop=true;track.volume=state.volume*.45;fileBed=track;
      let failed=false;
      const fallback=()=>{
        if(failed||fileBed!==track)return;
        failed=true;fileBed=null;drone(name);
      };
      track.addEventListener("error",fallback,{once:true});
      track.play().catch(fallback);
      return;
    }
    drone(name);
    if(name==="night"||name==="forest"){
      interval=setInterval(()=>{if(ctx?.state==="running")sine(1700,.09,.012,"sine",0,1200);},3700);
    } else if(name==="day"||name==="dawn"){
      interval=setInterval(()=>{if(ctx?.state==="running"){sine(1130,.15,.025,"sine",0,1540);sine(1370,.11,.018,"sine",.22,950);}},5100);
    }
  }
  function refreshVoices(){
    if(!("speechSynthesis" in window)) {status("Synthèse vocale indisponible : narration écrite maintenue.");return;}
    voices=window.speechSynthesis.getVoices().filter(v=>/^fr([-_]|$)/i.test(v.lang||""));
    const select=$("voiceSelect");if(!select)return;
    const old=select.value||state.selectedVoice;
    select.replaceChildren();
    const basic=document.createElement("option");basic.value="";basic.textContent="Français automatique";select.append(basic);
    voices.forEach((v)=>{const o=document.createElement("option");o.value=v.name;o.textContent=v.name+(v.localService?" · locale":"");select.append(o);});
    if(voices.some(v=>v.name===old))select.value=old;
  }
  function stopVoice(){if("speechSynthesis" in window)window.speechSynthesis.cancel();state.speaking=false;speechState("Prêt");}
  function speak(text,speaker="Narrateur"){
    stopVoice();
    if(!state.voice||!("speechSynthesis" in window)||!text)return;
    const utter=new SpeechSynthesisUtterance(String(text).replace(/\s+/g," ").slice(0,2700));
    utter.lang="fr-FR";utter.volume=state.volume;
    const narrator=speaker==="Narrateur",hash=[...speaker].reduce((acc,ch)=>acc+ch.charCodeAt(0),0);
    const preferred=voices.find(v=>v.name===state.selectedVoice);
    utter.voice=narrator?(preferred||voices[0]||null):(voices.length?voices[hash%voices.length]:null);
    utter.pitch=narrator?.86:Math.max(.75,Math.min(1.3,.84+(hash%7)*.077));
    utter.rate=narrator?.88:.91+(hash%5)*.03;
    utter.onstart=()=>{state.speaking=true;speechState("🎙 "+speaker);};
    utter.onend=()=>{state.speaking=false;speechState("Prêt");};
    utter.onerror=()=>{state.speaking=false;speechState("Voix indisponible");};
    window.speechSynthesis.speak(utter);
  }
  function stop(){stopVoice();endBed();state.scene="";status("Lecture arrêtée. L'aventure continue.");}
  function bind(){
    const prefs=JSON.parse(localStorage.getItem("thiercelieux.audio")||"{}");
    if(typeof prefs.volume==="number")state.volume=prefs.volume;
    for(const key of ["voice","ambient","sfx"])if(typeof prefs[key]==="boolean")state[key]=prefs[key];
    if(typeof prefs.selectedVoice==="string")state.selectedVoice=prefs.selectedVoice;
    if(typeof prefs.audioFiles==="boolean")state.audioFiles=prefs.audioFiles;
    $("filesToggle").checked=state.audioFiles;
    $("volumeInput").value=Math.round(state.volume*100);
    const controls={voice:"voiceToggle",ambient:"ambientToggle",sfx:"sfxToggle"};
    Object.entries(controls).forEach(([key,id])=>{$(id).checked=state[key];$(id).addEventListener("change",(e)=>{
      state[key]=e.target.checked;save();if(key==="ambient"){if(state.ambient)scene(state.scene||"night");else endBed();}
      if(key==="voice"&&!state.voice)stopVoice();
    });});
    $("filesToggle").addEventListener("change",e=>{state.audioFiles=e.target.checked;save();if(state.scene)scene(state.scene);});
    $("volumeInput").addEventListener("input",(e)=>{setVolume(Number(e.target.value)/100);save();});
    $("voiceSelect").addEventListener("change",e=>{state.selectedVoice=e.target.value;save();});
    $("testVoiceBtn").addEventListener("click",()=>{init();speak("Bonsoir. Le village s'endort. Au loin, un loup hurle.", "Narrateur");});
    $("stopAudioBtn").addEventListener("click",stop);
    document.querySelectorAll("[data-sound]").forEach(btn=>btn.addEventListener("click",()=>{
      init();const sound=btn.dataset.sound;
      if(sound==="night"){scene("night");effect("night");} else if(sound==="dawn"){scene("day");effect("dawn");}
      else effect(sound);
    }));
    if("speechSynthesis" in window){
      refreshVoices();
      window.speechSynthesis.addEventListener?.("voiceschanged",refreshVoices);
    }
  }
  function save(){localStorage.setItem("thiercelieux.audio",JSON.stringify({volume:state.volume,voice:state.voice,ambient:state.ambient,sfx:state.sfx,selectedVoice:state.selectedVoice,audioFiles:state.audioFiles}));}
  document.addEventListener("DOMContentLoaded",bind);
  window.SOUND={init,scene,effect,speak,stop,stopVoice,setVolume,state};
})();