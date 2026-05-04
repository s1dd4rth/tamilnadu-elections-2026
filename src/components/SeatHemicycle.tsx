"use client";

import React, { useMemo, useState } from "react";
import { SERIF, MONO, COLORS } from "@/styles/theme";
import { SmallCaps } from "./common";
import { PartyFlag } from "./PartyFlag";

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
  SPA: "#a04020",   // DMK-led — warm rust (site accent, editorial lead)
  NDA: "#1f4e3d",   // AIADMK-led — deep green
  TVK: "#a61e5e",   // Tamilaga Vetri Kazhagam — wine/magenta
  NTK: "#d8a520",   // Naam Tamilar Katchi — Seeman, gold
  IND: "#7a6a56",   // independents — muted sepia
  OTHER: "#4a3a2c", // everything else — dark sepia
  UNKNOWN: "#e0d5c2", // placeholder before 2026 results come in
};

// Inner markers overlaid on each dot so alliance is readable *without* colour
// (WCAG 1.4.1). Rendered in cream so they stand out on every fill.
// scale = radius → marker strokes/sizes scale with dot size.
const MARKER_FILL = "#faf4e8";

function renderMarker(alliance: string, r: number, cx: number, cy: number) {
  const s = r * 0.55; // marker half-extent
  const sw = Math.max(1, r * 0.28); // stroke width
  switch (alliance) {
    case "SPA":
      // solid fill, no marker — the baseline; most common colour
      return null;
    case "NDA":
      // cream "plus" inside the dot
      return (
        <g stroke={MARKER_FILL} strokeWidth={sw} strokeLinecap="round">
          <line x1={cx - s} y1={cy} x2={cx + s} y2={cy} />
          <line x1={cx} y1={cy - s} x2={cx} y2={cy + s} />
        </g>
      );
    case "TVK":
      // cream "x" diagonal cross
      return (
        <g stroke={MARKER_FILL} strokeWidth={sw} strokeLinecap="round">
          <line x1={cx - s} y1={cy - s} x2={cx + s} y2={cy + s} />
          <line x1={cx - s} y1={cy + s} x2={cx + s} y2={cy - s} />
        </g>
      );
    case "NTK":
      // single horizontal bar
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
    case "UNKNOWN":
      // open ring — no marker needed, but fill is near-background so outline
      // carries the shape. Handled by special-casing stroke below.
      return null;
    default:
      return null;
  }
}

const ALLIANCE_LABEL: Record<string, string> = {
  SPA: "DMK-led (SPA)",
  NDA: "AIADMK-led (NDA)",
  TVK: "TVK (Vijay)",
  NTK: "NTK (Seeman)",
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
  /**
   * Explicit legend entries. Each entry is an alliance code; pass `null`
   * for value to render as "expected contestant" (colour chip, no count).
   * Use this instead of trying to infer from seats, since in pre-results
   * mode we want to advertise the 4-way contest even when no seat has
   * been coloured yet.
   */
  legend: Array<{ alliance: string; count: number | null }>;
  caption?: React.ReactNode;
};

