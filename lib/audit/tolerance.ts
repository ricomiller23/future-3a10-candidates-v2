/**
 * Tolerance & Discrepancy Utility
 * Enforces rule: Acceptable difference <= 1% or <= $50,000, whichever is larger.
 */

export interface ToleranceCheckResult {
  isWithinTolerance: boolean;
  varianceAmount: number;
  variancePct: number;
  thresholdUsed: number;
  message: string;
}

export function checkNumericTolerance(
  valA: number | null | undefined,
  valB: number | null | undefined,
  label: string = "Value"
): ToleranceCheckResult {
  if (valA == null || valB == null) {
    return {
      isWithinTolerance: valA === valB,
      varianceAmount: 0,
      variancePct: 0,
      thresholdUsed: 0,
      message: `${label} comparison incomplete: one or both values are missing (valA: ${valA}, valB: ${valB}).`
    };
  }

  const varianceAmount = Math.abs(valA - valB);
  const maxVal = Math.max(Math.abs(valA), Math.abs(valB), 1);
  const variancePct = (varianceAmount / maxVal) * 100;

  // Threshold is max(1% of maxVal, $50,000)
  const thresholdUsed = Math.max(maxVal * 0.01, 50000);
  const isWithinTolerance = varianceAmount <= thresholdUsed;

  const message = isWithinTolerance
    ? `${label} within acceptable tolerance (Delta: $${varianceAmount.toLocaleString()} / ${variancePct.toFixed(2)}%, Threshold: $${thresholdUsed.toLocaleString()}).`
    : `${label} EXCEEDS tolerance! Delta: $${varianceAmount.toLocaleString()} (${variancePct.toFixed(2)}%), Allowed: $${thresholdUsed.toLocaleString()}.`;

  return {
    isWithinTolerance,
    varianceAmount,
    variancePct,
    thresholdUsed,
    message
  };
}
