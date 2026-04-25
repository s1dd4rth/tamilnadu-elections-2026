# The Arithmetic of a Surge — SIR-adjusted turnout section

**Date:** 2026-04-26
**Status:** spec, awaiting implementation
**Component to add:** `src/components/SIRAdjustedTurnout.tsx`
**Placement:** home page, between `TurnoutSection` and `NonVoterAnalysis`

## Thesis

The Election Commission's headline turnout for the 2026 Tamil Nadu assembly election — **84.98%** — is measured against a roll the Special Intensive Revision shrank by 67.84 lakh names from its 2021 size. Held against a like-for-like denominator, the like-for-like change is **+3.08 pp**, not +12.15 pp. Held against the absolute count of ballots, the increase is **+19.52 lakh** — and the SIR added **23.3 lakh** new electors over the same period, more than the entire vote increase. The section presents this as a three-act decomposition: state mechanical lift, AC-level evidence (23 constituencies where votes fell despite turnout rising), and the additions math.

The framing is "headline vs comparable," not "real vs fake." The 97.4 lakh deletions removed ghost names that should not have been in the 2021 denominator either, so 2021's 72.81% was itself an understatement; the comparable lens makes the years arithmetically comparable, it does not claim 2026 turnout was "really" lower than reported.

## Anchor numbers (all derived from existing data — no new files)

```
roll2021       = Σ analysis.acs[].elec2021                              = 6,34,91,427
roll2026       = Σ analysis.acs[].elec2026                              = 5,67,07,380
votes2021      = Σ (elec2021 − nonVoters2021)                           = 4,62,36,434
votes2026      = Σ (elec2026 − nonVoters2026)                           = 4,81,88,830
vtr2021        = votes2021 / roll2021                                   = 72.82%
vtrHeadline    = votes2026 / roll2026                                   = 84.98%
vtrComparable  = votes2026 / roll2021                                   = 75.90%
liftHeadline   = vtrHeadline − vtr2021                                  = +12.15 pp
liftComparable = vtrComparable − vtr2021                                = +3.08 pp
voteIncrease   = votes2026 − votes2021                                  = +19,52,396
sirAdditions   = state.totalDeletions − state.netReduction              = 23,30,624
additionsRatio = sirAdditions / voteIncrease                            = 119%
phantomDrops   = acs filtered to votes26 < votes21, sorted by Δ desc    = 23 ACs
```

Numerator math (`votes = elec − nonVoters`) is computed from `analysis.json` only, never paraphrased from `state.json` or `turnout.json` snapshots — those are different reports and could disagree by ±0.05 pp. The component's own derivation is canonical for everything it displays.

## Component shape

Single React client component, ~250–300 LOC, mirrors the structure of `NonVoterAnalysis.tsx`:

- All aggregates and the 23-AC list are computed once at module scope (no `useMemo`, no `useEffect`).
- Imports `analysisData` from `@/data/analysis.json` and `stateData` from `@/data/state.json`.
- Renders six vertical blocks inside one `<section style={{ margin: "48px 0" }}>`.
- Reuses `SectionTitle`, `SmallCaps` from `./common`, and the colour/typography tokens from `@/styles/theme` (`SERIF`, `MONO`, `COLORS`).
- No new dependencies, no new data files, no new fonts, no new icons.

## Block-by-block

**Block A — section title + intro paragraph** (~70 words). Kicker: `THE ARITHMETIC OF A SURGE`. Display: *A turnout headline, decomposed.* Intro frames the SIR's two-sided mechanism: 97.4 lakh removed, 23.3 lakh added.

**Block B — lede pull-quote.** Inverted dark slab, identical chrome to `NonVoterAnalysis.tsx:32–73` (background `COLORS.text`, cream foreground, kicker `THE LEDE` in rust, Fraunces italic 28–42 px clamp). Headline copy: *"The percentage rose by twelve points. The number of voters rose by one in twenty-five."* Supporting band reports the three figures — `+12.15 pp on the smaller post-SIR roll · +3.08 pp like-for-like · +4.22% in absolute ballots`.

**Block C — stat strip.** Four-card auto-fit grid `repeat(auto-fit, minmax(220px, 1fr))`, identical to `NonVoterAnalysis` `StateSummary` (lines 119–143). Cards in order:

1. `Roll · 6.35 cr → 5.67 cr` — *67.84 lakh fewer names after the SIR*
2. `Ballots · 4.62 cr → 4.82 cr` — *19.52 lakh more votes cast*
3. `Headline VTR · 84.98%` — *official figure, on the cleaned roll*
4. `Comparable VTR · 75.90%` (rust accent) — *2026 votes on the 2021-sized roll · the like-for-like number*

