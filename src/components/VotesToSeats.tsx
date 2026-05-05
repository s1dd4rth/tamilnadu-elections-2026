import { SERIF, MONO, COLORS } from "@/styles/theme";
import { SmallCaps, SectionTitle } from "./common";
import detail from "@/data/results-2026-detail.json";
import marginAtlas from "@/data/margin-atlas.json";
import analysisData from "@/data/analysis.json";

const BLOC_COLOUR: Record<string, string> = {
  TVK: "#a61e5e",
  SPA: "#a04020",
  NDA: "#1f4e3d",
  NTK: "#d8a520",
  IND: "#7a6a56",
  OTHER: "#4a3a2c",
  NOTA: "#6b5d52",
};

const BLOC_LABEL: Record<string, string> = {
  TVK: "TVK · Vijay solo",
  SPA: "SPA · DMK-led",
  NDA: "NDA · AIADMK-led",
  NTK: "NTK · Seeman solo",
  IND: "Independents",
  OTHER: "Other parties",
  NOTA: "NOTA",
};

// Full party name → bloc — same map used elsewhere; inlined here so this
// component is self-contained.
const NAME_TO_BLOC: Record<string, string> = {
  "Dravida Munnetra Kazhagam": "SPA",
  "Indian National Congress": "SPA",
  "Viduthalai Chiruthaigal Katchi": "SPA",
  "Communist Party of India": "SPA",
  "Communist Party of India  (Marxist)": "SPA",
  "Communist Party of India (Marxist)": "SPA",
  "Indian Union Muslim League": "SPA",
  "Manithaneya Makkal Katchi": "SPA",
  "Marumalarchi Dravida Munnetra Kazhagam": "SPA",
  "Desiya Murpokku Dravida Kazhagam": "SPA",
  "All India Anna Dravida Munnetra Kazhagam": "NDA",
  "Bharatiya Janata Party": "NDA",
  "Pattali Makkal Katchi": "NDA",
  "Amma Makkal Munnettra Kazagam": "NDA",
  "Tamil Maanila Congress (Moopanar)": "NDA",
  "Indhiya Jananayaga Katchi": "NDA",
  "Tamil Nadu Muslim Munnetra Kazhagam": "NDA",
  "Puthiya Bharatham Katchi": "NDA",
  "Tamilaga Vettri Kazhagam": "TVK",
  "Naam Tamilar Katchi": "NTK",
  "Independent": "IND",
  "None of the Above": "NOTA",
};

const fmt = (n: number) => n.toLocaleString("en-IN");
const fmtL = (n: number) => `${(n / 100000).toFixed(2)} lakh`;

type Cand = { rank: number; name: string; party: string; total: number; share: number };
type DetailFile = { ac: Record<string, Cand[]> };

type Atlas = { rows: Array<{ no: number; winner: { party: string; bloc: string } }> };

// 2026 ECI uses long party names; 2021 analysis.json uses short codes
// (DMK, ADMK, INC, etc). This map converts a 2026 long name to its
// 2021 code so we can look up its 2021 vote share.
const LONG_TO_2021_CODE: Record<string, string> = {
  "Dravida Munnetra Kazhagam": "DMK",
  "All India Anna Dravida Munnetra Kazhagam": "ADMK",
  "Indian National Congress": "INC",
  "Pattali Makkal Katchi": "PMK",
  "Bharatiya Janata Party": "BJP",
  "Communist Party of India": "CPI",
  "Communist Party of India  (Marxist)": "CPM",
  "Communist Party of India (Marxist)": "CPM",
  "Viduthalai Chiruthaigal Katchi": "VCK",
  "Indian Union Muslim League": "IUML",
  "Amma Makkal Munnettra Kazagam": "AMMK",
  "Marumalarchi Dravida Munnetra Kazhagam": "MDMK",
  "Desiya Murpokku Dravida Kazhagam": "DMDK",
};

type AnalysisAC = {
  no: number;
  elec2021: number;
  nonVoters2021: number;
  winner2021: { party: string; votes: number };
  runnerUp2021: { party: string; votes: number };
};
type AnalysisFile = { acs: AnalysisAC[] };

