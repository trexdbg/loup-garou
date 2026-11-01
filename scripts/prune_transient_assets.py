#!/usr/bin/env python3
"""Expire les médias temporaires et dialogues des parties *terminées*.

Sécurité :
- ne touche jamais roles.js, stories.js, styles, notes MJ, journaux ou narrations ;
- n'efface que les fichiers suivis par Git sous parties/<id>/audio et
  parties/<id>/dialogues.ndjson, après la fin explicite de la partie ;
- respecte "statut": "archive"/"permanent" dans audio/manifest.json ;
- mode simulation par défaut (ajouter --apply pour supprimer) ;
- ne réécrit pas l'historique Git : des blobs passés peuvent rester dans Git.
"""
import argparse
import datetime as dt
import json
import os
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
AUDIO_SUFFIXES = {".mp3", ".ogg", ".opus", ".wav", ".m4a", ".flac"}
FINISHED = {"terminee", "terminée", "termine", "terminé", "cloturee", "clôturée",
            "finished", "completed", "complete", "finie"}
PRESERVED = {"archive", "permanent", "conserver", "keep"}
MAX_BYTES_DEFAULT = 50 * 1024 * 1024

def tracked_files():
    raw = subprocess.check_output(["git", "ls-files", "-z", "--", "parties"], cwd=ROOT)
    return [Path(os.fsdecode(item)) for item in raw.split(b"\0") if item]

def last_commit(path):
    result = subprocess.run(
        ["git", "log", "-1", "--format=%ct", "--", str(path)],
        cwd=ROOT, capture_output=True, text=True, check=True,
    )
    return int(result.stdout.strip() or "0")

def load_json(path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}

def get_candidates():
    by_party = {}
    for relative in tracked_files():
        parts = relative.parts
        if len(parts) < 3 or parts[0] != "parties":
            continue
        party_id = parts[1]
        party_file = ROOT / "parties" / party_id / "partie.json"
        if not party_file.is_file():
            continue
        metadata = load_json(party_file)
        if str(metadata.get("statut", "")).lower().strip() not in FINISHED:
            continue  # une partie non terminée est toujours protégée
        kind = ""
        if len(parts) >= 4 and parts[2] == "audio" and relative.suffix.lower() in AUDIO_SUFFIXES:
            kind = "audio"
        elif len(parts) == 3 and parts[2] == "dialogues.ndjson":
            kind = "dialogues"
        elif len(parts) >= 5 and parts[2] == "dialogues" and parts[3] == "generated":
            kind = "dialogues"
        if not kind:
            continue
        absolute = ROOT / relative
        if not absolute.is_file():
            continue
        if kind == "audio":
            manifest = load_json(ROOT / "parties" / party_id / "audio" / "manifest.json")
            archived = {
                str(entry.get("chemin", "")) for entry in manifest.get("pistes", [])
                if isinstance(entry, dict) and str(entry.get("statut", "")).lower() in PRESERVED
            }
            if relative.name in archived or str(relative.relative_to(Path("parties") / party_id / "audio")) in archived:
                continue
        last_change = max(last_commit(relative), last_commit(Path("parties") / party_id / "partie.json"))
        by_party.setdefault(party_id, []).append((relative, kind, last_change, absolute.stat().st_size))
    return by_party

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--days", type=int, default=14, help="Jours après la dernière mise à jour (défaut : 14)")
    parser.add_argument("--max-mb", type=int, default=50, help="Budget global cible des médias temporaires (défaut : 50)")
    parser.add_argument("--apply", action="store_true", help="Effectuer les suppressions (sinon simulation)")
    args = parser.parse_args()
    if args.days < 1 or args.max_mb < 1:
        parser.error("--days et --max-mb doivent être positifs")
    now = dt.datetime.now(dt.timezone.utc).timestamp()
    items = [item for group in get_candidates().values() for item in group]
    budget = args.max_mb * 1024 * 1024
    expired = {str(path) for path, _, modified, _ in items if now - modified > args.days * 86400}
    remaining = sum(size for path, _, _, size in items if str(path) not in expired)
    # Quand le budget est dépassé, supprimer d'abord les anciens fichiers des parties terminées.
    for path, _, modified, size in sorted(items, key=lambda x: x[2]):
        if remaining <= budget:
            break
        if str(path) not in expired:
            expired.add(str(path))
            remaining -= size
    if not expired:
        print("Aucun fichier temporaire périmé suivi par Git.")
        return
    for path in sorted(expired):
        print(("SUPPRIMER" if args.apply else "SIMULATION") + " " + path)
        if args.apply:
            (ROOT / path).unlink()
    print(f"{len(expired)} fichiers ciblés. Les parties non terminées et les médias archivés sont conservés.")

if __name__ == "__main__":
    main()
