"use client";

import React, { useMemo } from 'react';
import { SERIF, MONO, COLORS, onCream } from '@/styles/theme';
import { SmallCaps, SectionTitle } from './common';
import { useIsMobile } from '@/hooks/useMediaQuery';
import candidatesData from '@/data/candidates_by_ac.json';
import candidatesMyneta from '@/data/candidates_myneta.json';
import partiesData from '@/data/parties.json';

// Data Constants from original monolith
const CONTEST_TOP10 = [
  {ac: 135, name: 'Karur', n: 79},
  {ac: 12, name: 'Perambur', n: 46},
  {ac: 141, name: 'Tiruchirappalli (East)', n: 41},
  {ac: 13, name: 'Kolathur', n: 38},
  {ac: 26, name: 'Velachery', n: 34},
  {ac: 11, name: 'Dr. Radhakrishnan Nagar', n: 32},
  {ac: 164, name: 'Kilvelur', n: 31},
  {ac: 63, name: 'Tiruvannamalai', n: 30},
  {ac: 134, name: 'Aravakurichi', n: 30},
  {ac: 180, name: 'Pudukkottai', n: 30},
];

// Display order + presentation metadata; counts computed at runtime from
// candidates_myneta (the per-candidate `g` flag is now grounded in MyNeta's
// curated women-candidate listing — see candidates_myneta.json).
const ALLIANCE_WOMEN_META: { code: string; label: string; color: string }[] = [
  {code: 'NTK', label: 'NTK (Seeman)',      color: '#d8a520'},
  {code: 'NDA', label: 'NDA (AIADMK-led)',  color: '#0c7a3a'},
  {code: 'TVK', label: 'TVK (Vijay)',       color: '#8a2020'},
  {code: 'OTH', label: 'Other parties',     color: '#5a7a9a'},
  {code: 'SPA', label: 'SPA (DMK-led)',     color: '#d32a1e'},
  {code: 'IND', label: 'Independents',      color: '#6b5d52'},
];

const PARTY_WOMEN_META: { code: string; full: string; color: string }[] = [
  {code: 'NTK',    full: 'Naam Tamilar Katchi',           color: '#d8a520'},
  {code: 'BJP',    full: 'Bharatiya Janata Party',        color: '#f28c28'},
  {code: 'AIPMMK', full: 'AIPMMK (Sasikala)',             color: '#8a6a3a'},
  {code: 'PMK',    full: 'Pattali Makkal Katchi',         color: '#d9b14a'},
  {code: 'BSP',    full: 'Bahujan Samaj Party',           color: '#0a5a9a'},
  {code: 'AIADMK', full: 'AIADMK',                        color: '#0c7a3a'},
  {code: 'DMK',    full: 'Dravida Munnetra Kazhagam',     color: '#d32a1e'},
  {code: 'TVK',    full: 'Tamilaga Vettri Kazhagam',      color: '#8a2020'},
  {code: 'IND',    full: 'Independent',                   color: '#6b5d52'},
];

const THIRD_FRONT = [
  {code: 'TVVK',   full: 'Tamizhaga Vaazhvurimai Katchi', leader: 'T. Velmurugan',              seats: 164, color: '#5a7a9a',
   desc: 'Dalit-focused party. Withdrew from SPA in March 2026 to contest solo; now the largest non-alliance presence on the ballot.'},
  {code: 'BSP',    full: 'Bahujan Samaj Party',           leader: 'P. Anandan (TN unit)',       seats: 119, color: '#0a5a9a',
   desc: "The national Dalit party's largest-ever Tamil Nadu run. Elephant symbol across half the state."},
  {code: 'AIPMMK', full: 'All India Puratchi Thalaivar Makkal Munnetra Kazhagam', leader: 'V.K. Sasikala', seats: 78, color: '#8a6a3a',
   desc: 'Founded by Sasikala in 2025 after the AIADMK merger, allied with the Ramadoss-led PMK(R) faction. Coconut Farm symbol.'},
  {code: 'PT',     full: 'Puthiya Tamilagam',             leader: 'Dr. K. Krishnaswamy',        seats: 60,  color: '#c97a3a',
   desc: 'Long-standing Devar/Pallar-focused party. Released 70 candidates across two lists in late March.'},
];

