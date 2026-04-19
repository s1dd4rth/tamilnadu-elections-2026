"use client";

import React, { useState, useMemo } from 'react';
import { SERIF, MONO, COLORS } from '@/styles/theme';
import { SmallCaps, SectionTitle } from './common';
import { fmtIndian } from '@/utils/format';
import acsData from '@/data/acs.json';
import candidatesData from '@/data/candidates_by_ac.json';
import partiesData from '@/data/parties.json';
import { useIsMobile } from '@/hooks/useMediaQuery';

const ALLIANCES: any = {
  SPA: { name: 'Secular Progressive Alliance', color: '#d32a1e', leader: 'M.K. Stalin' },
  NDA: { name: 'National Democratic Alliance', color: '#0c7a3a', leader: 'Edappadi K. Palaniswami' },
  TVK: { name: 'Tamilaga Vettri Kazhagam', color: '#8a2020', leader: 'Vijay' },
  NTK: { name: 'Naam Tamilar Katchi', color: '#d8a520', leader: 'Seeman' },
  OTH: { name: 'Others', color: '#6b5d52' },
  IND: { name: 'Independents', color: '#6b5d52' }
};

const CandidateCard = ({ candidate, ballotNo }: any) => {
  const p = (partiesData as any)[candidate.party] || { full: candidate.party, color: '#6b5d52' };
  return (
    <div style={{
      background: COLORS.background,
      border: `1.5px solid ${COLORS.text}`,
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        background: COLORS.text,
        color: COLORS.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: MONO,
        fontSize: '18px',
        fontWeight: 800
      }}>
        {ballotNo}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <h4 style={{ fontFamily: SERIF, fontSize: '18px', fontWeight: 800, margin: 0, color: COLORS.text }}>
          {candidate.name}
        </h4>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline', marginTop: '2px', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: MONO, fontSize: '10px', fontWeight: 700, color: p.color, letterSpacing: '0.05em' }}>
            {candidate.party}
          </span>
          <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '12px', color: COLORS.muted }}>
            {p.full}
          </span>
        </div>
        {candidate.symbol && (
          <div style={{ 
            marginTop: '4px', 
            fontFamily: MONO, 
            fontSize: '9px', 
            textTransform: 'uppercase', 
            color: COLORS.accent, 
            fontWeight: 700,
            letterSpacing: '0.05em'
          }}>
            Symbol: {candidate.symbol}
          </div>
        )}
      </div>
    </div>
  );
};

