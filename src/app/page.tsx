import { Masthead, HeadlineBar } from '@/components/Header';
import { KPIStrip } from '@/components/Stats';
import { MapSection } from '@/components/MapSection';
import { AgePyramid } from '@/components/AgePyramid';
import { ACExplorer } from '@/components/ACExplorer';
import { SIRFlow } from '@/components/SIRFlow';
import { DistrictTable } from '@/components/DistrictTable';
import { ACExtremes } from '@/components/ACExtremes';
import { 
  ContestDensity, 
  DecoyCandidates, 
  WomenOnBallot, 
  BeyondBigFour, 
  SymbolMenagerie 
} from '@/components/ElectoralInsights';
import { SmallCaps } from '@/components/common';
import { COLORS, SERIF, MONO } from '@/styles/theme';

export default function Page() {
  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', background: '#faf4e8', minHeight: '100vh', padding: '16px' }}>
      <Masthead />
      <HeadlineBar />
      <KPIStrip />
      
      <MapSection />
      <SIRFlow />
      <AgePyramid />
      <ACExtremes />
      <DistrictTable />
      <ACExplorer />

      <ContestDensity />
      <DecoyCandidates />
      <WomenOnBallot />
      <BeyondBigFour />
      <SymbolMenagerie />

      <footer style={{ 
        marginTop: '80px', 
        paddingTop: '40px', 
        borderTop: `1px solid ${COLORS.text}`,
        paddingBottom: '60px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px' }}>
          <div>
            <SmallCaps style={{ color: COLORS.accent }}>Production Notes</SmallCaps>
            <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '15px', color: COLORS.muted, lineHeight: 1.6, marginTop: '12px' }}>
              Refactored from a monolithic 7,500-line React project into a modular Next.js application. Built for performance, maintainability, and visual fidelity to the original design.
            </p>
          </div>
          <div>
            <SmallCaps style={{ color: COLORS.accent }}>Data Sources</SmallCaps>
            <ul style={{ 
              listStyle: 'none', 
              padding: 0, 
              margin: '12px 0 0', 
              fontFamily: MONO, 
              fontSize: '11px', 
              color: COLORS.text,
              letterSpacing: '0.05em',
              lineHeight: 2 
            }}>
              <li>· CEO TAMIL NADU FINAL ROLL (FEB 2026)</li>
              <li>· ECI FORM 7A NOMINATIONS (APR 2026)</li>
              <li>· CENSUS 2011 & PROJECTIONS</li>
            </ul>
          </div>
          <div style={{ textAlign: 'right' }}>
            <SmallCaps style={{ color: COLORS.muted }}>Vercel Deploy · April 2026</SmallCaps>
            <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: '24px', fontStyle: 'italic', marginTop: '12px' }}>
              TN Election 2026
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
