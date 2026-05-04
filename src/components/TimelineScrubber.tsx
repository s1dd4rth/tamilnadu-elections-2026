"use client";

import React, { useEffect, useRef } from "react";
import { SERIF, MONO, COLORS } from "@/styles/theme";
import { SmallCaps } from "./common";

export type TimelineSnapshot = {
  ts: string;       // wall-clock fetch time, ISO
  eciTs: string | null;  // ECI's stamped "Last Updated at HH:MM" — preferred
  declared: number;
  // Per AC: [partyAbbr, bloc, candidate, colorHex]. Typed as string[] (not
  // a fixed-length tuple) so JSON-imported snapshots type-check without
  // an extra cast.
  results: Record<string, string[]>;
};

type Props = {
  snapshots: TimelineSnapshot[];
  selectedIdx: number;
  onSelect: (idx: number) => void;
};

const PLAY_TICK_MS = 700; // gap between snapshots when auto-playing

const fmtIST = (iso: string | null): string => {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata",
    }).format(new Date(iso));
  } catch {
    return iso.slice(11, 16);
  }
};

export const TimelineScrubber: React.FC<Props> = ({ snapshots, selectedIdx, onSelect }) => {
  const [playing, setPlaying] = React.useState(false);
  const playTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const last = snapshots.length - 1;
  const isLatest = selectedIdx === last;
  const snap = snapshots[selectedIdx];

  // Auto-advance when playing. Stops at the latest snapshot.
  useEffect(() => {
    if (!playing) return;
    playTimer.current = setInterval(() => {
      onSelect(Math.min(selectedIdx + 1, last));
    }, PLAY_TICK_MS);
    return () => {
      if (playTimer.current) clearInterval(playTimer.current);
    };
  }, [playing, selectedIdx, last, onSelect]);

  useEffect(() => {
    if (playing && selectedIdx >= last) setPlaying(false);
  }, [playing, selectedIdx, last]);

  const tsLabel = fmtIST(snap?.eciTs ?? snap?.ts ?? null);
  const firstLabel = fmtIST(snapshots[0]?.eciTs ?? snapshots[0]?.ts ?? null);
  const lastLabel = fmtIST(snapshots[last]?.eciTs ?? snapshots[last]?.ts ?? null);

  return (
    <div
      style={{
        background: "#fff9ef",
        border: `1.5px solid ${COLORS.text}`,
        padding: "20px 24px",
        boxShadow: "6px 6px 0 rgba(26,20,16,0.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "baseline",
          gap: "16px",
          rowGap: "6px",
          marginBottom: "14px",
        }}
      >
        <SmallCaps style={{ color: COLORS.accent }}>Counting Day · Replay</SmallCaps>
        <span
          style={{
            fontFamily: MONO,
            fontSize: "12px",
            letterSpacing: "0.06em",
            color: COLORS.muted,
            textTransform: "uppercase",
          }}
        >
          {snapshots.length} snapshot{snapshots.length === 1 ? "" : "s"} · ECI refresh ≈ 5 min
        </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "14px",
          marginBottom: "12px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            fontFamily: SERIF,
            fontSize: "30px",
            fontStyle: "italic",
            fontWeight: 900,
            color: COLORS.text,
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          {tsLabel}
          <span style={{ fontSize: "13px", fontFamily: MONO, fontStyle: "normal", fontWeight: 600, color: COLORS.muted, marginLeft: "8px", letterSpacing: "0.1em" }}>
            IST · 04 MAY 2026
          </span>
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: "16px",
            color: "#3a302a",
          }}
        >
          {snap?.declared ?? 0} <span style={{ color: COLORS.muted }}>of 234 ACs trending</span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "Pause replay" : "Play replay"}
          disabled={isLatest && !playing}
          style={{
            border: `1.5px solid ${COLORS.text}`,
            background: playing ? COLORS.text : "#faf4e8",
            color: playing ? "#faf4e8" : COLORS.text,
            fontFamily: MONO,
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.12em",
            padding: "6px 12px",
            cursor: isLatest && !playing ? "not-allowed" : "pointer",
            opacity: isLatest && !playing ? 0.4 : 1,
            textTransform: "uppercase",
          }}
        >
          {playing ? "❙❙ Pause" : "▶ Play"}
        </button>

        <input
          type="range"
          min={0}
          max={Math.max(0, last)}
          value={selectedIdx}
          onChange={(e) => {
            setPlaying(false);
            onSelect(Number(e.target.value));
          }}
          aria-label="Counting day timeline scrubber"
          style={{ flex: 1, accentColor: COLORS.accent }}
        />

        <button
          type="button"
          onClick={() => {
            setPlaying(false);
            onSelect(last);
          }}
          disabled={isLatest}
          style={{
            border: `1.5px solid ${COLORS.text}`,
            background: isLatest ? COLORS.text : "#faf4e8",
            color: isLatest ? "#faf4e8" : COLORS.text,
            fontFamily: MONO,
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.12em",
            padding: "6px 12px",
            cursor: isLatest ? "default" : "pointer",
            textTransform: "uppercase",
          }}
        >
          {isLatest ? "● Live" : "Latest →"}
        </button>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "8px",
          fontFamily: MONO,
          fontSize: "10px",
          letterSpacing: "0.1em",
          color: COLORS.muted,
        }}
      >
        <span>{firstLabel} IST</span>
        <span>{lastLabel} IST</span>
      </div>
    </div>
  );
};
