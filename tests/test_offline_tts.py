"""Tests unitaires hors-ligne du moteur audio de secours (aucun appel réseau)."""
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from scripts.generate_offline_tts import approved_lines, generate, profile


class OfflineTTSTests(unittest.TestCase):
    def test_secrets_et_paroles_joueur_ne_sont_jamais_synthetises(self):
        with tempfile.TemporaryDirectory() as directory:
            site = Path(directory)
            party = site / "parties" / "LG-20261102-1890BFF86FD5"
            party.mkdir(parents=True)
            (party / "partie.json").write_text(json.dumps({
                "personnages_pnj": [{"prenom": "Rose"}, {"prenom": "Hugo"}]
            }), encoding="utf-8")
            rows = [
                {"seq": 1, "scene_id": "tour_de_table_01", "public": True,
                 "type": "dialogue_pnj", "locuteur": "Rose", "texte": "Bonjour."},
                {"seq": 2, "scene_id": "tour_de_table_01", "public": False,
                 "type": "dialogue_pnj", "locuteur": "Hugo", "texte": "SECRET"},
                {"seq": 3, "scene_id": "tour_de_table_01", "public": True,
                 "type": "dialogue_joueur", "locuteur": "André", "texte": "C'est moi."},
                {"seq": 4, "scene_id": "tour_de_table_01", "public": True,
                 "type": "dialogue_pnj", "locuteur": "Hugo", "texte": "Je me méfie."},
            ]
            (party / "dialogues.ndjson").write_text(
                "\n".join(json.dumps(row, ensure_ascii=False) for row in rows),
                encoding="utf-8"
            )
            (party / "secrets_mj.json").write_text(
                '{"notes":"SECRET MJ"}', encoding="utf-8"
            )
            seen = []

            def fake_mp3(text, path, voice, speed, pitch):
                seen.append((text, voice, speed, pitch))
                path.write_bytes(b"MP3 mock")

            with patch("scripts.generate_offline_tts.synthesize_mp3", fake_mp3):
                generated, reused = generate(site)
            self.assertEqual((generated, reused), (2, 0))
            self.assertEqual([x[0] for x in seen], ["Bonjour.", "Je me méfie."])
            manifest = json.loads((party / "audio" / "manifest.json").read_text(encoding="utf-8"))
            self.assertEqual(set(manifest["lines"]), {"1", "4"})
            self.assertEqual(manifest["stats"]["available"], 2)
            self.assertEqual(manifest["stats"]["missing"], 0)
            self.assertNotIn("SECRET", json.dumps(manifest))
            self.assertNotIn("C'est moi.", json.dumps(manifest))

    def test_mp3_gemini_existants_restent_prioritaires(self):
        with tempfile.TemporaryDirectory() as directory:
            party = Path(directory) / "parties" / "LG-20261102-1890BFF86FD5"
            (party / "audio").mkdir(parents=True)
            row = {"seq": 1, "scene_id": "s", "public": True,
                   "type": "narration", "locuteur": "Narrateur",
                   "texte": "Voici le village."}
            (party / "dialogues.ndjson").write_text(json.dumps(row), encoding="utf-8")
            (party / "partie.json").write_text('{"personnages_pnj":[]}', encoding="utf-8")
            name = "a" * 20 + ".mp3"
            (party / "audio" / name).write_bytes(b"original gemini")
            manifest = {"version": 1, "provider": "gemini",
                        "lines": {"1": {"file": "audio/" + name,
                                         "locuteur": "Narrateur",
                                         "texte": "Voici le village.",
                                         "model": "gemini-3.8-flash-lite-tts"}},
                        "stats": {"quota_exhausted": True}}
            (party / "audio" / "manifest.json").write_text(json.dumps(manifest), encoding="utf-8")
            with patch("scripts.generate_offline_tts.synthesize_mp3") as synth:
                created, reused = generate(Path(directory))
            self.assertEqual((created, reused), (0, 1))
            synth.assert_not_called()
            current = json.loads((party / "audio" / "manifest.json").read_text(encoding="utf-8"))
            self.assertEqual(current["lines"]["1"]["model"], "gemini-3.8-flash-lite-tts")
            self.assertEqual(current["stats"]["available"], 1)

    def test_voix_distinctes_et_narrateur(self):
        seven = ["Rose", "Hugo", "Célia", "Éloi", "Alice", "Martin", "Odette"]
        self.assertEqual(len({profile(name, seven) for name in seven}), 7)
        self.assertNotEqual(profile("Narrateur", seven), profile("Rose", seven))


if __name__ == "__main__":
    unittest.main()
