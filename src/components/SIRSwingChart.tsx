import { SERIF, MONO, COLORS } from "@/styles/theme";
import { SmallCaps, SectionTitle } from "./common";
import findings from "@/data/findings.json";

const BLOC_COLOUR: Record<string, string> = {
  SPA: "#a04020",
  NDA: "#1f4e3d",
  TVK: "#a61e5e",
  OTHER: "#4a3a2c",
};

type QRow = {
  label: string;
  lo: number;
  hi: number;
  size: number;
  blocCounts: Record<string, number>;
  flipped: number;
};

const QuintileBar: React.FC<{ row: QRow; xLabel: (lo: number, hi: number) => string }> = ({ row, xLabel }) => {
  const total = (["TVK", "NDA", "SPA", "OTHER"] as const).reduce(
    (s, b) => s + (row.blocCounts[b] ?? 0),
    0
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
          {xLabel(row.lo, row.hi)}
        </div>
      </div>
      <div style={{
        height: "24px",
        background: "#e9dfc9",
        display: "flex",
        overflow: "hidden",
        position: "relative",
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
                transition: "width 200ms",
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

export const SIRSwingChart = () => {
  const sir = findings.sirQuintiles as QRow[];
  if (!sir?.length) return null;

  // Headline contrast: lightest vs heaviest TVK %
  const lightest = sir[0];
  const heaviest = sir[sir.length - 1];
  const lightTotal = (["TVK","NDA","SPA","OTHER"] as const).reduce((s, b) => s + (lightest.blocCounts[b] ?? 0), 0);
  const heavyTotal = (["TVK","NDA","SPA","OTHER"] as const).reduce((s, b) => s + (heaviest.blocCounts[b] ?? 0), 0);
  const lightTvkPct = (lightest.blocCounts.TVK ?? 0) * 100 / Math.max(1, lightTotal);
  const heavyTvkPct = (heaviest.blocCounts.TVK ?? 0) * 100 / Math.max(1, heavyTotal);

  return (
    <section style={{ margin: "60px 0" }}>
      <SectionTitle kicker="The SIR Effect">
        Where the cleansed roll changed the outcome.
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
        The Special Intensive Revision struck <strong style={{ color: COLORS.text, fontStyle: "normal" }}>74 lakh names</strong> from Tamil Nadu&apos;s rolls before this election. Did that cleansing shape the result? Sort the 234 ACs into five buckets by how heavily their rolls were cleaned, then look at who won in each bucket. The pattern is unmistakable.
      </p>

      <blockquote style={{
        margin: "0 0 28px",
        padding: "20px 24px",
        background: "#fff9ef",
        border: `1.5px solid ${COLORS.text}`,
        boxShadow: "6px 6px 0 rgba(26,20,16,0.05)",
      }}>
        <SmallCaps style={{ color: COLORS.accent, marginBottom: "4px" }}>
          The headline contrast
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
          In ACs with the lightest SIR cleanup, TVK won{" "}
          <span style={{ color: BLOC_COLOUR.TVK }}>{lightTvkPct.toFixed(0)}%</span> of seats.
          In ACs with the heaviest cleanup, TVK won{" "}
          <span style={{ color: BLOC_COLOUR.TVK }}>{heavyTvkPct.toFixed(0)}%</span>.
        </p>
        <p style={{ fontFamily: SERIF, fontSize: "13px", color: COLORS.muted, margin: 0, lineHeight: 1.5 }}>
          A {(heavyTvkPct / Math.max(1, lightTvkPct)).toFixed(1)}× swing toward the new party in places where the rolls were most aggressively shrunk. Whether SIR caused the swing or merely correlated with it, the gradient is real.
        </p>
      </blockquote>

      <div style={{
        background: "#fff9ef",
        border: `1.5px solid ${COLORS.text}`,
        boxShadow: "6px 6px 0 rgba(26,20,16,0.05)",
        padding: "22px 24px",
      }}>
        <SmallCaps style={{ color: COLORS.accent }}>
          234 ACs sorted by SIR-strike % (lightest → heaviest)
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
          The gradient.
        </h3>
        {sir.map((row) => (
          <QuintileBar
            key={row.label}
            row={row}
            xLabel={(lo, hi) => `${lo.toFixed(1)}–${hi.toFixed(1)}% struck`}
          />
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
          SIR-strike % = (electors-2021 − electors-2026) / electors-2021. ACs with negative strike (added more names than removed) sit in quintile 1. The 47 ACs with the heaviest cleanup gave TVK 36 of those seats — a 77% strike rate.
        </p>
      </div>
    </section>
  );
};