export const VotesToSeats = () => {
  // Aggregate votes per party from per-AC ballots
  const parties: Record<string, number> = {};
  const detailAc = (detail as DetailFile).ac;
  for (const cands of Object.values(detailAc)) {
    for (const c of cands) {
      parties[c.party] = (parties[c.party] ?? 0) + c.total;
    }
  }
  const totalVotes = Object.values(parties).reduce((s, v) => s + v, 0);

  // Per-party seats won — from the official margin atlas
  const seats: Record<string, number> = {};
  for (const r of (marginAtlas as Atlas).rows) {
    seats[r.winner.party] = (seats[r.winner.party] ?? 0) + 1;
  }

  // Bloc rollup
  type BlocRow = { bloc: string; votes: number; seats: number; pct: number; seatPct: number };
  const blocVotes: Record<string, number> = {};
  const blocSeats: Record<string, number> = {};
  for (const [p, v] of Object.entries(parties)) {
    const b = NAME_TO_BLOC[p] ?? "OTHER";
    blocVotes[b] = (blocVotes[b] ?? 0) + v;
  }
  for (const [p, s] of Object.entries(seats)) {
    const b = NAME_TO_BLOC[p] ?? "OTHER";
    blocSeats[b] = (blocSeats[b] ?? 0) + s;
  }
  const blocs: BlocRow[] = Object.keys({ ...blocVotes, ...blocSeats }).map((b) => ({
    bloc: b,
    votes: blocVotes[b] ?? 0,
    seats: blocSeats[b] ?? 0,
    pct: ((blocVotes[b] ?? 0) / totalVotes) * 100,
    seatPct: ((blocSeats[b] ?? 0) / 234) * 100,
  })).sort((a, b) => b.votes - a.votes);

  // 2021 vote share, computed from analysis.json's per-AC winner+runner-up
  // data. This is PARTIAL — parties that placed 3rd or below in 2021 are
  // not represented. For DMK (188/234 ACs as top-2) and AIADMK (191/234)
  // coverage is near-complete; for smaller parties it's partial. Tracked
  // separately so we can show an honest "—" where coverage is too thin.
  const analysisAcs = (analysisData as AnalysisFile).acs;
  const total2021Votes = analysisAcs.reduce(
    (s, a) => s + (a.elec2021 - a.nonVoters2021), 0
  );
  const votes2021ByCode: Record<string, number> = {};
  const appearances2021ByCode: Record<string, number> = {};
  for (const ac of analysisAcs) {
    for (const slot of [ac.winner2021, ac.runnerUp2021]) {
      const code = slot.party;
      votes2021ByCode[code] = (votes2021ByCode[code] ?? 0) + slot.votes;
      appearances2021ByCode[code] = (appearances2021ByCode[code] ?? 0) + 1;
    }
  }
  const get2021Pct = (longName: string): { pct: number | null; partial: boolean } => {
    const code = LONG_TO_2021_CODE[longName];
    if (!code) return { pct: null, partial: false };
    const v = votes2021ByCode[code];
    if (!v) return { pct: null, partial: false };
    const apps = appearances2021ByCode[code] ?? 0;
    return { pct: (v / total2021Votes) * 100, partial: apps < 50 };
  };

  // Headline party rows — top 10 by votes
  const partyRows = Object.entries(parties)
    .map(([p, v]) => ({
      party: p,
      bloc: NAME_TO_BLOC[p] ?? "OTHER",
      votes: v,
      pct: (v / totalVotes) * 100,
      seats: seats[p] ?? 0,
    }))
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 12);

  // Funnel numbers: registered (denominator), votes-cast, derived turnout
  const registered = 56707380; // from HeadlineBar / CEO final roll
  const turnoutPct = (totalVotes / registered) * 100;
  const stayedHome = registered - totalVotes;

  // Conversion premium per bloc (seat% − vote%)
  const tvkPremium = (blocs.find((b) => b.bloc === "TVK")?.seatPct ?? 0) -
    (blocs.find((b) => b.bloc === "TVK")?.pct ?? 0);

  // Where TVK's 35% came from — the DMK + AIADMK 2021→2026 collapse
  const dmk2021 = get2021Pct("Dravida Munnetra Kazhagam").pct ?? 0;
  const admk2021 = get2021Pct("All India Anna Dravida Munnetra Kazhagam").pct ?? 0;
  const dmk2026 = (parties["Dravida Munnetra Kazhagam"] / totalVotes) * 100;
  const admk2026 = (parties["All India Anna Dravida Munnetra Kazhagam"] / totalVotes) * 100;
  const combined2021 = dmk2021 + admk2021;
  const combined2026 = dmk2026 + admk2026;
  const collapse = combined2021 - combined2026;
  const tvk2026 = (parties["Tamilaga Vettri Kazhagam"] / totalVotes) * 100;

  // NTK pull-quote
  const ntk = blocs.find((b) => b.bloc === "NTK");

  return (
    <section style={{ margin: "60px 0" }}>
      <SectionTitle kicker="Votes → Seats">
        From who voted to who won.
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
        The funnel from electors to MLAs in three steps. <strong style={{ color: COLORS.text, fontStyle: "normal" }}>{fmt(registered)}</strong> registered voters in the final roll →{" "}
        <strong style={{ color: COLORS.text, fontStyle: "normal" }}>{fmt(totalVotes)}</strong> ballots cast ({turnoutPct.toFixed(1)}% turnout) →{" "}
        <strong style={{ color: COLORS.text, fontStyle: "normal" }}>234</strong> winners. The middle step — how those 4.93 crore votes split, and why TVK&apos;s {(blocs[0]?.pct ?? 0).toFixed(1)}% vote share converted to {(blocs[0]?.seatPct ?? 0).toFixed(1)}% of seats — is what first-past-the-post does.
      </p>

      {/* Funnel: three big stats with arrows */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
        gap: "10px",
        marginBottom: "32px",
        alignItems: "stretch",
      }}>
        <FunnelStat label="Registered" value={fmt(registered)} sub="CEO TN final roll · 23 Feb 2026" />
        <FunnelArrow />
        <FunnelStat label="Voted" value={fmt(totalVotes)} sub={`${turnoutPct.toFixed(1)}% turnout · ${fmtL(stayedHome)} stayed home`} />
        <FunnelArrow />
        <FunnelStat label="Seats won" value="234" sub="TVK 108 · SPA 73 · NDA 53" />
      </div>

      {/* The DMK+AIADMK 2021→2026 collapse — explains where TVK's 35% came from */}
      <blockquote style={{
        margin: "0 0 28px",
        padding: "20px 24px",
        background: "#fff9ef",
        border: `1.5px solid ${COLORS.text}`,
        boxShadow: "6px 6px 0 rgba(26,20,16,0.05)",
      }}>
        <SmallCaps style={{ color: COLORS.accent, marginBottom: "4px" }}>
          Where TVK&apos;s {tvk2026.toFixed(0)}% came from
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
          DMK + AIADMK held{" "}
          <span style={{ color: BLOC_COLOUR.SPA }}>{combined2021.toFixed(0)}%</span> of the vote in 2021.
          In 2026, between them they hold{" "}
          <span style={{ color: BLOC_COLOUR.SPA }}>{combined2026.toFixed(0)}%</span>.
          The {collapse.toFixed(0)}-point gap is roughly{" "}
          <span style={{ color: BLOC_COLOUR.TVK }}>TVK&apos;s entire debut share</span>.
        </p>
        <p style={{ fontFamily: SERIF, fontSize: "13px", color: COLORS.muted, margin: 0, lineHeight: 1.5 }}>
          DMK fell from <strong style={{ color: COLORS.text, fontStyle: "normal" }}>{dmk2021.toFixed(1)}%</strong> to <strong style={{ color: COLORS.text, fontStyle: "normal" }}>{dmk2026.toFixed(1)}%</strong> ({(dmk2021 - dmk2026).toFixed(1)}pp loss). AIADMK fell from <strong style={{ color: COLORS.text, fontStyle: "normal" }}>{admk2021.toFixed(1)}%</strong> to <strong style={{ color: COLORS.text, fontStyle: "normal" }}>{admk2026.toFixed(1)}%</strong> ({(admk2021 - admk2026).toFixed(1)}pp loss). Vijay&apos;s party — non-existent in 2021 — picked up {tvk2026.toFixed(1)}% of the vote in its first contest. The arithmetic is almost exact.
        </p>
      </blockquote>

      {/* Bloc-level vote vs seat comparison */}
      <div style={{
        background: "#fff9ef",
        border: `1.5px solid ${COLORS.text}`,
        boxShadow: "6px 6px 0 rgba(26,20,16,0.05)",
        padding: "22px 24px",
        marginBottom: "28px",
      }}>
        <SmallCaps style={{ color: COLORS.accent }}>
          The FPTP premium · vote share vs seat share, by bloc
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
          Where one vote bought how many seats.
        </h3>
        <div>
          {/* Header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "150px 1fr 1fr 70px",
            gap: "12px",
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
            <div>Bloc</div>
            <div>Vote share</div>
            <div>Seat share</div>
            <div style={{ textAlign: "right" }}>Δ</div>
          </div>
          {blocs.filter((b) => b.bloc !== "NOTA").map((b) => {
            const delta = b.seatPct - b.pct;
            const deltaColor = delta > 1 ? "#1f4e3d" : delta < -1 ? "#c8886a" : COLORS.muted;
            return (
              <div key={b.bloc} style={{
                display: "grid",
                gridTemplateColumns: "150px 1fr 1fr 70px",
                gap: "12px",
                alignItems: "center",
                padding: "10px 0",
                borderBottom: "1px dotted #d8c8a8",
              }}>
                <div>
                  <div style={{
                    fontFamily: MONO,
                    fontSize: "11px",
                    fontWeight: 700,
                    color: BLOC_COLOUR[b.bloc] ?? COLORS.text,
                    letterSpacing: "0.06em",
                  }}>
                    {BLOC_LABEL[b.bloc] ?? b.bloc}
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: "9px", color: COLORS.muted, marginTop: "2px" }}>
                    {fmtL(b.votes)} · {b.seats} seats
                  </div>
                </div>
                <Bar pct={b.pct} colour={BLOC_COLOUR[b.bloc] ?? COLORS.text} valueLabel={`${b.pct.toFixed(1)}%`} />
                <Bar pct={b.seatPct} colour={BLOC_COLOUR[b.bloc] ?? COLORS.text} valueLabel={`${b.seatPct.toFixed(1)}%`} />
                <div style={{
                  fontFamily: SERIF,
                  fontSize: "15px",
                  fontWeight: 800,
                  fontStyle: "italic",
                  color: deltaColor,
                  textAlign: "right",
                  letterSpacing: "-0.01em",
                }}>
                  {delta > 0 ? "+" : ""}{delta.toFixed(1)}<span style={{ fontFamily: MONO, fontSize: "9px", color: COLORS.muted, marginLeft: "2px" }}>pp</span>
                </div>
              </div>
            );
          })}
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
          Δ = seat share − vote share, in percentage points. Positive = the bloc was rewarded by FPTP (won more seat % than vote %); negative = penalised. TVK&apos;s +{tvkPremium.toFixed(0)}pp is the largest premium — typical for the plurality winner in a first-past-the-post system. Smaller blocs and parties get squeezed.
        </p>
      </div>

      {/* NTK + zero-seat-but-many-votes pull-quote */}
      {ntk && ntk.votes > 0 && (
        <blockquote style={{
          margin: "0 0 28px",
          padding: "20px 24px",
          background: "#fff9ef",
          border: `1.5px solid ${COLORS.text}`,
          boxShadow: "6px 6px 0 rgba(26,20,16,0.05)",
        }}>
          <SmallCaps style={{ color: COLORS.accent, marginBottom: "4px" }}>
            The vote-without-seat case
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
            Seeman&apos;s NTK polled <span style={{ color: BLOC_COLOUR.NTK }}>{fmtL(ntk.votes)}</span> votes —{" "}
            {ntk.pct.toFixed(1)}% statewide — and won{" "}
            <span style={{ color: BLOC_COLOUR.NTK }}>zero</span> seats.
          </p>
          <p style={{ fontFamily: SERIF, fontSize: "13px", color: COLORS.muted, margin: 0, lineHeight: 1.5 }}>
            NTK fielded candidates in all 234 ACs, 117 of them women. Without an alliance, the four-percent vote spread thinly across every constituency — never enough to win any single seat. Independents (1.06%) and BJP-as-a-standalone-tally inside NDA (3% vote, 1 seat) tell the same FPTP-spoiler story.
          </p>
        </blockquote>
      )}

      {/* Top parties detail table */}
      <div style={{
        background: "#fff9ef",
        border: `1.5px solid ${COLORS.text}`,
        boxShadow: "6px 6px 0 rgba(26,20,16,0.05)",
        padding: "22px 24px",
      }}>
        <SmallCaps style={{ color: COLORS.accent }}>
          Top 12 parties · vote share + seats
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
          The conversion table.
        </h3>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 90px 80px 80px 80px",
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
          <div>Party</div>
          <div style={{ textAlign: "right" }}>Votes</div>
          <div style={{ textAlign: "right" }}>2026 %</div>
          <div style={{ textAlign: "right" }}>2021 %</div>
          <div style={{ textAlign: "right" }}>Seats</div>
        </div>
        {partyRows.map((r) => {
          const prior = get2021Pct(r.party);
          const delta = prior.pct != null ? r.pct - prior.pct : null;
          return (
            <div key={r.party} style={{
              display: "grid",
              gridTemplateColumns: "1fr 90px 80px 80px 80px",
              gap: "10px",
              alignItems: "center",
              padding: "8px 0",
              borderBottom: "1px dotted #d8c8a8",
            }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                <span style={{
                  fontFamily: SERIF,
                  fontSize: "13px",
                  fontWeight: 700,
                  color: COLORS.text,
                }}>
                  {r.party}
                </span>
                <span style={{
                  fontFamily: MONO,
                  fontSize: "9px",
                  fontWeight: 700,
                  color: BLOC_COLOUR[r.bloc] ?? COLORS.text,
                  letterSpacing: "0.08em",
                  background: "#faf4e8",
                  padding: "2px 6px",
                  borderRadius: 2,
                }}>
                  {r.bloc}
                </span>
              </div>
              <div style={{ fontFamily: SERIF, fontSize: "13px", color: COLORS.text, textAlign: "right" }}>
                {fmtL(r.votes)}
              </div>
              <div style={{ fontFamily: SERIF, fontSize: "14px", fontWeight: 700, fontStyle: "italic", color: COLORS.text, textAlign: "right" }}>
                {r.pct.toFixed(2)}%
              </div>
              <div style={{
                fontFamily: SERIF,
                fontSize: "13px",
                color: prior.pct == null ? COLORS.muted : COLORS.text,
                textAlign: "right",
                fontStyle: prior.partial ? "italic" : "normal",
              }}>
                {prior.pct != null ? `${prior.pct.toFixed(2)}%` : "—"}
                {delta != null && Math.abs(delta) >= 0.5 && (
                  <span style={{
                    marginLeft: "4px",
                    fontFamily: MONO,
                    fontSize: "9px",
                    color: delta > 0 ? "#1f4e3d" : "#c8886a",
                    fontWeight: 700,
                  }}>
                    {delta > 0 ? "+" : ""}{delta.toFixed(1)}
                  </span>
                )}
              </div>
              <div style={{
                fontFamily: SERIF,
                fontSize: "16px",
                fontWeight: 800,
                fontStyle: "italic",
                color: r.seats === 0 ? COLORS.muted : COLORS.text,
                textAlign: "right",
                letterSpacing: "-0.01em",
              }}>
                {r.seats}
              </div>
            </div>
          );
        })}
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
          Source: ECI per-AC ballots aggregated for 2026; analysis.json winner+runner-up aggregation for 2021. The 2021 column captures only parties that placed first or second in any AC — DMK and AIADMK appeared in 188/234 and 191/234 ACs respectively (near-complete), but NTK rarely cracked the top two in 2021 so its number is shown as &ldquo;—&rdquo; rather than misleadingly low. The bloc tag indicates which alliance the party contested under in 2026 (DMDK joined the SPA umbrella; AMMK was a fused-symbol AIADMK ally).
        </p>
      </div>
    </section>
  );
};

