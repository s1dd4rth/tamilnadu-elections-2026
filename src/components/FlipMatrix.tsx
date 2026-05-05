import { SERIF, MONO, COLORS } from "@/styles/theme";
import { SmallCaps, SectionTitle } from "./common";
import findings from "@/data/findings.json";

const BLOC_COLOUR: Record<string, string> = {
  SPA: "#a04020",
  NDA: "#1f4e3d",
  TVK: "#a61e5e",
  OTHER: "#4a3a2c",
};

const ALLIANCE_LABEL: Record<string, string> = {
  SPA: "DMK-led SPA",
  NDA: "AIADMK-led NDA",
  TVK: "TVK (Vijay)",
  OTHER: "Other",
};

export const FlipMatrix = () => {
  const matrix = findings.flipMatrix as {
    rows: string[];
    cols: string[];
    counts: Record<string, Record<string, number>>;
  };
  if (!matrix?.rows?.length) return null;

  // Row totals (2021)
  const rowTotal = (r: string) => matrix.cols.reduce((s, c) => s + (matrix.counts[r]?.[c] ?? 0), 0);
  // Col totals (2026)
  const colTotal = (c: string) => matrix.rows.reduce((s, r) => s + (matrix.counts[r]?.[c] ?? 0), 0);
  const grand = matrix.rows.reduce((s, r) => s + rowTotal(r), 0);

  // Find biggest single flip
  const flipsList: Array<{ from: string; to: string; n: number }> = [];
  for (const r of matrix.rows) {
    for (const c of matrix.cols) {
      const n = matrix.counts[r]?.[c] ?? 0;
      if (n > 0) flipsList.push({ from: r, to: c, n });
    }
  }
  const heldRows = matrix.rows.flatMap((r) => (matrix.counts[r]?.[r] != null ? [{ r, n: matrix.counts[r]?.[r] ?? 0 }] : []));
  const flipsOnly = flipsList.filter((f) => f.from !== f.to).sort((a, b) => b.n - a.n);
  const biggestFlip = flipsOnly[0];

  return (
    <section style={{ margin: "60px 0" }}>
      <SectionTitle kicker="The Flip Matrix · 2021 → 2026">
        Where the 234 seats came from.
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
        Every 2026 winner was either a hold from the alliance that won that seat in 2021, or a flip. The grid below counts both — read across each row to see where a 2021 alliance&apos;s seats went; read down a column to see where each 2026 bloc&apos;s seats came from.{" "}
        {biggestFlip && (
          <>
            The single biggest flow:{" "}
            <strong style={{ color: COLORS.text, fontStyle: "normal" }}>
              {biggestFlip.n} seats moved from {ALLIANCE_LABEL[biggestFlip.from] ?? biggestFlip.from}{" "}
              to {ALLIANCE_LABEL[biggestFlip.to] ?? biggestFlip.to}.
            </strong>
          </>
        )}
      </p>

      <div style={{
        background: "#fff9ef",
        border: `1.5px solid ${COLORS.text}`,
        boxShadow: "6px 6px 0 rgba(26,20,16,0.05)",
        padding: "22px 24px",
        overflowX: "auto",
      }}>
        <SmallCaps style={{ color: COLORS.accent }}>234 seats · 2021 alliance ↓ × 2026 bloc →</SmallCaps>
        <table style={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: 0,
          marginTop: "14px",
          fontFamily: SERIF,
        }}>
          <thead>
            <tr>
              <th style={{
                padding: "10px 12px",
                textAlign: "left",
                borderBottom: `2px solid ${COLORS.text}`,
                fontFamily: MONO,
                fontSize: "10px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: COLORS.muted,
              }}>
                ↓ from 2021
              </th>
              {matrix.cols.map((c) => (
                <th key={c} style={{
                  padding: "10px 12px",
                  textAlign: "center",
                  borderBottom: `2px solid ${COLORS.text}`,
                  fontFamily: MONO,
                  fontSize: "10px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: BLOC_COLOUR[c],
                  fontWeight: 700,
                }}>
                  → {c}
                </th>
              ))}
              <th style={{
                padding: "10px 12px",
                textAlign: "right",
                borderBottom: `2px solid ${COLORS.text}`,
                fontFamily: MONO,
                fontSize: "10px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: COLORS.muted,
              }}>
                2021
              </th>
            </tr>
          </thead>
          <tbody>
            {matrix.rows.map((r) => (
              <tr key={r}>
                <td style={{
                  padding: "10px 12px",
                  borderBottom: "1px dotted #d8c8a8",
                  fontFamily: MONO,
                  fontSize: "11px",
                  letterSpacing: "0.06em",
                  color: BLOC_COLOUR[r] ?? COLORS.text,
                  fontWeight: 700,
                }}>
                  {r}
                </td>
                {matrix.cols.map((c) => {
                  const n = matrix.counts[r]?.[c] ?? 0;
                  const isHold = r === c;
                  const intensity = n / Math.max(1, grand) * 6; // 0..1ish
                  // Slight tinting for non-zero cells, deeper for holds
                  const bg = n === 0 ? "transparent" : isHold
                    ? `${BLOC_COLOUR[r]}${Math.round(intensity * 255).toString(16).padStart(2, "0")}`
                    : `${BLOC_COLOUR[c]}${Math.round(intensity * 255).toString(16).padStart(2, "0")}`;
                  return (
                    <td key={c} style={{
                      padding: "10px 12px",
                      borderBottom: "1px dotted #d8c8a8",
                      textAlign: "center",
                      fontFamily: SERIF,
                      fontSize: n > 0 ? (n >= 50 ? "26px" : n >= 20 ? "22px" : "18px") : "14px",
                      fontWeight: n > 0 ? 800 : 400,
                      fontStyle: "italic",
                      color: n > 0 ? (isHold ? COLORS.text : BLOC_COLOUR[c]) : COLORS.muted,
                      background: bg,
                      letterSpacing: "-0.015em",
                    }}>
                      {n > 0 ? n : "·"}
                    </td>
                  );
                })}
                <td style={{
                  padding: "10px 12px",
                  borderBottom: "1px dotted #d8c8a8",
                  textAlign: "right",
                  fontFamily: SERIF,
                  fontSize: "16px",
                  fontWeight: 700,
                  fontStyle: "italic",
                  color: COLORS.text,
                }}>
                  {rowTotal(r)}
                </td>
              </tr>
            ))}
            <tr>
              <td style={{
                padding: "10px 12px",
                fontFamily: MONO,
                fontSize: "10px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: COLORS.muted,
                fontWeight: 700,
                borderTop: `2px solid ${COLORS.text}`,
              }}>
                2026 total
              </td>
              {matrix.cols.map((c) => (
                <td key={c} style={{
                  padding: "10px 12px",
                  textAlign: "center",
                  fontFamily: SERIF,
                  fontSize: "20px",
                  fontWeight: 800,
                  fontStyle: "italic",
                  color: BLOC_COLOUR[c],
                  borderTop: `2px solid ${COLORS.text}`,
                }}>
                  {colTotal(c)}
                </td>
              ))}
              <td style={{
                padding: "10px 12px",
                textAlign: "right",
                fontFamily: SERIF,
                fontSize: "20px",
                fontWeight: 800,
                fontStyle: "italic",
                color: COLORS.text,
                borderTop: `2px solid ${COLORS.text}`,
              }}>
                {grand}
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{
          marginTop: "20px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "14px",
        }}>
          {flipsOnly.slice(0, 4).map((f) => (
            <div key={`${f.from}-${f.to}`} style={{
              padding: "10px 14px",
              borderLeft: `3px solid ${BLOC_COLOUR[f.to]}`,
              background: "#faf4e8",
            }}>
              <div style={{ fontFamily: MONO, fontSize: "10px", letterSpacing: "0.08em", color: COLORS.muted, textTransform: "uppercase" }}>
                {ALLIANCE_LABEL[f.from] ?? f.from} → {ALLIANCE_LABEL[f.to] ?? f.to}
              </div>
              <div style={{ fontFamily: SERIF, fontSize: "26px", fontStyle: "italic", fontWeight: 800, color: COLORS.text, letterSpacing: "-0.015em" }}>
                {f.n} seat{f.n === 1 ? "" : "s"}
              </div>
            </div>
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
          Diagonal cells = held; off-diagonal = flipped. SPA contested with the same 2021 partners; NDA reabsorbed BJP+PMK in 2024 and contested as a single bloc; TVK and NTK contested solo. Read against the 2021 baseline on the /analysis page.
        </p>
      </div>
    </section>
  );
};
