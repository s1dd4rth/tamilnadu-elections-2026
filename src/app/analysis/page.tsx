import Link from "next/link";
import type { Metadata } from "next";
import { SERIF, MONO, COLORS } from "@/styles/theme";
import { SmallCaps, SectionTitle } from "@/components/common";
import { SeatHemicycle } from "@/components/SeatHemicycle";
import { NonVoterAnalysis } from "@/components/NonVoterAnalysis";
import analysisData from "@/data/analysis.json";
import turnoutData from "@/data/turnout.json";

export const metadata: Metadata = {
  title: "TN 2026 · Voting Data Analysis · 2021 Baseline + Apathy Margin",
  description:
    "A deeper dive into Tamil Nadu's electoral arithmetic: the 2021 seat hemicycle as the baseline, non-voter counts compared to winning margins, and the scaffolding to overlay 2026 results on counting day.",
  alternates: { canonical: "https://tn-dashboard-app.vercel.app/analysis" },
  openGraph: {
    title: "TN 2026 · Voting Data Analysis",
    description:
      "The 2021 seat hemicycle, the apathy margin, and the scaffolding to compare the 2026 result when counting is done.",
    url: "https://tn-dashboard-app.vercel.app/analysis",
    siteName: "TN Election 2026 Dashboard",
    locale: "en_IN",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "TN 2026 · Voting Data Analysis",
  },
};

export default function AnalysisPage() {
  const seats2021 = analysisData.acs.map((a) => ({
    no: a.no,
    name: a.name,
    alliance: a.winner2021.alliance,
    party: a.winner2021.party,
    winnerName: a.winner2021.name,
    margin: a.margin2021,
    marginPct: a.marginPct2021,
  }));

  // Placeholder for 2026 — every seat "awaiting result" until the 5 May
  // counting data lands.
  const seats2026Placeholder = analysisData.acs.map((a) => ({
    no: a.no,
    name: a.name,
    alliance: "UNKNOWN",
    party: "",
    winnerName: "Counting · 5 May 2026",
    margin: 0,
    marginPct: 0,
  }));

  const ac2021 = analysisData.allianceCounts2021 as Record<string, number>;

  // 2021 legend: only the two blocs that actually won seats, with counts.
  const legend2021 = [
    { alliance: "SPA", count: ac2021.SPA },
    { alliance: "NDA", count: ac2021.NDA },
  ];

  // 2026 legend: advertise the four-cornered contest so the colour key
  // is visible even before any dot has been coloured. "Awaiting result"
  // entry carries the 234 placeholder count.
  const legend2026 = [
    { alliance: "SPA", count: null },
    { alliance: "NDA", count: null },
    { alliance: "TVK", count: null },
    { alliance: "NTK", count: null },
    { alliance: "UNKNOWN", count: analysisData.acs.length },
  ];

  return (
    <main style={{ maxWidth: "1200px", margin: "0 auto", background: "#faf4e8", minHeight: "100vh", padding: "16px" }}>
      {/* Top nav */}
      <nav
        style={{
          borderBottom: `2px solid ${COLORS.text}`,
          paddingBottom: "18px",
          marginBottom: "32px",
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: MONO,
            fontSize: "12px",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            fontWeight: 700,
            color: COLORS.accent,
            textDecoration: "none",
          }}
        >
          ← TN Election 2026 Dashboard
        </Link>
        <SmallCaps style={{ color: COLORS.muted }}>Voting Data Analysis</SmallCaps>
      </nav>

      <header style={{ marginBottom: "48px" }}>
        <SectionTitle kicker="The Long View · 2021 → 2026">The arithmetic of the ballot.</SectionTitle>
        <p
          style={{
            fontFamily: SERIF,
            fontSize: "18px",
            lineHeight: 1.65,
            color: "#3a302a",
            maxWidth: "820px",
            margin: "16px 0 0",
            fontStyle: "italic",
          }}
        >
          A page for the two numbers that dominate an election — turnout and margin — and one that rarely gets its own line: the non-voter. The 2021 seat hemicycle below is the baseline. A second arc sits beside it, empty, waiting for <strong style={{ color: COLORS.text, fontStyle: "normal" }}>5 May 2026</strong>. Between them, the people who stayed home.
        </p>
      </header>

      {/* Two hemicycles side by side — 2021 baseline and 2026 placeholder */}
      <section style={{ marginBottom: "56px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
            gap: "22px",
            alignItems: "start",
          }}
        >
          <SeatHemicycle
            kicker="2021 · BASELINE"
            title="How the house stood at dissolution."
            seats={seats2021}
            legend={legend2021}
            caption={
              <>
                The DMK-led Secular Progressive Alliance (SPA) carried{" "}
                <strong style={{ color: COLORS.text, fontStyle: "normal" }}>{ac2021.SPA}</strong> of 234 seats in 2021. The AIADMK-led NDA held{" "}
                <strong style={{ color: COLORS.text, fontStyle: "normal" }}>{ac2021.NDA}</strong>. A two-alliance map, because that's what the 2021 result was. Each dot is a constituency.
              </>
            }
          />
          <SeatHemicycle
            kicker="2026 · AWAITING COUNT"
            title="A four-cornered contest, held in waiting."
            seats={seats2026Placeholder}
            legend={legend2026}
            caption={
              <>
                2026 is a four-way race: DMK-led <strong style={{ color: COLORS.text, fontStyle: "normal" }}>SPA</strong>, AIADMK-led <strong style={{ color: COLORS.text, fontStyle: "normal" }}>NDA</strong>, and both <strong style={{ color: COLORS.text, fontStyle: "normal" }}>TVK</strong> (Vijay) and <strong style={{ color: COLORS.text, fontStyle: "normal" }}>NTK</strong> (Seeman) contesting solo in all 234 seats. The arc holds 234 neutral dots until counting begins on <strong style={{ color: COLORS.text, fontStyle: "normal" }}>5 May 2026</strong>. The geometry matches the 2021 arc, so when seats colour in, the flips read at a glance.
              </>
            }
          />
        </div>
      </section>

      {/* Non-voter section */}
      <NonVoterAnalysis />

      {/* Data source + forward pointer */}
      <footer style={{ marginTop: "80px", paddingTop: "32px", borderTop: `1px solid ${COLORS.text}`, paddingBottom: "40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "32px" }}>
          <div>
            <SmallCaps style={{ color: COLORS.accent }}>Data Sources</SmallCaps>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: "12px 0 0",
                fontFamily: MONO,
                fontSize: "11px",
                color: COLORS.text,
                letterSpacing: "0.04em",
                lineHeight: 2,
              }}
            >
              <li>· ECI STATISTICAL REPORT · TN 2021</li>
              <li>· TCPD / OPENCITY.IN · 2021 CONSTITUENCY RESULTS</li>
              <li>· ECINET · 2026 PROVISIONAL TURNOUT (23 APR)</li>
              <li>· CEO TAMIL NADU · SIR FINAL ROLL</li>
            </ul>
          </div>
          <div>
            <SmallCaps style={{ color: COLORS.accent }}>Live update schedule</SmallCaps>
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "14px", color: "#3a302a", lineHeight: 1.6, marginTop: "12px" }}>
              This page re-renders when new 2026 data is committed: final ECI turnout (expected a few days after poll), and per-AC winners (5 May 2026). The empty hemicycle and the apathy-margin table both carry 2026 columns that populate automatically.
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <Link
              href="/"
              style={{
                fontFamily: MONO,
                fontSize: "12px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                fontWeight: 700,
                color: COLORS.accent,
                textDecoration: "none",
              }}
            >
              ← back to the dashboard
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
