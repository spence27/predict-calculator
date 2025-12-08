export type PlanTier = '<500' | '500-999' | '1000-4999' | '5000+';

export type Plan = {
  tier: PlanTier;
  leadsPerDay: number;
  price: number;
  eligible: boolean;
  message?: string;
};

export type CalculatorInputs = {
  contacts: number;
  loanSize: number;
  bps: number;
};

export type CalculatorResult = {
  plan: Plan;
  loansPerMonth: number;
  monthlyRevenue: number;
  roiPercentage: number;
};

export const MIN_CONTACTS = 1;
export const MIN_LOAN_SIZE = 50_000;
export const MIN_BPS = 0;
export const MAX_BPS = 500;

export function getPlan(contacts: number): Plan {
  if (contacts <= 500) {
    return {
      tier: '<500',
      leadsPerDay: 0,
      price: 0,
      eligible: false,
      message:
        'Thanks for your interest. You do not have enough contacts to score and create an active lead funnel.'
    };
  }

  if (contacts < 1_000) {
    return { tier: '500-999', leadsPerDay: 2, price: 250, eligible: true };
  }

  if (contacts < 5_000) {
    return { tier: '1000-4999', leadsPerDay: 3, price: 350, eligible: true };
  }

  return { tier: '5000+', leadsPerDay: 5, price: 450, eligible: true };
}

export function loansPerMonth(leadsPerDay: number): number {
  // Base conversion is 0.75 loans per lead/day, then reduced by half per request.
  return round(leadsPerDay * 0.75 * 0.5, 2);
}

export function monthlyRevenue(loans: number, loanSize: number, bps: number): number {
  const bpsDecimal = bps / 10_000;
  return round(loans * loanSize * bpsDecimal, 2);
}

export function roiPercentage(monthlyRevenueValue: number, monthlyPrice: number): number {
  if (monthlyPrice <= 0) return 0;
  const roi = ((monthlyRevenueValue - monthlyPrice) / monthlyPrice) * 100;
  return round(roi, 1);
}

export function calculateOutputs(inputs: CalculatorInputs): CalculatorResult {
  const plan = getPlan(inputs.contacts);
  const loans = loansPerMonth(plan.leadsPerDay);
  const revenue = monthlyRevenue(loans, inputs.loanSize, inputs.bps);
  const roi = roiPercentage(revenue, plan.price);

  return {
    plan,
    loansPerMonth: loans,
    monthlyRevenue: revenue,
    roiPercentage: roi
  };
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

