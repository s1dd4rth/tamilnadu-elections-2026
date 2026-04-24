import React from "react";
import { COLORS } from "@/styles/theme";

// Party code → flag path. Handles TCPD aliases (ADMK = AIADMK, CPM = CPI(M)).
const FLAG: Record<string, string> = {
  DMK: "/flags/dmk.svg",
  INC: "/flags/inc.svg",
  AIADMK: "/flags/aiadmk.svg",
  ADMK: "/flags/aiadmk.svg",
  BJP: "/flags/bjp.svg",
  PMK: "/flags/pmk.svg",
  TVK: "/flags/tvk.jpg",
  NTK: "/flags/ntk.svg",
  VCK: "/flags/vck.svg",
  CPI: "/flags/cpi.svg",
  CPM: "/flags/cpim.svg",
  "CPI(M)": "/flags/cpim.svg",
  DMDK: "/flags/dmdk.svg",
  IUML: "/flags/iuml.svg",
  MDMK: "/flags/mdmk.svg",
  AMMK: "/flags/ammk.svg",
  KMDK: "/flags/kmdk.svg",
};

type Props = {
  party: string;
  size?: number;       // width in px; height is 60% of width
  verticalAlign?: React.CSSProperties["verticalAlign"];
  inline?: boolean;    // render inside text flow
};

export const PartyFlag: React.FC<Props> = ({ party, size = 22, verticalAlign = "middle", inline = true }) => {
  const src = FLAG[party.toUpperCase()];
  if (!src) return null;

  const box: React.CSSProperties = {
    display: inline ? "inline-block" : "block",
    width: size,
    height: Math.round(size * 0.62),
    verticalAlign,
    border: "1px solid rgba(26,20,16,0.18)",
    background: COLORS.background,
    flex: "none",
    overflow: "hidden",
  };
  const img: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    display: "block",
  };
  return (
    <span style={box} role="img" aria-label={`${party} flag`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" style={img} />
    </span>
  );
};
