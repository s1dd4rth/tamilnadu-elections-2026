# Tamil Nadu Elections 2026: Numerical Dashboard 🗳️📊

A high-fidelity, interactive numerical atlas of the Tamil Nadu electoral landscape, specifically following the **Special Intensive Revision (SIR)** published in February 2026.

**Live Application:** [https://tn-dashboard-app.vercel.app/](https://tn-dashboard-app.vercel.app/)

## 🔍 The "Great Correction"
This dashboard visualizes the largest single electoral cleanup in Tamil Nadu's history. Over **7.4 million (74 lakh) names** were struck from the rolls, resulting in an 11.5% net reduction from the pre-SIR figure.

### Key Insights
- **The Silent Majority**: Women now outnumber men by **1.22 million (12.22 lakh)**.
- **Youth Surge**: There are **1.25 million (12.51 lakh)** voters aged 18–19, many newly enrolled during this revision.
- **Urban Decline**: Chennai experienced the sharpest decline, losing 1.42 million names.

## 🛠️ Technical Stack
- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Styling**: Vanilla CSS with centralized design tokens for a premium, newspaper-aesthetic.
- **Architecture**: Modular React components (`MapSection`, `AgePyramid`, `ACExplorer`).
- **Data Layer**: Decoupled JSON-driven state management for constituency and demographic data.
- **Observability**: Vercel Web Analytics & Speed Insights.
- **Responsiveness**: Mobile-first design with sticky column layouts for data-dense tables.

## 📱 Features
- **Interactive Heatmap**: Explore district-level electorate density.
- **AC Turnout Map**: 234-hex choropleth over all constituencies, togglable between VTR 2026 and change-since-2021.
- **Seat Atlas** (`/analysis`): Paired 2021-baseline and 2026-placeholder views — a seat hemicycle and a hex tile map that both colour in on counting day.
- **Demographic Pulse**: Real-time gender split and age-cohort pyramids.
- **AC Explorer**: Instant search and filter across all 234 Assembly Constituencies with candidate details.
- **District Portrait**: Detailed rank-based analysis of voter demographics.

## 🚀 Getting Started
First, install dependencies:
```bash
npm install
```

Then, run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📜 Source & Credits
- Data sourced from the **Chief Electoral Officer (CEO), Tamil Nadu** Final Roll 2026.
- District map based on Wikimedia Commons (CC-BY-SA 3.0) by Planemad / Nichalp.
- AC hex-tile layout adapted from [baskicanvas/tamilnadu-assembly-constituency-maps](https://github.com/baskicanvas/tamilnadu-assembly-constituency-maps).

---
*Compiled and Engineered by Siddarth Kengadaran*
