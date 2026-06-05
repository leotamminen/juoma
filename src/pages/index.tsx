"use client";

import { useState } from "react";
import "../app/globals.css";
import Viinapiru from "@/components/games/Viinapiru";
import Malte from "@/components/games/Malte";
import Hitler from "@/components/games/Hitler";
import PullonPyoritys from "@/components/games/PullonPyoritys";
import Placeholder from "@/components/games/Placeholder";
import AnnaClaudenPaattaa from "@/components/games/AnnaClaudenPaattaa";

const GAMES = [
  {
    id: "Piiskapeli",
    label: "Piiskapeli",
    emoji: "🎵",
    desc: "Laululotta + aloittajan arpa",
    component: Viinapiru,
  },
  {
    id: "Malte",
    label: "Malte",
    emoji: "🃏",
    desc: "Arvaa korttisi – anna tai ota",
    component: Malte,
  },
  {
    id: "Hitler",
    label: "Hitler",
    emoji: "🍺",
    desc: "Klassinen korttijuomapeli",
    component: Hitler,
  },
  {
    id: "PullonPyoritys",
    label: "Pullon Pyöritys",
    emoji: "🍾",
    desc: "Pyöritä pulloa, juo tulokset",
    component: PullonPyoritys,
  },
  {
    id: "Juomakortit",
    label: "Juomakortit",
    emoji: "🎯",
    desc: "Satunnaiset juomatehtävät",
    component: Placeholder,
  },
  {
    id: "AnnaClaudenPaattaa",
    label: "Anna Claudenin päättää",
    emoji: "🤖",
    desc: "Claude Code juomapelinä",
    component: AnnaClaudenPaattaa,
  },
];

export default function Home() {
  const [players, setPlayers] = useState<string[]>([]);
  const [newPlayer, setNewPlayer] = useState("");
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const addPlayer = () => {
    if (!newPlayer.trim()) return;
    setPlayers(p => [...p, newPlayer.trim()]);
    setNewPlayer("");
  };

  const removePlayer = (i: number) => setPlayers(p => p.filter((_, idx) => idx !== i));

  const canPlay = players.length >= 2;

  if (selectedGame) {
    const game = GAMES.find(g => g.id === selectedGame);
    if (game) {
      const GameComp = game.component;
      return <GameComp players={players} onBack={() => setSelectedGame(null)} />;
    }
  }

  return (
    <div className="min-h-screen text-white px-4 py-8 max-w-md mx-auto">

      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-black tracking-tight mb-1">🍺 Juoma</h1>
        <p className="text-gray-400 text-sm">Lisää pelaajat, valitse peli.</p>
      </div>

      {/* Player input */}
      <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-4 mb-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">
          Lisää pelaajia
        </h2>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newPlayer}
            onChange={e => setNewPlayer(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addPlayer()}
            placeholder="Pelaajan nimi"
            className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-gray-500 text-base outline-none focus:ring-2 focus:ring-amber-500/60"
          />
          <button
            onClick={addPlayer}
            className="px-5 py-3 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black font-bold rounded-xl text-xl transition-colors"
          >
            +
          </button>
        </div>

        {players.length > 0 && (
          <ul className="space-y-1.5">
            {players.map((p, i) => (
              <li
                key={i}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/5 border border-white/5"
              >
                <span className="font-medium text-sm">{p}</span>
                <button
                  onClick={() => removePlayer(i)}
                  className="text-gray-500 hover:text-red-400 text-lg leading-none transition-colors"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}

        {players.length === 1 && (
          <p className="text-xs text-amber-400/70 text-center mt-2">
            Lisää vielä yksi pelaaja aloittaaksesi
          </p>
        )}
      </div>

      {/* Game grid */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">
          {canPlay ? "Valitse peli" : "Pelit"}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {GAMES.map((game, i) => (
            <button
              key={game.id}
              onClick={() => canPlay && setSelectedGame(game.id)}
              className={[
                `float-${i}`,
                "relative rounded-2xl p-4 text-left border transition-all duration-300",
                canPlay
                  ? "bg-black/40 border-white/15 hover:border-amber-400/50 hover:bg-black/60 hover:scale-[1.03] cursor-pointer active:scale-[0.98]"
                  : "bg-black/20 border-white/5 opacity-40 cursor-default pointer-events-none",
              ].join(" ")}
            >
              <div className="text-3xl mb-2">{game.emoji}</div>
              <p className="font-bold text-sm text-white leading-tight">{game.label}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-snug">{game.desc}</p>

              {/* Subtle inner glow when active */}
              {canPlay && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
              )}
            </button>
          ))}
        </div>

        {!canPlay && (
          <p className="text-center text-gray-600 text-xs mt-4">
            Lisää vähintään 2 pelaajaa pelataksesi
          </p>
        )}
      </div>
    </div>
  );
}
