"use client";

import React, { useMemo } from 'react';
import { SERIF, MONO, COLORS, onCream } from '@/styles/theme';
import { SmallCaps, SectionTitle } from './common';
import { fmtRupeesShort } from '@/utils/format';
import acsData from '@/data/acs.json';
import candidatesData from '@/data/candidates_by_ac.json';
import candidatesMyneta from '@/data/candidates_myneta.json';
import partiesData from '@/data/parties.json';
import { useIsMobile } from '@/hooks/useMediaQuery';

type Row = {
  ac: number;
  acName: string;
  district: string;
  name: string;
  party: string;
  alliance: string;  // SPA / NDA / TVK / NTK / OTH / IND
  age?: number;
  education?: string;
  assets?: number;
  cases?: number;
  isFemale?: boolean;
};

const ALLIANCE_ORDER = ['SPA', 'NDA', 'TVK', 'NTK', 'OTH', 'IND'];
const ALLIANCE_META: Record<string, { label: string; color: string }> = {
  SPA: { label: 'SPA (DMK-led)',     color: '#d32a1e' },
  NDA: { label: 'NDA (AIADMK-led)',  color: '#0c7a3a' },
  TVK: { label: 'TVK (Vijay)',       color: '#8a2020' },
  NTK: { label: 'NTK (Seeman)',      color: '#d8a520' },
  OTH: { label: 'Other parties',     color: '#5a7a9a' },
  IND: { label: 'Independents',      color: '#6b5d52' },
};

// Flatten (AC, ECI candidate, MyNeta enrichment) into a row list once.
function useRows(): Row[] {
  return useMemo(() => {
    const acByNo = new Map<number, any>(
      (acsData as any[]).map(a => [a.no, a])
    );
    const out: Row[] = [];
    for (const [acNoStr, list] of Object.entries(candidatesMyneta as any)) {
      const acNo = Number(acNoStr);
      const ac = acByNo.get(acNo);
      const eciList = (candidatesData as any)[acNoStr] || [];
      for (const m of list as any[]) {
        const eci = eciList[m.i];
        if (!eci) continue;
        const party = eci.party || '';
        const p = (partiesData as any)[party];
        const alliance = (p && p.alliance) || (party === 'IND' ? 'IND' : 'OTH');
        out.push({
          ac: acNo,
          acName: ac?.n || '',
          district: ac?.d || '',
          name: eci.name,
          party,
          alliance,
          age: m.age,
          education: m.ed,
          assets: m.ta,
          cases: m.cc,
          isFemale: m.g === 'F',
        });
      }
    }
    return out;
  }, []);
}

