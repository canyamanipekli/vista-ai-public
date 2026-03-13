/**
 * VISTA Time Machine — project subscription spend over 1, 5, or 10 years.
 * Status quo: current monthly × years with annual price growth.
 * Optimize: (current monthly − potential savings) × years with lower or no growth.
 */

const DEFAULT_ANNUAL_GROWTH_STATUS_QUO = 0.07; // 7% per year
const DEFAULT_ANNUAL_GROWTH_OPTIMIZED = 0.02; // 2% per year after optimization

export type TimeMachineYears = 1 | 5 | 10;

export interface TimeMachineInput {
  totalMonthly: number;
  potentialSavings: number;
  years: TimeMachineYears;
}

export interface TimeMachineResult {
  statusQuoTotal: number;
  optimizeTotal: number;
  savingsTotal: number;
  targetYear: number;
  perYearStatusQuo: number[];
  perYearOptimize: number[];
}

function compoundGrowth(monthly: number, years: number, annualRate: number): number {
  let total = 0;
  let m = monthly;
  for (let y = 0; y < years; y++) {
    total += m * 12;
    m *= 1 + annualRate;
  }
  return total;
}

export function computeTimeMachine(input: TimeMachineInput): TimeMachineResult {
  const { totalMonthly, potentialSavings, years } = input;
  const statusQuoTotal = compoundGrowth(
    totalMonthly,
    years,
    DEFAULT_ANNUAL_GROWTH_STATUS_QUO
  );
  const optimizedMonthly = Math.max(0, totalMonthly - potentialSavings);
  const optimizeTotal = compoundGrowth(
    optimizedMonthly,
    years,
    DEFAULT_ANNUAL_GROWTH_OPTIMIZED
  );
  const savingsTotal = Math.max(0, statusQuoTotal - optimizeTotal);
  const targetYear = new Date().getFullYear() + years;

  const perYearStatusQuo: number[] = [];
  const perYearOptimize: number[] = [];
  let mSq = totalMonthly;
  let mOpt = optimizedMonthly;
  for (let y = 0; y < years; y++) {
    perYearStatusQuo.push(mSq * 12);
    perYearOptimize.push(mOpt * 12);
    mSq *= 1 + DEFAULT_ANNUAL_GROWTH_STATUS_QUO;
    mOpt *= 1 + DEFAULT_ANNUAL_GROWTH_OPTIMIZED;
  }

  return {
    statusQuoTotal,
    optimizeTotal,
    savingsTotal,
    targetYear,
    perYearStatusQuo,
    perYearOptimize,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
