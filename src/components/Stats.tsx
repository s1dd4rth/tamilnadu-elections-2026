import React from 'react';
import { SERIF, COLORS } from '@/styles/theme';
import { SmallCaps } from './common';
import { fmtIndian } from '@/utils/format';
import stateData from '@/data/state.json';

export const KPIStrip = () => {
  const items = [
    { label: 'Total Electors', val: '5.67', unit: 'Cr', sub: fmtIndian(stateData.total) },
    { label: 'Women', val: '2.90', unit: 'Cr', sub: '+12.22 L vs men' },
    { label: 'Men', val: '2.77', unit: 'Cr', sub: 'Gender ratio 1,044' },
    { label: 'Third Gender', val: '7,617', unit: '', sub: 'First full enumeration' },
    { label: 'Youth 18–19', val: '12.51', unit: 'L', sub: '7.40 L newly added' },
    { label: 'Seniors 85+', val: '3.99', unit: 'L', sub: 'PwD voters: 4.63 L' },
    { label: 'Polling Stations', val: '75,064', unit: '', sub: 'Across 234 ACs' },
    { label: 'SC / ST / GEN', val: `${stateData.scReserved}/${stateData.stReserved}/${stateData.general}`, unit: '', sub: 'Reservation split' },
  ];
  return (
    <div style={{ border: `1px solid ${COLORS.border}`, borderLeft: 0, borderRight: 0, padding: '18px 0', margin: '0 0 28px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0' }}>
        {items.map((it, i) => (
          <div key={i} style={{
            padding: '10px 16px',
            borderRight: '1px solid #d4c9bc',
            borderBottom: '1px solid #d4c9bc',
          }}>
            <SmallCaps style={{ color: COLORS.muted }}>{it.label}</SmallCaps>
            <div style={{
              fontFamily: SERIF,
              fontWeight: 700,
              fontSize: 'clamp(22px, 2.8vw, 36px)',
              lineHeight: 1,
              color: COLORS.text,
              margin: '6px 0 2px',
              fontFeatureSettings: '"tnum" 1, "lnum" 1',
              letterSpacing: '-0.02em'
            }}>
              {it.val}{it.unit && <span style={{ fontSize: '60%', marginLeft: '3px', color: COLORS.accent }}>{it.unit}</span>}
            </div>
            <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '12px', color: COLORS.muted }}>{it.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
