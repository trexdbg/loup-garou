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
import subprocess
import sys
import urllib.error
import urllib.request

MODEL = os.environ.get("GEMINI_TTS_MODEL", "gemini-2.5-flash-preview-tts")
API_URL = "https://generativelanguage.googleapis.com/v1beta/models/"
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

def synthesize(text: str, voice: str, style: str, api_key: str) -> tuple[bytes, str]:
    payload = {
        "contents": [{"parts": [{"text":
            "Prononce uniquement cette replique, sans lire les consignes. "
            "En francais naturel, voix " + style + ", comme au theatre. "
            "Respecte exactement les paroles et la ponctuation.\nReplique : " + text}]}],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {
                "languageCode": "fr-FR",
                "voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voice}},
            },
        },
    }
    request = urllib.request.Request(
        API_URL + MODEL + ":generateContent",
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers={"Content-Type": "application/json", "x-goog-api-key": api_key},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=90) as response:
        body = json.load(response)
    for candidate in body.get("candidates", []):
        for part in candidate.get("content", {}).get("parts", []):
            inline = part.get("inlineData") or {}
            if inline.get("data"):
                return base64.b64decode(inline["data"], validate=True), inline.get("mimeType", "")
    raise ValueError("No audio in Gemini response")

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
    index_file = root / "parties" / "index.json"
    if not index_file.is_file():
        return 0
    entries = json.loads(index_file.read_text(encoding="utf-8")).get("parties", [])
    generated = 0
    stopped = False
    for entry in entries:
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
            cast = [x["prenom"] if isinstance(x, dict) else x for x in info.get("personnages_pnj", [])]
            cast = [x for x in cast if isinstance(x, str)]
        except (OSError, ValueError, KeyError, TypeError):
            cast = []
        target = site / "parties" / party_id / "audio"
        target.mkdir(parents=True, exist_ok=True)
        cache.mkdir(parents=True, exist_ok=True)
        manifest = {"version": 1, "provider": "gemini", "model": MODEL, "lines": {}}
        for row in rows:
            speaker, text = row["locuteur"], row["texte"]
            voice, style = voice_for(speaker, cast)
            fingerprint = hashlib.sha256(
                (MODEL + "\0" + voice + "\0" + style + "\0" + text).encode("utf-8")
            ).hexdigest()[:20]
            filename = fingerprint + ".mp3"
            cached = cache / filename
            if not cached.is_file() and api_key and generated < max_lines and not stopped:
                try:
                    pcm, mime = synthesize(text, voice, style, api_key)
                    make_mp3(pcm, mime, cached)
                    generated += 1
                    print("Gemini generated: " + party_id + " seq " + str(row["seq"]))
                except urllib.error.HTTPError as exc:
                    print("Gemini HTTP " + str(exc.code) + " on seq " + str(row["seq"]), file=sys.stderr)
                    if exc.code in (400, 401, 403, 404, 429):
                        stopped = True
                except (urllib.error.URLError, ValueError, OSError, subprocess.TimeoutExpired) as exc:
                    print("Gemini/audio failed on seq " + str(row["seq"]) + ": " + type(exc).__name__, file=sys.stderr)
            if cached.is_file():
                shutil.copyfile(cached, target / filename)
                manifest["lines"][str(row["seq"])] = {
                    "file": "audio/" + filename, "locuteur": speaker, "texte": text,
                }
        (target / "manifest.json").write_text(
            json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return generated

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--site", default="site")
    parser.add_argument("--cache", default=".cache/gemini-tts")
    parser.add_argument("--max-lines", type=int, default=24)
    parser.add_argument("--max-scenes", type=int, default=3)
    args = parser.parse_args()
    root = Path(__file__).resolve().parent.parent
    count = generate(root, Path(args.site), Path(args.cache),
                     max(0, min(args.max_lines, 30)), max(1, min(args.max_scenes, 5)),
                     os.environ.get("GEMINI_API_KEY", ""))
    print(str(count) + " new TTS clips; cached clips reused. No key => browser voice fallback.")

if __name__ == "__main__":
    main()
