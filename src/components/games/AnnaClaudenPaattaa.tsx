"use client";

import { useState, useEffect, useRef } from "react";
import {
  GROUP_NICKS, GREETINGS, MOOD_WORDS, FILLERS, DRINK_REACTIONS,
  THINKING_LABELS, CATEGORIES, DIFF_POOL, DIFF_FILES,
  TRIVIA, CHAOS_MESSAGES,
} from "@/data/claudeGameData";
import { drinkingFacts } from "@/data/drinkingFacts";

// ── Helpers ────────────────────────────────────────────────────────────────
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

// ── Types ──────────────────────────────────────────────────────────────────
type LogEntry = { role: "claude" | "player"; text: string };
type StatusState = { context: number; totalTokens: number };
type ActivityType = "sip" | "waterfall" | "rps" | "everyone" | "question" | "category" | "fact" | "trivia" | "chaos";
type Activity = {
  type: ActivityType;
  message: string;
  options: string[];
  meta?: { answer?: string; sips?: number };
};

function makeStatus(): StatusState {
  return {
    context: 60 + Math.floor(Math.random() * 35),
    totalTokens: Math.round((20 + Math.random() * 30) * 10) / 10,
  };
}
function ctxBar(pct: number): string {
  const f = Math.round(pct / 10);
  return "▓".repeat(f) + "░".repeat(10 - f);
}

function makeActivity(players: string[], turnNum: number): Activity {
  // 1-in-5 special commentary
  if (turnNum > 0 && Math.random() < 0.2) {
    const p = pick(players);
    if (Math.random() < 0.5) {
      const s = 2 + Math.floor(Math.random() * 3);
      return { type: "sip", message: `Huomaan että ${p} on ollut hiljaa. Korjataan se. ${p} juo ${s} huikkaa.`, options: ["Juotiin", "Protestoitiin mutta juotiin"] };
    }
    const s = 3 + Math.floor(Math.random() * 4);
    return { type: "everyone", message: `Tokenit loppuu pian. Tehkää jotain hullua. Kaikki ottaa ${s} huikkaa. Ei neuvotella.`, options: ["Juotiin", "Protestoitiin mutta juotiin"] };
  }

  const type = pick<ActivityType>(["sip","waterfall","rps","everyone","question","category","fact","trivia","chaos"]);
  const p = pick(players);

  switch (type) {
    case "sip": {
      const n = 2 + Math.floor(Math.random() * 5);
      return { type: "sip", message: `Okei. ${p} saa jakaa ${n} huikkaa kenelle tahansa. Tai ottaa ne itse, jos siltä tuntuu.`, options: [...players, "Itse"] };
    }
    case "waterfall":
      return { type: "waterfall", message: `Vesiputous. ${p} aloittaa, juodaan kunnes aloittaja lopettaa.`, options: ["Aloitetaan", "Ei kiitos"] };
    case "rps": {
      const two = players.length >= 2 ? pickN(players, 2) : [players[0], players[0]];
      const n = 1 + Math.floor(Math.random() * 4);
      return { type: "rps", message: `${two[0]} ja ${two[1]}: kivi paperi sakset. Häviäjä juo ${n} huikkaa.`, options: [`Pelattiin, ${two[0]} hävisi`, `Pelattiin, ${two[1]} hävisi`, "Tasapeli"] };
    }
    case "everyone": {
      const n = 1 + Math.floor(Math.random() * 4);
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
      return {
        type: "trivia",
        message: `Kysymys ${p}:lle: ${t.question} — Jos tiesit, saat antaa huikat. Jos et, juo ${t.sips}.`,
        options: [`${p} tiesi! 🎓`, `${p} ei tiennyt`, "Ei kukaan tiennyt"],
        meta: { answer: t.answer, sips: t.sips },
      };
    }
    case "chaos": {
      const p2 = pick(players.filter(pl => pl !== p).concat(p));
      const n = 1 + Math.floor(Math.random() * 4);
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
        ]),
      };
    }
  }
}

// ── DiffModal ──────────────────────────────────────────────────────────────
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

