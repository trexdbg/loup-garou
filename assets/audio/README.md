# Ambiances et bruitages

Le moteur `audio.js` crée les effets par synthèse Web Audio et lit les dialogues avec les voix françaises de l'appareil. **Il ne génère pas de fichiers à stocker dans GitHub**.

Option « Préférer les MP3 locaux » : si un fichier existe, le lecteur le charge, sinon il revient à la synthèse. Pour ajouter des fichiers réutilisables de petite taille, utiliser `assets/audio/ambient_night.mp3`, `ambient_day.mp3`, `ambient_forest.mp3`, `ambient_rain.mp3`, ou `wolf.mp3`, `bell.mp3`, `door.mp3`, `steps.mp3`, `night.mp3`, `dawn.mp3`, `reveal.mp3`, `heartbeat.mp3`, `clue.mp3`, `vote.mp3`.

Préférer **Opus ~24–48 kb/s** quand un navigateur récent suffit, sinon MP3 mono 32–48 kb/s pour la compatibilité. Le lecteur natif de cette première version recherche les .mp3.

Ne commitez **jamais** les milliers de dialogues uniques. Ils doivent rester en mémoire le temps de la lecture, ou être stockés temporairement hors Git avec un TTL court et un budget en taille.
