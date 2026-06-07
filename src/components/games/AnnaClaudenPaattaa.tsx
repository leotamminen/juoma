"use client";

import { useState, useEffect, useRef } from "react";
import {
  GROUP_NICKS, GREETINGS, MOOD_WORDS, FILLERS, DRINK_REACTIONS,
  THINKING_LABELS, CATEGORIES, DIFF_POOL, DIFF_FILES,
  TRIVIA, CHAOS_MESSAGES,
} from "@/data/claudeGameData";
import { drinkingFacts } from "@/data/drinkingFacts";

// ── Model configs ───────────────────────────────────────────────────────────
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
    thinkingMin: 800,  thinkingRange: 2200,
    firstMin: 600,     firstRange: 600,
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
    thinkingMin: 4000, thinkingRange: 11000,
    firstMin: 1500,    firstRange: 1000,
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
    thinkingMin: 8000, thinkingRange: 17000,
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
    thinkingMin: 12000, thinkingRange: 18000,
    firstMin: 5000,     firstRange: 3000,
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
    thinkingMin: 600,  thinkingRange: 1900,
    firstMin: 300,     firstRange: 500,
    typewriterMs: 8,
    tokenMin: 0.35, tokenRange: 0.45,
    sipMult: 2.0,
    preambles: [
      "Juo. ",
      "Kuule. ",
      "Nyt. ",
      "Ei neuvottelua. ",
      "Tehdään näin: ",
      "Ilman kysymyksiä: ",
    ],
  },
};

type ModelKey = keyof typeof MODEL_CONFIGS;

// ── Helpers ─────────────────────────────────────────────────────────────────
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
type ActivityType = "sip" | "waterfall" | "rps" | "everyone" | "question" | "category" | "fact" | "trivia" | "chaos";
type Activity = {
  type: ActivityType;
  message: string;
  options: string[];
  meta?: { answer?: string; sips?: number };
};

function makeStatus(): StatusState {
  return { context: 60 + Math.floor(Math.random() * 35) };
}
function ctxBar(pct: number): string {
  const f = Math.round(pct / 10);
  return "▓".repeat(f) + "░".repeat(10 - f);
}

