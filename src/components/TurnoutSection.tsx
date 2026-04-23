"use client";

import React, { useState } from 'react';
import { SERIF, MONO, COLORS } from '@/styles/theme';
import { SmallCaps, SectionTitle } from './common';
import turnoutData from '@/data/turnout.json';
import districtsData from '@/data/districts.json';
import { MAP_COORDS, TN_CLIP_PATHS, VORONOI_CELLS } from '@/data/map-data';
import mapSvgData from '@/data/map-svg.json';
import { useIsMobile } from '@/hooks/useMediaQuery';

const vtrByDistrictId: Record<string, number> = Object.fromEntries(
  turnoutData.districts.map(d => [d.id, d.vtr])
);

// ─────────────────────────────────────────────────────────────
// Heat map — colours each district by VTR%.
// cream (low) → pale rust → deep rust → ink (high).
// ─────────────────────────────────────────────────────────────

const vtrVals = turnoutData.districts.map(d => d.vtr);
const MIN_V = Math.min(...vtrVals);
const MAX_V = Math.max(...vtrVals);

const colorForVtr = (v: number) => {
  const t = Math.max(0, Math.min(1, (v - MIN_V) / (MAX_V - MIN_V)));
  const stops: [number, number[]][] = [
    [0.00, [250, 244, 232]], // #faf4e8 cream
    [0.35, [232, 201, 176]], // #e8c9b0 pale rust
    [0.70, [160, 64, 32]],   // #a04020 deep rust (accent)
    [1.00, [58, 44, 34]],    // near-ink
  ];
  let a = stops[0], b = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (t >= stops[i][0] && t <= stops[i + 1][0]) { a = stops[i]; b = stops[i + 1]; break; }
  }
  const s = (t - a[0]) / (b[0] - a[0] || 1);
  const rgb = a[1].map((v0, i) => Math.round(v0 + (b[1][i] - v0) * s));
  return '#' + rgb.map(v => v.toString(16).padStart(2, '0')).join('');
};