export const SeatHemicycle: React.FC<Props> = ({ title, kicker, seats, legend, caption }) => {
  const N = seats.length;
  const positions = useMemo(
    () => hemicycleLayout(N, 7, 160, 320),
    [N]
  );

  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  // seats come in AC-number order; map to seat position by index
  const seatData = seats.map((s, i) => ({ seat: s, pos: positions[i] }));

  const activeSeat = hoverIdx != null ? seatData[hoverIdx] : null;

  // SVG viewbox: top pad for the arc's top row, bottom pad for the
  // centre labels ("TAMIL NADU / 234 / ASSEMBLY SEATS") which sit in
  // the arc's central well.
  const padTop = 24;
  const padBottom = 90; // enough room for the 3-line centre label
  const vbW = 320 * 2 + padTop * 2;
  const vbH = 320 + padTop + padBottom;

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
          viewBox={`${-320 - padTop} ${-320 - padTop} ${vbW} ${vbH}`}
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          {/* seat dots — each rendered as a group: filled circle + inner
              pattern marker, so alliance is legible without relying on
              colour. UNKNOWN gets an outlined-only treatment. */}
          {seatData.map(({ seat, pos }, i) => {
            const fill = ALLIANCE_COLOUR[seat.alliance] || ALLIANCE_COLOUR.OTHER;
            const isActive = hoverIdx === i;
            const r = isActive ? 9 : 7;
            const isUnknown = seat.alliance === "UNKNOWN";
            return (
              <g
                key={i}
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
                onFocus={() => setHoverIdx(i)}
                onBlur={() => setHoverIdx(null)}
                style={{ cursor: "pointer" }}
                role="img"
                aria-label={`AC ${seat.no} ${seat.name} — ${seat.alliance} ${seat.winnerName}`}
                tabIndex={0}
              >
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={r}
                  fill={isUnknown ? COLORS.background : fill}
                  stroke={isActive ? COLORS.text : isUnknown ? fill : "none"}
                  strokeWidth={isActive ? 2 : isUnknown ? 1.5 : 0}
                  style={{ transition: "r 120ms ease" }}
                />
                {!isUnknown && renderMarker(seat.alliance, r, pos.x, pos.y)}
              </g>
            );
          })}

          {/* Centre label — sits in the well below the arc. The arc's
              inner row at r=160 leaves a clear y ∈ (0, 80) area at x=0. */}
          <text
            x={0}
            y={22}
            fontFamily={MONO}
            fontSize="15"
            fontWeight="700"
            letterSpacing="0.14em"
            textAnchor="middle"
            fill={COLORS.muted}
          >
            TAMIL NADU
          </text>
          <text
            x={0}
            y={70}
            fontFamily={SERIF}
            fontSize="56"
            fontWeight="900"
            fontStyle="italic"
            textAnchor="middle"
            fill={COLORS.text}
            letterSpacing="-0.03em"
          >
            {N}
          </text>
          <text
            x={0}
            y={88}
            fontFamily={MONO}
            fontSize="11"
            letterSpacing="0.16em"
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
          <div style={{ display: "grid", gridTemplateColumns: "auto auto 1fr auto", gap: "14px", alignItems: "center" }}>
            <div style={{ fontFamily: MONO, fontSize: "11px", color: COLORS.muted, letterSpacing: "0.1em" }}>
              AC № {activeSeat.seat.no}
            </div>
            <PartyFlag party={activeSeat.seat.party} size={28} />
            <div>
              <div style={{ fontFamily: SERIF, fontSize: "19px", fontWeight: 800, color: COLORS.text }}>
                {activeSeat.seat.name}
              </div>
              <div style={{ fontFamily: SERIF, fontSize: "13px", fontStyle: "italic", color: "#3a302a", marginTop: "2px" }}>
                {activeSeat.seat.alliance === "UNKNOWN"
                  ? activeSeat.seat.winnerName
                  : activeSeat.seat.margin > 0
                  ? `${activeSeat.seat.winnerName} · ${activeSeat.seat.party} · won by ${activeSeat.seat.margin.toLocaleString("en-IN")} (${activeSeat.seat.marginPct.toFixed(2)}%)`
                  : `${activeSeat.seat.winnerName} · ${activeSeat.seat.party} · leading`}
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

      {/* legend — each chip mirrors the dot (fill + inner marker) so
          the colour + shape pairing is visible here too. */}
      <div style={{ marginTop: "16px", display: "flex", flexWrap: "wrap", gap: "18px" }}>
        {legend.map(({ alliance, count }) => {
          const fill = ALLIANCE_COLOUR[alliance] || ALLIANCE_COLOUR.OTHER;
          const isUnknown = alliance === "UNKNOWN";
          return (
            <div key={alliance} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width={18} height={18} viewBox="-9 -9 18 18" aria-hidden="true" style={{ flex: "none" }}>
                <circle
                  cx={0}
                  cy={0}
                  r={7}
                  fill={isUnknown ? COLORS.background : fill}
                  stroke={isUnknown ? fill : COLORS.text}
                  strokeWidth={isUnknown ? 1.5 : 1}
                />
                {!isUnknown && renderMarker(alliance, 7, 0, 0)}
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
