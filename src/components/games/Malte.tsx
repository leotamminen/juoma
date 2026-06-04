"use client";

import { useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────
type Suit = "hearts" | "spades" | "clubs" | "diamonds";
type Card = { suit: Suit; value: number; id: string };
type Phase = "setup" | "rounds" | "bussi" | "summary";
type RoundStep = "guessing" | "hinting" | "revealed";
type Settings = {
  sipsPerRound: [number, number, number, number];
  endgameScaling: "default" | "double" | "custom";
  customStart: number;
  extraRounds: boolean;
};
type ToastType = "drink" | "give" | "info";
type Toast = { message: string; type: ToastType } | null;
type BussiCard = { card: Card; row: "ottaa" | "jakaa"; flipped: boolean };
type BussiFlip = { card: Card; rowType: "ottaa" | "jakaa"; sipValue: number } | null;

// ── Constants ──────────────────────────────────────────────────────────────
const SUITS: Suit[] = ["hearts", "spades", "clubs", "diamonds"];
const SUIT_SYMBOLS: Record<Suit, string> = { hearts: "♥", spades: "♠", clubs: "♣", diamonds: "♦" };
const SUIT_LABELS: Record<Suit, string> = { hearts: "Hertta", spades: "Pata", clubs: "Risti", diamonds: "Ruutu" };
const VAL: Record<number, string> = { 1:"A",2:"2",3:"3",4:"4",5:"5",6:"6",7:"7",8:"8",9:"9",10:"10",11:"J",12:"Q",13:"K" };

function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS)
    for (let v = 1; v <= 13; v++)
      deck.push({ suit, value: v, id: `${suit}-${v}` });
  return deck;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isRed(suit: Suit) { return suit === "hearts" || suit === "diamonds"; }

function calcSips(flipIndex: number, scaling: Settings["endgameScaling"], customStart: number): number {
  if (scaling === "double") return Math.pow(2, flipIndex + 1);
  if (scaling === "custom") return customStart + flipIndex * 2;
  return (flipIndex + 1) * 2;
}

// ── PlayingCard ────────────────────────────────────────────────────────────
function PlayingCard({ card, faceDown = false, small = false }: { card: Card; faceDown?: boolean; small?: boolean }) {
  const base = small
    ? "w-9 h-13 rounded text-xs"
    : "w-16 h-24 rounded-lg text-base";
  if (faceDown) {
    return (
      <div className={`${base} border-2 border-gray-400 bg-blue-800 flex items-center justify-center shadow`}>
        <div className="w-4/5 h-4/5 rounded bg-blue-600 border border-blue-400" />
      </div>
    );
  }
  const red = isRed(card.suit);
  return (
    <div className={`${base} border-2 border-gray-300 bg-white shadow flex flex-col justify-between p-1 ${red ? "text-red-500" : "text-gray-900"}`}>
      <span className="font-bold leading-none">{VAL[card.value]}</span>
      <span className={`text-center leading-none ${small ? "text-sm" : "text-2xl"}`}>{SUIT_SYMBOLS[card.suit]}</span>
      <span className="font-bold leading-none self-end rotate-180">{VAL[card.value]}</span>
    </div>
  );
}

// ── Toast ──────────────────────────────────────────────────────────────────
function ToastOverlay({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  if (!toast) return null;
  const bg = toast.type === "drink" ? "bg-red-600" : toast.type === "give" ? "bg-green-600" : "bg-blue-600";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onDismiss}>
      <div className={`${bg} text-white rounded-2xl px-8 py-8 text-center shadow-2xl max-w-xs mx-4`}>
        <p className="text-2xl font-bold">{toast.message}</p>
        <p className="text-sm mt-3 opacity-70">Napauta sulkeaksesi</p>
      </div>
    </div>
  );
}