const MENAGERIE = [
  {symbol: 'Pillow',              ac: 12,  acName: 'Perambur',           name: 'S. Vishnu Varthan',      party: 'Independent'},
  {symbol: 'Typewriter',          ac: 15,  acName: 'Thiru-Vi-Ka-Nagar',  name: 'S. Rajendran',           party: 'Independent'},
  {symbol: 'Neck tie',            ac: 58,  acName: 'Pennagaram',         name: 'M. Tamilarasan',         party: 'Independent'},
  {symbol: 'Pencil sharpener',    ac: 26,  acName: 'Velachery',          name: 'M. Vignesh',             party: 'Independent'},
  {symbol: 'Dustbin',             ac: 114, acName: 'Tiruppur (South)',   name: 'K. Vasanthamani',        party: 'Independent'},
  {symbol: 'Syringe',             ac: 105, acName: 'Anthiyur',           name: 'M. Karthi',              party: 'Independent'},
  {symbol: 'Tray',                ac: 83,  acName: 'Yercaud',            name: 'A. Kaliyappan',          party: 'Independent'},
  {symbol: 'Chakki',              ac: 135, acName: 'Karur',              name: 'M. Senthilkumar',        party: 'Independent'},
  {symbol: 'Hurricane lamp',      ac: 233, acName: 'Vilavancode',        name: 'John Christopher T.',    party: 'Rashtriya Janata Dal'},
  {symbol: 'Plate containing food', ac: 118, acName: 'Coimbatore (North)', name: 'G.D. Krishnakumar',    party: 'Independent'},
];

const POS1 = [
  {code: 'NTK',    full: 'Naam Tamilar Katchi',         count: 74},
  {code: 'DMK',    full: 'Dravida Munnetra Kazhagam',   count: 59},
  {code: 'AIADMK', full: 'AIADMK',                      count: 42},
  {code: 'BSP',    full: 'Bahujan Samaj Party',         count: 28},
  {code: 'INC',    full: 'Indian National Congress',    count: 11},
  {code: 'BJP',    full: 'Bharatiya Janata Party',      count: 11},
];

