"use client";

import React, { useMemo } from "react";
import { SERIF, MONO, COLORS } from "@/styles/theme";
import { SmallCaps, SectionTitle } from "./common";
import { PartyFlag } from "./PartyFlag";
import analysisData from "@/data/analysis.json";

// Pull out the standout: Thiyagarayanagar 792:1
const acs = analysisData.acs.filter((a) => a.apathyRatio != null) as Array<typeof analysisData.acs[0]>;

const rankedByRatio = [...acs].sort((a, b) => (b.apathyRatio! - a.apathyRatio!));
const top = rankedByRatio.slice(0, 10);
const lede = rankedByRatio[0];

// Summary stats
const total_nv_2021 = acs.reduce((s, a) => s + a.nonVoters2021, 0);
const total_nv_2026 = acs.reduce((s, a) => s + a.nonVoters2026, 0);
const total_electorate_2021 = acs.reduce((s, a) => s + a.elec2021, 0);
const total_electorate_2026 = acs.reduce((s, a) => s + a.elec2026, 0);

const nonVoters2021Pct = (total_nv_2021 / total_electorate_2021) * 100;
const nonVoters2026Pct = (total_nv_2026 / total_electorate_2026) * 100;

// How many ACs have non-voters > winner's 2021 margin
const acs_apathy_exceeds = acs.filter((a) => a.nonVoters2021 > a.margin2021).length;

const fmt = (n: number) => n.toLocaleString("en-IN");

// ─────────────────────────────────────────────────────────────

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
    <SmallCaps style={{ color: "#c8886a", marginBottom: "14px" }}>The Lede</SmallCaps>
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
      In {lede.name}, more than {fmt(Math.round(lede.nonVoters2021 / 1000) * 1000)} people stayed home in 2021. The winner came in by
      <span style={{ color: "#e8c9b0" }}> {fmt(lede.margin2021)} votes.</span>
    </blockquote>
    <div
      style={{
        marginTop: "22px",
        fontFamily: SERIF,
        fontSize: "15px",
        fontStyle: "italic",
        lineHeight: 1.6,
        color: "#d4c9bc",
      }}
    >
      That is a ratio of <strong style={{ color: "#e8c9b0", fontStyle: "normal" }}>{lede.apathyRatio!.toFixed(0)}
      -to-one</strong> — the non-voters outnumbered the winning margin by nearly eight hundred times. In Tamil Nadu's
      2021 assembly election, non-voters outnumbered the winner's margin in <strong style={{ color: "#e8c9b0", fontStyle: "normal" }}>{acs_apathy_exceeds} of 234 constituencies</strong>.
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────

