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
  const humanNames = state => {
    const humans = state.joueurs_humains || state.participants?.joueurs_humains;
    if (Array.isArray(humans) && humans.length) return [...new Set(humans.map(p => typeof p === "string" ? p : p?.prenom).filter(Boolean))];
    const solo = state.participants?.joueur?.prenom || state.joueur?.prenom;
    return solo ? [solo] : ["Alex"];
  };
  const phaseIndex = state => {
    if (state.phase === "nuit") return 2;
    if (["jour", "village_se_reveille"].includes(state.phase)) return 3;
    if (["vote", "vote_ou_resolution"].includes(state.phase)) return 4;
    if (state.phase === "tour_de_table" || state.phase === "dialogues_et_enquete") return 1;
    return 0;
  };
  function guideForSolo(state) {
    const phase = state.phase || "prologue";
    const night = state.nuit_en_cours || {};
    if (phase === "nuit") return {title:"Résoudre la nuit",subtitle:"Nuit " + (state.progression?.nuit || night.numero || 1) + " · automatique",key:"nuit_auto",instructions:"Enchaîne TOUTE la nuit d'un bloc : Voyante, Loups-Garous, Sorcière et autres rôles PNJ vivants agissent dans l'ordre légal selon leur personnalité, leurs connaissances et les débats. Arrête-toi seulement si Alex doit choisir via son rôle. Sinon, résous les effets et annonce immédiatement le réveil, sans validation MJ. Ne fais AUCUN dialogue nocturne, appel GitHub, génération audio ou commit avant la scène publique du réveil ; archive alors en un seul lot."};
    if (phase === "tour_de_table" || phase === "dialogues_et_enquete") return {title:"Une intervention, puis la suite",subtitle:"Débats autonomes",key:"debats_auto",instructions:"Fais 2 à 4 réponses courtes des PNJ après UNE intervention d'Alex. Au jour 1, passe tout de suite à la nuit sans vote. À partir du jour 2, fais voter les PNJ et attends uniquement le vote d'Alex ; ne demande plus la validation MJ pour les transitions."};
    if (phase === "jour" || phase === "village_se_reveille") return {title:"Réveil et débats",subtitle:"Jour " + (state.progression?.jour || 1) + " · automatique",key:"jour_auto",instructions:"Annonce les conséquences et révélations légales de la nuit. Fais débattre brièvement les PNJ, puis attends UNE intervention d'Alex avant de lancer directement les votes PNJ. Si c'est le jour 1, débats de présentation suivis de la nuit 1, sans scrutin."};
    if (phase === "vote" || phase === "vote_ou_resolution") return {title:"Vote et verdict",subtitle:"Vote automatique",key:"vote_auto",instructions:"Fais voter ensemble les PNJ vivants de façon cohérente avec leurs informations et les débats. Demande seulement le vote d'Alex s'il est habilité. Dès son choix, dépouille, élimine selon les règles, déclenche les pouvoirs éventuels, vérifie la victoire et démarre la nuit suivante sans validation MJ. Pause seulement pour un choix d'Alex ou un arbitrage réellement indispensable."};
    return {title:"Lancer le prologue",subtitle:"Partie en préparation",key:"preparation",instructions:"Vérifie les personnages, la répartition secrète et le placement des LEGO ; propose uniquement le prologue. Attends l'accord du MJ avant le tour de table."};
  }
  function guideFor(state) {
    const guide = guideForSolo(state);
    const humans = humanNames(state);
    if (humans.length <= 1) return guide;
    const roster = humans.join(", ");
    const phase = state.phase || "prologue";
    let instructions;
    if (phase === "nuit") {
      instructions = "Résous la nuit dans l'ordre officiel. Les PNJ vivants utilisent leurs pouvoirs selon leurs connaissances et leur personnalité. Arrête-toi pour chaque pouvoir ou décision d'un humain concerné (" + roster + "), sans dévoiler les informations des autres rôles. Reprends après ses choix ; zéro audio ni commit nocturne. Publie un seul commit au réveil.";
    } else if (phase === "vote" || phase === "vote_ou_resolution") {
      instructions = "Fais voter les PNJ vivants d'après leurs soupçons. Demande séparément les votes de TOUS les joueurs humains vivants et habilités (" + roster + ") ; attends toutes les réponses humaines requises avant le dépouillement. Puis applique le verdict, les pouvoirs consécutifs et les conditions de victoire, avant de passer à la nuit suivante.";
    } else if (["jour", "village_se_reveille", "tour_de_table", "dialogues_et_enquete"].includes(phase)) {
      instructions = "Annonce les conséquences de la nuit et les révélations légales, puis fais intervenir brièvement les PNJ. Demande UNE intervention de chacun des humains vivants (" + roster + ") sans jamais les simuler. Au jour 1, enchaîne la nuit sans vote ; à partir du jour 2, prépare les votes PNJ puis recueille séparément les votes de tous les humains vivants habilités.";
    } else {
      instructions = "Propose les rôles et le placement LEGO de tous les humains (" + roster + ") et des PNJ, sans révéler les cartes publiquement. Le MJ valide la distribution et le plan avant le prologue.";
    }
    return {...guide, instructions};
  }
  function promptFor(id, state, action="next", note="") {
    const guide = guideFor(state);
    const humans = humanNames(state), multi = humans.length > 1;
    const humanRule = multi
      ? "Tu incarnes les PNJ. Les humains (" + humans.join(", ") + ") décident chacun de leurs paroles, pouvoirs nocturnes et votes ; ne simule jamais leurs actions. "
      : "Tu incarnes les PNJ et décides leurs actions ; Alex reste seul maître de ses actes. ";
    const start = "MODE MAÎTRE DU JEU — Partie Loup-Garou " + id + ".\n" +
      "Lis l’état utile de la partie sur GitHub trexdbg/loup-garou (partie.json, secrets_mj.json et fin du journal/dialogues) ; évite les relectures intégrales inutiles.\n" +
      humanRule +
      "L'application est exclusivement une régie MJ. Ne publie jamais de secret dans les scènes publiques.\n";
    let task = guide.instructions;
    if (action === "resume") task = "Vérifie précisément l'état déjà enregistré, rappelle au MJ la dernière scène et propose uniquement la prochaine action adaptée. Ne modifie rien sans une nouvelle décision validée.";
    if (action === "sync") task = "Vérifie si les dernières scènes et décisions validées dans cette conversation sont bien sur la branche main de GitHub. Synchronise uniquement les événements validés, vérifie les fichiers et le déploiement. Si l'écriture échoue, indique-le sans prétendre avoir poussé.";
    if (action === "dialogue") task = multi
      ? "Interventions des joueurs humains (" + humans.join(", ") + ") : " + (note || "(le MJ rapportera leurs paroles)") + ". Fais réagir brièvement les PNJ ; attends chacun des humains encore vivants avant la fin des débats, puis demande séparément tous les votes humains habilités en plus de ceux des PNJ."
      : "Alex intervient librement : " + (note || "(le MJ ajoutera ses paroles)") + ". Fais répondre 2 à 4 PNJ pertinents, puis avance automatiquement : au jour 1 vers la nuit 1, aux jours suivants vers les votes PNJ et le vote d'Alex. Ne bloque pas pour une validation MJ de transition.";
    return start + "\nÉtat annoncé : phase=" + (state.phase || "prologue") +
      ", scène=" + (state.scene_courante_id || state.progression?.scene || "?") +
      ", nuit=" + (state.progression?.nuit ?? 0) + ", jour=" + (state.progression?.jour ?? 0) + ".\n" +
      "\nACTION DEMANDÉE : " + task +
      "\n\nMODE AUTONOME : tous les PNJ agissent, votent, utilisent leurs pouvoirs et assument les conséquences selon les règles et leurs informations propres. " + (multi ? "Arrête-toi pour chaque choix de joueur humain concerné ; attends le vote de chaque humain vivant avant le dépouillement. Les interventions de tous les joueurs humains vivants déclenchent ensuite la suite du jeu. " : "Arrête-toi SEULEMENT pour les choix d'Alex, un arbitrage impossible ou la fin. Une intervention d'Alex fait avancer un bloc de jeu entier. ") +
      "NUIT : zéro dialogue, zéro audio, zéro appel GitHub ni commit ; stocke les décisions en contexte et archive EN UN SEUL COMMIT à la prochaine scène publique du réveil. JOUR : quelques répliques courtes, puis vote automatique. Ne génère jamais la voix d'Alex ni les secrets.";
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
    main.append(make("p",humanNames(state).length > 1 ? "Les joueurs humains jouent autour de la table. Cet écran est la régie du MJ : chaque vote ou pouvoir humain est attendu séparément." : "Le joueur joue autour de la table. Cet écran est votre poste de commande : rien n'est joué automatiquement.","mj-control-intro"));
    const roster=[...humanNames(state),...(state.personnages_pnj||[]).map(x=>typeof x==="string"?x:x.prenom)].filter(Boolean);
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