import Link from "next/link";
import { SERIF, MONO, COLORS } from "@/styles/theme";
import { SmallCaps } from "./common";
import resultsTimeline from "@/data/results-timeline.json";

const fmtIST = (iso: string | null | undefined): string => {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata",
    }).format(new Date(iso));
  } catch {
    return iso.slice(11, 16);
  }
};

// Bloc → display colour, matching the seat-component palette so the strip
// reads as the same visual language as the /analysis hemicycle.
const BLOC_COLOUR: Record<string, string> = {
  TVK: "#e72bd9",
  NDA: "#0c7a3a",
  SPA: "#a04020",
};

const BLOC_LABEL: Record<string, string> = {
  TVK: "TVK",
  NDA: "NDA",
  SPA: "SPA",
};

export const LiveCountingStrip = () => {
  const snaps = resultsTimeline.snapshots;
  if (!snaps?.length) return null;

  const latest = snaps[snaps.length - 1];
  const declared = latest?.declared ?? 0;
  const ts = fmtIST(latest?.eciTs ?? latest?.ts);

  const isDone = declared >= 234;

  // Once all 234 are declared, compute the bloc tally for the result strip.
  const blocCounts: Record<string, number> = {};
  if (isDone && latest?.results) {
    for (const row of Object.values(latest.results) as string[][]) {
      const bloc = row[1];
      blocCounts[bloc] = (blocCounts[bloc] ?? 0) + 1;
    }
  }
  // Display order: largest first
  const blocOrder = Object.keys(blocCounts).sort(
    (a, b) => (blocCounts[b] ?? 0) - (blocCounts[a] ?? 0)
  );

  return (
    <Link
      href="/analysis"
      aria-label={
        isDone
          ? `Counting complete. ${blocOrder.map((b) => `${b} ${blocCounts[b]}`).join(", ")}. View timeline.`
          : `Counting in progress, ${declared} of 234 trending. View live map.`
      }
      style={{
        display: "block",
        textDecoration: "none",
        color: "inherit",
        background: COLORS.text,
        border: `1.5px solid ${COLORS.text}`,
        marginBottom: "24px",
        padding: "14px 20px",
        boxShadow: "6px 6px 0 rgba(26,20,16,0.12)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          flexWrap: "wrap",
          rowGap: "6px",
        }}
      >
        {/* Pulsing red dot — keeps a visual heartbeat even after counting closes. */}
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: 999,
            background: isDone ? "#d8c8a8" : "#e53935",
            boxShadow: "0 0 0 0 rgba(229, 57, 53, 0.7)",
            animation: isDone ? "none" : "pulse-live 1.6s infinite",
            flex: "none",
          }}
          aria-hidden="true"
        />
        <SmallCaps style={{ color: isDone ? "#d8c8a8" : "#e53935", letterSpacing: "0.18em" }}>
          {isDone ? "Result · 4 May 2026" : "Counting Live"}
        </SmallCaps>

        {isDone ? (
          // Bloc tally as the headline — TVK 108 · NDA 53 · SPA 73
          <span
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: "20px",
              fontWeight: 900,
              color: "#faf4e8",
              letterSpacing: "-0.01em",
              display: "flex",
              gap: "14px",
              flexWrap: "wrap",
              alignItems: "baseline",
            }}
          >
            {blocOrder.map((bloc, i) => (
              <span key={bloc} style={{ display: "inline-flex", alignItems: "baseline", gap: "6px" }}>
                <span style={{ color: BLOC_COLOUR[bloc] ?? "#faf4e8", fontWeight: 700 }}>
                  {BLOC_LABEL[bloc] ?? bloc}
                </span>
                <span>{blocCounts[bloc]}</span>
                {i < blocOrder.length - 1 && (
                  <span style={{ color: "#5a4d3f", marginLeft: "8px" }}>·</span>
                )}
              </span>
            ))}
          </span>
        ) : (
          <span
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: "18px",
              fontWeight: 800,
              color: "#faf4e8",
              letterSpacing: "-0.01em",
            }}
          >
            {declared} <span style={{ fontWeight: 500, color: "#d8c8a8" }}>of 234 ACs trending</span>
          </span>
        )}

        <span
          style={{
            fontFamily: MONO,
            fontSize: "11px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#d8c8a8",
            marginLeft: "auto",
          }}
        >
          {isDone ? "ECI · all 234 declared" : `ECI · ${ts} IST · 04 May 2026`}
        </span>
        <span
          style={{
            fontFamily: MONO,
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#faf4e8",
            borderBottom: "1px solid #faf4e8",
            paddingBottom: "1px",
          }}
        >
          {isDone ? "Replay the day →" : "Replay the day →"}
        </span>
      </div>
      <style>{`
        @keyframes pulse-live {
          0%   { box-shadow: 0 0 0 0   rgba(229, 57, 53, 0.65); }
          70%  { box-shadow: 0 0 0 10px rgba(229, 57, 53, 0); }
          100% { box-shadow: 0 0 0 0   rgba(229, 57, 53, 0); }
        }
      `}</style>
    </Link>
  );
};
