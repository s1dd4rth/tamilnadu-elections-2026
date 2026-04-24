"use client";

import React, { useMemo, useState } from "react";
import { SERIF, MONO, COLORS } from "@/styles/theme";
import { SmallCaps, SectionTitle } from "./common";
import hexData from "@/data/ac-hex.json";
import analysisData from "@/data/analysis.json";
import turnoutData from "@/data/turnout.json";
import { useIsMobile } from "@/hooks/useMediaQuery";

// ─────────────────────────────────────────────────────────────
// Data + scales (precomputed once).
// ─────────────────────────────────────────────────────────────

type AC = (typeof analysisData.acs)[number];

const ACS_BY_NO = new Map<number, AC>(analysisData.acs.map((a) => [a.no, a]));

const VTR26_VALS = analysisData.acs.map((a) => a.vtr2026);
const VTR21_VALS = analysisData.acs.map((a) => a.vtr2021);
const DELTA_VALS = analysisData.acs.map((a) => a.vtr2026 - a.vtr2021);

const MIN_26 = Math.min(...VTR26_VALS);
const MAX_26 = Math.max(...VTR26_VALS);
const MIN_D = Math.min(...DELTA_VALS);
const MAX_D = Math.max(...DELTA_VALS);

// editorial extremes — used in the caption.
const EXTREMES = {
  high26: analysisData.acs.reduce((best, a) => (a.vtr2026 > best.vtr2026 ? a : best), analysisData.acs[0]),
  low26: analysisData.acs.reduce((worst, a) => (a.vtr2026 < worst.vtr2026 ? a : worst), analysisData.acs[0]),
  maxDelta: analysisData.acs.reduce((best, a) => {
    const d = a.vtr2026 - a.vtr2021;
    const bd = best.vtr2026 - best.vtr2021;
    return d > bd ? a : best;
  }, analysisData.acs[0]),
  minDelta: analysisData.acs.reduce((worst, a) => {
    const d = a.vtr2026 - a.vtr2021;
    const wd = worst.vtr2026 - worst.vtr2021;
    return d < wd ? a : worst;
  }, analysisData.acs[0]),
};

function rampColor(t: number, stops: Array<[number, number[]]>): string {
  t = Math.max(0, Math.min(1, t));
  let a = stops[0], b = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (t >= stops[i][0] && t <= stops[i + 1][0]) { a = stops[i]; b = stops[i + 1]; break; }
  }
  const s = (t - a[0]) / ((b[0] - a[0]) || 1);
  const rgb = a[1].map((v0, i) => Math.round(v0 + (b[1][i] - v0) * s));
  return "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("");
}

const VTR_RAMP: Array<[number, number[]]> = [
  [0.00, [250, 244, 232]],
  [0.35, [232, 201, 176]],
  [0.70, [160, 64, 32]],
  [1.00, [58, 44, 34]],
];

const DELTA_RAMP: Array<[number, number[]]> = [
  [0.00, [245, 235, 218]],
  [0.50, [200, 136, 106]],
  [1.00, [26, 20, 16]],
];

const colorForVtr = (v: number) => rampColor((v - MIN_26) / (MAX_26 - MIN_26), VTR_RAMP);
const colorForDelta = (d: number) => rampColor((d - MIN_D) / (MAX_D - MIN_D), DELTA_RAMP);

type MapMode = "2026" | "delta";

// ─────────────────────────────────────────────────────────────
// Component.
// ─────────────────────────────────────────────────────────────

const MapToggle = ({ mode, setMode }: { mode: MapMode; setMode: (m: MapMode) => void }) => {
  const btn = (m: MapMode, label: string) => (
    <button
      key={m}
      onClick={() => setMode(m)}
      style={{
        fontFamily: MONO,
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        padding: "10px 16px",
        border: `1.5px solid ${COLORS.text}`,
        background: mode === m ? COLORS.text : COLORS.background,
        color: mode === m ? COLORS.background : COLORS.text,
        cursor: "pointer",
        transition: "all 150ms ease",
      }}
    >
      {label}
    </button>
  );
  return (
    <div style={{ display: "inline-flex", marginBottom: "14px", gap: 0, border: `1.5px solid ${COLORS.text}`, boxShadow: "3px 3px 0 rgba(26,20,16,0.05)" }}>
      {btn("2026", "2026 Turnout")}
      {btn("delta", "Change Since 2021")}
    </div>
  );
};

