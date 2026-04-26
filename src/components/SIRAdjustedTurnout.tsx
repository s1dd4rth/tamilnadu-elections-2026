"use client";

import React, { useMemo, useState } from "react";
import { SERIF, MONO, COLORS } from "@/styles/theme";
import { SmallCaps, SectionTitle } from "./common";
import analysisData from "@/data/analysis.json";
import stateData from "@/data/state.json";

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

// Per-AC enriched row: votes cast in each year, signed change in ballots,
// and Δpp in turnout. Single source of truth for both the phantom-drop
// curated view and the all-234 sortable view.
type EnrichedRow = ACRow & {
  v21: number;
  v26: number;
  drop: number;       // v21 − v26 (positive = votes fell). Used by the noise-floor filter.
  dBallots: number;   // v26 − v21 (signed). Used for the "Δ ballots" column display + sort.
  vtrDelta: number;   // vtr2026 − vtr2021 (signed). Used for the "VTR 2021 → 2026" sort.
};

const allRows: EnrichedRow[] = acs.map((a) => {
  const v21 = a.elec2021 - a.nonVoters2021;
  const v26 = a.elec2026 - a.nonVoters2026;
  return {
    ...a,
    v21,
    v26,
    drop: v21 - v26,
    dBallots: v26 - v21,
    vtrDelta: a.vtr2026 - a.vtr2021,
  };
});

// Noise floor: a drop smaller than 0.5% of 2021 votes is statistically
// indistinguishable from rounding. Below this, "votes fell" is editorially dishonest.
const PHANTOM_DROP_MIN_PCT = 0.005;

const phantomDrops: EnrichedRow[] = allRows
  .filter((a) => a.drop / a.v21 >= PHANTOM_DROP_MIN_PCT)
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

// Signed ballot-change cell: rust for losses, ink for gains, grey for zero.
// Drives the visual "phantom drops are the rust rows" reading in the all-234 view.
const ballotCell = (dBallots: number): { text: string; color: string } => {
  if (dBallots < 0) return { text: `−${fmt(-dBallots)}`, color: COLORS.accent };
  if (dBallots > 0) return { text: `+${fmt(dBallots)}`, color: COLORS.text };
  return { text: "0", color: COLORS.muted };
};

type PhantomMode = "drops" | "all";
type SortKey = "no" | "name" | "district" | "v21" | "v26" | "dBallots" | "vtrDelta";
type SortDir = "asc" | "desc";

const COLUMNS: Array<{ label: string; align: "left" | "right"; key: SortKey }> = [
  { label: "AC", align: "left", key: "no" },
  { label: "Name", align: "left", key: "name" },
  { label: "District", align: "left", key: "district" },
  { label: "Votes 2021", align: "right", key: "v21" },
  { label: "Votes 2026", align: "right", key: "v26" },
  { label: "Δ ballots", align: "right", key: "dBallots" },
  { label: "VTR 2021 → 2026", align: "right", key: "vtrDelta" },
];

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
      label="Headline VTR · 2021 → 2026"
      value={`${pct(vtr2021)} → ${pct(vtrHeadline)}`}
      sub={`${pp(liftHeadline)} on the cleaned roll`}
    />
    <StatCard
      label="Comparable VTR · 2021 → 2026"
      value={`${pct(vtr2021)} → ${pct(vtrComparable)}`}
      sub={`${pp(liftComparable)} like-for-like (2021-sized roll)`}
      accent
    />
  </div>
);

const ModeToggle = ({
  mode,
  setMode,
}: {
  mode: PhantomMode;
  setMode: (m: PhantomMode) => void;
}) => {
  const btn = (active: boolean): React.CSSProperties => ({
    fontFamily: MONO,
    fontSize: "10px",
    letterSpacing: "0.12em",
    fontWeight: 700,
    textTransform: "uppercase",
    padding: "8px 12px",
    border: "none",
    background: active ? COLORS.text : "transparent",
    color: active ? "#faf4e8" : COLORS.text,
    cursor: active ? "default" : "pointer",
  });
  return (
    <div style={{ display: "inline-flex", border: `1px solid ${COLORS.text}` }}>
      <button onClick={() => setMode("drops")} style={btn(mode === "drops")}>
        18 phantom drops
      </button>
      <button onClick={() => setMode("all")} style={btn(mode === "all")}>
        All 234 ACs
      </button>
    </div>
  );
};

