"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { drinkingFacts } from "@/data/drinkingFacts";

export interface FactBoxConfig {
  enabled?: boolean;
  intervalRange?: [number, number]; // [min, max] seconds between appearances
  displaySeconds?: number;
}

const DEFAULT_CONFIG: Required<FactBoxConfig> = {
  enabled: true,
  intervalRange: [30, 60],
  displaySeconds: 20,
};

interface Props {
  config?: FactBoxConfig;
}

export function DrinkingFactToast({ config }: Props) {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const [fact, setFact] = useState<string | null>(null);
  const [progress, setProgress] = useState(0); // 0–100, drives shrinking bar
  const scheduleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const usedIndexes = useRef<Set<number>>(new Set());

  const dismiss = useCallback(() => {
    setFact(null);
    setProgress(0);
    if (progressRef.current) clearInterval(progressRef.current);
  }, []);

  const showFact = useCallback(() => {
    let idx = Math.floor(Math.random() * drinkingFacts.length);
    // avoid repeating recent facts until all are exhausted
    if (usedIndexes.current.size >= drinkingFacts.length) usedIndexes.current.clear();
    let attempts = 0;
    while (usedIndexes.current.has(idx) && attempts < 20) {
      idx = Math.floor(Math.random() * drinkingFacts.length);
      attempts++;
    }
    usedIndexes.current.add(idx);
    setFact(drinkingFacts[idx]);
    setProgress(0);

    const totalMs = cfg.displaySeconds * 1000;
    const tickMs = 100;
    let elapsed = 0;
    progressRef.current = setInterval(() => {
      elapsed += tickMs;
      const pct = Math.min((elapsed / totalMs) * 100, 100);
      setProgress(pct);
      if (elapsed >= totalMs) {
        clearInterval(progressRef.current!);
        setFact(null);
        setProgress(0);
      }
    }, tickMs);
  }, [cfg.displaySeconds]);

  const scheduleNext = useCallback(() => {
    if (scheduleRef.current) clearTimeout(scheduleRef.current);
    const [min, max] = cfg.intervalRange;
    const delay = (min + Math.random() * (max - min)) * 1000;
    scheduleRef.current = setTimeout(() => {
      showFact();
    }, delay);
  }, [cfg.intervalRange, showFact]);

  useEffect(() => {
    if (!cfg.enabled) return;
    scheduleNext();
    return () => {
      if (scheduleRef.current) clearTimeout(scheduleRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [cfg.enabled, scheduleNext]);

  // After a fact is dismissed, schedule the next one
  useEffect(() => {
    if (fact === null && cfg.enabled) {
      scheduleNext();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fact]);

  if (!fact) return null;

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[90vw] max-w-sm cursor-pointer"
      onClick={dismiss}
    >
      <div className="bg-amber-900/90 backdrop-blur-md border border-amber-500/50 rounded-2xl px-5 py-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <span className="text-2xl shrink-0 mt-0.5">💡</span>
          <div className="min-w-0">
            <p className="text-amber-300 font-bold text-xs uppercase tracking-widest mb-1">Tiesitkö?</p>
            <p className="text-white text-sm leading-snug">{fact}</p>
          </div>
        </div>
        <div className="mt-3 h-1 bg-amber-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-400 rounded-full"
            style={{ width: `${100 - progress}%`, transition: "width 100ms linear" }}
          />
        </div>
        <p className="text-amber-500 text-xs text-center mt-1.5 opacity-60">Napauta sulkeaksesi</p>
      </div>
    </div>
  );
}