const MEDIAN = (nums: number[]): number => {
  if (nums.length === 0) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

// ─── №1 The Crorepati Ballot ──────────────────────────────────────────────

export const CrorepatiBallot = () => {
  const isMobile = useIsMobile();
  const rows = useRows();

  const { total, crorepatis, crorepatiPct, byAlliance, topTen } = useMemo(() => {
    const analysed = rows.filter(r => r.assets !== undefined);
    const crorepatis = analysed.filter(r => (r.assets ?? 0) >= 1_00_00_000);
    const byAlliance = ALLIANCE_ORDER.map(code => {
      const group = analysed.filter(r => r.alliance === code);
      const assets = group.map(r => r.assets!).filter(x => x >= 0);
      const cp = group.filter(r => (r.assets ?? 0) >= 1_00_00_000).length;
      return {
        code,
        count: group.length,
        medianAssets: MEDIAN(assets),
        crorepatis: cp,
        crorepatiPct: group.length ? (cp / group.length) * 100 : 0,
      };
    });
    const topTen = [...analysed]
      .sort((a, b) => (b.assets ?? 0) - (a.assets ?? 0))
      .slice(0, 10);
    return {
      total: analysed.length,
      crorepatis: crorepatis.length,
      crorepatiPct: analysed.length ? (crorepatis.length / analysed.length) * 100 : 0,
      byAlliance,
      topTen,
    };
  }, [rows]);

  const maxMedian = Math.max(...byAlliance.map(b => b.medianAssets), 1);
  const maxTop = topTen[0]?.assets ?? 1;

  return (
    <section style={{ margin: '60px 0' }}>
      <div style={{ borderTop: `2px solid ${COLORS.text}` }} />
      <SectionTitle kicker="Behind the Ballot · №1 of 4">The Crorepati Ballot.</SectionTitle>
      <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '15px', color: COLORS.muted, margin: '-8px 0 32px', maxWidth: '820px', lineHeight: 1.6 }}>
        Of {total.toLocaleString('en-IN')} candidates whose affidavits have been analysed, <strong style={{ color: COLORS.accent }}>{crorepatis.toLocaleString('en-IN')} declared assets of ₹1 crore or more</strong> ({crorepatiPct.toFixed(1)}%). The median across the ballot is skewed by Independents; the alliance shape is very different.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) minmax(0, 1.1fr)', gap: '40px', alignItems: 'start' }}>
        <div>
          <SmallCaps style={{ color: COLORS.accent, marginBottom: '20px', display: 'block' }}>Median declared assets by alliance</SmallCaps>
          {byAlliance.map(b => {
            const meta = ALLIANCE_META[b.code];
            return (
              <div key={b.code} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                  <span style={{ fontFamily: MONO, fontSize: '11px', color: COLORS.text, fontWeight: 700 }}>
                    {meta.label}
                  </span>
                  <span style={{ fontFamily: MONO, fontSize: '11px', color: onCream(meta.color), fontWeight: 700, fontFeatureSettings: '"tnum" 1' }}>
                    {fmtRupeesShort(b.medianAssets)}
                  </span>
                </div>
                <div style={{ background: '#f5ead8', height: '18px', border: `1px solid ${COLORS.border}` }}>
                  <div style={{ width: `${(b.medianAssets / maxMedian) * 100}%`, height: '100%', background: meta.color }} />
                </div>
                <div style={{ fontFamily: MONO, fontSize: '9px', color: COLORS.muted, letterSpacing: '0.08em', marginTop: '3px' }}>
                  {b.crorepatiPct.toFixed(0)}% Cr+ · {b.count} analysed
                </div>
              </div>
            );
          })}
        </div>

        <div>
          <SmallCaps style={{ color: COLORS.accent, marginBottom: '20px', display: 'block' }}>Top 10 declared wealth on the ballot</SmallCaps>
          {topTen.map((r, i) => {
            const meta = ALLIANCE_META[r.alliance];
            const bar = (r.assets ?? 0) / maxTop;
            return (
              <div key={r.ac + ':' + r.name + ':' + i} style={{ display: 'grid', gridTemplateColumns: isMobile ? '24px 1fr' : '28px 1fr 90px', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontFamily: MONO, fontSize: '11px', color: COLORS.muted, fontWeight: 700, textAlign: 'right' }}>{i + 1}.</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: SERIF, fontSize: '15px', fontWeight: 800, color: COLORS.text, lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {r.name}
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: '10px', color: COLORS.muted, marginTop: '2px' }}>
                    {r.party} · AC {r.ac} {r.acName}
                  </div>
                  <div style={{ marginTop: '4px', background: '#f5ead8', height: '6px', border: `1px solid ${COLORS.border}` }}>
                    <div style={{ width: `${bar * 100}%`, height: '100%', background: meta.color }} />
                  </div>
                </div>
                {!isMobile && (
                  <span style={{ fontFamily: MONO, fontSize: '12px', color: onCream(meta.color), fontWeight: 800, textAlign: 'right', fontFeatureSettings: '"tnum" 1' }}>
                    {fmtRupeesShort(r.assets ?? 0)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '11px', color: COLORS.muted, margin: '28px 0 0', textAlign: 'right' }}>
        Assets as declared in ECI-filed affidavits (self-sworn). Aggregated by MyNeta / ADR.
      </p>
    </section>
  );
};

// ─── №2 The Criminal Column (with disclaimer) ─────────────────────────────

export const CriminalColumn = () => {
  const isMobile = useIsMobile();
  const rows = useRows();

  const { total, withCases, withCasesPct, byAlliance, topTen } = useMemo(() => {
    const analysed = rows.filter(r => r.cases !== undefined);
    const withCases = analysed.filter(r => (r.cases ?? 0) > 0);
    const byAlliance = ALLIANCE_ORDER.map(code => {
      const group = analysed.filter(r => r.alliance === code);
      const wc = group.filter(r => (r.cases ?? 0) > 0).length;
      return {
        code,
        count: group.length,
        withCases: wc,
        pct: group.length ? (wc / group.length) * 100 : 0,
      };
    });
    const topTen = [...withCases]
      .sort((a, b) => (b.cases ?? 0) - (a.cases ?? 0))
      .slice(0, 10);
    return {
      total: analysed.length,
      withCases: withCases.length,
      withCasesPct: analysed.length ? (withCases.length / analysed.length) * 100 : 0,
      byAlliance,
      topTen,
    };
  }, [rows]);

  const maxPct = Math.max(...byAlliance.map(b => b.pct), 1);

  return (
    <section style={{ margin: '60px 0' }}>
      <div style={{ borderTop: `2px solid ${COLORS.text}` }} />
      <SectionTitle kicker="Behind the Ballot · №2 of 4">The Criminal Column.</SectionTitle>
      <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '15px', color: COLORS.muted, margin: '-8px 0 32px', maxWidth: '820px', lineHeight: 1.6 }}>
        <strong style={{ color: COLORS.accent }}>{withCases.toLocaleString('en-IN')} of {total.toLocaleString('en-IN')}</strong> analysed candidates ({withCasesPct.toFixed(1)}%) declared at least one pending criminal case in their ECI affidavit. The declaration is mandatory; the case itself may be long-pending, politically motivated or minor — and never implies conviction.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) minmax(0, 1.1fr)', gap: '40px', alignItems: 'start' }}>
        <div>
          <SmallCaps style={{ color: COLORS.accent, marginBottom: '20px', display: 'block' }}>Share of candidates with declared cases, by alliance</SmallCaps>
          {byAlliance.map(b => {
            const meta = ALLIANCE_META[b.code];
            return (
              <div key={b.code} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                  <span style={{ fontFamily: MONO, fontSize: '11px', color: COLORS.text, fontWeight: 700 }}>{meta.label}</span>
                  <span style={{ fontFamily: MONO, fontSize: '11px', color: onCream(meta.color), fontWeight: 700, fontFeatureSettings: '"tnum" 1' }}>
                    {b.pct.toFixed(1)}%
                  </span>
                </div>
                <div style={{ background: '#f5ead8', height: '18px', border: `1px solid ${COLORS.border}` }}>
                  <div style={{ width: `${(b.pct / maxPct) * 100}%`, height: '100%', background: meta.color }} />
                </div>
                <div style={{ fontFamily: MONO, fontSize: '9px', color: COLORS.muted, letterSpacing: '0.08em', marginTop: '3px' }}>
                  {b.withCases} of {b.count} analysed
                </div>
              </div>
            );
          })}
        </div>

        <div>
          <SmallCaps style={{ color: COLORS.accent, marginBottom: '20px', display: 'block' }}>Most declared cases on the ballot</SmallCaps>
          {topTen.map((r, i) => {
            const meta = ALLIANCE_META[r.alliance];
            const bar = (r.cases ?? 0) / (topTen[0].cases ?? 1);
            return (
              <div key={r.ac + ':' + r.name + ':' + i} style={{ display: 'grid', gridTemplateColumns: isMobile ? '24px 1fr 40px' : '28px 1fr 60px', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontFamily: MONO, fontSize: '11px', color: COLORS.muted, fontWeight: 700, textAlign: 'right' }}>{i + 1}.</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: SERIF, fontSize: '15px', fontWeight: 800, color: COLORS.text, lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {r.name}
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: '10px', color: COLORS.muted, marginTop: '2px' }}>
                    {r.party} · AC {r.ac} {r.acName}
                  </div>
                  <div style={{ marginTop: '4px', background: '#f5ead8', height: '6px', border: `1px solid ${COLORS.border}` }}>
                    <div style={{ width: `${bar * 100}%`, height: '100%', background: meta.color }} />
                  </div>
                </div>
                <span style={{ fontFamily: MONO, fontSize: '14px', color: COLORS.accent, fontWeight: 800, textAlign: 'right', fontFeatureSettings: '"tnum" 1' }}>
                  {r.cases}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{
        marginTop: '28px',
        padding: '16px 20px',
        background: '#f5ead8',
        borderLeft: `4px solid ${COLORS.accent}`,
      }}>
        <SmallCaps style={{ color: COLORS.accent }}>A note on what this column isn't</SmallCaps>
        <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '13px', color: COLORS.text, margin: '6px 0 0', lineHeight: 1.55 }}>
          A "declared case" is a pending charge the candidate was legally required to disclose in their nomination affidavit — not a conviction. Many are decades-old protest FIRs; some are serious. This tally records what candidates themselves have declared. Full case details, IPC sections, and severity are available on each candidate's MyNeta affidavit page.
        </p>
      </div>
    </section>
  );
};

