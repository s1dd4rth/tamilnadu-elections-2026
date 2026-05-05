import { SERIF, MONO, COLORS } from "@/styles/theme";
import { SmallCaps, SectionTitle } from "./common";
import marginAtlas from "@/data/margin-atlas.json";
import detail from "@/data/results-2026-detail.json";

type AtlasRow = {
  no: number;
  name: string;
  winner: { name: string; party: string; bloc: string };
  runnerUp: { name: string; party: string; bloc: string };
  margin: number;
  rounds: string;
  status: string;
};

const BLOC_COLOUR: Record<string, string> = {
  SPA: "#a04020",
  NDA: "#1f4e3d",
  TVK: "#a61e5e",
  NTK: "#d8a520",
  IND: "#7a6a56",
  OTHER: "#4a3a2c",
};

const BLOC_SHORT: Record<string, string> = {
  SPA: "SPA", NDA: "NDA", TVK: "TVK", NTK: "NTK", IND: "IND", OTHER: "OTH",
};

const fmt = (n: number) => n.toLocaleString("en-IN");

// Tiny inline pill for a bloc tag — matches the legend tokens used elsewhere.
const BlocChip: React.FC<{ bloc: string }> = ({ bloc }) => (
  <span
    style={{
      display: "inline-block",
      background: BLOC_COLOUR[bloc] ?? BLOC_COLOUR.OTHER,
      color: "#faf4e8",
      fontFamily: MONO,
      fontSize: "9px",
      fontWeight: 700,
      letterSpacing: "0.1em",
      padding: "2px 6px",
      borderRadius: 2,
      verticalAlign: "1px",
      whiteSpace: "nowrap",
    }}
  >
    {BLOC_SHORT[bloc] ?? bloc}
  </span>
);

const SeatRow: React.FC<{ row: AtlasRow; maxMargin: number }> = ({ row, maxMargin }) => {
  // Visual bar: width proportional to margin / maxMargin in this column
  const w = Math.max(2, Math.round((row.margin / maxMargin) * 100));
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "32px 1fr 64px",
      gap: "10px",
      alignItems: "center",
      padding: "6px 0",
      borderBottom: "1px dotted #d8c8a8",
    }}>
      <div style={{ fontFamily: MONO, fontSize: "10px", color: COLORS.muted, textAlign: "right" }}>
        {row.no}
      </div>
      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "2px" }}>
          <span style={{ fontFamily: SERIF, fontSize: "13px", fontWeight: 700, color: COLORS.text }}>
            {row.name}
          </span>
          <BlocChip bloc={row.winner.bloc} />
        </div>
        <div style={{ fontFamily: SERIF, fontSize: "11px", color: "#5a4d3f", fontStyle: "italic", lineHeight: 1.35 }}>
          {row.winner.name} <span style={{ color: COLORS.muted }}>over</span>{" "}
          {row.runnerUp.name} <span style={{ color: COLORS.muted, fontStyle: "normal" }}>·</span>{" "}
          <BlocChip bloc={row.runnerUp.bloc} />
        </div>
        {/* The margin bar — coloured by winner bloc, scaled to column max.
            overflow:hidden as a defensive clip in case any computed width
            goes >100% from a future data anomaly. */}
        <div style={{
          height: "3px",
          background: "#e9dfc9",
          marginTop: "4px",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", left: 0, top: 0, bottom: 0,
            width: `${w}%`,
            background: BLOC_COLOUR[row.winner.bloc] ?? BLOC_COLOUR.OTHER,
          }} />
        </div>
      </div>
      <div style={{
        fontFamily: SERIF,
        fontSize: "15px",
        fontWeight: 800,
        fontStyle: "italic",
        color: COLORS.text,
        textAlign: "right",
        letterSpacing: "-0.01em",
      }}>
        {fmt(row.margin)}
      </div>
    </div>
  );
};

type DetailCand = {
  rank: number;
  name: string;
  party: string;
  evm: number;
  postal: number;
  total: number;
  share: number;
};
type DetailFile = { ac: Record<string, DetailCand[]> };

