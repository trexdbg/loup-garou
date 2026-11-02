#!/usr/bin/env python3
"""Generate recent public Gemini TTS audio for GitHub Pages, not for git."""
from __future__ import annotations
import argparse
import base64
import hashlib
import json
import os
from pathlib import Path
import shutil
import time
import subprocess
import sys
import urllib.error
import urllib.request

MODEL = os.environ.get("GEMINI_TTS_MODEL", "gemini-3.8-flash-lite-tts")
LEGACY_MODEL = "gemini-3.1-flash-tts-preview"
API_URL = "https://generativelanguage.googleapis.com/v1beta/interactions"
TYPES = {"dialogue_pnj", "dialogue", "replique", "narration", "narration_publique"}
VOICES = [
    ("Aoede", "douce, prudente et observatrice"),
    ("Fenrir", "vive, energique et impulsive"),
    ("Kore", "franche et assuree"),
    ("Puck", "souriante, persuasive et detendue"),
    ("Achernar", "calme, posee et diplomate"),
    ("Algenib", "bavarde et un peu nerveuse"),
    ("Leda", "malicieuse et vive"),
]

def public_lines(path: Path, max_scenes: int) -> list[dict]:
    if not path.is_file():
        return []
    rows = {}
    for raw in path.read_text(encoding="utf-8").splitlines():
        try:
            row = json.loads(raw)
        except (ValueError, TypeError):
            continue
        if not isinstance(row, dict):
            continue
        if (row.get("public") is not True or row.get("type") not in TYPES
                or type(row.get("seq")) is not int or row["seq"] < 1
                or not isinstance(row.get("texte"), str) or not row["texte"].strip()):
            continue
        scene = row.get("scene_id", "archive")
        if not isinstance(scene, str) or len(scene) > 80:
            continue
        rows[row["seq"]] = {
            "seq": row["seq"], "scene_id": scene,
            "locuteur": str(row.get("locuteur") or "Narrateur")[:60],
            "texte": row["texte"].strip()[:900],
        }
    ordered = [rows[key] for key in sorted(rows)]
    scenes = list(dict.fromkeys(row["scene_id"] for row in ordered))
    wanted = set(scenes[-max_scenes:])
    return [row for row in ordered if row["scene_id"] in wanted]

def voice_for(name: str, cast: list[str]) -> tuple[str, str]:
    if name.lower() == "narrateur":
        return "Charon", "grave, posee et mysterieuse, comme un conteur"
    index = cast.index(name) if name in cast else int(
        hashlib.sha256(name.encode("utf-8")).hexdigest()[:8], 16)
    return VOICES[index % len(VOICES)]

def fingerprint(model: str, voice: str, style: str, text: str) -> str:
    """Same fingerprint formula as the legacy generator to retain old MP3s."""
    return hashlib.sha256(
        (model + "\0" + voice + "\0" + style + "\0" + text).encode("utf-8")
    ).hexdigest()[:20] + ".mp3"


def synthesize(text: str, voice: str, style: str, api_key: str) -> tuple[bytes, str]:
    """Gemini 3.8 Interactions REST API: transcript separate from voice directions."""
    if MODEL not in {"gemini-3.8-flash-lite-tts", "gemini-3.8-flash-tts"}:
        raise ValueError("Unsupported TTS model: use a Gemini 3.8 TTS model")
    payload = {
        "model": MODEL,
        "input": [{
            "type": "user_input",
            "content": [{
                "type": "text",
                "text": text,
                "annotations": [{
                    "type": "speech_metadata",
                    "style": "Parle en français naturel, avec une interprétation théâtrale "
                             "et une voix " + style + ". Ne rajoute aucun mot.",
                }],
            }],
        }],
        "response_format": {"type": "audio"},
        "generation_config": {"speech_config": [{"voice": voice}]},
    }
    request = urllib.request.Request(
        API_URL,
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers={"Content-Type": "application/json", "x-goog-api-key": api_key},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=90) as response:
        body = json.load(response)
    # Interactions v1beta uses steps/model_output/content/audio rather than candidates.
    for step in body.get("steps", []):
        if step.get("type") != "model_output":
            continue
        for part in step.get("content", []):
            if part.get("type") == "audio" and part.get("data"):
                return (base64.b64decode(part["data"], validate=True),
                        part.get("mime_type") or "audio/wav")
    raise ValueError("No audio in Gemini Interactions response")


