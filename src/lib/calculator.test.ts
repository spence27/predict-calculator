import { describe, expect, it } from 'vitest';
import {
  calculateOutputs,
  getPlan,
  loansPerMonth,
  monthlyRevenue,
  roiPercentage
} from './calculator';

describe('getPlan', () => {
  it('returns ineligible plan for <500 contacts', () => {
    const plan = getPlan(300);
    expect(plan.eligible).toBe(false);
    expect(plan.leadsPerDay).toBe(0);
    expect(plan.price).toBe(0);
  });

  it('maps contact tiers correctly', () => {
    expect(getPlan(750)).toMatchObject({ leadsPerDay: 2, price: 250, eligible: true, conversionRate: 0.5 });
    expect(getPlan(2_000)).toMatchObject({ leadsPerDay: 2, price: 350, eligible: true, conversionRate: 0.7 });
    expect(getPlan(3_000)).toMatchObject({ leadsPerDay: 3, price: 350, eligible: true, conversionRate: 0.7 });
    expect(getPlan(6_000)).toMatchObject({ leadsPerDay: 4, price: 450, eligible: true, conversionRate: 0.7 });
  });
});

describe('calculations', () => {
  it('computes loans per month with tiered conversion rates', () => {
    expect(loansPerMonth(2, 0.5)).toBe(1);
    expect(loansPerMonth(3, 0.7)).toBe(2.1);
  });

  it('computes monthly revenue and ROI with BPS and pricing', () => {
    const inputs = { contacts: 1_200, loanSize: 400_000, bps: 150 };
    const result = calculateOutputs(inputs);

    expect(result.loansPerMonth).toBe(1.4);
    expect(result.monthlyRevenue).toBe(8_400);
    expect(result.roiPercentage).toBe(2300);
  });

  it('handles zero price safely in ROI', () => {
    const revenue = monthlyRevenue(1.5, 500_000, 200);
    expect(roiPercentage(revenue, 0)).toBe(0);
  });
});

