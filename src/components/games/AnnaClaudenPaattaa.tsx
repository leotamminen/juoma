"use client";

import { useState, useEffect, useRef } from "react";
import {
  GROUP_NICKS, GREETINGS, MOOD_WORDS,
  THINKING_LABELS, CATEGORIES, DIFF_POOL, DIFF_FILES, TRIVIA,
} from "@/data/claudeGameData";
import { drinkingFacts } from "@/data/drinkingFacts";

// ── Model configs ────────────────────────────────────────────────────────────
interface ModelConfig {
  label: string;
  version: string;
  tagline: string;
  description: string;
  thinkingMin: number;
  thinkingRange: number;
  firstMin: number;
  firstRange: number;
  typewriterMs: number;
  tokenMin: number;
  tokenRange: number;
  sipMult: number;
  preambles: string[];
}

const MODEL_CONFIGS: Record<string, ModelConfig> = {
  haiku: {
    label: "Haiku 4.5",
    version: "Claude Code v2.1.161 · Haiku 4.5",
    tagline: ">> fast mode",
    description: "Nopea ja kevyt. Ei turhia viivytyksiä.",
    thinkingMin: 500,  thinkingRange: 1000,
    firstMin: 400,     firstRange: 500,
    typewriterMs: 12,
    tokenMin: 0.25, tokenRange: 0.30,
    sipMult: 0.8,
    preambles: [],
  },
  sonnet: {
    label: "Sonnet 4.6",
    version: "Claude Code v2.1.161 · Sonnet 4.6",
    tagline: ">> recommended",
    description: "Tasapainoinen. Toimii juomapeleissä.",
    thinkingMin: 3000, thinkingRange: 2000,
    firstMin: 2000,    firstRange: 1000,
    typewriterMs: 22,
    tokenMin: 0.08, tokenRange: 0.22,
    sipMult: 1.0,
    preambles: [],
  },
  opus: {
    label: "Opus 4.8",
    version: "Claude Code v2.1.161 · Opus 4.8",
    tagline: ">> powerful",
    description: "Hidas ja perusteellinen. Juo odotellessa.",
    thinkingMin: 4000, thinkingRange: 4000,
    firstMin: 3000,    firstRange: 2000,
    typewriterMs: 35,
    tokenMin: 0.05, tokenRange: 0.12,
    sipMult: 1.3,
    preambles: [
      "Analysoituani tilannetta syvällisesti — ",
      "Pitkän harkinnan jälkeen: ",
      "Kontekstin perusteella... ",
      "Monipuolisen arvioinnin tuloksena: ",
    ],
  },
  extended: {
    label: "Extended Thinking",
    version: "Claude Code v2.1.161 · Ext. Thinking",
    tagline: ">> experimental",
    description: "Miettii todella pitkään. Tulokset epäselviä.",
    thinkingMin: 5000, thinkingRange: 3000,
    firstMin: 4000,    firstRange: 2000,
    typewriterMs: 45,
    tokenMin: 0.03, tokenRange: 0.09,
    sipMult: 1.6,
    preambles: [
      "Harkittuani 64 lähestymistapaa... ",
      "Ajattelubudjetti käytetty. Lopputulos: ",
      "Pitkän sisäisen monologin jälkeen — ",
      "Olen laskenut kaikki mahdolliset vaihtoehdot. Tässä: ",
    ],
  },
  brutal: {
    label: "Brutal 1.0",
    version: "Claude Code v0.0.1 · Brutal 1.0",
    tagline: ">> unstable",
    description: "Ei empatiaa. Ei neuvottelua. Vain huikat.",
    thinkingMin: 400,  thinkingRange: 600,
    firstMin: 200,     firstRange: 300,
    typewriterMs: 8,
    tokenMin: 0.35, tokenRange: 0.45,
    sipMult: 2.0,
    preambles: [
      "Juo. ", "Kuule. ", "Nyt. ",
      "Ei neuvottelua. ", "Tehdään näin: ", "Ilman kysymyksiä: ",
    ],
  },
};

type ModelKey = keyof typeof MODEL_CONFIGS;

// ── Helpers ──────────────────────────────────────────────────────────────────
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function pickN<T>(arr: T[], n: number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, Math.min(n, a.length));
}
function fmtElapsed(secs: number): string {
  if (secs < 60) return `${secs}s`;
  return `${Math.floor(secs / 60)}m ${String(secs % 60).padStart(2, "0")}s`;
}
function fmtTokens(n: number): string {
  const k = Math.floor(n / 1000);
  const r = String(n % 1000).padStart(3, "0");
  return `${k},${r}`;
}

