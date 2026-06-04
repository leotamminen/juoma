# CLAUDE.md

> **Default behavior:** After every session, update the `## Session Handoff` section with current progress, decisions made, key variables, and next steps.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server with Turbopack
npm run build    # Production build
npm run lint     # ESLint check
```

No test suite is configured.

## Architecture

**Juoma** is a client-side-only Finnish drinking game app (Next.js 16, React 19, Tailwind CSS). There is no backend, no database, and no persistent state — all game state lives in React component memory.

### Routing — mixed Pages + App Router

The project uses **both** Next.js routers simultaneously:
- `src/pages/` — active Pages Router (`_app.tsx`, `index.tsx`, `play.tsx`, `learn.tsx`, `support.tsx`)
- `src/app/` — App Router used only for the root layout and theme provider

All real page navigation goes through the Pages Router. The App Router layout wraps it via `ThemeProvider`. **`src/pages/index.tsx` is now the primary entry point** — it handles player setup, game selection, and inline game rendering. `/play` still exists but is no longer the main flow.

### Game system

Games live in `src/components/games/`. Each game component receives `{ players: string[], onBack: () => void }` and is responsible for its own gameplay logic. Games are wired into `src/pages/index.tsx` via the `GAMES` array.

**Implementation status:**
- `Viinapiru.tsx` — fully implemented (song playback + random starter picker)
- `PullonPyoritys.tsx` — fully implemented (bottle spin, history tracking, sip counter)
- `Placeholder.tsx` — partial (random task + sip assignment from task pool, no win condition)
- `Malte.tsx` — fully implemented (see Malte section below)
- `Hitler.tsx` — fully implemented (see Hitler section below)

### Game content

`src/data/tasks.ts` exports `extraTasks`: 245 Finnish-language drinking challenges used by `Placeholder.tsx`.

### Theming

Dark mode is the **default** (localStorage falls back to dark, not light). `src/app/theme/ThemeContext.tsx` manages dark/light mode via a `data-theme` attribute on `<html>`. CSS custom properties (`--background`, `--foreground`, etc.) are in `src/app/globals.css`. Tailwind dark mode strategy is `"class"`.

### Animated background

`src/components/AnimatedBackground.tsx` renders a fixed-position layer of floating amber spark particles (Web Audio API CSS keyframe animations). The body always has an animated dark gradient (`-45deg`, navy/purple/dark blue tones, 20s cycle). This is mounted in `src/layouts/MainLayout.tsx`. Game component outer containers are **transparent** (no `bg-gray-900`) so the gradient shows through; individual cards use `bg-gray-800`.

### Audio

- Viinapiru: MP3 files in `public/audio/` (song1–4.mp3), `<audio>` elements
- Malte: Web Audio API via `src/components/games/malteSounds.ts` — no external files

### Path alias

`@/*` maps to `src/*` (configured in `tsconfig.json`).

---

## Malte — Full Feature Reference

`src/components/games/Malte.tsx` — 4-round card prediction game with bussi endgame.

### Settings (configurable before starting)
| Setting | Default | Notes |
|---|---|---|
| `sipsPerRound` | `[1,2,3,4]` | Sips awarded per round |
| `endgameScaling` | `"default"` | Bussi sip scaling: default (+2/card), double, custom |
| `customStart` | `2` | Starting value for custom bussi scaling |
| `extraRounds` | `true` | Extra rounds for small groups |
| `toastTimer.enabled` | `true` | Auto-dismiss penalty toast |
| `toastTimer.seconds` | `5` | 1–10s slider |
| `sipCounter.enabled` | `true` | Track and display sips per player |
| `sipCounter.startAt` | `20` | First sip-warning threshold |
| `sipCounter.every` | `10` | Repeat warning every N sips after startAt |
| `sounds.enabled` | `true` | Web Audio API sounds |
| `sounds.pack` | `"normal"` | `"normal"` / `"funny"` / `"intense"` |

### Sound packs (`malteSounds.ts`)
- **Normaali**: 3 liquid glugs on drink; soft double-chime on sip warning; 95 BPM kick/snare loop in bussi
- **Hassu**: cartoon pitch-swoosh on drink; wah-wah-wah on warning; 118 BPM syncopated loop
- **Intensiivi**: distorted bass chug on drink; triple air horn on warning; 145 BPM double-kick loop

### Sip counter (Hörppy-laskuri)
- Shown at the bottom of rounds phase and bussi phase
- Warnings fire at `startAt`, `startAt + every`, `startAt + 2*every`, …
- Warning popup is queued behind the current drink toast (appears after toast clears)

### Round 1 guessing rule
- Max 2 guesses. First wrong → show hint (pienempi/suurempi). Second wrong → turn ends automatically (no give-up button).

### Summary (Yhteenveto)
- Players ranked by total sips with 🥇🥈🥉 medals
- Winner row highlighted in amber
- Cards held shown below ranking

---

## Hitler — Full Feature Reference

`src/components/games/Hitler.tsx` — classic Finnish card drinking game.

### Packages
Currently one package: **Perus** (default). Infrastructure exists for multiple packages (add to `PACKAGES` array in the file).

### Card effects (Perus package)
| Card | Effect |
|---|---|
| A | Vesiputous — waterfall |
| 2 | Anna 2 — give 2 sips (splittable) |
| 3 | Ota 3 — take 3 sips |
| 4–5 | Hitler! — last to shout drinks 3 |
| 6 | 1-2-3 — player 1 drinks 1, next 2, etc. |
| 7 | Kategoria — category game, loser drinks 3 |
| 8 | Sääntö — create/remove a rule (held card) |
| 9 | Kysymysmestari — QM badge (held), answering costs 3 |
| 10 | Tarina — story game, loser drinks 3 |
| 11 | Pausekortti — held card, use for a break, pass on |
| 12 | Huora — assign a drinking companion |
| 13 | Kuningashörppy — everyone drinks 3 |

### Persistent game state
Active rules, question master, queen links, and pause card holder are all tracked and shown in a status bar during play. Rule-break and QM-penalty buttons are in the bar.

---

## Session Handoff

**Session date:** 2026-06-04

### What was built this session

1. **Malte.tsx — full implementation** (previous session's work was the stub)
   - 4-round card prediction game + bussi (endgame) + summary
   - Round 1: max 2 guesses, hint after first wrong, auto-end on second wrong
   - Give sips: splittable sip assignment UI with +/− per player

2. **Hitler.tsx — full implementation**
   - All 13 card effects with interactive UIs
   - Held cards tracked: rules, QM badge, queen links, pause card
   - Status bar always visible showing active rules (with penalty button), QM, queens, pause holder

3. **UI redesign**
   - `src/pages/index.tsx` rewritten: combined player input + game selection in one page, replaces the old welcome screen + `/play` flow
   - Animated gradient body background (dark navy/purple, 20s loop) via CSS keyframes
   - `src/components/AnimatedBackground.tsx`: 30 amber sparks floating upward
   - Game cards on landing: per-card float animations, dimmed/non-interactive until 2+ players
   - Navbar/footer: glass-morphism (`bg-black/40 backdrop-blur-md`)
   - Dark mode default
   - Game outer containers made transparent so gradient shows through

4. **Malte — toast timer**
   - Auto-dismiss after configurable seconds (default 5s), shrinking progress bar
   - Toggle in settings

5. **Malte — Hörppy-laskuri (sip counter)**
   - Per-player running total, shown in rounds and bussi phases
   - Threshold pop-up: default first at 20, then every 10
   - Queued behind current toast

6. **Malte — sounds** (`malteSounds.ts`)
   - Web Audio API, no external audio files
   - Three packs: Normaali, Hassu, Intensiivi
   - Bus mode loops rhythmic music matching the pack tempo
   - Toggle + pack selector in settings

7. **Malte — summary ranking**
   - Players sorted by total sips, 🥇🥈🥉 medals, winner highlighted

8. **Navbar fix**: "Pelaa" now links to `/` instead of `/play`

### Key decisions made
- **No `/play` as primary flow** — `index.tsx` handles everything; `/play` still exists but unused by nav
- **Web Audio API for sounds** — no external MP3s needed, works offline
- **Sip warning queued** — doesn't interrupt current toast, appears after auto-dismiss
- **Round 1 max 2 guesses** — deliberate game rule: no infinite hint loop, no give-up button
- **Gradient always dark** — body background is always the dark animated gradient regardless of light/dark toggle (toggle only affects text/UI colors)
- **Game containers transparent** — `min-h-screen text-white` only, no `bg-gray-900`, so animated bg shows through

### Key files changed this session
- `src/pages/index.tsx` — full rewrite
- `src/components/games/Malte.tsx` — full implementation + timer, counter, sounds, ranking
- `src/components/games/Hitler.tsx` — full implementation
- `src/components/games/malteSounds.ts` — new, Web Audio engine
- `src/components/AnimatedBackground.tsx` — new, spark particles
- `src/layouts/MainLayout.tsx` — glass header/footer, AnimatedBackground
- `src/app/globals.css` — gradient keyframes, spark/float animations, transparent general-container
- `src/app/theme/ThemeContext.tsx` — default to dark mode
- `src/components/Navbar.tsx` — Pelaa → `/`

### Current git state
Branch: `master`, clean, pushed. Last commit: `525b499`.

### Next steps / open items
- **Hitler sounds** — Hitler has no sound effects yet; could add the same sound system as Malte
- **Hitler sip counter** — no Hörppy-laskuri in Hitler yet
- **Multiple packages for Hitler** — infrastructure exists (`PACKAGES` array), just needs new `Package` objects defined
- **Placeholder game** — still partial, no win condition; could be fleshed out or replaced
- **Viinapiru / PullonPyoritys** — use `.general-container` CSS class; their outer bg is now transparent via CSS but their inner elements may need visual polish to match the new dark aesthetic
- **`/play` page** — still exists with the old UI; either redirect it to `/` or remove it
- **i18n** — translation infrastructure exists but nothing is wired up