const Legend = ({ mode }: { mode: MapMode }) => {
  const isDelta = mode === "delta";
  const title = isDelta ? "TURNOUT CHANGE 2021 → 2026 (PP)" : "VTR 2026 (%)";
  const labelLo = isDelta ? `+${MIN_D.toFixed(1)}` : `${MIN_26.toFixed(1)}%`;
  const labelHi = isDelta ? `+${MAX_D.toFixed(1)}` : `${MAX_26.toFixed(1)}%`;
  const caption = isDelta
    ? `${EXTREMES.minDelta.name} (smallest jump) → ${EXTREMES.maxDelta.name} (biggest)`
    : `${EXTREMES.low26.name} (lowest) → ${EXTREMES.high26.name} (highest)`;
  const steps = 11;
  return (
    <div style={{ marginTop: "16px", padding: "12px 14px", border: `1px dashed ${COLORS.muted}`, background: "#faf4e8" }}>
      <div style={{ fontFamily: MONO, fontSize: "10px", letterSpacing: "0.18em", color: COLORS.muted, fontWeight: 700, marginBottom: "8px" }}>
        {title}
      </div>
      <div style={{ display: "flex", alignItems: "stretch" }}>
        {Array.from({ length: steps }, (_, i) => {
          const t = i / (steps - 1);
          const v = isDelta
            ? MIN_D + (MAX_D - MIN_D) * t
            : MIN_26 + (MAX_26 - MIN_26) * t;
          const fill = isDelta ? colorForDelta(v) : colorForVtr(v);
          return (
            <div key={i} style={{ flex: 1, height: 16, background: fill, border: `0.5px solid ${COLORS.text}` }} />
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: SERIF, fontStyle: "italic", fontSize: "13px", color: "#3a302a", marginTop: "6px" }}>
        <span>{labelLo}</span>
        <span>{labelHi}</span>
      </div>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "12px", color: COLORS.muted, marginTop: "4px", textAlign: "center" }}>
        {caption}
      </div>
    </div>
  );
};

const ACPanel = ({ ac, mode }: { ac: AC | null; mode: MapMode }) => {
  if (!ac) {
    return (
      <div style={{ fontFamily: SERIF, color: "#3a302a", fontSize: "14px", lineHeight: 1.6 }}>
        <SmallCaps style={{ color: COLORS.accent }}>Navigation</SmallCaps>
        <p style={{ margin: "10px 0 0", fontStyle: "italic" }}>
          Hover any cell — one hex per constituency. The state averaged{" "}
          <strong style={{ color: COLORS.text, fontStyle: "normal" }}>{turnoutData.state.vtr2026}%</strong> on 23 April,{" "}
          <strong style={{ color: COLORS.accent, fontStyle: "normal" }}>+{(turnoutData.state.vtr2026 - turnoutData.state.vtr2021).toFixed(2)} pp</strong>{" "}
          above 2021 — but the AC-level spread is wide: {EXTREMES.low26.name} at {EXTREMES.low26.vtr2026.toFixed(2)}% to {EXTREMES.high26.name} at {EXTREMES.high26.vtr2026.toFixed(2)}%.
        </p>
        <p style={{ margin: "10px 0 0", fontStyle: "italic" }}>
          Click the toggle above to switch from absolute turnout to the change since 2021. Every single AC went up — the question is by how much.
        </p>
      </div>
    );
  }
  const delta = ac.vtr2026 - ac.vtr2021;
  const mainNum = mode === "delta" ? `+${delta.toFixed(2)} pp` : `${ac.vtr2026.toFixed(2)}%`;
  const mainLabel = mode === "delta" ? "CHANGE SINCE 2021" : "VTR 2026";
  return (
    <div>
      <SmallCaps style={{ color: COLORS.accent }}>AC № {ac.no} · {ac.district}</SmallCaps>
      <h3 style={{
        fontFamily: SERIF,
        fontSize: "clamp(30px, 4.2vw, 44px)",
        fontWeight: 900,
        margin: "4px 0 2px",
        letterSpacing: "-0.02em",
        color: COLORS.text,
        lineHeight: 0.95,
      }}>{ac.name}</h3>
      <p style={{ fontFamily: SERIF, fontStyle: "italic", color: COLORS.muted, fontSize: "14px", margin: "0 0 14px" }}>
        {ac.elec2026.toLocaleString("en-IN")} electors on the 2026 roll
      </p>

      <div style={{
        fontFamily: SERIF,
        fontSize: "clamp(38px, 5.5vw, 54px)",
        fontWeight: 800,
        lineHeight: 1,
        color: COLORS.text,
        fontFeatureSettings: '"tnum" 1, "lnum" 1',
        letterSpacing: "-0.03em",
      }}>
        {mainNum}
      </div>
      <div style={{ fontFamily: MONO, fontSize: "10px", letterSpacing: "0.15em", color: COLORS.muted, marginTop: "2px" }}>
        {mainLabel}
      </div>

      <div style={{ marginTop: "22px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", paddingTop: "14px", borderTop: "1px solid #d4c9bc" }}>
        <div>
          <SmallCaps style={{ color: COLORS.muted }}>VTR 2021</SmallCaps>
          <div style={{ fontFamily: SERIF, fontSize: "18px", fontWeight: 700, color: COLORS.text }}>
            {ac.vtr2021.toFixed(2)}%
          </div>
        </div>
        <div>
          <SmallCaps style={{ color: COLORS.muted }}>VTR 2026</SmallCaps>
          <div style={{ fontFamily: SERIF, fontSize: "18px", fontWeight: 700, color: COLORS.text }}>
            {ac.vtr2026.toFixed(2)}%
          </div>
        </div>
        <div>
          <SmallCaps style={{ color: COLORS.muted }}>Δ</SmallCaps>
          <div style={{ fontFamily: SERIF, fontSize: "18px", fontWeight: 700, color: COLORS.accent }}>
            +{delta.toFixed(2)} pp
          </div>
        </div>
      </div>

      <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid #d4c9bc" }}>
        <SmallCaps style={{ color: COLORS.muted }}>2021 winner</SmallCaps>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "14px", color: "#3a302a", margin: "4px 0 0", lineHeight: 1.5 }}>
          {ac.winner2021.name} · {ac.winner2021.party} · won by {ac.margin2021.toLocaleString("en-IN")} ({ac.marginPct2021.toFixed(2)}%)
        </p>
      </div>
    </div>
  );
};

