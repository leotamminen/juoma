"use client";
import { useMemo } from "react";

export default function AnimatedBackground() {
  const sparks = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 1 + Math.random() * 2.5,
      delay: Math.random() * 12,
      duration: 6 + Math.random() * 9,
    })),
  []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {sparks.map(s => (
        <span
          key={s.id}
          className="spark absolute rounded-full"
          style={{
            left: `${s.left}%`,
            bottom: 0,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
