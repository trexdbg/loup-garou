/* Tableau de bord du MJ : aucune action de jeu n'est exécutée dans le navigateur.
   Les boutons préparent des demandes pour ChatGPT ; seuls les commits GitHub valident l'état. */
(() => {
  "use strict";
  const make = (tag, text, cls) => {
    const node = document.createElement(tag);
    if (text !== undefined && text !== null) node.textContent = text;
    if (cls) node.className = cls;
    return node;
  };
  const phaseSteps = ["Préparation", "Débats", "Nuit", "Réveil", "Vote"];
  const phaseIndex = state => {
    if (state.phase === "nuit") return 2;
    if (["jour", "village_se_reveille"].includes(state.phase)) return 3;
    if (["vote", "vote_ou_resolution"].includes(state.phase)) return 4;
    if (state.phase === "tour_de_table" || state.phase === "dialogues_et_enquete") return 1;
    return 0;
  };
  function guideFor(state) {
    const phase = state.phase || "prologue";
    const night = state.nuit_en_cours || {};
    if (phase === "nuit") {
      const stage = night.etape || "endormissement";
      const scripts = {
        endormissement: ["Poursuivre la nuit", "Le MJ a lancé la nuit : enchaîne les pouvoirs PNJ sans choix humain, dans le bon ordre ; arrête-toi au prochain choix d’Alex ou arbitrage MJ. Ne résous pas de victime par anticipation."],
        appel_voyante: ["Voyante puis Loups", "Si la Voyante est PNJ, fais-la choisir elle-même sa carte, conserve l’observation dans secrets_mj.json, puis appelle les Loups dans le même échange. Stoppe au choix d’Alex si Alex doit agir."],
        appel_sorciere: ["Faire agir la Sorcière", "Fais agir la Sorcière selon le rôle réellement attribué et sa personnalité. Si elle est PNJ, décide de ses potions sans interroger le MJ pour chaque détail ; archive les effets secrets sans réveiller le village ni résoudre de nouvelle élimination non validée."],
        sorciere_rendormie: ["Réveiller le village", "Le MJ autorise le réveil. Calcule les survivants avec les décisions de la nuit, crée la scène du matin et passe au jour suivant sans ouvrir de vote."]
      };
      const data = scripts[stage] || ["Continuer la nuit", "Propose uniquement la prochaine action nocturne légale, sans inventer de choix de joueur ni déclencher de réveil."];
      return {title:data[0],instructions:data[1],subtitle:"Nuit " + (state.progression?.nuit || night.numero || 1) + " · " + stage.replaceAll("_"," "),key:stage};
    }
    if (phase === "tour_de_table") {
      if (state.tour_de_table?.statut === "termine")
        return {title:"Choisir la transition",subtitle:"Débats terminés",key:"fin_debat",instructions:"Le tour de table est terminé. Propose la transition choisie par le MJ (vote ou endormissement). Ne crée aucune scène ni nouvelle phase sans mon accord explicite."};
      return {title:"Animer les débats",subtitle:"Tour de table en cours",key:"debats",instructions:"Fais réagir les PNJ entre eux et au joueur Alex selon leur caractère. Alex conserve toutes ses répliques et décisions. Ne termine pas le débat et n'ouvre aucun vote sans mon accord."};
    }
    if (phase === "jour" || phase === "village_se_reveille") {
      return {title:"Faire parler le village",subtitle:"Jour " + (state.progression?.jour || 1) + " · discussions",key:"jour",instructions:"Poursuis les échanges du matin. Respecte les survivants, les événements archivés et les rôles secrets. Le MJ décidera quand demander un vote ; ne le lance pas maintenant."};
    }
    if (phase === "vote" || phase === "vote_ou_resolution")
      return {title:"Recueillir les votes",subtitle:"Vote en cours",key:"vote",instructions:"Fais voter en un seul lot tous les PNJ vivants selon leurs soupçons et caractères. Demande uniquement le choix d’Alex s’il doit voter ; présente le dépouillement au MJ. Ne résous aucune élimination avant la validation du verdict."};
    return {title:"Lancer le prologue",subtitle:"Partie en préparation",key:"preparation",instructions:"Vérifie les personnages, la répartition secrète et le placement des LEGO ; propose uniquement le prologue. Attends l'accord du MJ avant le tour de table."};
  }
  function promptFor(id, state, action="next", note="") {
    const guide = guideFor(state);
    const start = "MODE MAÎTRE DU JEU — Partie Loup-Garou " + id + ".\n" +
      "Lis l’état utile de la partie sur GitHub trexdbg/loup-garou (partie.json, secrets_mj.json et fin du journal/dialogues) ; évite les relectures intégrales inutiles.\n" +
      "Tu incarnes les PNJ et décides leurs actions ; Alex reste seul maître de ses actes. " +
      "L'application est exclusivement une régie MJ. Ne publie jamais de secret dans les scènes publiques.\n";
    let task = guide.instructions;
    if (action === "resume") task = "Vérifie précisément l'état déjà enregistré, rappelle au MJ la dernière scène et propose uniquement la prochaine action adaptée. Ne modifie rien sans une nouvelle décision validée.";
    if (action === "sync") task = "Vérifie si les dernières scènes et décisions validées dans cette conversation sont bien sur la branche main de GitHub. Synchronise uniquement les événements validés, vérifie les fichiers et le déploiement. Si l'écriture échoue, indique-le sans prétendre avoir poussé.";
    if (action === "dialogue") task = "Alex intervient librement : " + (note || "(le MJ ajoutera ses paroles)") + ". Fais réagir 2 à 4 PNJ pertinents avec des répliques courtes, sans inventer sa réponse ; regroupe les dialogues joués en une seule scène et un seul commit, sans changer de phase.";
    return start + "\nÉtat annoncé : phase=" + (state.phase || "prologue") +
      ", scène=" + (state.scene_courante_id || state.progression?.scene || "?") +
      ", nuit=" + (state.progression?.nuit ?? 0) + ", jour=" + (state.progression?.jour ?? 0) + ".\n" +
      "\nACTION DEMANDÉE : " + task +
      "\n\nMODE RAPIDE : applique directement l’action explicitement validée par le MJ, résous ses conséquences déterministes, fais agir les PNJ autonomes, puis archive le lot en UN SEUL commit GitHub. Ne demande pas une nouvelle validation pour la même action. " +
      "Stoppe avant tout vote, élimination, pouvoir d’Alex ou changement de phase non autorisé. Après une élimination validée, vérifie immédiatement la victoire. Journal bref ; index modifié seulement si phase/statut change. Audio : 2 à 5 répliques PNJ utiles par scène, jamais les secrets. Signale clairement un échec de synchronisation.";
  }
  function attach(id,state,mount) {
    mount.replaceChildren();
    const guide=guideFor(state);
    const main=make("section",null,"mj-control-room");
    const head=make("div",null,"mj-control-top");
    const label=make("div");
    label.append(make("p","RÉGIE PRIVÉE · MAÎTRE DU JEU","mj-overline"),make("h2","Piloter la partie"));
    head.append(label,make("span","MJ uniquement","mj-only-stamp"));
    main.append(head);
    main.append(make("p","Le joueur joue autour de la table. Cet écran est votre poste de commande : rien n'est joué automatiquement.","mj-control-intro"));
    const roster=[state.joueur?.prenom,...(state.personnages_pnj||[]).map(x=>typeof x==="string"?x:x.prenom)].filter(Boolean);
    const withdrawn=state.placement_table?.retire||[];
    const alive=roster.length-withdrawn.filter(x=>roster.includes(x)).length;
    const stats=make("div",null,"mj-control-stats");
    const displays=[
      ["PHASE",state.phase==="nuit"?"🌙 Nuit "+(state.progression?.nuit||1):state.phase==="jour"?"☀️ Jour "+(state.progression?.jour||1):state.phase==="tour_de_table"?"💬 Débats":state.phase||"Préparation"],
      ["À LA TABLE",alive+"/"+roster.length+" habitants"],
      ["DERNIÈRE SCÈNE",state.scene_courante_id?state.scene_courante_id.replaceAll("_"," "):"À préparer"]
    ];
    for(const [label,value] of displays){const box=make("div",null,"mj-stat");box.append(make("small",label),make("strong",value));stats.append(box);}
    main.append(stats);
    const stepper=make("ol",null,"mj-phase-stepper");
    const current=phaseIndex(state);
    phaseSteps.forEach((step,i)=>{const li=make("li",step,i===current?"is-current":i<current?"is-past":"");if(i===current)li.setAttribute("aria-current","step");stepper.append(li);});
    main.append(stepper);
    const action=make("div",null,"mj-action-focus");
    action.append(make("p",guide.subtitle,"mj-action-subtitle"),make("h3",guide.title),make("p",guide.instructions,"mj-next-help"));
    const actions=make("div",null,"mj-action-buttons");
    const next=make("button","📋 Copier la prochaine consigne","primary");
    const sync=make("button","↻ Vérifier GitHub (si besoin)","secondary");
    const resume=make("button","📖 Reprendre l'état","ghost");
    const audio=make("button","▶ Régie audio","ghost");
    for(const button of [next,sync,resume,audio])button.type="button";
    actions.append(next,sync,resume,audio);action.append(actions);
    const status=make("p","Mode rapide : chaque scène validée se synchronise en une fois ; vérification manuelle seulement si nécessaire.","mj-copy-status");
    status.setAttribute("role","status");action.append(status);
    const fallback=make("textarea",null,"mj-copy-fallback");fallback.hidden=true;fallback.readOnly=true;fallback.setAttribute("aria-label","Consigne à copier dans ChatGPT");action.append(fallback);
    const copy=async(value)=>{
      try {await navigator.clipboard.writeText(value);fallback.hidden=true;status.textContent="✓ Consigne copiée. Collez-la dans votre conversation ChatGPT."; }
      catch (_) {fallback.value=value;fallback.hidden=false;fallback.focus();fallback.select();status.textContent="Copie automatique indisponible : copiez le texte affiché."; }
    };
    next.addEventListener("click",()=>copy(promptFor(id,state)));
    sync.addEventListener("click",()=>copy(promptFor(id,state,"sync")));
    resume.addEventListener("click",()=>copy(promptFor(id,state,"resume")));
    audio.addEventListener("click",()=>mount.closest("#sessionContent")?.querySelector(".scene-player")?.scrollIntoView({behavior:"smooth",block:"start"}));
    main.append(action);
    if(state.phase==="nuit"){
      const items=[
        ["Voyante","voyante_observation"],
        ["Loups-Garous","loups_choix_victime"],
        ["Sorcière","sorciere_decision"],
        ["Réveil du village","reveil_village"]
      ];
      const done=state.nuit_en_cours?.actions_resolues||[];
      const guideBox=make("section",null,"mj-night-steps");
      guideBox.append(make("h3","Déroulé de cette nuit"));
      const ol=make("ol");
      items.forEach(([name,key])=>{const finished=done.includes(key);const li=make("li", (finished?"✓ ":"○ ")+name,finished?"is-done":"");ol.append(li);});
      guideBox.append(ol,make("p","Les choix secrets et les potions se consultent dans le carnet du MJ. Ne les annoncez pas au village.","fine"));
      main.append(guideBox);
    }
    const notes=make("details",null,"mj-working-notes");
    const nTitle=make("summary","✎ Bloc-notes du MJ (sur cet appareil uniquement)");
    const nLabel=make("label","Soupçons, chronologie et questions à poser");
    const textarea=make("textarea");textarea.rows=4;textarea.placeholder="Ex. : Iris surveille Basile, les habitants n'ont pas voté…";
    textarea.setAttribute("aria-label","Notes de régie privées");
    const storageKey="lg-mj-working-notes:"+id;
    try{textarea.value=sessionStorage.getItem(storageKey)||"";}catch(_){}
    textarea.addEventListener("input",()=>{try{sessionStorage.setItem(storageKey,textarea.value);}catch(_){}});
    const noteButtons=make("div",null,"mj-notes-buttons");
    const copyNotes=make("button","Copier les notes pour ChatGPT","secondary");
    const clear=make("button","Effacer les notes locales","ghost");
    copyNotes.type=clear.type="button";
    copyNotes.addEventListener("click",()=>copy(promptFor(id,state,"dialogue",textarea.value)));
    clear.addEventListener("click",()=>{textarea.value="";try{sessionStorage.removeItem(storageKey);}catch(_){}status.textContent="Notes de la session effacées.";});
    nLabel.append(textarea);noteButtons.append(copyNotes,clear);
    notes.append(nTitle,nLabel,noteButtons,make("p","Stockage de session dans ce navigateur, non synchronisé sur GitHub. Les notes ne sont envoyées à ChatGPT que lorsque vous copiez la consigne.","fine"));
    main.append(notes);
    const final=make("p","⚑ Un accord explicite du MJ suffit pour l’action annoncée. Les autres éliminations, votes et transitions restent bloqués.","mj-stop-rule");
    main.append(final);mount.append(main);
  }
  window.LG_MJ_CONSOLE={attach,guideFor,promptFor};
})();