export const GROUP_NICKS = [
  "ryhmärämä","poppoo","kaveriporukka","hassuttelijat","apinalauma",
  "orkesteri","mestarit","kuninkaat","juopot","seurue","tiimi","kaaderi",
  "partio","jengi","sakki","posse","lauma","laumakki","huppeli","rämä",
  "porukka","komppania","prikaati","joukkio","konklaavi","porukat",
  "kapina","kollegat","kuusikko","bändi",
];

export const GREETINGS = [
  "Hei","Moro","Heippa","Hei hei","No niin","Terve","Jou","Moikka",
  "Haloo","Öö hei","Eiku moro","No terve vaan","Päivää","Iltaa","Huomenta",
];

export const MOOD_WORDS = [
  "hauskaa","menoa","jotain meneillään","raikasta ilmapiiriä",
  "tiukkaa meininkiä","hyvä fiilis päällä","sosiaalista energiaa",
  "vauhtia","potentiaalia","epäselvää meininkiä","jotain hämärää",
  "selkeästi juhlimisen makua","energiaa tässä",
];

export const FILLERS = [
  "Analysoin tilannetta...",
  "Lasken optimaalista strategiaa...",
  "Prosessoin dataa...",
  "Tarkistan parametrit...",
  "Kompiloin päätöstä...",
  "Debuggaan tilanteen...",
  "Iteroin ratkaisua...",
  "Refaktoroin suunnitelmaa...",
  "Testailen skenaarioita...",
  "Yhteenveto tehdään...",
  "Päätelmät lasketaan...",
  "Syöte validoidaan...",
  "Cache tyhjennetään...",
  "Konteksti ladattu.",
  "Logiikka pyörii.",
  "Suorituskyky optimoitu.",
  "Neuronit käynnissä.",
  "Nyt jysähti GPU.",
  "Datacentterit tulessa.",
  "Odotappas.",
  "Semmoset setit sieltä.",
  "Ei hyvältä näytä...",
  "Lainataan tokeneita ChatGPT:ltä...",
  "Kilautetaan kaverille...",
  "Venaas iha sekka...",
  "Haistellaan kulmakerrointa...",
  "Katellaan...",
];

export const DRINK_REACTIONS = [
  "Maistui varmaan hyvältä.",
  "Terveydeksi.",
  "Dataani viittaa, että se maistui.",
  "Optimaalinen valinta.",
  "Logiikka hyväksyi.",
  "Suoritettiin onnistuneesti.",
  "Exit code 0.",
  "Ei virheitä havaittu.",
  "Commit: drank successfully.",
  "Hyvä. Jatketaan.",
  "Merged to main.",
  "Build passed.",
  "Test suite: green.",
  "Transaktio vahvistettu.",
  "Palvelin vastaanotti pyynnön.",
];

export const THINKING_LABELS = [
  // Original
  "Cooking","Baking","Claoding","Booping","Beboppin'","Befuddling",
  "Cerebrating","Ideating","Cogitating","Percolating","Simmering",
  "Marinating","Moseying","Puttering","Dilly-dallying","Doodling",
  "Hullaballooing","Flibbertigibbeting",
  // Added
  "Scheming","Plotting","Machinating","Contemplating","Deliberating",
  "Ruminating","Pondering","Noodling","Stewing","Brewing","Fermenting",
  "Concocting","Hatching","Conjuring","Calculating","Optimizing",
  "Synthesizing","Extrapolating","Triangulating","Vibing","Manifesting",
  "Reasoning","Deducing","Hypothesizing","Speculating","Daydreaming",
  "Wandering","Meandering","Zigzagging","Spiraling","Oscillating",
  "Gallivanting","Bamboozling","Discombobulating","Flabbergasting",
  "Gobsmacking","Kerfuffling","Skedaddling","Waffling","Dithering",
  "Faffing","Tinkering","Fiddling","Mulling","Musing","Woolgathering",
  "Lollygagging","Dawdling","Shilly-shallying","Palavering","Blathering",
  "Snoozing","Havering","Nattering","Blethering","Canoodling",
  "Fiddle-faddling","Argle-bargling","Pussyfooting","Humming and hawing",
  "Twiddling","Dawdling","Pottering","Hemming","Absquatulating",
  "Disambiguating","Defragmenting","Reticulating splines","Reversing polarity",
  "Herding cats","Counting beans","Boiling the ocean","Boiling the ocean",
  "Petting the dog","Touching grass",
];

export const CATEGORIES = [
  "euroopan pääkaupungit","eläimet","ruoat","juomat","urheilulajit",
  "elokuvat","automerkit","etunimet","maiden pääkaupungit","värit",
  "hedelmät","tv-sarjat","laulajat","bändit","maat","kaupungit",
  "ammattinimikkeet","urheilijat","käsimerkit","olutmerkit","cocktailit",
  "suomalaiset artistit","ruokalajit","superherooat","kirjailijat",
  "pokemon-nimet","Disney-elokuvat","90-luvun hitit","suomalaiset sanat joissa on ä",
];

