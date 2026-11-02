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
        endormissement: ["Appeler la Voyante", "Annonce le réveil de la Voyante. Attends le choix de sa carte et l'accord du MJ, sans appeler les Loups automatiquement."],
        appel_voyante: ["Terminer l'action de la Voyante", "Fais choisir une carte à la Voyante PNJ selon son caractère. Archive son observation uniquement dans secrets_mj.json, fais-la se rendormir puis appelle les Loups. Attends la décision du joueur Alex."],
        appel_sorciere: ["Faire agir la Sorcière", "Incarne Rose, PNJ Sorcière. Après la victime désignée, fais-la décider elle-même de ses potions selon son caractère. Consigne les effets dans secrets_mj.json ; ne réveille pas le village."],
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
      return {title:"Arbitrer le vote",subtitle:"Vote en cours",key:"vote",instructions:"Aide le MJ à recueillir les votes en respectant les règles et l'état des habitants. N'élimine personne et ne passe pas à la nuit sans validation du résultat par le MJ."};
    return {title:"Lancer le prologue",subtitle:"Partie en préparation",key:"preparation",instructions:"Vérifie les personnages, la répartition secrète et le placement des LEGO ; propose uniquement le prologue. Attends l'accord du MJ avant le tour de table."};
  }
  function promptFor(id, state, action="next", note="") {
    const guide = guideFor(state);
    const start = "MODE MAÎTRE DU JEU — Partie Loup-Garou " + id + ".\n" +
      "Relis sur GitHub trexdbg/loup-garou : partie.json, dialogues.ndjson, journal.md, secrets_mj.json.\n" +
      "Tu incarnes les PNJ et décides leurs actions ; Alex reste seul maître de ses actes. " +
      "L'application est exclusivement une régie MJ. Ne publie jamais de secret dans les scènes publiques.\n";
    let task = guide.instructions;
    if (action === "resume") task = "Vérifie précisément l'état déjà enregistré, rappelle au MJ la dernière scène et propose uniquement la prochaine action adaptée. Ne modifie rien sans une nouvelle décision validée.";
    if (action === "sync") task = "Vérifie si les dernières scènes et décisions validées dans cette conversation sont bien sur la branche main de GitHub. Synchronise uniquement les événements validés, vérifie les fichiers et le déploiement. Si l'écriture échoue, indique-le sans prétendre avoir poussé.";
    if (action === "dialogue") task = "Laisse Alex intervenir librement. Voici ses mots ou intentions : " + (note || "(le MJ ajoutera les paroles d'Alex)") + ". Fais réagir les PNJ et archive cette nouvelle scène sans passer à une autre phase.";
    return start + "\nÉtat annoncé : phase=" + (state.phase || "prologue") +
      ", scène=" + (state.scene_courante_id || state.progression?.scene || "?") +
      ", nuit=" + (state.progression?.nuit ?? 0) + ", jour=" + (state.progression?.jour ?? 0) + ".\n" +
      "\nACTION DEMANDÉE : " + task +
      "\n\nRègles de régie : aucun vote, élimination, changement de phase, pouvoir du joueur ou annonce du matin sans validation explicite du MJ. " +
      "Conserve les rôles et décisions secrets dans secrets_mj.json. Après écriture, confirme le commit exact.";
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
    const sync=make("button","↻ Synchroniser GitHub","secondary");
    const resume=make("button","📖 Reprendre l'état","ghost");
    const audio=make("button","▶ Régie audio","ghost");
    for(const button of [next,sync,resume,audio])button.type="button";
    actions.append(next,sync,resume,audio);action.append(actions);
    const status=make("p","Ces boutons préparent une consigne pour ChatGPT ; ils ne modifient pas GitHub.","mj-copy-status");
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
    const final=make("p","⚑ Point de contrôle : seule une validation du MJ dans ChatGPT peut changer la phase ou archiver une nouvelle décision.","mj-stop-rule");
    main.append(final);mount.append(main);
  }
  window.LG_MJ_CONSOLE={attach,guideFor,promptFor};
})();