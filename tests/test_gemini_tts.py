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

    def test_latest_game_is_processed_first_even_for_same_day(self):
        from unittest.mock import patch
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            older = root / "parties" / "LG-20261102-AAAAAAAAAAAA"
            newer = root / "parties" / "LG-20261102-BBBBBBBBBBBB"
            for directory in (older, newer):
                directory.mkdir(parents=True)
                (directory / "partie.json").write_text('{"personnages_pnj":[]}', encoding="utf-8")
                (directory / "dialogues.ndjson").write_text(
                    json.dumps({"seq": 1, "scene_id": "prologue", "public": True,
                                "type": "narration", "locuteur": "Narrateur",
                                "texte": directory.name}), encoding="utf-8")
            (root / "parties" / "index.json").write_text(
                json.dumps({"parties": [
                    {"id": older.name, "cree_le": "2026-11-02"},
                    {"id": newer.name, "cree_le": "2026-11-02"}
                ]}), encoding="utf-8")
            seen = []
            def fake_synthesize(text, voice, style, api_key):
                seen.append(text)
                return b"mock", "audio/pcm"
            def fake_mp3(data, mime, path):
                path.write_bytes(b"mock mp3")
            with patch("scripts.generate_gemini_tts.synthesize", fake_synthesize), \
                 patch("scripts.generate_gemini_tts.make_mp3", fake_mp3), \
                 patch("scripts.generate_gemini_tts.time.sleep", lambda seconds: None):
                self.assertEqual(generate(root, root / "site", root / "cache", 1, 3, "test-key"), 1)
            self.assertEqual(seen, [newer.name])

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