function makeActivity(players: string[], turnNum: number, sipMult = 1.0): Activity {
  const sip = (n: number) => Math.max(1, Math.round(n * sipMult));

  if (turnNum > 0 && Math.random() < 0.2) {
    const p = pick(players);
    if (Math.random() < 0.5) {
      const s = sip(2 + Math.floor(Math.random() * 3));
      return { type: "sip", message: `Huomaan että ${p} on ollut hiljaa. Korjataan se. ${p} juo ${s} huikkaa.`, options: ["Juotiin", "Protestoitiin mutta juotiin"] };
    }
    const s = sip(3 + Math.floor(Math.random() * 4));
    return { type: "everyone", message: `Tokenit loppuu pian. Tehkää jotain hullua. Kaikki ottaa ${s} huikkaa. Ei neuvotella.`, options: ["Juotiin", "Protestoitiin mutta juotiin"] };
  }

  const type = pick<ActivityType>(["sip","waterfall","rps","everyone","question","category","fact","trivia","chaos"]);
  const p = pick(players);

  switch (type) {
    case "sip": {
      const n = sip(2 + Math.floor(Math.random() * 5));
      return { type: "sip", message: `Okei. ${p} saa jakaa ${n} huikkaa kenelle tahansa. Tai ottaa ne itse, jos siltä tuntuu.`, options: [...players, "Itse"] };
    }
    case "waterfall":
      return { type: "waterfall", message: `Vesiputous. ${p} aloittaa, juodaan kunnes aloittaja lopettaa.`, options: ["Aloitetaan", "Ei kiitos"] };
    case "rps": {
      const two = players.length >= 2 ? pickN(players, 2) : [players[0], players[0]];
      const n = sip(1 + Math.floor(Math.random() * 4));
      return { type: "rps", message: `${two[0]} ja ${two[1]}: kivi paperi sakset. Häviäjä juo ${n} huikkaa.`, options: [`Pelattiin, ${two[0]} hävisi`, `Pelattiin, ${two[1]} hävisi`, "Tasapeli"] };
    }
    case "everyone": {
      const n = sip(1 + Math.floor(Math.random() * 4));
      return { type: "everyone", message: `Kaikki ottaa ${n} huikkaa. Ei neuvotella.`, options: ["Juotiin", "Protestoitiin mutta juotiin"] };
    }
    case "question":
      return { type: "question", message: `${p}: esitä kysymys muille. Se joka ei vastaa, juo.`, options: ["Juotiin", "Selvittiin"] };
    case "category":
      return { type: "category", message: `Kategoria: ${pick(CATEGORIES)}. ${p} aloittaa. Se joka ei keksi, juo.`, options: ["Juotiin", "Selvittiin"] };
    case "fact": {
      const fact = pick(drinkingFacts);
      return { type: "fact", message: `Tiesitkö muuten: ${fact}`, options: ["Kiva tietää 🧠", "Mielenkiintoista...", "Lopeta faktat"] };
    }
    case "trivia": {
      const t = pick(TRIVIA);
      const ts = sip(t.sips);
      return {
        type: "trivia",
        message: `Kysymys ${p}:lle: ${t.question} — Jos tiesit, saat antaa huikat. Jos et, juo ${ts}.`,
        options: [`${p} tiesi! 🎓`, `${p} ei tiennyt`, "Ei kukaan tiennyt"],
        meta: { answer: t.answer, sips: ts },
      };
    }
    case "chaos": {
      const p2 = pick(players.filter(pl => pl !== p).concat(p));
      const n = sip(1 + Math.floor(Math.random() * 4));
      const msg = pick(CHAOS_MESSAGES)
        .replace(/{p1}/g, p)
        .replace(/{p2}/g, p2)
        .replace(/{n}/g, String(n));
      return {
        type: "chaos",
        message: msg,
        options: pick([
          ["Ok 👍", "Juotiin"],
          ["Selvä selvä", "Ei kommenttia"],
          ["Totteleminen on parasta", "Protestoitiin mutta toteltiin"],
          ["Tässähän se", "Juotiin"],
        ] as string[][]),
      };
    }
  }
}

// ── DiffModal ────────────────────────────────────────────────────────────────
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
          <button onClick={onClose} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded font-bold transition-colors">Kyllä</button>
          <button onClick={onClose} className="flex-1 py-2.5 bg-[#3c3c3c] hover:bg-[#505050] text-gray-300 rounded font-bold transition-colors">Ei</button>
          <button onClick={onClose} className="flex-1 py-2.5 bg-[#3c3c3c] hover:bg-[#505050] text-gray-400 rounded font-bold transition-colors text-[11px]">Älä kysy enää</button>
        </div>
      </div>
    </div>
  );
}

// ── AsciiMascot ──────────────────────────────────────────────────────────────
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

// ── ModelSelectScreen ────────────────────────────────────────────────────────
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