// Cross-reference each AC's winning margin against its NOTA tally.
// Returns rows where NOTA > margin, sorted by margin ascending (most
// striking first — closest race where NOTA ate the result).
const notaOverMargin = (rows: AtlasRow[], detailAc: Record<string, DetailCand[]>) => {
  const out: Array<AtlasRow & { nota: number }> = [];
  for (const r of rows) {
    const cands = detailAc[String(r.no)];
    if (!cands) continue;
    const nota = cands.find((c) => c.party === "None of the Above")?.total ?? 0;
    if (nota > r.margin) out.push({ ...r, nota });
  }
  return out.sort((a, b) => a.margin - b.margin);
};

export const MarginAtlas = () => {
  const rows = (marginAtlas.rows as AtlasRow[]).slice();
  if (!rows.length) return null;
  const detailAc = (detail as DetailFile).ac;
  const notaSeats = notaOverMargin(rows, detailAc);

  const sortedAsc = [...rows].sort((a, b) => a.margin - b.margin);
  const sortedDesc = [...rows].sort((a, b) => b.margin - a.margin);
  const tightest = sortedAsc.slice(0, 10);
  const biggest = sortedDesc.slice(0, 10);

  // Median margin (using the lower-middle for an even count of 234)
  const sortedM = [...rows].map((r) => r.margin).sort((a, b) => a - b);
  const median = sortedM[Math.floor(sortedM.length / 2)];

  // Headline numbers
  const tightestRow = sortedAsc[0];
  const biggestRow = sortedDesc[0];

  // Per-bloc margin distribution — count of seats by margin bucket
  const buckets: Array<[string, [number, number]]> = [
    ["< 1k",   [0, 999]],
    ["1–5k",   [1000, 4999]],
    ["5–10k",  [5000, 9999]],
    ["10–20k", [10000, 19999]],
    ["20–40k", [20000, 39999]],
    ["40k+",   [40000, Infinity]],
  ];
  const dist = buckets.map(([label, [lo, hi]]) => ({
    label,
    SPA: rows.filter((r) => r.margin >= lo && r.margin <= hi && r.winner.bloc === "SPA").length,
    NDA: rows.filter((r) => r.margin >= lo && r.margin <= hi && r.winner.bloc === "NDA").length,
    TVK: rows.filter((r) => r.margin >= lo && r.margin <= hi && r.winner.bloc === "TVK").length,
    OTHER: rows.filter((r) => r.margin >= lo && r.margin <= hi &&
      !["SPA","NDA","TVK"].includes(r.winner.bloc)).length,
  }));
  const distMax = Math.max(...dist.map((d) => d.SPA + d.NDA + d.TVK + d.OTHER));

  // Scale bars by the MAX margin in each column so widths stay ≤ 100%.
  // (Earlier version scaled tightest by the 2nd-tightest to avoid the
  // 1-vote outlier collapsing everything to 1px — but that produced
  // widths > 100% for the rest of the rows, which overflowed the cell
  // and bled across the page.)
  const tightestMax = tightest[tightest.length - 1].margin;
  const biggestMax = biggest[0].margin;

  return (
    <section style={{ margin: "60px 0" }}>
      <SectionTitle kicker="Margin Atlas · The Day After">
        How close was close?
      </SectionTitle>

      <p style={{
        fontFamily: SERIF,
        fontSize: "17px",
        lineHeight: 1.65,
        color: "#3a302a",
        maxWidth: "820px",
        margin: "16px 0 32px",
        fontStyle: "italic",
      }}>
        234 races, settled. The median seat changed hands by{" "}
        <strong style={{ color: COLORS.text, fontStyle: "normal" }}>{fmt(median)} votes</strong>.
        The tightest was decided by{" "}
        <strong style={{ color: COLORS.accent, fontStyle: "normal" }}>{fmt(tightestRow.margin)}</strong>.
        The biggest blowout — {biggestRow.winner.name.split(" ")[0]} {biggestRow.winner.name.split(" ").slice(-1)[0]} in{" "}
        {biggestRow.name} — by{" "}
        <strong style={{ color: COLORS.text, fontStyle: "normal" }}>{fmt(biggestRow.margin)}</strong>.
      </p>

      {/* Pull-quote for the 1-vote AC 185 — the headline of margins */}
      <blockquote style={{
        margin: "0 0 36px",
        padding: "20px 24px",
        background: "#fff9ef",
        border: `1.5px solid ${COLORS.text}`,
        boxShadow: "6px 6px 0 rgba(26,20,16,0.05)",
        position: "relative",
      }}>
        <SmallCaps style={{ color: COLORS.accent, marginBottom: "4px" }}>
          The closest seat in 2026 — possibly ever
        </SmallCaps>
        <p style={{
          fontFamily: SERIF,
          fontSize: "clamp(20px, 2.4vw, 28px)",
          fontStyle: "italic",
          fontWeight: 800,
          lineHeight: 1.25,
          color: COLORS.text,
          margin: "8px 0 6px",
          letterSpacing: "-0.015em",
        }}>
          {tightestRow.name} (AC {tightestRow.no}) was decided by{" "}
          <span style={{ color: BLOC_COLOUR[tightestRow.winner.bloc] }}>
            {fmt(tightestRow.margin)} vote{tightestRow.margin === 1 ? "" : "s"}
          </span>.
        </p>
        <p style={{ fontFamily: SERIF, fontSize: "13px", color: COLORS.muted, margin: 0, lineHeight: 1.5 }}>
          {tightestRow.winner.name} ({tightestRow.winner.party}) over {tightestRow.runnerUp.name} ({tightestRow.runnerUp.party}). The lead in this AC flipped overnight; ECI declared the result at the very end of counting day.
        </p>
      </blockquote>

      {/* Two columns: tightest + biggest */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "26px",
        marginBottom: "36px",
      }}>
        <div style={{
          background: "#fff9ef",
          border: `1.5px solid ${COLORS.text}`,
          boxShadow: "6px 6px 0 rgba(26,20,16,0.05)",
          padding: "22px 24px",
        }}>
          <SmallCaps style={{ color: COLORS.accent }}>10 Tightest Wins</SmallCaps>
          <h3 style={{
            fontFamily: SERIF,
            fontSize: "22px",
            fontStyle: "italic",
            fontWeight: 800,
            color: COLORS.text,
            margin: "4px 0 14px",
            letterSpacing: "-0.015em",
          }}>
            Decided on the margins.
          </h3>
          <div>
            {tightest.map((row) => (
              <SeatRow key={row.no} row={row} maxMargin={tightestMax} />
            ))}
          </div>
        </div>

        <div style={{
          background: "#fff9ef",
          border: `1.5px solid ${COLORS.text}`,
          boxShadow: "6px 6px 0 rgba(26,20,16,0.05)",
          padding: "22px 24px",
        }}>
          <SmallCaps style={{ color: COLORS.accent }}>10 Biggest Wins</SmallCaps>
          <h3 style={{
            fontFamily: SERIF,
            fontSize: "22px",
            fontStyle: "italic",
            fontWeight: 800,
            color: COLORS.text,
            margin: "4px 0 14px",
            letterSpacing: "-0.015em",
          }}>
            Walkovers.
          </h3>
          <div>
            {biggest.map((row) => (
              <SeatRow key={row.no} row={row} maxMargin={biggestMax} />
            ))}
          </div>
        </div>
      </div>

      {/* Margin distribution histogram */}
      <div style={{
        background: "#fff9ef",
        border: `1.5px solid ${COLORS.text}`,
        boxShadow: "6px 6px 0 rgba(26,20,16,0.05)",
        padding: "22px 24px",
      }}>
        <SmallCaps style={{ color: COLORS.accent }}>Margin Distribution · 234 seats</SmallCaps>
        <h3 style={{
          fontFamily: SERIF,
          fontSize: "22px",
          fontStyle: "italic",
          fontWeight: 800,
          color: COLORS.text,
          margin: "4px 0 14px",
          letterSpacing: "-0.015em",
        }}>
          Where the seats sit.
        </h3>

        {/* Stacked bars by bucket — coloured by winning bloc */}
        <div style={{ marginTop: "16px" }}>
          {dist.map((d) => {
            const total = d.SPA + d.NDA + d.TVK + d.OTHER;
            const pct = (n: number) => (n / distMax) * 100;
            return (
              <div key={d.label} style={{
                display: "grid",
                gridTemplateColumns: "78px 1fr 36px",
                gap: "12px",
                alignItems: "center",
                padding: "8px 0",
              }}>
                <div style={{ fontFamily: MONO, fontSize: "11px", color: COLORS.muted, letterSpacing: "0.06em" }}>
                  {d.label}
                </div>
                <div style={{
                  display: "flex",
                  height: "20px",
                  background: "#e9dfc9",
                  borderRadius: 0,
                  overflow: "hidden",
                }}>
                  {(["TVK", "NDA", "SPA", "OTHER"] as const).map((b) => (
                    d[b] > 0 && (
                      <div key={b} title={`${b}: ${d[b]}`} style={{
                        width: `${pct(d[b])}%`,
                        background: BLOC_COLOUR[b],
                        transition: "width 200ms",
                      }} />
                    )
                  ))}
                </div>
                <div style={{
                  fontFamily: SERIF,
                  fontSize: "13px",
                  fontWeight: 700,
                  color: COLORS.text,
                  textAlign: "right",
                }}>
                  {total}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mini legend */}
        <div style={{ marginTop: "14px", display: "flex", gap: "16px", flexWrap: "wrap" }}>
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
          Source: ECI live trends, S22 statewise tables, captured at counting day close. Margin = leading − trailing in the official Form-20 reconciliation.
        </p>
      </div>

      {/* NOTA-bigger-than-margin section */}
      {notaSeats.length > 0 && (
        <div style={{
          marginTop: "26px",
          background: "#fff9ef",
          border: `1.5px solid ${COLORS.text}`,
          boxShadow: "6px 6px 0 rgba(26,20,16,0.05)",
          padding: "22px 24px",
        }}>
          <SmallCaps style={{ color: COLORS.accent }}>
            NOTA &gt; Margin · {notaSeats.length} seats
          </SmallCaps>
          <h3 style={{
            fontFamily: SERIF,
            fontSize: "22px",
            fontStyle: "italic",
            fontWeight: 800,
            color: COLORS.text,
            margin: "4px 0 6px",
            letterSpacing: "-0.015em",
          }}>
            Where the &ldquo;none of the above&rdquo; vote outvoted the verdict.
          </h3>
          <p style={{
            fontFamily: SERIF,
            fontSize: "14px",
            lineHeight: 1.55,
            color: "#3a302a",
            margin: "0 0 16px",
            fontStyle: "italic",
            maxWidth: "780px",
          }}>
            In <strong style={{ color: COLORS.text, fontStyle: "normal" }}>{notaSeats.length}</strong> of 234 constituencies, more voters pressed the NOTA button than the entire winning margin between first and second place. A protest vote that, in another counting day, would have been the swing.
          </p>
          <div style={{ marginTop: "10px" }}>
            {/* Header row */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "32px 1fr 90px 90px 60px",
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
              <div style={{ textAlign: "right" }}>NOTA</div>
              <div style={{ textAlign: "right" }}>×</div>
            </div>
            {notaSeats.map((row) => {
              const ratio = row.nota / row.margin;
              return (
                <div key={row.no} style={{
                  display: "grid",
                  gridTemplateColumns: "32px 1fr 90px 90px 60px",
                  gap: "10px",
                  alignItems: "center",
                  padding: "6px 0",
                  borderBottom: "1px dotted #d8c8a8",
                }}>
                  <div style={{ fontFamily: MONO, fontSize: "10px", color: COLORS.muted, textAlign: "right" }}>
                    {row.no}
                  </div>
                  <div>
                    <div style={{ fontFamily: SERIF, fontSize: "13px", fontWeight: 700, color: COLORS.text, display: "flex", alignItems: "baseline", gap: "8px" }}>
                      {row.name}
                      <BlocChip bloc={row.winner.bloc} />
                    </div>
                    <div style={{ fontFamily: SERIF, fontSize: "11px", color: "#5a4d3f", fontStyle: "italic", lineHeight: 1.35 }}>
                      {row.winner.name}
                    </div>
                  </div>
                  <div style={{ fontFamily: SERIF, fontSize: "13px", fontWeight: 700, color: COLORS.text, textAlign: "right" }}>
                    {fmt(row.margin)}
                  </div>
                  <div style={{ fontFamily: SERIF, fontSize: "13px", fontWeight: 700, color: COLORS.accent, textAlign: "right" }}>
                    {fmt(row.nota)}
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: "11px", color: COLORS.muted, textAlign: "right", fontWeight: 700 }}>
                    {ratio < 10 ? ratio.toFixed(1) : Math.round(ratio)}×
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
