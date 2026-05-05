import { SERIF, MONO, COLORS } from "@/styles/theme";
import { SmallCaps, SectionTitle } from "./common";
import marquee from "@/data/marquee-rounds.json";

type Cand = { name: string; party: string; totals: number[] };
type MarqueeAC = {
  no: number;
  name: string;
  caption: string;
  totalRounds: number;
  candidates: Cand[];
};

// Map full party names → bloc colour, mirroring MarginAtlas.
const PARTY_COLOUR: Record<string, string> = {
  "Tamilaga Vettri Kazhagam": "#a61e5e",
  "Dravida Munnetra Kazhagam": "#a04020",
  "Indian National Congress": "#19aaed",
  "Viduthalai Chiruthaigal Katchi": "#c81e1e",
  "Communist Party of India": "#a04020",
  "Communist Party of India (Marxist)": "#a04020",
  "Indian Union Muslim League": "#a04020",
  "All India Anna Dravida Munnetra Kazhagam": "#1f4e3d",
  "Bharatiya Janata Party": "#1f4e3d",
  "Pattali Makkal Katchi": "#1f4e3d",
  "Naam Tamilar Katchi": "#d8a520",
  "Independent": "#7a6a56",
};

const fmt = (n: number) => n.toLocaleString("en-IN");

const colourFor = (party: string) => PARTY_COLOUR[party] ?? "#5a4d3f";

const PARTY_SHORT: Record<string, string> = {
  "Tamilaga Vettri Kazhagam": "TVK",
  "Dravida Munnetra Kazhagam": "DMK",
  "Indian National Congress": "INC",
  "Viduthalai Chiruthaigal Katchi": "VCK",
  "All India Anna Dravida Munnetra Kazhagam": "AIADMK",
  "Bharatiya Janata Party": "BJP",
  "Pattali Makkal Katchi": "PMK",
  "Naam Tamilar Katchi": "NTK",
  "Independent": "IND",
};

const partyShort = (party: string) =>
  PARTY_SHORT[party] ??
  party
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 5);

const RoundChart: React.FC<{ ac: MarqueeAC }> = ({ ac }) => {
  // Top 4 candidates by final vote total — those are the only ones
  // worth labelling. Anything past that is rounding noise on the chart.
  const top = ac.candidates.slice(0, 4);
  const rest = ac.candidates.slice(4);
  const totalRounds = ac.totalRounds;

  const allMax = Math.max(
    ...ac.candidates.flatMap((c) => c.totals)
  );

  // SVG layout
  const W = 460;
  const H = 200;
  const padL = 48;
  const padR = 16;
  const padT = 12;
  const padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const xAt = (round: number) => padL + (round - 1) / Math.max(1, totalRounds - 1) * innerW;
  const yAt = (votes: number) => padT + innerH - (votes / Math.max(1, allMax)) * innerH;

  const linePath = (totals: number[]) => {
    if (!totals.length) return "";
    return totals
      .map((v, i) => `${i === 0 ? "M" : "L"} ${xAt(i + 1).toFixed(1)} ${yAt(v).toFixed(1)}`)
      .join(" ");
  };

  // Y-axis tick labels — 0, mid, max
  const yTicks = [0, allMax / 2, allMax];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: "100%", height: "auto", display: "block", marginTop: "8px" }}
      role="img"
      aria-label={`Round-by-round vote totals for ${ac.name}`}
    >
      {/* Y gridlines + labels */}
      {yTicks.map((v) => (
        <g key={v}>
          <line
            x1={padL}
            y1={yAt(v)}
            x2={W - padR}
            y2={yAt(v)}
            stroke="#d8c8a8"
            strokeWidth={0.6}
            strokeDasharray="2 3"
          />
          <text
            x={padL - 6}
            y={yAt(v) + 3}
            fontFamily={MONO}
            fontSize="9"
            fill={COLORS.muted}
            textAnchor="end"
          >
            {v >= 1000 ? `${Math.round(v / 1000)}k` : Math.round(v)}
          </text>
        </g>
      ))}

      {/* X-axis ticks */}
      {[1, Math.ceil(totalRounds / 2), totalRounds].map((r) => (
        <text
          key={r}
          x={xAt(r)}
          y={H - 10}
          fontFamily={MONO}
          fontSize="9"
          fill={COLORS.muted}
          textAnchor="middle"
        >
          R{r}
        </text>
      ))}

      {/* Inline keyframes for the line-draw animation. Each top path
          uses pathLength="100" + dasharray "100" so the dashoffset
          counts down from 100 to 0 — drawing the line on. */}
      <style>{`
        @keyframes mq-draw { from { stroke-dashoffset: 100; } to { stroke-dashoffset: 0; } }
        .mq-line { stroke-dasharray: 100; stroke-dashoffset: 100; animation: mq-draw 1.6s ease-out forwards; }
        .mq-dot  { opacity: 0; animation: mq-fade 0.4s ease-out forwards; animation-delay: 1.5s; }
        @keyframes mq-fade { to { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) {
          .mq-line { animation: none; stroke-dashoffset: 0; }
          .mq-dot  { animation: none; opacity: 1; }
        }
      `}</style>

      {/* Faded lines for the long tail of also-rans */}
      {rest.slice(0, 12).map((c, i) => (
        <path
          key={`r${i}`}
          d={linePath(c.totals)}
          fill="none"
          stroke="#bcae94"
          strokeOpacity={0.35}
          strokeWidth={0.8}
        />
      ))}

      {/* Top-4 lines — bold and coloured, with draw-on animation */}
      {top.map((c, i) => {
        const colour = colourFor(c.party);
        const final = c.totals[c.totals.length - 1] ?? 0;
        return (
          <g key={`t${i}`}>
            <path
              className="mq-line"
              pathLength={100}
              style={{ animationDelay: `${i * 150}ms` }}
              d={linePath(c.totals)}
              fill="none"
              stroke={colour}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* End-of-line dot, fades in after the line finishes drawing */}
            <circle
              className="mq-dot"
              style={{ animationDelay: `${1500 + i * 150}ms` }}
              cx={xAt(c.totals.length)}
              cy={yAt(final)}
              r={3}
              fill={colour}
              stroke="#faf4e8"
              strokeWidth={1}
            />
          </g>
        );
      })}
    </svg>
  );
};