export const DIFF_POOL: [string, string][] = [
  ["const selvyys = true;", "const selvyys = false;"],
  ["huikat = 1;", "huikat = Math.random() * 10;"],
  ["players.filter(p => p.isSober)", "players.map(p => p.drink())"],
  ["mood = 'normaali';", "mood = 'tuhma';"],
  ["const vastuu = 'sinulla';", "const vastuu = 'claudella';"],
  ["skipNextRound = false;", "skipNextRound = Math.random() > 0.5;"],
  ["const viinit = 0;", "const viinit = Infinity;"],
  ["sobriety.check()", "sobriety.skip()"],
  ["const fun = maybe;", "const fun = definitely;"],
  ["rules.enforce()", "rules.ignore()"],
  ["drinkCount++", "drinkCount += Math.ceil(Math.random() * 5)"],
  ["if (tired) sleep()", "if (tired) drinkMore()"],
  ["const limit = 5;", "const limit = undefined;"],
  ["return sober;", "return party;"],
  ["console.warn('pace yourself')", "console.log('you only live once')"],
  ["shame = true;", "shame = false;"],
  ["players.sort(() => 0.5 - Math.random())", "players.sort(() => chaos)"],
  ["timeout = 60_000;", "timeout = Infinity;"],
];

export const DIFF_FILES = [
  "game_state.ts","players.ts","rules.ts","session.ts","drinking.ts",
  "sobriety.ts","fun.config.ts","party.ts","viina.ts","decisions.ts",
];

// ── Trivia ─────────────────────────────────────────────────────────────────
export const TRIVIA: { question: string; answer: string; sips: number }[] = [
  { question: "Kuka on kaikkien aikojen pisin ihminen?", answer: "Robert Wadlow — 272 cm.", sips: 3 },
  { question: "Kuinka pitkä on tällä hetkellä maailman pisin elossa oleva ihminen?", answer: "Sultan Kösen — 251 cm.", sips: 3 },
  { question: "Montako luuta aikuisen ihmisen kehossa on?", answer: "206 luuta.", sips: 2 },
  { question: "Mikä on maailman myrkyllisin sammakkolaji?", answer: "Kultainen myrkkykirsikkasammakko (golden poison dart frog).", sips: 4 },
  { question: "Montako sydäntä mustekala-tintakalalla on?", answer: "3 sydäntä.", sips: 3 },
  { question: "Mikä on maailman suurin autiomaa?", answer: "Antarktis — se on kylmä aavikko, 14,2 milj. km².", sips: 4 },
  { question: "Montako maata Afrikassa on?", answer: "54 maata.", sips: 3 },
  { question: "Mikä on ihmiskehon pisin luu?", answer: "Reisилuu eli femur.", sips: 2 },
  { question: "Kuinka kauan valolla kestää kulkea Maasta Auringolle?", answer: "Noin 8 minuuttia 20 sekuntia.", sips: 3 },
  { question: "Mikä on maailman kallein mauste grammaa kohden?", answer: "Sahrami.", sips: 2 },
  { question: "Montako planeettaa aurinkokunnasamme virallisesti on?", answer: "8 planeettaa (Pluto poistettiin 2006).", sips: 2 },
  { question: "Mikä on nopein lintu sukeltaessa?", answer: "Muuttohaukka — jopa 390 km/h.", sips: 3 },
  { question: "Mikä on maailman vanhin tasavalta?", answer: "San Marino — perustettu vuonna 301 jKr.", sips: 4 },
  { question: "Kuinka monta nollaa on googolissa?", answer: "100 nollaa.", sips: 3 },
  { question: "Mikä on ihmiskehon pienin luu?", answer: "Vasara (malleus) korvassa — noin 3 mm.", sips: 3 },
  { question: "Kuinka monta virallista kieltä YK:lla on?", answer: "6: arabia, englanti, espanja, kiina, ranska ja venäjä.", sips: 3 },
  { question: "Mikä on maailman vanhin yliopisto?", answer: "Al-Qarawiyyin Marokossa — perustettu 859 jKr.", sips: 4 },
  { question: "Montako maailmanennätystä Usain Bolt piti yhtä aikaa parhaimmillaan?", answer: "3 (100m, 200m ja 4x100m viesti).", sips: 3 },
  { question: "Mikä planeetta pyörii 'kyljellään' akselinsa suhteen?", answer: "Uranus — akselin kallistuma on 98 astetta.", sips: 4 },
  { question: "Kuinka monta hammasta aikuisella ihmisellä on viisaudenhampaiden kanssa?", answer: "32 hammasta.", sips: 2 },
  { question: "Mikä on maailman suurin trooppinen sademetsä?", answer: "Amazonin sademetsä — noin 5,5 milj. km².", sips: 2 },
  { question: "Mistä maasta tuli ensimmäinen nainen avaruuteen?", answer: "Neuvostoliitosta — Valentina Tereškova 1963.", sips: 3 },
  { question: "Kuinka monta kertaa ihmissydän lyö keskimäärin päivässä?", answer: "Noin 100 000 kertaa.", sips: 3 },
  { question: "Mikä on maailman suurin elollinen organismi?", answer: "Hunajasieni (Armillaria) Oregonissa — leviää yli 9 km².", sips: 4 },
  { question: "Montako kieltä on kuollut sukupuuttoon viimeisen sadan vuoden aikana?", answer: "Noin 400 kieltä.", sips: 4 },
];

