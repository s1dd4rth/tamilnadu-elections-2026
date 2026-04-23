import { ImageResponse } from "next/og";
import turnoutData from "@/data/turnout.json";

export const runtime = "edge";
export const alt = "Tamil Nadu 2026 Election Dashboard — turnout and electoral atlas";
export const size = { width: 1200, height: 628 };
export const contentType = "image/png";

export default async function OgImage() {
  const vtr = turnoutData.state.vtr2026.toFixed(2);
  const delta = (turnoutData.state.vtr2026 - turnoutData.state.vtr2021).toFixed(2);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#faf4e8",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 80px",
          fontFamily: "Georgia, serif",
          color: "#1a1410",
        }}
      >
        {/* Kicker */}
        <div
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: 22,
            letterSpacing: "0.18em",
            color: "#a04020",
            fontWeight: 700,
            textTransform: "uppercase",
            display: "flex",
          }}
        >
          Tamil Nadu · Polling Day · 23 April 2026
        </div>

        {/* Hero + subline (middle block) */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              fontWeight: 900,
              lineHeight: 0.9,
              letterSpacing: "-0.04em",
              color: "#1a1410",
            }}
          >
            <span style={{ fontSize: 260 }}>{vtr}</span>
            <span style={{ fontSize: 140, marginLeft: 6 }}>%</span>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontSize: 34,
              color: "#3a302a",
              marginTop: 24,
              maxWidth: 1040,
              lineHeight: 1.3,
            }}
          >
            <span>The highest assembly-election turnout Tamil Nadu has recorded in modern memory —</span>
            <span style={{ color: "#a04020", fontWeight: 700, marginLeft: 10, marginRight: 10 }}>
              up +{delta} pp
            </span>
            <span>over 2021.</span>
          </div>
        </div>

        {/* Footer strip */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "2px solid #1a1410",
            paddingTop: 18,
          }}
        >
          <div
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: 20,
              letterSpacing: "0.16em",
              color: "#1a1410",
              fontWeight: 700,
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            TN Election 2026 Dashboard
          </div>
          <div
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: 18,
              letterSpacing: "0.12em",
              color: "#6b5d52",
              fontWeight: 600,
              display: "flex",
            }}
          >
            tn-dashboard-app.vercel.app
          </div>
        </div>
      </div>
    ),
    size
  );
}
