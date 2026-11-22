# Flipper di Igor — app Android (Godot 4.3)

Versione nativa del flipper web, molto più fluida su Android. Basata sulla **v8** del web (la v9 di Alessandro non è ancora riportata qui).
Stessa fisica e stesse regole del web riscritte in GDScript; tavolo 3D, personaggi e suoni esportati dalla versione web.

## File
- `main.gd` — fisica (come il web: R=.27, G=32, 600 passi/s, con griglia per le collisioni), regole, missioni, isole, musica generativa. Le funzioni hanno gli stessi nomi del JS (`lane_hit`, `ramp_done`, `saucer_award`…).
- `ui.gd` — display a puntini, grembiule (texture sul tavolo), fumetti, punteggi, minigiochi GNAM!/BUM CIÀ!, schermate, comandi touch.
- `audio.gd` — suoni (campioni renderizzati dal WebAudio del web), riverbero, compressore.
- `assets/table_it.glb`, `table_en.glb` — il tavolo esportato da three.js con i nodi nominati (flip0, drum0, ins3…); `assets/data.json` — segmenti, cerchi, rampa, inserti.
- `tools/` — script puppeteer per riesportare grafica e suoni dal web (servono Chrome, `npm i three@0.128.0 puppeteer-core`, il sito servito in locale su :8765 con `tools/export-page.html` in `/exp/` e `flipper/index.html` esposto come `body_exp.js`).

## Creare l'APK
1. Godot 4.3 + export templates Android (senza Gradle).
2. `godot --headless --path app-flipper --export-release "Android" flipper.apk`
3. Firma con la chiave di Igor Time (`igortime-flipper.jks`, NON nel repo: chiederla a Fabio). Stessa chiave = gli aggiornamenti si installano sopra senza disinstallare:
   `java -jar uber-apk-signer.jar -a flipper.apk --ks igortime-flipper.jks --ksAlias igortime`

## Prova senza telefono
`xvfb-run godot --rendering-driver opengl3 --path app-flipper -- shot it scn=arc` → gioca da solo e salva /tmp/gshot_*.png (scenari: arc, carib, lake, shroom, chords, ff, poly).