// ─── №3 The Age of the Ballot ─────────────────────────────────────────────

const AGE_BANDS: { label: string; min: number; max: number }[] = [
  { label: '25–29',  min: 25, max: 29 },
  { label: '30–39',  min: 30, max: 39 },
  { label: '40–49',  min: 40, max: 49 },
  { label: '50–59',  min: 50, max: 59 },
  { label: '60–69',  min: 60, max: 69 },
  { label: '70–79',  min: 70, max: 79 },
  { label: '80+',    min: 80, max: 200 },
];

export const AgeOfTheBallot = () => {
  const isMobile = useIsMobile();
  const rows = useRows();

  const { total, median, youngest, oldest, bands, byAlliance } = useMemo(() => {
    const ages = rows
      .filter(r => typeof r.age === 'number')
      .map(r => ({ age: r.age!, alliance: r.alliance, name: r.name, ac: r.ac, acName: r.acName, party: r.party }));
    const sortedAges = [...ages].map(a => a.age).sort((x, y) => x - y);
    const median = sortedAges.length
      ? (sortedAges.length % 2
          ? sortedAges[(sortedAges.length - 1) / 2]
          : (sortedAges[sortedAges.length / 2 - 1] + sortedAges[sortedAges.length / 2]) / 2)
      : 0;
    const youngest = ages.length ? ages.reduce((a, b) => (a.age < b.age ? a : b)) : null;
    const oldest = ages.length ? ages.reduce((a, b) => (a.age > b.age ? a : b)) : null;
    const bands = AGE_BANDS.map(band => ({
      ...band,
      count: ages.filter(a => a.age >= band.min && a.age <= band.max).length,
    }));
    const byAlliance = ALLIANCE_ORDER.map(code => {
      const group = ages.filter(a => a.alliance === code);
      const groupAges = group.map(g => g.age).sort((x, y) => x - y);
      const m = groupAges.length
        ? (groupAges.length % 2
            ? groupAges[(groupAges.length - 1) / 2]
            : (groupAges[groupAges.length / 2 - 1] + groupAges[groupAges.length / 2]) / 2)
        : 0;
      return { code, count: group.length, median: m };
    });
    return { total: ages.length, median, youngest, oldest, bands, byAlliance };
  }, [rows]);

  const maxBand = Math.max(...bands.map(b => b.count), 1);
  const maxAllianceMedian = Math.max(...byAlliance.map(a => a.median), 1);

  return (
    <section style={{ margin: '60px 0' }}>
      <div style={{ borderTop: `2px solid ${COLORS.text}` }} />
      <SectionTitle kicker="Behind the Ballot · №3 of 4">The Age of the Ballot.</SectionTitle>
      <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '15px', color: COLORS.muted, margin: '-8px 0 32px', maxWidth: '820px', lineHeight: 1.6 }}>
        Across {total.toLocaleString('en-IN')} candidates, the median age is <strong style={{ color: COLORS.accent }}>{median.toFixed(0)}</strong>. The youngest is {youngest?.name} ({youngest?.age}, {youngest?.party}, AC {youngest?.ac} {youngest?.acName}); the oldest is {oldest?.name} ({oldest?.age}, {oldest?.party}, AC {oldest?.ac} {oldest?.acName}).
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) minmax(0, 1fr)', gap: '40px', alignItems: 'start' }}>
        <div>
          <SmallCaps style={{ color: COLORS.accent, marginBottom: '20px', display: 'block' }}>Distribution by age band</SmallCaps>
          {bands.map(b => {
            const pct = total ? (b.count / total) * 100 : 0;
            return (
              <div key={b.label} style={{ display: 'grid', gridTemplateColumns: isMobile ? '60px 1fr 60px' : '70px 1fr 80px', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontFamily: MONO, fontSize: '11px', color: COLORS.text, fontWeight: 700 }}>{b.label}</span>
                <div style={{ background: '#f5ead8', height: '20px', border: `1px solid ${COLORS.border}` }}>
                  <div style={{ width: `${(b.count / maxBand) * 100}%`, height: '100%', background: COLORS.text }} />
                </div>
                <span style={{ fontFamily: MONO, fontSize: '11px', color: COLORS.text, fontWeight: 800, textAlign: 'right', fontFeatureSettings: '"tnum" 1' }}>
                  {b.count} <span style={{ color: COLORS.muted, fontWeight: 500 }}>· {pct.toFixed(0)}%</span>
                </span>
              </div>
            );
          })}
        </div>

        <div>
          <SmallCaps style={{ color: COLORS.accent, marginBottom: '20px', display: 'block' }}>Median age by alliance</SmallCaps>
          {byAlliance.map(a => {
            const meta = ALLIANCE_META[a.code];
            return (
              <div key={a.code} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                  <span style={{ fontFamily: MONO, fontSize: '11px', color: COLORS.text, fontWeight: 700 }}>{meta.label}</span>
                  <span style={{ fontFamily: MONO, fontSize: '11px', color: onCream(meta.color), fontWeight: 800, fontFeatureSettings: '"tnum" 1' }}>
                    {a.median.toFixed(0)}
                  </span>
                </div>
                <div style={{ background: '#f5ead8', height: '18px', border: `1px solid ${COLORS.border}` }}>
                  <div style={{ width: `${(a.median / maxAllianceMedian) * 100}%`, height: '100%', background: meta.color }} />
                </div>
                <div style={{ fontFamily: MONO, fontSize: '9px', color: COLORS.muted, letterSpacing: '0.08em', marginTop: '3px' }}>
                  {a.count} candidates analysed
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '11px', color: COLORS.muted, margin: '24px 0 0', textAlign: 'right' }}>
        Age as declared in the candidate's ECI affidavit. Aggregated by MyNeta / ADR.
      </p>
    </section>
  );
};

