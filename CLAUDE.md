# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server with Turbopack
npm run build    # Production build
npm run lint     # ESLint check
```

No test suite is configured.

## Architecture

**Juoma** is a client-side-only Finnish drinking game app (Next.js 15, React 19, Tailwind CSS). There is no backend, no database, and no persistent state — all game state lives in React component memory.

### Routing — mixed Pages + App Router

The project uses **both** Next.js routers simultaneously:
- `src/pages/` — active Pages Router (`_app.tsx`, `index.tsx`, `play.tsx`, `learn.tsx`, `support.tsx`)
- `src/app/` — App Router used only for the root layout and theme provider

All real page navigation goes through the Pages Router. The App Router layout wraps it via `ThemeProvider`.

### Game system

Games live in `src/components/games/`. Each game component receives `{ players: string[], onBack: () => void }` and is responsible for its own gameplay logic. The host page `src/pages/play.tsx` manages a three-phase UI: player list building → game selection → game render.

**Implementation status:**
- `Viinapiru.tsx` — fully implemented (song playback + random starter picker)
- `PullonPyoritys.tsx` — fully implemented (bottle spin, history tracking, sip counter)
- `Placeholder.tsx` — partial (random task + sip assignment from task pool, no win condition)
- `Malte.tsx`, `Hitler.tsx` — stubs only

New games should follow the same component contract and be wired into the `selectedGame` switch in `play.tsx`.

### Game content

`src/data/tasks.ts` exports `extraTasks`: 245 Finnish-language drinking challenges used by `Placeholder.tsx`.

### Theming

`src/app/theme/ThemeContext.tsx` manages dark/light mode via a `data-theme` attribute on `<html>`, persisted to `localStorage`. CSS custom properties (`--background`, `--foreground`, etc.) are defined in `src/app/globals.css` and respond to the theme attribute. Tailwind dark mode strategy is `"class"`.

### i18n

`i18next` is installed and configured with locale files in `public/locale/` (Finnish, English, Spanish), but **no component currently uses translations** — all UI text is hardcoded in Finnish. The infrastructure exists if translations are ever wired up.

### Audio

MP3 files for Viinapiru are in `public/audio/` (song1–4.mp3), referenced directly via `<audio>` elements in `Viinapiru.tsx`.

### Path alias

`@/*` maps to `src/*` (configured in `tsconfig.json`).
