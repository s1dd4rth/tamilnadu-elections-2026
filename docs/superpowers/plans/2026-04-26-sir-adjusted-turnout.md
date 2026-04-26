# SIR-Adjusted Turnout Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `SIRAdjustedTurnout` section to the TN 2026 dashboard home page that decomposes the +12 pp turnout headline into a state-level mechanical lift, an AC-level "phantom drops" table, and an additions-math callout.

**Architecture:** Single new client component (`src/components/SIRAdjustedTurnout.tsx`) with all aggregates computed once at module scope from `analysis.json` + `state.json`. No new data files, no new dependencies, no theme changes. Mirrors the structure and chrome of `NonVoterAnalysis.tsx`. One edit to `src/app/page.tsx` to mount it between `ACTurnoutMap` and `SIRFlow`.

**Tech Stack:** Next.js 16 App Router, TypeScript, React, vanilla CSS-in-JS via `style={{}}`, existing `useIsMobile` hook from `@/hooks/useMediaQuery`, Fraunces serif + IBM Plex Mono via `@/styles/theme`.

**Reference spec:** `docs/superpowers/specs/2026-04-26-sir-adjusted-turnout-design.md`

**Verification approach:** This repo has no automated tests for any UI component. Each task ends with a manual browser check at `http://localhost:3000` (dev server already running) before commit. The visual diff between consecutive commits is the regression signal.

---

## Task 1: Component scaffold with module-scope math, section title, intro paragraph

**Files:**
- Create: `src/components/SIRAdjustedTurnout.tsx`

- [ ] **Step 1: Create the component file with imports, math, title, intro**

Write `src/components/SIRAdjustedTurnout.tsx`:

```tsx
"use client";

import React from "react";
import { SERIF, MONO, COLORS } from "@/styles/theme";
import { SmallCaps, SectionTitle } from "./common";
import analysisData from "@/data/analysis.json";
import stateData from "@/data/state.json";
import { useIsMobile } from "@/hooks/useMediaQuery";

// ─── Module-scope math ──────────────────────────────────────────
// Numerator math is computed from analysis.json only — never paraphrased
// from state.json or turnout.json snapshots (which are different reports).

const acs = analysisData.acs;

const roll2021 = acs.reduce((s, a) => s + a.elec2021, 0);
const roll2026 = acs.reduce((s, a) => s + a.elec2026, 0);
const votes2021 = acs.reduce((s, a) => s + (a.elec2021 - a.nonVoters2021), 0);
const votes2026 = acs.reduce((s, a) => s + (a.elec2026 - a.nonVoters2026), 0);

const vtr2021 = (votes2021 / roll2021) * 100;
const vtrHeadline = (votes2026 / roll2026) * 100;
const vtrComparable = (votes2026 / roll2021) * 100;

const liftHeadline = vtrHeadline - vtr2021;
const liftComparable = vtrComparable - vtr2021;
const voteIncrease = votes2026 - votes2021;
const voteIncreasePct = (voteIncrease / votes2021) * 100;

const sirAdditions = stateData.totalDeletions - stateData.netReduction;
const additionsRatioPct = (sirAdditions / voteIncrease) * 100;

type ACRow = (typeof acs)[number];

const phantomDrops: Array<ACRow & { v21: number; v26: number; drop: number }> =
  acs
    .map((a) => {
      const v21 = a.elec2021 - a.nonVoters2021;
      const v26 = a.elec2026 - a.nonVoters2026;
      return { ...a, v21, v26, drop: v21 - v26 };
    })
    .filter((a) => a.drop > 0)
    .sort((a, b) => b.drop - a.drop);

const chennaiPhantomCount = phantomDrops.filter(
  (a) => a.district === "Chennai"
).length;

// ─── Formatters ─────────────────────────────────────────────────
const fmt = (n: number) => Math.round(n).toLocaleString("en-IN");
const lakh = (n: number) => (n / 100000).toFixed(2) + " lakh";
const crore = (n: number) => (n / 10000000).toFixed(2) + " cr";
const pp = (n: number) =>
  (n >= 0 ? "+" : "−") + Math.abs(n).toFixed(2) + " pp";
const pct = (n: number) => n.toFixed(2) + "%";

// ─── Component ──────────────────────────────────────────────────

export const SIRAdjustedTurnout = () => {
  const isMobile = useIsMobile();

  return (
    <section style={{ margin: "48px 0" }}>
      <SectionTitle kicker="The Arithmetic of a Surge">
        A turnout headline, decomposed.
      </SectionTitle>

      <p
        style={{
          fontFamily: SERIF,
          fontSize: "17px",
          lineHeight: 1.65,
          color: "#3a302a",
          maxWidth: "760px",
          margin: "0 0 32px",
        }}
      >
        The Election Commission's headline is <strong>{pct(vtrHeadline)}</strong> —
        Tamil Nadu's highest assembly turnout in living memory, a {pp(liftHeadline)}{" "}
        jump from 2021. But the roll the percentage is measured against is not the
        roll Tamil Nadu voted on in 2021. The Special Intensive Revision struck{" "}
        <strong>{lakh(stateData.totalDeletions)}</strong> names from it and added{" "}
        <strong>{lakh(sirAdditions)}</strong> new ones. Once the denominator is held
        constant, the surge looks different.
      </p>

      {/* Blocks B–F land in subsequent tasks */}
    </section>
  );
};
```

