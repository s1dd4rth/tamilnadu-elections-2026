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

      <div style={{ marginBottom: "36px" }}>
        <PullQuote />
      </div>

      <StatStrip />

      <div style={{ marginBottom: "36px" }}>
        <PhantomDropTable isMobile={isMobile} />
      </div>
    </section>
  );
};
