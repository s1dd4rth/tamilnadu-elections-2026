export const SERIF = "var(--font-fraunces), 'Playfair Display', Georgia, serif";
export const MONO = "var(--font-mono), 'Courier New', monospace";

export const COLORS = {
  background: '#faf4e8',
  text: '#1a1410',
  muted: '#6b5d52',
  accent: '#a04020',
  border: '#1a1410',
};

// Some party/alliance brand colours are bright enough to work as fills
// (dots, hexes, bar segments) on the cream background but fall below
// WCAG AA 4.5:1 as small text. Map those to darker hue-preserving variants
// specifically for text usage. Unknown inputs pass through.
const ON_CREAM_TEXT: Record<string, string> = {
  '#d8a520': '#7a5e0a', // NTK gold
  '#5a7a9a': '#3e5676', // Other / TVVK slate
  '#f28c28': '#a0561a', // BJP saffron
  '#d9b14a': '#7a5e0a', // PMK mustard
  '#c97a3a': '#8a4a1a', // PT rust
};
export const onCream = (hex: string): string =>
  ON_CREAM_TEXT[hex.toLowerCase()] ?? hex;