// Precompute hex geometry once (centroid + size used nowhere for this map
// since it's a choropleth, but keep the parse for future reuse).
const HEX_VB = { w: hexData.width, h: hexData.height };
const HEXES = hexData.hexes.map((h) => ({ no: h.no, points: h.points }));

export const ACTurnoutMap = () => {
  const [mode, setMode] = useState<MapMode>("2026");
  const [hoverAc, setHoverAc] = useState<number | null>(null);
  const [selectedAc, setSelectedAc] = useState<number | null>(null);
  const isMobile = useIsMobile();

  const activeAc = useMemo(() => {
    const no = hoverAc ?? selectedAc;
    return no != null ? ACS_BY_NO.get(no) ?? null : null;
  }, [hoverAc, selectedAc]);

  const pad = 6;
  const vbX = -pad;
  const vbY = -pad;
  const vbW = HEX_VB.w + pad * 2;
  const vbH = HEX_VB.h + pad * 2;

  return (
    <section style={{ margin: "48px 0 60px" }}>
      <div style={{ borderTop: `2px solid ${COLORS.text}` }} />
      <SectionTitle kicker="Turnout · 234 Constituencies">
        The map, drawn by how many showed up.
      </SectionTitle>

      <p style={{
        fontFamily: SERIF,
        fontStyle: "italic",
        fontSize: "16px",
        color: "#3a302a",
        maxWidth: "820px",
        margin: "0 0 22px",
        lineHeight: 1.65,
      }}>
        The district map above averages; this one does not. Each hex is a single assembly constituency.
        Every one of the 234 turned out harder than in 2021 — the smallest jump was{" "}
        <strong style={{ color: COLORS.text, fontStyle: "normal" }}>+{(EXTREMES.minDelta.vtr2026 - EXTREMES.minDelta.vtr2021).toFixed(2)} pp</strong>{" "}
        ({EXTREMES.minDelta.name}), the largest{" "}
        <strong style={{ color: COLORS.accent, fontStyle: "normal" }}>+{(EXTREMES.maxDelta.vtr2026 - EXTREMES.maxDelta.vtr2021).toFixed(2)} pp</strong>{" "}
        ({EXTREMES.maxDelta.name}).
      </p>

      <MapToggle mode={mode} setMode={setMode} />

      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 1.1fr) minmax(0, 1fr)",
        gap: isMobile ? "32px" : "40px",
        alignItems: "start",
      }}>
        <div style={{ border: `1.5px solid ${COLORS.text}`, background: "#fff9ef", padding: "16px", boxShadow: "6px 6px 0 rgba(26,20,16,0.05)" }}>
          <svg
            viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
            style={{ width: "100%", height: "auto", display: "block" }}
            role="img"
            aria-label="Hex tile map of 234 Tamil Nadu assembly constituencies, coloured by turnout"
          >
            {HEXES.map((h) => {
              const ac = ACS_BY_NO.get(h.no);
              if (!ac) return null;
              const v = mode === "delta" ? ac.vtr2026 - ac.vtr2021 : ac.vtr2026;
              const fill = mode === "delta" ? colorForDelta(v) : colorForVtr(v);
              const isActive = (hoverAc ?? selectedAc) === h.no;
              return (
                <polygon
                  key={h.no}
                  points={h.points}
                  fill={fill}
                  stroke={isActive ? COLORS.text : "#faf4e8"}
                  strokeWidth={isActive ? 2.2 : 0.8}
                  onMouseEnter={() => setHoverAc(h.no)}
                  onMouseLeave={() => setHoverAc(null)}
                  onClick={() => setSelectedAc(h.no === selectedAc ? null : h.no)}
                  onFocus={() => setHoverAc(h.no)}
                  onBlur={() => setHoverAc(null)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedAc(h.no === selectedAc ? null : h.no);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`AC ${ac.no} ${ac.name}, ${ac.vtr2026.toFixed(2)} percent turnout in 2026`}
                  style={{ cursor: "pointer", outline: "none", transition: "stroke-width 120ms ease" }}
                />
              );
            })}
          </svg>
          <Legend mode={mode} />
        </div>
        <div style={{
          paddingTop: isMobile ? "0" : "10px",
          position: isMobile ? "relative" : "sticky",
          top: isMobile ? "0" : "20px",
        }}>
          <ACPanel ac={activeAc} mode={mode} />
        </div>
      </div>
    </section>
  );
};
