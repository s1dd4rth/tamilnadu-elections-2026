"use client";

import React, { useMemo, useState } from "react";
import { SERIF, MONO, COLORS } from "@/styles/theme";
import { SmallCaps } from "./common";
import { PartyFlag } from "./PartyFlag";
import hexData from "@/data/ac-hex.json";

// ─────────────────────────────────────────────────────────────
// Alliance palette + shape markers (mirrors SeatHemicycle so
// the two visualisations read as one language).
// ─────────────────────────────────────────────────────────────

const ALLIANCE_COLOUR: Record<string, string> = {
  SPA: "#a04020",
  NDA: "#1f4e3d",
  TVK: "#a61e5e",
  NTK: "#d8a520",
  IND: "#7a6a56",
  OTHER: "#4a3a2c",
  UNKNOWN: "#e0d5c2",
};

const ALLIANCE_LABEL: Record<string, string> = {
  SPA: "DMK-led (SPA)",
  NDA: "AIADMK-led (NDA)",
  TVK: "TVK (Vijay)",
  NTK: "NTK (Seeman)",
  IND: "Independent",
  OTHER: "Other",
  UNKNOWN: "Awaiting result",
};

const MARKER_FILL = "#faf4e8";

function renderMarker(alliance: string, cx: number, cy: number, size: number) {
  const s = size * 0.5;
  const sw = Math.max(0.8, size * 0.25);
  switch (alliance) {
    case "NDA":
      return (
        <g stroke={MARKER_FILL} strokeWidth={sw} strokeLinecap="round">
          <line x1={cx - s} y1={cy} x2={cx + s} y2={cy} />
          <line x1={cx} y1={cy - s} x2={cx} y2={cy + s} />
        </g>
      );
    case "TVK":
      return (
        <g stroke={MARKER_FILL} strokeWidth={sw} strokeLinecap="round">
          <line x1={cx - s} y1={cy - s} x2={cx + s} y2={cy + s} />
          <line x1={cx - s} y1={cy + s} x2={cx + s} y2={cy - s} />
        </g>
      );
    case "NTK":
      return (
        <line
          x1={cx - s}
          y1={cy}
          x2={cx + s}
          y2={cy}
          stroke={MARKER_FILL}
          strokeWidth={sw}
          strokeLinecap="round"
        />
      );
    default:
      return null;
  }
}

// Parse "x,y x,y ..." once per hex and cache the centroid for marker placement.
type HexGeom = {
  no: number;
  name: string;
  district: string;
  points: string;
  cx: number;
  cy: number;
  size: number; // rough hex radius, used to size markers
};

const HEXES: HexGeom[] = hexData.hexes.map((h) => {
  const coords = h.points.split(" ").map((p) => p.split(",").map(Number) as [number, number]);
  let sx = 0, sy = 0;
  // last point duplicates first — skip it for centroid
  const unique = coords.slice(0, -1);
  for (const [x, y] of unique) {
    sx += x;
    sy += y;
  }
  const cx = sx / unique.length;
  const cy = sy / unique.length;
  // rough "radius" = avg distance from centroid to vertex
  let r = 0;
  for (const [x, y] of unique) {
    r += Math.hypot(x - cx, y - cy);
  }
  r /= unique.length;
  return {
    no: h.no,
    name: h.name,
    district: h.district,
    points: h.points,
    cx,
    cy,
    size: r,
  };
});

// Sort ascending by AC number so index lookup matches seats[] which is
// also AC-ordered (analysis.json acs[] is 1..234).
HEXES.sort((a, b) => a.no - b.no);

// ─────────────────────────────────────────────────────────────

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
  title: string;
  kicker: string;
  seats: Seat[];
  legend: Array<{ alliance: string; count: number | null }>;
  caption?: React.ReactNode;
};

