import { SERIF, MONO, COLORS } from "@/styles/theme";
import { SmallCaps, SectionTitle } from "./common";
import women from "@/data/women-mlas.json";
import findings from "@/data/findings.json";
import marginAtlas from "@/data/margin-atlas.json";
import nominations from "@/data/nominations.json";

const BLOC_COLOUR: Record<string, string> = {
  SPA: "#a04020",
  NDA: "#1f4e3d",
  TVK: "#a61e5e",
};

type WW = {
  no: number;
  ac: string;
  name: string;
  party: string;
  bloc: string;
  reason: string;
  margin: number;
};

const fmt = (n: number) => n.toLocaleString("en-IN");

export const WomenInOffice = () => {
  const winners = (women.winners as WW[]) ?? [];
  if (!winners.length) return null;

  const filed = (findings.women as { filedTotal: number; filedAll: number }) ?? null;
  const byBloc = (women.byBloc as Record<string, number>) ?? {};

  // Per-bloc denominators from margin atlas (count of total seats per bloc)
  const totalByBloc: Record<string, number> = {};
  for (const r of marginAtlas.rows as Array<{ winner: { bloc: string } }>) {
    totalByBloc[r.winner.bloc] = (totalByBloc[r.winner.bloc] ?? 0) + 1;
  }

  // Statewide third-gender filings (CEO Form-7A) — used for the Roshini callout.
  const tgFiled = (nominations as Array<{ thirdGender: number }>)
    .reduce((s, n) => s + (n.thirdGender ?? 0), 0);

  return (
    <section style={{ margin: "60px 0" }}>
      <SectionTitle kicker="Women in the 16th Assembly">
        How many women won.
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
        {filed && (
          <>
            <strong style={{ color: COLORS.text, fontStyle: "normal" }}>{fmt(filed.filedTotal)}</strong> women candidates filed nominations across the state ({(filed.filedTotal*100/filed.filedAll).toFixed(1)}% of all nominees, per ECI Form-7A). Of the 442 women who made it to the final ballot, here&rsquo;s how many of the 234 winners are women — cross-referenced against MyNeta&rsquo;s curated women-candidate list.
          </>
        )}
      </p>

      {/* Headline + per-bloc tally */}
      <div style={{
        background: "#fff9ef",
        border: `1.5px solid ${COLORS.text}`,
        boxShadow: "6px 6px 0 rgba(26,20,16,0.05)",
        padding: "22px 24px",
        marginBottom: "24px",
      }}>
        <SmallCaps style={{ color: COLORS.accent }}>Headline number</SmallCaps>
        <div style={{
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: "clamp(36px, 5vw, 56px)",
          fontWeight: 900,
          color: COLORS.text,
          lineHeight: 0.95,
          letterSpacing: "-0.03em",
          margin: "8px 0 6px",
        }}>
          {winners.length}<span style={{ fontFamily: MONO, fontSize: "13px", fontWeight: 600, color: COLORS.muted, letterSpacing: "0.08em", marginLeft: "10px", verticalAlign: "12px" }}>OF 234 MLAs · {(winners.length * 100 / 234).toFixed(1)}%</span>
        </div>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "14px", color: "#3a302a", margin: "8px 0 18px", lineHeight: 1.5 }}>
          By comparison, the 15th Assembly (2021) had 12 women MLAs — 5.1%. That count nearly doubles in 2026, but still well short of the 18% women filing.
        </p>

        <SmallCaps style={{ color: COLORS.accent, marginTop: "8px" }}>By bloc</SmallCaps>
        <div style={{ marginTop: "10px" }}>
          {(["TVK", "NDA", "SPA"] as const).map((b) => {
            const cnt = byBloc[b] ?? 0;
            const tot = totalByBloc[b] ?? 0;
            const pct = tot > 0 ? cnt * 100 / tot : 0;
            return (
              <div key={b} style={{
                display: "grid",
                gridTemplateColumns: "80px 1fr 100px",
                gap: "12px",
                alignItems: "center",
                padding: "8px 0",
                borderBottom: "1px dotted #d8c8a8",
              }}>
                <div style={{ fontFamily: MONO, fontSize: "11px", fontWeight: 700, color: BLOC_COLOUR[b], letterSpacing: "0.06em" }}>
                  {b}
                </div>
                <div style={{ height: "16px", background: "#e9dfc9", display: "flex" }}>
                  <div style={{ width: `${pct}%`, background: BLOC_COLOUR[b], transition: "width 200ms" }} />
                </div>
                <div style={{ fontFamily: SERIF, fontSize: "14px", fontStyle: "italic", fontWeight: 700, color: COLORS.text, textAlign: "right" }}>
                  {cnt} of {tot}<span style={{ color: COLORS.muted, fontFamily: MONO, fontSize: "10px", marginLeft: "6px" }}>{pct.toFixed(1)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Roshini callout — the only third-gender party nominee on the ballot */}
      <div style={{
        borderLeft: `3px solid ${COLORS.accent}`,
        background: "#fff9ef",
        padding: "16px 20px",
        margin: "0 0 24px",
        maxWidth: "820px",
      }}>
        <SmallCaps style={{ color: COLORS.accent }}>A footnote on the 442</SmallCaps>
        <p style={{
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: "15px",
          lineHeight: 1.6,
          color: "#3a302a",
          margin: "6px 0 0",
        }}>
          One of the 442 women on the ballot is also Tamil Nadu&rsquo;s only third-gender candidate fielded by a political party — <strong style={{ color: COLORS.text, fontStyle: "normal" }}>Roshini S</strong>, NTK&rsquo;s nominee from <strong style={{ color: COLORS.text, fontStyle: "normal" }}>Villivakkam</strong>. Across all {fmt(filed?.filedAll ?? 0)} nominations filed statewide, only {tgFiled} were third-gender; Roshini is the only one to survive scrutiny + withdrawal and reach the EVM under a party banner. Reporting:{" "}
          <a
            href="https://www.deccanherald.com/elections/tamil-nadu/tamil-nadu-assembly-elections-2026-meet-roshini-tamil-nadus-only-transgender-woman-candidate-3973182"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: COLORS.accent, textDecoration: "none", borderBottom: `1px dotted ${COLORS.accent}` }}
          >
            Deccan Herald
          </a>.
        </p>
      </div>

      {/* List of all flagged winners */}
      <div style={{
        background: "#fff9ef",
        border: `1.5px solid ${COLORS.text}`,
        boxShadow: "6px 6px 0 rgba(26,20,16,0.05)",
        padding: "22px 24px",
      }}>
        <SmallCaps style={{ color: COLORS.accent }}>The {winners.length} women MLAs</SmallCaps>
        <h3 style={{
          fontFamily: SERIF,
          fontSize: "20px",
          fontStyle: "italic",
          fontWeight: 800,
          color: COLORS.text,
          margin: "4px 0 14px",
          letterSpacing: "-0.015em",
        }}>
          By AC.
        </h3>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "10px 22px",
        }}>
          {winners.map((w) => (
            <div key={w.no} style={{
              display: "grid",
              gridTemplateColumns: "32px 1fr auto",
              gap: "8px",
              alignItems: "baseline",
              padding: "6px 0",
              borderBottom: "1px dotted #d8c8a8",
              fontFamily: SERIF,
              fontSize: "13px",
            }}>
              <span style={{ fontFamily: MONO, fontSize: "10px", color: COLORS.muted, textAlign: "right" }}>{w.no}</span>
              <span style={{ color: COLORS.text }}>
                {w.name}
                <div style={{ fontFamily: SERIF, fontSize: "11px", fontStyle: "italic", color: COLORS.muted, marginTop: "1px" }}>
                  {w.ac}
                </div>
              </span>
              <span style={{
                fontFamily: MONO,
                fontSize: "9px",
                fontWeight: 700,
                color: BLOC_COLOUR[w.bloc] ?? COLORS.text,
                letterSpacing: "0.08em",
                background: "#faf4e8",
                padding: "2px 6px",
                borderRadius: 2,
                whiteSpace: "nowrap",
              }}>
                {w.bloc}
              </span>
            </div>
          ))}
        </div>

        <p style={{
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: "12px",
          color: COLORS.muted,
          margin: "16px 0 0",
          borderTop: `1px dotted ${COLORS.muted}`,
          paddingTop: "10px",
          lineHeight: 1.55,
        }}>
          <strong style={{ color: COLORS.text, fontStyle: "normal" }}>Methodology:</strong>{" "}
          MyNeta&apos;s per-candidate gender field was unreliable for this election (23 ACs had every candidate flagged female; ~210 had none). Instead, we cross-referenced each AC&apos;s winner against MyNeta&apos;s separately-curated women-candidate listing of 442 contestants. For each AC, the highest-vote candidate&apos;s MyNeta id is looked up, and the winner is counted as a woman if that id appears in the women list. This replaced an earlier name-heuristic that produced both false positives (men with feminine first names) and false negatives.
        </p>
      </div>
    </section>
  );
};
