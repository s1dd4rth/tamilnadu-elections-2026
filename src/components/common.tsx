import React from 'react';
import { MONO, SERIF } from '@/styles/theme';

export const SmallCaps = ({ children, style, className }: { children: React.ReactNode, style?: React.CSSProperties, className?: string }) => (
  <div className={className} style={{
    fontFamily: MONO,
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    ...style
  }}>
    {children}
  </div>
);

export const SectionTitle = ({ children, kicker, style }: { children: React.ReactNode, kicker?: string, style?: React.CSSProperties }) => (
  <div style={{ margin: '24px 0 16px', ...style }}>
    {kicker && <SmallCaps style={{ color: '#a04020', marginBottom: '8px' }}>{kicker}</SmallCaps>}
    <h2 style={{
      fontFamily: SERIF,
      fontSize: 'clamp(32px, 5vw, 64px)',
      fontWeight: 900,
      fontStyle: 'italic',
      lineHeight: 1,
      margin: 0,
      letterSpacing: '-0.03em'
    }}>
      {children}
    </h2>
  </div>
);
