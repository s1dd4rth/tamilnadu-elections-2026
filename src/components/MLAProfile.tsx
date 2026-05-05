import { SERIF, MONO, COLORS } from "@/styles/theme";
import { SmallCaps, SectionTitle } from "./common";
import findings from "@/data/findings.json";

const BLOC_COLOUR: Record<string, string> = {
  SPA: "#a04020",
  NDA: "#1f4e3d",
  TVK: "#a61e5e",
};

const BLOC_LABEL: Record<string, string> = {
  SPA: "DMK-led SPA",
  NDA: "AIADMK-led NDA",
  TVK: "TVK (Vijay)",
};

type BlocSummary = {
  n: number;
  crorepatiPct: number;
  criminalPct: number;
  medianAge: number | null;
};

const BlocCard: React.FC<{ bloc: string; s: BlocSummary }> = ({ bloc, s }) => (
  <div style={{
    background: "#fff9ef",
    border: `1.5px solid ${COLORS.text}`,
    boxShadow: "6px 6px 0 rgba(26,20,16,0.05)",
    padding: "20px 22px",
    borderTop: `4px solid ${BLOC_COLOUR[bloc] ?? COLORS.text}`,
  }}>
    <SmallCaps style={{ color: BLOC_COLOUR[bloc] ?? COLORS.text }}>
      {BLOC_LABEL[bloc] ?? bloc}
    </SmallCaps>
    <div style={{
      fontFamily: SERIF,
      fontSize: "44px",
      fontStyle: "italic",
      fontWeight: 900,
      color: COLORS.text,
      lineHeight: 0.95,
      letterSpacing: "-0.03em",
      margin: "6px 0 14px",
    }}>
      {s.n}
      <span style={{ fontFamily: MONO, fontSize: "12px", fontWeight: 600, color: COLORS.muted, letterSpacing: "0.08em", marginLeft: "8px", verticalAlign: "12px" }}>
        MLAs
      </span>
    </div>
    <div style={{ display: "grid", gap: "10px" }}>
      <Stat label="₹1 cr+ assets" value={`${s.crorepatiPct.toFixed(0)}%`} />
      <Stat label="Criminal cases declared" value={`${s.criminalPct.toFixed(0)}%`} />
      <Stat label="Median age" value={s.medianAge != null ? `${s.medianAge.toFixed(0)}` : "—"} />
    </div>
  </div>
);

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "10px",
    alignItems: "baseline",
    paddingBottom: "8px",
    borderBottom: "1px dotted #d8c8a8",
  }}>
    <div style={{ fontFamily: SERIF, fontSize: "13px", color: "#3a302a" }}>{label}</div>
    <div style={{ fontFamily: SERIF, fontSize: "20px", fontWeight: 800, fontStyle: "italic", color: COLORS.text, letterSpacing: "-0.015em" }}>
      {value}
    </div>
  </div>
);

