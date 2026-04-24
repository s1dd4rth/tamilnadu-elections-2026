import { Masthead, HeadlineBar } from '@/components/Header';
import { KPIStrip } from '@/components/Stats';
import { MapSection } from '@/components/MapSection';
import { TurnoutSection } from '@/components/TurnoutSection';
import { AgePyramid } from '@/components/AgePyramid';
import { ACExplorer } from '@/components/ACExplorer';
import { SIRFlow } from '@/components/SIRFlow';
import { NominationFunnel } from '@/components/NominationFunnel';
import { DistrictTable } from '@/components/DistrictTable';
import { ACExtremes } from '@/components/ACExtremes';
import {
  ContestDensity,
  DecoyCandidates,
  WomenOnBallot,
  BeyondBigFour,
  SymbolMenagerie
} from '@/components/ElectoralInsights';
import {
  CrorepatiBallot,
  CriminalColumn,
  AgeOfTheBallot,
  EducationalBallot,
} from '@/components/AffidavitInsights';
import { SmallCaps } from '@/components/common';
import { COLORS, SERIF, MONO } from '@/styles/theme';
import Link from 'next/link';

export default function Page() {
  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', background: '#faf4e8', minHeight: '100vh', padding: '16px' }}>
      <Masthead />
      <HeadlineBar />
      <KPIStrip />
      
      <MapSection />
      <TurnoutSection />

      {/* Link to the dedicated analysis page — pairs the 2021 seat hemicycle with the apathy-margin section. */}
      <section style={{
        margin: '20px 0 60px',
        padding: '28px 32px',
        background: COLORS.text,
        color: '#faf4e8',
        border: `1.5px solid ${COLORS.text}`,
        boxShadow: '6px 6px 0 rgba(26,20,16,0.08)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px',
      }}>
        <div style={{ maxWidth: '620px' }}>
          <SmallCaps style={{ color: '#e8c9b0' }}>Further reading · Voting data analysis</SmallCaps>
          <div style={{
            fontFamily: SERIF,
            fontSize: 'clamp(22px, 2.8vw, 30px)',
            fontWeight: 800,
            fontStyle: 'italic',
            lineHeight: 1.2,
            margin: '8px 0 6px',
            letterSpacing: '-0.02em',
            color: '#faf4e8',
          }}>
            The 2021 baseline — and the vote that wasn't.
          </div>
          <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '14px', lineHeight: 1.55, color: '#d4c9bc', margin: 0 }}>
            The hemicycle of 234 dots, side-by-side 2021 → 2026 when counting finishes, and the apathy-margin finding: in 2021, non-voters outnumbered the winner's margin in nearly 9 of every 10 constituencies.
          </p>
        </div>
        <Link href="/analysis" style={{
          fontFamily: MONO,
          fontSize: '13px',
          fontWeight: 700,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          padding: '14px 20px',
          border: `1.5px solid #faf4e8`,
          color: '#faf4e8',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
        }}>
          Read the Analysis →
        </Link>
      </section>

      <SIRFlow />
      <AgePyramid />
      <ACExtremes />
      <DistrictTable />
      <NominationFunnel />
      <ACExplorer />

      <ContestDensity />
      <DecoyCandidates />
      <WomenOnBallot />
      <BeyondBigFour />
      <SymbolMenagerie />

      <CrorepatiBallot />
      <CriminalColumn />
      <AgeOfTheBallot />
      <EducationalBallot />

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
