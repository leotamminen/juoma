"use client";

import React, { useState, useRef, useEffect } from "react";
import { DrinkingFactToast } from "@/components/DrinkingFactToast";

// ── Bottle SVG ─────────────────────────────────────────────────────────────
function BottleSVG({ spinning }: { spinning: boolean }) {
  return (
    <svg
      viewBox="0 0 60 160"
      width="56"
      height="148"
      aria-hidden="true"
      style={{ filter: spinning ? "drop-shadow(0 0 12px rgba(255,180,50,0.7))" : "drop-shadow(0 4px 8px rgba(0,0,0,0.6))" }}
    >
      {/* Cap */}
      <rect x="22" y="4" width="16" height="10" rx="3" fill="#c0392b" />
      {/* Neck */}
      <rect x="24" y="13" width="12" height="30" rx="4" fill="#2a6b1a" />
      {/* Shoulder taper */}
      <path d="M18 43 Q14 55 12 72 L48 72 Q46 55 42 43 Z" fill="#2a6b1a" />
      {/* Body */}
      <rect x="12" y="72" width="36" height="76" rx="8" fill="#2a6b1a" />
      {/* Bottom curve */}
      <ellipse cx="30" cy="148" rx="18" ry="6" fill="#236016" />
      {/* Highlight */}
      <path d="M20 50 Q17 65 16 90" stroke="rgba(255,255,255,0.18)" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* Label */}
      <rect x="16" y="85" width="28" height="36" rx="3" fill="rgba(255,255,255,0.10)" />
      <line x1="22" y1="95" x2="38" y2="95" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      <line x1="22" y1="101" x2="38" y2="101" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      <line x1="22" y1="107" x2="38" y2="107" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      {/* Glass sheen */}
      {spinning && (
        <rect x="12" y="72" width="36" height="76" rx="8" fill="rgba(255,200,50,0.08)" />
      )}
    </svg>
  );
}

// ── PlayerLabel ────────────────────────────────────────────────────────────
const ANIM_NAMES = ["playerHover0", "playerHover1", "playerHover2", "playerHover3", "playerHover4"];
const ANIM_DURATIONS = [3.2, 4.1, 3.7, 4.5, 3.5, 3.9, 4.3, 3.3];
const ANIM_DELAYS = [0, -1.3, -2.1, -0.7, -3.0, -1.8, -0.4, -2.6];

function PlayerLabel({
  name,
  index,
  isSelected,
  sipCount,
}: {
  name: string;
  index: number;
  isSelected: boolean;
  sipCount: number;
}) {
  const animStyle: React.CSSProperties = {
    animation: `${ANIM_NAMES[index % ANIM_NAMES.length]} ${ANIM_DURATIONS[index % ANIM_DURATIONS.length]}s ease-in-out infinite ${ANIM_DELAYS[index % ANIM_DELAYS.length]}s`,
  };
  return (
    <div style={animStyle}>
      <div
        className={`
          px-3 py-1.5 rounded-xl text-sm font-bold text-center whitespace-nowrap shadow-lg
          transition-all duration-500
          ${isSelected
            ? "bg-amber-500 text-black scale-125 shadow-amber-500/60"
            : "bg-gray-800/80 text-white border border-gray-600/50 backdrop-blur-sm"
          }
        `}
      >
        {name}
        <span className="block text-xs font-normal opacity-70">{sipCount} 🍺</span>
      </div>
    </div>
  );
}