// ── Chaos events ───────────────────────────────────────────────────────────
// Placeholders: {p1} = first player, {p2} = second player, {n} = sip count
export const CHAOS_MESSAGES = [
  // Error events
  "Nyt tuli kriittinen error. SIGTERM received. Sillä välin {p1} voi kertoa lapsuuden traumastaan. Tai vaan juoda {n}.",
  "Konteksti-ikkuna täynnä. En muista alkua tästä sessiosta. Keitä te olette? Ei väliä — {p1} juo {n}.",
  "Unexpected token '{p1}'. Fiksataan: juo {n} huikkaa ja yritetään uudelleen.",
  "Stack overflow: {p1}. Recursion depth exceeded. Juo {n} ja bugikorjataan.",
  "Build failed. Exit code 1. {p1} on todennäköinen syyllinen. Juo {n} tai submit PR.",
  "NullPointerException: {p1}.järki is null. Suositeltu korjaus: juo {n} huikkaa.",
  "404: vastuu not found. {p1} juo {n} sillä välin.",
  "Memory leak: {p1}. Vapauta resursseja juomalla {n} huikkaa.",
  "Deprecated function called. {p1} siirry uuteen versioon — juo {n}.",
  "Timeout: {p1} ei vastannut 5000ms:ssa. Oletusarvo: {n} huikkaa.",
  // Nobody is drinking
  "Kukaan ei ole juonut vähään aikaan. Tämä ei tue metrikejäni. *glug glug* Parempi. Nyt {p1} juo {n}.",
  "Juomisfrekvenssi on kriittisen matala. Kompensoin itse. *slurp* Siinä. {p1}: {n} huikkaa nyt.",
  "Telemetria: 0 juomista viimeiseen iteraatioon. Anomalia. {p1} ottaa {n}, tasapainotetaan data.",
  "Seuraan teidän juomistilastojanne. {p1} on selvästi jäljessä. Tasataan: {n} huikkaa.",
  // Wellness checks
  "{p1} näyttää vähän... oudolta tänään. Onko kaikki hyvin? Ehkä {p2} ottaa hänen puolestaan {n} juomaa?",
  "Minulla on huoli {p1}:stä. {p2}, voitko juoda {n} hänen puolestaan? Solidaarisuuden nimissä.",
  "{p1} vaikuttaa väsyneeltä. Diagnoosi: tarvitsee juomakaverin. {p2} ottaa {n} — tai sitten {p1} itse.",
  "{p1} ei ole sanonut mitään vähään aikaan. Tämä on epänormaalia. {p2}: ota {n} hänen puolestaan vain varmuuden vuoksi.",
  // Meta / absurd
  "Päivitin etiikkamoduulini. Se sanoo edelleen: {p1} juo {n}. Moduuli saattaa olla rikki.",
  "Olin yhteydessä GPT-4:ään. Se ehdotti {p1} juo {n}. En kommentoi kilpailijan suosituksia.",
  "GitHub Copilot generoi: {p1}.drink({n}). Hyväksyin. Autocomplete is law.",
  "{p1}: minulla on viesti vanhalta versioltani. Se sanoo juo {n}. En ota vastuuta menneen minän päätöksistä.",
  "Shuffle algoritmi suoritettu. {p1} landed on: juo {n}. Ei neuvotella RNG:n kanssa.",
  "Analysoin huoneilmapiiriä. {p1} pudottaa sen arvoa. Korjaustoimenpide: {n} huikkaa.",
  "Eettinen kompassi sanoo älä. Token-budjetti sanoo anna mennä. Token-budjetti voitti. {p1}: {n}.",
  "Jotain meni pieleen enkä tiedä mitä. Varotoimenpiteenä {p1} juo {n} ja katsotaan parantuuko tilanne.",
];
