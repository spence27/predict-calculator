const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});

const numberFormatter = new Intl.NumberFormat('en-US');

export function formatCurrency(value: number): string {
  return currencyFormatter.format(isFinite(value) ? value : 0);
}

export function formatNumber(value: number): string {
  return numberFormatter.format(isFinite(value) ? value : 0);
}

export function formatPercent(value: number, fractionDigits = 0): string {
  if (!isFinite(value)) return '0%';
  return `${value.toFixed(fractionDigits)}%`;
}