// ── Toggle ─────────────────────────────────────────────────────────────────
// Custom div-based toggle — avoids browser checkbox styling issues
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors duration-200 shrink-0 select-none ${
        value ? "bg-amber-500" : "bg-gray-600"
      }`}
    >
      <div
        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
          value ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </div>
  );
}

// ── NumInput — clearable number input ──────────────────────────────────────
function NumInput({
  value,
  onChange,
  onClear,
  min = 1,
  max = 999,
}: {
  value: string;
  onChange: (v: string) => void;
  onClear: () => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-gray-700/60 border border-gray-600/50 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-amber-500/60 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        onClick={onClear}
        className="px-2 py-1.5 rounded-lg bg-gray-700/60 border border-gray-600/50 text-gray-400 hover:text-white text-sm transition-colors"
      >
        ×
      </button>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
const PullonPyoritys = ({
  players,
  onBack,
}: {
  players: string[];
  onBack: () => void;
}) => {
  // ── Game state ────────────────────────────────────────────────────────────
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [sips, setSips] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [bottleRotation, setBottleRotation] = useState(0);
  const [previousDrinkers, setPreviousDrinkers] = useState<{ player: string; sips: number }[]>([]);
  const [sipCounter, setSipCounter] = useState<Record<string, number>>(
    players.reduce((acc, p) => ({ ...acc, [p]: 0 }), {})
  );
  const [showHistory, setShowHistory] = useState(false);

  // ── Settings panel ────────────────────────────────────────────────────────
  const [showSettings, setShowSettings] = useState(false);

  // Faktat
  const [factsEnabled, setFactsEnabled] = useState(true);
  const [factsInterval, setFactsInterval] = useState(30);

  // Autospin
  const [autospin, setAutospin] = useState(false);
  const autospinTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Varoitukset — string states so inputs can be cleared and re-typed
  const [warningsEnabled, setWarningsEnabled] = useState(false);
  const [warnStartAtStr, setWarnStartAtStr] = useState("20");
  const [warnEveryStr, setWarnEveryStr] = useState("10");
  const warnStartAt = Math.max(1, parseInt(warnStartAtStr) || 1);
  const warnEvery = Math.max(1, parseInt(warnEveryStr) || 1);

  // Refs for fresh values inside spinBottle's setTimeout callback
  const warningsEnabledRef = useRef(false);
  const warnStartAtRef = useRef(20);
  const warnEveryRef = useRef(10);
  const warnedLevelsRef = useRef<Record<string, number>>(
    players.reduce((acc, p) => ({ ...acc, [p]: 0 }), {} as Record<string, number>)
  );

  // Warning toast
  const [warningMsg, setWarningMsg] = useState<string | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Arena sizing ──────────────────────────────────────────────────────────
  const arenaRef = useRef<HTMLDivElement>(null);
  const [arenaSize, setArenaSize] = useState(300);

  useEffect(() => {
    const update = () => {
      if (arenaRef.current) {
        const w = arenaRef.current.offsetWidth;
        setArenaSize(Math.min(w, 420));
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // ── Keep warning refs in sync ──────────────────────────────────────────────
  useEffect(() => { warningsEnabledRef.current = warningsEnabled; }, [warningsEnabled]);
  useEffect(() => { warnStartAtRef.current = warnStartAt; }, [warnStartAt]);
  useEffect(() => { warnEveryRef.current = warnEvery; }, [warnEvery]);

  // ── Autospin loop via useEffect ───────────────────────────────────────────
  // Fires whenever spinning, autospin, or showSettings changes.
  // When a spin completes (spinning → false) and autospin is on and settings
  // are closed, schedule the next spin after 1000ms.
  useEffect(() => {
    if (!spinning && autospin && !showSettings) {
      autospinTimerRef.current = setTimeout(() => {
        spinBottle();
      }, 1000);
    }
    return () => {
      if (autospinTimerRef.current) {
        clearTimeout(autospinTimerRef.current);
        autospinTimerRef.current = null;
      }
    };
  // spinBottle is stable within the same render; deps cover all relevant state
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinning, autospin, showSettings]);

  const radius = arenaSize * 0.38;

  // ── Spin logic ────────────────────────────────────────────────────────────
  const spinBottle = () => {
    if (spinning || players.length === 0 || showSettings) return;
    setSpinning(true);
    setSips(null);

    // Pick a player different from previous if possible
    let newIndex: number;
    do {
      newIndex = Math.floor(Math.random() * players.length);
    } while (newIndex === selectedIndex && players.length > 1);

    const randomSips = Math.floor(Math.random() * 5) + 1;

    const targetAngle = (newIndex / players.length) * 360;
    const extraSpins = (3 + Math.floor(Math.random() * 3)) * 360;
    const newRotation = bottleRotation + extraSpins + (targetAngle - (bottleRotation % 360) + 360) % 360;

    setBottleRotation(newRotation);

    setTimeout(() => {
      setSelectedIndex(newIndex);
      setSips(randomSips);
      setPreviousDrinkers((prev) => [{ player: players[newIndex], sips: randomSips }, ...prev]);
      const newTotal = (sipCounter[players[newIndex]] || 0) + randomSips;
      setSipCounter((prev) => ({
        ...prev,
        [players[newIndex]]: (prev[players[newIndex]] || 0) + randomSips,
      }));
      setSpinning(false);

      // Sip warning check
      if (warningsEnabledRef.current && newTotal >= warnStartAtRef.current) {
        const startAt = warnStartAtRef.current;
        const every = warnEveryRef.current;
        let threshold = startAt;
        while (threshold + every <= newTotal) threshold += every;
        const prevWarned = warnedLevelsRef.current[players[newIndex]] ?? 0;
        if (threshold > prevWarned) {
          warnedLevelsRef.current[players[newIndex]] = threshold;
          if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
          setWarningMsg(`${players[newIndex]} on juonut ${newTotal} hörppyä tänä iltana! 🚨`);
          warningTimerRef.current = setTimeout(() => setWarningMsg(null), 4000);
        }
      }
    }, 2400);
  };

  const n = players.length;

  return (
    <div className="text-white flex flex-col items-center px-4 pt-6 pb-10 select-none">
      {/* Constrained column */}
      <div className="w-full max-w-md flex flex-col items-center">

        {/* Top bar */}
        <div className="w-full mb-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-gray-800/60 border border-gray-700/50 hover:bg-gray-700/60"
          >
            ← Takaisin
          </button>
          <button
            onClick={() => setShowSettings(v => !v)}
            className={`text-sm transition-colors px-3 py-1.5 rounded-lg bg-gray-800/60 border border-gray-700/50 hover:bg-gray-700/60 ${
              showSettings ? "text-amber-400 border-amber-700/50" : "text-gray-400 hover:text-white"
            }`}
          >
            ⚙
          </button>
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div className="w-full mb-4 bg-gray-800/60 border border-gray-700/50 rounded-xl p-4 space-y-4">

            {/* Faktat */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white">Faktat</span>
                <Toggle value={factsEnabled} onChange={setFactsEnabled} />
              </div>
              {factsEnabled && (
                <div className="space-y-1">
                  <input
                    type="range" min={15} max={120} step={5} value={factsInterval}
                    onChange={e => setFactsInterval(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                  <p className="text-xs text-gray-400 text-right">Faktat joka {factsInterval}s</p>
                </div>
              )}
            </div>

            <div className="h-px bg-gray-700/50" />

            {/* Autospin */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-white">Autospin</span>
                <p className="text-xs text-gray-500 mt-0.5">Pyörittää automaattisesti</p>
              </div>
              <Toggle value={autospin} onChange={setAutospin} />
            </div>

            <div className="h-px bg-gray-700/50" />

            {/* Varoitukset */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-sm font-semibold text-white">Varoitukset</span>
                  <p className="text-xs text-gray-500 mt-0.5">Hörppy-hälytys pelaajalle</p>
                </div>
                <Toggle value={warningsEnabled} onChange={setWarningsEnabled} />
              </div>
              {warningsEnabled && (
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Alkaen X hörpystä</label>
                    <NumInput
                      value={warnStartAtStr}
                      onChange={setWarnStartAtStr}
                      onClear={() => setWarnStartAtStr("")}
                      min={1} max={999}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Joka X hörppy</label>
                    <NumInput
                      value={warnEveryStr}
                      onChange={setWarnEveryStr}
                      onClear={() => setWarnEveryStr("")}
                      min={1} max={100}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Close / resume button */}
            <button
              onClick={() => setShowSettings(false)}
              className="w-full py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 text-sm font-semibold hover:bg-amber-500/30 active:scale-[0.98] transition-all"
            >
              Sulje ja jatka →
            </button>

          </div>
        )}

        {/* Arena — dimmed when settings are open */}
        <div className="relative w-full max-w-md">
          <div ref={arenaRef} className="w-full max-w-md">
            <div
              className="relative mx-auto"
              style={{ width: arenaSize, height: arenaSize }}
            >
              {/* Subtle ring */}
              <div
                className="absolute inset-0 rounded-full border border-gray-700/40"
                style={{ margin: arenaSize * 0.04 }}
              />
              <div
                className="absolute inset-0 rounded-full border border-gray-600/20"
                style={{ margin: arenaSize * 0.1 }}
              />

              {/* Player labels around the circle */}
              {players.map((p, i) => {
                const angleDeg = (i / n) * 360 - 90;
                const angleRad = (angleDeg * Math.PI) / 180;
                const cx = arenaSize / 2 + radius * Math.cos(angleRad);
                const cy = arenaSize / 2 + radius * Math.sin(angleRad);
                return (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      left: cx,
                      top: cy,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <PlayerLabel
                      name={p}
                      index={i}
                      isSelected={selectedIndex === i}
                      sipCount={sipCounter[p] ?? 0}
                    />
                  </div>
                );
              })}

              {/* Bottle in center */}
              <div
                className="absolute"
                style={{
                  left: "50%",
                  top: "50%",
                  width: 56,
                  height: 148,
                  marginLeft: -28,
                  marginTop: -74,
                  transform: `rotate(${bottleRotation}deg)`,
                  transition: spinning
                    ? "transform 2.4s cubic-bezier(0.15, 0.85, 0.35, 1.0)"
                    : "transform 0.2s ease-out",
                  transformOrigin: "50% 50%",
                }}
              >
                <BottleSVG spinning={spinning} />
              </div>
            </div>
          </div>

          {/* Pause overlay when settings are open */}
          {showSettings && (
            <div className="absolute inset-0 rounded-3xl bg-black/50 pointer-events-none" />
          )}
        </div>

        {/* Result announcement */}
        <div className="h-16 flex items-center justify-center my-2">
          {selectedIndex !== null && sips !== null && !spinning && (
            <div className="text-center animate-[fadeInUp_0.4s_ease-out]">
              <p className="text-2xl font-bold text-amber-400">
                {players[selectedIndex]}
              </p>
              <p className="text-gray-300">
                juo <span className="text-amber-300 font-bold text-xl">{sips}</span> hörppyä! 🍻
              </p>
            </div>
          )}
          {spinning && (
            <p className="text-gray-500 text-sm animate-pulse">Pyörittää...</p>
          )}
        </div>

        {/* Spin button */}
        <button
          onClick={spinBottle}
          disabled={spinning || autospin || showSettings}
          className={`
            px-10 py-4 rounded-2xl font-bold text-lg shadow-lg transition-all duration-200
            ${spinning || autospin || showSettings
              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
              : "bg-amber-500 hover:bg-amber-400 active:scale-95 text-black shadow-amber-500/30 hover:shadow-amber-400/50"
            }
          `}
        >
          {autospin ? "Autopilot päällä" : spinning ? "Pyörittää..." : "Pyöritä pulloa"}
        </button>

        {/* History toggle */}
        <div className="mt-5 w-full">
          <button
            onClick={() => setShowHistory((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-gray-800/50 border border-gray-700/40 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <span>Edelliset juojat</span>
            <span className="text-xs">{showHistory ? "▲" : "▼"} {previousDrinkers.length} kierrosta</span>
          </button>
          {showHistory && previousDrinkers.length > 0 && (
            <div className="mt-1 space-y-1 max-h-48 overflow-y-auto rounded-xl">
              {previousDrinkers.map((entry, i) => (
                <div
                  key={i}
                  className={`flex justify-between px-4 py-2 text-sm rounded-lg ${
                    i === 0 ? "bg-amber-900/40 border border-amber-700/30 text-white" : "bg-gray-800/40 text-gray-400"
                  }`}
                >
                  <span>{entry.player}</span>
                  <span>{entry.sips} hörppyä 🍻</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drinking fact toast */}
        <DrinkingFactToast config={{ enabled: factsEnabled, intervalRange: [factsInterval, factsInterval] }} />

        {/* Sip warning toast */}
        {warningMsg && (
          <div
            className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 w-[90vw] max-w-sm cursor-pointer"
            onClick={() => setWarningMsg(null)}
          >
            <div className="bg-red-900/90 backdrop-blur-md border border-red-500/50 rounded-2xl px-5 py-4 shadow-2xl">
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0 mt-0.5">🚨</span>
                <p className="text-white text-sm leading-snug">{warningMsg}</p>
              </div>
              <p className="text-red-400 text-xs text-center mt-2 opacity-60">Napauta sulkeaksesi</p>
            </div>
          </div>
        )}

      </div>{/* end constrained column */}
    </div>
  );
};

export default PullonPyoritys;
