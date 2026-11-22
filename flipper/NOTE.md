# Flipper dell'isola di Igor — appunti condivisi

Fabio e Alessandro lavorano qui con i loro Claude. **Prima di ogni lavoro: `git pull`. Dopo: commit con una riga chiara + `git push`.** Aggiornare questo file quando si decide qualcosa.

## Dove sta
- Ramo: `flipper` (NON `main`: `main` è il sito vero su igortime.com, ci va solo quando Fabio dice "carica").
- Anteprima (si aggiorna da sola a ogni push sul ramo, in 1–2 minuti): https://flipper.igortime.pages.dev/flipper/ — il bar col flipper: https://flipper.igortime.pages.dev/
- Gioco web: `flipper/index.html` (tutto in un file: three.js r128 + fisica 2D propria + WebAudio). PWA: `manifest.webmanifest`, `sw.js`, icone.
- Il flipper è anche nel bar dell'isola (stazione "Igor's music pinball" in `index.html`) e nelle statistiche (`stats.js`, chiave `flipper`).

## Com'è fatto (v10, 22 nov 2026)
- Tema musicale: 7 corsie-nota DO…SI in alto, bumper = batteria (cassa, rullante, piatto) con contatore GROOVE (moltiplicatore), drop target A-N-T ×3 → POLIFONIA (multiball), rampa jackpot, Palco (saucer, "mistero"), orbita a sinistra, flipper piccolo in alto a sinistra.
- Quando le corsie diventano dure (POLIFONIA, GRAN CONCERTO) sono i tasti di uno **xilofono**: lunghezze diverse (DO il più lungo) e una bacchetta batte il tasto colpito.
- Flipper = lingue verdi di Igor che escono dal muso.
- **Corsie laterali (outlane)**: un tappo verde per lato rimanda la pallina nel campo, **una volta per palla** (si ricarica a ogni palla nuova).
- **Bumper centrale** tra i flipper: ball saver temporaneo di 15 s, compare da evento speciale (missione compiuta, GRAN CONCERTO); una stellina azzurra piccola a metà campo allunga di 5 s (max 40 s). Il timer non corre durante il minigioco.
- Missioni alla Space Cadet: banderuola colpita 3 volte → missione pronta → Palco la avvia. 7 missioni: Accordi, Assolo di batteria, Fortissimo (statua), Che nota è?, Armatura, Metronomo, Melodia. Ogni missione = nuovo grado; tutte e 7 = GRAN CONCERTO (4 palline, tutto ×2), poi BIS.
- **Extra ball**: alla 4ª e alla 7ª missione completata (più la 5ª formica di tofu).
- **Scenari legati alle missioni** (le palme/gondole/funghi a gettone sono stati tolti): lo scenario cambia solo mentre una missione è in corso e torna "casa" a fine missione. Accordi=casa, Assolo=bosco di John Cagigor, Fortissimo e Che nota è?=lago di Gondoligor, Armatura/Metronomo/Melodia=isola caraibica (musica con steel pan). I bonus ×2 dell'isola restano (rampa/orbita/batteria).
- Missione compiuta: scritta grande, pallina bloccata, **la telecamera zooma sul pannello a puntini già esistente** (stessa risoluzione 128×32) che diventa il minigioco; sotto, istruzioni di due righe in testo grande. Giochi: GNAM! e BUM CIÀ!
  - GNAM!: in orizzontale, Igor va su/giù coi due flipper; 12 formiche bianche (da prendere) e 6 rosse (da evitare: toccarne una finisce il gioco). Le formiche **accelerano** fino alla 10ª (da ~60 a ~160 px/s, intervalli sempre più corti) e poi restano velocissime. Pattern casuale ma sempre uguale, così si impara; è sempre possibile prenderle tutte (bonus 300.000).
  - BUM CIÀ!: riff di batteria a tempo (100 bpm, griglia regolare, senza pause lunghe), 40 note su due righe: alta = flipper sinistro (cassa), bassa = destro (rullante). Il pannello mostra lo scarto in millisecondi di ogni colpo; punti = 20.000·(1−scarto/180 ms)²; il bonus finale dipende dallo scarto medio, non dal numero di colpi.
- **Che nota è?**: quando Igor suona la nota ci sono segnali visivi: scritta "IGOR SUONA / ASCOLTA!" sul pannello, salto di Igor, note ♪ che salgono e scintille.
- Musica di sottofondo generativa: tempo dalla velocità della pallina, energia dai colpi, stile per scenario.
- Una sola formica di tofu che gira: mangiata = salva-palla (la quinta = palla extra).
- Skill shot: una delle 7 corsie-nota a caso, diversa a ogni palla (4 s dal lancio). Il super skill shot e la zona dorata sono stati tolti.
- Sopra le 7 corsie c'è un **fermo a senso unico**: la pallina che sale dalle corsie rimbalza e ricade nella stessa corsia (quella che arriva dall'alto dopo il lancio entra normalmente). Una pallina che ricade non conta due volte.

