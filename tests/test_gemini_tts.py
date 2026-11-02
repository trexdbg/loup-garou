"""Offline, no-API tests for Gemini TTS preparation."""
import json
from pathlib import Path
import tempfile
import unittest

from scripts.generate_gemini_tts import public_lines, voice_for, generate


class GeminiTTSTests(unittest.TestCase):
    def test_never_synthesizes_player_or_secret_lines(self):
        with tempfile.TemporaryDirectory() as tmp:
            source = Path(tmp) / "dialogues.ndjson"
            rows = [
                {"seq": 1, "scene_id": "sc1", "public": True, "type": "dialogue_pnj",
                 "locuteur": "Rose", "texte": "Je ne suis pas Loup."},
                {"seq": 2, "scene_id": "sc1", "public": True, "type": "dialogue_joueur",
                 "locuteur": "Alex", "texte": "Tu es Loup ?"},
                {"seq": 3, "scene_id": "sc1", "public": False, "type": "dialogue_pnj",
                 "locuteur": "Rose", "texte": "Ceci est un secret."},
                {"seq": 4, "scene_id": "sc2", "public": True, "type": "narration",
                 "locuteur": "Narrateur", "texte": "Le jour se lève."},
            ]
            source.write_text("\n".join(json.dumps(x) for x in rows), encoding="utf-8")
            self.assertEqual([x["seq"] for x in public_lines(source, 2)], [1, 4])
            self.assertEqual([x["seq"] for x in public_lines(source, 1)], [4])

    def test_seven_stable_voices_and_narrator(self):
        cast = ["Rose", "Hugo", "Salomé", "Marin", "Inès", "Baptiste", "Jade"]
        self.assertEqual(len({voice_for(name, cast)[0] for name in cast}), 7)
        self.assertEqual(voice_for("Narrateur", cast)[0], "Charon")
        self.assertEqual(voice_for("Rose", cast), voice_for("Rose", cast))

    def test_no_secret_creates_only_public_manifest(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            party = root / "parties" / "LG-20261102-123456789ABC"
            party.mkdir(parents=True)
            (root / "parties" / "index.json").write_text(
                json.dumps({"parties": [{"id": party.name}]}), encoding="utf-8")
            (party / "partie.json").write_text(
                json.dumps({"personnages_pnj": [{"prenom": "Rose"}]}), encoding="utf-8")
            (party / "dialogues.ndjson").write_text(
                json.dumps({"seq": 1, "scene_id": "sc1", "public": True,
                            "type": "dialogue_pnj", "locuteur": "Rose",
                            "texte": "Bonjour."}), encoding="utf-8")
            (party / "secrets_mj.json").write_text(
                '{"secret":"NE PAS LIRE"}', encoding="utf-8")
            self.assertEqual(generate(root, root / "site", root / "cache", 10, 3, ""), 0)
            manifest = json.loads((root / "site" / "parties" / party.name /
                                   "audio" / "manifest.json").read_text(encoding="utf-8"))
            self.assertEqual(manifest["lines"], {})
            self.assertNotIn("NE PAS LIRE", json.dumps(manifest))


if __name__ == "__main__":
    unittest.main()