const ApathyTable = () => (
  <div style={{ background: "#fff9ef", border: `1.5px solid ${COLORS.text}`, padding: "22px" }}>
    <SmallCaps style={{ color: COLORS.accent, marginBottom: "14px" }}>
      Constituencies with the Widest Apathy Gap · 2021
    </SmallCaps>
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ borderBottom: `2px solid ${COLORS.text}` }}>
          <th style={{ textAlign: "left", padding: "10px 8px", fontFamily: MONO, fontSize: "10px", letterSpacing: "0.12em", color: COLORS.muted, fontWeight: 700 }}>AC</th>
          <th style={{ textAlign: "left", padding: "10px 8px", fontFamily: MONO, fontSize: "10px", letterSpacing: "0.12em", color: COLORS.muted, fontWeight: 700 }}>Name</th>
          <th style={{ textAlign: "right", padding: "10px 8px", fontFamily: MONO, fontSize: "10px", letterSpacing: "0.12em", color: COLORS.muted, fontWeight: 700 }}>Non-voters</th>
          <th style={{ textAlign: "right", padding: "10px 8px", fontFamily: MONO, fontSize: "10px", letterSpacing: "0.12em", color: COLORS.muted, fontWeight: 700 }}>Winner's margin</th>
          <th style={{ textAlign: "right", padding: "10px 8px", fontFamily: MONO, fontSize: "10px", letterSpacing: "0.12em", color: COLORS.muted, fontWeight: 700 }}>Ratio</th>
          <th style={{ textAlign: "left", padding: "10px 8px", fontFamily: MONO, fontSize: "10px", letterSpacing: "0.12em", color: COLORS.muted, fontWeight: 700 }}>Winner</th>
        </tr>
      </thead>
      <tbody>
        {top.map((r, i) => (
          <tr key={r.no} style={{ borderBottom: i < top.length - 1 ? "1px dotted #d4c9bc" : "none" }}>
            <td style={{ padding: "10px 8px", fontFamily: MONO, fontSize: "12px", color: COLORS.muted, fontWeight: 700 }}>{r.no}</td>
            <td style={{ padding: "10px 8px", fontFamily: SERIF, fontSize: "15px", color: COLORS.text, fontWeight: 700 }}>{r.name}</td>
            <td style={{ padding: "10px 8px", fontFamily: MONO, fontSize: "13px", color: COLORS.text, textAlign: "right", fontFeatureSettings: '"tnum" 1' }}>{fmt(r.nonVoters2021)}</td>
            <td style={{ padding: "10px 8px", fontFamily: MONO, fontSize: "13px", color: COLORS.text, textAlign: "right", fontFeatureSettings: '"tnum" 1' }}>{fmt(r.margin2021)}</td>
            <td style={{ padding: "10px 8px", fontFamily: MONO, fontSize: "14px", color: COLORS.accent, textAlign: "right", fontFeatureSettings: '"tnum" 1', fontWeight: 700 }}>{r.apathyRatio!.toFixed(1)}×</td>
            <td style={{ padding: "10px 8px", fontFamily: SERIF, fontSize: "13px", color: "#3a302a" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                <PartyFlag party={r.winner2021.party} size={22} />
                <span style={{ fontStyle: "italic" }}>{r.winner2021.party}</span>
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "12px", color: COLORS.muted, margin: "14px 0 0", lineHeight: 1.6 }}>
      Ratio = 2021 non-voters ÷ winner's 2021 margin. On counting day we will compute this for 2026 alongside — in constituencies where this ratio exceeds one, voter abstention is a larger force than the contest itself.
    </p>
  </div>
);

// ─────────────────────────────────────────────────────────────

const StateSummary = () => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "22px", marginBottom: "36px" }}>
    <Stat
      label="Non-voters · 2021"
      value={fmt(total_nv_2021)}
      sub={`${nonVoters2021Pct.toFixed(2)}% of the roll sat out`}
    />
    <Stat
      label="Non-voters · 2026"
      value={fmt(total_nv_2026)}
      sub={`${nonVoters2026Pct.toFixed(2)}% of the roll sat out`}
      accent
    />
    <Stat
      label="Change"
      value={`−${fmt(total_nv_2021 - total_nv_2026)}`}
      sub={`${(nonVoters2021Pct - nonVoters2026Pct).toFixed(2)} pp fewer absentees`}
    />
    <Stat
      label="ACs where apathy > margin · 2021"
      value={`${acs_apathy_exceeds}`}
      sub={`of ${acs.length} (${((acs_apathy_exceeds / acs.length) * 100).toFixed(0)}%)`}
    />
  </div>
);

const Stat = ({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: boolean }) => (
  <div style={{ background: "#fff9ef", border: `1.5px solid ${COLORS.text}`, padding: "18px 20px" }}>
    <SmallCaps style={{ color: COLORS.muted }}>{label}</SmallCaps>
    <div style={{ fontFamily: SERIF, fontSize: "clamp(32px, 4vw, 40px)", fontWeight: 900, color: accent ? COLORS.accent : COLORS.text, margin: "4px 0 4px", fontFeatureSettings: '"tnum" 1, "lnum" 1', letterSpacing: "-0.02em" }}>
      {value}
    </div>
    <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "13px", color: "#3a302a" }}>{sub}</div>
  </div>
);

// ─────────────────────────────────────────────────────────────

export const NonVoterAnalysis = () => {
  return (
    <section style={{ margin: "48px 0" }}>
      <SectionTitle kicker="The Apathy Margin">The vote that wasn't.</SectionTitle>

      <p style={{ fontFamily: SERIF, fontSize: "17px", lineHeight: 1.65, color: "#3a302a", maxWidth: "760px", margin: "0 0 32px" }}>
        Winners and margins dominate election coverage. But in 2021, non-voters outnumbered the winner's margin in nearly <strong>nine of every ten constituencies</strong>. The people who <em>didn't</em> vote exerted more weight than the candidates who won. This is their accounting — and the scaffolding we'll use to measure the 2026 surge against, once counting is done.
      </p>

      <StateSummary />

      <div style={{ marginBottom: "36px" }}>
        <PullQuote />
      </div>

      <ApathyTable />

      <div style={{ marginTop: "28px", padding: "18px 22px", background: "#fff9ef", border: `1px dashed ${COLORS.muted}` }}>
        <SmallCaps style={{ color: COLORS.muted, marginBottom: "8px" }}>Methodology</SmallCaps>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "13.5px", color: "#3a302a", margin: 0, lineHeight: 1.6 }}>
          Non-voters = registered electors minus votes cast. 2021 margin = the winner's vote total minus the runner-up's. 2026 non-voter counts here are from the provisional ECINET turnout at 21:18 IST on 23 April 2026 — the final ECI figures typically revise this number <em>downward</em> by 1–2 percentage points (more voters will be counted). The 2026 winner-margin column, and the updated apathy ratio, arrive with counting day.
        </p>
      </div>
    </section>
  );
};
