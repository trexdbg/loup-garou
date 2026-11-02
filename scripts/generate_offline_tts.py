#!/usr/bin/env python3
"""Audio MP3 de secours pour les dialogues publics, sans API ni quota.

S'exécute après Phonon puis Gemini sur l'artefact GitHub Pages seulement. Ne lit jamais
secrets_mj.json et ne publie ni les répliques du joueur ni les rôles cachés.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys

TYPES = {"dialogue_pnj", "dialogue", "replique", "narration", "narration_publique"}
ID_RE = re.compile(r"^LG-[0-9]{8}-[A-F0-9]{12}$")
FILE_RE = re.compile(r"^audio/[a-f0-9]{20}\.mp3$")
PROFILES = [
    ("fr+f3", 153, 50), ("fr+m3", 170, 43),
    ("fr+f2", 163, 58), ("fr+m4", 148, 38),
    ("fr+f4", 157, 49), ("fr+m2", 176, 55),
    ("fr+f5", 150, 63),
]
NARRATOR = ("fr+m1", 143, 37)


def approved_lines(dialogues: Path, max_scenes: int = 3) -> list[dict]:
    if not dialogues.is_file():
        return []
    result = {}
    for line in dialogues.read_text(encoding="utf-8").splitlines():
        try:
            item = json.loads(line)
        except ValueError:
            continue
        if (not isinstance(item, dict) or item.get("public") is not True
                or item.get("type") not in TYPES
                or type(item.get("seq")) is not int or item["seq"] < 1
                or not isinstance(item.get("texte"), str)
                or not item["texte"].strip()):
            continue
        result[item["seq"]] = {
            "seq": item["seq"],
            "scene_id": str(item.get("scene_id") or "archive")[:80],
            "locuteur": str(item.get("locuteur") or "Narrateur")[:60],
            "texte": item["texte"].strip()[:900],
        }
    rows = [result[key] for key in sorted(result)]
    scenes = list(dict.fromkeys(row["scene_id"] for row in rows))
    wanted = set(scenes[-max_scenes:])
    return [row for row in rows if row["scene_id"] in wanted]


def profile(speaker: str, cast: list[str]) -> tuple[str, int, int]:
    if speaker.lower() == "narrateur":
        return NARRATOR
    if speaker in cast:
        index = cast.index(speaker)
    else:
        index = int(hashlib.sha256(speaker.encode("utf-8")).hexdigest()[:8], 16)
    return PROFILES[index % len(PROFILES)]


def synthesize_mp3(text: str, output: Path, voice: str, speed: int, pitch: int) -> None:
    speech = subprocess.run(
        ["espeak-ng", "-v", voice, "-s", str(speed), "-p", str(pitch),
         "--stdout", text],
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=35, check=True,
    )
    converted = subprocess.run(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
         "-i", "pipe:0", "-ac", "1", "-codec:a", "libmp3lame",
         "-b:a", "48k", str(output)],
        input=speech.stdout, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
        timeout=35, check=True,
    )
    if not output.is_file() or output.stat().st_size < 100:
        raise RuntimeError("MP3 vide")
    if converted.returncode:
        raise RuntimeError("FFmpeg a échoué")


def generate(site: Path, max_scenes: int = 3) -> tuple[int, int]:
    base = site / "parties"
    generated = reused = 0
    for party in sorted(base.glob("LG-*")):
        if not party.is_dir() or not ID_RE.fullmatch(party.name):
            continue
        rows = approved_lines(party / "dialogues.ndjson", max_scenes)
        if not rows:
            continue
        try:
            info = json.loads((party / "partie.json").read_text(encoding="utf-8"))
            cast = [p["prenom"] if isinstance(p, dict) else p
                    for p in info.get("personnages_pnj", [])]
            cast = [p for p in cast if isinstance(p, str)]
        except (OSError, ValueError, TypeError, KeyError):
            cast = []
        audio_dir = party / "audio"
        audio_dir.mkdir(parents=True, exist_ok=True)
        manifest_file = audio_dir / "manifest.json"
        try:
            manifest = json.loads(manifest_file.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            manifest = {"version": 1, "provider": "gemini", "lines": {}, "stats": {}}
        manifest.setdefault("lines", {})
        manifest["version"] = 1
        manifest["provider"] = "mixed"  # Lecture mixte : Phonon, Gemini, puis MP3 hors ligne.
        for row in rows:
            seq = str(row["seq"])
            clip = manifest["lines"].get(seq)
            if (isinstance(clip, dict) and clip.get("locuteur") == row["locuteur"]
                    and clip.get("texte") == row["texte"]
                    and isinstance(clip.get("file"), str)
                    and FILE_RE.fullmatch(clip["file"])
                    and (party / clip["file"]).is_file()):
                reused += 1
                continue
            voice, speed, pitch = profile(row["locuteur"], cast)
            key = "\0".join([voice, str(speed), str(pitch),
                              row["locuteur"], row["texte"]])
            name = hashlib.sha256(key.encode("utf-8")).hexdigest()[:20] + ".mp3"
            target = audio_dir / name
            if not target.is_file():
                synthesize_mp3(row["texte"], target, voice, speed, pitch)
                generated += 1
            manifest["lines"][seq] = {
                "file": "audio/" + name, "locuteur": row["locuteur"],
                "texte": row["texte"], "model": "espeak-ng-fr",
                "provider": "offline",
            }
        stats = manifest.setdefault("stats", {})
        stats["total"] = len(rows)
        stats["available"] = sum(
            1 for row in rows if str(row["seq"]) in manifest["lines"])
        stats["offline"] = sum(
            1 for row in rows
            if manifest["lines"].get(str(row["seq"]), {}).get("provider") == "offline")
        stats["missing"] = len(rows) - stats["available"]
        manifest_file.write_text(
            json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        print(f"Audio disponible {party.name}: {stats['available']}/{len(rows)} "
              f"({stats['offline']} MP3 hors ligne)", flush=True)
    return generated, reused


def main() -> None:
    site = Path(sys.argv[1] if len(sys.argv) > 1 else "site")
    count, reused = generate(site)
    print(f"Audio hors ligne : {count} nouveaux clips, {reused} préservés.")


if __name__ == "__main__":
    main()