// ── PlayerPicker ───────────────────────────────────────────────────────────
function PlayerPicker({ players, excludeIndex, sips, onPick }: {
  players: string[]; excludeIndex: number; sips: number; onPick: (i: number) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-gray-800 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
        <h3 className="text-xl font-bold text-center mb-1 text-white">Anna huikat</h3>
        <p className="text-center text-gray-400 mb-4 text-sm">{sips} huikkaa kenelle?</p>
        <div className="space-y-2">
          {players.map((p, i) =>
            i !== excludeIndex ? (
              <button key={i} onClick={() => onPick(i)}
                className="w-full py-4 px-4 bg-green-600 hover:bg-green-500 active:bg-green-700 text-white rounded-xl font-bold text-lg transition-colors">
                {p}
              </button>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}

// ── PlayerHands strip ──────────────────────────────────────────────────────
function HandsStrip({ players, hands, activeIndex }: { players: string[]; hands: Card[][]; activeIndex: number }) {
  return (
    <div className="overflow-x-auto mb-4">
      <div className="flex gap-3 pb-1 min-w-max">
        {players.map((p, pi) => (
          <div key={pi} className={`rounded-xl p-2 border ${pi === activeIndex ? "border-yellow-400 bg-yellow-900/30" : "border-gray-700 bg-gray-800"}`}>
            <p className="text-xs text-center text-gray-400 mb-1 truncate max-w-[80px]">{p}</p>
            <div className="flex gap-1">
              {hands[pi].length === 0
                ? <span className="text-gray-600 text-xs px-1">—</span>
                : hands[pi].map((c, ci) => <PlayingCard key={ci} card={c} small />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Round sub-UIs ──────────────────────────────────────────────────────────
function Round1UI({ hand, currentCard, roundStep, hint, isCorrect, sips, onGuess, onContinue }: {
  hand: Card[]; currentCard: Card | null; roundStep: RoundStep;
  hint: "smaller" | "bigger" | null; isCorrect: boolean | null;
  sips: number; onGuess: (n: number) => void; onContinue: () => void;
}) {
  void hand;
  return (
    <div>
      <p className="text-sm text-gray-400 mb-1">Kierros 1</p>
      <h3 className="text-xl font-bold mb-4">Mikä numero? (1–13)</h3>

      {(roundStep === "guessing" || roundStep === "hinting") && (
        <>
          {hint && (
            <div className={`rounded-xl px-4 py-3 mb-4 text-center font-bold text-lg ${hint === "bigger" ? "bg-orange-700" : "bg-blue-700"}`}>
              {hint === "bigger" ? "Isompi! ↑" : "Pienempi! ↓"}
            </div>
          )}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {Array.from({ length: 13 }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => onGuess(n)}
                className="aspect-square rounded-xl bg-gray-700 hover:bg-gray-600 active:bg-gray-500 font-bold text-sm transition-colors py-2">
                {VAL[n]}
              </button>
            ))}
          </div>
        </>
      )}

      {roundStep === "revealed" && currentCard && (
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <PlayingCard card={currentCard} />
          </div>
          <div className={`rounded-xl px-4 py-3 mb-4 font-bold text-lg ${isCorrect ? "bg-green-700" : "bg-red-700"}`}>
            {isCorrect ? `Oikein! Anna ${sips} huikka${sips !== 1 ? "a" : ""}` : `Väärin! Juo ${sips} huikka${sips !== 1 ? "a" : ""}`}
          </div>
          <button onClick={onContinue}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-lg">
            Jatka
          </button>
        </div>
      )}
    </div>
  );
}

function Round2UI({ hand, currentCard, roundStep, isCorrect, sips, onGuess, onContinue }: {
  hand: Card[]; currentCard: Card | null; roundStep: RoundStep;
  isCorrect: boolean | null; sips: number;
  onGuess: (g: "bigger" | "smaller" | "same") => void; onContinue: () => void;
}) {
  const prev = hand[0];
  return (
    <div>
      <p className="text-sm text-gray-400 mb-1">Kierros 2</p>
      <h3 className="text-xl font-bold mb-4">Isompi vai pienempi?</h3>
      {prev && (
        <div className="flex items-center gap-3 mb-4">
          <PlayingCard card={prev} />
          <span className="text-gray-400 text-2xl">→ ?</span>
        </div>
      )}
      {roundStep === "guessing" && (
        <div className="grid grid-cols-3 gap-3">
          {([["bigger","Isompi ↑","bg-orange-600"],["smaller","Pienempi ↓","bg-blue-600"],["same","Sama =","bg-purple-600"]] as const).map(([g,label,bg]) => (
            <button key={g} onClick={() => onGuess(g as "bigger"|"smaller"|"same")}
              className={`${bg} hover:opacity-90 active:opacity-70 py-4 rounded-xl font-bold text-sm transition-opacity`}>
              {label}
            </button>
          ))}
        </div>
      )}
      {roundStep === "revealed" && currentCard && (
        <div className="text-center">
          <div className="flex justify-center gap-3 mb-4">
            {prev && <PlayingCard card={prev} />}
            <span className="text-gray-400 self-center text-2xl">→</span>
            <PlayingCard card={currentCard} />
          </div>
          <div className={`rounded-xl px-4 py-3 mb-4 font-bold text-lg ${isCorrect ? "bg-green-700" : "bg-red-700"}`}>
            {isCorrect ? `Oikein! Anna ${sips} huikka${sips !== 1 ? "a" : ""}` : `Väärin! Juo ${sips} huikka${sips !== 1 ? "a" : ""}`}
          </div>
          <button onClick={onContinue} className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-lg">Jatka</button>
        </div>
      )}
    </div>
  );
}

function Round3UI({ hand, currentCard, roundStep, isCorrect, sips, onGuess, onContinue }: {
  hand: Card[]; currentCard: Card | null; roundStep: RoundStep;
  isCorrect: boolean | null; sips: number;
  onGuess: (g: "valiin" | "ulos") => void; onContinue: () => void;
}) {
  const [c1, c2] = hand;
  const low = c1 && c2 ? Math.min(c1.value, c2.value) : null;
  const high = c1 && c2 ? Math.max(c1.value, c2.value) : null;
  return (
    <div>
      <p className="text-sm text-gray-400 mb-1">Kierros 3</p>
      <h3 className="text-xl font-bold mb-4">Väliin vai ulos?</h3>
      {c1 && c2 && (
        <div className="flex items-center gap-2 mb-4">
          <PlayingCard card={c1} small />
          <span className="text-gray-500 text-xs">({VAL[low!]}–{VAL[high!]})</span>
          <PlayingCard card={c2} small />
        </div>
      )}
      {roundStep === "guessing" && (
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => onGuess("valiin")}
            className="bg-green-600 hover:bg-green-500 py-5 rounded-xl font-bold text-lg">
            Väliin
          </button>
          <button onClick={() => onGuess("ulos")}
            className="bg-orange-600 hover:bg-orange-500 py-5 rounded-xl font-bold text-lg">
            Ulos
          </button>
        </div>
      )}
      {roundStep === "revealed" && currentCard && (
        <div className="text-center">
          <div className="flex justify-center gap-2 mb-4">
            {c1 && <PlayingCard card={c1} small />}
            <PlayingCard card={currentCard} />
            {c2 && <PlayingCard card={c2} small />}
          </div>
          <div className={`rounded-xl px-4 py-3 mb-4 font-bold text-lg ${isCorrect ? "bg-green-700" : "bg-red-700"}`}>
            {isCorrect ? `Oikein! Anna ${sips} huikka${sips !== 1 ? "a" : ""}` : `Väärin! Juo ${sips} huikka${sips !== 1 ? "a" : ""}`}
          </div>
          <button onClick={onContinue} className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-lg">Jatka</button>
        </div>
      )}
    </div>
  );
}

function Round4UI({ hand, currentCard, roundStep, isCorrect, sips, onGuess, onContinue }: {
  hand: Card[]; currentCard: Card | null; roundStep: RoundStep;
  isCorrect: boolean | null; sips: number;
  onGuess: (s: Suit) => void; onContinue: () => void;
}) {
  return (
    <div>
      <p className="text-sm text-gray-400 mb-1">Kierros 4</p>
      <h3 className="text-xl font-bold mb-4">Mikä maa?</h3>
      {hand.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {hand.map((c, i) => <PlayingCard key={i} card={c} small />)}
        </div>
      )}
      {roundStep === "guessing" && (
        <div className="grid grid-cols-2 gap-3">
          {SUITS.map(s => (
            <button key={s} onClick={() => onGuess(s)}
              className={`py-4 rounded-xl font-bold text-lg ${isRed(s) ? "bg-red-700 hover:bg-red-600" : "bg-gray-700 hover:bg-gray-600"}`}>
              {SUIT_SYMBOLS[s]} {SUIT_LABELS[s]}
            </button>
          ))}
        </div>
      )}
      {roundStep === "revealed" && currentCard && (
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <PlayingCard card={currentCard} />
          </div>
          <div className={`rounded-xl px-4 py-3 mb-4 font-bold text-lg ${isCorrect ? "bg-green-700" : "bg-red-700"}`}>
            {isCorrect ? `Oikein! Anna ${sips} huikka${sips !== 1 ? "a" : ""}` : `Väärin! Juo ${sips} huikka${sips !== 1 ? "a" : ""}`}
          </div>
          <button onClick={onContinue} className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-lg">Jatka</button>
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
const Malte = ({ players: initialPlayers, onBack }: { players: string[]; onBack: () => void }) => {

  // ── Setup state ──
  const [setupPlayers, setSetupPlayers] = useState<string[]>(initialPlayers.length >= 2 ? initialPlayers : []);
  const [newName, setNewName] = useState("");
  const [starterIdx, setStarterIdx] = useState<number | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    sipsPerRound: [1, 2, 3, 4],
    endgameScaling: "default",
    customStart: 2,
    extraRounds: true,
  });
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  // ── Game state ──
  const [phase, setPhase] = useState<Phase>("setup");
  const [players, setPlayers] = useState<string[]>([]);
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHands, setPlayerHands] = useState<Card[][]>([]);
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [deckCursor, setDeckCursor] = useState(0);

  // ── Round step state ──
  const [roundStep, setRoundStep] = useState<RoundStep>("guessing");
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [round1Hint, setRound1Hint] = useState<"smaller" | "bigger" | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // ── Give-sips state ──
  const [showPicker, setShowPicker] = useState(false);

  // ── Bussi state ──
  const [bussiCards, setBussiCards] = useState<BussiCard[]>([]);
  const [bussiFlipIdx, setBussiFlipIdx] = useState(0);
  const [bussiCurrentFlip, setBussiCurrentFlip] = useState<BussiFlip>(null);
  const [bussiDone, setBussiDone] = useState(false);

  // ── Toast ──
  const [toast, setToast] = useState<Toast>(null);

  const showToast = (message: string, type: ToastType) => setToast({ message, type });

  // ── Setup actions ──
  const addSetupPlayer = () => {
    if (!newName.trim()) return;
    setSetupPlayers(p => [...p, newName.trim()]);
    setNewName("");
    setStarterIdx(null);
  };

  const removeSetupPlayer = (i: number) => {
    setSetupPlayers(p => p.filter((_, idx) => idx !== i));
    setStarterIdx(s => (s === i ? null : s !== null && s > i ? s - 1 : s));
  };

  const movePlayer = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= setupPlayers.length) return;
    const next = [...setupPlayers];
    [next[i], next[j]] = [next[j], next[i]];
    setSetupPlayers(next);
    setStarterIdx(s => s === i ? j : s === j ? i : s);
  };

  const handleDragStart = (i: number) => setDragIdx(i);
  const handleDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === i) return;
    const next = [...setupPlayers];
    const [item] = next.splice(dragIdx, 1);
    next.splice(i, 0, item);
    setSetupPlayers(next);
    setStarterIdx(s => s === dragIdx ? i : s === i ? dragIdx : s);
    setDragIdx(i);
  };
  const handleDragEnd = () => setDragIdx(null);

  // ── Start game ──
  const startGame = () => {
    const ordered = starterIdx !== null
      ? [...setupPlayers.slice(starterIdx), ...setupPlayers.slice(0, starterIdx)]
      : [...setupPlayers];
    const shuffled = shuffle(createDeck());
    setPlayers(ordered);
    setDeck(shuffled);
    setPlayerHands(ordered.map(() => []));
    setCurrentPlayerIdx(0);
    setCurrentRound(1);
    setDeckCursor(0);
    setRoundStep("guessing");
    setCurrentCard(null);
    setRound1Hint(null);
    setIsCorrect(null);
    setPhase("rounds");
  };

  // ── Deal a card (returns it synchronously for immediate use in handlers) ──
  const dealCard = (cursor: number, d: Card[]): Card => {
    const card = d[cursor];
    setCurrentCard(card);
    setDeckCursor(cursor + 1);
    return card;
  };

  // ── Advance to next player / round / bussi ──
  const advanceTurn = (nextCursor: number, newHands: Card[][]) => {
    const nextPlayer = (currentPlayerIdx + 1) % players.length;
    if (nextPlayer === 0 && currentRound === 4) {
      initBussi(nextCursor, newHands);
      return;
    }
    const nextRound = nextPlayer === 0 ? currentRound + 1 : currentRound;
    setCurrentRound(nextRound);
    setCurrentPlayerIdx(nextPlayer);
    setCurrentCard(null);
    setRoundStep("guessing");
    setRound1Hint(null);
    setIsCorrect(null);
    setDeckCursor(nextCursor);
    setPlayerHands(newHands);
  };

  const finishTurn = (card: Card, cursor: number) => {
    const newHands = playerHands.map((h, i) =>
      i === currentPlayerIdx ? [...h, card] : h
    );
    advanceTurn(cursor, newHands);
  };

  // ── After reveal: drink or pick target ──
  const handleRevealContinue = () => {
    if (!currentCard) return;
    if (isCorrect) {
      setShowPicker(true);
    } else {
      const sips = settings.sipsPerRound[currentRound - 1];
      showToast(`${players[currentPlayerIdx]} juo ${sips} huikkaa!`, "drink");
      finishTurn(currentCard, deckCursor);
    }
  };

  const handleGiveSips = (targetIdx: number) => {
    if (!currentCard) return;
    const sips = settings.sipsPerRound[currentRound - 1];
    setShowPicker(false);
    showToast(`${players[targetIdx]} juo ${sips} huikkaa!`, "give");
    finishTurn(currentCard, deckCursor);
  };

  // ── Round 1 ──
  const handleRound1Guess = (guess: number) => {
    if (!currentCard) {
      const card = dealCard(deckCursor, deck);
      if (guess === card.value) {
        setIsCorrect(true);
        setRoundStep("revealed");
      } else {
        setIsCorrect(false);
        setRound1Hint(guess < card.value ? "bigger" : "smaller");
        setRoundStep("hinting");
      }
    } else {
      // Second guess — correct or not, turn ends
      setIsCorrect(guess === currentCard.value);
      setRoundStep("revealed");
    }
  };

  // ── Round 2 ──
  const handleRound2Guess = (guess: "bigger" | "smaller" | "same") => {
    const card = dealCard(deckCursor, deck);
    const prev = playerHands[currentPlayerIdx][0];
    let correct = false;
    if (guess === "bigger") correct = card.value > prev.value;
    else if (guess === "smaller") correct = card.value < prev.value;
    else correct = card.value === prev.value;
    setIsCorrect(correct);
    setRoundStep("revealed");
  };

  // ── Round 3 ──
  const handleRound3Guess = (guess: "valiin" | "ulos") => {
    const card = dealCard(deckCursor, deck);
    const [c1, c2] = playerHands[currentPlayerIdx];
    const low = Math.min(c1.value, c2.value);
    const high = Math.max(c1.value, c2.value);
    const inside = card.value > low && card.value < high;
    setIsCorrect(guess === "valiin" ? inside : !inside);
    setRoundStep("revealed");
  };

  // ── Round 4 ──
  const handleRound4Guess = (guess: Suit) => {
    const card = dealCard(deckCursor, deck);
    setIsCorrect(card.suit === guess);
    setRoundStep("revealed");
  };

  // ── Bussi init ──
  const initBussi = (cursor: number, hands: Card[][]) => {
    const remaining = shuffle(deck.slice(cursor));
    const half = Math.floor(remaining.length / 2);
    const cards: BussiCard[] = [
      ...remaining.slice(0, half).map(c => ({ card: c, row: "ottaa" as const, flipped: false })),
      ...remaining.slice(half, half * 2).map(c => ({ card: c, row: "jakaa" as const, flipped: false })),
    ];
    setBussiCards(shuffle(cards));
    setBussiFlipIdx(0);
    setBussiCurrentFlip(null);
    setBussiDone(false);
    setPlayerHands(hands);
    setPhase("bussi");
  };

  // ── Bussi flip ──
  const flipBussiCard = () => {
    if (bussiFlipIdx >= bussiCards.length) return;
    const { card, row } = bussiCards[bussiFlipIdx];
    const sipValue = calcSips(bussiFlipIdx, settings.endgameScaling, settings.customStart);
    const updated = bussiCards.map((c, i) => i === bussiFlipIdx ? { ...c, flipped: true } : c);
    setBussiCards(updated);
    setBussiCurrentFlip({ card, rowType: row, sipValue });
    const next = bussiFlipIdx + 1;
    setBussiFlipIdx(next);
    if (next >= bussiCards.length) setBussiDone(true);
  };

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: Setup
  // ══════════════════════════════════════════════════════════════════════════
  if (phase === "setup") {
    return (
      <div className="min-h-screen text-white p-4 max-w-md mx-auto pb-8">
        <div className="flex items-center mb-6 pt-2">
          <button onClick={onBack} className="mr-3 text-2xl text-gray-400 hover:text-white">←</button>
          <h1 className="text-3xl font-bold">Malte</h1>
        </div>

        {/* Add player */}
        <h2 className="text-lg font-semibold mb-2">Lisää pelaajia</h2>
        <div className="flex gap-2 mb-3">
          <input
            type="text" value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addSetupPlayer()}
            placeholder="Pelaajan nimi"
            className="flex-1 px-4 py-3 rounded-xl bg-gray-700 text-white placeholder-gray-500 text-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={addSetupPlayer}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-xl">
            +
          </button>
        </div>

        {/* Player list */}
        <div className="space-y-2 mb-4">
          {setupPlayers.map((p, i) => (
            <div key={i} draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={e => handleDragOver(e, i)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-2 px-3 py-3 rounded-xl border-2 transition-all cursor-grab active:cursor-grabbing
                ${starterIdx === i ? "border-yellow-400 bg-yellow-900/30" : "border-gray-700 bg-gray-800"}
                ${dragIdx === i ? "opacity-40 scale-95" : ""}`}>
              <span className="text-gray-500 text-lg select-none">⠿</span>
              <span className="flex-1 font-medium text-base">
                {starterIdx === i && <span className="text-yellow-400 mr-1">★</span>}
                {p}
              </span>
              <button onClick={() => movePlayer(i, -1)} disabled={i === 0}
                className="w-8 h-8 flex items-center justify-center text-gray-400 disabled:opacity-20 hover:text-white">↑</button>
              <button onClick={() => movePlayer(i, 1)} disabled={i === setupPlayers.length - 1}
                className="w-8 h-8 flex items-center justify-center text-gray-400 disabled:opacity-20 hover:text-white">↓</button>
              <button onClick={() => removeSetupPlayer(i)}
                className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-300">✕</button>
            </div>
          ))}
        </div>

        {/* Randomize starter */}
        {setupPlayers.length >= 2 && (
          <button onClick={() => setStarterIdx(Math.floor(Math.random() * setupPlayers.length))}
            className="w-full py-3 mb-4 bg-purple-700 hover:bg-purple-600 rounded-xl font-bold text-lg">
            🎲 Arvo aloittaja
          </button>
        )}

        {/* Settings */}
        <div className="mb-6">
          <button onClick={() => setSettingsOpen(o => !o)}
            className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-semibold flex justify-between items-center">
            <span>⚙️ Asetukset</span>
            <span className="text-gray-400">{settingsOpen ? "▲" : "▼"}</span>
          </button>
          {settingsOpen && (
            <div className="mt-2 p-4 bg-gray-800 rounded-xl space-y-5">
              {/* Sips per round */}
              <div>
                <p className="text-sm text-gray-400 mb-2">Huikat per kierros</p>
                <div className="grid grid-cols-4 gap-2">
                  {([0,1,2,3] as const).map(i => (
                    <div key={i} className="text-center">
                      <label className="text-xs text-gray-500 block mb-1">Kierros {i+1}</label>
                      <input type="number" min={1} max={20} value={settings.sipsPerRound[i]}
                        onChange={e => {
                          const next = [...settings.sipsPerRound] as [number,number,number,number];
                          next[i] = Math.max(1, parseInt(e.target.value) || 1);
                          setSettings(s => ({ ...s, sipsPerRound: next }));
                        }}
                        className="w-full px-2 py-2 bg-gray-700 rounded-lg text-center font-bold" />
                    </div>
                  ))}
                </div>
              </div>
              {/* Bussi scaling */}
              <div>
                <p className="text-sm text-gray-400 mb-2">Bussi-skaala</p>
                <div className="flex gap-2 flex-wrap">
                  {(["default","double","custom"] as const).map(v => (
                    <button key={v} onClick={() => setSettings(s => ({ ...s, endgameScaling: v }))}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${settings.endgameScaling === v ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}>
                      {v === "default" ? "+2/kortti" : v === "double" ? "Tuplaa" : "Mukautettu"}
                    </button>
                  ))}
                </div>
                {settings.endgameScaling === "custom" && (
                  <div className="mt-2 flex items-center gap-2">
                    <label className="text-sm text-gray-400">Lähtöarvo:</label>
                    <input type="number" min={1} value={settings.customStart}
                      onChange={e => setSettings(s => ({ ...s, customStart: Math.max(1, parseInt(e.target.value) || 2) }))}
                      className="w-20 px-2 py-1 bg-gray-700 rounded-lg text-center" />
                  </div>
                )}
              </div>
              {/* Extra rounds toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Lisäkierrokset (pienille ryhmille)</span>
                <button onClick={() => setSettings(s => ({ ...s, extraRounds: !s.extraRounds }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${settings.extraRounds ? "bg-green-500" : "bg-gray-600"}`}>
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${settings.extraRounds ? "left-6" : "left-0.5"}`} />
                </button>
              </div>
            </div>
          )}
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

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: Rounds 1–4
  // ══════════════════════════════════════════════════════════════════════════
  if (phase === "rounds") {
    const currentPlayer = players[currentPlayerIdx];
    const hand = playerHands[currentPlayerIdx] ?? [];
    const sips = settings.sipsPerRound[currentRound - 1];

    return (
      <div className="min-h-screen text-white p-4 max-w-md mx-auto pb-8">
        <ToastOverlay toast={toast} onDismiss={() => setToast(null)} />
        {showPicker && (
          <PlayerPicker players={players} excludeIndex={currentPlayerIdx} sips={sips} onPick={handleGiveSips} />
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-3 pt-2">
          <h1 className="text-xl font-bold">Malte</h1>
          <span className="text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-full">Kierros {currentRound}/4</span>
        </div>

        {/* Active player banner */}
        <div className="bg-yellow-500 text-black rounded-2xl px-4 py-3 mb-4 text-center shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-widest opacity-70">Vuorossa</p>
          <p className="text-2xl font-bold">{currentPlayer}</p>
          <p className="text-xs opacity-60">Pelaaja {currentPlayerIdx + 1}/{players.length}</p>
        </div>

        {/* All players' hands */}
        <HandsStrip players={players} hands={playerHands} activeIndex={currentPlayerIdx} />

        {/* Round UI */}
        <div className="bg-gray-800 rounded-2xl p-4">
          {currentRound === 1 && (
            <Round1UI hand={hand} currentCard={currentCard} roundStep={roundStep}
              hint={round1Hint} isCorrect={isCorrect} sips={sips}
              onGuess={handleRound1Guess} onContinue={handleRevealContinue} />
          )}
          {currentRound === 2 && (
            <Round2UI hand={hand} currentCard={currentCard} roundStep={roundStep}
              isCorrect={isCorrect} sips={sips}
              onGuess={handleRound2Guess} onContinue={handleRevealContinue} />
          )}
          {currentRound === 3 && (
            <Round3UI hand={hand} currentCard={currentCard} roundStep={roundStep}
              isCorrect={isCorrect} sips={sips}
              onGuess={handleRound3Guess} onContinue={handleRevealContinue} />
          )}
          {currentRound === 4 && (
            <Round4UI hand={hand} currentCard={currentCard} roundStep={roundStep}
              isCorrect={isCorrect} sips={sips}
              onGuess={handleRound4Guess} onContinue={handleRevealContinue} />
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: Bussi
  // ══════════════════════════════════════════════════════════════════════════
  if (phase === "bussi") {
    const ottaaRow = bussiCards.filter(c => c.row === "ottaa");
    const jakaaRow = bussiCards.filter(c => c.row === "jakaa");
    const nextSipValue = calcSips(bussiFlipIdx, settings.endgameScaling, settings.customStart);

    return (
      <div className="min-h-screen text-white p-4 max-w-md mx-auto pb-8">
        <ToastOverlay toast={toast} onDismiss={() => setToast(null)} />

        <h1 className="text-3xl font-bold text-center mb-1 pt-2">🚌 Bussi!</h1>
        {!bussiDone && (
          <p className="text-center text-yellow-400 font-semibold mb-4">
            Seuraava: {nextSipValue} huikkaa
          </p>
        )}
        {bussiDone && <p className="text-center text-green-400 font-semibold mb-4">Peli ohi!</p>}

        {/* Ottaa row */}
        <div className="mb-5">
          <p className="text-red-400 font-bold text-base mb-2">🍺 Ottaa</p>
          <div className="flex flex-wrap gap-2">
            {ottaaRow.map((bc, i) => (
              <PlayingCard key={i} card={bc.card} faceDown={!bc.flipped} small />
            ))}
          </div>
        </div>

        {/* Jakaa row */}
        <div className="mb-5">
          <p className="text-green-400 font-bold text-base mb-2">🎁 Jakaa</p>
          <div className="flex flex-wrap gap-2">
            {jakaaRow.map((bc, i) => (
              <PlayingCard key={i} card={bc.card} faceDown={!bc.flipped} small />
            ))}
          </div>
        </div>

        {/* Current flip result */}
        {bussiCurrentFlip && (
          <div className={`rounded-2xl p-4 mb-5 border-2 ${bussiCurrentFlip.rowType === "ottaa" ? "border-red-500 bg-red-900/30" : "border-green-500 bg-green-900/30"}`}>
            <p className="font-bold text-base mb-3">
              {bussiCurrentFlip.rowType === "ottaa" ? "🍺 Ottaa-rivi — " : "🎁 Jakaa-rivi — "}
              {bussiCurrentFlip.sipValue} huikkaa
            </p>
            <div className="flex gap-3 items-start">
              <div className="flex-shrink-0">
                <PlayingCard card={bussiCurrentFlip.card} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-2">
                  {VAL[bussiCurrentFlip.card.value]} kädessä:
                </p>
                {players.map((p, pi) => {
                  const match = playerHands[pi].some(c => c.value === bussiCurrentFlip.card.value);
                  if (!match) return null;
                  return (
                    <div key={pi} className={`px-3 py-2 rounded-lg mb-1 text-sm font-bold ${bussiCurrentFlip.rowType === "ottaa" ? "bg-red-600" : "bg-green-600"}`}>
                      {p} {bussiCurrentFlip.rowType === "ottaa"
                        ? `juo ${bussiCurrentFlip.sipValue} huikkaa!`
                        : `jakaa ${bussiCurrentFlip.sipValue} huikkaa!`}
                    </div>
                  );
                })}
                {!players.some((_, pi) => playerHands[pi].some(c => c.value === bussiCurrentFlip.card.value)) && (
                  <p className="text-gray-500 text-sm italic">Ei osumia</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Player hands */}
        <HandsStrip players={players} hands={playerHands} activeIndex={-1} />

        {/* Action button */}
        {bussiDone ? (
          <button onClick={() => setPhase("summary")}
            className="w-full py-4 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-xl">
            Näytä yhteenveto 🎉
          </button>
        ) : (
          <button onClick={flipBussiCard}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-xl font-bold text-xl transition-colors">
            Käännä kortti ({bussiFlipIdx + 1}/{bussiCards.length})
          </button>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: Summary
  // ══════════════════════════════════════════════════════════════════════════
  if (phase === "summary") {
    return (
      <div className="min-h-screen text-white p-4 max-w-md mx-auto pb-8">
        <h1 className="text-3xl font-bold text-center mb-1 pt-4">🎉 Peli ohi!</h1>
        <p className="text-center text-gray-400 mb-8">Hyvät suoritukset kaikilta!</p>

        <div className="space-y-3 mb-8">
          {players.map((p, pi) => (
            <div key={pi} className="bg-gray-800 rounded-2xl p-4">
              <p className="font-bold text-lg mb-2">{p}</p>
              <div className="flex gap-2 flex-wrap">
                {playerHands[pi].map((c, ci) => (
                  <PlayingCard key={ci} card={c} small />
                ))}
              </div>
            </div>
          ))}
        </div>

        <button onClick={onBack}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-xl">
          Takaisin pelivalintaan
        </button>
      </div>
    );
  }

  return null;
};

export default Malte;
