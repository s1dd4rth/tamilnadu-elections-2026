import React from 'react';
import { SERIF, MONO, COLORS } from '@/styles/theme';
import { SmallCaps, SectionTitle } from './common';
import { fmtIndian } from '@/utils/format';
import stateData from '@/data/state.json';

export const SIRFlow = () => {
  const stages = [
    { label: 'Pre-SIR Roll', date: '27 Oct 2025', value: stateData.preSir, width: 100, color: COLORS.text },
    { label: 'Draft Roll', date: '19 Dec 2025', value: stateData.draft, width: (stateData.draft / stateData.preSir) * 100, color: COLORS.muted },
    { label: 'Final Roll', date: '23 Feb 2026', value: stateData.total, width: (stateData.total / stateData.preSir) * 100, color: COLORS.accent },
  ];

  return (
    <section style={{ margin: '48px 0' }}>
      <div style={{ borderTop: `2px solid ${COLORS.text}` }} />
      <SectionTitle kicker="Electoral Roll Churn, 2025–26">
        The Great Correction.
      </SectionTitle>
      <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '16px', color: COLORS.muted, margin: '-8px 0 28px', maxWidth: '760px', lineHeight: 1.6 }}>
        In four months, Booth Level Officers flagged nearly 97 lakh names for deletion before claims, objections, and fresh enrolments settled the final roll.
      </p>

      <div style={{ background: '#f5ead8', border: `1.5px solid ${COLORS.text}`, padding: '32px', boxShadow: '6px 6px 0 rgba(26,20,16,0.05)' }}>
        {stages.map((s, i) => (
          <div key={i} style={{ marginBottom: i < 2 ? '28px' : 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span style={{ fontFamily: SERIF, fontSize: '20px', fontWeight: 800, color: COLORS.text, fontStyle: 'italic' }}>{s.label}</span>
                <span style={{ fontFamily: MONO, fontSize: '10px', color: COLORS.muted, marginLeft: '12px', letterSpacing: '0.15em', fontWeight: 600 }}>{s.date.toUpperCase()}</span>
              </div>
              <span style={{ fontFamily: SERIF, fontSize: '24px', fontWeight: 900, color: s.color, fontFeatureSettings: '"tnum" 1' }}>
                {fmtIndian(s.value)}
              </span>
            </div>
            <div style={{ background: '#e8dccb', height: '16px', border: `1px solid ${COLORS.text}` }}>
              <div style={{ width: `${s.width}%`, height: '100%', background: s.color, transition: 'width 600ms ease' }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
