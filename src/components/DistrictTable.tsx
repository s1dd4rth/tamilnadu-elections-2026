"use client";

import React, { useState, useMemo } from 'react';
import { SERIF, MONO, COLORS } from '@/styles/theme';
import { SmallCaps, SectionTitle } from './common';
import { fmtIndian } from '@/utils/format';
import districtsData from '@/data/districts.json';
import stateData from '@/data/state.json';

export const DistrictTable = () => {
  const [sortBy, setSortBy] = useState<string>('total');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const sorted = useMemo(() => {
    const dir = sortDir === 'desc' ? -1 : 1;
    return [...districtsData].sort((a: any, b: any) => {
      if (typeof a[sortBy] === 'string') return dir * a[sortBy].localeCompare(b[sortBy]);
      return dir * (a[sortBy] - b[sortBy]);
    });
  }, [sortBy, sortDir]);

  const toggleSort = (field: string) => {
    if (sortBy === field) setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
    else { setSortBy(field); setSortDir('desc'); }
  };

  const Th = ({ field, label, align = 'left' }: any) => (
    <th onClick={() => toggleSort(field)} style={{
      cursor: 'pointer',
      textAlign: align,
      padding: '12px 8px',
      borderBottom: `2.5px solid ${COLORS.text}`,
      userSelect: 'none',
      background: '#f5ead8',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      <SmallCaps style={{ color: COLORS.text, fontSize: '10px' }}>
        {label} {sortBy === field && (sortDir === 'desc' ? '▼' : '▲')}
      </SmallCaps>
    </th>
  );

  return (
    <section style={{ margin: '48px 0' }}>
      <div style={{ borderTop: `2px solid ${COLORS.text}` }} />
      <SectionTitle kicker="38 entries · sort any column">
        The League of Districts.
      </SectionTitle>

      <div style={{ overflow: 'auto', border: `1.5px solid ${COLORS.text}`, maxHeight: '600px', boxShadow: '6px 6px 0 rgba(26,20,16,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: SERIF, minWidth: '700px' }}>
          <thead>
            <tr>
              <Th field="name" label="District" />
              <Th field="tag" label="Character" />
              <Th field="total" label="Electorate" align="right" />
              <Th field="f" label="Women" align="right" />
              <Th field="m" label="Men" align="right" />
              <Th field="acs" label="ACs" align="right" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((d: any, i: number) => {
              const pctOfState = (d.total / stateData.total) * 100;
              return (
                <tr key={d.id} style={{
                  background: i % 2 === 0 ? '#faf4e8' : '#f5ead8',
                  borderBottom: '1px solid #d4c9bc'
                }}>
                  <td style={{ padding: '12px 8px', fontWeight: 800, fontSize: '16px', color: COLORS.text }}>{d.name}</td>
                  <td style={{ padding: '12px 8px', fontStyle: 'italic', fontSize: '13px', color: COLORS.muted }}>{d.tag}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'right', fontFeatureSettings: '"tnum" 1', fontWeight: 700, position: 'relative' }}>
                    <div style={{ position: 'absolute', inset: 0, right: `${100 - pctOfState * 10}%`, background: 'rgba(160, 64, 32, 0.08)', pointerEvents: 'none' }} />
                    <span style={{ position: 'relative' }}>{fmtIndian(d.total)}</span>
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'right', fontFeatureSettings: '"tnum" 1', color: COLORS.text }}>{fmtIndian(d.f)}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'right', fontFeatureSettings: '"tnum" 1', color: COLORS.text }}>{fmtIndian(d.m)}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 800, color: COLORS.text }}>{d.acs}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
