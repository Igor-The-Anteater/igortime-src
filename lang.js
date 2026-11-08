/* Igor Time — Italian for the games.
   The island already speaks Italian and English; the games are written in English.
   This file translates what the player reads at the start, during the rounds and at the end,
   when the language chosen on the island is Italian (localStorage igortime_lang). */
(()=>{
let L='en';try{L=localStorage.getItem('igortime_lang')||((navigator.language||'').toLowerCase().startsWith('it')?'it':'en')}catch(e){}
if(L!=='it')return;
document.documentElement.lang='it';

const LV={Easy:'Facile',Medium:'Medio',Extreme:'Estremo',easy:'facile',medium:'medio',extreme:'estremo'};
const lv=s=>LV[s]||s;
const POLE={'pure sine':'sinusoide pura','very buzzy wave':'onda molto ronzante','narrow band of noise':'banda stretta di rumore','sine':'sinusoide','buzz':'ronzio','noise':'rumore'};

/* exact texts (trimmed) */
const D={
 // common
 'Start':'Inizia','Play again':'Gioca ancora','Change level':'Cambia livello','Easy':'Facile','Medium':'Medio','Extreme':'Estremo',
 'Choose your anteater':'Scegli il tuo formichiere','Difficulty':'Difficoltà','round':'round','score':'punti',
 '← Island':'← Isola','← back to the island':'← torna all’isola','← back to Igor time':'← torna a Igor time','← Igor’s island':'← L’isola di Igor',
 '▶ Listen':'▶ Ascolta','That’s it!':'Ecco!','That\'s it!':'Ecco!','That’s it':'Ecco','Then':'Poi',
 '🎧 Use headphones, and keep your volume fixed for the whole game.':'🎧 Usa le cuffie e non cambiare il volume per tutta la partita.',
 'Tofu seeds won: easy ×1, medium ×2, extreme ×3':'Semi di tofu vinti: facile ×1, medio ×2, estremo ×3',
 'Listen…':'Ascolta…','Last one. Concentrate.':'L’ultimo. Concentrati.','Again! Listen…':'Ancora! Ascolta…',
 'Perfect! What ears!':'Perfetto! Che orecchio!',
 'Winter hat':'Cappello di lana','Flower':'Fiorellino','Star':'Stellina','None':'Niente','Right':'Destro','Left':'Sinistro','Both':'Entrambi',
 // kitchen
 'The kitchen':'La cucina','The kitchen · Igor time':'La cucina · Igor time',
 'Behind the curtain a':'Dietro la tenda una','gas flame':'fiamma del gas','is lit for a while: listen to how long it burns.':'resta accesa per un po’: ascolta quanto dura.',
 'hold the gas':'tieni premuto il gas','(the big button or the knob) for exactly as long. Same time, and':'(il pulsante grande o la manopola) per lo stesso tempo. Stesso tempo, e le formiche di tofu di',
 '’s tofu ants come out golden. Too short and they’re raw, too long and they burn.':' escono dorate. Troppo poco e sono crude, troppo e si bruciano.',
 'keys: L = listen, hold space = gas':'tasti: L = ascolta, tieni premuto spazio = gas',
 '🔥 Hold the gas':'🔥 Tieni il gas',
 'Listen to the flame…':'Ascolta la fiamma…','Again! How long?':'Ancora! Quanto dura?','Shh. The flame…':'Shh. La fiamma…','Another one. Count with your ears.':'Un’altra. Conta con le orecchie.','Last one. Golden, please.':'L’ultima. Dorate, per favore.',
 'Golden! Spot on.':'Dorate! Perfetto.','Perfectly cooked. What timing!':'Cotte a puntino. Che tempismo!',
 'Nearly golden! Next time hold a little longer.':'Quasi dorate! La prossima volta tieni un po’ di più.','Nearly golden! Next time let go a little sooner.':'Quasi dorate! La prossima volta lascia un po’ prima.',
 'Nice try! The flame burned a bit longer. The next one’s yours.':'Bel tentativo! La fiamma è durata un po’ di più. La prossima è tua.',
 'Nice try! The flame was a bit shorter. You’ll get the next one.':'Bel tentativo! La fiamma era un po’ più corta. La prossima ce la fai.',
 'Extra crispy! Igor loves them anyway. The flame was shorter.':'Extra croccanti! A Igor piacciono lo stesso. La fiamma era più corta.',
 'Flames from 0.5 to 2 seconds · listen as often as you like':'Fiamme da 0,5 a 2 secondi · ascolta quante volte vuoi',
 'Flames from 0.3 to 4 seconds · you hear it twice':'Fiamme da 0,3 a 4 secondi · la senti due volte',
 'Flames from 0.2 to 6 seconds · you hear it only once':'Fiamme da 0,2 a 6 secondi · la senti una volta sola',
 // window
 'The window':'La finestra','The window · Igor time':'La finestra · Igor time',
 'Behind the curtain a window is open. Outside there’s':'Dietro la tenda c’è una finestra aperta. Fuori c’è',
 'wind':'il vento',', a storm, traffic, birds or crickets at night: listen to how loud it comes in.':', un temporale, il traffico, gli uccellini o i grilli di notte: ascolta quanto forte entra.',
 'slide':'alza o abbassa la finestra di','’s window':'','up or down: the more it’s open, the louder it gets. When it sounds the same, press':': più è aperta, più si sente forte. Quando suona uguale, premi',
 'keys: ↑↓ open and close, space = my wind, L = listen, enter = that’s it':'tasti: ↑↓ apri e chiudi, spazio = il mio vento, L = ascolta, invio = ecco',
 '♪ My window':'♪ La mia finestra',
 'Listen to the wind…':'Ascolta il vento…','Again! How loud?':'Ancora! Quanto forte?','Shh. The wind…':'Shh. Il vento…','Another gust. Listen.':'Un’altra folata. Ascolta.','Last one. Just enough.':'L’ultima. Né troppo né poco.',
 'Birds outside! Listen…':'Uccellini fuori! Ascolta…','Night outside. Listen…':'Fuori è notte. Ascolta…','Traffic outside. How loud?':'Traffico fuori. Quanto forte?','Wind outside. How loud?':'Vento fuori. Quanto forte?',
 'Spot on! Exactly as loud.':'Perfetto! Forte uguale.','So close! Close it just a little.':'Quasi! Chiudila appena un po’.','So close! Open it just a little more.':'Quasi! Aprila appena un po’ di più.',
 'Good try! Outside it was softer. The next one’s yours.':'Bel tentativo! Fuori era più piano. La prossima è tua.','Good try! Outside it was louder. You’ll get the next one.':'Bel tentativo! Fuori era più forte. La prossima ce la fai.',
 'Long gusts · listen as often as you like':'Folate lunghe · ascolta quante volte vuoi','Shorter gusts · you hear it twice':'Folate più corte · le senti due volte','Short gusts, trickier winds · you hear it only once':'Folate corte, venti più difficili · le senti una volta sola',
 // bedroom
 'The bedroom':'La camera','The bedroom · Igor time':'La camera · Igor time',
 'Behind the curtain, a sound sets the colour of the bedroom lights. It’s a mix of three very different sounds on the same note: a':'Dietro la tenda, un suono decide il colore delle luci della camera. È un miscuglio di tre suoni molto diversi sulla stessa nota: una',
 ', a':', un’','pure sine':'sinusoide pura','very buzzy wave':'onda molto ronzante','and a':'e una','narrow band of noise':'banda stretta di rumore',
 'Move the cursor on':'Muovi il cursore sul telecomando triangolare di','’s':'','triangular remote':'','to find the same mix, then press':'per trovare lo stesso miscuglio, poi premi',
 ': the lights will show how close you got.':': le luci ti diranno quanto ci sei andato vicino.',
 'keys: arrows move the cursor, space = my sound, L = listen, enter = that’s it':'tasti: frecce per muovere il cursore, spazio = il mio suono, L = ascolta, invio = ecco',
 '♪ My sound':'♪ Il mio suono',
 'Listen. What colour is it?':'Ascolta. Di che colore è?','Shh. New colour.':'Shh. Nuovo colore.','Another one. Listen closely.':'Un altro. Ascolta bene.','Last one. Find the colour.':'L’ultimo. Trova il colore.',
 'Spot on! Same colour, same sound.':'Perfetto! Stesso colore, stesso suono.','So close! The lights match.':'Quasi! Le luci sono uguali.','Lovely! Nearly the same colour.':'Bellissimo! Quasi lo stesso colore.',
 'Long sound · listen as often as you like':'Suono lungo · ascolta quante volte vuoi','Shorter sound · you hear it twice':'Suono più corto · lo senti due volte','Short sound · you hear it only once':'Suono corto · lo senti una volta sola',
 // pitch stairs
 'Pitch Stairs · Igor time':'Pitch Stairs · Igor time','Pitch':'Pitch','Stairs':'Stairs',
 'A tofu ant is hiding on the staircase':'Una formica di tofu si nasconde sulla scala','behind the curtain':'dietro la tenda','. When the light comes on, it sings.':'. Quando si accende la luce, canta.',
 'Drag':'Trascina','up and down the staircase: the higher you climb, the higher the note. Reach the same height as the ant and it’s lunchtime.':'su e giù per la scala: più sali, più la nota è acuta. Arriva alla stessa altezza della formica ed è ora di pranzo.',
 'Headphones recommended · 5 rounds · keys: ↑↓ move, space = my note, L = listen, enter = that’s it':'Meglio con le cuffie · 5 round · tasti: ↑↓ muovi, spazio = la mia nota, L = ascolta, invio = ecco',
 '♪ My note':'♪ La mia nota','out of 500':'su 500','Another one. Up or down?':'Un’altra. Su o giù?','Perfect pitch! Spot on.':'Orecchio assoluto! Perfetto.',
 'One octave · long note · listen as often as you like':'Un’ottava · nota lunga · ascolta quante volte vuoi','Two octaves · shorter note · you hear it twice':'Due ottave · nota più corta · la senti due volte','Two octaves · very short note · you hear it only once':'Due ottave · nota cortissima · la senti una volta sola',
 // cadences
 'Cadences · Igor time':'Cadenze · Igor time','Cadences':'Cadenze','Four-part':'A quattro parti',
 'Three chords are already written.':'Tre accordi sono già scritti.','Write the last two':'Scrivi gli ultimi due','in four voices (soprano, alto, tenor, bass) to finish the phrase with the cadence':'a quattro voci (soprano, contralto, tenore, basso) per chiudere la frase con la cadenza che',
 'asks for.':'ti chiede.','recognises your cadence and checks the voice leading: parallel fifths and octaves, hidden fifths, doublings, the leading tone, the seventh, ranges and spacing.':'riconosce la tua cadenza e controlla la condotta delle parti: quinte e ottave parallele, quinte nascoste, raddoppi, la sensibile, la settima, estensioni e distanze.',
 'Check':'Controlla','Hi! Ready to write some cadences?':'Ciao! Pronto a scrivere qualche cadenza?',
 'Tap a staff in your chords to add notes: the lower note is alto (or bass), the higher one soprano (or tenor) · tap a note to select it, drag to move it · keys: S A T B, ↑↓ move, ←→ chord, + − = sharp flat natural, space = listen, enter = check':'Tocca un pentagramma nei tuoi accordi per aggiungere note: la nota più bassa è il contralto (o il basso), la più alta il soprano (o il tenore) · tocca una nota per sceglierla, trascinala per spostarla · tasti: S A T B, ↑↓ muovi, ←→ accordo, + − = diesis bemolle bequadro, spazio = ascolta, invio = controlla','Edit note':'Modifica nota','Yes, cross them':'Sì, incrociale','No, swap them':'No, scambiale',
 'Write all four voices in all your chords first!':'Prima scrivi tutte e quattro le voci in tutti i tuoi accordi!',
 'Clean voice leading: no parallels, no crossings, good doublings.':'Condotta pulita: niente parallele, niente incroci, buoni raddoppi.',
 'Major keys with up to one sharp or flat · perfect, plagal and half cadences · chord symbols and hints shown':'Tonalità maggiori fino a un diesis o un bemolle · cadenze perfetta, plagale e sospesa · sigle degli accordi e suggerimenti',
 'Major keys up to three accidentals · adds deceptive cadence and modulation to the dominant · chord symbols shown':'Tonalità maggiori fino a tre alterazioni · in più cadenza d’inganno e modulazione alla dominante · sigle degli accordi',
 'Grand staff with five chords: the first three are given, you write the last two':'Doppio pentagramma con cinque accordi: i primi tre sono dati, tu scrivi gli ultimi due',
 // abyss
 'The abyss · Igor time':'L’abisso · Igor time','Dive in':'Tuffati','Back to the island':'Torna all’isola','Again':'Ancora','End of the dive':'Fine dell’immersione',
 'Deepest dives · everyone':'Immersioni più profonde · tutti','Reading the annals…':'Leggo gli annali…','Playing with your account':'Giochi col tuo account',
 '150 points give a tofu seed: dive deeper next time.':'150 punti danno un seme di tofu: la prossima volta scendi più giù.',
 'Couldn’t reach the annals this time. Your seeds are safe.':'Questa volta non ho raggiunto gli annali. I tuoi semi sono al sicuro.',
 'No depth to carve this time.':'Nessuna profondità da incidere questa volta.','Sign in on the island':'Accedi sull’isola','Sign in on the island to carve your name in the annals.':'Accedi sull’isola per incidere il tuo nome negli annali.',
 'Choose a nickname on the island (tap your name at the top) to appear in the annals.':'Scegli un nickname sull’isola (tocca il tuo nome in alto) per comparire negli annali.',
 'The ranking is out of reach right now: these are the dives on this device.':'La classifica ora non si raggiunge: queste sono le immersioni su questo dispositivo.',
 'depth carved into the annals ✓':'profondità incisa negli annali ✓','carved in the annals: your deepest dive still counts ✓':'inciso negli annali: conta ancora la tua immersione più profonda ✓',
 'Depth reached:':'Profondità raggiunta:','tongue: catch the pale creatures':'lingua: prendi le creature chiare','jump over the':'salta sopra le','red ones':'rosse',
 '(hold, max 2s) duck under the':'(tieni premuto, max 2 s) abbassati sotto le','jellyfish':'meduse','golden lure: 4s to eat the red ones too':'esca dorata: 4 s per mangiare anche le rosse',
 'Now and then a heart gives back a life (max 5). At 700 points, then every 1500, a':'Ogni tanto un cuore ridà una vita (max 5). A 700 punti, poi ogni 1500, sale un','leviathan':'leviatano','rises: when its shield drops,':': quando abbassa lo scudo,','shoot':'spara','your prey with':'le prede con',
 'depth':'profondità','prey':'prede','tongue':'lingua','jump':'salto','duck':'giù','Every 150 points = 1 tofu seed':'Ogni 150 punti = 1 seme di tofu','for the field.':'per il campo.','Diving as':'Ti immergi come','with your':'con il tuo',
 '· The kitchen':'· La cucina','· The window':'· La finestra','· The bedroom':'· La camera','· Cadences':'· Cadenze','· Pitch Stairs':'· Pitch Stairs'
};
/* whole elements whose words are split by tags */
const ELD={'The kitchen':'La <em>cucina</em>','The window':'La <em>finestra</em>','The bedroom':'La <em>camera</em>','The abyss':'L’<em>abisso</em>','Four-part Cadences':'Cadenze <em>a quattro parti</em>'};
/* texts that change: [pattern, replacement] */
const R=[
 [/^tongue: catch the pale creatures\s*·$/,'lingua: prendi le creature chiare ·'],[/^jump over the$/,'salta sopra le'],
 [/^▶ Listen \((\d+)\)$/,'▶ Ascolta ($1)'],
 [/^(Easy|Medium|Extreme) · your score$/,(m,a)=>`${lv(a)} · il tuo punteggio`],
 [/^(Easy|Medium|Extreme) · (\d+) rounds$/,(m,a,n)=>`${lv(a)} · ${n} round`],
 [/^New personal best on (Easy|Medium|Extreme)!$/,(m,a)=>`Nuovo record a livello ${lv(a).toLowerCase()}!`],
 [/^Your best on (Easy|Medium|Extreme): (\d+)$/,(m,a,b)=>`Il tuo record a livello ${lv(a).toLowerCase()}: ${b}`],
 [/^best on (easy|medium|extreme): (\d+)$/,(m,a,b)=>`record a livello ${lv(a)}: ${b}`],
 [/^\+(\d+) tofu seeds? for (.+?)’s field(?: \(×(\d) on (Easy|Medium|Extreme)\))?\. Collect them back on the island\.$/,(m,n,who,x,l)=>`+${n} ${n==1?'seme':'semi'} di tofu per il campo di ${who}${x?` (×${x} a livello ${lv(l).toLowerCase()})`:''}. Raccoglili sull’isola.`],
 [/^\+(\d+) tofu seeds? for Igor’s field\. Collect them back on the island\.$/,(m,n)=>`+${n} ${n==1?'seme':'semi'} di tofu per il campo di Igor. Raccoglili sull’isola.`],
 [/^Playing as (.+?) with your (.+?) · (?:tofu seeds: )?easy ×1, medium ×2, extreme ×3(?: tofu seeds)?$/,'Giochi come $1 con $2 · semi di tofu: facile ×1, medio ×2, estremo ×3'],
 [/^Playing as (.+)$/,'Giochi come $1'],
 [/^(\d+) rounds · (.+)$/,(m,n,k)=>`${n} round · ${t1(k)}`],
 [/^Your best on this device:$/,'Il tuo record su questo dispositivo:'],
 [/^to carve your name in the annals\.$/,'per incidere il tuo nome negli annali.'],
 [/^Golden ears\. (.+) is full and very grateful\.$/,'Orecchio d’oro. $1 è sazio e ti ringrazia tanto.'],
 [/^Great ears! (.+) had a lovely meal\.$/,'Che orecchio! $1 ha fatto un bel pranzetto.'],
 [/^Nice ears! (.+) had a tasty snack and is ready for a second course\.$/,'Bell’orecchio! $1 ha fatto uno spuntino ed è pronto per il bis.'],
 [/^Nice ears! (.+) had a tasty snack\.$/,'Bell’orecchio! $1 ha fatto uno spuntino.'],
 [/^(.+) loved it! One more round and lunch is yours\.$/,'A $1 è piaciuto tanto! Un altro giro e il pranzo è tuo.'],
 [/^(.+) loved the concert! One more round and lunch is yours\.$/,'A $1 è piaciuto il concerto! Un altro giro e il pranzo è tuo.'],
 [/^Magnificent part-writing\. (.+) is full and very proud of you\.$/,'Condotta delle parti magnifica. $1 è sazio e fiero di te.'],
 [/^Great harmony! (.+) had a lovely meal\.$/,'Che armonia! $1 ha fatto un bel pranzetto.'],
 [/^Nice work! (.+) enjoyed a tasty snack and wants another round\.$/,'Bel lavoro! $1 ha fatto uno spuntino e vuole un altro giro.'],
 [/^(.+) loved your chords! One more round and the cadences will flow\.$/,'A $1 sono piaciuti i tuoi accordi! Un altro giro e le cadenze scorreranno.'],
 [/^ ?\+(\d+) tofu seeds? for (.+?)’s field: collect them back on the island\.$/,(m,n,who)=>` +${n} ${n==1?'seme':'semi'} di tofu per il campo di ${who}: raccoglili sull’isola.`],
 [/^Only (\d+) ms off\. Delicious!$/,'Solo $1 ms di differenza. Buonissime!'],[/^Just (\d+) ms\. Yummy!$/,'Solo $1 ms. Gnam!'],
 [/^Only ([\d.]+) dB off\. A tofu ant came in!$/,'Solo $1 dB di differenza. È entrata una formica di tofu!'],[/^Just ([\d.]+) dB\. Lovely!$/,'Solo $1 dB. Bellissimo!'],
 [/^Nearly! A little more (.+) next time\.$/,(m,x)=>`Quasi! La prossima volta un po’ più di ${POLE[x]||x}.`],
 [/^Good try! There was more (.+) in it\. The next one’s yours\.$/,(m,x)=>`Bel tentativo! C’era più ${POLE[x]||x}. La prossima è tua.`]
];
function t1(s){const k=s.trim();if(D[k]!=null){let r=s.replace(k,D[k]);if(/^[:,.;]/.test(D[k]))r=r.replace(/^\s+/,'');if(/’$/.test(D[k]))r=r.replace(/’\s+$/,'’');return r}for(const[re,rp]of R){if(re.test(k))return s.replace(k,k.replace(re,rp))}return null}
const done=new WeakMap();
function tNode(n){const v=n.nodeValue;if(!v||!/[A-Za-z]/.test(v)||done.get(n)===v)return;const r=t1(v);if(r!=null&&r!==v)n.nodeValue=r;done.set(n,n.nodeValue)}
function tAttr(el){for(const a of['aria-label','title','placeholder']){const v=el.getAttribute&&el.getAttribute(a);if(v){const r=t1(v);if(r!=null&&r!==v)el.setAttribute(a,r)}}}
function walk(root){if(root.nodeType===3){tNode(root);return}if(root.nodeType!==1)return;if(/^(SCRIPT|STYLE)$/.test(root.tagName))return;tAttr(root);if(/^(H1|H2|P)$/.test(root.tagName)&&root.children.length&&root.children.length<3){const w=ELD[root.textContent.trim()];if(w){root.innerHTML=w;return}}for(let c=root.firstChild;c;c=c.nextSibling)walk(c)}
const fixTitle=()=>{const r=t1(document.title);if(r&&r!==document.title)document.title=r};
const mo=new MutationObserver(ms=>{for(const m of ms){if(m.type==='characterData')tNode(m.target);else if(m.type==='attributes')tAttr(m.target);else for(const n of m.addedNodes)walk(n)}fixTitle()});
mo.observe(document.documentElement,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['aria-label','title','placeholder']});
const first=()=>{walk(document.documentElement);fixTitle()};
if(document.readyState!=='loading')first();else document.addEventListener('DOMContentLoaded',first);
})();