export const MLAProfile = () => {
  const w = findings.winnersAffidavits as {
    matched: number;
    total: number;
    crorepati: number;
    multi_cr: number;
    criminal: number;
    medianAge: number;
    meanAge: number;
    youngest: Array<{ no: number; name: string; age: number; bloc: string }>;
    oldest: Array<{ no: number; name: string; age: number; bloc: string }>;
    educationCounts: Record<string, number>;
    blocSummary: Record<string, BlocSummary>;
  };
  if (!w?.matched) return null;

  const blocs: string[] = ["TVK", "NDA", "SPA"];

  // Top 5 education categories
  const eduSorted = Object.entries(w.educationCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const eduTotal = eduSorted.reduce((s, [, n]) => s + n, 0);

  return (
    <section style={{ margin: "60px 0" }}>
      <SectionTitle kicker="The 234 New MLAs">
        Who actually won.
      </SectionTitle>
      <p style={{
        fontFamily: SERIF,
        fontSize: "17px",
        lineHeight: 1.65,
        color: "#3a302a",
        maxWidth: "820px",
        margin: "16px 0 28px",
        fontStyle: "italic",
      }}>
        Cross-referencing the 234 winners against MyNeta&apos;s candidate-affidavit database:{" "}
        <strong style={{ color: COLORS.text, fontStyle: "normal" }}>{w.matched}</strong> matches,{" "}
        <strong style={{ color: COLORS.text, fontStyle: "normal" }}>{w.total - w.matched}</strong> winners with no affidavit on file. The aggregate profile of the 16th Tamil Nadu Legislative Assembly:
      </p>

      {/* Three big stats side by side */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "14px",
        marginBottom: "32px",
      }}>
        <BigStat label="Crorepati MLAs" value={`${w.crorepati}`} sub={`${(w.crorepati*100/w.matched).toFixed(0)}% of analysed winners`} />
        <BigStat label="With criminal cases" value={`${w.criminal}`} sub={`${(w.criminal*100/w.matched).toFixed(0)}% — pending or filed`} />
        <BigStat label="Median age" value={`${w.medianAge.toFixed(0)}`} sub={`mean ${w.meanAge.toFixed(1)} · range ${w.youngest[0]?.age ?? '—'}–${w.oldest[0]?.age ?? '—'}`} />
      </div>

      {/* Per-bloc roster comparison */}
      <div style={{ marginBottom: "32px" }}>
        <SmallCaps style={{ color: COLORS.accent, marginBottom: "10px" }}>
          Per-bloc roster
        </SmallCaps>
        <p style={{
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: "14px",
          color: "#3a302a",
          maxWidth: "780px",
          margin: "8px 0 16px",
          lineHeight: 1.55,
        }}>
          The blocs picked very different rosters. SPA&apos;s remaining 73 MLAs include the senior DMK ministerial bench — wealthier and more litigated than average. TVK&apos;s 108 first-time MLAs are the cleanest profile of the three.
        </p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
        }}>
          {blocs.map((b) => w.blocSummary[b] && (
            <BlocCard key={b} bloc={b} s={w.blocSummary[b]} />
          ))}
        </div>
      </div>

      {/* Youngest + oldest list */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "20px",
        marginBottom: "20px",
      }}>
        <ExtremesList title="5 Youngest MLAs" rows={w.youngest} suffix={(r) => `age ${r.age}`} />
        <ExtremesList title="5 Oldest MLAs" rows={w.oldest} suffix={(r) => `age ${r.age}`} />
      </div>

      {/* Education distribution */}
      <div style={{
        background: "#fff9ef",
        border: `1.5px solid ${COLORS.text}`,
        boxShadow: "6px 6px 0 rgba(26,20,16,0.05)",
        padding: "20px 22px",
      }}>
        <SmallCaps style={{ color: COLORS.accent }}>
          Education declared in affidavits
        </SmallCaps>
        <h3 style={{
          fontFamily: SERIF,
          fontSize: "20px",
          fontStyle: "italic",
          fontWeight: 800,
          color: COLORS.text,
          margin: "4px 0 14px",
          letterSpacing: "-0.015em",
        }}>
          Highest qualification — winners only.
        </h3>
        {eduSorted.map(([cat, n]) => {
          const pct = n / eduTotal * 100;
          return (
            <div key={cat} style={{
              display: "grid",
              gridTemplateColumns: "180px 1fr 50px",
              gap: "12px",
              alignItems: "center",
              padding: "6px 0",
              borderBottom: "1px dotted #d8c8a8",
            }}>
              <div style={{ fontFamily: SERIF, fontSize: "13px", color: COLORS.text }}>
                {cat}
              </div>
              <div style={{ height: 10, background: "#e9dfc9" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: COLORS.accent }} />
              </div>
              <div style={{ fontFamily: SERIF, fontSize: "14px", fontStyle: "italic", fontWeight: 700, color: COLORS.text, textAlign: "right" }}>
                {n}
              </div>
            </div>
          );
        })}
        <p style={{
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: "12px",
          color: COLORS.muted,
          margin: "14px 0 0",
          borderTop: `1px dotted ${COLORS.muted}`,
          paddingTop: "10px",
          lineHeight: 1.55,
        }}>
          Source: ECI affidavits surfaced via MyNeta. Categories are MyNeta&apos;s own taxonomy.
        </p>
      </div>
    </section>
  );
};

const BigStat: React.FC<{ label: string; value: string; sub: string }> = ({ label, value, sub }) => (
  <div style={{
    background: "#fff9ef",
    border: `1.5px solid ${COLORS.text}`,
    boxShadow: "6px 6px 0 rgba(26,20,16,0.05)",
    padding: "16px 20px",
  }}>
    <SmallCaps style={{ color: COLORS.accent }}>{label}</SmallCaps>
    <div style={{
      fontFamily: SERIF,
      fontSize: "44px",
      fontStyle: "italic",
      fontWeight: 900,
      color: COLORS.text,
      lineHeight: 0.95,
      letterSpacing: "-0.03em",
      margin: "6px 0 8px",
    }}>
      {value}
    </div>
    <div style={{ fontFamily: SERIF, fontSize: "12px", color: COLORS.muted, fontStyle: "italic", lineHeight: 1.4 }}>
      {sub}
    </div>
  </div>
);

const ExtremesList: React.FC<{
  title: string;
  rows: Array<{ no: number; name: string; age: number; bloc: string }>;
  suffix: (r: { age: number }) => string;
}> = ({ title, rows, suffix }) => (
  <div style={{
    background: "#fff9ef",
    border: `1.5px solid ${COLORS.text}`,
    boxShadow: "6px 6px 0 rgba(26,20,16,0.05)",
    padding: "16px 20px",
  }}>
    <SmallCaps style={{ color: COLORS.accent }}>{title}</SmallCaps>
    <div style={{ marginTop: "8px" }}>
      {rows.map((r) => (
        <div key={`${r.no}-${r.name}`} style={{
          display: "grid",
          gridTemplateColumns: "32px 1fr 70px",
          gap: "8px",
          alignItems: "baseline",
          padding: "6px 0",
          borderBottom: "1px dotted #d8c8a8",
          fontFamily: SERIF,
          fontSize: "13px",
        }}>
          <span style={{ fontFamily: MONO, fontSize: "10px", color: COLORS.muted, textAlign: "right" }}>{r.no}</span>
          <span style={{ color: COLORS.text }}>
            {r.name}
            <span style={{ marginLeft: "6px", fontFamily: MONO, fontSize: "9px", letterSpacing: "0.08em", color: BLOC_COLOUR[r.bloc] ?? COLORS.muted, fontWeight: 700 }}>
              {r.bloc}
            </span>
          </span>
          <span style={{ fontFamily: SERIF, fontSize: "13px", fontStyle: "italic", fontWeight: 700, color: COLORS.text, textAlign: "right" }}>
            {suffix(r)}
          </span>
        </div>
      ))}
    </div>
  </div>
);
