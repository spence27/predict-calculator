import { describe, expect, it } from 'vitest';
import {
  calculateOutputs,
  getPlan,
  monthlyRevenue,
  roiPercentage
} from './calculator';

describe('getPlan', () => {
  it('returns ineligible plan for <=500 contacts', () => {
    const plan = getPlan(300);
    expect(plan.eligible).toBe(false);
    expect(plan.leadsPerDay).toBe(0);
    expect(plan.price).toBe(0);
    expect(plan.closedDealsPerMonth).toBe(0);
  });

  it('returns ineligible plan for >10,000 contacts', () => {
    const plan = getPlan(15_000);
    expect(plan.eligible).toBe(false);
    expect(plan.leadsPerDay).toBe(0);
    expect(plan.price).toBe(0);
    expect(plan.closedDealsPerMonth).toBe(0);
    expect(plan.message).toContain('custom pricing');
  });

  it('maps contact tiers correctly with hardcoded closed deals', () => {
    expect(getPlan(750)).toMatchObject({ leadsPerDay: 2, price: 350, eligible: true, closedDealsPerMonth: 1.0 });
    expect(getPlan(2_000)).toMatchObject({ leadsPerDay: 2, price: 350, eligible: true, closedDealsPerMonth: 1.4 });
    expect(getPlan(3_000)).toMatchObject({ leadsPerDay: 3, price: 450, eligible: true, closedDealsPerMonth: 2.1 });
    expect(getPlan(7_500)).toMatchObject({ leadsPerDay: 4, price: 550, eligible: true, closedDealsPerMonth: 2.8 });
  });
});

describe('calculations', () => {
  it('computes monthly revenue based on closed deals', () => {
    expect(monthlyRevenue(1.4, 400_000, 150)).toBe(8_400);
    expect(monthlyRevenue(2.1, 400_000, 150)).toBe(12_600);
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