## Regole decise da Fabio (non cambiarle senza chiedergli)
- Niente fisica finta, mai: la pallina non deve mai passare sotto le palette né fare cose fisicamente sbagliate. Non deve mai fermarsi sopra i flipper.
- Tema isola di Igor coi suoi personaggi, non fosforescente.
- Nei giochi niente nomi che richiamano titoli esistenti (no "Drum Hero", no "Drum Master").
- Frasi di Igor sempre positive.
- Scartata l'idea delle uova.
- Niente pubblicazione sul sito (`main`) senza il via di Fabio.

## Prossimi passi
- App Android nativa (Godot 4.3): in `app-flipper/` (vedi il suo README). Le modifiche alle regole vanno fatte sia in `flipper/index.html` sia in `app-flipper/main.gd`.
- Giro di feedback sulla v8.

## Registro
- 22 nov 2026 — Fabio: app Android 1.0 (Godot) in `app-flipper/`.
- 22 nov 2026 — Fabio: v8 caricata sul ramo `flipper` (prestazioni migliorate per Android, PWA installabile).
- 22 nov 2026 — Alessandro (con Claude): v9 — outlane salva-palla (una volta per palla), bumper centrale temporaneo 15 s (+5 s con la stellina), extra ball a missione 4 e 7, scenari legati alle missioni (tolti i gettoni palma/gondola/fungo), tasti-xilofono con bacchetta, minigioco con zoom sul pannello a puntini (GNAM! orizzontale con formiche rosse/bianche, istruzioni a due righe). Fabio: guarda in particolare la tolta dei gettoni e la fisica del kickback (la pallina segue un percorso guidato dal tappo al campo).
- 22 nov 2026 — Alessandro (con Claude): modalità prova: aprendo il gioco con `?prova` (es. https://flipper.igortime.pages.dev/flipper/?prova) i tasti 1–7 saltano dentro la missione scelta (le precedenti contano come fatte, così si provano extra ball 4 e 7) e 0 completa la missione in corso (minigioco + bumper centrale + extra ball). Senza `?prova` non cambia nulla.
- 22 nov 2026 — Alessandro (con Claude): v10 — solo skill shot casuale (tolto il super skill shot), fermo a senso unico sopra le corsie-nota, GNAM! molto più veloce con accelerazione fino alla 10ª formica, BUM CIÀ! con riff a tempo e punteggio in millisecondi, segnali visivi in "Che nota è?".

## Ancora aperti (non fatti, da decidere)
- Missione Fiati: versione semplificata (ogni strumento sta in una corsia, i flipper li spostano). Manca il lock di 4-5 palle con 10 s di frenzy.
- Missione Melodia: le note compaiono come bersagli in mezzo al campo (più facili ma rischiosi), alla fine suona la melodia. Da chiarire quali note e se in ordine.
- Vista zoomata con camera che scorre (stile Balls of Steel): tasto sul desktop, su Android girando il telefono.

## Tasti di prova (solo con `?prova` nell'indirizzo)
1-7 entra nella missione · 0 completa la missione · E palla extra · P polifonia · G Gran Concerto · B bumper centrale · K ricarica i salva-palla (kickback) · F missione pronta al Palco · Q GNAM! · W BUM CIÀ! · R Igor Racing · T bicchieri.

- 2026-11-22 Claude (Alessandro): polifonia riscritta (v11): le palline che arrivano da sopra restano ferme nelle corsie (magnete, max 7 s); da sotto suonano una volta sola; le ferme risuonano solo quando arriva un'altra pallina; timer "insieme" con bonus per secondi e voci; accordo extra; la polifonia finisce quando resta una sola pallina.
- Idea da fare (Alessandro): vista zoomata con camera che scorre (stile Balls of Steel): tasto sul desktop, su Android girando il telefono.
- 2026-11-22 Claude (Alessandro): v12: secondo flipper piccolo in alto a destra (FRU, comandato dal tasto destro, specchio di FLU) per mandare la palla ai bumper e alle lane piccole delle note; corretta la scritta "undefined → ff" all'inizio della missione Fortissimo.
- 2026-11-22 Claude (Alessandro): v13: (1) luci a rotazione: nelle missioni Accordi e Fiati i flipper spostano le luci accese/gli strumenti tra le corsie; (2) l'Armatura è sostituita dalla missione Fiati (1ª volta clarinetto, flauto, oboe, fagotto; 2ª giro + sax; poi ottoni corno, tromba, trombone, tuba, eufonio); (3) minigioco Igor Racing (solo bici; avversari Carla la balena e la formica di tofu gigante; metronomo che accelera e rallenta se si sbaglia; Igor in affanno fa PUFF; 1º premio pieno, 2º metà, ultimo niente); (4) minigioco dei bicchieri (4 suoni, mescolata deterministica diversa a ogni volta, 3 domande; solo bianco, scuro e rosso); (5) rotazione minigiochi: GNAM, BUM CIÀ, Igor Racing, bicchieri; (6) tasti di prova estesi.
