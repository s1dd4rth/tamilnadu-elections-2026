"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { SERIF, MONO, COLORS } from '@/styles/theme';
import { SmallCaps, SectionTitle } from './common';
import { PartyFlag } from './PartyFlag';
import turnoutData from '@/data/turnout.json';
import analysisData from '@/data/analysis.json';
import districtsData from '@/data/districts.json';
import { MAP_COORDS, TN_CLIP_PATHS, VORONOI_CELLS } from '@/data/map-data';
import mapSvgData from '@/data/map-svg.json';
import { useIsMobile } from '@/hooks/useMediaQuery';

type MapMode = '2026' | 'delta';

const vtrByDistrictId: Record<string, number> = Object.fromEntries(
  turnoutData.districts.map(d => [d.id, d.vtr])
);
const vtr2021ByDistrictId: Record<string, number | null> = Object.fromEntries(
  turnoutData.districts.map(d => [d.id, (d as any).vtr2021 ?? null])
);
const deltaByDistrictId: Record<string, number | null> = Object.fromEntries(
  turnoutData.districts.map(d => [d.id, (d as any).delta ?? null])
);

const vtrVals = turnoutData.districts.map(d => d.vtr);
const MIN_V = Math.min(...vtrVals);
const MAX_V = Math.max(...vtrVals);

const deltaVals = turnoutData.districts.map(d => (d as any).delta).filter((x: any) => x != null) as number[];
const MIN_D = Math.min(...deltaVals);
const MAX_D = Math.max(...deltaVals);

// ─────────────────────────────────────────────────────────────
// Colour ramps.
// ─────────────────────────────────────────────────────────────

function rampColor(t: number, stops: [number, number[]][]): string {
  t = Math.max(0, Math.min(1, t));
  let a = stops[0], b = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (t >= stops[i][0] && t <= stops[i + 1][0]) { a = stops[i]; b = stops[i + 1]; break; }
  }
  const s = (t - a[0]) / (b[0] - a[0] || 1);
  const rgb = a[1].map((v0, i) => Math.round(v0 + (b[1][i] - v0) * s));
  return '#' + rgb.map(v => v.toString(16).padStart(2, '0')).join('');
}

// Cream → pale rust → deep rust → near-ink for turnout level.
const colorForVtr = (v: number) => rampColor(
  (v - MIN_V) / (MAX_V - MIN_V),
  [
    [0.00, [250, 244, 232]],
    [0.35, [232, 201, 176]],
    [0.70, [160, 64, 32]],
    [1.00, [58, 44, 34]],
  ]
);

// Pale ink → deep ink for change-since-2021 (all deltas positive).
const colorForDelta = (d: number) => rampColor(
  (d - MIN_D) / (MAX_D - MIN_D),
  [
    [0.00, [245, 235, 218]],
    [0.50, [200, 136, 106]],
    [1.00, [26, 20, 16]],
  ]
);

// ─────────────────────────────────────────────────────────────
// Map.
// ─────────────────────────────────────────────────────────────

