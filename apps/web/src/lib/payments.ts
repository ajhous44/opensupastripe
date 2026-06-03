export interface MonthlyPaymentInput {
  price: number
  downPayment?: number
  apr?: number
  termMonths?: number
}

const DEFAULT_TERM_MONTHS = 60

/**
 * Calculate the monthly payment using the standard amortization formula.
 * Returns a value rounded to two decimal places.
 */
export function calculateMonthlyPayment({
  price,
  downPayment = 0,
  apr = 0,
  termMonths = DEFAULT_TERM_MONTHS,
}: MonthlyPaymentInput): number {
  if (!Number.isFinite(price) || price <= 0) {
    return 0
  }

  const principal = Math.max(price - Math.max(downPayment, 0), 0)
  if (principal <= 0) {
    return 0
  }

  const monthsCandidate = Number.isFinite(termMonths) ? Number(termMonths) : DEFAULT_TERM_MONTHS
  const months = monthsCandidate > 0 ? monthsCandidate : DEFAULT_TERM_MONTHS
  const annualRateCandidate = Number.isFinite(apr) ? Number(apr) : 0
  const annualRate = Math.max(annualRateCandidate, 0)

  if (annualRate === 0) {
    return roundToCents(principal / months)
  }

  const monthlyRate = annualRate / 100 / 12
  const denominator = 1 - Math.pow(1 + monthlyRate, -months)

  if (denominator === 0) {
    return roundToCents(principal / months)
  }

  const payment = (principal * monthlyRate) / denominator
  return roundToCents(payment)
}

function roundToCents(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}


