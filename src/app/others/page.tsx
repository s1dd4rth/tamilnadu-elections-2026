import Link from "next/link";
import type { Metadata } from "next";
import { SERIF, MONO, COLORS } from "@/styles/theme";
import { SmallCaps, SectionTitle } from "@/components/common";
import { FlipMatrix } from "@/components/FlipMatrix";
import { SIRSwingChart } from "@/components/SIRSwingChart";
import { NonVoterStory } from "@/components/NonVoterStory";
import { MarqueeRounds } from "@/components/MarqueeRounds";
import { NonVoterAnalysis } from "@/components/NonVoterAnalysis";

// Holding pen: sections that have been pulled off the main home page
// during the post-result IA cleanup. They remain wired to the same data
// files so they keep working — easy to move back to / or /analysis (or
// remove) once the final placement is decided.

export const metadata: Metadata = {
  title: "TN 2026 · Other Analyses",
  description:
    "Holding page for analytical sections temporarily moved off the main TN 2026 dashboard while the post-result IA is being reorganised.",
  alternates: { canonical: "https://tn-dashboard-app.vercel.app/others" },
  robots: { index: false, follow: false },
};

export default function OthersPage() {
  return (
    <main
      id="main-content"
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        background: "#faf4e8",
        minHeight: "100vh",
        padding: "16px",
      }}
    >
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
        <SmallCaps style={{ color: COLORS.muted }}>Holding · Other Analyses</SmallCaps>
      </nav>

      <header style={{ marginBottom: "40px" }}>
        <SectionTitle kicker="Holding · Reorg in progress">
          Sections still being placed.
        </SectionTitle>
        <p
          style={{
            fontFamily: SERIF,
            fontSize: "17px",
            lineHeight: 1.65,
            color: "#3a302a",
            maxWidth: "820px",
            margin: "16px 0 0",
            fontStyle: "italic",
          }}
        >
          These five sections were pulled off the home page during the post-result
          information-architecture pass. They remain wired to the same data and
          render correctly — parked here while the final home/analysis split is
          worked out. Some will return to <Link href="/" style={{ color: COLORS.accent }}>home</Link>{" "}
          or move into <Link href="/analysis" style={{ color: COLORS.accent }}>/analysis</Link>;
          the rest may be retired.
        </p>
      </header>

      <FlipMatrix />
      <SIRSwingChart />
      <NonVoterStory />
      <MarqueeRounds />
      <NonVoterAnalysis />

      <footer
        style={{
          marginTop: "80px",
          paddingTop: "32px",
          borderTop: `1px solid ${COLORS.text}`,
          paddingBottom: "40px",
          display: "flex",
          gap: "24px",
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
          ← back to the dashboard
        </Link>
        <Link
          href="/analysis"
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
          /analysis →
        </Link>
      </footer>
    </main>
  );
}
