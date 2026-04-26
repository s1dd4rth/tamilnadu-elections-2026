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
    </section>
  );
};