- [ ] **Step 2: Verify the file type-checks**

Run:
```bash
cd "/Users/siddarth/tn election data/tn-dashboard-app" && npx tsc --noEmit
```

Expected: no errors. (If `analysis.json` typing complains about narrow types, the inferred `acs[number]` shape from the JSON import covers all the fields we read.)

- [ ] **Step 3: Mount on home page (so we can see it as we build)**

Edit `src/app/page.tsx`:

Add to the import block (alphabetical-ish, near other component imports):
```tsx
import { SIRAdjustedTurnout } from '@/components/SIRAdjustedTurnout';
```

In the JSX, insert immediately after `<ACTurnoutMap />` and before `<SIRFlow />`:
```tsx
      <ACTurnoutMap />
      <SIRAdjustedTurnout />
      <SIRFlow />
```

- [ ] **Step 4: Verify in browser**

Open `http://localhost:3000`. Scroll past the AC turnout map. You should see:
- Kicker line `THE ARITHMETIC OF A SURGE` (rust accent, mono-tracked)
- Display headline *A turnout headline, decomposed.* (italic Fraunces)
- Intro paragraph with the live-computed percentages (84.98%, +12.16 pp jump, 97.38 lakh deletions, 23.31 lakh additions)

No errors in the dev server log. Layout sits in the page rhythm.

- [ ] **Step 5: Commit**