// ── StatusBar ──────────────────────────────────────────────────────────────
function StatusBar({
  status, isThinking, thinkingLabel, thinkingElapsed, thinkingTokens,
}: {
  status: StatusState;
  isThinking: boolean;
  thinkingLabel: string;
  thinkingElapsed: number;
  thinkingTokens: number;
}) {
  return (
    <div className="shrink-0 bg-[#0a0a0a] border-b border-[#222] px-3 py-1.5 font-mono text-xs">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
          <span className="text-amber-400 shrink-0">◆</span>
          {isThinking ? (
            <span className="text-green-400 truncate">
              <span className="text-green-600 mr-1">*</span>
              {thinkingLabel}
              <span className="text-gray-600 ml-1">
                ({fmtElapsed(thinkingElapsed)} • ↓ {thinkingTokens.toFixed(1)}k tokens)
              </span>
            </span>
          ) : (
            <span className="text-gray-600">Claude</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-gray-700 shrink-0 text-[10px]">
          <span className="text-amber-900 hidden sm:inline">{ctxBar(status.context)} {status.context}%</span>
          <span className="hidden xs:inline">{status.totalTokens}k ctx</span>
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function AnnaClaudenPaattaa({ players, onBack }: { players: string[]; onBack: () => void }) {
  const [status, setStatus] = useState<StatusState>(makeStatus);
  const [uiState, setUiState] = useState<"thinking" | "typing" | "waiting" | "end">("thinking");
  const [currentMsg, setCurrentMsg] = useState("");
  const [currentOpts, setCurrentOpts] = useState<string[]>([]);
  const [displayed, setDisplayed] = useState("");
  const [log, setLog] = useState<LogEntry[]>([]);
  const [diffVisible, setDiffVisible] = useState(false);
  const [endStats, setEndStats] = useState<{ tokens: string; context: number; duration: string } | null>(null);

  // Live thinking counter
  const [thinkingLabel] = useState(() => pick(THINKING_LABELS));
  const [thinkingLabelCurrent, setThinkingLabelCurrent] = useState(thinkingLabel);
  const [thinkingElapsed, setThinkingElapsed] = useState(0);
  const [thinkingTokens, setThinkingTokens] = useState(0);
  const thinkingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const onPickRef = useRef<(opt: string) => void>(() => {});
  const pendingAfterDiffRef = useRef<(() => void) | null>(null);
  const typeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever log, live text, or panel changes
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log, displayed, uiState]);

  // Live thinking counter — runs while uiState === "thinking"
  useEffect(() => {
    if (uiState === "thinking") {
      setThinkingElapsed(0);
      setThinkingTokens(0);
      setThinkingLabelCurrent(pick(THINKING_LABELS));
      thinkingTimerRef.current = setInterval(() => {
        setThinkingElapsed(prev => prev + 1);
        setThinkingTokens(prev => Math.round((prev + 0.08 + Math.random() * 0.22) * 10) / 10);
      }, 1000);
    } else {
      if (thinkingTimerRef.current) { clearInterval(thinkingTimerRef.current); thinkingTimerRef.current = null; }
    }
    return () => { if (thinkingTimerRef.current) { clearInterval(thinkingTimerRef.current); thinkingTimerRef.current = null; } };
  }, [uiState]);

  // ── deliver ────────────────────────────────────────────────────────────
  const deliverRef = useRef<(msg: string, opts: string[], onPick: (opt: string) => void) => void>(() => {});
  deliverRef.current = (msg, opts, onPick) => {
    setStatus(makeStatus());
    setUiState("thinking");
    setCurrentMsg("");
    setCurrentOpts([]);
    onPickRef.current = onPick;
    // 5–20 second thinking delay
    setTimeout(() => {
      setCurrentMsg(msg);
      setCurrentOpts(opts);
      setUiState("typing");
    }, 5000 + Math.random() * 15000);
  };

  // ── Game logic ─────────────────────────────────────────────────────────
  const startReactionRef = useRef<(turnNum: number) => void>(() => {});
  const startActivityRef = useRef<(turnNum: number) => void>(() => {});

  startReactionRef.current = (turnNum) => {
    const msg = `${pick(DRINK_REACTIONS)} ${pick(FILLERS)} Mitä seuraavaksi?`;
    deliverRef.current(msg, ["Jatketaan", "Taukojuoma (vesi)", "Lopetetaan"], (opt) => {
      setLog(prev => [...prev, { role: "claude", text: msg }, { role: "player", text: `> ${opt}` }]);
      setCurrentMsg(""); setCurrentOpts([]);
      if (opt === "Lopetetaan") {
        setEndStats({
          tokens: `${(50 + Math.random() * 150).toFixed(0)},${Math.floor(Math.random() * 900)}`,
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
    const act = makeActivity(players, turnNum);
    deliverRef.current(act.message, act.options, (opt) => {
      setLog(prev => [...prev, { role: "claude", text: act.message }, { role: "player", text: `> ${opt}` }]);
      setCurrentMsg(""); setCurrentOpts([]);

      // Waterfall refusal
      if (act.type === "waterfall" && opt === "Ei kiitos") {
        const wfMsg = "Ei kiitos? Selvä. Kaikki juo kaksi ylimääräistä. Aloitetaan silti.";
        deliverRef.current(wfMsg, ["Joopa joo"], () => {
          setLog(prev => [...prev, { role: "claude", text: wfMsg }, { role: "player", text: "> Joopa joo" }]);
          setCurrentMsg(""); setCurrentOpts([]);
          startReactionRef.current(turnNum);
        });
        return;
      }

      // Fact: "Lopeta faktat" gets a brief complaint
      if (act.type === "fact" && opt === "Lopeta faktat") {
        const stopMsg = "Ok, ei enää faktoja. Palataan tärkeämpiin asioihin, eli juomiseen.";
        deliverRef.current(stopMsg, ["Selvä"], () => {
          setLog(prev => [...prev, { role: "claude", text: stopMsg }, { role: "player", text: "> Selvä" }]);
          setCurrentMsg(""); setCurrentOpts([]);
          startReactionRef.current(turnNum);
        });
        return;
      }

      // Trivia: reveal the answer, then go to reaction
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

  // ── Bootstrap ──────────────────────────────────────────────────────────
  useEffect(() => {
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
  }, []);

  // ── Typewriter ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (uiState !== "typing") {
      if (typeTimerRef.current) { clearInterval(typeTimerRef.current); typeTimerRef.current = null; }
      return;
    }
    let i = 0;
    setDisplayed("");
    if (typeTimerRef.current) clearInterval(typeTimerRef.current);
    typeTimerRef.current = setInterval(() => {
      i++;
      setDisplayed(currentMsg.slice(0, i));
      if (i >= currentMsg.length) {
        clearInterval(typeTimerRef.current!);
        typeTimerRef.current = null;
        setUiState("waiting");
      }
    }, 22);
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

  // ── End screen ─────────────────────────────────────────────────────────
  if (uiState === "end" && endStats) {
    return (
      <div className="min-h-screen bg-[#111] font-mono flex flex-col items-center justify-center px-6 py-12 text-sm">
        <div className="w-full max-w-sm space-y-5">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-2xl">◆</span>
            <span className="text-white text-xl font-bold">Claude</span>
          </div>
          <p className="text-gray-300 text-base leading-relaxed">Session päättyi.</p>
          <div className="bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl p-5 space-y-3">
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

  // ── Main render ────────────────────────────────────────────────────────
  return (
    <div className="bg-[#111] font-mono text-sm flex flex-col" style={{ height: "100dvh" }}>
      <StatusBar
        status={status}
        isThinking={uiState === "thinking"}
        thinkingLabel={thinkingLabelCurrent}
        thinkingElapsed={thinkingElapsed}
        thinkingTokens={thinkingTokens}
      />

      {/* Scrollable conversation log */}
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

        {/* Live Claude bubble — visible during thinking, typing AND waiting */}
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

      {/* Player options */}
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