**Block D — phantom-drop AC table.** Cream card, chrome from `ApathyTable` (`NonVoterAnalysis.tsx:77–115`). Kicker: `WHERE VOTERS FELL EVEN AS TURNOUT ROSE · 2021 → 2026`. Columns: AC# · Name · District · Votes 2021 · Votes 2026 · Δ ballots · VTR 2021 → 2026. All 23 rows shown (not truncated to 10 — the count is the story). Sorted by absolute drop descending; Anna Nagar (−10,595) leads. Caption beneath: *In each of these 23 constituencies — eleven of them in Chennai — the turnout percentage went up while the absolute number of ballots cast went down. The roll shrank faster than the electorate showed up.*

**Block E — additions callout.** Single wide card, distinct from Block C (longer-form, margin-note feel — not a stat tile). Pull number **23.3 lakh**, caption: *That is **119%** of the 19.5-lakh increase in ballots cast between 2021 and 2026. If every new voter on the roll had voted, they alone would more than account for the surge. The arithmetic leaves little room for the awakening.* Followed by a single italic-Fraunces nuance line: *(Not all new electors voted; some additions were age-18 enrolments that would have happened in any cycle. The point is directional: the numerator's growth tracks the roll's growth, not a behavioural shift.)*

**Block F — methodology box.** Dashed border cream, copy:

> Headline VTR is the ECI provisional figure (21:18 IST, 23 April 2026) and may revise upward by 1–2 points in the final release. Comparable VTR re-bases 2026's votes against the pre-SIR roll size — it makes the two years arithmetically comparable; it does not claim 2026 turnout was "really" lower. The 97.4 lakh deletions removed dead, migrated, and duplicate names that should not have counted in the 2021 denominator either, which is why 2021's 72.81% was itself an understatement. Additions are computed as `totalDeletions − netReduction`, the net inflow during the revision; not all of them are first-time eighteen-year-olds.

## Responsive

Section is below the fold, so `useIsMobile()` is acceptable here per the responsive-patterns guidance. Specific behaviour:

- Stat strip (Block C): existing auto-fit grid handles the breakpoint cascade with no new CSS.
- AC table (Block D): table layout at ≥768 px. At <768 px, collapse to a card stack — AC name + district as row header, then two sub-lines: `votes 2021 → 2026 · −Δ` and `vtr 2021 → 2026 · +Δpp`. Use `useIsMobile`.
- Pull-quote, stat strip cards, additions callout: already fluid via `clamp()`.
- Methodology box: prose, fluid by default.

## Methodology guards (hard rules in implementation)

- **Always show headline VTR (84.98%) and comparable VTR (75.90%) together.** Never display the comparable number in isolation — that creates exactly the misread the section is built to prevent.
- **Methodology box is non-collapsible, non-dismissable.** Same as `NonVoterAnalysis`.
- **No hardcoded digits in copy.** Every number on screen is read from data. A future final-ECI-revision update to `vtr2026` in `analysis.json` re-flows the entire section.
- **Numerator is `elec − nonVoters` per AC summed.** Never paraphrase totals from `state.json` or `turnout.json`.

## Out of scope

- Postal ballots, NOTA, polling-station-level analysis (same scope as existing `NonVoterAnalysis`).
- District-level rollup of phantom drops (the AC table already implies the geography via the District column; a district map adds clutter without new information).
- Animation, scroll triggers, charts. The section is text and tables — same register as the rest of the home page.
- Tests. The repo has no component tests; this component does not introduce any.

## File touch list

- **Add:** `src/components/SIRAdjustedTurnout.tsx` (new, ~250–300 LOC)
- **Edit:** `src/app/page.tsx` — import and render the new component between `TurnoutSection` and `NonVoterAnalysis`.
- **No edits to:** any JSON in `src/data/`, any other component, `globals.css`, theme tokens.

## Risks and mitigations

1. *Reader infers "the official number is wrong."* — Methodology copy is explicit that comparable VTR is an additional lens, not a correction; headline VTR is reported as the official figure throughout.
2. *Final ECI revision lifts headline VTR by 1–2 pp.* — All numbers derive from `analysis.json` fields; updating `vtr2026` reflows the section automatically. No copy hardcodes `84.98`.
3. *Section sits awkwardly close in tone to `NonVoterAnalysis`.* — Ordered placement (TurnoutSection → SIRAdjustedTurnout → NonVoterAnalysis) makes the arc explicit: headline → decomposition → apathy lens. Each section has a distinct kicker so the boundary is visually clear.
