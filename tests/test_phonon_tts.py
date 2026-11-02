"""Tests hors réseau du catalogue de 15 voix et des scènes Phonon."""
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from scripts.generate_phonon_tts import catalog, generate, read_lines, voice_for, filename_for


class PhononTTSUnitTests(unittest.TestCase):
    def setUp(self):
        self.root = Path(__file__).resolve().parent.parent

    def test_fifteen_different_french_voices(self):
        roster = catalog(self.root)
        self.assertEqual(len(roster), 15)
        self.assertEqual(len({p["voix"] for p in roster.values()}), 15)
        self.assertEqual(len([p for p in roster.values() if p["genre"] == "f"]), 9)
        self.assertEqual(len([p for p in roster.values() if p["genre"] == "m"]), 6)
        self.assertEqual(voice_for("Rose", roster), "Noémie")
        self.assertEqual(voice_for("Hugo", roster), "Augustin")
        self.assertIsNone(voice_for("Alex", roster))

    def test_only_public_dialogue_is_read(self):
        with tempfile.TemporaryDirectory() as tmp:
            filename = Path(tmp) / "dialogues.ndjson"
            entries = [
                {"seq": 1, "public": True, "type": "dialogue_pnj", "locuteur": "Rose",
                 "scene_id": "A", "texte": "Bonjour."},
                {"seq": 2, "public": True, "type": "dialogue_joueur", "locuteur": "Alex",
                 "scene_id": "A", "texte": "C'est moi."},
                {"seq": 3, "public": False, "type": "dialogue_pnj", "locuteur": "Hugo",
                 "scene_id": "A", "texte": "SECRET LOUP"},
                {"seq": 4, "public": True, "type": "narration", "locuteur": "Narrateur",
                 "scene_id": "B", "texte": "Le village s'endort."},
                {"seq": 5, "public": True, "audio": False, "type": "dialogue_pnj",
                 "locuteur": "Rose", "scene_id": "B", "texte": "Invisible."},
            ]
            filename.write_text("\n".join(json.dumps(x) for x in entries), encoding="utf-8")
            self.assertEqual([r["seq"] for r in read_lines(filename, 2)], [1, 4])
            self.assertEqual([r["seq"] for r in read_lines(filename, 1)], [4])

    def test_generation_is_cached_and_preserves_legacy_clip_on_failure(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            voices = root / "voices"
            voices.mkdir()
            (voices / "phonon-fr.json").write_text(
                (self.root / "voices" / "phonon-fr.json").read_text(encoding="utf-8"), encoding="utf-8")
            party = root / "parties" / "LG-20261102-123456789ABC"
            party.mkdir(parents=True)
            (root / "parties" / "index.json").write_text(
                json.dumps({"parties": [{"id": party.name, "statut": "en_cours"}]}), encoding="utf-8")
            rows = [
                {"seq": 1, "public": True, "type": "dialogue_pnj", "locuteur": "Rose",
                 "scene_id": "A", "texte": "Bonsoir."},
                {"seq": 2, "public": True, "type": "dialogue_joueur", "locuteur": "Alex",
                 "scene_id": "A", "texte": "Je vote."},
                {"seq": 3, "public": False, "type": "dialogue_pnj", "locuteur": "Hugo",
                 "scene_id": "A", "texte": "SECRETS_MJ"}
            ]
            (party / "dialogues.ndjson").write_text("\n".join(map(json.dumps, rows)), encoding="utf-8")
            (party / "secrets_mj.json").write_text('{"loup":"Rose"}', encoding="utf-8")
            calls = []
            def fake_synth(text, voice, dest):
                calls.append((text, voice))
                dest.write_bytes(b"MP3 fake binary")
            with patch("scripts.generate_phonon_tts.synthesize", fake_synth):
                result = generate(root, root / "site", root / "cache", 10, 3, True)
                result2 = generate(root, root / "site", root / "cache", 10, 3, True)
            self.assertEqual(result["generated"], 1)
            self.assertEqual(result2["generated"], 0)
            self.assertEqual(calls, [("Bonsoir.", "Noémie")])
            manifest = json.loads((root / "site" / "parties" / party.name /
                                   "audio" / "manifest.json").read_text(encoding="utf-8"))
            self.assertEqual(set(manifest["lines"]), {"1"})
            self.assertEqual(manifest["lines"]["1"]["provider"], "phonon")
            self.assertEqual(manifest["lines"]["1"]["voice"], "Noémie")
            self.assertNotIn("SECRETS_MJ", json.dumps(manifest))
            self.assertNotIn("Je vote.", json.dumps(manifest))

    def test_only_changed_party_is_synthesized(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "voices").mkdir()
            (root / "voices" / "phonon-fr.json").write_text(
                (self.root / "voices" / "phonon-fr.json").read_text(encoding="utf-8"),
                encoding="utf-8")
            party = root / "parties" / "LG-20261102-123456789ABC"
            party.mkdir(parents=True)
            (root / "parties" / "index.json").write_text(
                json.dumps({"parties": [{"id": party.name, "statut": "en_cours"}]}),
                encoding="utf-8")
            (party / "dialogues.ndjson").write_text(
                json.dumps({"seq": 1, "public": True, "type": "dialogue_pnj",
                            "locuteur": "Rose", "scene_id": "jour_2",
                            "texte": "Un soupçon."}), encoding="utf-8")
            with patch.dict("os.environ", {"LG_TTS_PARTY": "__none__"}), patch(
                    "scripts.generate_phonon_tts.synthesize") as synth:
                outcome = generate(root, root / "site", root / "cache", 4, 1, True)
            self.assertEqual(outcome["generated"], 0)
            synth.assert_not_called()

    def test_no_hf_token_does_not_call_synthesis(self):
        with patch("scripts.generate_phonon_tts.synthesize") as s:
            with tempfile.TemporaryDirectory() as tmp:
                root = Path(tmp)
                (root / "voices").mkdir()
                (root / "voices" / "phonon-fr.json").write_text(
                    (self.root / "voices" / "phonon-fr.json").read_text(encoding="utf-8"), encoding="utf-8")
                (root / "parties").mkdir()
                (root / "parties" / "index.json").write_text(
                    '{"parties":[]}', encoding="utf-8")
                self.assertEqual(generate(root, root / "site", root / "cache", 10, 3, False)["generated"], 0)
            s.assert_not_called()


if __name__ == "__main__":
    unittest.main()