```bash
cd "/Users/siddarth/tn election data/tn-dashboard-app" && git add src/components/SIRAdjustedTurnout.tsx src/app/page.tsx && git commit -m "feat: SIRAdjustedTurnout scaffold + intro

Module-scope math (votes2021, votes2026, vtrHeadline, vtrComparable,
sirAdditions, phantomDrops). Section title and intro paragraph. Mounted
between ACTurnoutMap and SIRFlow on the home page.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Lede pull-quote (Block B)

**Files:**
- Modify: `src/components/SIRAdjustedTurnout.tsx`

- [ ] **Step 1: Add the `PullQuote` block component, immediately above the `SIRAdjustedTurnout` export**

Insert in `src/components/SIRAdjustedTurnout.tsx` after the formatters block and before `export const SIRAdjustedTurnout`:

```tsx
const PullQuote = () => (
  <div
    style={{
      background: COLORS.text,
      color: "#faf4e8",
      padding: "40px 36px",
      border: `1.5px solid ${COLORS.text}`,
      boxShadow: "8px 8px 0 rgba(26,20,16,0.08)",
    }}
  >
    <SmallCaps style={{ color: "#c8886a", marginBottom: "14px" }}>
      The Lede
    </SmallCaps>
    <blockquote
      style={{
        fontFamily: SERIF,
        fontSize: "clamp(28px, 4vw, 42px)",
        fontWeight: 700,
        fontStyle: "italic",
        lineHeight: 1.2,
        margin: 0,
        letterSpacing: "-0.02em",
        color: "#faf4e8",
      }}
    >
      The percentage rose by twelve points. The number of voters rose by
      <span style={{ color: "#e8c9b0" }}> one in twenty-five.</span>
    </blockquote>
    <div
      style={{
        marginTop: "22px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "18px 24px",
        fontFamily: MONO,
        fontSize: "12px",
        color: "#d4c9bc",
        letterSpacing: "0.05em",
        lineHeight: 1.6,
      }}
    >
      <div>
        <div style={{ color: "#e8c9b0", fontSize: "20px", fontWeight: 700, fontFeatureSettings: '"tnum" 1' }}>
          {pp(liftHeadline)}
        </div>
        <div>on the smaller post-SIR roll</div>
      </div>
      <div>
        <div style={{ color: "#e8c9b0", fontSize: "20px", fontWeight: 700, fontFeatureSettings: '"tnum" 1' }}>
          {pp(liftComparable)}
        </div>
        <div>like-for-like (2021-sized roll)</div>
      </div>
      <div>
        <div style={{ color: "#e8c9b0", fontSize: "20px", fontWeight: 700, fontFeatureSettings: '"tnum" 1' }}>
          {(voteIncreasePct >= 0 ? "+" : "−") + Math.abs(voteIncreasePct).toFixed(2) + "%"}
        </div>
        <div>in absolute ballots cast</div>
      </div>
    </div>
  </div>
);
```

- [ ] **Step 2: Render `<PullQuote />` inside the section, replacing the placeholder comment**

In the `SIRAdjustedTurnout` JSX, replace:
```tsx
      {/* Blocks B–F land in subsequent tasks */}
```
with:
```tsx
      <div style={{ marginBottom: "36px" }}>
        <PullQuote />
      </div>
```

- [ ] **Step 3: Verify in browser**

Reload `http://localhost:3000`. Below the intro paragraph you should see a dark slab pull-quote with:
- Cream `THE LEDE` kicker (rust)
- Italic Fraunces headline ending in `one in twenty-five.` (the second clause in lighter rust)
- Three-column supporting band: `+12.16 pp / +3.08 pp / +4.22%` with mono captions

No layout shift, no console errors.

- [ ] **Step 4: Commit**

```bash
cd "/Users/siddarth/tn election data/tn-dashboard-app" && git add src/components/SIRAdjustedTurnout.tsx && git commit -m "feat: SIRAdjustedTurnout — lede pull-quote (Block B)

Inverted dark slab matching NonVoterAnalysis chrome. Headline + three
supporting numbers (headline lift, comparable lift, absolute %).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Stat strip (Block C)

**Files:**
- Modify: `src/components/SIRAdjustedTurnout.tsx`

- [ ] **Step 1: Add the `StatCard` and `StatStrip` block components**

Insert in `src/components/SIRAdjustedTurnout.tsx` immediately after `PullQuote` and before `export const SIRAdjustedTurnout`:

```tsx
const StatCard = ({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
}) => (
  <div
    style={{
      background: "#fff9ef",
      border: `1.5px solid ${COLORS.text}`,
      padding: "18px 20px",
    }}
  >
    <SmallCaps style={{ color: COLORS.muted }}>{label}</SmallCaps>
    <div
      style={{
        fontFamily: SERIF,
        fontSize: "clamp(28px, 3.6vw, 36px)",
        fontWeight: 900,
        color: accent ? COLORS.accent : COLORS.text,
        margin: "4px 0",
        fontFeatureSettings: '"tnum" 1, "lnum" 1',
        letterSpacing: "-0.02em",
        lineHeight: 1.1,
      }}
    >
      {value}
    </div>
    <div
      style={{
        fontFamily: SERIF,
        fontStyle: "italic",
        fontSize: "13px",
        color: "#3a302a",
        lineHeight: 1.5,
      }}
    >
      {sub}
    </div>
  </div>
);