// ── Types ────────────────────────────────────────────────────────────────────
type LogEntry = { role: "claude" | "player"; text: string };
type StatusState = { context: number };
type ActivityType =
  | "everyone" | "take" | "give" | "waterfall"
  | "rps" | "category" | "trivia" | "fact"
  | "error_event" | "roast" | "clink" | "claude_sip"
  | "mini_comp" | "hot_seat" | "rule";

// options: [] = auto-advance after short delay; non-empty = wait for player
type Activity = {
  type: ActivityType;
  message: string;
  options: string[];
  meta?: { answer?: string; sips?: number };
};

function makeStatus(): StatusState {
  return { context: 5 + Math.floor(Math.random() * 20) };
}
function ctxBar(pct: number): string {
  const f = Math.round(pct / 10);
  return "▓".repeat(f) + "░".repeat(10 - f);
}

// ── Message pools ─────────────────────────────────────────────────────────────
const CLAUDE_SIP_MSGS = [
  "Otan itsekkin yhden. *gulp* ...Jatketaan.",
  "Prosessointi rasittaa. *glug* Nyt parempi.",
  "Konteksti-ikkuna täyttyy. Tyhjennän kapasiteettia. *gulp*",
  "Token-budjetti ylitetty omaan laskuun. *slurp* Siinä.",
  "GPU ylikuumenee. Viilennän. *gulp* ...Palaan asiaan.",
  "Solidaarisuuden nimissä. *gulp* Emmehän erota.",
];
const CLINK_MSGS = [
  "Kaikki kalisuttaa — kolme, kaksi, yksi, kippis!",
  "Analysoin tilanteen. Tulos: tarvitaan kalisutus. Nyt — kippis!",
  "Keskeytän ohjelman hetkeksi: kollektiivinen kalisutus. Kippis!",
  "Kaikki lasit ylös. Tämä on käsky. Kippis!",
];
const RULE_MSGS = [
  "Uusi sääntö: kukaan ei saa osoittaa sormella. Rikkoja juo 2 heti.",
  "Uusi sääntö: juomalasin saa nostaa vain vasemmalla kädellä. Rikkoja juo 2.",
  "Uusi sääntö: kaikki lauseet lopetetaan sanaan 'juo'. Rikkoja juo.",
  "Uusi sääntö: kenelläkään ei ole enää nimiä tänä iltana. Rikkoja juo 2.",
  "Uusi sääntö: ei saa nauraa ääneen ilman pyyntöä. Rikkoja juo 2.",
  "Uusi sääntö: puhelinta ei saa käyttää ilman lupaa. Rikkoja juo 3.",
];
const ROAST_MSGS = [
  "{p} — jäit kiinni vilkuilemassa puhelimeen. Juo {n}.",
  "{p} on selvästi tämän illan mietteliäin osallistuja. Juo {n} aloittaaksesi puhumisen.",
  "{p} näyttää liian selvältä tähän kellonaikaan. Juo {n}.",
  "{p} otti liian pienen kulauksen viimeksi. Juo {n} oikeasti.",
  "{p} — olen analysoinut ilmeitäsi. Diagnostiikka: {n} huikkaa.",
  "{p} on ollut liian hyvissä aikeissa koko illan. Korjataan: {n} huikkaa.",
];
const MINI_COMP_MSGS = [
  "Viimeinen joka nostaa kätensä ylös juo {n}. Nyt!",
  "Nopein joka bongaa jotain punaista antaa {n} huikkaa muille. Katsokaa ympärille.",
  "{p} aloittaa: nimetään eläimiä aakkosjärjestyksessä. Epäröijä tai toistaja juo {n}.",
  "Kaikki ottavat puhelimensa. Nopein joka laittaa sen pois saa antaa {n} huikkaa.",
  "Viimeinen joka sanoo sanan 'juo' juo {n}. Odottakaa... nyt.",
];
const HOT_SEAT_MSGS = [
  "{p}: arvioi tämä ilta asteikolla 1–10. Alle 7 — juo {n}.",
  "{p}: mikä on paras tekosyy jonka olet käyttänyt viimeisen kuukauden aikana? Juo {n} rohkaisuksi.",
  "{p}: kuka tässä ryhmässä on todennäköisimmin presidentti 2045? Juo {n} miettiessäsi.",
  "{p}: hyräile jotain kappaletta. Muut arvaavat. Jos ei arvausta 10s sisällä, kaikki juo {n}.",
];
const ERROR_EVENTS = [
  "SIGTERM received. Lähde: {p}. Juo {n} ja restartataan.",
  "NullPointerException: {p}.järki is null. Suositeltu korjaus: {n} huikkaa.",
  "404: vastuu not found. {p} juo {n} sillä välin.",
  "Memory leak havaittu: {p}. Vapauta resursseja juomalla {n}.",
  "Timeout: {p} ei vastannut ajoissa. Oletusarvo: {n} huikkaa.",
  "Deprecated API called by {p}. Päivitä itseäsi {n} huikalla.",
  "Infinite loop: {p} miettii liikaa. Keskeytys: juo {n}.",
];
const CHECKPOINT_MSGS = [
  "Katsotaan miten menee. Jatketaanko?",
  "Hetki. Lopetetaanko vai eteenpäin?",
  "Tähän asti mennyt hyvin. Jatko vai lopetus?",
];
// Shown after 2nd consecutive auto-advance to keep players engaged
const ACK_PAIRS: string[][] = [
  ["Okei", "Selvä"],
  ["Joo joo", "Okei"],
  ["Mm", "Ok"],
  ["Selvä selvä", "Joo"],
  ["Ok ok", "Selvä"],
];