// ─── №4 The Educational Ballot ────────────────────────────────────────────

// Ordered buckets for the education histogram. Labels on MyNeta can vary;
// we normalise to these 9 buckets.
const ED_BUCKETS = [
  'Illiterate',
  'Literate',
  '5th Pass',
  '8th Pass',
  '10th Pass',
  '12th Pass',
  'Graduate',
  'Graduate Professional',
  'Post Graduate',
  'Doctorate',
] as const;

function bucketFor(ed?: string): string | null {
  if (!ed) return null;
  const t = ed.trim();
  if (ED_BUCKETS.includes(t as any)) return t;
  // Handle common aliases / variants.
  if (/^literate/i.test(t)) return 'Literate';
  if (/illiterate/i.test(t)) return 'Illiterate';
  if (/doctor/i.test(t)) return 'Doctorate';
  if (/post\s*graduate/i.test(t)) return 'Post Graduate';
  if (/graduate\s*professional|professional/i.test(t)) return 'Graduate Professional';
  if (/graduate/i.test(t)) return 'Graduate';
  if (/12/.test(t)) return '12th Pass';
  if (/10/.test(t)) return '10th Pass';
  if (/8/.test(t)) return '8th Pass';
  if (/5/.test(t)) return '5th Pass';
  return t;
}