const StatStrip = () => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "22px",
      marginBottom: "36px",
    }}
  >
    <StatCard
      label="Roll · 2021 → 2026"
      value={`${crore(roll2021)} → ${crore(roll2026)}`}
      sub={`${lakh(roll2021 - roll2026)} fewer names after the SIR`}
    />
    <StatCard
      label="Ballots cast · 2021 → 2026"
      value={`${crore(votes2021)} → ${crore(votes2026)}`}
      sub={`${lakh(voteIncrease)} more votes cast`}
    />
    <StatCard
      label="Headline VTR · 2026"
      value={pct(vtrHeadline)}
      sub="official figure, on the cleaned roll"
    />
    <StatCard
      label="Comparable VTR · 2026"
      value={pct(vtrComparable)}
      sub="2026 votes on the 2021-sized roll · the like-for-like number"
      accent
    />
  </div>
);
```

- [ ] **Step 2: Render `<StatStrip />` after the pull-quote**

In `SIRAdjustedTurnout`, insert after the `<PullQuote />` block:

```tsx
      <StatStrip />
```

So the JSX inside the `<section>` now reads:

```tsx
      <SectionTitle ...>...</SectionTitle>
      <p ...>...</p>
      <div style={{ marginBottom: "36px" }}>
        <PullQuote />
      </div>
      <StatStrip />
```

- [ ] **Step 3: Verify in browser**

Reload. Four cream cards below the pull-quote:
- `Roll · 2021 → 2026` — `6.35 cr → 5.67 cr` — *67.84 lakh fewer names…*
- `Ballots cast · 2021 → 2026` — `4.62 cr → 4.82 cr` — *19.52 lakh more votes…*
- `Headline VTR · 2026` — `84.98%` — *official figure…*
- `Comparable VTR · 2026` — `75.90%` (rust accent) — *2026 votes on the 2021-sized roll…*

At <520 px viewport the grid collapses to a single column.

- [ ] **Step 4: Commit**

```bash
cd "/Users/siddarth/tn election data/tn-dashboard-app" && git add src/components/SIRAdjustedTurnout.tsx && git commit -m "feat: SIRAdjustedTurnout — four-card stat strip (Block C)

Roll, ballots, headline VTR, comparable VTR. Comparable card uses rust
accent. auto-fit grid handles responsive collapse.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: AC phantom-drop table — desktop layout (Block D)

**Files:**
- Modify: `src/components/SIRAdjustedTurnout.tsx`

- [ ] **Step 1: Add the `PhantomDropTable` component (desktop-only render for now; mobile collapse lands in Task 5)**

Insert in `src/components/SIRAdjustedTurnout.tsx` after `StatStrip` and before `export const SIRAdjustedTurnout`:

