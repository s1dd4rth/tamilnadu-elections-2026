# Tamil Nadu Elections 2026: Numerical Dashboard

A high-fidelity, interactive numerical atlas of the Tamil Nadu electoral
landscape — built around the **Special Intensive Revision (SIR)** of the
rolls in February 2026 and the **counting-day result on 4 May 2026**.

**Live application:** [https://tn-dashboard-app.vercel.app/](https://tn-dashboard-app.vercel.app/)

## The result

**TVK 108 · SPA 73 · NDA 53 · NTK 0** — a hung house with Vijay's debut
party as the largest bloc but 11 short of the 118 majority. The
dashboard's pre-poll thesis — that the SIR cleansing of 74 lakh names
would shape the result — closed cleanly: in ACs with the heaviest
SIR-strike, TVK won 77% of seats; in the lightest, 26%.

## Routes

- **`/`** — Headline narrative. SIR roll → who voted → vote-to-seat
  conversion → margins → MLA profile → women MLAs → pre-poll
  electoral-roll & ballot context.
- **`/analysis`** — Counting-day timeline scrubber + 2021-baseline
  hemicycle/hex map for before-and-after comparison.
- **`/others`** — Holding pen for analytical sections (FlipMatrix,
  SIRSwingChart, NonVoterStory, MarqueeRounds, NonVoterAnalysis) while
  the post-result information architecture is being decided. `noindex`.

## Headline findings

- **The SIR effect is real and gradient.** ACs sorted by SIR-strike %
  show TVK winning 26% in the lightest quintile, 77% in the heaviest.
- **The DMK + AIADMK combined vote dropped ~25pp** (71% → 45%) from
  2021. TVK's debut 35% almost exactly fills that gap.
- **NTK shrank** from 6.46% (2021, ECI Statistical Report) to 4.00%,
  still zero seats.
- **Tiruppattur (AC 185) was decided by a single vote** — the
  closest seat in 2026, declared at 02:00 IST after counting day.
- **Apathy still outweighs the result** in 197 of 234 seats: even
  after the SIR shrank rolls and turnout grew 12.5pp, the no-show
  pool exceeds the winning margin in 84% of ACs.

## Features

- **Counting-day replay** — 231 ECI snapshots captured every ~120s
  from 09:36 IST to 02:00 IST on counting day; replayable via a
  scrubber on `/analysis`.
- **Per-AC margin atlas** — winner, runner-up, margin, rounds counted
  for all 234 ACs.
- **Per-AC full ballot** — every candidate's EVM + postal + total
  vote share, scraped from ECI per-constituency pages.
- **MLA roster cross-referenced with affidavits** — crorepati,
  criminal cases, age, education by bloc.
- **District-level electorate, turnout, and SIR-strike maps** —
  district choropleth with hover detail.
- **AC hex tile map** — equal-area constituency visualisation
  adapted from baskicanvas/tamilnadu-assembly-constituency-maps.

## Technical stack

- **Framework**: [Next.js 16+](https://nextjs.org/) App Router.
- **Styling**: vanilla CSS with centralized design tokens
  (newspaper-editorial aesthetic: serif Fraunces + mono IBM Plex).
- **Charts**: hand-rolled SVG, no charting library.
- **Data layer**: 20 JSON files in `src/data/`, all static at build
  time; pages are statically pre-rendered.
- **Live data ingestion**: Python scripts in the parent directory
  (`fetch_eci_snapshot.py`, `fetch_margin_atlas.py`, etc.) shell out
  to `curl` because ECI sits behind Akamai and rejects Python's TLS
  fingerprint. Snapshots are auto-committed to git, which triggers a
  Vercel rebuild — so the live site advances in lockstep with the
  data.
- **Analytics**: Vercel Web Analytics + Speed Insights.

## Getting Started

```bash
npm install
npm run dev   # http://localhost:3000
```

## Source & Credits

- Pre-poll data sourced from the **Chief Electoral Officer (CEO),
  Tamil Nadu** Final Roll 2026.
- 2026 results scraped live from the **Election Commission of
  India** (`results.eci.gov.in`).
- 2021 baselines from **TCPD / OpenCity** and the **ECI Statistical
  Report 2021**.
- Candidate affidavits via **MyNeta / Association for Democratic
  Reforms (ADR)**.
- District map base derived from Wikimedia Commons (CC-BY-SA 3.0)
  by Planemad / Nichalp.
- AC hex-tile layout adapted from
  [baskicanvas/tamilnadu-assembly-constituency-maps](https://github.com/baskicanvas/tamilnadu-assembly-constituency-maps).

---

*Compiled and engineered by Siddarth Kengadaran.*
