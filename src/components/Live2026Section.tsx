"use client";

import React, { useMemo, useState } from "react";
import { SERIF, COLORS } from "@/styles/theme";
import { SeatHemicycle } from "./SeatHemicycle";
import { SeatHexMap } from "./SeatHexMap";
import { TimelineScrubber, type TimelineSnapshot } from "./TimelineScrubber";

type ACMeta = { no: number; name: string };

type Seat = {
  no: number;
  name: string;
  alliance: string;
  party: string;
  winnerName: string;
  margin: number;
  marginPct: number;
};

type Props = {
  acs: ACMeta[];
  snapshots: TimelineSnapshot[];
};

const BLOCS_4WAY = ["SPA", "NDA", "TVK", "NTK"] as const;

export const Live2026Section: React.FC<Props> = ({ acs, snapshots }) => {
  // Default to the latest snapshot ("now"). State is the index, so changing
  // it from the scrubber re-derives both seats arrays in one render.
  const [idx, setIdx] = useState(snapshots.length - 1);

  const snap = snapshots[idx];

  // Build the seats array for the currently-selected snapshot. ACs without
  // a trend in this snapshot stay UNKNOWN — same shape the placeholder used,
  // so the hemicycle/hex map need no special-casing.
  const seats: Seat[] = useMemo(() => {
    return acs.map((a) => {
      const r = snap?.results?.[String(a.no)];
      if (!r) {
        return {
          no: a.no,
          name: a.name,
          alliance: "UNKNOWN",
          party: "",
          winnerName: "Awaiting trend",
          margin: 0,
          marginPct: 0,
        };
      }
      const [party, bloc, candidate] = r;
      return {
        no: a.no,
        name: a.name,
        alliance: bloc,
        party,
        winnerName: candidate,
        // ECI's live feed gives no margins yet — surface 0 so the seat
        // components can switch their hover copy to "Leading · candidate"
        // (rather than "won by 0").
        margin: 0,
        marginPct: 0,
      };
    });
  }, [acs, snap]);

  // Live legend — count actual leads per bloc. Includes a placeholder
  // count for any IND/OTHER seats only when present (keeps the legend
  // honest without permanently advertising buckets that may stay empty).
  const legend = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of seats) {
      if (s.alliance === "UNKNOWN") continue;
      counts[s.alliance] = (counts[s.alliance] ?? 0) + 1;
    }
    const entries: Array<{ alliance: string; count: number | null }> = [];
    for (const b of BLOCS_4WAY) {
      entries.push({ alliance: b, count: counts[b] ?? 0 });
    }
    if (counts.IND) entries.push({ alliance: "IND", count: counts.IND });
    if (counts.OTHER) entries.push({ alliance: "OTHER", count: counts.OTHER });
    const pending = seats.length - Object.values(counts).reduce((a, b) => a + b, 0);
    if (pending > 0) entries.push({ alliance: "UNKNOWN", count: pending });
    return entries;
  }, [seats]);

  const declaredCount = snap?.declared ?? 0;
  const isLatest = idx === snapshots.length - 1;
  const liveTag = isLatest ? "LIVE" : "REPLAY";

  return (
    <>
      {/* Lede */}
      <header style={{ marginBottom: "32px" }}>
        <p
          style={{
            fontFamily: SERIF,
            fontSize: "18px",
            lineHeight: 1.65,
            color: "#3a302a",
            maxWidth: "820px",
            margin: 0,
            fontStyle: "italic",
          }}
        >
          Counting began the morning of{" "}
          <strong style={{ color: COLORS.text, fontStyle: "normal" }}>4 May 2026</strong>. Each
          tick on the timeline below is a snapshot of ECI's live results page; drag the slider
          to watch the day unfold, or hit play to animate it. Both visuals — the hemicycle and
          the hex map — re-colour from the same selected moment.
        </p>
      </header>

      {/* Scrubber */}
      <div style={{ marginBottom: "28px" }}>
        <TimelineScrubber snapshots={snapshots} selectedIdx={idx} onSelect={setIdx} />
      </div>

      {/* Hemicycle + hex map driven by the selected snapshot */}
      <section style={{ marginBottom: "56px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
            gap: "22px",
            alignItems: "start",
          }}
        >
          <SeatHemicycle
            kicker={`2026 · ${liveTag} · ${declaredCount}/234`}
            title="The arc as it stood at this moment."
            seats={seats}
            legend={legend}
            caption={
              <>
                Each dot is one of the 234 Tamil Nadu constituencies. Coloured dots are the
                trend at the selected snapshot — DMK-led <strong style={{ color: COLORS.text, fontStyle: "normal" }}>SPA</strong>, AIADMK-led <strong style={{ color: COLORS.text, fontStyle: "normal" }}>NDA</strong>, <strong style={{ color: COLORS.text, fontStyle: "normal" }}>TVK</strong> (Vijay), <strong style={{ color: COLORS.text, fontStyle: "normal" }}>NTK</strong> (Seeman). Empty dots are seats where ECI had not yet posted a trend.
              </>
            }
          />
          <SeatHexMap
            kicker={`2026 · ${liveTag} · ${declaredCount}/234`}
            title="The map as it stood at this moment."
            seats={seats}
            legend={legend}
            caption={
              <>
                Same data, laid out by geography. Equal-area hexes — a Chennai ward and a Nilgiris seat carry the same visual weight. Watching the slider is watching the belts colour in — first the early-finishing rural ACs, later the bigger urban ones.
              </>
            }
          />
        </div>
      </section>
    </>
  );
};
