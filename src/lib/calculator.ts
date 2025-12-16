export type PlanTier =
  | '<=500'
  | '500-1000'
  | '1000-2500'
  | '2500-5000'
  | '5000-10000'
  | '10000+';

export type Plan = {
  tier: PlanTier;
  leadsPerDay: number;
  price: number;
  eligible: boolean;
  closedDealsPerMonth: number;
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
      tier: '<=500',
      leadsPerDay: 0,
      price: 0,
      eligible: false,
      closedDealsPerMonth: 0,
      message:
        'We want to be a strong partner to you. At this time, your database size would likely limit your ability to achieve a positive return on investment. We recommend focusing first on lead generation to quickly and cost-effectively build your database. Please book a call to discuss lead generation services and next steps.'
    };
  }

  if (contacts <= 1_000) {
    return { tier: '500-1000', leadsPerDay: 2, price: 350, eligible: true, closedDealsPerMonth: 1.0 };
  }

  if (contacts <= 2_500) {
    return { tier: '1000-2500', leadsPerDay: 2, price: 350, eligible: true, closedDealsPerMonth: 1.4 };
  }

  if (contacts <= 5_000) {
    return { tier: '2500-5000', leadsPerDay: 3, price: 450, eligible: true, closedDealsPerMonth: 2.1 };
  }

  if (contacts <= 10_000) {
    return { tier: '5000-10000', leadsPerDay: 4, price: 550, eligible: true, closedDealsPerMonth: 2.8 };
  }

  return {
    tier: '10000+',
    leadsPerDay: 0,
    price: 0,
    eligible: false,
    closedDealsPerMonth: 0,
    message:
      'Thank you for your interest. Based on the current size of your database, we want to ensure you receive the strongest possible value and return on investment. Please book a call so we can discuss custom pricing and the best approach for your needs.'
  };
}

export function monthlyRevenue(closedDeals: number, loanSize: number, bps: number): number {
  const bpsDecimal = bps / 10_000;
  return round(closedDeals * loanSize * bpsDecimal, 2);
}

export function roiPercentage(monthlyRevenueValue: number, monthlyPrice: number): number {
  if (monthlyPrice <= 0) return 0;
  const roi = ((monthlyRevenueValue - monthlyPrice) / monthlyPrice) * 100;
  return round(roi, 1);
}

export function calculateOutputs(inputs: CalculatorInputs): CalculatorResult {
  const plan = getPlan(inputs.contacts);
  const revenue = monthlyRevenue(plan.closedDealsPerMonth, inputs.loanSize, inputs.bps);
  const roi = roiPercentage(revenue, plan.price);

  return {
    plan,
    loansPerMonth: plan.closedDealsPerMonth,
    monthlyRevenue: revenue,
    roiPercentage: roi
  };
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

