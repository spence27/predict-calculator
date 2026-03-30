import { describe, expect, it } from 'vitest';
import { calculateLoss } from './loss-calculator';

describe('calculateLoss', () => {
  it('computes the spreadsheet example correctly', () => {
    const result = calculateLoss({ contacts: 3000, loanSize: 400_000, bps: 150 });
    expect(result.inMarket).toBe(60);
    expect(result.lostLoans).toBe(36);
    expect(result.lostLoanVolume).toBe(14_400_000);
    expect(result.lostCommission).toBe(216_000);
  });

  it('handles small database', () => {
    const result = calculateLoss({ contacts: 100, loanSize: 300_000, bps: 100 });
    expect(result.inMarket).toBe(2);
    expect(result.lostLoans).toBe(1.2);
    expect(result.lostLoanVolume).toBe(360_000);
    expect(result.lostCommission).toBe(3_600);
  });

  it('handles zero bps', () => {
    const result = calculateLoss({ contacts: 5000, loanSize: 500_000, bps: 0 });
    expect(result.lostCommission).toBe(0);
  });

  it('handles large database', () => {
    const result = calculateLoss({ contacts: 10_000, loanSize: 400_000, bps: 200 });
    expect(result.inMarket).toBe(200);
    expect(result.lostLoans).toBe(120);
    expect(result.lostLoanVolume).toBe(48_000_000);
    expect(result.lostCommission).toBe(960_000);
  });
});