const CandidatePanel = ({ ac, onClose }: any) => {
  if (!ac) return null;
  const isMobile = useIsMobile();
  const candidates = (candidatesData as any)[ac.no] || [];
  const femalePct = ((ac.f / ac.total) * 100).toFixed(1);

  const grouped = useMemo(() => {
    const g: any = { SPA: [], NDA: [], TVK: [], NTK: [], OTH: [], IND: [] };
    candidates.forEach((c: any) => {
      const p = (partiesData as any)[c.party];
      const alliance = (p && p.alliance) || (c.party === 'IND' ? 'IND' : 'OTH');
      (g[alliance] || g.OTH).push(c);
    });
    return g;
  }, [ac.no]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(26, 20, 16, 0.85)',
        display: 'flex',
        alignItems: isMobile ? 'flex-end' : 'flex-start',
        justifyContent: 'center',
        padding: isMobile ? '0' : '40px 16px',
        zIndex: 9999,
        overflowY: 'auto'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#faf4e8',
          maxWidth: '760px',
          width: '100%',
          border: `2px solid ${COLORS.text}`,
          borderBottom: isMobile ? 'none' : `2px solid ${COLORS.text}`,
          borderRadius: isMobile ? '24px 24px 0 0' : '0',
          boxShadow: '0 20px 60px rgba(26,20,16,0.35)',
          overflow: 'hidden'
        }}
      >
        <div style={{
          background: COLORS.text,
          color: COLORS.background,
          padding: isMobile ? '24px' : '18px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '20px',
        }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: MONO, fontSize: '11px', letterSpacing: '0.18em', color: '#d4a080', fontWeight: 600 }}>
              AC №{String(ac.no).padStart(3, '0')} · {ac.d}{ac.t !== 'GEN' ? ` · ${ac.t}` : ''}
            </div>
            <h2 style={{ fontFamily: SERIF, fontSize: isMobile ? '28px' : '32px', fontWeight: 900, fontStyle: 'italic', margin: '4px 0 0', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              {ac.n}
            </h2>
            <div style={{ fontFamily: MONO, fontSize: '10px', letterSpacing: '0.12em', color: '#d4a080', marginTop: '6px', fontWeight: 600 }}>
              {fmtIndian(ac.total)} ELECTORS · ♀ {femalePct}%
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid #d4a080',
              color: '#d4a080',
              fontFamily: MONO,
              fontSize: '11px',
              letterSpacing: '0.15em',
              padding: '6px 12px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {isMobile ? '✕' : '✕ CLOSE'}
          </button>
        </div>

        <div style={{ padding: '22px 24px' }}>
          {candidates.length === 0 ? (
            <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '16px', color: COLORS.muted }}>
              No candidate data available for this constituency yet.
            </p>
          ) : (
            Object.keys(grouped).map(alliance => {
              const group = grouped[alliance];
              if (group.length === 0) return null;
              const meta = ALLIANCES[alliance];
              return (
                <div key={alliance} style={{ marginBottom: '24px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '10px',
                    marginBottom: '12px',
                    paddingBottom: '5px',
                    borderBottom: `2px solid ${meta?.color || COLORS.muted}`,
                  }}>
                    <span style={{
                      fontFamily: MONO,
                      fontSize: '11px',
                      letterSpacing: '0.18em',
                      color: meta?.color || COLORS.muted,
                      fontWeight: 700,
                    }}>
                      {meta?.name.toUpperCase() || alliance} · {group.length}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
                    {group.map((c: any, idx: number) => (
                      <CandidateCard key={idx} candidate={c} ballotNo={c.sl || idx + 1} />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export const ACExplorer = () => {
  const [filter, setFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [sortKey, setSortKey] = useState('no');
  const [selectedAc, setSelectedAc] = useState<any>(null);

  const isMobile = useIsMobile();

  const filtered = useMemo(() => {
    let matches = acsData.filter((ac: any) => {
      const q = filter.toLowerCase();
      const matchText = !q || ac.n.toLowerCase().includes(q) || ac.d.toLowerCase().includes(q) || String(ac.no) === q;
      const matchType = typeFilter === 'ALL' || ac.t === typeFilter;
      return matchText && matchType;
    });
    
    if (sortKey === 'total') matches = [...matches].sort((a, b) => b.total - a.total);
    if (sortKey === 'female') matches = [...matches].sort((a, b) => (b.f / b.total) - (a.f / a.total));
    if (sortKey === 'no') matches = [...matches].sort((a, b) => a.no - b.no);
    
    return matches;
  }, [filter, typeFilter, sortKey]);

  return (
    <section style={{ margin: '48px 0' }}>
      <div style={{ borderTop: `2px solid ${COLORS.text}` }} />
      <SectionTitle kicker={`showing ${filtered.length} of 234`}>
        All 234 Constituencies.
      </SectionTitle>

      <div style={{ 
        display: 'flex', 
        gap: '14px', 
        marginBottom: '24px', 
        alignItems: 'center', 
        flexDirection: isMobile ? 'column' : 'row' 
      }}>
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by name, district or number..."
          style={{
            width: '100%',
            flex: isMobile ? 'none' : '1 1 260px',
            padding: '12px 16px',
            background: '#fff9ef',
            border: `1.5px solid ${COLORS.text}`,
            fontFamily: SERIF,
            fontSize: '16px',
            outline: 'none'
          }}
        />
        <div style={{ display: 'flex', width: isMobile ? '100%' : 'auto', border: `1.5px solid ${COLORS.text}` }}>
          {['ALL', 'GEN', 'SC', 'ST'].map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} style={{
              flex: isMobile ? 1 : 'none',
              padding: '10px 14px',
              background: typeFilter === t ? COLORS.text : 'transparent',
              color: typeFilter === t ? COLORS.background : COLORS.text,
              border: 'none',
              borderRight: t !== 'ST' ? `1px solid ${COLORS.text}` : 'none',
              fontFamily: MONO,
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
            }}>{t}</button>
          ))}
        </div>
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value)}
          style={{
            width: isMobile ? '100%' : 'auto',
            padding: '12px 16px',
            background: '#fff9ef',
            border: `1.5px solid ${COLORS.text}`,
            fontFamily: MONO,
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <option value="no">By Number</option>
          <option value="total">By Electorate</option>
          <option value="female">By Female %</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {filtered.slice(0, 50).map((ac: any) => (
          <div
            key={ac.no}
            onClick={() => setSelectedAc(ac)}
            style={{
              background: '#fff9ef',
              border: `1.5px solid ${COLORS.text}`,
              padding: '16px',
              cursor: 'pointer',
              transition: 'transform 100ms ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <SmallCaps style={{ color: COLORS.accent, fontSize: '10px' }}>№{ac.no} · {ac.d}</SmallCaps>
              <SmallCaps style={{ color: COLORS.muted, fontSize: '9px' }}>{ac.t}</SmallCaps>
            </div>
            <h3 style={{ fontFamily: SERIF, fontSize: '22px', fontWeight: 800, margin: '4px 0 8px' }}>{ac.n}</h3>
            <div style={{ fontFamily: MONO, fontSize: '13px', fontWeight: 700 }}>{fmtIndian(ac.total)}</div>
          </div>
        ))}
      </div>
      
      {filtered.length > 50 && (
        <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '14px', color: COLORS.muted, marginTop: '20px', textAlign: 'center' }}>
          (Showing first 50 results. Use the filter to find specific constituencies.)
        </p>
      )}

      {selectedAc && <CandidatePanel ac={selectedAc} onClose={() => setSelectedAc(null)} />}

      <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '11px', color: COLORS.muted, marginTop: '32px', textAlign: 'right', lineHeight: 1.5 }}>
        Complete 2026 candidate data sourced from the ECI constituency-wise filing aggregate — 4,023 candidates across all 234 constituencies. 105 parties including 2,208 independents. Per-candidate EVM symbol preserved.
      </p>
    </section>
  );
};