const TurnoutMap = ({ selected, onSelect, onHover, hovered }: any) => {
  const activeId = hovered || selected;
  const activeDistrict = districtsData.find(d => d.id === activeId);
  const activeCoords = activeId ? (MAP_COORDS as any)[activeId] : null;
  const activeVtr = activeId ? vtrByDistrictId[activeId] : null;

  return (
    <svg viewBox="0 0 1591 1975" style={{ width: '100%', height: 'auto', display: 'block' }} preserveAspectRatio="xMidYMid meet">
      <defs>
        <clipPath id="tn-land-vtr" dangerouslySetInnerHTML={{ __html: TN_CLIP_PATHS }} />
      </defs>

      <g clipPath="url(#tn-land-vtr)">
        {districtsData.map((d) => {
          const pts = (VORONOI_CELLS as any)[d.id];
          if (!pts) return null;
          const v = vtrByDistrictId[d.id];
          return (
            <polygon
              key={'heat-' + d.id}
              points={pts}
              fill={v !== undefined ? colorForVtr(v) : '#faf4e8'}
              stroke="none"
            />
          );
        })}
      </g>

      <g dangerouslySetInnerHTML={{ __html: mapSvgData.svg }} />

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
        return (
          <polygon
            key={'cell-' + d.id}
            points={pts}
            fill="#000"
            fillOpacity={0}
            onClick={() => onSelect(d.id === selected ? null : d.id)}
            onMouseEnter={() => onHover(d.id)}
            onMouseLeave={() => onHover(null)}
            style={{ cursor: 'pointer' }}
          />
        );
      })}

      {activeDistrict && activeCoords && activeVtr !== null && (() => {
        const [cx, cy] = activeCoords;
        const labelAbove = cy > 200;
        const dy = labelAbove ? -54 : 54;
        return (
          <g style={{ pointerEvents: 'none' }}>
            <line x1={cx} y1={cy} x2={cx} y2={cy + dy} stroke={COLORS.accent} strokeWidth="2" />
            <rect x={cx - 130} y={cy + dy - (labelAbove ? 52 : 0)} width="260" height="52" fill={COLORS.background} stroke={COLORS.text} strokeWidth="1.5" />
            <text x={cx} y={cy + dy - (labelAbove ? 26 : -22)} fontSize="28" fontFamily={SERIF} fontStyle="italic" fontWeight="800" textAnchor="middle" fill={COLORS.text}>{activeDistrict.name}</text>
            <text x={cx} y={cy + dy - (labelAbove ? 8 : -40)} fontSize="20" fontFamily={MONO} textAnchor="middle" fill={COLORS.accent} style={{ fontFeatureSettings: '"tnum" 1', fontWeight: 600 }}>{activeVtr.toFixed(2)}% VTR</text>
          </g>
        );
      })()}

      {/* North arrow */}
      <g transform="translate(1500, 100)" style={{ pointerEvents: 'none' }}>
        <text fontFamily={MONO} fontSize="32" textAnchor="middle" fill={COLORS.text} fontWeight="700">N</text>
        <line x1="0" y1="10" x2="0" y2="55" stroke={COLORS.text} strokeWidth="3" />
        <polygon points="0,55 -7,42 7,42" fill={COLORS.text} />
      </g>

      {/* Legend */}
      <g transform="translate(40, 1720)" style={{ pointerEvents: 'none' }}>
        <rect x="-10" y="-28" width="360" height="110" fill={COLORS.background} fillOpacity="0.9" stroke={COLORS.text} strokeWidth="1" />
        <text x="0" y="-10" fontFamily={MONO} fontSize="16" letterSpacing="2" fill={COLORS.muted} fontWeight="600">
          APPROXIMATE TURNOUT (VTR %)
        </text>
        {[...Array(11)].map((_, i) => {
          const t = i / 10;
          const v = MIN_V + (MAX_V - MIN_V) * t;
          return (
            <rect key={i} x={i * 30} y={8} width="30" height="20" fill={colorForVtr(v)} stroke={COLORS.text} strokeWidth="0.5" />
          );
        })}
        <text x="0" y="48" fontFamily={SERIF} fontSize="18" fontStyle="italic" fill="#3a302a">
          {MIN_V.toFixed(1)}%
        </text>
        <text x="330" y="48" fontFamily={SERIF} fontSize="18" fontStyle="italic" textAnchor="end" fill="#3a302a">
          {MAX_V.toFixed(1)}%
        </text>
        <text x="165" y="70" fontFamily={SERIF} fontSize="16" fontStyle="italic" textAnchor="middle" fill={COLORS.muted}>
          Kanniyakumari (lowest) → Karur (highest)
        </text>
      </g>

      <text x="40" y="1955" fontFamily={MONO} fontSize="16" fill={COLORS.muted} letterSpacing="1.5" style={{ pointerEvents: 'none' }}>
        POLL DATE · 23 APR 2026 · ECINET PROVISIONAL
      </text>
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────
// Side panel that responds to map hover/click.
// ─────────────────────────────────────────────────────────────

