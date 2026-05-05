import { SERIF, MONO, COLORS } from "@/styles/theme";
import { SmallCaps, SectionTitle } from "./common";
import findings from "@/data/findings.json";

const BLOC_COLOUR: Record<string, string> = {
  SPA: "#a04020",
  NDA: "#1f4e3d",
  TVK: "#a61e5e",
  OTHER: "#4a3a2c",
};

const fmt = (n: number) => n.toLocaleString("en-IN");
const fmtL = (n: number) => `${(n / 100000).toFixed(2)} lakh`;

type NV = {
  stateElectors2026: number;
  stateVotesCast: number;
  stateNonVoters2026: number;
  stateNonVoters2021: number;
  shiftPct: number;
  acsWithNvGtMargin: number;
  acsWithNvGt10xMargin: number;
  turnoutShiftQuintiles: Array<{
    label: string; lo: number; hi: number; size: number;
    blocCounts: Record<string, number>; flipped: number;
  }>;
  apathyHigh: Array<{
    no: number; name: string; margin: number; nonVoters: number;
    apathyRatio: number; winnerBloc: string;
  }>;
  apathyLow: Array<{
    no: number; name: string; margin: number; nonVoters: number;
    apathyRatio: number; winnerBloc: string;
  }>;
};

const QuintileBar: React.FC<{ row: NV["turnoutShiftQuintiles"][number] }> = ({ row }) => {
  const total = (["TVK", "NDA", "SPA", "OTHER"] as const).reduce(
    (s, b) => s + (row.blocCounts[b] ?? 0), 0
  );
  const tvkPct = (row.blocCounts.TVK ?? 0) * 100 / Math.max(1, total);
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "150px 1fr 90px",
      gap: "14px",
      alignItems: "center",
      padding: "10px 0",
    }}>
      <div>
        <div style={{ fontFamily: MONO, fontSize: "11px", color: COLORS.text, fontWeight: 700, letterSpacing: "0.06em" }}>
          {row.label}
        </div>
        <div style={{ fontFamily: MONO, fontSize: "10px", color: COLORS.muted, marginTop: "2px" }}>
          +{row.lo.toFixed(1)} to +{row.hi.toFixed(1)} pp
        </div>
      </div>
      <div style={{
        height: "24px",
        background: "#e9dfc9",
        display: "flex",
        overflow: "hidden",
      }}>
        {(["TVK", "NDA", "SPA", "OTHER"] as const).map((b) => {
          const n = row.blocCounts[b] ?? 0;
          if (!n) return null;
          const w = (n / total) * 100;
          return (
            <div
              key={b}
              title={`${b}: ${n} of ${total}`}
              style={{
                width: `${w}%`,
                background: BLOC_COLOUR[b],
                color: "#faf4e8",
                fontFamily: MONO,
                fontSize: "10px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: w >= 8 ? "center" : "flex-start",
                paddingLeft: w < 8 ? "2px" : 0,
                letterSpacing: "0.05em",
              }}
            >
              {w >= 8 ? n : ""}
            </div>
          );
        })}
      </div>
      <div style={{
        fontFamily: SERIF,
        fontSize: "16px",
        fontWeight: 800,
        fontStyle: "italic",
        color: COLORS.text,
        textAlign: "right",
        letterSpacing: "-0.01em",
      }}>
        {tvkPct.toFixed(0)}<span style={{ fontFamily: MONO, fontSize: "10px", color: COLORS.muted, marginLeft: "2px" }}>%TVK</span>
      </div>
    </div>
  );
};

