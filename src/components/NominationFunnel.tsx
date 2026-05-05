"use client";

import React, { useMemo } from 'react';
import { SERIF, MONO, COLORS } from '@/styles/theme';
import { SmallCaps, SectionTitle } from './common';
import { fmtIndian } from '@/utils/format';
import nominations from '@/data/nominations.json';
import acsData from '@/data/acs.json';
import candidatesData from '@/data/candidates_by_ac.json';
import { useIsMobile } from '@/hooks/useMediaQuery';

type NomRow = {
  no: number;
  n_raw: string;
  male: number;
  female: number;
  thirdGender: number;
  filed: number;
  rejected: number;
  accepted: number;
  withdrawn: number;
  contesting: number;
};

function useFunnelData() {
  return useMemo(() => {
    const acByNo = new Map((acsData as any[]).map(a => [a.no, a]));
    const rows = (nominations as NomRow[]).map(n => {
      const ac = acByNo.get(n.no) || {};
      const list = (candidatesData as any)[String(n.no)] || [];
      const indCount = list.filter((c: any) => c.party === 'IND').length;
      const indShare = list.length ? (indCount / list.length) * 100 : 0;
      return {
        ...n,
        name: ac.n || n.n_raw,
        district: ac.d || '',
        rejPct: n.filed ? (n.rejected / n.filed) * 100 : 0,
        wdPct: n.accepted ? (n.withdrawn / n.accepted) * 100 : 0,
        indShare,
        indCount,
      };
    });

    const totals = {
      filed:      rows.reduce((s, r) => s + r.filed, 0),
      rejected:   rows.reduce((s, r) => s + r.rejected, 0),
      accepted:   rows.reduce((s, r) => s + r.accepted, 0),
      withdrawn:  rows.reduce((s, r) => s + r.withdrawn, 0),
      contesting: rows.reduce((s, r) => s + r.contesting, 0),
      male:       rows.reduce((s, r) => s + r.male, 0),
      female:     rows.reduce((s, r) => s + r.female, 0),
      thirdGender:rows.reduce((s, r) => s + r.thirdGender, 0),
    };
    const stateRejPct = totals.filed ? (totals.rejected / totals.filed) * 100 : 0;
    const stateWdPct  = totals.accepted ? (totals.withdrawn / totals.accepted) * 100 : 0;

    // Quartile analysis: rejection rate by IND-share quartile.
    const sortedByInd = [...rows].sort((a, b) => a.indShare - b.indShare);
    const q = Math.floor(sortedByInd.length / 4);
    const quartiles = [0, 1, 2, 3].map(i => {
      const slice = i < 3 ? sortedByInd.slice(i * q, (i + 1) * q) : sortedByInd.slice(i * q);
      return {
        avgInd: slice.reduce((s, r) => s + r.indShare, 0) / slice.length,
        avgRej: slice.reduce((s, r) => s + r.rejPct, 0) / slice.length,
        n: slice.length,
      };
    });

    const topReject = [...rows].sort((a, b) => b.rejPct - a.rejPct).slice(0, 5);
    const topWithdraw = [...rows].sort((a, b) => b.wdPct - a.wdPct).slice(0, 5);

    // ACs that received any third-gender nomination filing (Form-7A).
    const thirdGenderAcs = rows
      .filter(r => (r.thirdGender ?? 0) > 0)
      .map(r => ({ no: r.no, name: r.name, count: r.thirdGender }))
      .sort((a, b) => b.count - a.count);

    return { totals, stateRejPct, stateWdPct, quartiles, topReject, topWithdraw, rows, thirdGenderAcs };
  }, []);
}

