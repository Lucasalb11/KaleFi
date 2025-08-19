// Constants for lending protocol
const LIQUIDATION_THRESHOLD = 0.80; // 80% LTV triggers liquidation
const MAX_LTV = 0.75; // Maximum 75% LTV for borrowing

export function calculateLTV(collateralValue: number, borrowedValue: number): number {
  if (collateralValue === 0) return 0;
  return (borrowedValue / collateralValue) * 100;
}

export function calculateHealthFactor(collateralValue: number, borrowedValue: number): number {
  if (borrowedValue === 0) return Infinity;
  
  // Health Factor = (Collateral Value * Liquidation Threshold) / Borrowed Value
  const liquidationValue = collateralValue * LIQUIDATION_THRESHOLD;
  return liquidationValue / borrowedValue;
}

export function calculateMaxBorrowable(collateralValue: number): number {
  return collateralValue * MAX_LTV;
}

export function calculateAvailableToBorrow(
  collateralValue: number, 
  currentBorrowed: number
): number {
  const maxBorrowable = calculateMaxBorrowable(collateralValue);
  return Math.max(0, maxBorrowable - currentBorrowed);
}

export function isPositionSafe(healthFactor: number): boolean {
  return healthFactor > 1.2; // 20% buffer above liquidation
}

export function getPositionRisk(healthFactor: number): 'safe' | 'moderate' | 'high' | 'critical' {
  if (healthFactor >= 2) return 'safe';
  if (healthFactor >= 1.5) return 'moderate';
  if (healthFactor >= 1) return 'high';
  return 'critical';
}