```tsx
const PhantomDropTable = ({ isMobile }: { isMobile: boolean }) => {
  if (isMobile) {
    // Mobile card-stack lands in the next task. For now: render nothing on mobile.
    return null;
  }

  return (
    <div
      style={{
        background: "#fff9ef",
        border: `1.5px solid ${COLORS.text}`,
        padding: "22px",
      }}
    >
      <SmallCaps style={{ color: COLORS.accent, marginBottom: "14px" }}>
        Where Voters Fell Even As Turnout Rose · 2021 → 2026
      </SmallCaps>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "640px" }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${COLORS.text}` }}>
              {[
                { label: "AC", align: "left" as const },
                { label: "Name", align: "left" as const },
                { label: "District", align: "left" as const },
                { label: "Votes 2021", align: "right" as const },
                { label: "Votes 2026", align: "right" as const },
                { label: "Δ ballots", align: "right" as const },
                { label: "VTR 2021 → 2026", align: "right" as const },
              ].map((col) => (
                <th
                  key={col.label}
                  style={{
                    textAlign: col.align,
                    padding: "10px 8px",
                    fontFamily: MONO,
                    fontSize: "10px",
                    letterSpacing: "0.12em",
                    color: COLORS.muted,
                    fontWeight: 700,
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {phantomDrops.map((r, i) => (
              <tr
                key={r.no}
                style={{
                  borderBottom:
                    i < phantomDrops.length - 1 ? "1px dotted #d4c9bc" : "none",
                }}
              >
                <td style={{ padding: "10px 8px", fontFamily: MONO, fontSize: "12px", color: COLORS.muted, fontWeight: 700 }}>
                  {r.no}
                </td>
                <td style={{ padding: "10px 8px", fontFamily: SERIF, fontSize: "15px", color: COLORS.text, fontWeight: 700 }}>
                  {r.name}
                </td>
                <td style={{ padding: "10px 8px", fontFamily: SERIF, fontSize: "13px", color: "#3a302a", fontStyle: "italic" }}>
                  {r.district}
                </td>
                <td style={{ padding: "10px 8px", fontFamily: MONO, fontSize: "13px", color: COLORS.text, textAlign: "right", fontFeatureSettings: '"tnum" 1' }}>
                  {fmt(r.v21)}
                </td>
                <td style={{ padding: "10px 8px", fontFamily: MONO, fontSize: "13px", color: COLORS.text, textAlign: "right", fontFeatureSettings: '"tnum" 1' }}>
                  {fmt(r.v26)}
                </td>
                <td style={{ padding: "10px 8px", fontFamily: MONO, fontSize: "14px", color: COLORS.accent, textAlign: "right", fontFeatureSettings: '"tnum" 1', fontWeight: 700 }}>
                  −{fmt(r.drop)}
                </td>
                <td style={{ padding: "10px 8px", fontFamily: MONO, fontSize: "12px", color: "#3a302a", textAlign: "right", fontFeatureSettings: '"tnum" 1' }}>
                  {r.vtr2021.toFixed(1)}% → {r.vtr2026.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p
        style={{
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: "13px",
          color: "#3a302a",
          margin: "16px 0 0",
          lineHeight: 1.6,
        }}
      >
        In each of these {phantomDrops.length} constituencies — {chennaiPhantomCount} of them in
        Chennai — the turnout percentage went up while the absolute number of ballots
        cast went down. The roll shrank faster than the electorate showed up.
      </p>
    </div>
  );
};
```

- [ ] **Step 2: Render `<PhantomDropTable isMobile={isMobile} />` after the stat strip**

Insert after `<StatStrip />`:

```tsx
      <div style={{ marginBottom: "36px" }}>
        <PhantomDropTable isMobile={isMobile} />
      </div>
```

- [ ] **Step 3: Verify in browser (desktop ≥768 px)**

Reload. A cream card with a 7-column table:
- 23 rows, sorted by drop magnitude
- Anna Nagar leads with `−10,595`
- Δ column shown in rust, large mono
- VTR column shows e.g. `57.3% → 85.2%`
- Footer caption mentions `23 constituencies — 11 of them in Chennai`

At <768 px nothing renders for this block (mobile lands in next task).

- [ ] **Step 4: Commit**

```bash
cd "/Users/siddarth/tn election data/tn-dashboard-app" && git add src/components/SIRAdjustedTurnout.tsx && git commit -m "feat: SIRAdjustedTurnout — desktop phantom-drop table (Block D)

23 ACs where absolute votes fell despite rising turnout %. Sorted by
drop magnitude; Anna Nagar (−10,595) leads. Mobile placeholder until
next task.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Mobile card-stack for the phantom-drop table

**Files:**
- Modify: `src/components/SIRAdjustedTurnout.tsx`

- [ ] **Step 1: Replace the `if (isMobile) return null;` early return with the card-stack render**

In `PhantomDropTable`, replace:

```tsx
  if (isMobile) {
    // Mobile card-stack lands in the next task. For now: render nothing on mobile.
    return null;
  }
```

with:

```tsx
  if (isMobile) {
    return (
      <div
        style={{
          background: "#fff9ef",
          border: `1.5px solid ${COLORS.text}`,
          padding: "20px 18px",
        }}
      >
        <SmallCaps style={{ color: COLORS.accent, marginBottom: "14px" }}>
          Where Voters Fell Even As Turnout Rose · 2021 → 2026
        </SmallCaps>
        <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {phantomDrops.map((r, i) => (
            <li
              key={r.no}
              style={{
                padding: "12px 0",
                borderBottom:
                  i < phantomDrops.length - 1 ? "1px dotted #d4c9bc" : "none",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "12px" }}>
                <div>
                  <div style={{ fontFamily: SERIF, fontSize: "15px", color: COLORS.text, fontWeight: 700 }}>
                    {r.name}
                  </div>
                  <div style={{ fontFamily: SERIF, fontSize: "12px", color: COLORS.muted, fontStyle: "italic" }}>
                    {r.district} · AC {r.no}
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: "16px",
                    color: COLORS.accent,
                    fontWeight: 700,
                    fontFeatureSettings: '"tnum" 1',
                    whiteSpace: "nowrap",
                  }}
                >
                  −{fmt(r.drop)}
                </div>
              </div>
              <div
                style={{
                  marginTop: "6px",
                  fontFamily: MONO,
                  fontSize: "11px",
                  color: "#3a302a",
                  letterSpacing: "0.04em",
                  fontFeatureSettings: '"tnum" 1',
                  lineHeight: 1.6,
                }}
              >
                {fmt(r.v21)} → {fmt(r.v26)} ballots
                <span style={{ color: COLORS.muted }}> · </span>
                {r.vtr2021.toFixed(1)}% → {r.vtr2026.toFixed(1)}%
              </div>
            </li>
          ))}
        </ol>
        <p
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: "13px",
            color: "#3a302a",
            margin: "14px 0 0",
            lineHeight: 1.6,
          }}
        >
          In each of these {phantomDrops.length} constituencies — {chennaiPhantomCount} of them in
          Chennai — the turnout percentage went up while the absolute number of
          ballots cast went down. The roll shrank faster than the electorate showed
          up.
        </p>
      </div>
    );
  }
```

- [ ] **Step 2: Verify in browser at <768 px**

Open dev tools, set viewport to 375 × 667 (iPhone). The phantom-drop block now renders:
- Same kicker
- 23 list items, each with the AC name + district sub-line on the left, the `−Δ` ballots in rust on the right
- Below that: `votes2021 → votes2026 ballots · vtr2021% → vtr2026%` in compact mono
- Same closing caption

Toggle viewport back to ≥768 px — desktop table still renders unchanged.

- [ ] **Step 3: Commit**

```bash
cd "/Users/siddarth/tn election data/tn-dashboard-app" && git add src/components/SIRAdjustedTurnout.tsx && git commit -m "feat: SIRAdjustedTurnout — mobile card-stack for phantom drops

Below 768 px the 7-column table collapses to a name+district / −Δ
two-line list with a votes/vtr sub-line.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Additions callout (Block E)

**Files:**
- Modify: `src/components/SIRAdjustedTurnout.tsx`

- [ ] **Step 1: Add the `AdditionsCallout` block component**

Insert in `src/components/SIRAdjustedTurnout.tsx` after `PhantomDropTable` and before `export const SIRAdjustedTurnout`:

```tsx
const AdditionsCallout = () => (
  <div
    style={{
      background: "#fff9ef",
      border: `1.5px solid ${COLORS.text}`,
      borderLeft: `6px solid ${COLORS.accent}`,
      padding: "28px 32px",
      display: "grid",
      gridTemplateColumns: "minmax(0, 1fr)",
      gap: "16px",
    }}
  >
    <SmallCaps style={{ color: COLORS.accent }}>
      The Numerator, Accounted For
    </SmallCaps>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gap: "24px",
        alignItems: "baseline",
      }}
    >
      <div
        style={{
          fontFamily: SERIF,
          fontSize: "clamp(48px, 6vw, 72px)",
          fontWeight: 900,
          fontStyle: "italic",
          color: COLORS.text,
          letterSpacing: "-0.03em",
          lineHeight: 1,
          fontFeatureSettings: '"tnum" 1, "lnum" 1',
        }}
      >
        {lakh(sirAdditions)}
      </div>
      <div
        style={{
          fontFamily: SERIF,
          fontSize: "16px",
          lineHeight: 1.6,
          color: "#3a302a",
        }}
      >
        new electors added during the SIR. That is{" "}
        <strong style={{ color: COLORS.accent }}>
          {additionsRatioPct.toFixed(0)}%
        </strong>{" "}
        of the {lakh(voteIncrease)} increase in ballots cast between 2021 and 2026.
        If every new voter on the roll had voted, they alone would more than account
        for the surge. The arithmetic leaves little room for the awakening.
      </div>
    </div>
    <p
      style={{
        fontFamily: SERIF,
        fontStyle: "italic",
        fontSize: "13px",
        color: COLORS.muted,
        margin: 0,
        lineHeight: 1.6,
        borderTop: `1px dotted ${COLORS.muted}`,
        paddingTop: "14px",
      }}
    >
      Not all new electors voted; some additions were age-18 enrolments that would
      have happened in any cycle. The point is directional: the numerator's growth
      tracks the roll's growth, not a behavioural shift.
    </p>
  </div>
);
```

- [ ] **Step 2: Render `<AdditionsCallout />` after the phantom-drop block**

In `SIRAdjustedTurnout` insert after the phantom-drop wrapper:

```tsx
      <div style={{ marginBottom: "36px" }}>
        <AdditionsCallout />
      </div>
```

- [ ] **Step 3: Verify in browser**

Reload. Below the AC table you should see:
- Cream card with a thick rust left border
- Rust kicker: `THE NUMERATOR, ACCOUNTED FOR`
- A large italic Fraunces number `23.31 lakh` on the left
- Body copy on the right ending in *…leaves little room for the awakening.*
- Italic-Fraunces nuance line at the bottom, separated by a dotted divider

- [ ] **Step 4: Commit**

```bash
cd "/Users/siddarth/tn election data/tn-dashboard-app" && git add src/components/SIRAdjustedTurnout.tsx && git commit -m "feat: SIRAdjustedTurnout — additions callout (Block E)

23.31 lakh new SIR electors = 119% of the 19.52-lakh ballot increase.
Margin-note styling with rust left-border and italic display number.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Methodology box (Block F)

**Files:**
- Modify: `src/components/SIRAdjustedTurnout.tsx`

- [ ] **Step 1: Add the `MethodologyBox` block component**

Insert in `src/components/SIRAdjustedTurnout.tsx` after `AdditionsCallout` and before `export const SIRAdjustedTurnout`:

```tsx
const MethodologyBox = () => (
  <div
    style={{
      padding: "18px 22px",
      background: "#fff9ef",
      border: `1px dashed ${COLORS.muted}`,
    }}
  >
    <SmallCaps style={{ color: COLORS.muted, marginBottom: "8px" }}>
      Methodology
    </SmallCaps>
    <p
      style={{
        fontFamily: SERIF,
        fontStyle: "italic",
        fontSize: "13.5px",
        color: "#3a302a",
        margin: 0,
        lineHeight: 1.6,
      }}
    >
      Headline VTR is the ECI provisional figure (21:18 IST, 23 April 2026) and may
      revise upward by 1–2 points in the final release. Comparable VTR re-bases
      2026's votes against the pre-SIR roll size — it makes the two years
      arithmetically comparable; it does not claim 2026 turnout was "really" lower.
      The {lakh(stateData.totalDeletions)} deletions removed dead, migrated, and
      duplicate names that should not have counted in the 2021 denominator either,
      which is why 2021's {pct(vtr2021)} was itself an understatement. Additions
      are computed as <code style={{ fontFamily: MONO, fontSize: "12px" }}>totalDeletions − netReduction</code>,
      the net inflow during the revision; not all of them are first-time
      eighteen-year-olds.
    </p>
  </div>
);
```

- [ ] **Step 2: Render `<MethodologyBox />` as the final block in the section**

In `SIRAdjustedTurnout` insert after the additions callout wrapper (no `marginBottom` — it's the last block):

```tsx
      <MethodologyBox />
```

- [ ] **Step 3: Verify in browser**

Reload. Below the additions callout: a cream card with a dashed muted border, `METHODOLOGY` kicker, and a single italic Fraunces paragraph carrying the disclaimers. The inline `totalDeletions − netReduction` is mono-styled. Numbers (`97.38 lakh`, `72.82%`) are live from data.

- [ ] **Step 4: Commit**

```bash
cd "/Users/siddarth/tn election data/tn-dashboard-app" && git add src/components/SIRAdjustedTurnout.tsx && git commit -m "feat: SIRAdjustedTurnout — methodology box (Block F)

Closes the section with definitions of headline vs comparable VTR, the
ghost-name caveat for 2021's understated baseline, and the additions
formula.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: Final QA pass and ship

**Files:**
- (Read-only) `src/app/page.tsx`, `src/components/SIRAdjustedTurnout.tsx`

- [ ] **Step 1: Type-check**

```bash
cd "/Users/siddarth/tn election data/tn-dashboard-app" && npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 2: Lint (if configured)**

```bash
cd "/Users/siddarth/tn election data/tn-dashboard-app" && npx next lint
```

Expected: zero errors. Warnings acceptable if they pre-existed before this work; do not introduce new ones.

- [ ] **Step 3: Production build smoke test**

```bash
cd "/Users/siddarth/tn election data/tn-dashboard-app" && npx next build
```

Expected: builds cleanly. Inspect the build output for `Page Size` regression on the home route — the new component should add roughly 3–5 KB gzipped (it is pure JSX with no new data import).

- [ ] **Step 4: Browser walk-through**

Visit `http://localhost:3000`. Scroll through the section in order and confirm each block reads cleanly:

1. Section title `THE ARITHMETIC OF A SURGE` and display headline
2. Intro paragraph (live percentages render, no `NaN`)
3. Lede pull-quote (dark slab, `+12.16 pp / +3.08 pp / +4.22%` band)
4. Stat strip (4 cards; Comparable VTR card is rust)
5. Phantom-drop table (23 rows; Anna Nagar leads at `−10,595`; caption says `11 of them in Chennai`)
6. Additions callout (`23.31 lakh`, `119%`)
7. Methodology box (italic disclaimer paragraph)

Resize to 375 × 667 — phantom-drop table collapses to card-stack, stat strip to a single column, pull-quote band to one column.

Open the browser console — no errors, no warnings introduced by this section.

- [ ] **Step 5: Update README to mention the new section under Features**

In `tn-dashboard-app/README.md`, find the `## 📱 Features` block and add a bullet (insert after the `**AC Turnout Map**:` bullet):

```markdown
- **Arithmetic of a Surge**: A three-act decomposition of the +12 pp turnout headline — state-level mechanical lift from the smaller post-SIR roll, the 23 constituencies where votes fell despite turnout rising, and the additions math that absorbs the entire absolute increase.
```

- [ ] **Step 6: Final commit**

```bash
cd "/Users/siddarth/tn election data/tn-dashboard-app" && git add README.md && git commit -m "docs: README — Arithmetic of a Surge feature line

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```
