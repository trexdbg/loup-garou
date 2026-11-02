/**
 * Thiercelieux Solo — pont TTS neuronal ElevenLabs (Cloudflare Worker).
 * Aucun secret dans GitHub Pages / aucun texte ou rôle MJ envoyé ici.
 * Le Worker accepte seulement les numéros de réplique PUBLIÉS dans le dépôt.
 *
 * Bindings requis :
 *   ELEVENLABS_API_KEY : secret Cloudflare
 *   VOICE_MAP_JSON    : JSON noms publics -> IDs des voix, variable Cloudflare
 *   RATE_LIMITER      : binding Rate Limiting Cloudflare
 */
const ORIGIN = "https://trexdbg.github.io";
const REPO_RAW = "https://raw.githubusercontent.com/trexdbg/loup-garou/main/parties/";
const TYPES = new Set(["dialogue_pnj", "dialogue", "replique", "narration", "narration_publique"]);
const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{5,63}$/;
const VOICE_ID_PATTERN = /^[A-Za-z0-9]{10,64}$/;
const MAX_TEXT_LENGTH = 1800;
const MAX_ARCHIVE_SIZE = 300000;
const AUDIO_TTL = 3600; // petite mémoire cache en périphérie, aucun commit audio

function commonHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin === ORIGIN ? ORIGIN : "null",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
    "X-Content-Type-Options": "nosniff"
  };
}
function reply(message, status, origin) {
  return new Response(JSON.stringify({ error: message }), {
    status, headers: { "Content-Type": "application/json; charset=utf-8", ...commonHeaders(origin), "Cache-Control": "no-store" }
  });
}
function parseVoices(source) {
  try {
    const json = JSON.parse(source || "{}");
    return json && typeof json === "object" && !Array.isArray(json) ? json : {};
  } catch (_) { return {}; }
}
function parsePublicLine(raw, seq) {
  for (const text of raw.split(/\r?\n/)) {
    if (!text.trim()) continue;
    let row;
    try { row = JSON.parse(text); } catch (_) { continue; }
    if (row.seq !== seq) continue;
    if (row.public !== true || !TYPES.has(row.type)) return null;
    if (typeof row.texte !== "string" || !row.texte.trim() || row.texte.length > MAX_TEXT_LENGTH) return null;
    const speaker = typeof row.locuteur === "string" ? row.locuteur : "Narrateur";
    if (speaker.length > 50) return null;
    return { speaker, text: row.texte.trim() };
  }
  return null;
}
export default {
  async fetch(request, env, context) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: commonHeaders(origin) });
    }
    if (request.method !== "GET") return reply("Méthode refusée", 405, origin);
    if (origin && origin !== ORIGIN) return reply("Origine non autorisée", 403, origin);
    if (url.pathname === "/health") {
      const voices = parseVoices(env.VOICE_MAP_JSON);
      return new Response(JSON.stringify({
        configured: !!env.ELEVENLABS_API_KEY && Object.values(voices).some(x => VOICE_ID_PATTERN.test(x)),
        neural: true, voice_count: Object.values(voices).filter(x => VOICE_ID_PATTERN.test(x)).length
      }), { headers: { "Content-Type": "application/json", ...commonHeaders(origin), "Cache-Control": "no-store" } });
    }
    if (url.pathname !== "/speak") return reply("Route inconnue", 404, origin);
    const id = url.searchParams.get("id") || "";
    const seq = Number(url.searchParams.get("seq"));
    if (!ID_PATTERN.test(id) || !Number.isSafeInteger(seq) || seq <= 0 || seq > 1000000) return reply("Identifiant incorrect", 400, origin);
    const voices = parseVoices(env.VOICE_MAP_JSON);
    if (!env.ELEVENLABS_API_KEY) return reply("Synthèse neuronale non configurée", 503, origin);

    // Un cache d'une heure limite les appels payants lors d'une relecture.
    // À cause de l'historique immuable des répliques, une entrée publiée ne doit pas être modifiée.
    const cacheKey = new Request(new URL("/speech-cache/" + id + "/" + seq + ".mp3", url.origin));
    const cache = typeof caches !== "undefined" ? caches.default : null;
    if (cache) {
      const cached = await cache.match(cacheKey);
      if (cached) {
        const result = new Response(cached.body, cached);
        Object.entries(commonHeaders(origin)).forEach(([key, value]) => result.headers.set(key, value));
        return result;
      }
    }

    // Rate limit : quota par IP, protection partielle contre les demandes répétées.
    // Pour un déploiement public, ajouter un plafond de crédits chez ElevenLabs.
    if (!env.RATE_LIMITER) return reply("Limiteur de coût requis", 503, origin);
    const key = request.headers.get("cf-connecting-ip") || "unknown";
    const limit = await env.RATE_LIMITER.limit({ key });
    if (!limit.success) return reply("Trop de requêtes, réessayez plus tard", 429, origin);

    // Le client n'envoie JAMAIS le texte à transformer : uniquement l'ID et le numéro public.
    const archiveResponse = await fetch(REPO_RAW + encodeURIComponent(id) + "/dialogues.ndjson", {
      headers: { Accept: "text/plain" }, cf: { cacheTtl: 0 }
    });
    if (!archiveResponse.ok) return reply("Dialogues indisponibles", 502, origin);
    const length = Number(archiveResponse.headers.get("content-length") || 0);
    if (length > MAX_ARCHIVE_SIZE) return reply("Archive trop volumineuse", 413, origin);
    const content = await archiveResponse.text();
    if (content.length > MAX_ARCHIVE_SIZE) return reply("Archive trop volumineuse", 413, origin);
    const row = parsePublicLine(content, seq);
    if (!row) return reply("Réplique publique absente", 404, origin);
    const voiceId = voices[row.speaker] || voices.Narrateur;
    if (!VOICE_ID_PATTERN.test(voiceId || "")) return reply("Voix indisponible pour ce personnage", 503, origin);

    const isNarration = row.speaker === "Narrateur";
    const payload = {
      text: row.text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: isNarration ? 0.58 : 0.38,
        similarity_boost: 0.78,
        style: isNarration ? 0.16 : 0.35,
        use_speaker_boost: true
      }
    };
    const upstream = await fetch("https://api.elevenlabs.io/v1/text-to-speech/" + voiceId + "/stream?output_format=mp3_44100_128", {
      method: "POST",
      headers: {
        "xi-api-key": env.ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        Accept: "audio/mpeg"
      },
      body: JSON.stringify(payload)
    });
    if (!upstream.ok) return reply("Service vocal temporairement indisponible", 502, origin);

    const response = new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=" + AUDIO_TTL,
        ...commonHeaders(origin)
      }
    });
    if (cache) context.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  }
};
