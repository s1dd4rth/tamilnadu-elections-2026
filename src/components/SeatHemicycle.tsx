"use client";

import React, { useMemo, useState } from "react";
import { SERIF, MONO, COLORS } from "@/styles/theme";
import { SmallCaps } from "./common";

// ─────────────────────────────────────────────────────────────
// Layout — 234 dots in a semicircle, rows, even-ish spacing.
// Seat index → fixed (x, y) by AC number, so 2021 and 2026
// hemicycles can be laid out identically and compared dot-by-dot.
// ─────────────────────────────────────────────────────────────

type SeatPos = { row: number; col: number; x: number; y: number; r: number };

function hemicycleLayout(n: number, rows: number, innerR: number, outerR: number): SeatPos[] {
  const radii: number[] = [];
  for (let j = 0; j < rows; j++) {
    radii.push(innerR + (j * (outerR - innerR)) / (rows - 1));
  }
  const totalArc = radii.reduce((s, r) => s + Math.PI * r, 0);
  const counts = radii.map((r) => Math.round((n * Math.PI * r) / totalArc));
  let diff = n - counts.reduce((a, b) => a + b, 0);
  // Adjust outer rows first so inner rows stay neat
  let i = counts.length - 1;
  while (diff !== 0) {
    counts[i] += diff > 0 ? 1 : -1;
    diff += diff > 0 ? -1 : 1;
    i = (i - 1 + counts.length) % counts.length;
  }
  const seats: SeatPos[] = [];
  for (let j = 0; j < rows; j++) {
    const count = counts[j];
    const r = radii[j];
    for (let k = 0; k < count; k++) {
      const theta = Math.PI - ((k + 0.5) * Math.PI) / count;
      seats.push({
        row: j,
        col: k,
        x: r * Math.cos(theta),
        y: -r * Math.sin(theta),
        r,
      });
    }
  }
  // Order seats: left-to-right across the whole arc, so seat index 0
  // is the far-left-outer dot and index n-1 is the far-right-outer.
  seats.sort((a, b) => {
    const ta = Math.atan2(-a.y, a.x);
    const tb = Math.atan2(-b.y, b.x);
    return tb - ta; // decreasing theta = left to right
  });
  return seats;
}

// ─────────────────────────────────────────────────────────────
// Colour palette.
// ─────────────────────────────────────────────────────────────

const ALLIANCE_COLOUR: Record<string, string> = {
  SPA: "#a04020",   // DMK-led — deep rust (site accent, editorial lead)
  NDA: "#1f4e3d",   // AIADMK-led — deep green
  IND: "#7a6a56",   // independents — muted sepia
  OTHER: "#4a3a2c", // everything else — dark sepia
  UNKNOWN: "#e0d5c2", // placeholder before 2026 results come in
};

const ALLIANCE_LABEL: Record<string, string> = {
  SPA: "DMK-led (SPA)",
  NDA: "AIADMK-led (NDA)",
  IND: "Independent",
  OTHER: "Other",
  UNKNOWN: "Awaiting result",
};

// ─────────────────────────────────────────────────────────────
// Component.
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
  legendCounts?: Record<string, number>;
  caption?: React.ReactNode;
};

export const SeatHemicycle: React.FC<Props> = ({ title, kicker, seats, legendCounts, caption }) => {
  const N = seats.length;
  const positions = useMemo(
    () => hemicycleLayout(N, 7, 160, 320),
    [N]
  );

  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  // seats come in AC-number order; map to seat position by index
  const seatData = seats.map((s, i) => ({ seat: s, pos: positions[i] }));

  const activeSeat = hoverIdx != null ? seatData[hoverIdx] : null;

  // SVG viewbox sized to fit the arc plus some padding
  const pad = 24;
  const vbW = 320 * 2 + pad * 2;
  const vbH = 320 + pad * 2;

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
          viewBox={`${-320 - pad} ${-320 - pad} ${vbW} ${vbH}`}
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          {/* seat dots */}
          {seatData.map(({ seat, pos }, i) => {
            const fill = ALLIANCE_COLOUR[seat.alliance] || ALLIANCE_COLOUR.OTHER;
            const isActive = hoverIdx === i;
            return (
              <circle
                key={i}
                cx={pos.x}
                cy={pos.y}
                r={isActive ? 9 : 7}
                fill={fill}
                stroke={isActive ? COLORS.text : "none"}
                strokeWidth={isActive ? 2 : 0}
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
                style={{ cursor: "pointer", transition: "r 120ms ease" }}
              />
            );
          })}

          {/* centre total label */}
          <text
            x={0}
            y={-50}
            fontFamily={MONO}
            fontSize="16"
            fontWeight="700"
            letterSpacing="0.12em"
            textAnchor="middle"
            fill={COLORS.muted}
          >
            TAMIL NADU
          </text>
          <text
            x={0}
            y={0}
            fontFamily={SERIF}
            fontSize="88"
            fontWeight="900"
            fontStyle="italic"
            textAnchor="middle"
            fill={COLORS.text}
            letterSpacing="-0.04em"
          >
            {N}
          </text>
          <text
            x={0}
            y={28}
            fontFamily={MONO}
            fontSize="12"
            letterSpacing="0.14em"
            textAnchor="middle"
            fill={COLORS.muted}
          >
            ASSEMBLY SEATS
          </text>
        </svg>
      </div>

      {/* hover detail */}
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
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "16px", alignItems: "center" }}>
            <div style={{ fontFamily: MONO, fontSize: "11px", color: COLORS.muted, letterSpacing: "0.1em" }}>
              AC № {activeSeat.seat.no}
            </div>
            <div>
              <div style={{ fontFamily: SERIF, fontSize: "19px", fontWeight: 800, color: COLORS.text }}>
                {activeSeat.seat.name}
              </div>
              <div style={{ fontFamily: SERIF, fontSize: "13px", fontStyle: "italic", color: "#3a302a", marginTop: "2px" }}>
                {activeSeat.seat.winnerName} · {activeSeat.seat.party} · won by{" "}
                {activeSeat.seat.margin.toLocaleString("en-IN")} ({activeSeat.seat.marginPct.toFixed(2)}%)
              </div>
            </div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                color: ALLIANCE_COLOUR[activeSeat.seat.alliance],
              }}
            >
              {ALLIANCE_LABEL[activeSeat.seat.alliance] || ALLIANCE_LABEL.OTHER}
            </div>
          </div>
        ) : (
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "13px", color: COLORS.muted, lineHeight: 1.5 }}>
            Hover any dot — each represents one of the 234 Tamil Nadu constituencies.
          </div>
        )}
      </div>

      {/* legend */}
      <div style={{ marginTop: "16px", display: "flex", flexWrap: "wrap", gap: "18px" }}>
        {["SPA", "NDA", "OTHER", "UNKNOWN"].map((a) => {
          const count = legendCounts?.[a];
          if (count === 0) return null;
          return (
            <div key={a} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  width: "14px",
                  height: "14px",
                  borderRadius: "50%",
                  background: ALLIANCE_COLOUR[a],
                  border: `1px solid ${COLORS.text}`,
                }}
              />
              <span style={{ fontFamily: MONO, fontSize: "11px", letterSpacing: "0.08em", color: COLORS.text, fontWeight: 600 }}>
                {ALLIANCE_LABEL[a]}
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