const FunnelStat: React.FC<{ label: string; value: string; sub: string }> = ({ label, value, sub }) => (
  <div style={{
    background: "#fff9ef",
    border: `1.5px solid ${COLORS.text}`,
    boxShadow: "6px 6px 0 rgba(26,20,16,0.05)",
    padding: "16px 20px",
    minHeight: "100%",
  }}>
    <SmallCaps style={{ color: COLORS.accent }}>{label}</SmallCaps>
    <div style={{
      fontFamily: SERIF,
      fontSize: "clamp(26px, 3vw, 36px)",
      fontStyle: "italic",
      fontWeight: 900,
      color: COLORS.text,
      lineHeight: 0.95,
      letterSpacing: "-0.025em",
      margin: "6px 0 8px",
      fontFeatureSettings: '"tnum" 1, "lnum" 1',
    }}>
      {value}
    </div>
    <div style={{ fontFamily: SERIF, fontSize: "12px", color: COLORS.muted, fontStyle: "italic", lineHeight: 1.4 }}>
      {sub}
    </div>
  </div>
);

const FunnelArrow: React.FC = () => (
  <div style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: SERIF,
    fontSize: "32px",
    color: COLORS.muted,
    fontStyle: "italic",
  }}>
    →
  </div>
);

const Bar: React.FC<{ pct: number; colour: string; valueLabel: string }> = ({ pct, colour, valueLabel }) => (
  <div style={{
    display: "flex",
    alignItems: "center",
    gap: "8px",
  }}>
    <div style={{
      flex: 1,
      height: "16px",
      background: "#e9dfc9",
      overflow: "hidden",
      position: "relative",
    }}>
      <div style={{
        position: "absolute",
        left: 0, top: 0, bottom: 0,
        width: `${Math.min(100, pct * 2)}%`, // 50% of bar = 25% vote/seat — feels right at this scale
        background: colour,
        transition: "width 200ms",
      }} />
    </div>
    <span style={{
      fontFamily: SERIF,
      fontSize: "13px",
      fontWeight: 700,
      fontStyle: "italic",
      color: COLORS.text,
      minWidth: "44px",
      textAlign: "right",
      letterSpacing: "-0.01em",
    }}>
      {valueLabel}
    </span>
  </div>
);
