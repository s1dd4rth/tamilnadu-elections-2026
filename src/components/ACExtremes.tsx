import React from 'react';
import { SERIF, MONO, COLORS } from '@/styles/theme';
import { SmallCaps, SectionTitle } from './common';
import { fmtIndian } from '@/utils/format';
import acsData from '@/data/acs.json';

const Card = ({ ac, label, kicker }: any) => {
  const femalePct = ((ac.f / ac.total) * 100).toFixed(1);
  return (
    <div style={{ background: '#faf4e8', padding: '24px', border: `1.5px solid ${COLORS.text}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
        <SmallCaps style={{ color: COLORS.accent }}>
          AC №{ac.no} · {ac.d}{ac.t !== 'GEN' ? ' · ' + ac.t : ''}
        </SmallCaps>
        <SmallCaps style={{ color: COLORS.muted, fontSize: '10px' }}>{label}</SmallCaps>
      </div>
      <h3 style={{ fontFamily: SERIF, fontSize: '26px', fontWeight: 900, margin: '2px 0 12px', color: COLORS.text, letterSpacing: '-0.02em' }}>
        {ac.n}
      </h3>
      <div style={{ fontFamily: SERIF, fontSize: '42px', fontWeight: 900, color: COLORS.text, fontFeatureSettings: '"tnum" 1', lineHeight: 1, letterSpacing: '-0.03em' }}>
        {fmtIndian(ac.total)}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontFamily: MONO, fontSize: '11px', color: COLORS.muted, letterSpacing: '0.1em', fontWeight: 600 }}>
        <span>M {fmtIndian(ac.m)} · F {fmtIndian(ac.f)}</span>
        <span>♀ {femalePct}%</span>
      </div>
      {kicker && (
        <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '13px', color: COLORS.text, margin: '14px 0 0', lineHeight: 1.5 }}>
          {kicker}
        </p>
      )}
    </div>
  );
};

export const ACExtremes = () => {
  const sorted = [...acsData].sort((a, b) => b.total - a.total);
  const largest = sorted[0];
  const smallest = sorted[sorted.length - 1];
  const median = sorted[Math.floor(sorted.length / 2)];

  return (
    <section style={{ margin: '48px 0' }}>
      <div style={{ borderTop: `2px solid ${COLORS.text}` }} />
      <SectionTitle kicker="Electoral Extremes">Size & Scale.</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        <Card 
          ac={largest} 
          label="LARGEST BY POPULATION" 
          kicker="Shozhinganallur remains the state's and country's demographic behemoth, housing more electors than many small districts." 
        />
        <Card 
          ac={smallest} 
          label="SMALLEST BY POPULATION" 
          kicker="Harbour, in Central Chennai, represents the opposite pole — a tightly packed urban core with less than a quarter of the largest seat's count." 
        />
        <Card 
          ac={median} 
          label="THE STATE MEDIAN" 
          kicker={`Sornavur (Rank ${Math.floor(sorted.length / 2) + 1}) approximates the 'typical' Tamil Nadu constituency in raw size.`} 
        />
      </div>
    </section>
  );
};