const TurnoutMap = ({ mode, selected, onSelect, onHover, hovered }: any) => {
  const activeId = hovered || selected;
  const activeDistrict = districtsData.find(d => d.id === activeId);
  const activeCoords = activeId ? (MAP_COORDS as any)[activeId] : null;
  const activeVtr = activeId ? vtrByDistrictId[activeId] : null;
  const activeDelta = activeId ? deltaByDistrictId[activeId] : null;

  const fillFor = (d: { id: string }) => {
    if (mode === 'delta') {
      const dv = deltaByDistrictId[d.id];
      return dv != null ? colorForDelta(dv) : '#eee';
    }
    const v = vtrByDistrictId[d.id];
    return v != null ? colorForVtr(v) : '#eee';
  };

  return (
    <svg viewBox="0 0 1591 1975" style={{ width: '100%', height: 'auto', display: 'block' }} preserveAspectRatio="xMidYMid meet">
      <defs>
        <clipPath id="tn-land-vtr" dangerouslySetInnerHTML={{ __html: TN_CLIP_PATHS }} />
      </defs>

      <g clipPath="url(#tn-land-vtr)">
        {districtsData.map((d) => {
          const pts = (VORONOI_CELLS as any)[d.id];
          if (!pts) return null;
          return <polygon key={'heat-' + d.id} points={pts} fill={fillFor(d)} stroke="none" />;
        })}
      </g>

      <g className="tn-map" dangerouslySetInnerHTML={{ __html: mapSvgData.svg }} />

      {districtsData.map((d) => {
        const coords = (MAP_COORDS as any)[d.id];
        if (!coords) return null;
        const [cx, cy] = coords;
        const isSelected = selected === d.id;
        const isHovered = hovered === d.id;
        const isActive = isSelected || isHovered;
        const r = 7;
        return (
          <g key={'anchor-' + d.id} style={{ pointerEvents: 'none' }}>
            {isActive && (
              <circle cx={cx} cy={cy} r={r + 10} fill="none" stroke={COLORS.text} strokeWidth={isSelected ? 3 : 2} strokeOpacity={isSelected ? 1 : 0.7} />
            )}
            <circle cx={cx} cy={cy} r={r} fill={COLORS.background} stroke={COLORS.text} strokeWidth={2} />
            <circle cx={cx} cy={cy} r={3} fill={COLORS.text} />
          </g>
        );
      })}

      {districtsData.map((d) => {
        const pts = (VORONOI_CELLS as any)[d.id];
        if (!pts) return null;
        const v = vtrByDistrictId[d.id];
        const onActivate = () => onSelect(d.id === selected ? null : d.id);
        return (
          <polygon
            key={'cell-' + d.id}
            points={pts}
            fill="#000"
            fillOpacity={0}
            onClick={onActivate}
            onMouseEnter={() => onHover(d.id)}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover(d.id)}
            onBlur={() => onHover(null)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onActivate(); }
            }}
            tabIndex={0}
            role="button"
            aria-label={`${d.name} district — approximate turnout ${v != null ? v.toFixed(2) + '%' : 'no data'}`}
            style={{ cursor: 'pointer' }}
          />
        );
      })}

      {activeDistrict && activeCoords && (() => {
        const [cx, cy] = activeCoords;
        const labelAbove = cy > 200;
        const dy = labelAbove ? -54 : 54;
        const mainNum = mode === 'delta' && activeDelta != null ? `+${activeDelta.toFixed(2)} pp` : `${(activeVtr ?? 0).toFixed(2)}% VTR`;
        return (
          <g style={{ pointerEvents: 'none' }}>
            <line x1={cx} y1={cy} x2={cx} y2={cy + dy} stroke={COLORS.accent} strokeWidth="2" />
            <rect x={cx - 130} y={cy + dy - (labelAbove ? 52 : 0)} width="260" height="52" fill={COLORS.background} stroke={COLORS.text} strokeWidth="1.5" />
            <text x={cx} y={cy + dy - (labelAbove ? 26 : -22)} fontSize="28" fontFamily={SERIF} fontStyle="italic" fontWeight="800" textAnchor="middle" fill={COLORS.text}>{activeDistrict.name}</text>
            <text x={cx} y={cy + dy - (labelAbove ? 8 : -40)} fontSize="20" fontFamily={MONO} textAnchor="middle" fill={COLORS.accent} style={{ fontFeatureSettings: '"tnum" 1', fontWeight: 600 }}>{mainNum}</text>
          </g>
        );
      })()}

      <g transform="translate(1500, 100)" style={{ pointerEvents: 'none' }}>
        <text fontFamily={MONO} fontSize="32" textAnchor="middle" fill={COLORS.text} fontWeight="700">N</text>
        <line x1="0" y1="10" x2="0" y2="55" stroke={COLORS.text} strokeWidth="3" />
        <polygon points="0,55 -7,42 7,42" fill={COLORS.text} />
      </g>

      <g transform="translate(40, 1720)" style={{ pointerEvents: 'none' }}>
        <rect x="-10" y="-28" width="380" height="110" fill={COLORS.background} fillOpacity="0.9" stroke={COLORS.text} strokeWidth="1" />
        <text x="0" y="-10" fontFamily={MONO} fontSize="16" letterSpacing="2" fill={COLORS.muted} fontWeight="600">
          {mode === 'delta' ? 'TURNOUT CHANGE 2021 → 2026 (PP)' : 'APPROXIMATE TURNOUT (VTR %)'}
        </text>
        {[...Array(11)].map((_, i) => {
          const t = i / 10;
          const fill = mode === 'delta'
            ? colorForDelta(MIN_D + (MAX_D - MIN_D) * t)
            : colorForVtr(MIN_V + (MAX_V - MIN_V) * t);
          return <rect key={i} x={i * 32} y={8} width="32" height="20" fill={fill} stroke={COLORS.text} strokeWidth="0.5" />;
        })}
        <text x="0" y="48" fontFamily={SERIF} fontSize="18" fontStyle="italic" fill="#3a302a">
          {mode === 'delta' ? `+${MIN_D.toFixed(1)}` : `${MIN_V.toFixed(1)}%`}
        </text>
        <text x="350" y="48" fontFamily={SERIF} fontSize="18" fontStyle="italic" textAnchor="end" fill="#3a302a">
          {mode === 'delta' ? `+${MAX_D.toFixed(1)}` : `${MAX_V.toFixed(1)}%`}
        </text>
        <text x="175" y="70" fontFamily={SERIF} fontSize="16" fontStyle="italic" textAnchor="middle" fill={COLORS.muted}>
          {mode === 'delta' ? 'Ariyalur (least changed) → Chennai (most changed)' : 'Kanniyakumari (lowest) → Karur (highest)'}
        </text>
      </g>

      <text x="40" y="1955" fontFamily={MONO} fontSize="16" fill={COLORS.muted} letterSpacing="1.5" style={{ pointerEvents: 'none' }}>
        POLL DATE · 23 APR 2026 · ECINET PROVISIONAL · 2021 BASELINE FROM TCPD / ECI
      </text>
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────
// Side panel.
// ─────────────────────────────────────────────────────────────