def make_mp3(audio: bytes, mime: str, output: Path) -> None:
    fmt = ["-f", "wav"] if "wav" in mime.lower() or audio.startswith(b"RIFF") else [
        "-f", "s16le", "-ar", "24000", "-ac", "1"]
    result = subprocess.run(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *fmt,
         "-i", "pipe:0", "-ac", "1", "-codec:a", "libmp3lame",
         "-b:a", "48k", str(output)],
        input=audio, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
        timeout=60, check=False,
    )
    if result.returncode or not output.is_file() or not output.stat().st_size:
        output.unlink(missing_ok=True)
        raise ValueError("Audio conversion failed")

def generate(root: Path, site: Path, cache: Path,
             max_lines: int, max_scenes: int, api_key: str) -> int:
    """Reuse existing audio first, synthesize only misses, and stop on exhausted quota."""
    index_file = root / "parties" / "index.json"
    if not index_file.is_file():
        return 0
    entries = json.loads(index_file.read_text(encoding="utf-8")).get("parties", [])
    # The newest validated party gets the remaining free-tier quota first.
    entries = sorted(reversed(entries), key=lambda x: str(x.get("cree_le", "")), reverse=True)
    # Spend the free quota only on the newest ongoing party with playable lines.
    # Older parties still publish every cached clip, but create no new ones.
    priority_party = None
    for item in entries:
        candidate = item.get("id")
        if (str(item.get("statut", "")).lower() not in {"terminee", "terminée", "completed", "finished"}
                and isinstance(candidate, str) and candidate.startswith("LG-")
                and candidate.replace("-", "").isalnum()
                and public_lines(root / "parties" / candidate / "dialogues.ndjson", max_scenes)):
            priority_party = candidate
            break
    generated = 0
    stopped = False
    quota_exhausted = False
    cache.mkdir(parents=True, exist_ok=True)
    for entry in entries:
        if str(entry.get("statut", "")).lower() in {"terminee", "terminée", "completed", "finished"}:
            continue
        party_id = entry.get("id", "")
        if (not isinstance(party_id, str) or not party_id.startswith("LG-")
                or not party_id.replace("-", "").isalnum()):
            continue
        directory = root / "parties" / party_id
        if not directory.is_dir():
            continue
        rows = public_lines(directory / "dialogues.ndjson", max_scenes)
        if not rows:
            continue
        try:
            info = json.loads((directory / "partie.json").read_text(encoding="utf-8"))
            cast = [x["prenom"] if isinstance(x, dict) else x
                    for x in info.get("personnages_pnj", [])]
            cast = [x for x in cast if isinstance(x, str)]
        except (OSError, ValueError, KeyError, TypeError):
            cast = []
        target = site / "parties" / party_id / "audio"
        target.mkdir(parents=True, exist_ok=True)
        stats = {"total": len(rows), "available": 0, "reused": 0,
                 "generated": 0, "missing": 0, "quota_exhausted": False}
        manifest_file = target / "manifest.json"
        try:
            previous = json.loads(manifest_file.read_text(encoding="utf-8"))
            prior_clips = previous.get("lines", {})
        except (OSError, ValueError):
            prior_clips = {}
        manifest = {"version": 1, "provider": "mixed", "preferred_provider": "phonon",
                    "model": MODEL, "lines": {}, "stats": stats}
        for row in rows:
            speaker, text = row["locuteur"], row["texte"]
            previous_clip = prior_clips.get(str(row["seq"]), {})
            if (isinstance(previous_clip, dict)
                    and previous_clip.get("provider") == "phonon"
                    and previous_clip.get("locuteur") == speaker
                    and previous_clip.get("texte") == text
                    and isinstance(previous_clip.get("file"), str)
                    and __import__("re").fullmatch(r"audio/[a-f0-9]{20}\.mp3", previous_clip["file"])
                    and (target / previous_clip["file"]).is_file()):
                manifest["lines"][str(row["seq"])] = previous_clip
                stats["available"] += 1
                continue
            voice, style = voice_for(speaker, cast)
            # Preserve the old model's sound and named files when cached.
            selected_model = None
            cached = None
            for candidate_model in (LEGACY_MODEL, MODEL):
                candidate = cache / fingerprint(candidate_model, voice, style, text)
                if candidate.is_file() and candidate.stat().st_size > 0:
                    selected_model, cached = candidate_model, candidate
                    break
            if (cached is None and party_id == priority_party and api_key
                    and generated < max_lines and not stopped):
                candidate = cache / fingerprint(MODEL, voice, style, text)
                try:
                    wav, mime = synthesize(text, voice, style, api_key)
                    make_mp3(wav, mime, candidate)
                    cached, selected_model = candidate, MODEL
                    generated += 1
                    stats["generated"] += 1
                    print("Gemini generated: " + party_id + " seq " + str(row["seq"]))
                    time.sleep(16)  # Respect RPM limits without repeated quota retries.
                except urllib.error.HTTPError as exc:
                    print("Gemini HTTP " + str(exc.code) + " on " + party_id +
                          " seq " + str(row["seq"]), file=sys.stderr)
                    if exc.code == 429:
                        quota_exhausted = True
                        retry_after = exc.headers.get("Retry-After") if exc.headers else None
                        if retry_after:
                            print("Gemini Retry-After: " + str(retry_after), file=sys.stderr)
                    # Authentication, bad model and quota errors are not retryable in this job.
                    if exc.code in (400, 401, 403, 404, 429):
                        stopped = True
                except FileNotFoundError:
                    print("ffmpeg missing: Gemini generation paused.", file=sys.stderr)
                    stopped = True
                except (urllib.error.URLError, ValueError, OSError, subprocess.TimeoutExpired) as exc:
                    print("Gemini/audio failed on " + party_id + " seq " +
                          str(row["seq"]) + ": " + type(exc).__name__, file=sys.stderr)
            if cached is not None and cached.is_file() and cached.stat().st_size > 0:
                shutil.copyfile(cached, target / cached.name)
                manifest["lines"][str(row["seq"])] = {
                    "file": "audio/" + cached.name,
                    "locuteur": speaker, "texte": text, "model": selected_model,
                }
                stats["available"] += 1
                if selected_model != MODEL or stats["generated"] == 0 or cached.name != fingerprint(MODEL, voice, style, text):
                    # Reused legacy audio and prior Flash-Lite cache both count as reused.
                    stats["reused"] += 1
            else:
                stats["missing"] += 1
        # Count reused clips, including Phonon voices already available.
        stats["reused"] = stats["available"] - stats["generated"]
        stats["quota_exhausted"] = quota_exhausted
        (target / "manifest.json").write_text(
            json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8")
        print("Gemini status " + party_id + ": " + json.dumps(stats))
    return generated


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--site", default="site")
    parser.add_argument("--cache", default=".cache/gemini-tts")
    parser.add_argument("--max-lines", type=int, default=8)
    parser.add_argument("--max-scenes", type=int, default=3)
    args = parser.parse_args()
    root = Path(__file__).resolve().parent.parent
    count = generate(root, Path(args.site), Path(args.cache),
                     max(0, min(args.max_lines, 8)), max(1, min(args.max_scenes, 5)),
                     os.environ.get("GEMINI_API_KEY", ""))
    print(str(count) + " new TTS clips; previous Gemini MP3s retained. Missing clips use local voices.")

if __name__ == "__main__":
    main()
