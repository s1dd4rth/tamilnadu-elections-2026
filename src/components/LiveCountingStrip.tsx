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

export const LiveCountingStrip = () => {
  const snaps = resultsTimeline.snapshots;
  if (!snaps?.length) return null;

  const latest = snaps[snaps.length - 1];
  const declared = latest?.declared ?? 0;
  const ts = fmtIST(latest?.eciTs ?? latest?.ts);

  // Hide once counting is essentially done — saves the banner from
  // hanging around for weeks. Threshold tuned generously; users can
  // still hit /analysis directly.
  const isDone = declared >= 234;

  return (
    <Link
      href="/analysis"
      aria-label={`Counting in progress, ${declared} of 234 trending. View live map.`}
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
        {/* Pulsing red dot — drawn in CSS so SSR is fine. */}
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: 999,
            background: "#e53935",
            boxShadow: "0 0 0 0 rgba(229, 57, 53, 0.7)",
            animation: "pulse-live 1.6s infinite",
            flex: "none",
          }}
          aria-hidden="true"
        />
        <SmallCaps style={{ color: "#e53935", letterSpacing: "0.18em" }}>
          {isDone ? "Counting Complete" : "Counting Live"}
        </SmallCaps>
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
          ECI · {ts} IST · 04 May 2026
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
          Replay the day →
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