const DistrictVtrPanel = ({ district, mode }: any) => {
  if (!district) {
    const top = [...turnoutData.districts].sort((a, b) => b.vtr - a.vtr).slice(0, 3);
    const bot = [...turnoutData.districts].sort((a, b) => a.vtr - b.vtr).slice(0, 3);
    return (
      <div style={{ fontFamily: SERIF, color: '#3a302a', fontSize: '14px', lineHeight: 1.6 }}>
        <SmallCaps style={{ color: COLORS.accent }}>District Atlas</SmallCaps>
        <p style={{ margin: '10px 0 0', fontStyle: 'italic' }}>
          The state averaged <strong style={{ color: COLORS.text, fontStyle: 'normal' }}>{turnoutData.state.vtr2026}%</strong>, a <strong style={{ color: COLORS.accent, fontStyle: 'normal' }}>+{(turnoutData.state.vtr2026 - turnoutData.state.vtr2021).toFixed(2)} pp</strong> jump over 2021. Toggle the map to see which districts moved, and by how much. Hover or click a polygon to pin its detail here.
        </p>
        <div style={{ marginTop: '22px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <SmallCaps style={{ color: COLORS.muted, marginBottom: '6px' }}>Top 3</SmallCaps>
            {top.map(d => (
              <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: '12px', padding: '4px 0', borderBottom: '1px dotted #d4c9bc' }}>
                <span style={{ color: COLORS.text }}>{d.name}</span>
                <span style={{ color: COLORS.accent, fontWeight: 600, fontFeatureSettings: '"tnum" 1' }}>{d.vtr.toFixed(2)}%</span>
              </div>
            ))}
          </div>
          <div>
            <SmallCaps style={{ color: COLORS.muted, marginBottom: '6px' }}>Bottom 3</SmallCaps>
            {bot.map(d => (
              <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: '12px', padding: '4px 0', borderBottom: '1px dotted #d4c9bc' }}>
                <span style={{ color: COLORS.text }}>{d.name}</span>
                <span style={{ color: COLORS.muted, fontWeight: 600, fontFeatureSettings: '"tnum" 1' }}>{d.vtr.toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  const v = vtrByDistrictId[district.id];
  const v21 = vtr2021ByDistrictId[district.id];
  const delta = deltaByDistrictId[district.id];
  const rank = [...turnoutData.districts].sort((a, b) => b.vtr - a.vtr).findIndex(x => x.id === district.id) + 1;
  const gapVsState = v - turnoutData.state.vtr2026;

  const isDelta = mode === 'delta';
  const mainDisplay = isDelta && delta != null ? `+${delta.toFixed(2)} pp` : `${v.toFixed(2)}%`;
  const mainLabel = isDelta ? 'CHANGE 2021 → 2026' : `APPROXIMATE TURNOUT · ${gapVsState >= 0 ? '+' : ''}${gapVsState.toFixed(2)} PP VS STATE`;

  return (
    <div>
      <SmallCaps style={{ color: COLORS.accent }}>Rank {rank} of {turnoutData.districts.length}</SmallCaps>
      <h3 style={{
        fontFamily: SERIF,
        fontSize: 'clamp(32px, 4.5vw, 46px)',
        fontWeight: 900,
        margin: '4px 0 2px',
        letterSpacing: '-0.02em',
        color: COLORS.text,
        lineHeight: 0.95,
      }}>{district.name}</h3>
      <p style={{ fontFamily: SERIF, fontStyle: 'italic', color: COLORS.muted, fontSize: '14px', margin: '0 0 14px' }}>
        {district.tag} · {district.acs} {district.acs === 1 ? 'constituency' : 'constituencies'}
      </p>

      <div style={{
        fontFamily: SERIF,
        fontSize: 'clamp(56px, 8vw, 86px)',
        fontWeight: 800,
        lineHeight: 1,
        color: COLORS.text,
        fontFeatureSettings: '"tnum" 1, "lnum" 1',
        letterSpacing: '-0.03em'
      }}>
        {mainDisplay}
      </div>
      <div style={{ fontFamily: MONO, fontSize: '10px', letterSpacing: '0.15em', color: COLORS.muted, marginTop: '4px' }}>
        {mainLabel}
      </div>

      {v21 != null && (
        <div style={{ marginTop: '18px', padding: '14px 0', borderTop: '1px solid #d4c9bc', borderBottom: '1px solid #d4c9bc', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div>
            <SmallCaps style={{ color: COLORS.muted }}>2021</SmallCaps>
            <div style={{ fontFamily: SERIF, fontSize: '22px', fontWeight: 700, color: COLORS.text, fontFeatureSettings: '"tnum" 1' }}>{v21.toFixed(2)}%</div>
          </div>
          <div>
            <SmallCaps style={{ color: COLORS.muted }}>2026</SmallCaps>
            <div style={{ fontFamily: SERIF, fontSize: '22px', fontWeight: 700, color: COLORS.text, fontFeatureSettings: '"tnum" 1' }}>{v.toFixed(2)}%</div>
          </div>
          <div>
            <SmallCaps style={{ color: COLORS.muted }}>Δ</SmallCaps>
            <div style={{ fontFamily: SERIF, fontSize: '22px', fontWeight: 700, color: COLORS.accent, fontFeatureSettings: '"tnum" 1' }}>
              +{(delta ?? 0).toFixed(2)}
            </div>
          </div>
        </div>
      )}

      <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '14px', color: '#3a302a', margin: '14px 0 0', lineHeight: 1.55 }}>
        {delta != null && delta >= 18 ? (
          <>An extraordinary revival. {district.name} voted far more than it did in 2021.</>
        ) : delta != null && delta >= 12 ? (
          <>A strong surge — above the state's own +12 pp jump.</>
        ) : delta != null && delta >= 7 ? (
          <>Moved with the state, not ahead of it.</>
        ) : delta != null ? (
          <>Barely budged. One of the state's smallest jumps.</>
        ) : (
          <>District boundaries changed after 2021; direct comparison unavailable.</>
        )}
      </p>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Historical strip.
// ─────────────────────────────────────────────────────────────

const HistoricalStrip = () => {
  const s = turnoutData.state;
  const rows: Array<[string, number]> = [
    ['2011', s.vtr2011],
    ['2016', s.vtr2016],
    ['2021', s.vtr2021],
    ['2026', s.vtr2026],
  ];
  const min = 60; const max = 95;
  return (
    <div style={{ border: `1.5px solid ${COLORS.text}`, background: '#fff9ef', padding: '28px', boxShadow: '6px 6px 0 rgba(26,20,16,0.05)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'center' }}>
        <div>
          <SmallCaps style={{ color: COLORS.accent }}>Tamil Nadu · Approximate VTR</SmallCaps>
          <div style={{
            fontFamily: SERIF,
            fontSize: 'clamp(80px, 11vw, 140px)',
            fontWeight: 900,
            lineHeight: 0.9,
            color: COLORS.text,
            fontFeatureSettings: '"tnum" 1, "lnum" 1',
            letterSpacing: '-0.04em',
            margin: '8px 0 0'
          }}>
            {s.vtr2026}%
          </div>
          <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '16px', color: COLORS.muted, marginTop: '8px', lineHeight: 1.5 }}>
            up <span style={{ color: COLORS.accent, fontWeight: 700, fontStyle: 'normal' }}>+{(s.vtr2026 - s.vtr2021).toFixed(2)} pp</span> from 2021 — the biggest single-cycle jump in modern Tamil Nadu assembly memory.
          </div>
        </div>

        <div>
          <SmallCaps style={{ color: COLORS.muted, marginBottom: '14px' }}>Four Assembly Elections</SmallCaps>
          {rows.map(([year, v]) => {
            const isNow = year === '2026';
            const pct = Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100));
            return (
              <div key={year} style={{ display: 'grid', gridTemplateColumns: '56px 1fr 72px', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <div style={{ fontFamily: MONO, fontSize: '13px', color: isNow ? COLORS.accent : COLORS.muted, fontWeight: 700, letterSpacing: '0.08em' }}>
                  {year}
                </div>
                <div style={{ position: 'relative', height: '18px', background: '#f3e9d6', border: `1px solid ${COLORS.text}` }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`, background: isNow ? COLORS.text : '#c8886a' }} />
                </div>
                <div style={{ fontFamily: MONO, fontSize: '14px', color: COLORS.text, fontWeight: 700, textAlign: 'right', fontFeatureSettings: '"tnum" 1' }}>
                  {v.toFixed(2)}%
                </div>
              </div>
            );
          })}
          <div style={{ fontFamily: MONO, fontSize: '10px', color: COLORS.muted, letterSpacing: '0.08em', marginTop: '4px', textAlign: 'right' }}>
            SCALE: 60% — 95%
          </div>
        </div>
      </div>

      <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '13px', color: COLORS.muted, margin: '24px 0 0', borderTop: `1px dotted ${COLORS.muted}`, paddingTop: '14px', lineHeight: 1.6 }}>
        Provisional figures from ECINET at {turnoutData.snapshotTime} on {turnoutData.pollDate}. Final ECI turnout typically revises <em>upward</em> by one to two points as postal ballots and late returns are folded in. 2011 / 2016 / 2021 numbers are ECI final.
      </p>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Dumbbell comparison chart — 2021 vs 2026 per district.
// ─────────────────────────────────────────────────────────────

const DumbbellChart = () => {
  const rows = useMemo(() => {
    const ds = turnoutData.districts
      .filter(d => (d as any).vtr2021 != null)
      .map(d => ({
        id: d.id,
        name: d.name,
        v21: (d as any).vtr2021 as number,
        v26: d.vtr,
        delta: (d as any).delta as number,
      }));
    return ds.sort((a, b) => b.delta - a.delta);
  }, []);

  // Scale: floor to 55%, ceiling to 95%
  const xMin = 55;
  const xMax = 95;
  const xAt = (v: number) => ((v - xMin) / (xMax - xMin)) * 100;

  return (
    <div style={{ border: `1.5px solid ${COLORS.text}`, background: '#fff9ef', padding: '28px', boxShadow: '6px 6px 0 rgba(26,20,16,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <SmallCaps style={{ color: COLORS.accent }}>2021 → 2026 · By District</SmallCaps>
          <h3 style={{ fontFamily: SERIF, fontSize: 'clamp(24px, 3.2vw, 32px)', fontWeight: 900, fontStyle: 'italic', margin: '6px 0 0', color: COLORS.text, letterSpacing: '-0.02em' }}>
            The shape of the surge.
          </h3>
        </div>
        <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '13px', color: COLORS.muted, maxWidth: '340px', textAlign: 'right' }}>
          Sorted by the size of the 2026 jump. Open circles are 2021; filled circles are 2026. The line is the distance travelled.
        </div>
      </div>

      {/* Axis ticks */}
      <div style={{ position: 'relative', height: '20px', marginLeft: '160px', marginRight: '80px', borderBottom: `1px solid ${COLORS.muted}` }}>
        {[60, 65, 70, 75, 80, 85, 90].map(t => (
          <div key={t} style={{
            position: 'absolute',
            left: `${xAt(t)}%`,
            bottom: 0,
            transform: 'translateX(-50%)',
            fontFamily: MONO,
            fontSize: '10px',
            color: COLORS.muted,
            letterSpacing: '0.08em',
            fontFeatureSettings: '"tnum" 1',
          }}>{t}%</div>
        ))}
      </div>

      <div>
        {rows.map((r, i) => {
          const x21 = xAt(r.v21);
          const x26 = xAt(r.v26);
          return (
            <div key={r.id} style={{
              display: 'grid',
              gridTemplateColumns: '160px 1fr 80px',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 0',
              borderBottom: i < rows.length - 1 ? '1px dotted #e3d8c5' : 'none',
            }}>
              <div style={{ fontFamily: SERIF, fontSize: '15px', fontWeight: 700, color: COLORS.text, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {r.name}
              </div>

              <div style={{ position: 'relative', height: '22px' }}>
                {/* Connecting line */}
                <div style={{
                  position: 'absolute',
                  left: `${x21}%`,
                  width: `${x26 - x21}%`,
                  top: '50%',
                  height: '2px',
                  background: '#c8886a',
                  transform: 'translateY(-50%)',
                }} />
                {/* 2021 dot (open) */}
                <div style={{
                  position: 'absolute',
                  left: `${x21}%`,
                  top: '50%',
                  width: '12px',
                  height: '12px',
                  transform: 'translate(-50%, -50%)',
                  border: `2px solid ${COLORS.text}`,
                  background: COLORS.background,
                  borderRadius: '50%',
                }} title={`2021: ${r.v21.toFixed(2)}%`} />
                {/* 2026 dot (filled) */}
                <div style={{
                  position: 'absolute',
                  left: `${x26}%`,
                  top: '50%',
                  width: '12px',
                  height: '12px',
                  transform: 'translate(-50%, -50%)',
                  border: `2px solid ${COLORS.text}`,
                  background: COLORS.text,
                  borderRadius: '50%',
                }} title={`2026: ${r.v26.toFixed(2)}%`} />
              </div>

              <div style={{
                fontFamily: MONO,
                fontSize: '14px',
                fontWeight: 700,
                color: COLORS.accent,
                textAlign: 'right',
                fontFeatureSettings: '"tnum" 1',
              }}>
                +{r.delta.toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '16px', display: 'flex', gap: '22px', fontFamily: MONO, fontSize: '11px', color: COLORS.muted, letterSpacing: '0.08em' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', border: `2px solid ${COLORS.text}`, background: COLORS.background }} /> 2021
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS.text }} /> 2026
        </span>
        <span style={{ marginLeft: 'auto' }}>
          DATA · ECINET 2026 · TCPD / ECI 2021
        </span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Top / Bottom AC split.
// ─────────────────────────────────────────────────────────────

const ACList = ({ title, rows, accent }: any) => (
  <div style={{ background: '#fff9ef', border: `1.5px solid ${COLORS.text}`, padding: '22px' }}>
    <SmallCaps style={{ color: accent ? COLORS.accent : COLORS.muted, marginBottom: '14px' }}>{title}</SmallCaps>
    <div>
      {rows.map((r: any, i: number) => (
        <div key={r.no} style={{
          display: 'grid',
          gridTemplateColumns: '28px 1fr 84px',
          alignItems: 'baseline',
          gap: '10px',
          padding: '10px 0',
          borderBottom: i < rows.length - 1 ? '1px dotted #d4c9bc' : 'none'
        }}>
          <div style={{ fontFamily: MONO, fontSize: '11px', color: COLORS.muted, fontWeight: 700 }}>
            {String(i + 1).padStart(2, '0')}
          </div>
          <div>
            <div style={{ fontFamily: SERIF, fontSize: '17px', fontWeight: 800, color: COLORS.text, letterSpacing: '-0.01em' }}>
              {r.name}
            </div>
            <div style={{ fontFamily: MONO, fontSize: '10px', color: COLORS.muted, letterSpacing: '0.08em', marginTop: '2px' }}>
              AC № {r.no}
            </div>
          </div>
          <div style={{ fontFamily: MONO, fontSize: '18px', fontWeight: 700, color: accent ? COLORS.accent : COLORS.text, textAlign: 'right', fontFeatureSettings: '"tnum" 1' }}>
            {r.vtr.toFixed(2)}%
          </div>
        </div>
      ))}
    </div>
  </div>
);

const TopBottomACs = () => {
  const sorted = [...turnoutData.acs].sort((a, b) => b.vtr - a.vtr);
  const top = sorted.slice(0, 5);
  const bot = sorted.slice(-5).reverse();
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '22px' }}>
      <ACList title="Who Showed Up · Top 5 by VTR" rows={top} accent />
      <ACList title="Who Didn't · Bottom 5 by VTR" rows={bot} />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Apathy margin — a compact version of the /analysis page
// finding. 2021 baseline: in a lot of Tamil Nadu the people who
// DIDN'T vote mattered more than the contest itself.
// ─────────────────────────────────────────────────────────────

const ApathyInline = () => {
  const acs = analysisData.acs.filter((a) => a.apathyRatio != null);
  const ranked = [...acs].sort((a, b) => (b.apathyRatio! - a.apathyRatio!));
  const lede = ranked[0];
  const top5 = ranked.slice(0, 5);
  const apathy_exceeds_margin = acs.filter((a) => a.nonVoters2021 > a.margin2021).length;

  return (
    <div style={{ marginBottom: '40px' }}>
      <SmallCaps style={{ color: COLORS.accent, marginBottom: '14px' }}>
        Who Didn't · The Apathy Margin
      </SmallCaps>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '22px',
        alignItems: 'stretch',
      }}>
        {/* Pull-quote */}
        <div style={{
          background: COLORS.text,
          color: '#faf4e8',
          padding: '28px 26px',
          border: `1.5px solid ${COLORS.text}`,
          boxShadow: '6px 6px 0 rgba(26,20,16,0.08)',
        }}>
          <SmallCaps style={{ color: '#c8886a', marginBottom: '12px' }}>The vote that wasn't</SmallCaps>
          <blockquote style={{
            fontFamily: SERIF,
            fontSize: 'clamp(20px, 2.6vw, 28px)',
            fontWeight: 700,
            fontStyle: 'italic',
            lineHeight: 1.22,
            margin: 0,
            letterSpacing: '-0.015em',
            color: '#faf4e8',
          }}>
            In {lede.name}, {lede.nonVoters2021.toLocaleString('en-IN')} people stayed home in 2021.
            The winner came in by <span style={{ color: '#e8c9b0' }}>{lede.margin2021.toLocaleString('en-IN')} votes</span>.
          </blockquote>
          <div style={{ fontFamily: SERIF, fontSize: '13.5px', fontStyle: 'italic', color: '#d4c9bc', marginTop: '16px', lineHeight: 1.6 }}>
            That is a ratio of{' '}
            <strong style={{ color: '#e8c9b0', fontStyle: 'normal' }}>{lede.apathyRatio!.toFixed(0)}-to-one</strong>.
            Across Tamil Nadu in 2021, non-voters outnumbered the winner's margin in{' '}
            <strong style={{ color: '#e8c9b0', fontStyle: 'normal' }}>{apathy_exceeds_margin} of 234</strong> constituencies.
          </div>
        </div>

        {/* Compact top-5 list */}
        <div style={{ background: '#fff9ef', border: `1.5px solid ${COLORS.text}`, padding: '22px' }}>
          <SmallCaps style={{ color: COLORS.muted, marginBottom: '14px' }}>
            Widest Apathy Gaps · 2021 Baseline
          </SmallCaps>
          {top5.map((r, i) => (
            <div key={r.no} style={{
              display: 'grid',
              gridTemplateColumns: '28px 1fr auto 64px',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 0',
              borderBottom: i < top5.length - 1 ? '1px dotted #d4c9bc' : 'none',
            }}>
              <div style={{ fontFamily: MONO, fontSize: '11px', color: COLORS.muted, fontWeight: 700 }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div>
                <div style={{ fontFamily: SERIF, fontSize: '16px', fontWeight: 800, color: COLORS.text, letterSpacing: '-0.01em' }}>
                  {r.name}
                </div>
                <div style={{ fontFamily: MONO, fontSize: '10px', color: COLORS.muted, letterSpacing: '0.08em', marginTop: '2px' }}>
                  {r.nonVoters2021.toLocaleString('en-IN')} stayed home · margin {r.margin2021.toLocaleString('en-IN')}
                </div>
              </div>
              <PartyFlag party={r.winner2021.party} size={22} />
              <div style={{
                fontFamily: MONO,
                fontSize: '16px',
                fontWeight: 700,
                color: COLORS.accent,
                textAlign: 'right',
                fontFeatureSettings: '"tnum" 1',
              }}>
                {r.apathyRatio!.toFixed(1)}×
              </div>
            </div>
          ))}
          <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '12px', color: COLORS.muted, margin: '14px 0 0', lineHeight: 1.55 }}>
            Ratio = 2021 non-voters ÷ winner's margin. The 2026 counterpart populates on counting day.
          </p>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Deep-dive callout — sends readers to the full /analysis page.
// ─────────────────────────────────────────────────────────────

const DeepDiveLink = () => (
  <Link
    href="/analysis"
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '20px',
      padding: '26px 32px',
      marginTop: '40px',
      background: '#fff9ef',
      border: `2px solid ${COLORS.text}`,
      boxShadow: '6px 6px 0 rgba(26,20,16,0.06)',
      textDecoration: 'none',
      color: 'inherit',
    }}
  >
    <div style={{ maxWidth: '640px' }}>
      <SmallCaps style={{ color: COLORS.accent }}>Deep dive · Voting data analysis</SmallCaps>
      <div style={{
        fontFamily: SERIF,
        fontSize: 'clamp(22px, 2.6vw, 28px)',
        fontWeight: 800,
        fontStyle: 'italic',
        lineHeight: 1.2,
        margin: '8px 0 6px',
        letterSpacing: '-0.02em',
        color: COLORS.text,
      }}>
        The 234-dot hemicycle, every AC's apathy ratio, and the 2021 baseline.
      </div>
      <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '14px', lineHeight: 1.5, color: '#3a302a', margin: 0 }}>
        A dedicated page for the longer reading: the seat arc, side-by-side with the 2026 placeholder that fills in on counting day, and the full non-voter table for all 234 constituencies.
      </p>
    </div>
    <span style={{
      fontFamily: MONO,
      fontSize: '13px',
      fontWeight: 700,
      letterSpacing: '0.15em',
      textTransform: 'uppercase',
      padding: '14px 18px',
      border: `1.5px solid ${COLORS.text}`,
      color: COLORS.text,
      whiteSpace: 'nowrap',
    }}>
      Read the Analysis →
    </span>
  </Link>
);

// ─────────────────────────────────────────────────────────────
// Points to note.
// ─────────────────────────────────────────────────────────────

const NOTES: Array<{ kicker: string; title: string; body: React.ReactNode }> = [
  {
    kicker: 'The biggest mover',
    title: 'Chennai, the city that returned.',
    body: (
      <>
        Chennai district polled <strong>83.58%</strong> — a <strong>+24.29 pp</strong> leap from the <strong>59.29%</strong> it recorded in 2021. No district in Tamil Nadu moved more. The Nilgiris (+21.52), Kancheepuram (+18.00), and Coimbatore (+16.70) followed. The 2026 surge was carried, disproportionately, by the places that had been opting out for a decade.
      </>
    ),
  },
  {
    kicker: 'A null finding',
    title: 'The shadow of Karur.',
    body: (
      <>
        Karur AC polled the highest VTR in the state at <strong>93.39%</strong>. It also did so in 2021, at 83.57%. The district's gap above its Kongu-belt peers <em>narrowed</em> between cycles (+6.8 pp to +4.1 pp), not widened. The September 2025 stampede that killed forty-one — including ten children — at a TVK rally here does not surface in the turnout data. Whether it surfaces in TVK's vote-share is a question for 5 May.
      </>
    ),
  },
  {
    kicker: 'Regional gap',
    title: 'The Kongu-to-Cape canyon.',
    body: (
      <>
        Karur district led the state at <strong>92.65%</strong>. Kanniyakumari trailed every other district at <strong>75.60%</strong>. Seventeen points separate the most and least enthusiastic voters of Tamil Nadu — a regional chasm wider than the entire 2021-to-2026 jump.
      </>
    ),
  },
  {
    kicker: 'One true outlier',
    title: 'Palayamkottai, the 69-percent island.',
    body: (
      <>
        Only one constituency in the state fell below seventy percent: Palayamkottai (AC 226) at <strong>68.97%</strong>. Every other AC crossed the state's own 2021 average. One seat — one pocket of Tirunelveli — stood apart from the tide.
      </>
    ),
  },
  {
    kicker: 'Gender, almost unmoved',
    title: 'Women make up 51% of the roll. The turnout moved without them.',
    body: (
      <>
        Across 234 constituencies, the correlation between the female share of the electorate and turnout is <strong>r = −0.03</strong>. A statistical zero. Whatever lifted Tamil Nadu above 85% lifted men and women in equal measure — not a women-driven wave, not a men-driven wave, but a geographic one.
      </>
    ),
  },
];

const PointsToNote = () => (
  <div>
    <SmallCaps style={{ color: COLORS.accent, marginBottom: '14px' }}>Points to Note</SmallCaps>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
      {NOTES.map((n, i) => (
        <div key={i} style={{ background: '#fff9ef', border: `1.5px solid ${COLORS.text}`, padding: '22px' }}>
          <SmallCaps style={{ color: COLORS.muted, marginBottom: '8px' }}>{n.kicker}</SmallCaps>
          <h4 style={{
            fontFamily: SERIF,
            fontSize: '22px',
            fontWeight: 900,
            fontStyle: 'italic',
            margin: '0 0 10px',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            color: COLORS.text,
          }}>
            {n.title}
          </h4>
          <p style={{ fontFamily: SERIF, fontSize: '14.5px', lineHeight: 1.6, color: '#3a302a', margin: 0 }}>
            {n.body}
          </p>
        </div>
      ))}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Map mode toggle.
// ─────────────────────────────────────────────────────────────

const MapToggle = ({ mode, setMode }: { mode: MapMode, setMode: (m: MapMode) => void }) => {
  const btn = (m: MapMode, label: string) => (
    <button
      key={m}
      onClick={() => setMode(m)}
      style={{
        fontFamily: MONO,
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        padding: '10px 16px',
        border: `1.5px solid ${COLORS.text}`,
        background: mode === m ? COLORS.text : COLORS.background,
        color: mode === m ? COLORS.background : COLORS.text,
        cursor: 'pointer',
        transition: 'all 150ms ease',
      }}
    >
      {label}
    </button>
  );
  return (
    <div style={{ display: 'inline-flex', marginBottom: '14px', gap: '0', border: `1.5px solid ${COLORS.text}`, boxShadow: '3px 3px 0 rgba(26,20,16,0.05)' }}>
      {btn('2026', '2026 Turnout')}
      {btn('delta', 'Change Since 2021')}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Section.
// ─────────────────────────────────────────────────────────────

export const TurnoutSection = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [mode, setMode] = useState<MapMode>('2026');
  const isMobile = useIsMobile();

  const activeId = selected || hovered;
  const activeDistrict = districtsData.find(d => d.id === activeId);

  return (
    <section style={{ margin: '48px 0 60px' }}>
      <div style={{ borderTop: `2px solid ${COLORS.text}` }} />
      <SectionTitle kicker="Polling Day · 23 April 2026">Who Showed Up, Who Didn't.</SectionTitle>

      <div style={{ marginBottom: '40px' }}>
        <HistoricalStrip />
      </div>

      <MapToggle mode={mode} setMode={setMode} />

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.3fr) minmax(0, 1fr)',
        gap: isMobile ? '32px' : '40px',
        alignItems: 'start',
        marginBottom: '40px',
      }}>
        <div style={{ border: `1.5px solid ${COLORS.text}`, background: '#fff9ef', padding: '12px', boxShadow: '6px 6px 0 rgba(26,20,16,0.05)' }}>
          <TurnoutMap
            mode={mode}
            selected={selected}
            onSelect={setSelected}
            hovered={hovered}
            onHover={setHovered}
          />
        </div>
        <div style={{
          paddingTop: isMobile ? '0' : '10px',
          position: isMobile ? 'relative' : 'sticky',
          top: isMobile ? '0' : '20px',
        }}>
          <DistrictVtrPanel district={activeDistrict} mode={mode} />
        </div>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <DumbbellChart />
      </div>

      <div style={{ marginBottom: '40px' }}>
        <SmallCaps style={{ color: COLORS.accent, marginBottom: '14px' }}>Extremes of the Ballot</SmallCaps>
        <TopBottomACs />
      </div>

      <ApathyInline />

      <PointsToNote />

      <DeepDiveLink />
    </section>
  );
};