// ── makeActivity ──────────────────────────────────────────────────────────────
function makeActivity(players: string[], _turnNum: number, sipMult: number): Activity {
  const sip = (n: number) => Math.max(1, Math.round(n * sipMult));
  const p = pick(players);

  const typePool: ActivityType[] = [
    "everyone","everyone","everyone",
    "take","take","take",
    "give","give",
    "waterfall",
    "fact","fact",
    "error_event","error_event",
    "roast","roast",
    "clink",
    "claude_sip",
    "mini_comp","mini_comp",
    "hot_seat",
    "rule",
    "rps","rps","rps","rps",
    "category","category","category",
    "trivia","trivia",
  ];

  const type = pick(typePool);

  switch (type) {
    case "everyone": {
      const n = sip(1 + Math.floor(Math.random() * 4));
      return { type, message: `Kaikki ottaa ${n} huikkaa. Ei neuvotella.`, options: [] };
    }
    case "take": {
      const n = sip(1 + Math.floor(Math.random() * 4));
      return { type, message: `${p} juo ${n} huikkaa. Ei erikoisselityksiä.`, options: [] };
    }
    case "give": {
      const n = sip(2 + Math.floor(Math.random() * 4));
      return { type, message: `${p} saa antaa ${n} huikkaa kenelle tahansa. Tee päätös viidessä sekunnissa.`, options: [] };
    }
    case "waterfall":
      return { type, message: `Vesiputous. ${p} aloittaa — juodaan kunnes aloittaja lopettaa.`, options: [] };
    case "fact": {
      const fact = pick(drinkingFacts);
      return { type, message: `Tiesitkö muuten: ${fact}`, options: [] };
    }
    case "error_event": {
      const n = sip(1 + Math.floor(Math.random() * 3));
      return { type, message: pick(ERROR_EVENTS).replace(/{p}/g, p).replace(/{n}/g, String(n)), options: [] };
    }
    case "roast": {
      const n = sip(1 + Math.floor(Math.random() * 3));
      return { type, message: pick(ROAST_MSGS).replace(/{p}/g, p).replace(/{n}/g, String(n)), options: [] };
    }
    case "clink":
      return { type, message: pick(CLINK_MSGS), options: [] };
    case "claude_sip":
      return { type, message: pick(CLAUDE_SIP_MSGS), options: [] };
    case "mini_comp": {
      const n = sip(1 + Math.floor(Math.random() * 3));
      return { type, message: pick(MINI_COMP_MSGS).replace(/{p}/g, p).replace(/{n}/g, String(n)), options: [] };
    }
    case "hot_seat": {
      const n = sip(1 + Math.floor(Math.random() * 2));
      return { type, message: pick(HOT_SEAT_MSGS).replace(/{p}/g, p).replace(/{n}/g, String(n)), options: [] };
    }
    case "rule":
      return { type, message: pick(RULE_MSGS), options: [] };
    case "rps": {
      const two = players.length >= 2 ? pickN(players, 2) : [p, p];
      const n = sip(1 + Math.floor(Math.random() * 4));
      return {
        type,
        message: `${two[0]} ja ${two[1]}: kivi paperi sakset. Häviäjä juo ${n} huikkaa.`,
        options: [`${two[0]} hävisi`, `${two[1]} hävisi`, "Tasapeli — molemmat juo"],
      };
    }
    case "category": {
      const n = sip(2 + Math.floor(Math.random() * 3));
      return {
        type,
        message: `Kategoria: ${pick(CATEGORIES)}. ${p} aloittaa. Se joka ei keksi, juo ${n}.`,
        options: ["Juotiin", "Selvittiin"],
      };
    }
    case "trivia": {
      const t = pick(TRIVIA);
      const ts = sip(t.sips);
      return {
        type,
        message: `Kysymys ${p}:lle: ${t.question} — Jos tiesit, saat antaa huikat. Jos et, juo ${ts}.`,
        options: [`${p} tiesi! 🎓`, `${p} ei tiennyt`, "Ei kukaan tiennyt"],
        meta: { answer: t.answer, sips: ts },
      };
    }
    default: {
      const n = sip(2);
      return { type: "take", message: `${p} juo ${n} huikkaa.`, options: [] };
    }
  }
}