export const SeatHexMap: React.FC<Props> = ({ title, kicker, seats, legend, caption }) => {
  // Index seats by AC number for O(1) lookup per hex.
  const seatByAc = useMemo(() => {
    const m = new Map<number, Seat>();
    for (const s of seats) m.set(s.no, s);
    return m;
  }, [seats]);

  const [hoverAc, setHoverAc] = useState<number | null>(null);
  const activeSeat = hoverAc != null ? seatByAc.get(hoverAc) ?? null : null;

  // Small inset pad around the geometry so strokes aren't clipped.
  const pad = 6;
  const vbX = -pad;
  const vbY = -pad;
  const vbW = hexData.width + pad * 2;
  const vbH = hexData.height + pad * 2;

  return (
    <div style={{ background: "#fff9ef", border: `1.5px solid ${COLORS.text}`, padding: "28px", boxShadow: "6px 6px 0 rgba(26,20,16,0.05)" }}>
      <SmallCaps style={{ color: COLORS.accent }}>{kicker}</SmallCaps>
      <h3
        style={{
          fontFamily: SERIF,
          fontSize: "clamp(24px, 3.2vw, 32px)",
          fontWeight: 900,
          fontStyle: "italic",
          margin: "6px 0 14px",
          color: COLORS.text,
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </h3>

      <div style={{ position: "relative", width: "100%" }}>
        <svg
          viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          {HEXES.map((h) => {
            const seat = seatByAc.get(h.no);
            const alliance = seat?.alliance ?? "UNKNOWN";
            const fill = ALLIANCE_COLOUR[alliance] ?? ALLIANCE_COLOUR.OTHER;
            const isUnknown = alliance === "UNKNOWN";
            const isActive = hoverAc === h.no;
            return (
              <g
                key={h.no}
                onMouseEnter={() => setHoverAc(h.no)}
                onMouseLeave={() => setHoverAc(null)}
                onFocus={() => setHoverAc(h.no)}
                onBlur={() => setHoverAc(null)}
                tabIndex={0}
                role="img"
                aria-label={
                  seat
                    ? `AC ${seat.no} ${seat.name} — ${seat.alliance} ${seat.winnerName}`
                    : `AC ${h.no} ${h.name}`
                }
                style={{ cursor: "pointer", outline: "none" }}
              >
                <polygon
                  points={h.points}
                  fill={isUnknown ? "#faf4e8" : fill}
                  stroke={isActive ? COLORS.text : isUnknown ? "#c9bfae" : "#faf4e8"}
                  strokeWidth={isActive ? 2.2 : 0.9}
                  style={{ transition: "stroke-width 120ms ease" }}
                />
                {!isUnknown && renderMarker(alliance, h.cx, h.cy, h.size)}
              </g>
            );
          })}
        </svg>
      </div>

      {/* hover detail — same shape as hemicycle so the two visual units read as one */}
      <div
        style={{
          minHeight: "60px",
          marginTop: "16px",
          padding: "12px 14px",
          border: `1px dashed ${COLORS.muted}`,
          background: "#faf4e8",
        }}
      >
        {activeSeat ? (
          <div style={{ display: "grid", gridTemplateColumns: "auto auto 1fr auto", gap: "14px", alignItems: "center" }}>
            <div style={{ fontFamily: MONO, fontSize: "11px", color: COLORS.muted, letterSpacing: "0.1em" }}>
              AC № {activeSeat.no}
            </div>
            <PartyFlag party={activeSeat.party} size={28} />
            <div>
              <div style={{ fontFamily: SERIF, fontSize: "19px", fontWeight: 800, color: COLORS.text }}>
                {activeSeat.name}
              </div>
              <div style={{ fontFamily: SERIF, fontSize: "13px", fontStyle: "italic", color: "#3a302a", marginTop: "2px" }}>
                {activeSeat.alliance === "UNKNOWN"
                  ? activeSeat.winnerName
                  : `${activeSeat.winnerName} · ${activeSeat.party} · won by ${activeSeat.margin.toLocaleString("en-IN")} (${activeSeat.marginPct.toFixed(2)}%)`}
              </div>
            </div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                color: ALLIANCE_COLOUR[activeSeat.alliance],
              }}
            >
              {ALLIANCE_LABEL[activeSeat.alliance] || ALLIANCE_LABEL.OTHER}
            </div>
          </div>
        ) : (
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "13px", color: COLORS.muted, lineHeight: 1.5 }}>
            Hover any cell — one hex per constituency, equal area. The shape follows Tamil Nadu's outline but treats a Chennai ward and a Nilgiris seat the same size.
          </div>
        )}
      </div>

      {/* legend */}
      <div style={{ marginTop: "16px", display: "flex", flexWrap: "wrap", gap: "18px" }}>
        {legend.map(({ alliance, count }) => {
          const fill = ALLIANCE_COLOUR[alliance] || ALLIANCE_COLOUR.OTHER;
          const isUnknown = alliance === "UNKNOWN";
          return (
            <div key={alliance} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width={18} height={18} viewBox="-9 -9 18 18" aria-hidden="true" style={{ flex: "none" }}>
                {(() => {
                  // flat-top hexagon matching the map
                  const r = 7;
                  const pts = [0, 1, 2, 3, 4, 5]
                    .map((i) => {
                      const a = (Math.PI / 3) * i;
                      return `${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`;
                    })
                    .join(" ");
                  return (
                    <>
                      <polygon
                        points={pts}
                        fill={isUnknown ? COLORS.background : fill}
                        stroke={isUnknown ? "#c9bfae" : COLORS.text}
                        strokeWidth={1}
                      />
                      {!isUnknown && renderMarker(alliance, 0, 0, r)}
                    </>
                  );
                })()}
              </svg>
              <span style={{ fontFamily: MONO, fontSize: "11px", letterSpacing: "0.08em", color: COLORS.text, fontWeight: 600, whiteSpace: "nowrap" }}>
                {ALLIANCE_LABEL[alliance] || alliance}
                {count != null && (
                  <span style={{ color: COLORS.accent, marginLeft: "6px" }}>· {count}</span>
                )}
              </span>
            </div>
          );
        })}
      </div>

      {caption && (
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "13px", color: COLORS.muted, margin: "18px 0 0", borderTop: `1px dotted ${COLORS.muted}`, paddingTop: "12px", lineHeight: 1.6 }}>
          {caption}
        </p>
      )}
    </div>
  );
};