export const EducationalBallot = () => {
  const isMobile = useIsMobile();
  const rows = useRows();

  const { total, buckets, gradOrAbovePct } = useMemo(() => {
    const analysed = rows
      .map(r => ({ ...r, bucket: bucketFor(r.education) }))
      .filter(r => r.bucket !== null) as (Row & { bucket: string })[];

    const counts: Record<string, number> = {};
    for (const r of analysed) counts[r.bucket] = (counts[r.bucket] || 0) + 1;
    const entries = ED_BUCKETS
      .map(b => ({ bucket: b as string, count: counts[b] || 0 }))
      .filter(x => x.count > 0);
    // Append any unmapped buckets at the end (rare).
    for (const [b, c] of Object.entries(counts)) {
      if (!ED_BUCKETS.includes(b as any)) entries.push({ bucket: b, count: c });
    }
    const gradBuckets = new Set(['Graduate', 'Graduate Professional', 'Post Graduate', 'Doctorate']);
    const gradAbove = analysed.filter(r => gradBuckets.has(r.bucket)).length;
    return {
      total: analysed.length,
      buckets: entries,
      gradOrAbovePct: analysed.length ? (gradAbove / analysed.length) * 100 : 0,
    };
  }, [rows]);

  const maxCount = Math.max(...buckets.map(b => b.count), 1);

  return (
    <section style={{ margin: '60px 0' }}>
      <div style={{ borderTop: `2px solid ${COLORS.text}` }} />
      <SectionTitle kicker="Behind the Ballot · №4 of 4">The Educational Ballot.</SectionTitle>
      <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '15px', color: COLORS.muted, margin: '-8px 0 32px', maxWidth: '820px', lineHeight: 1.6 }}>
        Across {total.toLocaleString('en-IN')} analysed affidavits, <strong style={{ color: COLORS.accent }}>{gradOrAbovePct.toFixed(1)}%</strong> of candidates declared a graduate degree or higher. The ballot's tail runs from Doctorates to the self-declared illiterate — both end of the scale matter at the EVM.
      </p>

      <div style={{ background: '#fff9ef', border: `1.5px solid ${COLORS.text}`, padding: isMobile ? '16px 12px' : '24px', boxShadow: '6px 6px 0 rgba(26,20,16,0.05)' }}>
        {buckets.map(b => {
          const pct = (b.count / total) * 100;
          return (
            <div key={b.bucket} style={{ display: 'grid', gridTemplateColumns: isMobile ? '110px 1fr 48px' : '180px 1fr 70px', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: isMobile ? '12px' : '15px', color: COLORS.text, fontWeight: 700 }}>
                {b.bucket}
              </span>
              <div style={{ background: '#f5ead8', height: '20px', border: `1px solid ${COLORS.border}`, position: 'relative' }}>
                <div style={{ width: `${(b.count / maxCount) * 100}%`, height: '100%', background: COLORS.text }} />
              </div>
              <span style={{ fontFamily: MONO, fontSize: isMobile ? '10px' : '12px', color: COLORS.text, fontWeight: 800, textAlign: 'right', fontFeatureSettings: '"tnum" 1' }}>
                {b.count} <span style={{ color: COLORS.muted, fontWeight: 500 }}>· {pct.toFixed(0)}%</span>
              </span>
            </div>
          );
        })}
      </div>

      <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '11px', color: COLORS.muted, margin: '14px 0 0', textAlign: 'right' }}>
        Education as self-declared on the candidate's ECI affidavit. Aggregated by MyNeta / ADR.
      </p>
    </section>
  );
};
