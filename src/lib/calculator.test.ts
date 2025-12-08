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
    expect(getPlan(750)).toMatchObject({ leadsPerDay: 2, price: 250, eligible: true });
    expect(getPlan(2_000)).toMatchObject({ leadsPerDay: 3, price: 350, eligible: true });
    expect(getPlan(6_000)).toMatchObject({ leadsPerDay: 5, price: 450, eligible: true });
  });
});

describe('calculations', () => {
  it('computes loans per month at 0.75 conversion of leads', () => {
    expect(loansPerMonth(2)).toBe(1.5);
    expect(loansPerMonth(5)).toBe(3.75);
  });

  it('computes monthly revenue and ROI with BPS and pricing', () => {
    const inputs = { contacts: 1_200, loanSize: 400_000, bps: 150 };
    const result = calculateOutputs(inputs);

    expect(result.loansPerMonth).toBe(1.13);
    expect(result.monthlyRevenue).toBe(6_750);
    expect(result.roiPercentage).toBe(1828.6);
  });

  it('handles zero price safely in ROI', () => {
    const revenue = monthlyRevenue(1.5, 500_000, 200);
    expect(roiPercentage(revenue, 0)).toBe(0);
  });
});

