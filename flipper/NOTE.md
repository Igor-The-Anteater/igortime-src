# Flipper dell'isola di Igor — appunti condivisi

Fabio e Alessandro lavorano qui con i loro Claude. **Prima di ogni lavoro: `git pull`. Dopo: commit con una riga chiara + `git push`.** Aggiornare questo file quando si decide qualcosa.

## Dove sta
- Ramo: `flipper` (NON `main`: `main` è il sito vero su igortime.com, ci va solo quando Fabio dice "carica").
- Anteprima: l'anteprima Cloudflare Pages del ramo `flipper` → `https://flipper.igortime-src.pages.dev/flipper/` (se le anteprime dei rami sono attive in Cloudflare).
- Gioco web: `flipper/index.html` (tutto in un file: three.js r128 + fisica 2D propria + WebAudio). PWA: `manifest.webmanifest`, `sw.js`, icone.
- Il flipper è anche nel bar dell'isola (stazione "Igor's music pinball" in `index.html`) e nelle statistiche (`stats.js`, chiave `flipper`).

## Com'è fatto (v8, 22 nov 2026)
- Tema musicale: 7 corsie-nota DO…SI in alto, bumper = batteria (cassa, rullante, piatto) con contatore GROOVE (moltiplicatore), drop target A-N-T ×3 → POLIFONIA (multiball, le corsie si chiudono e suonano), rampa jackpot, Palco (saucer, "mistero"), orbita a sinistra, flipper piccolo in alto a sinistra.
- Flipper = lingue verdi di Igor che escono dal muso.
- Missioni alla Space Cadet: banderuola colpita 3 volte → missione pronta → Palco la avvia. 7 missioni: Accordi, Assolo di batteria, Fortissimo (statua), Che nota è?, Armatura, Metronomo, Melodia. Ogni missione = nuovo grado; tutte e 7 = GRAN CONCERTO (4 palline, tutto ×2), poi BIS.
- Missione compiuta: scritta grande, pallina bloccata, minigioco sul display a puntini: GNAM! (Igor prende 15 formiche di tofu) e BUM CIÀ! (due tamburi a ritmo).
- Isole: ogni tanto compare una palma / gondola / fungo; colpito, il tavolo diventa isola caraibica / lago di Gondoligor / bosco di John Cagigor per 60 s (musica, colori, ospite e bonus diversi).
- Musica di sottofondo generativa: tempo dalla velocità della pallina, energia dai colpi, stile per isola.
- Una sola formica di tofu che gira: mangiata = salva-palla (la quinta = palla extra).
- Super skill shot: lancio nella zona dorata → la pallina passa dal varco segreto vicino al DO e scende sul flipper piccolo.

## Regole decise da Fabio (non cambiarle senza chiedergli)
- Niente fisica finta, mai: la pallina non deve mai passare sotto le palette né fare cose fisicamente sbagliate. Non deve mai fermarsi sopra i flipper.
- Tema isola di Igor coi suoi personaggi, non fosforescente.
- Nei giochi niente nomi che richiamano titoli esistenti (no "Drum Hero", no "Drum Master").
- Frasi di Igor sempre positive.
- Scartata l'idea delle uova.
- Niente pubblicazione sul sito (`main`) senza il via di Fabio.

## Prossimi passi
- App Android nativa (Godot 4.3, molto più fluida del browser): in lavorazione da Fabio con Claude; il progetto andrà in `app-flipper/` su questo ramo, con le istruzioni per creare l'APK.
- Giro di feedback sulla v8.

## Registro
- 22 nov 2026 — Fabio: v8 caricata sul ramo `flipper` (prestazioni migliorate per Android, PWA installabile).