export const NominationFunnel = () => {
  const isMobile = useIsMobile();
  const { totals, stateRejPct, stateWdPct, quartiles, topReject, topWithdraw, thirdGenderAcs } = useFunnelData();

  const filedW = 100;
  const acceptedW = (totals.accepted / totals.filed) * 100;
  const contestW = (totals.contesting / totals.filed) * 100;
  const maxQRej = Math.max(...quartiles.map(q => q.avgRej));
  const maxRej = topReject[0]?.rejPct || 1;
  const maxWd  = topWithdraw[0]?.wdPct || 1;

  return (
    <section style={{ margin: '60px 0' }}>
      <div style={{ borderTop: `2px solid ${COLORS.text}` }} />
      <SectionTitle kicker="The Filings, the Filter, the Final Ballot">The Nomination Funnel.</SectionTitle>
      <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '15px', color: COLORS.muted, margin: '-8px 0 32px', maxWidth: '820px', lineHeight: 1.6 }}>
        Of <strong style={{ color: COLORS.accent }}>{fmtIndian(totals.filed)}</strong> nomination forms filed across Tamil Nadu's 234 constituencies, only {fmtIndian(totals.contesting)} candidates made it to the EVM. The Returning Officers' scrutiny rejected {fmtIndian(totals.rejected)} ({stateRejPct.toFixed(1)}%); another {fmtIndian(totals.withdrawn)} accepted candidates withdrew before the deadline ({stateWdPct.toFixed(1)}% of accepted).
      </p>

      {/* Funnel bars */}
      <div style={{ background: '#fff9ef', border: `1.5px solid ${COLORS.text}`, padding: isMobile ? '20px 16px' : '32px', boxShadow: '6px 6px 0 rgba(26,20,16,0.05)' }}>
        {[
          { label: 'Filed',      date: 'Nominations submitted',          value: totals.filed,      width: filedW,    color: COLORS.text },
          { label: 'Accepted',   date: 'After Returning Officer scrutiny', value: totals.accepted,   width: acceptedW, color: COLORS.muted },
          { label: 'Contesting', date: 'After withdrawals',              value: totals.contesting, width: contestW,  color: COLORS.accent },
        ].map((s, i) => (
          <div key={s.label} style={{ marginBottom: i < 2 ? '24px' : 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span style={{ fontFamily: SERIF, fontSize: '20px', fontWeight: 800, color: COLORS.text, fontStyle: 'italic' }}>{s.label}</span>
                <span style={{ fontFamily: MONO, fontSize: '10px', color: COLORS.muted, marginLeft: '12px', letterSpacing: '0.15em', fontWeight: 600, textTransform: 'uppercase' }}>{s.date}</span>
              </div>
              <span style={{ fontFamily: SERIF, fontSize: '24px', fontWeight: 900, color: s.color, fontFeatureSettings: '"tnum" 1' }}>
                {fmtIndian(s.value)}
              </span>
            </div>
            <div style={{ background: '#e8dccb', height: '16px', border: `1px solid ${COLORS.text}` }}>
              <div style={{ width: `${s.width}%`, height: '100%', background: s.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Statewide gender breakdown of filings (CEO Form-7A) */}
      {totals.thirdGender > 0 && (
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          background: '#faf4e8',
          border: `1px solid ${COLORS.border}`,
          fontFamily: SERIF,
          fontStyle: 'italic',
          fontSize: '13px',
          lineHeight: 1.55,
          color: COLORS.muted,
          maxWidth: '820px',
        }}>
          <strong style={{ color: COLORS.text, fontStyle: 'normal', fontFamily: MONO, fontSize: '10px', letterSpacing: '0.1em', display: 'block', marginBottom: '4px', fontWeight: 800 }}>
            BY GENDER · {fmtIndian(totals.male)} M · {fmtIndian(totals.female)} F · {totals.thirdGender} TG
          </strong>
          Of {fmtIndian(totals.filed)} filings, just {totals.thirdGender} were third-gender — {thirdGenderAcs.map((a, i) => (
            <span key={a.no}>
              {i > 0 && (i === thirdGenderAcs.length - 1 ? ' and ' : ', ')}
              {a.count} in <strong style={{ color: COLORS.text, fontStyle: 'normal' }}>{a.name}</strong>
            </span>
          ))}. Only one — Roshini S, NTK&rsquo;s nominee from Villivakkam — survived scrutiny and withdrawal to reach the EVM under a party banner.
        </div>
      )}

      {/* Counter-intuitive insight: pull-quote treatment */}
      <figure style={{ margin: '48px 0 0' }}>
        <div style={{
          background: COLORS.text,
          color: COLORS.background,
          padding: isMobile ? '32px 24px' : '52px 56px',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            top: isMobile ? '8px' : '14px',
            left: isMobile ? '14px' : '24px',
            fontFamily: SERIF,
            fontSize: isMobile ? '60px' : '120px',
            fontStyle: 'italic',
            fontWeight: 900,
            color: COLORS.accent,
            lineHeight: 0.7,
            opacity: 0.45,
            pointerEvents: 'none',
            userSelect: 'none',
          }}>“</div>
          <div style={{ position: 'relative', maxWidth: '1000px', margin: '0 auto' }}>
            <SmallCaps style={{ color: '#d4a080', marginBottom: isMobile ? '14px' : '18px' }}>
              The counter-intuitive finding · IND-share quartile vs. rejection rate
            </SmallCaps>
            <blockquote style={{
              fontFamily: SERIF,
              fontStyle: 'italic',
              fontWeight: 900,
              fontSize: isMobile ? 'clamp(26px, 6.6vw, 36px)' : 'clamp(36px, 4.8vw, 56px)',
              lineHeight: 1.1,
              letterSpacing: '-0.025em',
              margin: 0,
              color: COLORS.background,
            }}>
              The more Independents on a ballot,<br />
              the fewer nominations get thrown out.
            </blockquote>
            <p style={{
              fontFamily: SERIF,
              fontStyle: 'italic',
              fontSize: isMobile ? '14px' : '16px',
              color: '#d4a080',
              margin: isMobile ? '20px 0 0' : '26px 0 0',
              maxWidth: '720px',
              lineHeight: 1.55,
            }}>
              Rejection is overwhelmingly procedural — bond, affidavit, oath. Party candidates carry decoy slates and proxies that get scrubbed at scrutiny; lone Independents tend to file once, file straight, and clear the desk.
            </p>
          </div>
        </div>

        {/* Supporting evidence: quartile gradient on cream */}
        <figcaption style={{
          background: '#f5ead8',
          padding: isMobile ? '20px 16px' : '28px',
          borderLeft: `1px solid ${COLORS.text}`,
          borderRight: `1px solid ${COLORS.text}`,
          borderBottom: `1px solid ${COLORS.text}`,
        }}>
          <SmallCaps style={{ color: COLORS.muted, marginBottom: '16px', display: 'block' }}>
            Quartiles of TN's 234 ACs · sorted by share of Independents on the final ballot
          </SmallCaps>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: isMobile ? '12px' : '0', borderLeft: isMobile ? 'none' : `1px solid #d4c9bc` }}>
            {quartiles.map((q, i) => (
              <div key={i} style={{
                padding: isMobile ? '12px' : '4px 18px',
                borderRight: isMobile ? 'none' : `1px solid #d4c9bc`,
                borderBottom: isMobile ? `1px solid #d4c9bc` : 'none',
              }}>
                <div style={{ fontFamily: MONO, fontSize: '10px', letterSpacing: '0.12em', color: COLORS.muted, fontWeight: 700 }}>
                  Q{i + 1}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '6px 0 4px' }}>
                  <span style={{ fontFamily: SERIF, fontSize: isMobile ? '34px' : '42px', fontWeight: 900, fontStyle: 'italic', color: COLORS.text, lineHeight: 1, letterSpacing: '-0.03em', fontFeatureSettings: '"tnum" 1' }}>
                    {q.avgRej.toFixed(0)}<span style={{ fontSize: '60%', color: COLORS.muted, fontWeight: 700 }}>%</span>
                  </span>
                </div>
                <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '12px', color: COLORS.muted, marginBottom: '10px' }}>
                  rejected on average
                </div>
                <div style={{ background: '#e8dccb', height: '10px', border: `1px solid ${COLORS.border}` }}>
                  <div style={{ width: `${(q.avgInd / 100) * 100}%`, height: '100%', background: COLORS.accent }} />
                </div>
                <div style={{ fontFamily: MONO, fontSize: '10px', color: COLORS.text, marginTop: '4px', fontWeight: 700, fontFeatureSettings: '"tnum" 1', letterSpacing: '0.05em' }}>
                  {q.avgInd.toFixed(0)}% IND on ballot · n = {q.n}
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '12px', color: COLORS.muted, margin: '16px 0 0', lineHeight: 1.55 }}>
            Read across: as the IND share of the ballot rises (orange bars lengthen), the rejection rate falls — from {quartiles[0].avgRej.toFixed(1)}% in party-heavy seats to {quartiles[3].avgRej.toFixed(1)}% in IND-flooded ones.
          </p>
        </figcaption>
      </figure>

      {/* Outlier ACs */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) minmax(0, 1fr)', gap: '32px', marginTop: '40px', alignItems: 'start' }}>
        <div>
          <SmallCaps style={{ color: COLORS.accent, marginBottom: '14px', display: 'block' }}>Highest rejection rate · Top 5 ACs</SmallCaps>
          {topReject.map((r, i) => (
            <div key={r.no} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 70px', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontFamily: MONO, fontSize: '11px', color: COLORS.muted, fontWeight: 700, textAlign: 'right' }}>{i + 1}.</span>
              <div>
                <div style={{ fontFamily: SERIF, fontSize: '15px', fontWeight: 800, color: COLORS.text, lineHeight: 1.15 }}>
                  {r.name}
                </div>
                <div style={{ fontFamily: MONO, fontSize: '10px', color: COLORS.muted, marginTop: '2px' }}>
                  AC {r.no} · {r.filed} filed → {r.contesting} on ballot
                </div>
                <div style={{ marginTop: '4px', background: '#f5ead8', height: '6px', border: `1px solid ${COLORS.border}` }}>
                  <div style={{ width: `${(r.rejPct / maxRej) * 100}%`, height: '100%', background: COLORS.accent }} />
                </div>
              </div>
              <span style={{ fontFamily: MONO, fontSize: '13px', color: COLORS.accent, fontWeight: 800, textAlign: 'right', fontFeatureSettings: '"tnum" 1' }}>
                {r.rejPct.toFixed(0)}%
              </span>
            </div>
          ))}
          <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '12px', color: COLORS.muted, marginTop: '12px', lineHeight: 1.5 }}>
            <strong style={{ color: COLORS.text, fontStyle: 'normal' }}>Ambasamudram</strong> threw out 32 of 38 nominations — leaving only five contestants on its EVM. The ballot's smallest seat by candidate count, by way of the cutting-room floor.
          </p>
        </div>

        <div>
          <SmallCaps style={{ color: COLORS.accent, marginBottom: '14px', display: 'block' }}>Highest withdrawal rate · Top 5 ACs</SmallCaps>
          {topWithdraw.map((r, i) => (
            <div key={r.no} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 70px', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontFamily: MONO, fontSize: '11px', color: COLORS.muted, fontWeight: 700, textAlign: 'right' }}>{i + 1}.</span>
              <div>
                <div style={{ fontFamily: SERIF, fontSize: '15px', fontWeight: 800, color: COLORS.text, lineHeight: 1.15 }}>
                  {r.name}
                </div>
                <div style={{ fontFamily: MONO, fontSize: '10px', color: COLORS.muted, marginTop: '2px' }}>
                  AC {r.no} · {r.accepted} accepted, {r.withdrawn} withdrew
                </div>
                <div style={{ marginTop: '4px', background: '#f5ead8', height: '6px', border: `1px solid ${COLORS.border}` }}>
                  <div style={{ width: `${(r.wdPct / maxWd) * 100}%`, height: '100%', background: COLORS.text }} />
                </div>
              </div>
              <span style={{ fontFamily: MONO, fontSize: '13px', color: COLORS.text, fontWeight: 800, textAlign: 'right', fontFeatureSettings: '"tnum" 1' }}>
                {r.wdPct.toFixed(0)}%
              </span>
            </div>
          ))}
          <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '12px', color: COLORS.muted, marginTop: '12px', lineHeight: 1.5 }}>
            High late-stage withdrawal usually signals a tactical alliance settlement after the scrutiny cut-off — names cleared by the RO but pulled before the bell.
          </p>
        </div>
      </div>

      <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '11px', color: COLORS.muted, margin: '28px 0 0', textAlign: 'right' }}>
        Per-AC nomination ledger sourced from the Tamil Nadu Chief Electoral Officer's official nomination spreadsheet (TNLA2026).
      </p>
    </section>
  );
};