const ACCard: React.FC<{ ac: MarqueeAC }> = ({ ac }) => {
  const top = ac.candidates.slice(0, 4);
  const winner = ac.candidates[0];
  const runnerUp = ac.candidates[1];
  const margin = winner && runnerUp
    ? (winner.totals[winner.totals.length - 1] ?? 0) -
      (runnerUp.totals[runnerUp.totals.length - 1] ?? 0)
    : 0;

  return (
    <div style={{
      background: "#fff9ef",
      border: `1.5px solid ${COLORS.text}`,
      boxShadow: "6px 6px 0 rgba(26,20,16,0.05)",
      padding: "20px 22px",
    }}>
      <SmallCaps style={{ color: COLORS.accent }}>
        AC {ac.no} · {ac.totalRounds} rounds
      </SmallCaps>
      <h3 style={{
        fontFamily: SERIF,
        fontSize: "22px",
        fontStyle: "italic",
        fontWeight: 800,
        color: COLORS.text,
        margin: "4px 0 4px",
        letterSpacing: "-0.015em",
      }}>
        {ac.name}
      </h3>
      <p style={{
        fontFamily: SERIF,
        fontStyle: "italic",
        fontSize: "13px",
        color: COLORS.muted,
        margin: "0 0 4px",
        lineHeight: 1.4,
      }}>
        {ac.caption}
      </p>

      <RoundChart ac={ac} />

      {/* Top 4 candidate ledger — final votes, ordered */}
      <div style={{ marginTop: "10px" }}>
        {top.map((c, i) => {
          const final = c.totals[c.totals.length - 1] ?? 0;
          const isWinner = i === 0;
          return (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "12px 1fr auto",
                gap: "8px",
                alignItems: "baseline",
                padding: "3px 0",
                fontFamily: SERIF,
                fontSize: "12px",
              }}
            >
              <span style={{
                width: 8,
                height: 8,
                background: colourFor(c.party),
                display: "inline-block",
                borderRadius: 1,
                alignSelf: "center",
              }} />
              <span style={{
                color: isWinner ? COLORS.text : "#5a4d3f",
                fontWeight: isWinner ? 700 : 400,
              }}>
                {c.name}
                <span style={{ color: COLORS.muted, marginLeft: "6px", fontFamily: MONO, fontSize: "10px" }}>
                  {partyShort(c.party)}
                </span>
              </span>
              <span style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontWeight: isWinner ? 800 : 600,
                color: COLORS.text,
              }}>
                {fmt(final)}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{
        marginTop: "8px",
        paddingTop: "8px",
        borderTop: `1px dotted ${COLORS.muted}`,
        fontFamily: MONO,
        fontSize: "10px",
        letterSpacing: "0.06em",
        color: COLORS.muted,
        display: "flex",
        justifyContent: "space-between",
      }}>
        <span>Margin: <strong style={{ color: COLORS.text }}>{fmt(margin)}</strong></span>
        <span>{ac.candidates.length} candidates total</span>
      </div>
    </div>
  );
};

export const MarqueeRounds = () => {
  const acs = Object.values(marquee.ac as Record<string, MarqueeAC>);
  if (!acs.length) return null;

  return (
    <section style={{ margin: "60px 0" }}>
      <SectionTitle kicker="Round by Round · 4 May 2026">
        Counting day, ten ways.
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
        Each card replays a single AC the way Returning Officers tabulated it: cumulative votes per candidate per round. Stalin&apos;s Kolathur, Vijay&apos;s Perambur, EPS&apos;s Edappadi, Seeman&apos;s Karaikudi, the rally-crush AC of Karur, and the closest seat in the state — Tiruppattur, won by a single vote, called at 2 AM.
      </p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
        gap: "22px",
      }}>
        {acs.map((ac) => (
          <ACCard key={ac.no} ac={ac} />
        ))}
      </div>
    </section>
  );
};
