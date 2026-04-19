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
