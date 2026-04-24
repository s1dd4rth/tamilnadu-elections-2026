import { SERIF, COLORS } from '@/styles/theme';
import { SmallCaps } from './common';

// Both components use CSS classes + media queries (see globals.css) instead
// of the useIsMobile hook. The hook defaults to `false` on SSR and flips
// on the client's first effect, which forced a full layout re-render and
// was the dominant CLS source on mobile Lighthouse runs.

export const Masthead = () => {
  return (
    <header style={{ borderBottom: `3px double ${COLORS.border}`, paddingBottom: '14px', marginBottom: '22px' }}>
      <h1 style={{
        fontFamily: SERIF,
        fontWeight: 900,
        fontSize: 'clamp(44px, 9vw, 120px)',
        lineHeight: 0.88,
        letterSpacing: '-0.035em',
        margin: '10px 0 4px',
        fontStyle: 'italic',
        color: COLORS.text
      }}>
        TN Election in Numbers.
      </h1>
      <div className="masthead-row">
        <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 'clamp(14px, 1.6vw, 18px)', color: COLORS.muted, margin: 0, maxWidth: '640px' }}>
          A numerical atlas of Tamil Nadu, after the Special Intensive Revision.
        </p>
        <SmallCaps className="masthead-credit" style={{ color: COLORS.accent }}>
          Compiled by Siddarth Kengadaran
        </SmallCaps>
      </div>
    </header>
  );
};

export const HeadlineBar = () => {
  return (
    <section style={{ margin: '0 0 22px' }}>
      <div className="headline-grid">
        <div>
          <SmallCaps style={{ color: COLORS.accent }}>The Number That Matters</SmallCaps>
          <div
            className="headline-number"
            style={{
              fontFamily: SERIF,
              fontWeight: 900,
              lineHeight: 0.82,
              letterSpacing: '-0.055em',
              color: COLORS.text,
              fontFeatureSettings: '"tnum" 1, "lnum" 1',
              margin: '6px 0 0'
            }}
          >
            5,67,07,380
          </div>
          <p style={{
            fontFamily: SERIF,
            fontSize: 'clamp(14px, 1.5vw, 17px)',
            lineHeight: 1.45,
            color: '#3a302a',
            margin: '14px 0 0',
            maxWidth: '640px'
          }}>
            Electors on Tamil Nadu&apos;s final roll, published 23 February 2026 by the Chief Electoral Officer, Archana Patnaik. <span style={{ color: COLORS.accent, fontWeight: 600 }}>74,07,207 names</span> have been struck from the rolls during the Special Intensive Revision — the largest single correction in the state&apos;s electoral history.
          </p>
        </div>
        <div className="headline-rhs" style={{ fontFamily: SERIF }}>
          <p style={{ margin: '0 0 10px', fontSize: '13px', lineHeight: 1.55, color: '#3a302a', fontStyle: 'italic', textIndent: '1em' }}>
            Tamil Nadu&apos;s women now outnumber its men by 12.22 lakh — a fact the old rolls had partially obscured. Young voters aged eighteen and nineteen number 12.51 lakh; among them, 7.40 lakh were newly enrolled during this revision alone.
          </p>
          <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.55, color: '#3a302a', textIndent: '1em' }}>
            The final roll represents an 11.5 per cent net reduction from the pre-SIR figure of 6.41 crore. Chennai lost 14.25 lakh names — the sharpest decline of any district.
          </p>
        </div>
      </div>
    </section>
  );
};
