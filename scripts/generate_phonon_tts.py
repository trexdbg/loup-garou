#!/usr/bin/env python3
"""Phonon 40M FR: synthesize recent, validated PUBLIC NPC scenes in GitHub Actions.

Requires: accepted model terms at huggingface.co/gradium/phonon-40m-fr,
HF_TOKEN secret, ptts Python runtime, ffmpeg. Never writes model weights,
private roles or audio files into the Git repository; only a Pages artifact.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

MODEL = "gradium/phonon-40m-fr"
TYPES = {"dialogue_pnj", "dialogue", "replique", "narration", "narration_publique"}


def catalog(root: Path) -> dict:
    data = json.loads((root / "voices" / "phonon-fr.json").read_text(encoding="utf-8"))
    people = data["personnages"]
    narrateur = data["narrateur"]
    assert len(people) == 14
    assert len({p["voix"] for p in people}) == 14
    assert len({p["personnage"] for p in people}) == 14
    assert narrateur["personnage"] == "Narrateur"
    assert narrateur["voix"] == "Marius"
    assert len({p["voix"] for p in people} | {narrateur["voix"]}) == 15
    assert len({p["voice_id"] for p in people} | {narrateur["voice_id"]}) == 15
    return {p["personnage"]: p for p in people}


def read_lines(file: Path, max_scenes: int) -> list[dict]:
    if not file.is_file():
        return []
    rows = {}
    for raw in file.read_text(encoding="utf-8").splitlines():
        try:
            row = json.loads(raw)
        except (ValueError, TypeError):
            continue
        if not isinstance(row, dict):
            continue
        if (row.get("public") is not True or row.get("audio") is False or row.get("type") not in TYPES
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
    active = set(list(dict.fromkeys(x["scene_id"] for x in ordered))[-max_scenes:])
    return [x for x in ordered if x["scene_id"] in active]


LEGACY_VOICES = {"Octave": "Marius"}  # Anciennes parties, jamais proposées au nouveau casting.


def voice_for(name: str, roster: dict) -> str | None:
    if name.lower() == "narrateur":
        return "Marius"  # Réservée au narrateur des nouvelles parties.
    profile = roster.get(name)
    return profile["voix"] if profile else LEGACY_VOICES.get(name)


def filename_for(voice: str, words: str) -> str:
    digest = hashlib.sha256((MODEL + "\0" + voice + "\0" + words).encode("utf-8")).hexdigest()[:20]
    return digest + ".mp3"


def transcode(wav: Path, mp3: Path) -> None:
    command = [
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(wav),
        "-ac", "1", "-codec:a", "libmp3lame", "-b:a", "48k", str(mp3),
    ]
    subprocess.run(command, check=True, timeout=60, stdout=subprocess.DEVNULL,
                   stderr=subprocess.DEVNULL)
    if not mp3.is_file() or mp3.stat().st_size == 0:
        raise ValueError("Empty Phonon MP3")


def synthesize(text: str, voice: str, dest: Path) -> None:
    with tempfile.TemporaryDirectory() as td:
        wav = Path(td) / "spoken.wav"
        command = [sys.executable, "-m", "ptts", "--model", "hf://" + MODEL,
                   "--lang", "fr", "--quant", "q8", "--voice", voice,
                   text, "-o", str(wav)]
        # No shell interpolation, no printed token, and fixed trusted model and voices.
        subprocess.run(command, check=True, timeout=180, stdout=subprocess.DEVNULL,
                       stderr=subprocess.DEVNULL)
        transcode(wav, dest)


def generate(root: Path, site: Path, cache: Path, max_lines: int,
             max_scenes: int, enabled: bool) -> dict:
    roster = catalog(root)
    index_file = root / "parties" / "index.json"
    if not index_file.is_file():
        return {"generated": 0, "available": 0}
    entries = json.loads(index_file.read_text(encoding="utf-8")).get("parties", [])
    entries = sorted(entries, key=lambda x: str(x.get("cree_le", "")), reverse=True)
    cache.mkdir(parents=True, exist_ok=True)
    result = {"generated": 0, "available": 0}
    failure = False
    changed_party = os.environ.get("LG_TTS_PARTY", "")
    # Prioritize ongoing parties and do not spend runner CPU on completed games.
    for entry in entries:
        if str(entry.get("statut", "")).lower() in {"terminee", "terminée", "completed", "finished"}:
            continue
        party_id = entry.get("id", "")
        if (not isinstance(party_id, str) or not party_id.startswith("LG-")
                or not party_id.replace("-", "").isalnum()):
            continue
        src = root / "parties" / party_id
        rows = read_lines(src / "dialogues.ndjson", max_scenes)
        if not rows:
            continue
        # Legacy party names must map to known voices; unknown names are left
        # to Gemini / local speech rather than inventing a voice binding.
        audio_dir = site / "parties" / party_id / "audio"
        audio_dir.mkdir(parents=True, exist_ok=True)
        manifest_file = audio_dir / "manifest.json"
        try:
            previous = json.loads(manifest_file.read_text(encoding="utf-8"))
            existing = previous.get("lines", {})
        except (OSError, ValueError):
            existing = {}
        manifest = {"version": 1, "provider": "mixed",
                    "preferred_provider": "phonon", "model": MODEL,
                    "lines": dict(existing), "stats": {"phonon": 0, "generated": 0}}
        for row in rows:
            seq = str(row["seq"])
            speaker, words = row["locuteur"], row["texte"]
            voice = voice_for(speaker, roster)
            if not voice:
                continue
            name = filename_for(voice, words)
            output = cache / name
            if (not output.is_file() and enabled and not failure
                    and (not changed_party or party_id == changed_party)
                    and result["generated"] < max_lines):
                try:
                    synthesize(words, voice, output)
                    result["generated"] += 1
                    manifest["stats"]["generated"] += 1
                except (subprocess.CalledProcessError, subprocess.TimeoutExpired,
                        FileNotFoundError, ValueError, OSError) as exc:
                    output.unlink(missing_ok=True)
                    # Missing HF access, denied model, incompatible wheel etc.
                    # Stop rather than hammer Hub; other voice engines remain usable.
                    print("Phonon unavailable: " + type(exc).__name__, file=sys.stderr)
                    failure = True
            if output.is_file() and output.stat().st_size > 0:
                shutil.copyfile(output, audio_dir / name)
                manifest["lines"][seq] = {
                    "file": "audio/" + name, "locuteur": speaker, "texte": words,
                    "provider": "phonon", "model": MODEL, "voice": voice,
                }
                manifest["stats"]["phonon"] += 1
                result["available"] += 1
        manifest_file.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
                                 encoding="utf-8")
        print("Phonon " + party_id + ": " + str(manifest["stats"]["phonon"]) +
              " clips ready, " + str(manifest["stats"]["generated"]) + " new.")
    return result


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--site", default="site")
    parser.add_argument("--cache", default=".cache/phonon-tts")
    parser.add_argument("--max-lines", type=int, default=20)
    parser.add_argument("--max-scenes", type=int, default=3)
    args = parser.parse_args()
    root = Path(__file__).resolve().parent.parent
    has_token = bool(os.environ.get("HF_TOKEN", "").strip())
    outcome = generate(root, Path(args.site), Path(args.cache),
                       max(0, min(args.max_lines, 30)),
                       max(1, min(args.max_scenes, 5)), has_token)
    # A public, non-sensitive status lets the MJ confirm that genuine Phonon
    # clips were produced, without ever exposing the access token or logs.
    status = {"engine": "phonon", "model": MODEL,
              "generated": outcome["generated"],
              "available": outcome["available"],
              "ready": outcome["available"] > 0}
    target = Path(args.site)
    target.mkdir(parents=True, exist_ok=True)
    (target / "phonon-status.json").write_text(
        json.dumps(status, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if has_token and not status["ready"]:
        print("::warning::HF_TOKEN est présent, mais aucun MP3 Phonon n'est disponible. Vérifier l'accès au modèle et les logs de l'étape Phonon.")
    print("Phonon ready: " + json.dumps(outcome) + ". HF access: " +
          ("configured" if has_token else "not configured (fallback enabled)"))


if __name__ == "__main__":
    main()
