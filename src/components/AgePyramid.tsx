"use client";
import React from 'react';
import { SERIF, MONO, COLORS } from '@/styles/theme';
import { SmallCaps, SectionTitle } from './common';
import { fmtLakh } from '@/utils/format';
import ageData from '@/data/age-data.json';
import { useIsMobile } from '@/hooks/useMediaQuery';

export const AgePyramid = () => {
  const maxHalf = Math.max(...ageData.cohorts.map(c => Math.max(c.m, c.f)));
  const ticks = [0, 2000000, 4000000, 6000000];
  const isMobile = useIsMobile();

  const gridCols = isMobile ? '40px 1fr 50px 1fr' : '80px 1fr 60px 1fr 100px';

  return (
    <section style={{ margin: '32px 0' }}>
      <div style={{ borderTop: `2px solid ${COLORS.text}` }} />
      <SectionTitle kicker="Demographic Pulse">The Pyramid of Power.</SectionTitle>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', flexDirection: isMobile ? 'column' : 'row', gap: '8px' }}>
        <SmallCaps style={{ color: COLORS.muted }}>Gender split by age cohort</SmallCaps>
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', background: COLORS.text }} />
            <SmallCaps style={{ fontSize: '9px' }}>Men</SmallCaps>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', background: COLORS.accent }} />
            <SmallCaps style={{ fontSize: '9px' }}>Women</SmallCaps>
          </div>
        </div>
      </div>
      <div style={{ border: `1px solid ${COLORS.text}`, padding: isMobile ? '16px 10px' : '24px 20px', background: '#fff9ef' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: gridCols, 
          gap: '10px',
          paddingBottom: '8px',
          borderBottom: '1px solid #d4c9bc',
          marginBottom: '16px'
        }}>
          <SmallCaps style={{ color: COLORS.muted, fontSize: '9px' }}>Age</SmallCaps>
          <SmallCaps style={{ color: COLORS.muted, fontSize: '9px', textAlign: 'right' }}>{isMobile ? 'M' : 'Male Count'}</SmallCaps>
          <SmallCaps style={{ color: COLORS.muted, fontSize: '9px', textAlign: 'center' }}>{isMobile ? 'R' : 'Ratio'}</SmallCaps>
          <SmallCaps style={{ color: COLORS.muted, fontSize: '9px' }}>{isMobile ? 'F' : 'Female Count'}</SmallCaps>
          {!isMobile && <SmallCaps style={{ color: COLORS.muted, fontSize: '9px', textAlign: 'right' }}>Cohort Total</SmallCaps>}
        </div>

        {ageData.cohorts.map((c, i) => {
          const mPct = (c.m / 6500000) * 100;
          const fPct = (c.f / 6500000) * 100;
          const cohortTotal = c.m + c.f + c.tg;
          const sharePct = ((cohortTotal / ageData.total) * 100).toFixed(1);
          
          const mLabelInside = mPct > 20;
          const fLabelInside = fPct > 20;

          return (
            <div key={i} style={{ 
              display: 'grid', 
              gridTemplateColumns: gridCols, 
              gap: '10px', 
              height: '32px', 
              alignItems: 'center',
              marginBottom: '2px'
            }}>
              <div style={{ fontFamily: MONO, fontSize: isMobile ? '9px' : '11px', fontWeight: 700, color: COLORS.text }}>{c.band}</div>
              
              <div style={{ position: 'relative', height: '100%', display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ 
                  position: 'absolute', 
                  right: 0, top: 0, bottom: 0, 
                  width: `${mPct}%`, 
                  background: COLORS.text 
                }} />
                {(!isMobile || mPct > 35) && (
                  <span style={{ 
                    position: 'absolute', 
                    right: mLabelInside ? '8px' : `calc(${mPct}% + 4px)`,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontFamily: MONO, fontSize: '10px',
                    color: mLabelInside ? '#f5ead8' : COLORS.text,
                    fontFeatureSettings: '"tnum" 1', letterSpacing: '0.05em', fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}>
                    {fmtLakh(c.m)}
                  </span>
                )}
              </div>
              <div style={{ textAlign: 'center', fontFamily: MONO, fontSize: isMobile ? '8.5px' : '9.5px', color: COLORS.muted, letterSpacing: '0.06em', fontFeatureSettings: '"tnum" 1' }}>
                {isMobile ? (c.f / c.m * 10).toFixed(1) : `${(c.f / c.m * 1000).toFixed(0)} F/1k`}
              </div>
              <div style={{ position: 'relative', height: '100%' }}>
                <div style={{ 
                  position: 'absolute', 
                  left: 0, top: 0, bottom: 0, 
                  width: `${fPct}%`, 
                  background: COLORS.accent 
                }} />
                {(!isMobile || fPct > 35) && (
                  <span style={{ 
                    position: 'absolute', 
                    left: fLabelInside ? '8px' : `calc(${fPct}% + 4px)`,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontFamily: MONO, fontSize: '10px',
                    color: fLabelInside ? '#faf4e8' : COLORS.text,
                    fontFeatureSettings: '"tnum" 1', letterSpacing: '0.05em', fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}>
                    {fmtLakh(c.f)}
                  </span>
                )}
              </div>
              {!isMobile && (
                <div style={{ textAlign: 'right', fontFamily: MONO, fontSize: '11px', color: COLORS.text, fontFeatureSettings: '"tnum" 1', fontWeight: 700 }}>
                  {fmtLakh(cohortTotal)}
                  <div style={{ fontSize: '9px', color: COLORS.muted, letterSpacing: '0.04em', fontWeight: 500 }}>{sharePct}%</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '22px', background: COLORS.text, color: COLORS.background, padding: '20px 24px' }}>
        <SmallCaps style={{ color: '#d4a080' }}>What the pyramid reveals</SmallCaps>
        <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 'clamp(14px, 1.5vw, 16px)', margin: '6px 0 0', lineHeight: 1.6 }}>
          The sex ratio climbs with age: <strong style={{ color: '#f5b98a' }}>914 women per 1,000 men in the 18–19 band, but 1,180 per 1,000 in the 80+</strong>. Women live longer than men, and the electoral roll records the demographic consequence. The middle bands (30–59) carry nearly six in every ten voters; the median elector is in their mid-forties.
        </p>
      </div>
      
      <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '12px', color: COLORS.muted, margin: '14px 0 0', textAlign: 'right' }}>
        Total differs from final-roll figure by 6.4 L — snapshot includes nomination-period additions.
      </p>
    </section>
  );
};