// ── StatusBar ────────────────────────────────────────────────────────────────
function StatusBar({
  status, isThinking, thinkingLabel, thinkingElapsed, thinkingTokens, sessionTokens, version,
}: {
  status: StatusState;
  isThinking: boolean;
  thinkingLabel: string;
  thinkingElapsed: number;
  thinkingTokens: number;
  sessionTokens: number;
  version: string;
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
              <span className="text-gray-600 ml-1">
                ({fmtElapsed(thinkingElapsed)} · ↓ {thinkingTokens.toFixed(1)}k)
              </span>
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

// ── Main component ───────────────────────────────────────────────────────────
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

  const [sessionTokens, setSessionTokens] = useState(() => 5000 + Math.floor(Math.random() * 10000));
  const sessionTokensRef = useRef(sessionTokens);
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
  const pendingAfterDiffRef = useRef<(() => void) | null>(null);
  const typeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log, displayed, uiState]);

  // Thinking timer — only runs after model is selected
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

  // ── deliver ──────────────────────────────────────────────────────────────
  const deliverRef = useRef<(msg: string, opts: string[], onPick: (opt: string) => void) => void>(() => {});
  deliverRef.current = (msg, opts, onPick) => {
    const cfg = modelConfigRef.current;
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

  // ── Game logic ────────────────────────────────────────────────────────────
  const startReactionRef = useRef<(turnNum: number) => void>(() => {});
  const startActivityRef = useRef<(turnNum: number) => void>(() => {});

  startReactionRef.current = (turnNum) => {
    const msg = `${pick(DRINK_REACTIONS)} ${pick(FILLERS)} Mitä seuraavaksi?`;
    deliverRef.current(msg, ["Jatketaan", "Taukojuoma (vesi)", "Lopetetaan"], (opt) => {
      setLog(prev => [...prev, { role: "claude", text: msg }, { role: "player", text: `> ${opt}` }]);
      setCurrentMsg(""); setCurrentOpts([]);
      if (opt === "Lopetetaan") {
        const total = sessionTokensRef.current;
        setEndStats({
          tokens: fmtTokens(total),
          context: 80 + Math.floor(Math.random() * 15),
          duration: `${2 + Math.floor(Math.random() * 28)}m ${Math.floor(Math.random() * 60)}s`,
        });
        setUiState("end");
        return;
      }
      const next = turnNum + 1;
      if (Math.random() < 0.25) {
        pendingAfterDiffRef.current = () => startActivityRef.current(next);
        setDiffVisible(true);
      } else {
        startActivityRef.current(next);
      }
    });
  };

  startActivityRef.current = (turnNum) => {
    const act = makeActivity(players, turnNum, modelConfigRef.current.sipMult);
    deliverRef.current(act.message, act.options, (opt) => {
      setLog(prev => [...prev, { role: "claude", text: act.message }, { role: "player", text: `> ${opt}` }]);
      setCurrentMsg(""); setCurrentOpts([]);

      if (act.type === "waterfall" && opt === "Ei kiitos") {
        const wfMsg = "Ei kiitos? Selvä. Kaikki juo kaksi ylimääräistä. Aloitetaan silti.";
        deliverRef.current(wfMsg, ["Joopa joo"], () => {
          setLog(prev => [...prev, { role: "claude", text: wfMsg }, { role: "player", text: "> Joopa joo" }]);
          setCurrentMsg(""); setCurrentOpts([]);
          startReactionRef.current(turnNum);
        });
        return;
      }

      if (act.type === "fact" && opt === "Lopeta faktat") {
        const stopMsg = "Ok, ei enää faktoja. Palataan tärkeämpiin asioihin, eli juomiseen.";
        deliverRef.current(stopMsg, ["Selvä"], () => {
          setLog(prev => [...prev, { role: "claude", text: stopMsg }, { role: "player", text: "> Selvä" }]);
          setCurrentMsg(""); setCurrentOpts([]);
          startReactionRef.current(turnNum);
        });
        return;
      }

      if (act.type === "trivia") {
        const answer = act.meta?.answer ?? "?";
        const sips = act.meta?.sips ?? 3;
        const giveHuikat = Math.ceil(sips / 2);
        let followMsg: string;
        if (opt.includes("tiesi!")) {
          followMsg = `Vastaus: ${answer} Oikein! Saat antaa ${giveHuikat} huikkaa kenelle tahansa.`;
        } else if (opt.includes("ei tiennyt") && !opt.includes("kukaan")) {
          followMsg = `Vastaus: ${answer} Väärin. Juo ${sips} huikkaa.`;
        } else {
          followMsg = `Vastaus: ${answer} Ei kukaan? Kaikki juo ${Math.ceil(sips / 2)} huikkaa yhdessä.`;
        }
        deliverRef.current(followMsg, ["Ok 👌"], () => {
          setLog(prev => [...prev, { role: "claude", text: followMsg }, { role: "player", text: "> Ok 👌" }]);
          setCurrentMsg(""); setCurrentOpts([]);
          startReactionRef.current(turnNum);
        });
        return;
      }

      startReactionRef.current(turnNum);
    });
  };

  // ── Bootstrap — fires when model is selected ─────────────────────────────
  useEffect(() => {
    if (!selectedModel) return;
    const msg = `${pick(GREETINGS)}, ${pick(GROUP_NICKS)}. Näyttää siltä että teillä on ${pick(MOOD_WORDS)}. Mitä haluatte tehdä?`;
    deliverRef.current(msg, ["Juoda", "Ottaa väliveden", "Päätä sinä"], (opt) => {
      setLog(prev => [...prev, { role: "claude", text: msg }, { role: "player", text: `> ${opt}` }]);
      setCurrentMsg(""); setCurrentOpts([]);
      if (opt === "Ottaa väliveden") {
        const wMsg = "Järkevää. Pidetään pieni tauko. No, ehkä vähän juodaan silti.";
        deliverRef.current(wMsg, ["Ok"], () => {
          setLog(prev => [...prev, { role: "claude", text: wMsg }, { role: "player", text: "> Ok" }]);
          setCurrentMsg(""); setCurrentOpts([]);
          startActivityRef.current(1);
        });
        return;
      }
      startActivityRef.current(1);
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
      }
    }, ms);
    return () => { if (typeTimerRef.current) { clearInterval(typeTimerRef.current); typeTimerRef.current = null; } };
  }, [uiState, currentMsg]);

  const handleOptionPick = (opt: string) => {
    if (uiState !== "waiting") return;
    onPickRef.current(opt);
  };

  const closeDiff = () => {
    setDiffVisible(false);
    if (pendingAfterDiffRef.current) { pendingAfterDiffRef.current(); pendingAfterDiffRef.current = null; }
  };

  // ── Model selection screen ────────────────────────────────────────────────
  if (!selectedModel) {
    return <ModelSelectScreen onSelect={(key) => setSelectedModel(key)} />;
  }

  // ── End screen ────────────────────────────────────────────────────────────
  if (uiState === "end" && endStats) {
    return (
      <div className="min-h-screen bg-[#111] font-mono flex flex-col items-center justify-center px-6 py-12 text-sm">
        <div className="w-full max-w-sm space-y-5">
          <div className="text-center">
            <AsciiMascot className="inline-block" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-2xl">◆</span>
            <span className="text-white text-xl font-bold">Claude</span>
          </div>
          <p className="text-gray-300 text-base leading-relaxed">Session päättyi.</p>
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

      <div ref={logRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
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

        {(uiState === "thinking" || uiState === "typing" || uiState === "waiting") && (
          <div className="flex gap-2">
            <span className="text-amber-400 shrink-0 leading-6 mt-0.5 select-none">◆</span>
            <p className="text-sm leading-relaxed text-green-300 bg-[#191919] border border-[#2a2a2a] px-3 py-2 rounded-xl max-w-[88%] min-h-[2.25rem]">
              {uiState === "thinking" ? (
                <span className="text-gray-600 animate-pulse">{thinkingLabelCurrent}...</span>
              ) : (
                <>
                  {displayed}
                  {uiState === "typing" && displayed.length < currentMsg.length && (
                    <span className="inline-block w-1.5 h-[1.1em] bg-green-400 ml-0.5 animate-pulse align-text-bottom" />
                  )}
                </>
              )}
            </p>
          </div>
        )}
      </div>

      {uiState === "waiting" && currentOpts.length > 0 && (
        <div className="shrink-0 px-4 pt-3 pb-6 space-y-2.5 border-t border-[#252525] bg-[#0d0d0d] max-h-[50vh] overflow-y-auto">
          {currentOpts.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleOptionPick(opt)}
              className="w-full text-left px-4 py-4 rounded-xl bg-[#1a1a1a] border border-[#333] border-l-2 border-l-amber-600/50 text-amber-300 hover:border-amber-500/70 hover:border-l-amber-400 hover:bg-[#222] active:bg-[#2a2a2a] transition-all text-base"
            >
              <span className="text-gray-500 mr-2 select-none">&gt;</span>{opt}
            </button>
          ))}
        </div>
      )}

      {diffVisible && <DiffModal onClose={closeDiff} />}
    </div>
  );
}
