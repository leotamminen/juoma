"use client";

import { useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────
type Suit = "hearts" | "spades" | "clubs" | "diamonds";
type Card = { suit: Suit; value: number; id: string };

type EffectState =
  | { kind: "waterfall" }
  | { kind: "give"; total: number; given: Record<number, number> }
  | { kind: "take"; sips: number }
  | { kind: "hitler"; sips: number; sub: "reveal" | "pick" }
  | { kind: "onetwothree" }
  | { kind: "category"; sips: number; sub: "prompt" | "pick" }
  | { kind: "rule"; penalty: number; newText: string }
  | { kind: "questionmaster"; sips: number }
  | { kind: "story"; sips: number; sub: "prompt" | "pick" }
  | { kind: "pausecard" }
  | { kind: "queen"; queenIdx: number | null }
  | { kind: "king"; sips: number };

type EffectKind = EffectState["kind"];

type CardDef = { name: string; effect: EffectKind; sips: number; desc: string };
type Package = { id: string; name: string; defs: Record<number, CardDef> };

type Rule = { id: string; text: string; ownerIdx: number; penalty: number };
type QueenLink = { masterIdx: number; queenIdx: number };

// ── Constants ──────────────────────────────────────────────────────────────
const SUITS: Suit[] = ["hearts", "spades", "clubs", "diamonds"];
const SUIT_SYMBOLS: Record<Suit, string> = { hearts: "♥", spades: "♠", clubs: "♣", diamonds: "♦" };
const VAL: Record<number, string> = { 1:"A",2:"2",3:"3",4:"4",5:"5",6:"6",7:"7",8:"8",9:"9",10:"10",11:"J",12:"Q",13:"K" };
const isRed = (s: Suit) => s === "hearts" || s === "diamonds";
const uid = () => Math.random().toString(36).slice(2);

function createDeck(): Card[] {
  const d: Card[] = [];
  for (const s of SUITS) for (let v = 1; v <= 13; v++) d.push({ suit: s, value: v, id: `${s}-${v}` });
  return d;
}
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// ── Packages ───────────────────────────────────────────────────────────────
const PACKAGES: Package[] = [
  {
    id: "default",
    name: "Perus",
    defs: {
      1:  { name: "Vesiputous",     effect: "waterfall",      sips: 0, desc: "Aloita juominen. Jokainen voi lopettaa vasta kun edellinen on lopettanut." },
      2:  { name: "Anna 2",         effect: "give",           sips: 2, desc: "Anna 2 huikkaa kenelle tahansa. Voit jakaa." },
      3:  { name: "Ota 3",          effect: "take",           sips: 3, desc: "Ota 3 huikkaa itse." },
      4:  { name: "Hitler!",        effect: "hitler",         sips: 3, desc: "Viimeinen joka huutaa Hitler! juo 3 huikkaa." },
      5:  { name: "Hitler!",        effect: "hitler",         sips: 3, desc: "Viimeinen joka huutaa Hitler! juo 3 huikkaa." },
      6:  { name: "1-2-3",          effect: "onetwothree",    sips: 0, desc: "Vuorossa oleva juo 1, seuraava 2, jne." },
      7:  { name: "Kategoria",      effect: "category",       sips: 3, desc: "Päätä kategoria. Epäonnistuja juo 3 huikkaa." },
      8:  { name: "Sääntö",         effect: "rule",           sips: 3, desc: "Luo sääntö tai poista vanha. Rikkomisesta 3 huikkaa." },
      9:  { name: "Kysymysmestari", effect: "questionmaster", sips: 3, desc: "Olet kysymysmestari. Vastaaminen maksaa 3 huikkaa." },
      10: { name: "Tarina",         effect: "story",          sips: 3, desc: "Tarina sanasta sanaan. Epäonnistuja juo 3 huikkaa." },
      11: { name: "Pausekortti",    effect: "pausecard",      sips: 0, desc: "Pidä kortti. Voit pitää tauon milloin tahansa." },
      12: { name: "Huora",          effect: "queen",          sips: 0, desc: "Valitse huorasi – hän juo aina kun sinä juot." },
      13: { name: "Kuningashörppy", effect: "king",           sips: 3, desc: "Kaikki juovat 3 huikkaa." },
    },
  },
];

// ── PlayingCard ────────────────────────────────────────────────────────────
function PlayingCard({ card, large = false }: { card: Card; large?: boolean }) {
  const sz = large ? "w-20 h-28 rounded-xl text-lg" : "w-12 h-16 rounded-lg text-xs";
  const red = isRed(card.suit);
  return (
    <div className={`${sz} border-2 border-gray-300 bg-white shadow flex flex-col justify-between p-1 ${red ? "text-red-500" : "text-gray-900"}`}>
      <span className="font-bold leading-none">{VAL[card.value]}</span>
      <span className={`text-center leading-none ${large ? "text-3xl" : "text-lg"}`}>{SUIT_SYMBOLS[card.suit]}</span>
      <span className="font-bold leading-none self-end rotate-180">{VAL[card.value]}</span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
const Hitler = ({ players: initialPlayers, onBack }: { players: string[]; onBack: () => void }) => {
  // Setup
  const [setupPlayers, setSetupPlayers] = useState<string[]>(
    initialPlayers.length >= 2 ? initialPlayers : []
  );
  const [newName, setNewName] = useState("");
  const [selectedPkgId, setSelectedPkgId] = useState("default");

  // Game
  const [phase, setPhase] = useState<"setup" | "playing">("setup");
  const [players, setPlayers] = useState<string[]>([]);
  const [deck, setDeck] = useState<Card[]>([]);
  const [cursor, setCursor] = useState(0);
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [pkg, setPkg] = useState<Package>(PACKAGES[0]);

  // Turn
  const [turnState, setTurnState] = useState<"draw" | "effect">("draw");
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [effect, setEffect] = useState<EffectState | null>(null);

  // Persistent mechanics
  const [activeRules, setActiveRules] = useState<Rule[]>([]);
  const [questionMasterIdx, setQuestionMasterIdx] = useState<number | null>(null);
  const [queens, setQueens] = useState<QueenLink[]>([]);
  const [pauseCardHolder, setPauseCardHolder] = useState<number | null>(null);
  const [pausePickerOpen, setPausePickerOpen] = useState(false);

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  // ── Setup ──
  const addPlayer = () => {
    if (!newName.trim()) return;
    setSetupPlayers(p => [...p, newName.trim()]);
    setNewName("");
  };

  const startGame = () => {
    const p = PACKAGES.find(x => x.id === selectedPkgId) ?? PACKAGES[0];
    setPlayers([...setupPlayers]);
    setDeck(shuffle(createDeck()));
    setCursor(0);
    setCurrentPlayerIdx(0);
    setPkg(p);
    setTurnState("draw");
    setCurrentCard(null);
    setEffect(null);
    setActiveRules([]);
    setQuestionMasterIdx(null);
    setQueens([]);
    setPauseCardHolder(null);
    setPhase("playing");
  };

  // ── Turn logic ──
  const drawCard = () => {
    let d = deck;
    let c = cursor;
    if (c >= d.length) {
      d = shuffle(createDeck());
      setDeck(d);
      c = 0;
    }
    const card = d[c];
    setCurrentCard(card);
    setCursor(c + 1);
    const def = p.defs[card.value];
    if (!def) return;
    switch (def.effect) {
      case "waterfall":      setEffect({ kind: "waterfall" }); break;
      case "give":           setEffect({ kind: "give", total: def.sips, given: {} }); break;
      case "take":           setEffect({ kind: "take", sips: def.sips }); break;
      case "hitler":         setEffect({ kind: "hitler", sips: def.sips, sub: "reveal" }); break;
      case "onetwothree":    setEffect({ kind: "onetwothree" }); break;
      case "category":       setEffect({ kind: "category", sips: def.sips, sub: "prompt" }); break;
      case "rule":           setEffect({ kind: "rule", penalty: def.sips, newText: "" }); break;
      case "questionmaster": setEffect({ kind: "questionmaster", sips: def.sips }); break;
      case "story":          setEffect({ kind: "story", sips: def.sips, sub: "prompt" }); break;
      case "pausecard":      setEffect({ kind: "pausecard" }); break;
      case "queen":          setEffect({ kind: "queen", queenIdx: null }); break;
      case "king":           setEffect({ kind: "king", sips: def.sips }); break;
    }
    setTurnState("effect");
  };

  // need pkg ref accessible in drawCard closure
  const p = pkg;

  const nextTurn = () => {
    setCurrentPlayerIdx(i => (i + 1) % players.length);
    setCurrentCard(null);
    setEffect(null);
    setTurnState("draw");
  };

  // ── Effect handlers ──
  const giveAdjust = (targetIdx: number, delta: number) => {
    if (effect?.kind !== "give") return;
    const cur = effect.given[targetIdx] ?? 0;
    const total = Object.values(effect.given).reduce((a, b) => a + b, 0);
    if (delta > 0 && total >= effect.total) return;
    if (delta < 0 && cur <= 0) return;
    setEffect({ ...effect, given: { ...effect.given, [targetIdx]: cur + delta } });
  };

  const confirmGive = () => {
    if (effect?.kind !== "give") return;
    Object.entries(effect.given)
      .filter(([, v]) => v > 0)
      .forEach(([idx, sips]) => setToast(`${players[Number(idx)]} juo ${sips} huikkaa!`));
    nextTurn();
  };

  const createRule = (penalty: number, text: string) => {
    if (!text.trim()) return;
    setActiveRules(r => [...r, { id: uid(), text: text.trim(), ownerIdx: currentPlayerIdx, penalty }]);
    nextTurn();
  };

  const deleteRule = (id: string) => {
    setActiveRules(r => r.filter(x => x.id !== id));
    nextTurn();
  };

  const usePauseCard = (nextHolder: number) => {
    const prev = pauseCardHolder;
    setPauseCardHolder(nextHolder);
    setPausePickerOpen(false);
    setToast(`${players[prev!]} pitää tauon. Kortti siirtyy ${players[nextHolder]}:lle.`);
  };

  const queenReminder = (drinkerIdx: number, sips: number) => {
    const linked = queens.filter(q => q.masterIdx === drinkerIdx);
    if (linked.length === 0) return null;
    return (
      <div className="mb-3 text-sm text-pink-300 bg-pink-900/30 border border-pink-700 rounded-xl px-3 py-2">
        👑 {linked.map(q => players[q.queenIdx]).join(", ")} myös juo {sips} huikkaa!
      </div>
    );
  };

  // ── Effect renderer ──
  const renderEffect = (e: EffectState): React.ReactNode => {
    const currentPlayer = players[currentPlayerIdx];
    switch (e.kind) {

      case "waterfall":
        return (
          <div className="bg-blue-900/40 border border-blue-700 rounded-2xl p-4 text-center">
            <p className="text-4xl mb-2">🌊</p>
            <p className="text-xl font-bold mb-2">Vesiputous!</p>
            <p className="text-sm text-gray-300 mb-4">
              <strong>{currentPlayer}</strong> aloittaa. Kaikki lähtevät samanaikaisesti.
              Voit lopettaa vasta kun sinua edeltävä on lopettanut.
            </p>
            <button onClick={nextTurn} className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold">Jatka</button>
          </div>
        );

      case "take":
        return (
          <div className="bg-red-900/40 border border-red-700 rounded-2xl p-4 text-center">
            <p className="text-6xl font-black mb-1">{e.sips}</p>
            <p className="text-xl font-bold mb-3">huikkaa itselle</p>
            {queenReminder(currentPlayerIdx, e.sips)}
            <button onClick={nextTurn} className="w-full py-3 bg-red-600 hover:bg-red-500 rounded-xl font-bold">Jatka</button>
          </div>
        );

      case "give": {
        const total = Object.values(e.given).reduce((a, b) => a + b, 0);
        return (
          <div className="bg-green-900/40 border border-green-700 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-lg font-bold">Anna {e.total} huikkaa</p>
              <span className={`text-lg font-bold ${total === e.total ? "text-green-400" : "text-yellow-400"}`}>{total}/{e.total}</span>
            </div>
            <div className="space-y-2 mb-4">
              {players.map((pl, i) => i === currentPlayerIdx ? null : (
                <div key={i} className="flex items-center gap-2">
                  <span className="flex-1 font-medium">{pl}</span>
                  <button onClick={() => giveAdjust(i, -1)} disabled={(e.given[i] ?? 0) <= 0}
                    className="w-9 h-9 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 rounded-lg font-bold text-lg">−</button>
                  <span className="w-8 text-center font-bold text-lg">{e.given[i] ?? 0}</span>
                  <button onClick={() => giveAdjust(i, 1)} disabled={total >= e.total}
                    className="w-9 h-9 bg-green-700 hover:bg-green-600 disabled:opacity-30 rounded-lg font-bold text-lg">+</button>
                </div>
              ))}
            </div>
            <button onClick={confirmGive} disabled={total !== e.total}
              className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-xl font-bold transition-colors">
              Vahvista
            </button>
          </div>
        );
      }

      case "hitler":
        if (e.sub === "reveal") {
          return (
            <div className="bg-black border-4 border-red-600 rounded-2xl p-6 text-center">
              <p className="text-7xl font-black text-red-500 tracking-widest mb-3">HITLER!</p>
              <p className="text-gray-300 mb-5">Viimeinen joka huutaa juo <strong>{e.sips}</strong> huikkaa!</p>
              <button onClick={() => setEffect({ ...e, sub: "pick" })}
                className="w-full py-3 bg-red-700 hover:bg-red-600 rounded-xl font-bold text-lg">
                Kuka oli viimeinen?
              </button>
            </div>
          );
        }
        return (
          <div className="bg-gray-800 border border-gray-600 rounded-2xl p-4">
            <p className="text-center font-bold mb-3">Kuka oli viimeinen?</p>
            <div className="space-y-2">
              {players.map((pl, i) => (
                <button key={i} onClick={() => { setToast(`${pl} juo ${e.sips} huikkaa!`); nextTurn(); }}
                  className="w-full py-3 bg-red-800 hover:bg-red-700 active:bg-red-900 rounded-xl font-bold">
                  {pl}
                </button>
              ))}
            </div>
          </div>
        );

      case "onetwothree": {
        const order = players.map((_, i) => (currentPlayerIdx + i) % players.length);
        return (
          <div className="bg-orange-900/40 border border-orange-700 rounded-2xl p-4">
            <p className="text-lg font-bold mb-3 text-center">1-2-3 Juominen</p>
            <div className="space-y-2 mb-4">
              {order.map((pi, rank) => (
                <div key={pi} className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3">
                  <span className="font-medium">{players[pi]}</span>
                  <span className="font-black text-orange-300 text-xl">{rank + 1} 🍺</span>
                </div>
              ))}
            </div>
            <button onClick={nextTurn} className="w-full py-3 bg-orange-600 hover:bg-orange-500 rounded-xl font-bold">Jatka</button>
          </div>
        );
      }

      case "category":
        if (e.sub === "prompt") {
          return (
            <div className="bg-purple-900/40 border border-purple-700 rounded-2xl p-4 text-center">
              <p className="text-4xl mb-2">🏷️</p>
              <p className="text-xl font-bold mb-2">Kategoria</p>
              <p className="text-sm text-gray-300 mb-1"><strong>{currentPlayer}</strong> päättää kategorian ja aloittaa.</p>
              <p className="text-sm text-gray-400 mb-5">Kierretään – epäonnistuja juo {e.sips} huikkaa.</p>
              <button onClick={() => setEffect({ ...e, sub: "pick" })}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold">
                Kuka hävisi?
              </button>
            </div>
          );
        }
        return (
          <div className="bg-gray-800 border border-gray-600 rounded-2xl p-4">
            <p className="text-center font-bold mb-3">Kuka hävisi kategorian?</p>
            <div className="space-y-2">
              {players.map((pl, i) => (
                <button key={i} onClick={() => { setToast(`${pl} juo ${e.sips} huikkaa!`); nextTurn(); }}
                  className="w-full py-3 bg-purple-800 hover:bg-purple-700 rounded-xl font-bold">
                  {pl}
                </button>
              ))}
            </div>
          </div>
        );

      case "rule":
        return (
          <div className="bg-yellow-900/40 border border-yellow-700 rounded-2xl p-4">
            <p className="text-lg font-bold mb-3">Sääntö <span className="text-sm font-normal text-gray-400">({e.penalty} 🍺 rikkomisesta)</span></p>
            {activeRules.length > 0 && (
              <>
                <p className="text-xs text-gray-400 mb-2">Poista olemassa oleva sääntö:</p>
                <div className="space-y-2 mb-3">
                  {activeRules.map(r => (
                    <button key={r.id} onClick={() => deleteRule(r.id)}
                      className="w-full text-left px-3 py-2 bg-red-900/50 hover:bg-red-800/60 border border-red-700 rounded-xl text-sm">
                      ✕ {r.text}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 text-center mb-3">— tai luo uusi —</p>
              </>
            )}
            <input
              type="text" value={e.newText}
              onChange={ev => setEffect({ ...e, newText: ev.target.value })}
              onKeyDown={ev => ev.key === "Enter" && createRule(e.penalty, e.newText)}
              placeholder="Kirjoita uusi sääntö…"
              className="w-full px-4 py-3 rounded-xl bg-gray-700 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-yellow-500 mb-3"
            />
            <button onClick={() => createRule(e.penalty, e.newText)} disabled={!e.newText.trim()}
              className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-xl font-bold transition-colors mb-2">
              Luo sääntö
            </button>
            <button onClick={nextTurn} className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-xl text-sm text-gray-400">Ohita</button>
          </div>
        );

      case "questionmaster":
        return (
          <div className="bg-blue-900/40 border border-blue-700 rounded-2xl p-4 text-center">
            <p className="text-4xl mb-2">🎤</p>
            <p className="text-xl font-bold mb-1">Kysymysmestari</p>
            <p className="text-sm text-gray-300 mb-1"><strong>{currentPlayer}</strong> on nyt kysymysmestari.</p>
            <p className="text-sm text-gray-400 mb-5">Jos vastaat hänen kysymyksiinsä, juot {e.sips} huikkaa.</p>
            <button onClick={() => { setQuestionMasterIdx(currentPlayerIdx); nextTurn(); }}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold">Jatka</button>
          </div>
        );

      case "story":
        if (e.sub === "prompt") {
          return (
            <div className="bg-teal-900/40 border border-teal-700 rounded-2xl p-4 text-center">
              <p className="text-4xl mb-2">📖</p>
              <p className="text-xl font-bold mb-2">Tarina</p>
              <p className="text-sm text-gray-300 mb-1"><strong>{currentPlayer}</strong> aloittaa yhden sanan.</p>
              <p className="text-sm text-gray-400 mb-5">Jokainen lisää sanan. Epäonnistuja juo {e.sips} huikkaa.</p>
              <button onClick={() => setEffect({ ...e, sub: "pick" })}
                className="w-full py-3 bg-teal-600 hover:bg-teal-500 rounded-xl font-bold">Kuka hävisi?</button>
            </div>
          );
        }
        return (
          <div className="bg-gray-800 border border-gray-600 rounded-2xl p-4">
            <p className="text-center font-bold mb-3">Kuka hävisi tarinan?</p>
            <div className="space-y-2">
              {players.map((pl, i) => (
                <button key={i} onClick={() => { setToast(`${pl} juo ${e.sips} huikkaa!`); nextTurn(); }}
                  className="w-full py-3 bg-teal-800 hover:bg-teal-700 rounded-xl font-bold">
                  {pl}
                </button>
              ))}
            </div>
          </div>
        );

      case "pausecard":
        return (
          <div className="bg-purple-900/40 border border-purple-700 rounded-2xl p-4 text-center">
            <p className="text-4xl mb-2">⏸</p>
            <p className="text-xl font-bold mb-1">Pausekortti</p>
            <p className="text-sm text-gray-300 mb-5">
              <strong>{currentPlayer}</strong> saa pausekortin. Käytä milloin tahansa taukoon
              ja anna kortti eteenpäin.
            </p>
            <button onClick={() => { setPauseCardHolder(currentPlayerIdx); nextTurn(); }}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold">Jatka</button>
          </div>
        );

      case "queen":
        if (e.queenIdx === null) {
          return (
            <div className="bg-pink-900/40 border border-pink-700 rounded-2xl p-4">
              <p className="text-4xl text-center mb-1">👑</p>
              <p className="text-xl font-bold mb-1 text-center">Huora</p>
              <p className="text-sm text-gray-400 text-center mb-4">Valitse huorasi – hän juo aina kun sinä juot.</p>
              <div className="space-y-2">
                {players.map((pl, i) => i === currentPlayerIdx ? null : (
                  <button key={i} onClick={() => setEffect({ kind: "queen", queenIdx: i })}
                    className="w-full py-3 bg-pink-800 hover:bg-pink-700 rounded-xl font-bold">
                    {pl}
                  </button>
                ))}
              </div>
            </div>
          );
        }
        return (
          <div className="bg-pink-900/40 border border-pink-700 rounded-2xl p-4 text-center">
            <p className="text-4xl mb-2">👑</p>
            <p className="text-xl font-bold mb-1">{players[e.queenIdx]} on nyt huora!</p>
            <p className="text-sm text-gray-400 mb-5">He juovat aina kun {currentPlayer} juo.</p>
            <button onClick={() => {
              setQueens(q => {
                const filtered = q.filter(x => x.masterIdx !== currentPlayerIdx);
                return [...filtered, { masterIdx: currentPlayerIdx, queenIdx: e.queenIdx! }];
              });
              nextTurn();
            }} className="w-full py-3 bg-pink-600 hover:bg-pink-500 rounded-xl font-bold">Jatka</button>
          </div>
        );

      case "king":
        return (
          <div className="bg-yellow-900/40 border border-yellow-600 rounded-2xl p-4 text-center">
            <p className="text-4xl mb-2">👑</p>
            <p className="text-xl font-bold mb-1">Kuningashörppy!</p>
            <p className="text-gray-300 mb-1">Kaikki juovat <strong>{e.sips}</strong> huikkaa!</p>
            <p className="text-sm text-gray-500 mb-5">{players.join(", ")}</p>
            <button onClick={nextTurn} className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 rounded-xl font-bold">Jatka</button>
          </div>
        );
    }
  };

  // ── Render: Setup ──────────────────────────────────────────────────────────
  if (phase === "setup") {
    return (
      <div className="min-h-screen text-white p-4 max-w-md mx-auto pb-8">
        <div className="flex items-center mb-6 pt-2">
          <button onClick={onBack} className="mr-3 text-2xl text-gray-400 hover:text-white">←</button>
          <h1 className="text-3xl font-bold">Hitler</h1>
        </div>

        <h2 className="text-lg font-semibold mb-2">Pelaajat</h2>
        <div className="flex gap-2 mb-3">
          <input
            type="text" value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addPlayer()}
            placeholder="Pelaajan nimi"
            className="flex-1 px-4 py-3 rounded-xl bg-gray-700 text-white placeholder-gray-500 text-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={addPlayer} className="px-5 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-xl">+</button>
        </div>
        <div className="space-y-2 mb-6">
          {setupPlayers.map((pl, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-3 rounded-xl bg-gray-800 border border-gray-700">
              <span className="flex-1 font-medium">{pl}</span>
              <button onClick={() => setSetupPlayers(p => p.filter((_, idx) => idx !== i))}
                className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-300">✕</button>
            </div>
          ))}
        </div>

        <h2 className="text-lg font-semibold mb-2">Paketti</h2>
        <div className="space-y-2 mb-8">
          {PACKAGES.map(pk => (
            <button key={pk.id} onClick={() => setSelectedPkgId(pk.id)}
              className={`w-full px-4 py-3 rounded-xl border-2 text-left font-semibold transition-colors
                ${selectedPkgId === pk.id ? "border-blue-500 bg-blue-900/30 text-white" : "border-gray-700 bg-gray-800 text-gray-300"}`}>
              {pk.name}
            </button>
          ))}
        </div>

        <button onClick={startGame} disabled={setupPlayers.length < 2}
          className="w-full py-4 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed rounded-xl font-bold text-xl transition-colors">
          Aloita peli
        </button>
        {setupPlayers.length < 2 && (
          <p className="text-center text-gray-500 text-sm mt-2">Lisää vähintään 2 pelaajaa</p>
        )}
      </div>
    );
  }

  // ── Render: Playing ────────────────────────────────────────────────────────
  const currentPlayer = players[currentPlayerIdx];
  const cardsLeft = deck.length - cursor;

  return (
    <div className="min-h-screen text-white p-4 max-w-md mx-auto pb-8">

      {/* Toast */}
      {toast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setToast(null)}>
          <div className="bg-gray-800 text-white rounded-2xl px-8 py-8 text-center shadow-2xl max-w-xs mx-4 border border-gray-600">
            <p className="text-2xl font-bold">{toast}</p>
            <p className="text-sm mt-3 opacity-50">Napauta sulkeaksesi</p>
          </div>
        </div>
      )}

      {/* Pause card passer */}
      {pausePickerOpen && pauseCardHolder !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-center mb-4">Anna pausekortti kenelle?</h3>
            <div className="space-y-2">
              {players.map((pl, i) => i !== pauseCardHolder ? (
                <button key={i} onClick={() => usePauseCard(i)}
                  className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-lg">
                  {pl}
                </button>
              ) : null)}
            </div>
            <button onClick={() => setPausePickerOpen(false)} className="mt-3 w-full py-2 bg-gray-700 rounded-xl text-sm text-gray-400">Peruuta</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-3 pt-2">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="text-2xl text-gray-400 hover:text-white">←</button>
          <h1 className="text-xl font-bold">Hitler</h1>
        </div>
        <span className="text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-full">{cardsLeft} korttia</span>
      </div>

      {/* Active rules */}
      {activeRules.length > 0 && (
        <div className="mb-3 p-3 bg-yellow-900/40 border border-yellow-700 rounded-xl">
          <p className="text-xs text-yellow-400 font-bold uppercase tracking-widest mb-2">Säännöt</p>
          <div className="space-y-1">
            {activeRules.map(r => (
              <div key={r.id} className="flex items-center justify-between gap-2">
                <span className="text-sm text-yellow-200 flex-1">{r.text}</span>
                <button onClick={() => setToast(`Sääntö rikottu! Juo ${r.penalty} huikkaa.`)}
                  className="text-xs bg-red-700 hover:bg-red-600 px-2 py-1 rounded-lg flex-shrink-0 whitespace-nowrap">
                  {r.penalty} 🍺
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status bar: QM, queens, pause */}
      {(questionMasterIdx !== null || queens.length > 0 || pauseCardHolder !== null) && (
        <div className="mb-3 p-3 bg-gray-800 border border-gray-700 rounded-xl space-y-2">
          {questionMasterIdx !== null && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-300">🎤 QM: <strong>{players[questionMasterIdx]}</strong></span>
              <button onClick={() => setToast(`Vastasit kysymykseen! Juo ${pkg.defs[9]?.sips ?? 3} huikkaa.`)}
                className="text-xs bg-blue-700 hover:bg-blue-600 px-2 py-1 rounded-lg whitespace-nowrap">
                Vastasi! {pkg.defs[9]?.sips ?? 3} 🍺
              </button>
            </div>
          )}
          {queens.map((q, i) => (
            <div key={i} className="text-sm text-pink-300">
              👑 <strong>{players[q.queenIdx]}</strong> on {players[q.masterIdx]}n huora
            </div>
          ))}
          {pauseCardHolder !== null && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-purple-300">⏸ Pause: <strong>{players[pauseCardHolder]}</strong></span>
              <button onClick={() => setPausePickerOpen(true)}
                className="text-xs bg-purple-700 hover:bg-purple-600 px-2 py-1 rounded-lg">Käytä</button>
            </div>
          )}
        </div>
      )}

      {/* Draw state */}
      {turnState === "draw" && (
        <>
          <div className="bg-yellow-500 text-black rounded-2xl px-4 py-4 mb-4 text-center shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-widest opacity-70">Vuorossa</p>
            <p className="text-3xl font-bold">{currentPlayer}</p>
            <p className="text-xs opacity-50">Pelaaja {currentPlayerIdx + 1}/{players.length}</p>
          </div>
          <button onClick={drawCard}
            className="w-full py-6 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-2xl font-bold text-2xl shadow-lg transition-colors">
            Nosta kortti
          </button>
        </>
      )}

      {/* Effect state */}
      {turnState === "effect" && currentCard && effect && (
        <div className="space-y-4">
          <div className="flex items-center gap-4 bg-gray-800 rounded-2xl p-4">
            <PlayingCard card={currentCard} large />
            <div className="min-w-0">
              <p className="text-xs text-gray-400 mb-1">{currentPlayer} nosti</p>
              <p className="text-xl font-bold">{pkg.defs[currentCard.value]?.name}</p>
              <p className="text-sm text-gray-400 mt-1 leading-snug">{pkg.defs[currentCard.value]?.desc}</p>
            </div>
          </div>
          {renderEffect(effect)}
        </div>
      )}
    </div>
  );
};

export default Hitler;
