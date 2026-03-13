/**
 * Deterministic 16-digit card number from user identifier (e.g. email).
 * Same user always gets the same number; formatted as 4 groups of 4.
 */
export function getVirtualCardNumber(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const digits: number[] = [];
  let n = h;
  for (let i = 0; i < 16; i++) {
    n = (n * 1103515245 + 12345) >>> 0;
    digits.push((n % 10));
  }
  // Ensure it doesn't start with 0 (looks more card-like)
  if (digits[0] === 0) digits[0] = 4;
  return digits.join("").replace(/(\d{4})(?=\d)/g, "$1 ");
}

/** Deterministic expiry (MM/YY) from seed so it's stable per user. */
export function getVirtualCardExpiry(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const month = (h % 12) + 1;
  const year = 28 + (h % 5);
  return `${String(month).padStart(2, "0")}/${year}`;
}

/** Deterministic 3-digit CVC. */
export function getVirtualCardCvc(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const n = (h * 1103515245 + 12345) >>> 0;
  const cvc = (n % 900) + 100;
  return String(cvc);
}
