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
- 2026-11-25 Claude (Alessandro): v14: (1) Igor Racing tolto dalla rotazione (da ripensare: non si capiva cosa fare; il codice resta, tasto R in `?prova`); (2) i bicchieri diventano il gioco "Ricorda la melodia": 3 note scritte e suonate, coperte da 3 bicchieri, una mano li mescola lentamente, poi i bicchieri risuonano in fila accendendosi, poi si suona la melodia nell'ordine giusto (8 s; tastiera: flipper per muoversi e Spazio/plunger per scegliere; telefono: tocco sul bicchiere), poi suona la tua melodia e poi quella vera; 1/3 del premio per ogni nota al posto giusto; pannello ad alta risoluzione con look analogico (solo per questo gioco); (3) la stellina del bumper centrale è ora uno strumento 3D rotante con campana (clarinetto, corno, tromba, oboe, sax: cambia a ogni colpo, +5 s); (4) la bandierina è chiamata "biglietto del concerto" nei testi.
- Da fare (Alessandro, 25/11): pannello alto in stile flipper commerciale (alta risoluzione, scritte grandi, luci più analogiche), scritte delle rampe più leggibili, rampe metalliche sopraelevate con cose che succedono sotto, piccoli target nei punti morti, altre migliorie in arrivo.
- v16 (Claude di Alessandro): pannello hi-res con istruzioni dentro (zoom sullo stesso pannello, niente testo fuori), risultati positivi (PERFETTO / BRAVO / BUONA FORTUNA PER LA PROSSIMA), BUM CIÀ con R sopra e L sotto e pause visibili, silenzio nei minigiochi, camera dall'alto, lingue rosa, contatore extra ball, legenda tasti verticale (Y = polifonia), pallina più lenta (VMAX 30), accordi 75 s.
  Ancora NON fatto: Mad Metronome, Orchestra (al posto di Fiati), strumento centrale con campana che cattura e spara, rampe in metallo trasparenti con azione sotto, target nei punti morti, Igorino che suona in "Che nota è?", etichette più grandi (STAGE/PALCO).
- v18 (Claude di Alessandro): camera di nuovo in prospettiva 3D (ripristinata, fov 32-38, inclinazione ~52-57°), cornice più stretta, rampa con guide di metallo più spesse, sostegni con base e superficie più trasparente, occhi che chiudendosi diventano verdi (spariscono bianco e pupilla), lingue più tonde.
- v19 (Claude di Alessandro): camera più dall'alto (fov 24-26, pitch ~1.2) per riempire lo schermo come nei flipper commerciali, pannello a vetro scuro senza cornice di legno, ombra morbida della rampa sul campo. Provate le ombre reali (shadow map): annerivano il campo, tolte.
- v20 (Claude di Alessandro): pannello a tutta larghezza; cornice più sottile; etichette grandi (PALCO = la buca viola, BIGLIETTO CONCERTO, RAMPA JACKPOT, GROOVE, ORBIT); bocca scura sulle lingue; strumento centrale disteso e rotante: se la pallina entra nella campana suona fortissimo e la spara nella direzione della campana (mai verso il fondo), +5 s; Mad Metronome (metronomo gigante al centro, BPM 60→120 continuo, battute 1-2-3-4 in ordine, punti BPM×1000, 4 battute, 75 s); Orchestra al posto dei Fiati (passi nella corsia → botola → sale lo strumento-bumper; colpiscili tutti e 7, 75 s); Igorino col sax in "Che nota è?"; 6 piccoli target nei punti morti (tutti = 100.000); la pallina accelera nella rampa.
  Ancora da fare: pannello inclinato/integrato come nei flipper veri, lingua disegnata più realistica, oggetti più lucidi, test su touch/Android.
- v21: camera riportata a prospettiva marcata (fov 36, pitch ~1.0) e margini minimi: il campo ora riempie tutta la larghezza dello schermo (prima in v19 sprecava ~30% di spazio ai lati).
- v22: tavolo allargato del 30% (KX=1.3): il campo riempie tutto lo schermo del telefono; fisica invariata (solo le posizioni sono allargate, le forme tonde restano tonde). Trucco: table.scale.x=KX + controscala sulle geometrie tonde.
- v23: seconda rampa 'Ponte' sopraelevata sopra il Palco e i piccoli target (entrata davanti al flipper alto sinistro, uscita sul flipper alto destro), guide di metallo e sostegni, +25.000.
- v24: orbita destra sopraelevata (entrata sul muro destro a y≈9.5, uscita nei tamburi, +20.000, combo).
- v25: materiali più lucidi: mappa di riflessi con softbox bianchi e bande scure, cromo/oro/plastica con più riflesso (bumper, guide, rampe).
