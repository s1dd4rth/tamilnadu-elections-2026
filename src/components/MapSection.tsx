"use client";

import React, { useState } from 'react';
import { SERIF, MONO, COLORS } from '@/styles/theme';
import { SmallCaps, SectionTitle } from './common';
import { fmtIndian, fmtLakh, pct } from '@/utils/format';
import districtsData from '@/data/districts.json';
import stateData from '@/data/state.json';
import { MAP_COORDS, TN_CLIP_PATHS, VORONOI_CELLS } from '@/data/map-data';
import mapSvgData from '@/data/map-svg.json';

const TNMap = ({ selected, onSelect, onHover, hovered }: any) => {
  const maxTotal = Math.max(...districtsData.map(d => d.total));
  const minTotal = Math.min(...districtsData.map(d => d.total));
  
  const radiusFor = (t: number) => {
    const norm = (Math.log(t) - Math.log(minTotal)) / (Math.log(maxTotal) - Math.log(minTotal));
    return 6 + norm * 14;
  };

  const logMin = Math.log(minTotal);
  const logMax = Math.log(maxTotal);
  
  const colorFor = (total: number) => {
    const t = (Math.log(total) - logMin) / (logMax - logMin);
    const c0 = [250, 244, 232]; // #faf4e8 cream
    const c1 = [232, 201, 176]; // #e8c9b0 pale rust
    const c2 = [200, 136, 106]; // #c8886a mid rust
    const c3 = [160, 64, 32];   // #a04020 deep rust
    let rgb;
    if (t < 0.33) {
      const s = t / 0.33;
      rgb = c0.map((v, i) => Math.round(v + (c1[i] - v) * s));
    } else if (t < 0.67) {
      const s = (t - 0.33) / 0.34;
      rgb = c1.map((v, i) => Math.round(v + (c2[i] - v) * s));
    } else {
      const s = (t - 0.67) / 0.33;
      rgb = c2.map((v, i) => Math.round(v + (c3[i] - v) * s));
    }
    return '#' + rgb.map(v => v.toString(16).padStart(2, '0')).join('');
  };

  const activeId = hovered || selected;
  const activeDistrict = districtsData.find(d => d.id === activeId);
  const activeCoords = activeId ? MAP_COORDS[activeId] : null;

  return (
    <svg viewBox="0 0 1591 1975" style={{ width: '100%', height: 'auto', display: 'block' }} preserveAspectRatio="xMidYMid meet">
      <defs>
        <clipPath id="tn-land" dangerouslySetInnerHTML={{ __html: TN_CLIP_PATHS }} />
      </defs>

      <g clipPath="url(#tn-land)">
        {districtsData.map((d) => {
          const pts = VORONOI_CELLS[d.id];
          if (!pts) return null;
          return (
            <polygon
              key={'heat-' + d.id}
              points={pts}
              fill={colorFor(d.total)}
              stroke="none"
            />
          );
        })}
      </g>

      <g dangerouslySetInnerHTML={{ __html: mapSvgData.svg }} />

      {districtsData.map((d) => {
        const coords = MAP_COORDS[d.id];
        if (!coords) return null;
        const [cx, cy] = coords;
        const isSelected = selected === d.id;
        const isHovered = hovered === d.id;
        const isActive = isSelected || isHovered;
        const r = radiusFor(d.total);
        return (
          <g key={'anchor-' + d.id} style={{ pointerEvents: 'none' }}>
            {isActive && (
              <circle
                cx={cx} cy={cy}
                r={r + 10}
                fill="none"
                stroke={COLORS.text}
                strokeWidth={isSelected ? 3 : 2}
                strokeOpacity={isSelected ? 1 : 0.7}
              />
            )}
            <circle
              cx={cx} cy={cy}
              r={r}
              fill={isActive ? COLORS.text : COLORS.background}
              stroke={COLORS.text}
              strokeWidth={isActive ? 2.5 : 2}
              style={{ transition: 'all 150ms ease' }}
            />
            <circle
              cx={cx} cy={cy}
              r={Math.max(2, r * 0.35)}
              fill={isActive ? COLORS.accent : COLORS.text}
              style={{ transition: 'all 150ms ease' }}
            />
          </g>
        );
      })}

      {districtsData.map((d) => {
        const pts = VORONOI_CELLS[d.id];
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

      {activeDistrict && activeCoords && (() => {
        const [cx, cy] = activeCoords;
        const labelAbove = cy > 200;
        const dy = labelAbove ? -54 : 54;
        return (
          <g style={{ pointerEvents: 'none' }}>
            <line x1={cx} y1={cy} x2={cx} y2={cy + dy} stroke={COLORS.accent} strokeWidth="2" />
            <rect
              x={cx - 130} y={cy + dy - (labelAbove ? 52 : 0)}
              width="260" height="52"
              fill={COLORS.background}
              stroke={COLORS.text}
              strokeWidth="1.5"
            />
            <text
              x={cx} y={cy + dy - (labelAbove ? 26 : -22)}
              fontSize="28" fontFamily={SERIF} fontStyle="italic" fontWeight="800"
              textAnchor="middle" fill={COLORS.text}
            >{activeDistrict.name}</text>
            <text
              x={cx} y={cy + dy - (labelAbove ? 8 : -40)}
              fontSize="20" fontFamily={MONO} textAnchor="middle" fill={COLORS.accent}
              style={{ fontFeatureSettings: '"tnum" 1', fontWeight: '600' }}
            >{fmtLakh(activeDistrict.total)} · {activeDistrict.acs} ACs</text>
          </g>
        );
      })()}

      <g transform="translate(1500, 100)" style={{ pointerEvents: 'none' }}>
        <text fontFamily={MONO} fontSize="32" textAnchor="middle" fill={COLORS.text} fontWeight="700">N</text>
        <line x1="0" y1="10" x2="0" y2="55" stroke={COLORS.text} strokeWidth="3" />
        <polygon points="0,55 -7,42 7,42" fill={COLORS.text} />
      </g>

      <g transform="translate(40, 1720)" style={{ pointerEvents: 'none' }}>
        <rect x="-10" y="-28" width="360" height="110" fill={COLORS.background} fillOpacity="0.9" stroke={COLORS.text} strokeWidth="1" />
        <text x="0" y="-10" fontFamily={MONO} fontSize="16" letterSpacing="2" fill={COLORS.muted} fontWeight="600">
          SHARE OF STATE ELECTORATE
        </text>
        {[...Array(11)].map((_, i) => {
          const t = i / 10;
          const v = minTotal * Math.exp((logMax - logMin) * t);
          return (
            <rect
              key={i}
              x={i * 30} y={8}
              width="30" height="20"
              fill={colorFor(v)}
              stroke={COLORS.text}
              strokeWidth="0.5"
            />
          );
        })}
        <text x="0" y="48" fontFamily={SERIF} fontSize="18" fontStyle="italic" fill="#3a302a">
          0.92%
        </text>
        <text x="330" y="48" fontFamily={SERIF} fontSize="18" fontStyle="italic" textAnchor="end" fill="#3a302a">
          5.57%
        </text>
        <text x="165" y="70" fontFamily={SERIF} fontSize="16" fontStyle="italic" textAnchor="middle" fill={COLORS.muted}>
          Ariyalur (smallest) → Thiruvallur (largest)
        </text>
      </g>

      <text x="40" y="1955" fontFamily={MONO} fontSize="16" fill={COLORS.muted} letterSpacing="1.5" style={{ pointerEvents: 'none' }}>
        MAP BASED ON WIKIMEDIA COMMONS · CC-BY-SA 3.0 · PLANEMAD / NICHALP
      </text>
    </svg>
  );
};

const DistrictPanel = ({ district }: any) => {
  if (!district) {
    return (
      <div style={{ fontFamily: SERIF, color: '#3a302a', fontSize: '14px', lineHeight: 1.6 }}>
        <SmallCaps style={{ color: COLORS.accent }}>Navigation</SmallCaps>
        <p style={{ margin: '10px 0 0', fontStyle: 'italic' }}>
          Hover any district-dot on the map for a glance. Click to fix its detail here — the demographic portrait, gender split, and constituency count.
        </p>
        <p style={{ margin: '10px 0 0', fontStyle: 'italic' }}>
          The largest circle — <strong style={{ color: COLORS.text, fontStyle: 'normal' }}>Thiruvallur</strong> — holds 31.57 lakh electors across eight constituencies. The smallest, <strong style={{ color: COLORS.text, fontStyle: 'normal' }}>Ariyalur</strong>, holds 5.23 lakh across two.
        </p>
      </div>
    );
  }
  const d = district;
  const fPct = (d.f / d.total) * 100;
  const mPct = (d.m / d.total) * 100;
  const stateRank = [...districtsData].sort((a, b) => b.total - a.total).findIndex(x => x.id === d.id) + 1;

  return (
    <div>
      <SmallCaps style={{ color: COLORS.accent }}>District Portrait · Rank {stateRank} of 38</SmallCaps>
      <h3 style={{
        fontFamily: SERIF,
        fontSize: 'clamp(32px, 4.5vw, 46px)',
        fontWeight: 900,
        margin: '4px 0 2px',
        letterSpacing: '-0.02em',
        color: COLORS.text,
        lineHeight: 0.95,
      }}>{d.name}</h3>
      <p style={{ fontFamily: SERIF, fontStyle: 'italic', color: COLORS.muted, fontSize: '14px', margin: '0 0 14px' }}>
        {d.tag} · {d.acs} {d.acs === 1 ? 'constituency' : 'constituencies'}
      </p>

      <div style={{
        fontFamily: SERIF,
        fontSize: 'clamp(38px, 5.5vw, 54px)',
        fontWeight: 800,
        lineHeight: 1,
        color: COLORS.text,
        fontFeatureSettings: '"tnum" 1, "lnum" 1',
        letterSpacing: '-0.03em'
      }}>
        {fmtIndian(d.total)}
      </div>
      <div style={{ fontFamily: MONO, fontSize: '10px', letterSpacing: '0.15em', color: COLORS.muted, marginTop: '2px' }}>
        ELECTORS · {pct(d.total, stateData.total)}% OF STATE
      </div>

      <div style={{ marginTop: '22px' }}>
        <div style={{ display: 'flex', height: '30px', border: `1px solid ${COLORS.text}` }}>
          <div style={{ width: `${fPct}%`, background: COLORS.text, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', paddingLeft: '8px' }}>
            <span style={{ fontFamily: MONO, fontSize: '10px', color: COLORS.background, letterSpacing: '0.1em', fontWeight: 600 }}>
              F {fPct.toFixed(1)}%
            </span>
          </div>
          <div style={{ width: `${mPct}%`, background: COLORS.background, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '8px' }}>
            <span style={{ fontFamily: MONO, fontSize: '10px', color: COLORS.text, letterSpacing: '0.1em', fontWeight: 600 }}>
              {mPct.toFixed(1)}% M
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: SERIF, fontSize: '13px', fontStyle: 'italic', color: '#3a302a', marginTop: '8px' }}>
          <span>Women {fmtIndian(d.f)}</span>
          <span>Men {fmtIndian(d.m)}</span>
        </div>
      </div>

      <div style={{ marginTop: '18px', padding: '12px 0', borderTop: '1px solid #d4c9bc' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <SmallCaps style={{ color: COLORS.muted }}>Third Gender</SmallCaps>
            <div style={{ fontFamily: SERIF, fontSize: '18px', fontWeight: 700, color: COLORS.text }}>
              {fmtIndian(d.tg)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MapSection = () => {
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);

  const activeId = selected || hovered;
  const activeDistrict = districtsData.find(d => d.id === activeId);

  return (
    <section style={{ margin: '0 0 60px' }}>
      <SectionTitle kicker="Geographic Spread">The Canvas of Contests.</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)', gap: '40px', alignItems: 'start' }}>
        <div style={{ border: `1.5px solid ${COLORS.text}`, background: '#fff9ef', padding: '12px', boxShadow: '6px 6px 0 rgba(26,20,16,0.05)' }}>
          <TNMap
            selected={selected}
            onSelect={setSelected}
            hovered={hovered}
            onHover={setHovered}
          />
        </div>
        <div style={{ paddingTop: '10px', position: 'sticky', top: '20px' }}>
          <DistrictPanel district={activeDistrict} />
        </div>
      </div>
    </section>
  );
};