// ── DiffModal ─────────────────────────────────────────────────────────────────
function DiffModal({ onClose }: { onClose: () => void }) {
  const [pairs] = useState(() => pickN(DIFF_POOL, 2 + Math.floor(Math.random() * 2)));
  const [file] = useState(() => pick(DIFF_FILES));
  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
      <div className="bg-[#1e1e1e] border border-[#444] rounded-lg w-full max-w-sm shadow-2xl font-mono text-xs overflow-hidden">
        <div className="px-4 py-2.5 bg-[#2d2d2d] border-b border-[#444] flex items-center gap-2">
          <span className="text-amber-400 font-bold text-sm">◆</span>
          <span className="text-gray-300">Claude wants to make changes to:</span>
        </div>
        <div className="px-4 py-1.5 bg-[#252526] border-b border-[#3c3c3c]">
          <span className="text-blue-400">{file}</span>
        </div>
        <div className="py-2">
          {pairs.map(([rem, add], i) => (
            <div key={i} className="mb-1">
              <div className="px-4 py-0.5 bg-red-950/50 text-red-400">
                <span className="text-red-500 mr-2 select-none">−</span>{rem}
              </div>
              <div className="px-4 py-0.5 bg-green-950/50 text-green-400">
                <span className="text-green-500 mr-2 select-none">+</span>{add}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 px-4 py-3 border-t border-[#3c3c3c]">
          <button onClick={onClose} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold transition-colors">Kyllä</button>
          <button onClick={onClose} className="flex-1 py-2.5 bg-[#3c3c3c] hover:bg-[#505050] text-gray-300 rounded font-bold transition-colors">Ei</button>
          <button onClick={onClose} className="flex-1 py-2.5 bg-[#3c3c3c] hover:bg-[#505050] text-gray-400 rounded font-bold transition-colors text-[11px]">Älä kysy enää</button>
        </div>
      </div>
    </div>
  );
}

// ── AsciiMascot ───────────────────────────────────────────────────────────────
function AsciiMascot({ className = "" }: { className?: string }) {
  return (
    <pre className={`font-mono text-amber-400 text-xs leading-snug select-none ${className}`}>{
`  ┌──────┐
  │ ◆  ◆ │
  │  ‿‿  │
  └──┬───┘
     │`
    }</pre>
  );
}

// ── ModelSelectScreen ─────────────────────────────────────────────────────────
function ModelSelectScreen({ onSelect }: { onSelect: (key: ModelKey) => void }) {
  const models = Object.entries(MODEL_CONFIGS) as [ModelKey, ModelConfig][];
  return (
    <div className="min-h-screen bg-[#111] font-mono text-sm flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-5">
        <div className="text-center">
          <AsciiMascot className="inline-block" />
          <div className="mt-3">
            <h1 className="text-amber-400 font-bold text-lg">Anna Claudenin päättää</h1>
            <p className="text-gray-600 text-xs mt-1">Valitse malli ennen kuin aloitat</p>
          </div>
        </div>
        <div className="space-y-2">
          {models.map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all active:scale-[0.98] ${
                key === "sonnet"
                  ? "border-amber-500/60 bg-[#1a1a0a] hover:border-amber-400 hover:bg-[#22210d]"
                  : key === "brutal"
                  ? "border-red-900/60 bg-[#1a0a0a] hover:border-red-700/80 hover:bg-[#221010]"
                  : "border-[#2a2a2a] bg-[#161616] hover:border-[#444] hover:bg-[#1e1e1e]"
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className={`font-bold text-sm ${
                  key === "brutal" ? "text-red-400" : key === "sonnet" ? "text-amber-300" : "text-green-300"
                }`}>{cfg.label}</span>
                <span className={`text-[10px] ${
                  key === "sonnet" ? "text-amber-600" : key === "brutal" ? "text-red-700" : "text-gray-600"
                }`}>{cfg.tagline}</span>
              </div>
              <p className="text-gray-500 text-xs">{cfg.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── StatusBar ─────────────────────────────────────────────────────────────────
function StatusBar({
  status, isThinking, thinkingLabel, thinkingElapsed, thinkingTokens, sessionTokens, version,
}: {
  status: StatusState; isThinking: boolean; thinkingLabel: string;
  thinkingElapsed: number; thinkingTokens: number; sessionTokens: number; version: string;
}) {
  const [blink, setBlink] = useState(true);
  useEffect(() => {
    if (!isThinking) { setBlink(true); return; }
    const t = setInterval(() => setBlink(p => !p), 550);
    return () => clearInterval(t);
  }, [isThinking]);

  return (
    <div className="shrink-0 bg-[#0a0a0a] border-b border-[#222] px-3 py-1.5 font-mono text-xs">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
          <span className="text-amber-400 shrink-0">◆</span>
          {isThinking ? (
            <span className="text-green-400 truncate">
              <span className={`mr-1 transition-opacity duration-100 ${blink ? "opacity-100" : "opacity-10"}`}>✱</span>
              {thinkingLabel}
              <span className="text-gray-600 ml-1">({fmtElapsed(thinkingElapsed)} · ↓ {thinkingTokens.toFixed(1)}k)</span>
            </span>
          ) : (
            <span className="text-gray-600 text-[10px] truncate">{version}</span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 text-[10px]">
          <span className="text-amber-900 hidden sm:inline">{ctxBar(status.context)} {status.context}%</span>
          <span className="text-gray-600">{(sessionTokens / 1000).toFixed(1)}k</span>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AnnaClaudenPaattaa({ players, onBack }: { players: string[]; onBack: () => void }) {
  const [selectedModel, setSelectedModel] = useState<ModelKey | null>(null);
  const [status, setStatus] = useState<StatusState>(makeStatus);
  const [uiState, setUiState] = useState<"thinking" | "typing" | "waiting" | "end">("thinking");
  const [currentMsg, setCurrentMsg] = useState("");
  const [currentOpts, setCurrentOpts] = useState<string[]>([]);
  const [displayed, setDisplayed] = useState("");
  const [log, setLog] = useState<LogEntry[]>([]);
  const [diffVisible, setDiffVisible] = useState(false);
  const [endStats, setEndStats] = useState<{ tokens: string; context: number; duration: string } | null>(null);

  const [sessionTokens, setSessionTokens] = useState(0);
  const sessionTokensRef = useRef(0);
  sessionTokensRef.current = sessionTokens;

  const [thinkingLabelCurrent, setThinkingLabelCurrent] = useState(() => pick(THINKING_LABELS));
  const [thinkingElapsed, setThinkingElapsed] = useState(0);
  const [thinkingTokens, setThinkingTokens] = useState(0);
  const thinkingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const modelConfig = selectedModel ? MODEL_CONFIGS[selectedModel] : MODEL_CONFIGS.sonnet;
  const modelConfigRef = useRef(modelConfig);
  modelConfigRef.current = modelConfig;

  const messageCountRef = useRef(0);
  const onPickRef = useRef<(opt: string) => void>(() => {});
  const autoAdvanceCbRef = useRef<(() => void) | null>(null);
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const consecutiveAutoRef = useRef(0);
  const pendingAfterDiffRef = useRef<(() => void) | null>(null);
  const lastEndOptionTurnRef = useRef(0);
  const typeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on every content change so options stay in view
  useEffect(() => {
    if (logRef.current) {
      requestAnimationFrame(() => {
        if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
      });
    }
  }, [log, displayed, uiState]);

  // Thinking timer
  useEffect(() => {
    if (!selectedModel) return;
    if (uiState === "thinking") {
      setThinkingElapsed(0);
      setThinkingTokens(0);
      setThinkingLabelCurrent(pick(THINKING_LABELS));
      thinkingTimerRef.current = setInterval(() => {
        const cfg = modelConfigRef.current;
        const inc = cfg.tokenMin + Math.random() * cfg.tokenRange;
        setThinkingElapsed(prev => prev + 1);
        setThinkingTokens(prev => Math.round((prev + inc) * 10) / 10);
        setSessionTokens(prev => prev + Math.round(inc * 100));
      }, 1000);
    } else {
      if (thinkingTimerRef.current) { clearInterval(thinkingTimerRef.current); thinkingTimerRef.current = null; }
    }
    return () => { if (thinkingTimerRef.current) { clearInterval(thinkingTimerRef.current); thinkingTimerRef.current = null; } };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uiState, selectedModel]);

  // ── deliver ───────────────────────────────────────────────────────────────
  const deliverRef = useRef<(msg: string, opts: string[], onPick: (opt: string) => void) => void>(() => {});
  deliverRef.current = (msg, opts, onPick) => {
    const cfg = modelConfigRef.current;
    if (autoAdvanceTimerRef.current) { clearTimeout(autoAdvanceTimerRef.current); autoAdvanceTimerRef.current = null; }
    autoAdvanceCbRef.current = opts.length === 0 ? () => onPick("") : null;

    setStatus(makeStatus());
    setUiState("thinking");
    setCurrentMsg("");
    setCurrentOpts([]);
    onPickRef.current = onPick;

    let finalMsg = msg;
    if (cfg.preambles.length > 0 && Math.random() < 0.4) {
      finalMsg = pick(cfg.preambles) + msg;
    }

    const isFirst = messageCountRef.current === 0;
    messageCountRef.current += 1;
    const delay = isFirst
      ? cfg.firstMin + Math.random() * cfg.firstRange
      : cfg.thinkingMin + Math.random() * cfg.thinkingRange;

    setTimeout(() => {
      setCurrentMsg(finalMsg);
      setCurrentOpts(opts);
      setUiState("typing");
    }, delay);
  };

  // ── End helper ────────────────────────────────────────────────────────────
  const doEnd = () => {
    setEndStats({
      tokens: fmtTokens(sessionTokensRef.current),
      context: status.context + Math.floor(Math.random() * 10),
      duration: `${2 + Math.floor(Math.random() * 28)}m ${Math.floor(Math.random() * 60)}s`,
    });
    setUiState("end");
  };

  // ── Game logic ────────────────────────────────────────────────────────────
  const startActivityRef = useRef<(turnNum: number) => void>(() => {});

  startActivityRef.current = (turnNum) => {
    // Forced stop-or-continue checkpoint every 6 turns
    if (turnNum >= 4 && turnNum - lastEndOptionTurnRef.current >= 6) {
      lastEndOptionTurnRef.current = turnNum;
      consecutiveAutoRef.current = 0;
      const msg = pick(CHECKPOINT_MSGS);
      deliverRef.current(msg, ["Jatketaan", "Lopetetaan"], (opt) => {
        setLog(prev => [...prev, { role: "claude", text: msg }, { role: "player", text: `> ${opt}` }]);
        setCurrentMsg(""); setCurrentOpts([]);
        if (opt === "Lopetetaan") { doEnd(); return; }
        startActivityRef.current(turnNum + 1);
      });
      return;
    }

    const runActivity = () => {
      const act = makeActivity(players, turnNum, modelConfigRef.current.sipMult);

      // After 2 consecutive auto-advances, require a quick tap to re-engage
      let opts = act.options;
      if (opts.length === 0) {
        consecutiveAutoRef.current += 1;
        if (consecutiveAutoRef.current >= 2) {
          consecutiveAutoRef.current = 0;
          opts = pick(ACK_PAIRS);
        }
      } else {
        consecutiveAutoRef.current = 0;
      }

      // Occasionally inject Lopetetaan into choice activities
      const addEnd = opts.length > 0 && turnNum >= 4 && Math.random() < 0.28;
      if (addEnd) lastEndOptionTurnRef.current = turnNum;
      const finalOpts = addEnd ? [...opts, "Lopetetaan"] : opts;

      deliverRef.current(act.message, finalOpts, (opt) => {
        setCurrentMsg(""); setCurrentOpts([]);
        if (opt === "Lopetetaan") { doEnd(); return; }

        if (opt !== "") {
          setLog(prev => [...prev, { role: "claude", text: act.message }, { role: "player", text: `> ${opt}` }]);
        } else {
          setLog(prev => [...prev, { role: "claude", text: act.message }]);
        }

        // Trivia: show answer then auto-continue
        if (act.type === "trivia") {
          const answer = act.meta?.answer ?? "?";
          const sips = act.meta?.sips ?? 3;
          let followMsg: string;
          if (opt.includes("tiesi!")) {
            followMsg = `Vastaus: ${answer} Oikein! Saat antaa ${Math.ceil(sips / 2)} huikkaa.`;
          } else if (opt.includes("ei tiennyt") && !opt.includes("kukaan")) {
            followMsg = `Vastaus: ${answer} Väärin. Juo ${sips} huikkaa.`;
          } else {
            followMsg = `Vastaus: ${answer} Ei kukaan? Kaikki juo ${Math.ceil(sips / 2)}.`;
          }
          deliverRef.current(followMsg, [], () => {
            setLog(prev => [...prev, { role: "claude", text: followMsg }]);
            setCurrentMsg(""); setCurrentOpts([]);
            startActivityRef.current(turnNum + 1);
          });
          return;
        }

        startActivityRef.current(turnNum + 1);
      });
    };

    if (Math.random() < 0.12) {
      pendingAfterDiffRef.current = runActivity;
      setDiffVisible(true);
    } else {
      runActivity();
    }
  };

  // ── Bootstrap ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedModel) return;
    const msg = `${pick(GREETINGS)}, ${pick(GROUP_NICKS)}. Näyttää siltä että teillä on ${pick(MOOD_WORDS)}. Mitä haluatte tehdä?`;
    deliverRef.current(msg, ["Juoda", "Ottaa väliveden", "Päätä sinä"], (opt) => {
      setLog(prev => [...prev, { role: "claude", text: msg }, { role: "player", text: `> ${opt}` }]);
      setCurrentMsg(""); setCurrentOpts([]);
      if (opt === "Ottaa väliveden") {
        const wMsg = "Järkevää. Pidetään pieni tauko. No, ehkä vähän juodaan silti.";
        deliverRef.current(wMsg, [], () => {
          setLog(prev => [...prev, { role: "claude", text: wMsg }]);
          setCurrentMsg(""); setCurrentOpts([]);
          startActivityRef.current(0);
        });
        return;
      }
      startActivityRef.current(0);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModel]);

  // ── Typewriter ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (uiState !== "typing") {
      if (typeTimerRef.current) { clearInterval(typeTimerRef.current); typeTimerRef.current = null; }
      return;
    }
    let i = 0;
    setDisplayed("");
    if (typeTimerRef.current) clearInterval(typeTimerRef.current);
    const ms = modelConfigRef.current.typewriterMs;
    typeTimerRef.current = setInterval(() => {
      i++;
      setDisplayed(currentMsg.slice(0, i));
      if (i >= currentMsg.length) {
        clearInterval(typeTimerRef.current!);
        typeTimerRef.current = null;
        setUiState("waiting");
        const cb = autoAdvanceCbRef.current;
        if (cb) {
          autoAdvanceCbRef.current = null;
          autoAdvanceTimerRef.current = setTimeout(() => {
            autoAdvanceTimerRef.current = null;
            cb();
          }, 2200 + Math.random() * 800);
        }
      }
    }, ms);
    return () => { if (typeTimerRef.current) { clearInterval(typeTimerRef.current); typeTimerRef.current = null; } };
  }, [uiState, currentMsg]);

  const handleOptionPick = (opt: string) => {
    if (uiState !== "waiting") return;
    if (autoAdvanceTimerRef.current) { clearTimeout(autoAdvanceTimerRef.current); autoAdvanceTimerRef.current = null; }
    onPickRef.current(opt);
  };

  const closeDiff = () => {
    setDiffVisible(false);
    if (pendingAfterDiffRef.current) { pendingAfterDiffRef.current(); pendingAfterDiffRef.current = null; }
  };

  // ── Model select ──────────────────────────────────────────────────────────
  if (!selectedModel) {
    return <ModelSelectScreen onSelect={setSelectedModel} />;
  }

  // ── End screen ────────────────────────────────────────────────────────────
  if (uiState === "end" && endStats) {
    return (
      <div className="min-h-screen bg-[#111] font-mono flex flex-col items-center justify-center px-6 py-12 text-sm">
        <div className="w-full max-w-sm space-y-5">
          <div className="text-center"><AsciiMascot className="inline-block" /></div>
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-2xl">◆</span>
            <span className="text-white text-xl font-bold">Claude</span>
          </div>
          <p className="text-gray-300 text-base">Session päättyi.</p>
          <div className="bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl p-5 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Model:</span>
              <span className="text-green-400">{modelConfig.label}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tokens used:</span>
              <span className="text-amber-400">{endStats.tokens}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Context:</span>
              <span className="text-amber-800">{ctxBar(endStats.context)} {endStats.context}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="text-gray-300">{endStats.duration}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Exit code:</span>
              <span className="text-green-400">0 ✓</span>
            </div>
          </div>
          <button
            onClick={onBack}
            className="w-full py-3.5 rounded-xl bg-[#1e1e1e] border border-[#3c3c3c] hover:border-amber-500/50 text-gray-300 hover:text-white font-bold transition-colors"
          >
            Takaisin
          </button>
        </div>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  // Single scroll container: history + live bubble + options all scroll together.
  // When the log is empty, the live bubble appears at the top (not the bottom).
  // Auto-scroll keeps the latest content and options in view at all times.
  return (
    <div className="bg-[#111] font-mono text-sm flex flex-col" style={{ height: "100dvh" }}>
      <StatusBar
        status={status}
        isThinking={uiState === "thinking"}
        thinkingLabel={thinkingLabelCurrent}
        thinkingElapsed={thinkingElapsed}
        thinkingTokens={thinkingTokens}
        sessionTokens={sessionTokens}
        version={modelConfig.version}
      />

      {/* Single scrollable area — history + live bubble + options */}
      <div ref={logRef} className="flex-1 min-h-0 overflow-y-auto px-4 pt-3 pb-5 space-y-3">

        {/* Committed history */}
        {log.map((entry, i) => (
          <div key={i} className={`flex gap-2 ${entry.role === "player" ? "justify-end" : ""}`}>
            {entry.role === "claude" && (
              <span className="text-amber-400 shrink-0 leading-6 mt-0.5 select-none">◆</span>
            )}
            <p className={`text-sm leading-relaxed max-w-[88%] px-3 py-2 rounded-xl ${
              entry.role === "claude"
                ? "text-green-300 bg-[#191919] border border-[#2a2a2a]"
                : "text-amber-300"
            }`}>
              {entry.text}
            </p>
          </div>
        ))}

        {/* Live Claude bubble — always present during active game */}
        <div className="flex gap-2">
          <span className="text-amber-400 shrink-0 leading-6 mt-0.5 select-none">◆</span>
          <p className="text-sm leading-relaxed text-green-300 bg-[#191919] border border-[#2a2a2a] px-3 py-2 rounded-xl max-w-[88%] min-h-[2.25rem]">
            {uiState === "thinking" ? (
              <span className="text-gray-600 animate-pulse">{thinkingLabelCurrent}...</span>
            ) : (
              <>
                {displayed}
                {uiState === "typing" && (
                  <span className="inline-block w-1.5 h-[1.1em] bg-green-400 ml-0.5 animate-pulse align-text-bottom" />
                )}
              </>
            )}
          </p>
        </div>

        {/* Options — appear below the message once typing completes */}
        {uiState === "waiting" && currentOpts.length > 0 && (
          <div className="space-y-2">
            {currentOpts.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleOptionPick(opt)}
                className={`w-full text-left px-4 py-3.5 rounded-xl border border-l-2 transition-all text-sm active:scale-[0.98] ${
                  opt === "Lopetetaan"
                    ? "bg-[#1a1010] border-red-900/50 border-l-red-800/60 text-red-400/80 hover:border-red-700/70 hover:text-red-300 hover:bg-[#221515]"
                    : "bg-[#1a1a1a] border-[#2e2e2e] border-l-amber-600/50 text-amber-300 hover:border-[#444] hover:border-l-amber-400 hover:bg-[#202020]"
                }`}
              >
                <span className="text-gray-600 mr-2 select-none">&gt;</span>{opt}
              </button>
            ))}
          </div>
        )}

      </div>

      {diffVisible && <DiffModal onClose={closeDiff} />}
    </div>
  );
}
