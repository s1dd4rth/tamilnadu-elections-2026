import Link from "next/link";
import type { Metadata } from "next";
import { SERIF, MONO, COLORS } from "@/styles/theme";
import { SmallCaps, SectionTitle } from "@/components/common";
import { SeatHemicycle } from "@/components/SeatHemicycle";
import { SeatHexMap } from "@/components/SeatHexMap";
import { Live2026Section } from "@/components/Live2026Section";
import type { TimelineSnapshot } from "@/components/TimelineScrubber";
import analysisData from "@/data/analysis.json";
import resultsTimeline from "@/data/results-timeline.json";
import turnoutData from "@/data/turnout.json";

export const metadata: Metadata = {
  title: "TN 2026 · Counting Day · Live trends + 2021 baseline",
  description:
    "Live trends from ECI for the Tamil Nadu 2026 assembly count, with a timeline scrubber to replay the day. Compare to the 2021 seat hemicycle baseline; non-voter counts vs winning margins.",
  alternates: { canonical: "https://tn-dashboard-app.vercel.app/analysis" },
  openGraph: {
    title: "TN 2026 · Counting Day · Live trends",
    description:
      "Live ECI trends for TN 2026, with a scrubber to replay counting day, against the 2021 baseline.",
    url: "https://tn-dashboard-app.vercel.app/analysis",
    siteName: "TN Election 2026 Dashboard",
    locale: "en_IN",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "TN 2026 · Counting Day · Live trends",
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

  const ac2021 = analysisData.allianceCounts2021 as Record<string, number>;

  // 2021 legend: only the two blocs that actually won seats, with counts.
  const legend2021 = [
    { alliance: "SPA", count: ac2021.SPA },
    { alliance: "NDA", count: ac2021.NDA },
  ];

  // Pass only the (no, name) pairs the live section needs — keeps the
  // client bundle small instead of shipping the full analysis row per AC.
  const acsForLive = analysisData.acs.map((a) => ({ no: a.no, name: a.name }));

  return (
    <main id="main-content" style={{ maxWidth: "1200px", margin: "0 auto", background: "#faf4e8", minHeight: "100vh", padding: "16px" }}>
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

      <header style={{ marginBottom: "40px" }}>
        <SectionTitle kicker="Counting Day · 4 May 2026">The arithmetic of the ballot, hour by hour.</SectionTitle>
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
          Counting started this morning. The hemicycle and hex map below are not a static snapshot — every five minutes a new tick joins the timeline. Drag the slider to rewind the day; press play to watch the seats colour in. Below the live section, the 2021 baseline sits unchanged, so the 2026 result reads against the house it replaced.
        </p>
      </header>

      {/* LIVE 2026 — scrubber + paired hemicycle/hex map driven by the
          selected snapshot. Client component since it needs state. */}
      <Live2026Section
        acs={acsForLive}
        snapshots={resultsTimeline.snapshots as TimelineSnapshot[]}
      />

      {/* 2021 baseline — kept below the live section as a permanent
          point of comparison. */}
      <section style={{ marginBottom: "56px" }}>
        <SectionTitle kicker="2021 · Baseline">The house being replaced.</SectionTitle>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
            gap: "22px",
            alignItems: "start",
            marginTop: "20px",
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
          <SeatHexMap
            kicker="2021 · BASELINE"
            title="The map, drawn from the result."
            seats={seats2021}
            legend={legend2021}
            caption={
              <>
                One hex per constituency, arranged to follow Tamil Nadu's outline. Equal-area, so a Chennai ward and a Nilgiris hill seat carry the same visual weight. SPA swept the southern and delta belts; NDA held the western belt around Salem-Dharmapuri. Map tiles adapted from <a href="https://github.com/baskicanvas/tamilnadu-assembly-constituency-maps" style={{ color: COLORS.accent }} target="_blank" rel="noopener noreferrer">baskicanvas/tamilnadu-assembly-constituency-maps</a>.
              </>
            }
          />
        </div>
      </section>

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
              <li>· ECI · LIVE TRENDS (S22) · 4 MAY 2026</li>
              <li>· CEO TAMIL NADU · SIR FINAL ROLL</li>
            </ul>
          </div>
          <div>
            <SmallCaps style={{ color: COLORS.accent }}>Live update schedule</SmallCaps>
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "14px", color: "#3a302a", lineHeight: 1.6, marginTop: "12px" }}>
              The 2026 timeline above polls ECI's live results page roughly every five minutes. Snapshots are appended, never overwritten — so dragging the slider replays the day. Gaps in the timeline reflect periods when the poller wasn't running. Margins and runner-up data will land once per-AC counts are final.
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