const PhantomDropTable = () => {
  const [mode, setMode] = useState<PhantomMode>("drops");
  const [sortKey, setSortKey] = useState<SortKey>("no");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const rows = useMemo<EnrichedRow[]>(() => {
    if (mode === "drops") return phantomDrops;
    const sorted = [...allRows].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp =
        typeof av === "string"
          ? av.localeCompare(bv as string)
          : (av as number) - (bv as number);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [mode, sortKey, sortDir]);

  const onSort = (key: SortKey) => {
    if (mode !== "all") return;
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const kicker =
    mode === "drops"
      ? "Where Voters Fell Even As Turnout Rose · 2021 → 2026"
      : "All 234 Constituencies · 2021 → 2026";

  const caption =
    mode === "drops" ? (
      <>
        In each of these {phantomDrops.length} constituencies —{" "}
        {chennaiPhantomCount} of them in Chennai — ballots cast in 2026 fell by at
        least half a percent against 2021, even as the turnout percentage rose. The
        roll shrank faster than the electorate showed up.
      </>
    ) : (
      <>
        All 234 constituencies, sortable by any column. Rows where the Δ ballots
        column reads in rust are the {phantomDrops.length} phantom drops featured
        in the curated view — votes that fell by at least half a percent.
      </>
    );

  const headerRow = (
    <tr style={{ borderBottom: `2px solid ${COLORS.text}` }}>
      {COLUMNS.map((col) => {
        const sortable = mode === "all";
        const active = sortable && sortKey === col.key;
        const arrow = active ? (sortDir === "asc" ? " ↑" : " ↓") : "";
        return (
          <th
            key={col.label}
            onClick={sortable ? () => onSort(col.key) : undefined}
            style={{
              textAlign: col.align,
              padding: "10px 8px",
              fontFamily: MONO,
              fontSize: "10px",
              letterSpacing: "0.12em",
              color: active ? COLORS.accent : COLORS.muted,
              fontWeight: 700,
              cursor: sortable ? "pointer" : "default",
              userSelect: sortable ? "none" : "auto",
              whiteSpace: "nowrap",
            }}
          >
            {col.label}
            {arrow}
          </th>
        );
      })}
    </tr>
  );

  const renderRow = (r: EnrichedRow, i: number, total: number) => {
    const bc = ballotCell(r.dBallots);
    return (
      <tr
        key={r.no}
        style={{
          borderBottom: i < total - 1 ? "1px dotted #d4c9bc" : "none",
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
        <td style={{ padding: "10px 8px", fontFamily: MONO, fontSize: "14px", color: bc.color, textAlign: "right", fontFeatureSettings: '"tnum" 1', fontWeight: 700 }}>
          {bc.text}
        </td>
        <td style={{ padding: "10px 8px", fontFamily: MONO, fontSize: "12px", color: "#3a302a", textAlign: "right", fontFeatureSettings: '"tnum" 1' }}>
          {r.vtr2021.toFixed(1)}% → {r.vtr2026.toFixed(1)}%
        </td>
      </tr>
    );
  };

  const headerBlock = (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "16px",
        flexWrap: "wrap",
        marginBottom: "14px",
      }}
    >
      <SmallCaps style={{ color: COLORS.accent, marginBottom: 0 }}>
        {kicker}
      </SmallCaps>
      <ModeToggle mode={mode} setMode={setMode} />
    </div>
  );

  return (
    <>
      {/* Mobile card-stack — visible at ≤768 px via globals.css.
          Both branches render in SSR; the swap is purely CSS so there is
          no post-hydration shift. */}
      <div
        className="sir-phantom-mobile"
        style={{
          background: "#fff9ef",
          border: `1.5px solid ${COLORS.text}`,
          padding: "20px 18px",
        }}
      >
        {headerBlock}
        <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {rows.map((r, i) => {
            const bc = ballotCell(r.dBallots);
            return (
              <li
                key={r.no}
                style={{
                  padding: "12px 0",
                  borderBottom:
                    i < rows.length - 1 ? "1px dotted #d4c9bc" : "none",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "12px" }}>
                  <div style={{ minWidth: 0 }}>
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
                      color: bc.color,
                      fontWeight: 700,
                      fontFeatureSettings: '"tnum" 1',
                      whiteSpace: "nowrap",
                    }}
                  >
                    {bc.text}
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
            );
          })}
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
          {caption}
        </p>
      </div>

      {/* Desktop table — visible at ≥769 px. */}
      <div
        className="sir-phantom-desktop"
        style={{
          background: "#fff9ef",
          border: `1.5px solid ${COLORS.text}`,
          padding: "22px",
        }}
      >
        {headerBlock}
        <div style={{ overflowX: "auto", maxHeight: mode === "all" ? "640px" : "none", overflowY: mode === "all" ? "auto" : "visible" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "640px" }}>
            <thead style={mode === "all" ? { position: "sticky", top: 0, background: "#fff9ef", zIndex: 1 } : undefined}>
              {headerRow}
            </thead>
            <tbody>
              {rows.map((r, i) => renderRow(r, i, rows.length))}
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
          {caption}
        </p>
      </div>
    </>
  );
};

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
    <div className="sir-additions-grid">
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
      arithmetically comparable; it does not claim 2026 turnout was “really” lower.
      The {lakh(stateData.totalDeletions)} deletions removed dead, migrated, and
      duplicate names that should not have counted in the 2021 denominator either,
      which is why 2021's {pct(vtr2021)} was itself an understatement. Additions
      are computed as <code style={{ fontFamily: MONO, fontSize: "12px" }}>totalDeletions − netReduction</code>,
      the net inflow during the revision; not all of them are first-time
      eighteen-year-olds.
    </p>
  </div>
);

// ─── Component ──────────────────────────────────────────────────

export const SIRAdjustedTurnout = () => (
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

      <div style={{ marginBottom: "36px" }}>
        <PullQuote />
      </div>

      <StatStrip />

      <div style={{ marginBottom: "36px" }}>
        <PhantomDropTable />
      </div>

      <div style={{ marginBottom: "36px" }}>
        <AdditionsCallout />
      </div>

      <MethodologyBox />
    </section>
);
