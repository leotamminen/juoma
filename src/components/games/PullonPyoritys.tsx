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

// ── Main component ─────────────────────────────────────────────────────────
const PullonPyoritys = ({
  players,
  onBack,
}: {
  players: string[];
  onBack: () => void;
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [sips, setSips] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [bottleRotation, setBottleRotation] = useState(0);
  const [previousDrinkers, setPreviousDrinkers] = useState<{ player: string; sips: number }[]>([]);
  const [sipCounter, setSipCounter] = useState<Record<string, number>>(
    players.reduce((acc, p) => ({ ...acc, [p]: 0 }), {})
  );
  const [showHistory, setShowHistory] = useState(false);

  // Circle sizing via JS so it works with dynamic player count
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

  const radius = arenaSize * 0.38;

  const spinBottle = () => {
    if (spinning || players.length === 0) return;
    setSpinning(true);
    setSips(null);

    // Pick a player different from previous if possible
    let newIndex: number;
    do {
      newIndex = Math.floor(Math.random() * players.length);
    } while (newIndex === selectedIndex && players.length > 1);

    const randomSips = Math.floor(Math.random() * 5) + 1;

    // Each player is at angle: (i / n) * 360 - 90 degrees (0 = top)
    // Bottle default orientation: pointing up (0 deg = up)
    const targetAngle = (newIndex / players.length) * 360;
    const extraSpins = (3 + Math.floor(Math.random() * 3)) * 360;
    const newRotation = bottleRotation + extraSpins + (targetAngle - (bottleRotation % 360) + 360) % 360;

    setBottleRotation(newRotation);

    setTimeout(() => {
      setSelectedIndex(newIndex);
      setSips(randomSips);
      setPreviousDrinkers((prev) => [{ player: players[newIndex], sips: randomSips }, ...prev]);
      setSipCounter((prev) => ({
        ...prev,
        [players[newIndex]]: (prev[players[newIndex]] || 0) + randomSips,
      }));
      setSpinning(false);
    }, 2400);
  };

  const n = players.length;

  return (
    <div className="min-h-screen text-white flex flex-col items-center px-4 pt-6 pb-24 select-none">
      {/* Arena */}
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
        disabled={spinning}
        className={`
          px-10 py-4 rounded-2xl font-bold text-lg shadow-lg transition-all duration-200
          ${spinning
            ? "bg-gray-700 text-gray-500 cursor-not-allowed"
            : "bg-amber-500 hover:bg-amber-400 active:scale-95 text-black shadow-amber-500/30 hover:shadow-amber-400/50"
          }
        `}
      >
        {spinning ? "Pyörittää..." : "Pyöritä pulloa"}
      </button>

      {/* History toggle */}
      <div className="mt-5 w-full max-w-md">
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
                className={`flex justify-between px-4 py-2 text-sm rounded-lg ${i === 0 ? "bg-amber-900/40 border border-amber-700/30 text-white" : "bg-gray-800/40 text-gray-400"}`}
              >
                <span>{entry.player}</span>
                <span>{entry.sips} hörppyä 🍻</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Back button */}
      <button
        onClick={onBack}
        className="mt-8 px-6 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-sm transition-colors border border-gray-700"
      >
        ← Takaisin pelivalintaan
      </button>

      {/* Drinking fact infobox */}
      <DrinkingFactToast />
    </div>
  );
};

export default PullonPyoritys;
