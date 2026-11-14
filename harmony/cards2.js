/* Igor Time · the harmony course, lessons 50–98 corrected for beginners (14 Nov 2026, audit C/D).
   Loaded after cards.js: it overwrites HM_CARDS[n] (the blackboard cards) and HM_EX[n] (the exercises) for n = 50–97.
   A card is [en, it, demo]. Four-voice demos list the voices from the bottom: bass, tenor (bass staff, _b), alto, soprano (treble staff, _t).
   Every four-voice example has been checked: no parallel fifths or octaves, leading note rising, voices in range, no gaps over an octave.
   Lessons 58, 68, 80, 88, 98 are checks: they take their questions from the lessons of their unit. */
(function(){
const C=window.HM_CARDS||(window.HM_CARDS={}),E=window.HM_EX||(window.HM_EX={});
const K=(lo,hi,on,more)=>({lo,hi,on:on||{},names:1,...(more||{})});
const q=(en,it,oen,oit)=>['mcq',{q:[en,it],o:oen.map((x,i)=>[x,oit[i]])}];
/* the four-voice chords used on the boards (bass, tenor, alto, soprano), all in C major */
const I1='C3_b G3_b E4_t C5_t',IV1='F2_b A3_b F4_t C5_t',V1='G2_b G3_b D4_t B4_t';

/* ======================= 5. WRITING IN FOUR VOICES (50–57) ======================= */
C[50]=[
 ['The most famous rule of harmony: no <b>parallel fifths</b> and no <b>parallel octaves</b>. If two voices are a fifth apart and move <b>in the same direction</b> to another fifth, they stop sounding like two voices and melt into one.','La regola più famosa dell’armonia: niente <b>quinte parallele</b> e niente <b>ottave parallele</b>. Se due voci sono a distanza di quinta e si muovono <b>nella stessa direzione</b> verso un’altra quinta, smettono di sembrare due voci e si fondono in una.'],
 ['Here all four voices go up one step together. Bass and tenor: C–G, then D–A, a fifth and again a fifth. Bass and soprano: C–C, then D–D, an octave and again an octave. Both are forbidden.','Qui tutte e quattro le voci salgono insieme di un gradino. Basso e tenore: Do–Sol, poi Re–La, una quinta e ancora una quinta. Basso e soprano: Do–Do, poi Re–Re, un’ottava e ancora un’ottava. Tutte e due vietate.',{clef:'g',cols:['C3_b G3_b E4_t C5_t','D3_b A3_b F4_t D5_t=⚠']}],
 ['How to spot them: take the voices two by two. Fifth → fifth, or octave → octave, with both voices moving the same way = parallel, forbidden. In this course we also avoid it when they move in opposite directions (contrary motion): whenever both voices move, don’t land again on a fifth or an octave. Fifth → any other interval = all good.','Come accorgersene: prendi le voci a due a due. Quinta → quinta, oppure ottava → ottava, con tutte e due le voci che vanno nella stessa direzione = parallele, vietato. In questo corso lo evitiamo anche quando vanno in direzioni opposte (moto contrario): se si muovono tutte e due, non arrivare di nuovo su una quinta o un’ottava. Quinta → un altro intervallo qualsiasi = tutto bene.'],
 ['The easy cure: when the bass goes up, move the upper voices <b>down</b> (contrary motion), taking care not to land again on a fifth or an octave. Same two chords, now without parallels.','La cura facile: quando il basso sale, porta le voci superiori <b>in giù</b> (moto contrario), facendo attenzione a non arrivare di nuovo su una quinta o un’ottava. Gli stessi due accordi, ora senza parallele.',{clef:'g',cols:['C3_b G3_b E4_t C5_t','D3_b F3_b D4_t A4_t=ok']}]];
E[50]=[['par'],['par'],['par']];

C[51]=[
 ['A sneakier relative: the <b>hidden</b> fifths and octaves. Bass and soprano go the same way and land on a fifth or an octave, and the soprano gets there with a <b>leap</b>. Here: bass C → G, going up; the soprano leaps up E → G and lands on the same G as the bass, two octaves higher: a hidden octave. Avoid it.','Un parente più subdolo: le quinte e ottave <b>nascoste</b>. Basso e soprano vanno nella stessa direzione e arrivano su una quinta o un’ottava, e il soprano ci arriva con un <b>salto</b>. Qui: il basso sale Do → Sol; il soprano sale con un salto Mi → Sol e arriva sullo stesso Sol del basso, due ottave sopra: un’ottava nascosta. Da evitare.',{clef:'g',cols:['C3_b C4_b G4_t E5_t=I','G3_b D4_b B4_t G5_t=V ⚠']}],
 ['But if the soprano moves <b>by step</b> (grado congiunto: to the very next note, a second), it is allowed: the small step hides the problem. Here the bass goes G → C and the soprano B → C, one step.','Ma se il soprano si muove <b>per grado congiunto</b> (alla nota subito accanto, una seconda), è permesso: il passettino nasconde il problema. Qui il basso va Sol → Do e il soprano Si → Do, un passo.',{clef:'g',cols:['G2_b D4_b G4_t B4_t=V','C3_b E4_b G4_t C5_t=I ok']}],
 ['The trick: this rule is only about <b>bass and soprano</b>, and only when the soprano leaps.','Il trucco: questa regola riguarda solo <b>basso e soprano</b>, e solo quando il soprano salta.']];
E[51]=[q('Hidden octaves between bass and soprano are allowed when…','Le ottave nascoste tra basso e soprano sono permesse quando…',['the soprano moves by step','the bass moves by step','both voices leap'],['il soprano si muove per grado congiunto','il basso si muove per grado congiunto','entrambe le voci saltano']),['par']];

C[52]=[
 ['When two chords have a note in common, let the same singer <b>keep it</b>. It’s the smoothest connection: like going from one room to the next through a door that is already open.','Quando due accordi hanno una nota in comune, lascia che lo stesso cantante la <b>tenga</b>. È il collegamento più morbido: come passare da una stanza all’altra da una porta già aperta.'],
 ['I → IV in C major: C is in both chords (C–E–G and F–A–C). The soprano keeps its C; the tenor and the alto take a small step up.','I → IV in Do maggiore: il Do sta in tutti e due gli accordi (Do–Mi–Sol e Fa–La–Do). Il soprano tiene il suo Do; tenore e contralto fanno un passettino in su.',{clef:'g',cols:[I1+'=I',IV1+'=IV']}]];
E[52]=[['compl'],['compl']];

C[53]=[
 ['The other voices go to the <b>nearest</b> note of the new chord, if possible <b>by step</b> (grado congiunto: to the next note). Singers are lazy, and they sing better that way!','Le altre voci vanno sulla nota <b>più vicina</b> del nuovo accordo, se possibile <b>per grado congiunto</b> (alla nota accanto). I cantanti sono pigri, e così cantano meglio!'],
 ['I → V: the tenor keeps G (common note), the alto goes E → D, the soprano C → B: one step each. Only the bass leaps, C → G: it carries the roots of the chords.','I → V: il tenore tiene il Sol (nota comune), il contralto va Mi → Re, il soprano Do → Si: un passo ciascuno. Solo il basso salta, Do → Sol: porta le fondamentali degli accordi.',{clef:'g',cols:[I1+'=I',V1+'=V']}]];
E[53]=[['compl'],['compl']];

C[54]=[
 ['Remember the leading note, the step just below the tonic? Like a magnet, it is pulled up to the tonic. From V to I, the voice that has it <b>goes up a semitone</b>.','Ricordi la sensibile, il gradino subito sotto la tonica? Come una calamita, è attratta verso l’alto, verso la tonica. Da V a I, la voce che ce l’ha <b>sale di un semitono</b>.',{kbd:K('G4','C5',{'B4':'p','C5':'y'},{arcs:[['B4','C5',['up!','su!'],1]]}),cols:['B4|C5']}],
 ['In C major the leading note is B: B goes to C. Always. Here the soprano has it: B → C.','In Do maggiore la sensibile è il Si: il Si va al Do. Sempre. Qui ce l’ha il soprano: Si → Do.',{clef:'g',cols:['G2_b D4_b G4_t B4_t=V','C3_b E4_b G4_t C5_t=I']}],
 ['To find the leading note in any key: it is the 7th step of the scale, one semitone below the tonic. G major → F♯; F major → E.','Per trovare la sensibile in qualsiasi tonalità: è il 7° gradino della scala, un semitono sotto la tonica. Sol maggiore → Fa♯; Fa maggiore → Mi.']];
E[54]=[q('In V → I, the leading note…','In V → I, la sensibile…',['goes up to the tonic','goes down a third','stays still'],['sale alla tonica','scende di una terza','resta ferma']),
 q('In G major, V → I: the leading note F♯ goes to…','In Sol maggiore, V → I: la sensibile Fa♯ va su…',['G','E','D'],['Sol','Mi','Re']),
 q('In F major, V → I: the leading note E goes to…','In Fa maggiore, V → I: la sensibile Mi va su…',['F','D','C'],['Fa','Re','Do'])];

C[55]=[
 ['I and IV share the tonic (C is in C–E–G and in F–A–C). I and V share the dominant (G is in C–E–G and in G–B–D).','I e IV hanno in comune la tonica (il Do sta in Do–Mi–Sol e in Fa–La–Do). I e V hanno in comune la dominante (il Sol sta in Do–Mi–Sol e in Sol–Si–Re).'],
 ['So the recipe is: keep the common note in the same voice, and move the others by step to the nearest notes. I → IV → I keeps C in the soprano; I → V keeps G in the tenor.','Quindi la ricetta è: tieni la nota comune nella stessa voce, e muovi le altre di grado sulle note più vicine. I → IV → I tiene il Do al soprano; I → V tiene il Sol al tenore.',{clef:'g',cols:[I1+'=I',IV1+'=IV',I1+'=I',V1+'=V']}]];
E[55]=[['compl'],['par']];

C[56]=[
 ['IV and V have no notes in common (F–A–C and G–B–D). The bass goes up one step, from F to G.','IV e V non hanno note in comune (Fa–La–Do e Sol–Si–Re). Il basso sale di un gradino, da Fa a Sol.'],
 ['The trick: move the three upper voices <b>downwards</b>, each to the nearest note below: C → B, F → D, A → G. Bass up, the others down: contrary motion, and no parallel fifths.','Il trucco: muovi le tre voci superiori <b>in giù</b>, ognuna sulla nota più vicina sotto: Do → Si, Fa → Re, La → Sol. Basso su, gli altri giù: moto contrario, e niente quinte parallele.',{clef:'g',cols:['F2_b C4_b F4_t A4_t=IV','G2_b B3_b D4_t G4_t=V']}]];
E[56]=[q('In IV → V, the upper voices move…','In IV → V, le voci superiori si muovono…',['in contrary motion to the bass','in similar motion with the bass','not at all'],['per moto contrario al basso','per moto retto con il basso','per niente']),['par']];

C[57]=[
 ['Now you are the teacher. Look at an exercise and hunt for mistakes, in this order: ranges, distances between the voices, crossings, parallel fifths and octaves.','Ora il maestro sei tu. Guarda un esercizio e cerca gli errori, in quest’ordine: estensioni, distanze tra le voci, incroci, quinte e ottave parallele.']];
E[57]=[['range'],['par'],['par']];

/* ======================= 6. HARMONIC FUNCTIONS (59–67) ======================= */
C[59]=[
 ['Chords are like characters in a story. Each one has a role. The <b>tonic</b> (I) is home: calm, rest, the end of the journey.','Gli accordi sono come i personaggi di una storia. Ognuno ha un ruolo. La <b>tonica</b> (I) è casa: calma, riposo, la fine del viaggio.',{cols:['C4 E4 G4=I']}],
 ['The <b>dominant</b> (V) is tension: it wants to go home, now. Play I, then V, and stop: you feel something is missing.','La <b>dominante</b> (V) è tensione: vuole tornare a casa, subito. Suona I, poi V, e fermati: senti che manca qualcosa.',{cols:['C4 E4 G4=I','G4 B4 D5=V']}],
 ['The <b>subdominant</b> (IV) is setting off: it takes us away from home and prepares the dominant. Home → off we go → tension → home: T, S, D, T. Almost all music tells this little story. Tonic, subdominant and dominant are like three <b>families</b>: every chord belongs to one of them.','La <b>sottodominante</b> (IV) è la partenza: ci allontana da casa e prepara la dominante. Casa → si parte → tensione → casa: T, S, D, T. Quasi tutta la musica racconta questa piccola storia. Tonica, sottodominante e dominante sono come tre <b>famiglie</b>: ogni accordo fa parte di una di loro.',{cols:['C4 E4 G4=T·I','F4 A4 C5=S·IV','G4 B4 D5=D·V','C4 E4 G4=T·I']}]];
E[59]=[['func',{maxf:1,degs:[0,3,4]}],q('Which chord is home?','Quale accordo è casa?',['the tonic','the dominant','the subdominant'],['la tonica','la dominante','la sottodominante'])];

C[60]=[
 ['The other chords belong to one of these three families, like cousins. They share notes with the head of the family, so they can take its place.','Gli altri accordi appartengono a una di queste tre famiglie, come cugini. Condividono note con il capofamiglia, quindi possono prendere il suo posto.'],
 ['Tonic family: <b>I, vi, iii</b> (calm). Subdominant family: <b>IV, ii</b> (setting off). Dominant family: <b>V, vii°</b> (tension).','Famiglia della tonica: <b>I, vi, iii</b> (calma). Famiglia della sottodominante: <b>IV, ii</b> (partenza). Famiglia della dominante: <b>V, vii°</b> (tensione).',{cols:['C4 E4 G4=I','A4 C5 E5=vi','E4 G4 B4=iii','F4 A4 C5=IV','D4 F4 A4=ii','G4 B4 D5=V','B4 D5 F5=vii°']}],
 ['The trick: vi (A–C–E) has two notes of I (C, E); ii (D–F–A) has two notes of IV (F, A); vii° (B–D–F) has two notes of V (B, D). Two shared notes = same family.','Il trucco: vi (La–Do–Mi) ha due note del I (Do, Mi); ii (Re–Fa–La) ha due note del IV (Fa, La); vii° (Si–Re–Fa) ha due note del V (Si, Re). Due note in comune = stessa famiglia.']];
E[60]=[['func',{maxf:2}],['func',{maxf:2}]];

C[61]=[
 ['The strongest move between chords: the root goes <b>down a fifth</b> (or up a fourth, which lands on the same note name). G → C: V → I.','Il movimento più forte tra gli accordi: la fondamentale scende di <b>quinta</b> (o sale di quarta, che arriva sullo stesso nome di nota). Sol → Do: V → I.'],
 ['Chain them and you get a falling ladder of fifths: vi → ii → V → I (A → D → G → C). Many songs are built on it: every chord pulls the next one. In C major there is only one slightly different leap, F → B (IV → vii°): a diminished fifth. It still counts as a falling fifth.','Mettili in fila e ottieni una scala di quinte che scende: vi → ii → V → I (La → Re → Sol → Do). Moltissime canzoni sono costruite così: ogni accordo tira il successivo. Nella scala di Do maggiore c’è un solo salto un po’ diverso, Fa → Si (IV → vii°): una quinta diminuita. Conta lo stesso come quinta che scende.',{cols:['A4 C5 E5=vi','D4 F4 A4=ii','G4 B4 D5=V','C4 E4 G4=I']}]];
E[61]=[['fifths'],['fifths']];

C[62]=[
 ['With chords in root position, the bass sings the roots, so it often <b>leaps</b> by a fourth or a fifth: C → F (I → IV), G → C (V → I). The bass carries the harmony on its shoulders.','Con gli accordi in stato fondamentale, il basso canta le fondamentali, quindi spesso <b>salta</b> di quarta o di quinta: Do → Fa (I → IV), Sol → Do (V → I). Il basso porta l’armonia sulle spalle.',{clef:'b',cols:['C3=I','F3=IV','-','G2=V','C3=I']}]];
E[62]=[q('In I → V with chords in root position, the bass moves…','In I → V con accordi in stato fondamentale, il basso si muove…',['a fifth up or a fourth down','a step up','a third down'],['una quinta su o una quarta giù','di un grado su','di una terza giù']),['fifths']];

C[63]=[
 ['Music speaks in <b>phrases</b>, like sentences. A phrase starts at home (the tonic), goes for a walk, and then stops: that stop is called a <b>cadence</b>.','La musica parla per <b>frasi</b>, come le frasi di un discorso. Una frase parte da casa (la tonica), fa una passeggiata, e poi si ferma: quella fermata si chiama <b>cadenza</b>.'],
 ['Cadences are the punctuation of music: some are a full stop, others a comma or a question mark. Sing “Happy birthday”: at the end of each line you can hear where it breathes.','Le cadenze sono la punteggiatura della musica: alcune sono un punto, altre una virgola o un punto di domanda. Canta “Tanti auguri a te”: alla fine di ogni verso senti dove prende fiato.']];
E[63]=[q('The cadence is…','La cadenza è…',['the punctuation at the end of a phrase','the first chord of a piece','a fast scale'],['la punteggiatura alla fine di una frase','il primo accordo di un brano','una scala veloce'])];

C[64]=[
 ['Music has a pulse, like a heartbeat: you can count it, 1-2-3-4. Each count is a <b>beat</b> (tempo); a little group of beats, 1-2-3-4, is a <b>bar</b> (battuta).','La musica ha una pulsazione, come il battito del cuore: la puoi contare, 1-2-3-4. Ogni pulsazione è un <b>tempo</b>; un gruppetto di pulsazioni, 1-2-3-4, è una <b>battuta</b>.'],
 ['How often the chords change is the <b>harmonic rhythm</b>. Sometimes one chord lasts a whole bar, sometimes it changes on every beat.','Quanto spesso cambiano gli accordi è il <b>ritmo armonico</b>. A volte un accordo dura una battuta intera, a volte cambia a ogni tempo.'],
 ['Usually the chords change faster near the end of the phrase, as if the music started to run towards the finish line.','Di solito gli accordi cambiano più in fretta verso la fine della frase, come se la musica cominciasse a correre verso il traguardo.']];
E[64]=[q('Harmonic rhythm is…','Il ritmo armonico è…',['how often the chords change','the speed of the melody','the metronome mark'],['quanto spesso cambiano gli accordi','la velocità della melodia','l’indicazione di metronomo'])];

C[65]=[
 ['Given a bass line, which chords go above? If the bass note is the 1st step, try I; the 4th step, IV; the 5th step, V. In root position the bass tells you the root.','Data una linea di basso, quali accordi ci vanno sopra? Se la nota di basso è il 1° gradino, prova I; il 4°, IV; il 5°, V. In stato fondamentale il basso ti dice la fondamentale.',{clef:'b',cols:['C3=I','F2=IV','G2=V','C3=I']}],
 ['Then complete the upper voices with the usual recipe: double the root, keep the common notes, move by step.','Poi completa le voci superiori con la solita ricetta: raddoppia la fondamentale, tieni le note comuni, muovi di grado.']];
E[65]=[q('In C major the bass sings F (the 4th step): which chord do you try?','In Do maggiore il basso canta Fa (il 4° gradino): che accordo provi?',['IV','I','V'],['IV','I','V']),
 q('In G major the bass sings D (the 5th step): which chord do you try?','In Sol maggiore il basso canta Re (il 5° gradino): che accordo provi?',['V','IV','I'],['V','IV','I']),
 ['compl'],['roman',{maxf:1}]];

C[66]=[
 ['Now the opposite: a melody is given, you choose the chords. Each melody note belongs to several chords: C is in C–E–G (I), F–A–C (IV) and A–C–E (vi).','Ora il contrario: è data una melodia, tu scegli gli accordi. Ogni nota della melodia appartiene a più accordi: il Do sta in Do–Mi–Sol (I), Fa–La–Do (IV) e La–Do–Mi (vi).',{cols:['C4 E4 G4=I','F4 A4 C5=IV','A4 C5 E5=vi']}],
 ['How to choose? Think of the little story T–S–D–T: pick the chord that leads naturally to the next one, and save V–I for the end.','Come scegliere? Pensa alla piccola storia T–S–D–T: scegli l’accordo che porta in modo naturale al successivo, e tieni V–I per la fine.']];
E[66]=[q('In C major, the note G belongs to…','In Do maggiore, la nota Sol sta in…',['I, iii and V','IV and ii','only V'],['I, iii e V','IV e ii','solo V']),
 q('In C major, the note D belongs to…','In Do maggiore, la nota Re sta in…',['ii, V and vii°','I and IV','only ii'],['ii, V e vii°','I e IV','solo ii'])];

C[67]=[
 ['A bit of everything: families, chains of fifths, connections. Remember the story: home, setting off, tension, home.','Un po’ di tutto: famiglie, catene di quinte, collegamenti. Ricorda la storia: casa, partenza, tensione, casa.']];
E[67]=[['func',{maxf:2}],['fifths'],['compl']];

/* ======================= 7. CADENCES, PART ONE (69–79) ======================= */
C[69]=[
 ['A <b>cadence</b> is the pair of chords that closes a phrase: the last two words of the musical sentence.','Una <b>cadenza</b> è la coppia di accordi che chiude una frase: le ultime due parole della frase musicale.'],
 ['Some cadences close completely, like a full stop. Others leave the phrase open, like a comma or a question mark. In the next lessons you will meet them one by one.','Alcune cadenze chiudono del tutto, come un punto fermo. Altre lasciano la frase aperta, come una virgola o un punto di domanda. Nelle prossime lezioni le incontrerai una per una.']];
E[69]=[q('A cadence is…','Una cadenza è…',['the pair of chords that closes a phrase','the first chord of a piece','a very fast scale'],['la coppia di accordi che chiude una frase','il primo accordo di un brano','una scala velocissima']),
 q('A cadence can close completely, or leave the phrase open.','Una cadenza può chiudere del tutto, oppure lasciare la frase aperta.',['true','false'],['vero','falso']),
 q('In music, cadences are like…','Nella musica, le cadenze sono come…',['punctuation marks','the title of a book','the page numbers'],['i segni di punteggiatura','il titolo di un libro','i numeri di pagina'])];

C[70]=[
 ['The strongest ending: <b>V → I</b>, both in root position, with the tonic in the soprano at the end. This is the <b>perfect cadence</b>: the full stop.','Il finale più forte: <b>V → I</b>, entrambi in stato fondamentale, con la tonica al soprano alla fine. È la <b>cadenza perfetta</b>: il punto fermo.',{clef:'g',cols:['G2_b D4_b G4_t B4_t=V','C3_b E4_b G4_t C5_t=I']}],
 ['Listen: on the V you hold your breath; on the I everything relaxes. It’s the “THE END” of a film. In G major it is D → G; in F major, C → F.','Ascolta: sul V trattieni il respiro; sul I tutto si rilassa. È la scritta “FINE” di un film. In Sol maggiore è Re → Sol; in Fa maggiore, Do → Fa.']];
E[70]=[['cadLast',{types:['perf']}],
 q('In the perfect cadence, the last chord is…','Nella cadenza perfetta, l’ultimo accordo è…',['I','V','IV'],['I','V','IV']),
 q('In G major, the perfect cadence goes from…','In Sol maggiore, la cadenza perfetta va da…',['D to G','G to D','C to G'],['Re a Sol','Sol a Re','Do a Sol']),
 q('At the end of a perfect cadence, the soprano sings…','Alla fine di una cadenza perfetta, il soprano canta…',['the tonic','the leading note','any note'],['la tonica','la sensibile','una nota qualsiasi'])];

C[71]=[
 ['How each singer moves in V → I: the <b>bass</b> leaps from the 5th step to the 1st (G → C); the <b>leading note</b> rises to the tonic (here in the soprano, B → C); the others keep the common note (G) or go to the nearest note (D → E).','Come si muove ogni cantante in V → I: il <b>basso</b> salta dal 5° al 1° gradino (Sol → Do); la <b>sensibile</b> sale alla tonica (qui al soprano, Si → Do); gli altri tengono la nota comune (Sol) o vanno sulla nota più vicina (Re → Mi).',{clef:'g',cols:['G2_b D4_b G4_t B4_t=V','C3_b E4_b G4_t C5_t=I']}],
 ['The trick: first find the leading note and send it up. Then everything else falls into place.','Il trucco: prima trova la sensibile e mandala su. Poi tutto il resto va a posto da solo.']];
E[71]=[['compl'],
 q('In V → I, the leading note…','In V → I, la sensibile…',['goes up to the tonic','goes down a third','stays still'],['sale alla tonica','scende di una terza','resta ferma']),
 q('In D major, V → I: the leading note C♯ goes to…','In Re maggiore, V → I: la sensibile Do♯ va su…',['D','A','B'],['Re','La','Si'])];

C[72]=[
 ['Still V → I, but weaker: the soprano doesn’t end on the tonic. This is the <b>imperfect cadence</b>: it closes, but like a semicolon rather than a full stop. Here the soprano ends on G.','Sempre V → I, ma più debole: il soprano non finisce sulla tonica. È la <b>cadenza imperfetta</b>: chiude, ma come un punto e virgola invece di un punto. Qui il soprano finisce sul Sol.',{clef:'g',cols:['G2_b B3_b D4_t G4_t=V','C3_b C4_b E4_t G4_t=I']}],
 ['It is imperfect also when the I is <b>inverted</b>, for example with its third (E) in the bass: the bass goes G → E instead of G → C. Under the chord it says I6: the 6 means first inversion, that is, the third in the bass.','È imperfetta anche quando il I è <b>rivoltato</b>, per esempio con la terza (Mi) al basso: il basso va Sol → Mi invece di Sol → Do. Sotto c’è scritto I6: il 6 vuol dire primo rivolto, cioè la terza al basso.',{clef:'g',cols:['G2_b D4_b G4_t B4_t=V','E3_b C4_b G4_t C5_t=I6']}]];
E[72]=[['cad',{types:['perf','imp']}],['cad',{types:['perf','imp']}]];

C[73]=[
 ['<b>IV → I</b>: the <b>plagal cadence</b>. Soft and gentle, with no leading note pulling. It is the “A-men” sung at the end of hymns.','<b>IV → I</b>: la <b>cadenza plagale</b>. Morbida e dolce, senza la sensibile che tira. È l’“A-men” cantato alla fine degli inni.',{clef:'g',cols:['F2_b C4_b F4_t A4_t=IV','C3_b C4_b E4_t G4_t=I']}],
 ['How to recognise it: the bass goes from the 4th step to the 1st (F → C), and the common note C stays in the same voice.','Come riconoscerla: il basso va dal 4° al 1° gradino (Fa → Do), e la nota comune Do resta nella stessa voce.']];
E[73]=[['cad',{types:['plag','perf']}],['cadName',{types:['perf','plag']}]];

C[74]=[
 ['A phrase that stops <b>on the V</b> ends with a question: the <b>half cadence</b> (cadenza sospesa, or semicadenza). It’s the comma or the question mark of music, waiting for an answer. Here IV → V.','Una frase che si ferma <b>sul V</b> finisce con una domanda: la <b>cadenza sospesa</b> o semicadenza. È la virgola o il punto di domanda della musica, che aspetta una risposta. Qui IV → V.',{clef:'g',cols:['F2_b C4_b F4_t A4_t=IV','G2_b B3_b D4_t G4_t=V']}],
 ['Before the V there is usually I, IV or <b>ii6</b>. How to read ii6: the Roman numeral says the step (ii = the chord on the 2nd step, D–F–A in C), the small number says the inversion (6 = first inversion: the third, F, is in the bass).','Prima del V di solito vengono I, IV oppure <b>ii6</b>. Come si legge ii6: il numero romano dice il gradino (ii = l’accordo sul 2° gradino, Re–Fa–La in Do), il numero piccolo dice il rivolto (6 = primo rivolto: la terza, Fa, è al basso).'],
 ['Very often a phrase that ends on V is followed by one that ends on I: question and answer, like a conversation.','Molto spesso a una frase che finisce sul V segue una frase che finisce sul I: domanda e risposta, come in una conversazione.']];
E[74]=[['cad',{types:['half','perf','plag']}],['cadName',{types:['perf','plag','half']}]];

C[75]=[
 ['Before the final V → I, the dominant is usually prepared by a chord of the subdominant family: <b>IV</b>, or <b>ii6</b> (ii with its third in the bass), which puts the 4th step in the bass, just like IV.','Prima del V → I finale, la dominante di solito è preparata da un accordo della famiglia della sottodominante: <b>IV</b>, oppure <b>ii6</b> (ii con la terza al basso), che mette al basso il 4° gradino, proprio come il IV.',{clef:'g',cols:['F3_b D4_b A4_t D5_t=ii6','G3_b D4_b G4_t B4_t=V','C3_b E4_b G4_t C5_t=I']}],
 ['The bass goes up by step 4 → 5 (F → G), then leaps 5 → 1 (G → C): it’s the classic way to close. S → D → T, the little story again.','Il basso sale di grado 4 → 5 (Fa → Sol), poi salta 5 → 1 (Sol → Do): è il modo classico di chiudere. S → D → T, ancora la piccola storia.']];
E[75]=[q('Which chord prepares the dominant well?','Quale accordo prepara bene la dominante?',['ii6','vi6','iii'],['ii6','vi6','iii']),['cad',{types:['half','perf']}]];

C[76]=[
 ['The bass alone tells you a lot. From the 5th to the 1st step: perfect cadence. From the 4th to the 1st: plagal. It stops on the 5th: half cadence.','Il basso da solo dice molto. Dal 5° al 1° gradino: cadenza perfetta. Dal 4° al 1°: plagale. Si ferma sul 5°: sospesa.',{clef:'b',cols:['G2','C3=5→1','-','F2','C3=4→1','-','F2','G2=4→5']}],
 ['From the 5th to the 3rd step (the last chord is inverted, I6): imperfect. So 5 → 1 can still be imperfect: for that, look at the soprano (next lesson).','Dal 5° al 3° gradino (l’ultimo accordo è rivoltato, I6): imperfetta. E anche 5 → 1 può essere imperfetta: per saperlo guarda il soprano (prossima lezione).',{clef:'b',cols:['G2','E3=5→3']}]];
E[76]=[['cad',{types:['perf','plag','half']}],['cad',{types:['perf','plag','half']}]];

C[77]=[
 ['The soprano tells you how “full” the stop is: if it ends on the tonic, the cadence is perfect; on another note of the chord, imperfect.','Il soprano ti dice quanto è “pieno” il punto: se finisce sulla tonica, la cadenza è perfetta; su un’altra nota dell’accordo, imperfetta.'],
 ['Same V → I twice. First the soprano ends on C (the tonic): perfect. Then it ends on G: imperfect.','Due volte lo stesso V → I. Prima il soprano finisce sul Do (la tonica): perfetta. Poi finisce sul Sol: imperfetta.',{clef:'g',cols:['G2_b D4_b G4_t B4_t=V','C3_b E4_b G4_t C5_t=I','-','G2_b B3_b D4_t G4_t=V','C3_b C4_b E4_t G4_t=I']}]];
E[77]=[['cad',{types:['perf','imp']}],['cad',{types:['perf','imp','plag']}]];

C[78]=[
 ['Just like in the Cadences game: the phrase is given, you choose the last chords. First choose the right chords (the story: S → D → T), then the right voices.','Proprio come nel gioco delle Cadenze: la frase è data, tu scegli gli ultimi accordi. Prima scegli gli accordi giusti (la storia: S → D → T), poi le voci giuste.'],
 ['A memory aid: perfect = after <b>V</b> comes I; plagal = after <b>IV</b> comes I.','Un promemoria: perfetta = dopo il <b>V</b> viene il I; plagale = dopo il <b>IV</b> viene il I.']];
E[78]=[['cadLast',{types:['perf','plag']}],['compl'],['cadLast',{types:['perf','plag']}]];

C[79]=[
 ['C, G and F major: the keys of the Easy level (Facile) of the Cadences game. G major has one sharp, F♯: the leading note is F♯.','Do, Sol e Fa maggiore: le tonalità del livello Facile del gioco delle Cadenze. Sol maggiore ha un diesis, il Fa♯: la sensibile è il Fa♯.',{key:1,cols:['G4 B4 D5=I','D4 F#4 A4=V']}],
 ['F major has one flat, B♭; its leading note is E. Practise the cadences in all three keys.','Fa maggiore ha un bemolle, il Si♭; la sua sensibile è il Mi. Esercitati con le cadenze in tutte e tre le tonalità.',{key:-1,cols:['F4 A4 C5=I','C4 E4 G4=V']}]];
E[79]=[['cad',{types:['perf','plag','half'],maxf:1}],['cadLast',{types:['perf','plag']}],['keyMaj',{maxf:1}]];

/* ======================= 8. INVERSIONS IN PRACTICE (81–87) ======================= */
C[81]=[
 ['First, how to read <b>V6</b>: the Roman numeral says the step (V = the chord on the 5th step), the small number says the inversion: 6 = first inversion, 6/4 = second inversion, no number = root position.','Prima, come si legge <b>V6</b>: il numero romano dice il gradino (V = l’accordo sul 5° gradino), il numero piccolo dice il rivolto: 6 = primo rivolto, 6/4 = secondo rivolto, nessun numero = stato fondamentale.'],
 ['In root position the bass sings the roots, so it leaps often. With the <b>first inversion</b> it can walk by step instead, like a melody. I – V6 – I: the bass goes C – B – C.','In stato fondamentale il basso canta le fondamentali, quindi salta spesso. Con il <b>primo rivolto</b> può invece camminare di grado, come una melodia. I – V6 – I: il basso fa Do – Si – Do.',{clef:'g',cols:['C3_b G3_b E4_t C5_t=I','B2_b G3_b D4_t D5_t=V6','C3_b G3_b E4_t C5_t=I']}],
 ['Use first inversions to make the bass sing, and to vary the colour: root position is solid, first inversion is lighter.','Usa i primi rivolti per far cantare il basso e per variare il colore: lo stato fondamentale è solido, il primo rivolto più leggero.']];
E[81]=[['inv'],['figs']];

C[82]=[
 ['In first inversion the bass is the third of the chord. Don’t double it if it’s the leading note! Usually you double the root or the fifth.','Nel primo rivolto il basso è la terza dell’accordo. Non raddoppiarla se è la sensibile! Di solito si raddoppia la fondamentale o la quinta.'],
 ['V6 in C major: B is in the bass. On the left (right): B only once, D doubled. On the right (wrong): B also in the soprano, two leading notes.','V6 in Do maggiore: il Si è al basso. A sinistra (giusto): il Si una volta sola, raddoppiato il Re. A destra (sbagliato): il Si anche al soprano, due sensibili.',{clef:'g',cols:['B2_b G3_b D4_t D5_t=ok','-','B2_b G3_b D4_t B4_t=✗']}]];
E[82]=[q('In V6 (leading note in the bass), you must not double…','Nel V6 (sensibile al basso), non devi raddoppiare…',['the leading note','the root','the fifth'],['la sensibile','la fondamentale','la quinta'])];

C[83]=[
 ['The <b>ii6</b> (ii in first inversion) is the favourite way to prepare the cadence: its bass is the 4th step (F in C major), which rises by step to the 5th (G).','Il <b>ii6</b> (ii in primo rivolto) è il modo preferito per preparare la cadenza: il suo basso è il 4° gradino (Fa in Do maggiore), che sale di grado al 5° (Sol).',{clef:'g',cols:['F3_b D4_b A4_t D5_t=ii6','G3_b D4_b G4_t B4_t=V']}]];
E[83]=[['cad',{types:['half','perf']}],['figs']];

C[84]=[
 ['The second inversion (6/4) is delicate: it can appear only in a few places. The first: the <b>passing</b> 6/4, between two positions of the same chord, with the bass passing by step. Here the bass goes C – D – E.','Il secondo rivolto (6/4) è delicato: può comparire solo in pochi posti. Il primo: la quarta e sesta <b>di passaggio</b>, tra due posizioni dello stesso accordo, con il basso che passa di grado. Qui il basso fa Do – Re – Mi.',{clef:'g',cols:['C3_b G3_b E4_t C5_t=I','D3_b G3_b D4_t B4_t=V6/4','E3_b G3_b C4_t C5_t=I6']}],
 ['Like stepping stones across a stream: the 6/4 is the little stone in the middle, you just step on it and go.','Come i sassi per attraversare un ruscello: la 6/4 è il sassolino in mezzo, ci passi sopra e vai.']];
E[84]=[q('In a passing six-four, the bass…','Nella quarta e sesta di passaggio, il basso…',['moves by step','leaps a fifth','stays still'],['si muove per grado','salta di quinta','resta fermo'])];

C[85]=[
 ['The <b>neighbour</b> 6/4 (di volta): the bass stays still; tenor and alto go up by step and come back; the soprano stays still. I – IV6/4 – I, over a C held in the bass.','La quarta e sesta <b>di volta</b>: il basso resta fermo; tenore e contralto salgono di grado e tornano; il soprano resta fermo. I – IV6/4 – I, sopra un Do tenuto al basso.',{clef:'g',cols:['C3_b G3_b E4_t C5_t=I','C3_b A3_b F4_t C5_t=IV6/4','C3_b G3_b E4_t C5_t=I']}]];
E[85]=[q('In I – IV6/4 – I, the bass…','In I – IV6/4 – I, il basso…',['stays on the tonic','goes up to the subdominant','goes down a third'],['resta sulla tonica','sale alla sottodominante','scende di una terza'])];

C[86]=[
 ['The most important one: the <b>cadential</b> 6/4. Before the final V, the tonic chord appears with the 5th step (the dominant) in the bass: I6/4. Above the bass there are the tonic and the 3rd step. In C: G in the bass, C and E above.','La più importante: la quarta e sesta <b>cadenzale</b>. Prima del V finale, l’accordo di tonica compare con il 5° gradino (la dominante) al basso: I6/4. Sopra il basso ci sono la tonica e il 3° gradino. In Do: Sol al basso, Do e Mi sopra.',{clef:'g',cols:['G2_b G3_b E4_t C5_t=I6/4','G2_b G3_b D4_t B4_t=V','C3_b G3_b E4_t C5_t=I']}],
 ['Then, over the same bass, C goes down to B and E goes down to D: the chord becomes V, and V goes to I. In G major: D in the bass, G and B above.','Poi, sopra lo stesso basso, il Do scende al Si e il Mi scende al Re: l’accordo diventa V, e il V va sul I. In Sol maggiore: Re al basso, Sol e Si sopra.'],
 ['It sounds like a long, dramatic breath before the end. You hear it in every classical concerto, just before the soloist’s free solo (which, to complicate things, is also called a “cadenza”).','Suona come un lungo respiro drammatico prima della fine. Lo senti in ogni concerto classico, subito prima dell’assolo libero del solista (che, per complicare le cose, si chiama anch’esso “cadenza”).']];
E[86]=[['cad64',{maxf:2}],['cad64',{maxf:2}]];

C[87]=[
 ['Mixed exercises: inversions, figures, and the cadential 6/4.','Esercizi misti: rivolti, numerica e quarta e sesta cadenzale.']];
E[87]=[['inv'],['figs'],['cad64',{maxf:2}]];

/* ======================= 9. SEVENTH CHORDS (89–97) ======================= */
C[89]=[
 ['Take a triad and stack <b>one more third</b> on top: four notes. The new note is a seventh above the root, so this is a <b>seventh chord</b>.','Prendi una triade e impila <b>un’altra terza</b> in cima: quattro note. La nota nuova sta una settima sopra la fondamentale, quindi è un <b>accordo di settima</b>.',{kbd:K('G4','G5',{'G4':'y','B4':'y','D5':'y','F5':'p'},{top:{'G4':'1','B4':'3','D5':'5','F5':'7'}}),cols:['G4 B4 D5','G4 B4 D5 F5']}],
 ['On the piano: the same “skip one key” game, with four fingers. G–B–D becomes G–B–D–F. The seventh adds a pinch of salt: the chord becomes richer and more restless.','Sul pianoforte: lo stesso gioco del “salta un tasto”, con quattro dita. Sol–Si–Re diventa Sol–Si–Re–Fa. La settima aggiunge un pizzico di sale: l’accordo diventa più ricco e più inquieto.']];
E[89]=[q('A seventh chord has…','Un accordo di settima ha…',['four different notes','three notes','five notes'],['quattro note diverse','tre note','cinque note']),
 q('In the chord G–B–D–F, which note is the seventh?','Nell’accordo Sol–Si–Re–Fa, qual è la settima?',['F','G','D'],['Fa','Sol','Re']),
 q('Which note do you add to C–E–G to make a seventh chord?','Quale nota aggiungi a Do–Mi–Sol per fare un accordo di settima?',['B','A','D'],['Si','La','Re'])];

C[90]=[
 ['The most important seventh chord is built on the 5th step: the <b>dominant seventh</b>, <b>V7</b>. In C major: G–B–D–F.','L’accordo di settima più importante si costruisce sul 5° gradino: la <b>settima di dominante</b>, <b>V7</b>. In Do maggiore: Sol–Si–Re–Fa.',{cols:['G4 B4 D5 F5=V7']}],
 ['It has a major triad below (G–B–D) and a minor seventh on top (G up to F). It wants to go home even more than V: it contains both the leading note (B) and the F, which want to move.','Ha una triade maggiore sotto (Sol–Si–Re) e una settima minore sopra (da Sol su fino a Fa). Vuole tornare a casa ancora più del V: contiene sia la sensibile (Si) sia il Fa, che vogliono muoversi.'],
 ['The trick: build the V of the key (on the 5th step) and stack one more third, using the notes of the key. G major: D–F♯–A + C. F major: C–E–G + B♭.','Il trucco: costruisci il V della tonalità (sul 5° gradino) e impila un’altra terza, con le note della tonalità. Sol maggiore: Re–Fa♯–La + Do. Fa maggiore: Do–Mi–Sol + Si♭.']];
E[90]=[['v7',{maxf:2}],['v7',{maxf:3}]];

C[91]=[
 ['How V7 goes to I: the leading note <b>goes up</b> to the tonic (B → C), the seventh <b>goes down</b> by step (F → E). Two magnets pulling in opposite directions.','Come il V7 va sul I: la sensibile <b>sale</b> alla tonica (Si → Do), la settima <b>scende</b> di grado (Fa → Mi). Due calamite che tirano in direzioni opposte.',{kbd:K('E4','C5',{'B4':'p','C5':'y','F4':'p','E4':'y'},{arcs:[['B4','C5',['up','su'],1],['F4','E4',['down','giù'],1]]}),cols:['F4 G4 B4','E4 G4 C5']}],
 ['In four voices: the tenor B rises to C, the alto F falls to E, the soprano D goes to C. The I has no G: three Cs and an E. It’s normal after a V7.','A quattro voci: il tenore Si sale al Do, il contralto Fa scende al Mi, il soprano Re va al Do. Il I non ha il Sol: tre Do e un Mi. Dopo un V7 è normale.',{clef:'g',cols:['G2_b B3_b F4_t D5_t=V7','C3_b C4_b E4_t C5_t=I']}]];
E[91]=[['v7res',{maxf:2}],['v7res',{maxf:2}]];

C[92]=[
 ['A seventh chord has four notes, so it has three inversions. The figures: root position <b>7</b>; third in the bass <b>6/5</b>; fifth in the bass <b>4/3</b>; seventh in the bass <b>4/2</b> (often shortened to <b>2</b>).','Un accordo di settima ha quattro note, quindi ha tre rivolti. La numerica: stato fondamentale <b>7</b>; terza al basso <b>6/5</b>; quinta al basso <b>4/3</b>; settima al basso <b>4/2</b> (spesso abbreviato in <b>2</b>).',{cols:['G4 B4 D5 F5=7','B4 D5 F5 G5=6/5','D5 F5 G5 B5=4/3','F4 G4 B4 D5=4/2']}],
 ['A trick: the numbers go down, 7 → 6/5 → 4/3 → 4/2, like a countdown. To know which one, look at the bass: root, third, fifth or seventh?','Un trucco: i numeri scendono, 7 → 6/5 → 4/3 → 4/2, come un conto alla rovescia. Per sapere quale, guarda il basso: fondamentale, terza, quinta o settima?']];
E[92]=[['figs',{sev:1,maxf:1}],['figs',{sev:1,maxf:2}]];

C[93]=[
 ['The golden rule of every seventh: <b>the seventh goes down</b> by step. Always. Like a leaf falling from a tree. In V7 → I in C major: F → E.','La regola d’oro di ogni settima: <b>la settima scende</b> di grado. Sempre. Come una foglia che cade dall’albero. In V7 → I in Do maggiore: Fa → Mi.',{clef:'g',cols:['G2_b B3_b F4_t D5_t=V7','C3_b C4_b E4_t C5_t=I']}]];
E[93]=[['v7res',{maxf:3}],q('The seventh of a chord resolves…','La settima di un accordo risolve…',['down by step','up by step','by leap'],['scendendo di grado','salendo di grado','per salto'])];

C[94]=[
 ['You can add a seventh to other chords too. On the 2nd step: <b>ii7</b> (D–F–A–C). Often in first inversion, <b>ii6/5</b>, with the 4th step (F) in the bass: the perfect preparation for V.','Puoi aggiungere una settima anche ad altri accordi. Sul 2° gradino: <b>ii7</b> (Re–Fa–La–Do). Spesso in primo rivolto, <b>ii6/5</b>, con il 4° gradino (Fa) al basso: la preparazione perfetta per il V.',{cols:['D4 F4 A4 C5=ii7','F4 A4 C5 D5=ii6/5']}],
 ['Seventh chords get their name from the triad and the seventh. D–F–A–C: minor triad + minor seventh = <b>minor seventh</b> chord. C–E–G–B (on the 1st step): major triad + major seventh = <b>major seventh</b> chord. G–B–D–F: major triad + minor seventh = dominant seventh.','Gli accordi di settima prendono il nome dalla triade e dalla settima. Re–Fa–La–Do: triade minore + settima minore = accordo di <b>settima minore</b>. Do–Mi–Sol–Si (sul 1° gradino): triade maggiore + settima maggiore = accordo di <b>settima maggiore</b>. Sol–Si–Re–Fa: triade maggiore + settima minore = settima di dominante.',{cols:['D4 F4 A4 C5=ii7','C4 E4 G4 B4=I7','G4 B4 D5 F5=V7']}],
 ['The trick for the seventh: it sits just below the octave of the root. From C: the B just under the high C, a <b>semitone</b> below = major seventh. From D: the C just under the high D, a <b>tone</b> below = minor seventh.','Il trucco per la settima: sta subito sotto l’ottava della fondamentale. Da Do: il Si subito sotto il Do acuto, un <b>semitono</b> sotto = settima maggiore. Da Re: il Do subito sotto il Re acuto, un <b>tono</b> sotto = settima minore.']];
E[94]=[['ii7',{maxf:2}],
 q('D–F–A–C (the ii7 of C major) is a…','Re–Fa–La–Do (il ii7 di Do maggiore) è un accordo di…',['minor seventh chord','major seventh chord','dominant seventh chord'],['settima minore','settima maggiore','settima di dominante']),
 q('C–E–G–B is a…','Do–Mi–Sol–Si è un accordo di…',['major seventh chord','minor seventh chord','dominant seventh chord'],['settima maggiore','settima minore','settima di dominante'])];

C[95]=[
 ['On the 7th step: B–D–F–A. A diminished triad (B–D–F) plus a minor seventh (B up to A): the <b>half-diminished</b> seventh, written with a small crossed circle, <b>ø</b>: viiø7. Soft and mysterious.','Sul 7° gradino: Si–Re–Fa–La. Una triade diminuita (Si–Re–Fa) più una settima minore (da Si su fino a La): la settima <b>semidiminuita</b>, scritta con un cerchietto barrato, <b>ø</b>: viiø7. Morbida e misteriosa.',{cols:['B4 D5 F5 A5=viiø7']}],
 ['How to tell it from the dominant seventh: look at the triad at the bottom. Major (G–B–D) → dominant seventh. Diminished (B–D–F) → half-diminished.','Come distinguerla dalla settima di dominante: guarda la triade in basso. Maggiore (Sol–Si–Re) → settima di dominante. Diminuita (Si–Re–Fa) → semidiminuita.',{cols:['G4 B4 D5 F5=V7','B4 D5 F5 A5=viiø7']}]];
E[95]=[['sevQ',{n:2}],['sevQ',{n:2}]];

C[96]=[
 ['If you stack <b>three minor thirds</b> (3 semitones + 3 + 3), you get the <b>diminished seventh</b>: B–D–F–A♭. It divides the octave into four equal parts, so it sounds the same from every note.','Se impili <b>tre terze minori</b> (3 semitoni + 3 + 3), ottieni la <b>settima diminuita</b>: Si–Re–Fa–La♭. Divide l’ottava in quattro parti uguali, quindi suona uguale da ogni nota.',{kbd:K('A4','A5',{'B4':'y','D5':'y','F5':'y','G#5':'p'},{arcs:[['B4','D5',['3','3'],0],['D5','F5',['3','3'],0],['F5','G#5',['3','3'],0]]}),cols:['B4 D5 F5 Ab5']}],
 ['Where does it live? In a <b>minor</b> key, on the 7th step of the harmonic minor (the raised leading note), and it is written <b>vii°7</b>. In A minor: G♯–B–D–F. In D minor: C♯–E–G–B♭.','Dove abita? In una tonalità <b>minore</b>, sul 7° gradino della minore armonica (la sensibile alzata), e si scrive <b>vii°7</b>. In La minore: Sol♯–Si–Re–Fa. In Re minore: Do♯–Mi–Sol–Si♭.',{cols:['G#4 B4 D5 F5=vii°7']}],
 ['The trick: start from the leading note of the minor key and stack minor thirds. It’s the chord of suspense in old films, when the villain appears!','Il trucco: parti dalla sensibile della tonalità minore e impila terze minori. È l’accordo della suspense nei vecchi film, quando arriva il cattivo!']];
E[96]=[['dim7',{maxf:1}],['sevQ',{n:3}]];

C[97]=[
 ['Mixed exercises on seventh chords. Remember: one more third on top; look at the triad and at the seventh to name the chord; the seventh goes down.','Esercizi misti sugli accordi di settima. Ricorda: una terza in più in cima; per dare il nome guarda la triade e la settima; la settima scende.']];
E[97]=[['sevQ',{n:5}],['v7',{maxf:3}],['figs',{sev:1,maxf:2}]];

/* titles and the text of the check before the Easy level live in lessons.js: corrected here at load time (lowercase ii, “Facile”) */
const L=window.HM&&window.HM.L;
if(L){const ti=(n,en,it)=>{if(L[n-1])L[n-1].n=[en,it]};
 ti(75,'Preparing the dominant with IV and ii6','Preparare la dominante con IV e ii6');
 ti(83,'ii6 before the dominant','Il ii6 prima della dominante');
 ti(92,'The inversions of V7 (6/5, 4/3, 4/2)','I rivolti del V7 (6/5, 4/3, 4/2)');
 ti(94,'The supertonic seventh (ii7 and ii6/5)','La settima di sopratonica (ii7 e ii6/5)');
 ti(80,'Check: ready for Easy','Verifica: pronti per il livello Facile');
 const t80=L[79];if(t80&&t80.test){t80.c=[['The first big check. If you pass it, you are ready for the Easy level of the Cadences game.','La prima grande verifica. Se la superi, sei pronto per il livello Facile del gioco delle Cadenze.']];
  t80.ready=['You are ready for the Easy level of the Cadences game!','Sei pronto per il livello Facile del gioco delle Cadenze!']}}
})();