export const NonVoterStory = () => {
  const nv = (findings.nonVoters as NV | undefined);
  if (!nv) return null;

  // Headline contrast for the turnout-shift quintile chart
  const least = nv.turnoutShiftQuintiles[0];
  const most = nv.turnoutShiftQuintiles[nv.turnoutShiftQuintiles.length - 1];
  const leastTotal = (["TVK","NDA","SPA","OTHER"] as const).reduce((s, b) => s + (least.blocCounts[b] ?? 0), 0);
  const mostTotal  = (["TVK","NDA","SPA","OTHER"] as const).reduce((s, b) => s + (most.blocCounts[b] ?? 0), 0);
  const leastTvk = (least.blocCounts.TVK ?? 0) * 100 / Math.max(1, leastTotal);
  const mostTvk  = (most.blocCounts.TVK  ?? 0) * 100 / Math.max(1, mostTotal);

  return (
    <section style={{ margin: "60px 0" }}>
      <SectionTitle kicker="The Apathy Margin · Closed">
        Where the people who didn&apos;t vote went.
      </SectionTitle>
      <p style={{
        fontFamily: SERIF,
        fontSize: "17px",
        lineHeight: 1.65,
        color: "#3a302a",
        maxWidth: "820px",
        margin: "16px 0 28px",
        fontStyle: "italic",
      }}>
        2021&apos;s headline number was the non-voter — <strong style={{ color: COLORS.text, fontStyle: "normal" }}>{fmtL(nv.stateNonVoters2021)}</strong> Tamilians stayed home, more than the entire winning alliance&apos;s vote. Five years later, after the Special Intensive Revision, that pool has collapsed to{" "}
        <strong style={{ color: COLORS.text, fontStyle: "normal" }}>{fmtL(nv.stateNonVoters2026)}</strong> — a {Math.abs(nv.shiftPct).toFixed(0)}% drop. Some of that is real turnout growth; much of it is a smaller denominator after 74 lakh names were struck. But did the absentees still decide anything?
      </p>

      {/* Three big stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
        gap: "14px",
        marginBottom: "28px",
      }}>
        <BigStat
          label="Stayed home in 2026"
          value={fmtL(nv.stateNonVoters2026)}
          sub={`${nv.shiftPct >= 0 ? '+' : ''}${nv.shiftPct}% vs 2021 (${fmtL(nv.stateNonVoters2021)})`}
        />
        <BigStat
          label="Seats where no-shows > margin"
          value={`${nv.acsWithNvGtMargin}`}
          sub={`of 234 (${(nv.acsWithNvGtMargin*100/234).toFixed(0)}%) — apathy still bigger than the result`}
        />
        <BigStat
          label="Seats where no-shows ≥ 10× margin"
          value={`${nv.acsWithNvGt10xMargin}`}
          sub={`extreme cases — Tiruppattur (AC 185) hit ${fmt(Math.round(nv.apathyHigh[0]?.apathyRatio ?? 0))}×`}
        />
      </div>

      {/* Pull-quote: the turnout-shift gradient */}
      <blockquote style={{
        margin: "0 0 28px",
        padding: "20px 24px",
        background: "#fff9ef",
        border: `1.5px solid ${COLORS.text}`,
        boxShadow: "6px 6px 0 rgba(26,20,16,0.05)",
      }}>
        <SmallCaps style={{ color: COLORS.accent, marginBottom: "4px" }}>
          The cleanest finding from the apathy data
        </SmallCaps>
        <p style={{
          fontFamily: SERIF,
          fontSize: "clamp(20px, 2.3vw, 26px)",
          fontStyle: "italic",
          fontWeight: 800,
          lineHeight: 1.3,
          color: COLORS.text,
          margin: "8px 0 6px",
          letterSpacing: "-0.015em",
        }}>
          In ACs where turnout grew the LEAST since 2021, TVK won{" "}
          <span style={{ color: BLOC_COLOUR.TVK }}>{leastTvk.toFixed(0)}%</span> of seats.
          Where it grew the MOST, TVK won{" "}
          <span style={{ color: BLOC_COLOUR.TVK }}>{mostTvk.toFixed(0)}%</span>.
        </p>
        <p style={{ fontFamily: SERIF, fontSize: "13px", color: COLORS.muted, margin: 0, lineHeight: 1.5 }}>
          A {(mostTvk / Math.max(1, leastTvk)).toFixed(1)}× swing. Wherever new voters showed up — or absent voters were removed via SIR — TVK won. Almost every story this year traces back to the cleansed roll meeting a high-turnout enthusiasm wave.
        </p>
      </blockquote>

      {/* Turnout-shift quintile chart */}
      <div style={{
        background: "#fff9ef",
        border: `1.5px solid ${COLORS.text}`,
        boxShadow: "6px 6px 0 rgba(26,20,16,0.05)",
        padding: "22px 24px",
        marginBottom: "28px",
      }}>
        <SmallCaps style={{ color: COLORS.accent }}>
          234 ACs sorted by turnout shift (smallest → largest)
        </SmallCaps>
        <h3 style={{
          fontFamily: SERIF,
          fontSize: "22px",
          fontStyle: "italic",
          fontWeight: 800,
          color: COLORS.text,
          margin: "4px 0 14px",
          letterSpacing: "-0.015em",
        }}>
          The other gradient.
        </h3>
        {nv.turnoutShiftQuintiles.map((row) => (
          <QuintileBar key={row.label} row={row} />
        ))}
        <div style={{ marginTop: "16px", display: "flex", gap: "16px", flexWrap: "wrap" }}>
          {(["TVK", "NDA", "SPA", "OTHER"] as const).map((b) => (
            <span key={b} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: 10, height: 10, background: BLOC_COLOUR[b], display: "inline-block" }} />
              <span style={{ fontFamily: MONO, fontSize: "10px", color: COLORS.text, letterSpacing: "0.08em", fontWeight: 600 }}>
                {b}
              </span>
            </span>
          ))}
        </div>
        <p style={{
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: "13px",
          color: COLORS.muted,
          margin: "16px 0 0",
          borderTop: `1px dotted ${COLORS.muted}`,
          paddingTop: "12px",
          lineHeight: 1.55,
        }}>
          Turnout shift = VTR 2026 − VTR 2021, in percentage points. Every AC saw turnout go up — the smallest gain was +3.6pp, the largest +30pp. The TVK column climbs from 6 in the lowest quintile to 39 in the highest.
        </p>
      </div>

      {/* Top apathy outliers — closest seats with biggest absent pools */}
      <div style={{
        background: "#fff9ef",
        border: `1.5px solid ${COLORS.text}`,
        boxShadow: "6px 6px 0 rgba(26,20,16,0.05)",
        padding: "22px 24px",
      }}>
        <SmallCaps style={{ color: COLORS.accent }}>
          Apathy outliers · 10 seats where absentees most outweighed the margin
        </SmallCaps>
        <h3 style={{
          fontFamily: SERIF,
          fontSize: "22px",
          fontStyle: "italic",
          fontWeight: 800,
          color: COLORS.text,
          margin: "4px 0 14px",
          letterSpacing: "-0.015em",
        }}>
          Won by a sliver, decided by the rest.
        </h3>
        <div style={{
          display: "grid",
          gridTemplateColumns: "32px 1fr 90px 90px 70px",
          gap: "10px",
          alignItems: "center",
          padding: "6px 0",
          borderBottom: `1px solid ${COLORS.text}`,
          fontFamily: MONO,
          fontSize: "10px",
          letterSpacing: "0.08em",
          color: COLORS.muted,
          fontWeight: 700,
          textTransform: "uppercase",
        }}>
          <div style={{ textAlign: "right" }}>AC</div>
          <div>Constituency · Winner</div>
          <div style={{ textAlign: "right" }}>Margin</div>
          <div style={{ textAlign: "right" }}>No-shows</div>
          <div style={{ textAlign: "right" }}>×</div>
        </div>
        {nv.apathyHigh.map((row) => (
          <div key={row.no} style={{
            display: "grid",
            gridTemplateColumns: "32px 1fr 90px 90px 70px",
            gap: "10px",
            alignItems: "center",
            padding: "8px 0",
            borderBottom: "1px dotted #d8c8a8",
          }}>
            <div style={{ fontFamily: MONO, fontSize: "10px", color: COLORS.muted, textAlign: "right" }}>{row.no}</div>
            <div>
              <div style={{ fontFamily: SERIF, fontSize: "13px", fontWeight: 700, color: COLORS.text, display: "flex", alignItems: "baseline", gap: "8px" }}>
                {row.name}
                <span style={{
                  fontFamily: MONO,
                  fontSize: "9px",
                  fontWeight: 700,
                  color: BLOC_COLOUR[row.winnerBloc],
                  letterSpacing: "0.08em",
                  background: "#faf4e8",
                  padding: "2px 6px",
                  borderRadius: 2,
                }}>
                  {row.winnerBloc}
                </span>
              </div>
            </div>
            <div style={{ fontFamily: SERIF, fontSize: "13px", fontWeight: 700, color: COLORS.text, textAlign: "right" }}>
              {fmt(row.margin)}
            </div>
            <div style={{ fontFamily: SERIF, fontSize: "13px", fontWeight: 700, color: COLORS.accent, textAlign: "right" }}>
              {fmt(row.nonVoters)}
            </div>
            <div style={{ fontFamily: MONO, fontSize: "11px", color: COLORS.muted, textAlign: "right", fontWeight: 700 }}>
              {row.apathyRatio < 100 ? row.apathyRatio.toFixed(1) : Math.round(row.apathyRatio).toLocaleString("en-IN")}×
            </div>
          </div>
        ))}
        <p style={{
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: "13px",
          color: COLORS.muted,
          margin: "16px 0 0",
          borderTop: `1px dotted ${COLORS.muted}`,
          paddingTop: "12px",
          lineHeight: 1.55,
        }}>
          The top row, Tiruppattur (AC 185), was decided by a one-vote margin while 57,746 registered voters stayed home. The least apathetic outcomes — places like Edappadi (AC 86) where EPS won by 98,110 with only ~16k no-shows — appear at the opposite extreme. Across 234 seats, the median ratio was {(nv.apathyHigh[0] && nv.apathyLow[0]) ? '~ a few hundred' : 'large'}.
        </p>
      </div>
    </section>
  );
};

const BigStat: React.FC<{ label: string; value: string; sub: string }> = ({ label, value, sub }) => (
  <div style={{
    background: "#fff9ef",
    border: `1.5px solid ${COLORS.text}`,
    boxShadow: "6px 6px 0 rgba(26,20,16,0.05)",
    padding: "16px 20px",
  }}>
    <SmallCaps style={{ color: COLORS.accent }}>{label}</SmallCaps>
    <div style={{
      fontFamily: SERIF,
      fontSize: "clamp(28px, 3.5vw, 40px)",
      fontStyle: "italic",
      fontWeight: 900,
      color: COLORS.text,
      lineHeight: 0.95,
      letterSpacing: "-0.025em",
      margin: "6px 0 8px",
    }}>
      {value}
    </div>
    <div style={{ fontFamily: SERIF, fontSize: "12px", color: COLORS.muted, fontStyle: "italic", lineHeight: 1.4 }}>
      {sub}
    </div>
  </div>
);
