export const GROUP_NICKS = [
  "ryhmärämä","poppoo","kaveriporukka","hassuttelijat","apinalauma",
  "orkesteri","mestarit","kuninkaat","juopot","seurue","tiimi","kaaderi",
  "partio","jengi","sakki","posse","lauma","laumakki","huppeli","rämä",
  "porukka","komppania","prikaati","joukkio","konklaavi","porukat",
  "kapina","kollegat","kuusikko","bändi",
];

export const GREETINGS = [
  "Hei","Moro","Heippa","Hei hei","No niin","Terve","Jou","Moikka",
  "Haloo","Öö hei","Eiku moro","No terve vaan","Päivää","Ilta",
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
