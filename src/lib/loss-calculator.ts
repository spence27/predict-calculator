export type LossInputs = {
  contacts: number;
  loanSize: number;
  bps: number;
};

export type LossResult = {
  inMarket: number;
  lostLoans: number;
  lostLoanVolume: number;
  lostCommission: number;
};

/** Fixed assumptions */
export const IN_MARKET_RATE = 0.02;
export const LOST_RATE = 0.60;
export const RECAPTURE_RATE = 0.40;

export function calculateLoss(inputs: LossInputs): LossResult {
  const inMarket = inputs.contacts * IN_MARKET_RATE;
  const lostLoans = inMarket * LOST_RATE;
  const lostLoanVolume = lostLoans * inputs.loanSize;
  const lostCommission = lostLoanVolume * (inputs.bps / 10_000);

  return {
    inMarket: Math.round(inMarket * 100) / 100,
    lostLoans: Math.round(lostLoans * 100) / 100,
    lostLoanVolume: Math.round(lostLoanVolume * 100) / 100,
    lostCommission: Math.round(lostCommission * 100) / 100,
  };
}