const DistrictVtrPanel = ({ district }: any) => {
  if (!district) {
    const top = [...turnoutData.districts].sort((a, b) => b.vtr - a.vtr).slice(0, 3);
    const bot = [...turnoutData.districts].sort((a, b) => a.vtr - b.vtr).slice(0, 3);
    return (
      <div style={{ fontFamily: SERIF, color: '#3a302a', fontSize: '14px', lineHeight: 1.6 }}>
        <SmallCaps style={{ color: COLORS.accent }}>District Atlas</SmallCaps>
        <p style={{ margin: '10px 0 0', fontStyle: 'italic' }}>
          The state averaged <strong style={{ color: COLORS.text, fontStyle: 'normal' }}>{turnoutData.state.vtr2026}%</strong>, but the variance between districts is a 17-point canyon. Hover any polygon for its number. Click to pin it.
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
  const rank = [...turnoutData.districts].sort((a, b) => b.vtr - a.vtr).findIndex(x => x.id === district.id) + 1;
  const gapVsState = v - turnoutData.state.vtr2026;

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
        {v.toFixed(2)}%
      </div>
      <div style={{ fontFamily: MONO, fontSize: '10px', letterSpacing: '0.15em', color: COLORS.muted, marginTop: '4px' }}>
        APPROXIMATE TURNOUT · {gapVsState >= 0 ? '+' : ''}{gapVsState.toFixed(2)} PP VS STATE
      </div>

      <div style={{ marginTop: '22px', padding: '14px 0', borderTop: '1px solid #d4c9bc', borderBottom: '1px solid #d4c9bc' }}>
        <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '14px', color: '#3a302a', margin: 0, lineHeight: 1.55 }}>
          {gapVsState >= 5 ? (
            <>Well above the state line. {district.name} is inside the top tier of the turnout atlas.</>
          ) : gapVsState >= 0 ? (
            <>Just above the state line — an ordinary showing in an extraordinary election.</>
          ) : gapVsState >= -5 ? (
            <>A hair below the state line — typical underperformance for {district.tag.toLowerCase()} territory.</>
          ) : (
            <>Meaningfully below the state line. Whatever lifted the rest of Tamil Nadu did not reach here.</>
          )}
        </p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Historical comparison strip.
// ─────────────────────────────────────────────────────────────

const HistoricalStrip = () => {
  const s = turnoutData.state;
  const rows: Array<[string, number]> = [
    ['2011', s.vtr2011],
    ['2016', s.vtr2016],
    ['2021', s.vtr2021],
    ['2026', s.vtr2026],
  ];
  const max = 100;
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
            return (
              <div key={year} style={{ display: 'grid', gridTemplateColumns: '56px 1fr 72px', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <div style={{ fontFamily: MONO, fontSize: '13px', color: isNow ? COLORS.accent : COLORS.muted, fontWeight: 700, letterSpacing: '0.08em' }}>
                  {year}
                </div>
                <div style={{ position: 'relative', height: '18px', background: '#f3e9d6', border: `1px solid ${COLORS.text}` }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${(v / max) * 100}%`, background: isNow ? COLORS.text : '#c8886a' }} />
                </div>
                <div style={{ fontFamily: MONO, fontSize: '14px', color: COLORS.text, fontWeight: 700, textAlign: 'right', fontFeatureSettings: '"tnum" 1' }}>
                  {v.toFixed(2)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '13px', color: COLORS.muted, margin: '24px 0 0', borderTop: `1px dotted ${COLORS.muted}`, paddingTop: '14px', lineHeight: 1.6 }}>
        Provisional figures from ECINET at {turnoutData.snapshotTime} on {turnoutData.pollDate}. Final ECI turnout typically revises <em>upward</em> by one to two points as postal ballots and late returns are folded in. Earlier 2021/2016/2011 numbers are ECI final.
      </p>
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
      <ACList title="Top Five Constituencies" rows={top} accent />
      <ACList title="Bottom Five Constituencies" rows={bot} />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Points to note — editorial insight cards.
// ─────────────────────────────────────────────────────────────

const NOTES: Array<{ kicker: string; title: string; body: React.ReactNode }> = [
  {
    kicker: 'Regional gap',
    title: 'The Kongu-to-Cape canyon.',
    body: (
      <>
        Karur district led the state at <strong>92.65%</strong>. Kanniyakumari trailed every other district at <strong>75.60%</strong>. Seventeen points separate the most and least enthusiastic voters of Tamil Nadu — a regional chasm bigger than the entire 2021-to-2026 jump.
      </>
    ),
  },
  {
    kicker: 'Urban holdouts',
    title: "Madurai's quiet city centre.",
    body: (
      <>
        Madurai North (<strong>72.63%</strong>) and Madurai Central (<strong>73.86%</strong>) voted like it was still 2009. In an election where the state as a whole surged, the densest cores of Tamil Nadu's second city declined the invitation.
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
// Section.
// ─────────────────────────────────────────────────────────────

export const TurnoutSection = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const activeId = selected || hovered;
  const activeDistrict = districtsData.find(d => d.id === activeId);

  return (
    <section style={{ margin: '48px 0 60px' }}>
      <div style={{ borderTop: `2px solid ${COLORS.text}` }} />
      <SectionTitle kicker="Polling Day · 23 April 2026">Who Showed Up.</SectionTitle>

      <div style={{ marginBottom: '40px' }}>
        <HistoricalStrip />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.3fr) minmax(0, 1fr)',
        gap: isMobile ? '32px' : '40px',
        alignItems: 'start',
        marginBottom: '40px',
      }}>
        <div style={{ border: `1.5px solid ${COLORS.text}`, background: '#fff9ef', padding: '12px', boxShadow: '6px 6px 0 rgba(26,20,16,0.05)' }}>
          <TurnoutMap
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
          <DistrictVtrPanel district={activeDistrict} />
        </div>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <SmallCaps style={{ color: COLORS.accent, marginBottom: '14px' }}>Extremes of the Ballot</SmallCaps>
        <TopBottomACs />
      </div>

      <PointsToNote />
    </section>
  );
};