// ─── 1. Contest Density ────────────────────────────────────────────────────
export const ContestDensity = () => {
  const isMobile = useIsMobile();
  const maxN = CONTEST_TOP10[0].n;
  return (
    <section style={{ margin: '60px 0' }}>
      <div style={{ borderTop: `2px solid ${COLORS.text}` }} />
      <SectionTitle kicker="Reading the 2026 ballot · №1 of 5">Contest Density, or: Why Karur?</SectionTitle>
      <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '15px', color: COLORS.muted, margin: '-8px 0 32px', maxWidth: '780px', lineHeight: 1.6 }}>
        The average Tamil Nadu constituency has 17 candidates. Eleven have more than 25, and one — AC 135 Karur — has seventy-nine. That number is not a function of population. It is a function of political heat.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.1fr) minmax(0, 1fr)', gap: '40px', alignItems: 'start' }}>
        <div style={{ background: '#f5ead8', padding: '24px', border: `1.5px solid ${COLORS.text}`, borderLeft: `6px solid ${COLORS.accent}` }}>
          <SmallCaps style={{ color: COLORS.accent }}>AC 135 · Karur District · An Outlier</SmallCaps>
          <h3 style={{ fontFamily: SERIF, fontSize: isMobile ? '32px' : '42px', fontWeight: 900, fontStyle: 'italic', letterSpacing: '-0.025em', margin: '8px 0 16px', lineHeight: 1.05, color: COLORS.text }}>
            79 candidates. 71 of them Independent.
          </h3>
          <p style={{ fontFamily: SERIF, fontSize: '14px', lineHeight: 1.7, color: COLORS.text, margin: '0 0 12px' }}>
            Karur is Senthil Balaji's former seat — the DMK strongman has been shifted to Coimbatore South, leaving a vacuum. Former AIADMK minister Dr. C. Vijayabaskar is the opposition pick. The TVK nominee is V.P. Mathialagan.
          </p>
          <p style={{ fontFamily: SERIF, fontSize: '14px', lineHeight: 1.7, color: COLORS.text, margin: '0 0 16px' }}>
            But the bulk of the ballot is a flood of Independents. This is an act of political speech: some sympathy, some protest, some opportunistic. The EVM catalogues them all.
          </p>
          <div style={{ fontFamily: MONO, fontSize: '11px', letterSpacing: '0.1em', color: COLORS.muted, marginTop: '20px', paddingTop: '12px', borderTop: `1px dashed ${COLORS.accent}` }}>
            ↓ 2.7× more candidates than the next-most-contested seat
          </div>
        </div>

        <div>
          <SmallCaps style={{ color: COLORS.accent, marginBottom: '16px', display: 'block' }}>Top 10 Most-Contested Seats</SmallCaps>
          {CONTEST_TOP10.map((c, i) => (
            <div key={c.ac} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 40px', gap: '12px', alignItems: 'center', marginBottom: '8px', fontFeatureSettings: '"tnum" 1' }}>
              <span style={{ fontFamily: MONO, fontSize: '10px', color: COLORS.muted, fontWeight: 700 }}>№{String(c.ac).padStart(3, '0')}</span>
              <div style={{ position: 'relative', background: '#f5ead8', height: '24px', border: `1px solid ${COLORS.border}` }}>
                <div style={{ width: `${(c.n / maxN) * 100}%`, height: '100%', background: i === 0 ? COLORS.accent : COLORS.text }} />
                <span style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', fontFamily: SERIF, fontSize: '12px', fontWeight: 700, color: (c.n/maxN > 0.4) ? '#f5ead8' : COLORS.text }}>{c.name}</span>
              </div>
              <span style={{ fontFamily: MONO, fontSize: '13px', color: i === 0 ? COLORS.accent : COLORS.text, fontWeight: 700, textAlign: 'right' }}>{c.n}</span>
            </div>
          ))}
          <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '11px', color: COLORS.muted, marginTop: '20px', lineHeight: 1.5 }}>
            Least-contested: AC 122 Kinathukadavu and AC 225 Ambasamudram at <strong>five candidates</strong> each.
          </p>
        </div>
      </div>

      <div style={{ marginTop: '40px', padding: '24px', background: '#faf4e8', border: `1.5px solid ${COLORS.border}`, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) minmax(0, 1.5fr)', gap: '32px', alignItems: 'center' }}>
        <div>
          <SmallCaps style={{ color: COLORS.accent }}>A structural footnote · Ballot Position №1</SmallCaps>
          <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '14px', color: COLORS.text, margin: '8px 0 0', lineHeight: 1.6 }}>
            The candidate listed first on an EVM enjoys a measurable behavioral advantage. Of 234 №1 slots, <strong style={{ color: COLORS.accent }}>74 go to NTK</strong>, a quiet consequence of Tamil alphabetical ordering.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: '100px' }}>
          {POS1.map(p => (
            <div key={p.code} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ background: COLORS.text, height: `${(p.count / 74) * 80}px`, marginBottom: '6px' }} />
              <div style={{ fontFamily: MONO, fontSize: '9px', color: COLORS.text, fontWeight: 800 }}>{p.code}</div>
              <div style={{ fontFamily: MONO, fontSize: '10px', color: COLORS.accent, fontWeight: 800 }}>{p.count}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── 2. Decoy Candidates ──────────────────────────────────────────────────
export const DecoyCandidates = () => {
  const isMobile = useIsMobile();
  return (
    <section style={{ margin: '60px 0' }}>
      <div style={{ borderTop: `2px solid ${COLORS.text}` }} />
      <SectionTitle kicker="Reading the 2026 ballot · №2 of 5">The Decoy Candidates.</SectionTitle>
      <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '15px', color: COLORS.muted, margin: '-8px 0 32px', maxWidth: '820px', lineHeight: 1.6 }}>
        A documented tactic: file a candidate with the same first name as a frontrunner, assign them a different symbol, and hope that votes drop into the wrong column. The 2026 Tamil Nadu ballot has at least two obvious cases targeting TVK president Vijay.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        <div style={{ background: '#f5ead8', padding: '24px', border: `1.5px solid ${COLORS.text}`, borderLeft: `6px solid #8a2020` }}>
          <SmallCaps style={{ color: '#8a2020' }}>AC 12 · Perambur · Three "Vijay"s</SmallCaps>
          <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '13px', color: COLORS.text, margin: '8px 0 20px', lineHeight: 1.5 }}>
            The real Vijay (TVK) is party president. Two other namesake candidates share the ballot.
          </p>
          {[
            {no: 14, name: 'Vijay', party: 'All India Jananayaka Makkal Kazhagam', sym: 'Road Roller', real: false},
            {no: 16, name: 'C. Joseph Vijay', party: 'Tamilaga Vettri Kazhagam', sym: 'Whistle', real: true},
            {no: 42, name: 'G. Vijay', party: 'Independent', sym: 'Gramophone', real: false},
          ].map(c => (
            <div key={c.no} style={{
              display: 'grid', gridTemplateColumns: '40px 1fr', gap: '12px', alignItems: 'center',
              padding: '12px',
              background: c.real ? '#fff' : '#faf4e8',
              border: c.real ? '2.5px solid #8a2020' : '1px dashed #6b5d52',
              marginBottom: '8px',
            }}>
              <span style={{ fontFamily: MONO, fontSize: '12px', color: COLORS.muted, fontWeight: 800 }}>№{c.no}</span>
              <div>
                <div style={{ fontFamily: SERIF, fontSize: '16px', fontWeight: 900, fontStyle: 'italic', color: c.real ? '#8a2020' : COLORS.text }}>{c.name}{c.real && ' ★'}</div>
                <div style={{ fontFamily: MONO, fontSize: '9px', color: COLORS.muted, marginTop: '2px' }}>{c.party} · <span style={{ color: COLORS.accent }}>{c.sym}</span></div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: '#f5ead8', padding: '24px', border: `1.5px solid ${COLORS.text}`, borderLeft: `6px solid #8a2020` }}>
          <SmallCaps style={{ color: '#8a2020' }}>AC 141 · Tiruchirappalli East · Vijay's second seat</SmallCaps>
          <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '13px', color: COLORS.text, margin: '8px 0 20px', lineHeight: 1.5 }}>
            A namesake candidate with the same "All India Jananayaka Makkal Kazhagam" party targets Vijay's second seat.
          </p>
          {[
            {no: 11, name: 'K. Vijay', party: 'All India Jananayaka Makkal Kazhagam', sym: 'Trumpet', real: false},
            {no: 13, name: 'C. Joseph Vijay', party: 'Tamilaga Vettri Kazhagam', sym: 'Whistle', real: true},
          ].map(c => (
            <div key={c.no} style={{
              display: 'grid', gridTemplateColumns: '40px 1fr', gap: '12px', alignItems: 'center',
              padding: '12px',
              background: c.real ? '#fff' : '#faf4e8',
              border: c.real ? '2.5px solid #8a2020' : '1px dashed #6b5d52',
              marginBottom: '8px',
            }}>
              <span style={{ fontFamily: MONO, fontSize: '12px', color: COLORS.muted, fontWeight: 800 }}>№{c.no}</span>
              <div>
                <div style={{ fontFamily: SERIF, fontSize: '16px', fontWeight: 900, fontStyle: 'italic', color: c.real ? '#8a2020' : COLORS.text }}>{c.name}{c.real && ' ★'}</div>
                <div style={{ fontFamily: MONO, fontSize: '9px', color: COLORS.muted, marginTop: '2px' }}>{c.party} · <span style={{ color: COLORS.accent }}>{c.sym}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── 3. Women on the Ballot ───────────────────────────────────────────────

// Runtime tallies from candidates_myneta.json (where `g='F'` is grounded in
// MyNeta's curated women-candidate listing). Returns alliance and party
// rollups joined with the presentation metadata above; both arrays are
// sorted by descending %women so the rendered bar charts stack tallest-first.
function useWomenStats() {
  return useMemo(() => {
    const allianceTally: Record<string, { women: number; total: number }> = {};
    const partyTally: Record<string, { women: number; total: number }> = {};
    let totalWomen = 0;
    let totalContesting = 0;

    for (const [acNo, list] of Object.entries(candidatesMyneta as any)) {
      const eciList = (candidatesData as any)[acNo] || [];
      for (const c of list as any[]) {
        const eci = eciList[c.i];
        if (!eci) continue;
        const party = eci.party || '';
        const p = (partiesData as any)[party];
        const alliance = (p && p.alliance) || (party === 'IND' ? 'IND' : 'OTH');
        const isW = c.g === 'F';

        (allianceTally[alliance] ??= { women: 0, total: 0 }).total += 1;
        if (isW) allianceTally[alliance].women += 1;

        (partyTally[party] ??= { women: 0, total: 0 }).total += 1;
        if (isW) partyTally[party].women += 1;

        totalContesting += 1;
        if (isW) totalWomen += 1;
      }
    }

    const pct = (w: number, t: number) => (t > 0 ? (w * 100) / t : 0);

    const alliance = ALLIANCE_WOMEN_META.map(m => {
      const t = allianceTally[m.code] ?? { women: 0, total: 0 };
      return { ...m, women: t.women, total: t.total, pct: pct(t.women, t.total) };
    }).sort((a, b) => b.pct - a.pct);

    const party = PARTY_WOMEN_META.map(m => {
      const t = partyTally[m.code] ?? { women: 0, total: 0 };
      return { ...m, women: t.women, total: t.total, pct: pct(t.women, t.total) };
    }).sort((a, b) => b.pct - a.pct);

    return { alliance, party, totalWomen, totalContesting };
  }, []);
}

export const WomenOnBallot = () => {
  const isMobile = useIsMobile();
  const stats = useWomenStats();
  const maxAllianceP = stats.alliance[0]?.pct || 1;
  const maxPartyP = stats.party[0]?.pct || 1;

  return (
    <section style={{ margin: '60px 0' }}>
      <div style={{ borderTop: `2px solid ${COLORS.text}` }} />
      <SectionTitle kicker="Reading the 2026 ballot · №3 of 5">Women on the Ballot.</SectionTitle>
      <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '15px', color: COLORS.muted, margin: '-8px 0 32px', maxWidth: '820px', lineHeight: 1.6 }}>
        <strong style={{ color: COLORS.accent }}>1,380 of the 7,599 nomination forms (18.2%) were filed by women</strong>, per the Tamil Nadu CEO. The two-stage filter — Returning-Officer scrutiny then voluntary withdrawal — narrows that figure further: MyNeta&rsquo;s curated women-candidate listing identifies <strong style={{ color: COLORS.accent }}>{stats.totalWomen} of {stats.totalContesting.toLocaleString('en-IN')} contestants</strong> ({(stats.totalWomen * 100 / Math.max(1, stats.totalContesting)).toFixed(1)}%) as women. The shares below are computed from that listing.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(360px, 1fr))', gap: '40px' }}>
        <div>
          <SmallCaps style={{ color: COLORS.accent, marginBottom: '20px', display: 'block' }}>By Alliance · Share of women candidates</SmallCaps>
          {stats.alliance.map(a => (
            <div key={a.code} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                <span style={{ fontFamily: MONO, fontSize: '11px', color: COLORS.text, fontWeight: 800 }}>{a.label}</span>
                <span style={{ fontFamily: MONO, fontSize: '11px', color: onCream(a.color), fontWeight: 800 }}>{a.pct.toFixed(1)}%</span>
              </div>
              <div style={{ background: '#f5ead8', height: '20px', border: `1px solid ${COLORS.border}` }}>
                <div style={{ width: `${(a.pct / maxAllianceP) * 100}%`, height: '100%', background: a.color }} />
              </div>
            </div>
          ))}
        </div>

        <div>
          <SmallCaps style={{ color: COLORS.accent, marginBottom: '20px', display: 'block' }}>By Party · Ranked by % women</SmallCaps>
          {stats.party.map(p => (
            <div key={p.code} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 60px', gap: '12px', alignItems: 'center' }}>
                <span style={{ fontFamily: MONO, fontSize: '10px', color: onCream(p.color), fontWeight: 800 }}>{p.code}</span>
                <div style={{ background: '#f5ead8', height: '16px', border: `1px solid ${COLORS.border}` }}>
                  <div style={{ width: `${(p.pct / maxPartyP) * 100}%`, height: '100%', background: p.color }} />
                </div>
                <span style={{ fontFamily: MONO, fontSize: '11px', color: COLORS.text, fontWeight: 800, textAlign: 'right' }}>{p.pct.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '36px', padding: '20px 24px', background: '#f5ead8', border: `1.5px solid ${COLORS.border}` }}>
        <SmallCaps style={{ color: COLORS.accent }}>Women contestants by alliance</SmallCaps>
        <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '12px', color: COLORS.muted, margin: '4px 0 14px' }}>
          From MyNeta&rsquo;s curated 442-name women-candidate listing, joined to the alliance buckets used elsewhere on this page. NTK delivered on its announced 117-women pledge in full — half its slate, against ~11% for every other alliance.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px 18px' }}>
          {stats.alliance.map(a => (
            <div key={a.code}>
              <div style={{ fontFamily: MONO, fontSize: '10px', letterSpacing: '0.08em', color: COLORS.muted, fontWeight: 700 }}>
                {a.label.toUpperCase()}
              </div>
              <div style={{ fontFamily: SERIF, fontSize: '22px', fontWeight: 800, color: onCream(a.color), fontFeatureSettings: '"tnum" 1', marginTop: '2px' }}>
                {a.women}
              </div>
              <div style={{ fontFamily: MONO, fontSize: '10px', color: COLORS.muted, letterSpacing: '0.05em' }}>
                of {a.total} contesting
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── 4. Beyond the Big Four ────────────────────────────────────────────────
export const BeyondBigFour = () => {
  const isMobile = useIsMobile();
  return (
    <section style={{ margin: '60px 0' }}>
      <div style={{ borderTop: `2px solid ${COLORS.text}` }} />
      <SectionTitle kicker="Reading the 2026 ballot · №4 of 5">Beyond the Big Four.</SectionTitle>
      <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '15px', color: COLORS.muted, margin: '-8px 0 32px', maxWidth: '820px', lineHeight: 1.6 }}>
        Outside the headline four-way contest, 880 candidates across ~95 smaller parties are vying for attention — many fielding significant slates.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {THIRD_FRONT.map(p => (
          <div key={p.code} style={{ background: '#faf4e8', border: `1.5px solid ${COLORS.text}`, borderTop: `6px solid ${p.color}`, padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <SmallCaps style={{ color: onCream(p.color), fontSize: '10px' }}>{p.code}</SmallCaps>
              <div style={{ fontFamily: SERIF, fontSize: '36px', fontWeight: 900, fontStyle: 'italic', color: onCream(p.color), lineHeight: 1 }}>{p.seats}</div>
            </div>
            <h3 style={{ fontFamily: SERIF, fontSize: '18px', fontWeight: 900, fontStyle: 'italic', margin: '0 0 4px', color: COLORS.text }}>{p.full}</h3>
            <div style={{ fontFamily: MONO, fontSize: '10px', color: COLORS.muted, marginBottom: '12px' }}>led by {p.leader}</div>
            <p style={{ fontFamily: SERIF, fontSize: '13px', color: COLORS.text, lineHeight: 1.6, margin: 0 }}>{p.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

// ─── 5. Symbol Menagerie ───────────────────────────────────────────────────
export const SymbolMenagerie = () => {
  const isMobile = useIsMobile();
  return (
    <section style={{ margin: '60px 0' }}>
      <div style={{ borderTop: `2px solid ${COLORS.text}` }} />
      <SectionTitle kicker="Reading the 2026 ballot · №5 of 5">The Symbol Menagerie.</SectionTitle>
      <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '15px', color: COLORS.muted, margin: '-8px 0 32px', maxWidth: '820px', lineHeight: 1.6 }}>
        Tamil Nadu's 2026 ballot draws on 181 distinct free symbols. A selection of the most peculiar — marks for candidates to be identified without reading.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(auto-fill, minmax(160px, 1fr))' : 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '2px',
        background: COLORS.text,
        border: `1.5px solid ${COLORS.text}`,
      }}>
        {MENAGERIE.map((m, i) => (
          <div key={i} style={{
            background: i % 3 === 0 ? '#faf4e8' : i % 3 === 1 ? '#f5ead8' : '#f0dfc5',
            padding: '20px',
            minHeight: '160px',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div>
              <SmallCaps style={{ color: COLORS.accent, fontSize: '9px', marginBottom: '8px', display: 'block' }}>SYMBOL</SmallCaps>
              <div style={{
                fontFamily: SERIF, fontStyle: 'italic', fontWeight: 900,
                fontSize: m.symbol.length > 15 ? '18px' : '24px',
                color: COLORS.text, lineHeight: 1.1, letterSpacing: '-0.02em',
              }}>{m.symbol.toUpperCase()}</div>
            </div>
            <div style={{ borderTop: `1px dashed ${COLORS.accent}`, paddingTop: '10px' }}>
              <div style={{ fontFamily: MONO, fontSize: '9px', color: COLORS.muted, fontWeight: 700 }}>AC №{String(m.ac).padStart(3, '0')} · {m.acName}</div>
              <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '12px', fontWeight: 900, color: COLORS.text, marginTop: '2px' }}>{m.name}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
