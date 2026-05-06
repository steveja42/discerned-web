# Discerned — Companion Web App

A read-only companion surface for the [Discerned](https://discerned.online) Chrome extension. Browse the public Discernments feed on Nostr, explore your private Library, and learn about the project.

**Clipping happens only in the extension.** This web app does not create clips.

---

## Routes

| Route | Purpose |
|---|---|
| `/` | Public Discernments feed — live `kind:1` Nostr events tagged `#discerned` |
| `/about` | Brand page — HeroBeacon SVG, philosophy copy |
| `/library` | Private Library — delivered from the extension via postMessage bridge |

---

## Stack

- **Next.js 16.2** — App Router, TypeScript strict, Turbopack
- **React 19**
- **nostr-tools 2.x** — Nostr relay subscriptions, NIP-07 auth, keypair generation
- **pnpm**

No CSS framework. All styling is plain CSS custom properties in `app/globals.css` (Editorial theme — warm cream paper, Discerned blue accent).

---

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
pnpm build          # production build
pnpm exec tsc --noEmit  # type-check
```

---

## Project structure

```
app/
  globals.css          # design tokens + all component styles
  layout.tsx           # root layout — body.style-editorial
  page.tsx             # home / Discernments feed
  about/               # About page
  library/             # Library (extension bridge)
components/
  brand/               # MiniBeacon, HeroBeacon SVGs
  chrome/              # TopBar
  feed/                # CastFeed, ClipRow, DetailPanel, FilterStrip
  glyph/               # GlyphBars, GlyphRadial, GlyphLetter
  auth/                # SignInModal (NIP-07 / nsec / generate), AuthAvatar
  popover/             # FirstVisitPopover
  clips/               # Library, LibraryEmpty
lib/
  types.ts             # ClipData, Capture, Evaluation, AuthState
  constants.ts         # dimension levels, categories, default relays
  nostr/               # feed subscription, event parsing, auth helpers
  bridge/              # extension postMessage listener
hooks/
  useCastFeed.ts       # live Nostr feed with mock seed data
  useNostrAuth.ts      # NIP-07 / readonly / guest auth state
  useFirstVisit.ts     # localStorage["discerned.seenHero"] flag
  useLibraryBridge.ts      # extension bridge for /library with 2s timeout
```

See [FILES.md](FILES.md) for a full annotated file manifest.

---

## Nostr sign-in

Three methods, all client-side:

1. **NIP-07 browser extension** (featured) — calls `window.nostr.getPublicKey()`
2. **Paste nsec** — decoded and used in session memory only, never persisted
3. **Generate new identity** — keypair generated in-browser; user backs up the nsec

Pubkey is stored in `localStorage["discerned.auth"]`.

---

## Extension bridge

When the Discerned extension is installed, its content script runs on `discerned.online/*` and posts clips + auth state to the page via `postMessage`. The web app listens via `lib/bridge/extension-bridge.ts` and announces readiness with `DISCERNED_WEB_READY`. If no bridge message arrives within 2 seconds, `/library` shows the install prompt. When the bridge is detected, a "My Library" link with a blue indicator dot appears in the TopBar.

---

## Design reference

The original HTML/JSX prototype lives at:

```
C:\Users\steve\Downloads\discerned web design\design_handoff_discerned\
```

Match that design for any UI changes. The `MiniBeacon` and `HeroBeacon` SVGs are hand-authored and load-bearing for brand identity — do not replace them.

---

## Sovereignty principles

- No backend, no server-side data storage
- No analytics, no telemetry
- All relay connections use WSS only
- Nostr content is sanitized before rendering
- The extension bridge is origin-pinned on both sides
