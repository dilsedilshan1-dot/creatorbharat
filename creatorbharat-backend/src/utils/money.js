// 🇮🇳 CreatorBharat — Deterministic Financial Money Utility
// Prevents floating-point precision loss by standardizing all internal monetary math in integer Paise.
// 1 INR = 100 Paise

/**
 * Converts INR Rupees into integer Paise as BigInt.
 * Enforces strict bounds, finite checks, and rejects non-numeric or NaN inputs.
 *
 * @param {number|string} amountRupees - The monetary amount in INR
 * @returns {BigInt} - The exact amount in Paise
 * @throws {TypeError|RangeError} If input is invalid, non-finite, or out of bounds
 */
export function rupeesToPaise(amountRupees) {
  if (amountRupees === null || amountRupees === undefined) {
    throw new TypeError('Monetary amount cannot be null or undefined.');
  }

  const num = typeof amountRupees === 'string' ? parseFloat(amountRupees.trim()) : Number(amountRupees);

  if (typeof num !== 'number' || isNaN(num)) {
    throw new TypeError(`Invalid monetary amount: "${amountRupees}" is not a valid number.`);
  }

  if (!isFinite(num)) {
    throw new RangeError('Monetary amount must be finite.');
  }

  // Maximum single transaction limit: ₹10 Crores (₹100,000,000)
  const MAX_INR = 100000000;
  const MIN_INR = -100000000;
  if (num > MAX_INR || num < MIN_INR) {
    throw new RangeError(`Monetary amount ${num} exceeds platform safety bounds [₹${MIN_INR}, ₹${MAX_INR}].`);
  }

  // Multiply by 100 and round to nearest whole integer to eliminate IEEE 754 precision artifacts
  const paise = Math.round(num * 100);
  return BigInt(paise);
}

/**
 * Converts BigInt or integer Paise back to standard decimal INR Rupees for display/API responses.
 *
 * @param {BigInt|number} paise - Amount in Paise
 * @returns {number} - Amount in INR Rupees
 */
export function paiseToRupees(paise) {
  if (paise === null || paise === undefined) {
    return 0;
  }
  const numericPaise = typeof paise === 'bigint' ? Number(paise) : Number(paise);
  return numericPaise / 100;
}

/**
 * Formats integer Paise into Indian Rupee locale string (e.g. ₹1,50,000.00).
 *
 * @param {BigInt|number} paise - Amount in Paise
 * @returns {string} - Formatted currency string
 */
export function formatINR(paise) {
  const rupees = paiseToRupees(paise);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(rupees);
}
