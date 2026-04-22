export const fmtIndian = (n: number | null): string => {
  if (n === null) return "—";
  const numStr = n.toString();
  const lastThree = numStr.substring(numStr.length - 3);
  const otherNumbers = numStr.substring(0, numStr.length - 3);
  if (otherNumbers !== "") {
    return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
  }
  return lastThree;
};

export const fmtLakh = (n: number | null): string => {
  if (n === null) return "—";
  return (n / 100000).toFixed(2) + " L";
};

export const pct = (n: number, d: number): string => ((n / d) * 100).toFixed(1);

// Compact Indian rupee display. Picks the largest suffix that keeps the
// mantissa single- or double-digit.
//   7,18,30,500  → "₹7.18 Cr"
//      6,51,483  → "₹6.51 L"
//         40,000 → "₹40,000"
//              0 → "₹0"
export const fmtRupeesShort = (n: number | null | undefined): string => {
  if (n === null || n === undefined) return "—";
  if (n === 0) return "₹0";
  if (n >= 1_00_00_000) return "₹" + (n / 1_00_00_000).toFixed(2) + " Cr";
  if (n >= 1_00_000) return "₹" + (n / 1_00_000).toFixed(2) + " L";
  if (n >= 1_000) return "₹" + fmtIndian(n);
  return "₹" + n;
};
