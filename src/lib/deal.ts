import type {
  ContractFact,
  DealSources,
  DealTerms,
  OwnershipType,
  PacketItem,
  PacketKey,
} from '../types'

export const packetDefinitions: Array<{ key: PacketKey; label: string; reason: string }> = [
  {
    key: 'installation-contract',
    label: 'Installation or purchase contract',
    reason: 'Defines the scope, price, schedule, change orders, and contractor obligations.',
  },
  {
    key: 'financing-agreement',
    label: 'Loan, lease, or PPA agreement',
    reason: 'Contains the binding payment, escalation, security, default, and transfer terms.',
  },
  {
    key: 'solar-disclosure',
    label: 'Required solar disclosure',
    reason: 'Some states require a separate cost and consumer-rights disclosure.',
  },
  {
    key: 'proposal-production',
    label: 'Proposal and production model',
    reason: 'Shows the assumptions behind production, bill savings, shade, and utility rates.',
  },
  {
    key: 'equipment-spec',
    label: 'Equipment schedule or design',
    reason: 'Pins down panel, inverter, battery, quantity, layout, and substitution rights.',
  },
  {
    key: 'warranties',
    label: 'Product and workmanship warranties',
    reason: 'Separates manufacturer coverage from labor, roof, shipping, and service coverage.',
  },
  {
    key: 'cancellation-form',
    label: 'Cancellation notice and instructions',
    reason: 'States the applicable deadline, delivery method, and address for cancellation.',
  },
  {
    key: 'utility-interconnection',
    label: 'Utility and interconnection paperwork',
    reason: 'Documents permission to operate, export rules, and utility approvals.',
  },
]

export const createEmptyDeal = (): DealTerms => ({
  ownership: 'unknown',
  cashPrice: '',
  financedAmount: '',
  financeCharge: '',
  totalOfPayments: '',
  downPayment: '',
  aprPercent: '',
  termYears: '',
  monthlyPayment: '',
  laterMonthlyPayment: '',
  paymentChangeMonth: '',
  expectedPrepayment: '',
  ppaRate: '',
  annualEscalatorPercent: '',
  systemSizeKw: '',
  annualProductionKwh: '',
  currentUtilityBill: '',
  remainingUtilityBill: '',
  utilityEscalatorPercent: '',
  installer: '',
  lender: '',
})

const factToDealKey: Partial<Record<string, keyof DealTerms>> = {
  'cash-price': 'cashPrice',
  'financed-amount': 'financedAmount',
  'finance-charge': 'financeCharge',
  'total-of-payments': 'totalOfPayments',
  'down-payment': 'downPayment',
  apr: 'aprPercent',
  term: 'termYears',
  'monthly-payment': 'monthlyPayment',
  'later-monthly-payment': 'laterMonthlyPayment',
  'payment-change-month': 'paymentChangeMonth',
  'expected-prepayment': 'expectedPrepayment',
  'ppa-rate': 'ppaRate',
  escalator: 'annualEscalatorPercent',
  'system-size': 'systemSizeKw',
  'annual-production': 'annualProductionKwh',
}

const numberText = (value: string) => value.replace(/[^\d.-]/g, '')

export const createDealFromFacts = (facts: ContractFact[]) => {
  const deal = createEmptyDeal()
  const sources: DealSources = {}

  for (const fact of facts) {
    const key = factToDealKey[fact.id]
    if (!key) continue
    deal[key] = numberText(fact.value) as never
    sources[key] = fact.source
  }

  if (deal.ppaRate) {
    deal.ownership = 'ppa'
    sources.ownership = sources.ppaRate
  } else if (deal.financedAmount || deal.aprPercent) {
    deal.ownership = 'loan'
    sources.ownership = sources.financedAmount ?? sources.aprPercent
  } else if (deal.cashPrice) {
    deal.ownership = 'cash'
    sources.ownership = sources.cashPrice
  }

  return { deal, sources }
}

const packetMatchers: Record<PacketKey, RegExp> = {
  'installation-contract': /install|purchase|home improvement|construction|solar agreement/i,
  'financing-agreement': /loan|financ|credit|lease|power purchase|ppa/i,
  'solar-disclosure': /disclosure|consumer protection guide/i,
  'proposal-production': /proposal|production|savings|design/i,
  'equipment-spec': /equipment|module|panel|inverter|battery|spec/i,
  warranties: /warrant/i,
  'cancellation-form': /cancel/i,
  'utility-interconnection': /utility|interconnection|permission to operate|pto/i,
}

export const createPacket = (documentNames: string[], ownership: OwnershipType): PacketItem[] =>
  packetDefinitions.map(({ key }) => {
    const notApplicable = key === 'financing-agreement' && ownership === 'cash'
    const present = documentNames.some((name) => packetMatchers[key].test(name))
    return {
      key,
      status: notApplicable ? 'not-applicable' : present ? 'present' : 'unknown',
      note: '',
    }
  })

export const parseNumber = (value: string) => {
  const normalized = numberText(value)
  if (!normalized || normalized === '.' || normalized === '-' || normalized === '-.') return undefined
  const parsed = Number(normalized)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined
}

const round = (value: number, digits = 2) => {
  const scale = 10 ** digits
  return Math.round(value * scale) / scale
}

export interface DealMetrics {
  financingPremium?: number
  financingPremiumPercent?: number
  cashCostPerWatt?: number
  financedCostPerWatt?: number
  standardLoanPayment?: number
  standardLoanTotal?: number
  paymentJump?: number
  paymentJumpPercent?: number
  noPrepaymentScheduledOutlay?: number
  yearOneSolarMonthly?: number
  yearTenSolarMonthly?: number
  yearTenPpaRate?: number
  nominalEscalatingPayments?: number
  yearOneCombinedMonthly?: number
  yearTenCombinedMonthly?: number
}

const averageSteppedPayment = (
  startingPayment: number,
  laterPayment: number | undefined,
  changeMonth: number | undefined,
  firstMonth: number,
) => {
  if (laterPayment === undefined || changeMonth === undefined) return startingPayment
  const initialMonths = Math.max(0, Math.min(12, Math.round(changeMonth) - firstMonth))
  return (startingPayment * initialMonths + laterPayment * (12 - initialMonths)) / 12
}

const totalEscalatingPayments = (
  startingMonthly: number,
  annualEscalator: number,
  termYears: number,
) => {
  const months = Math.round(termYears * 12)
  let total = 0
  for (let month = 0; month < months; month += 1) {
    total += startingMonthly * (1 + annualEscalator / 100) ** Math.floor(month / 12)
  }
  return total
}

export const deriveDealMetrics = (deal: DealTerms): DealMetrics => {
  const cashPrice = parseNumber(deal.cashPrice)
  const financedAmount = parseNumber(deal.financedAmount)
  const systemSizeKw = parseNumber(deal.systemSizeKw)
  const apr = parseNumber(deal.aprPercent)
  const termYears = parseNumber(deal.termYears)
  const monthlyPayment = parseNumber(deal.monthlyPayment)
  const laterMonthlyPayment = parseNumber(deal.laterMonthlyPayment)
  const paymentChangeMonth = parseNumber(deal.paymentChangeMonth)
  const ppaRate = parseNumber(deal.ppaRate)
  const annualProduction = parseNumber(deal.annualProductionKwh)
  const remainingUtilityBill = parseNumber(deal.remainingUtilityBill)
  const utilityEscalator = parseNumber(deal.utilityEscalatorPercent) ?? 0
  const solarEscalator = parseNumber(deal.annualEscalatorPercent) ?? 0
  const result: DealMetrics = {}

  if (cashPrice !== undefined && financedAmount !== undefined && cashPrice > 0) {
    result.financingPremium = round(financedAmount - cashPrice)
    result.financingPremiumPercent = round(((financedAmount - cashPrice) / cashPrice) * 100, 1)
  }

  if (systemSizeKw && cashPrice !== undefined) {
    result.cashCostPerWatt = round(cashPrice / (systemSizeKw * 1000))
  }
  if (systemSizeKw && financedAmount !== undefined) {
    result.financedCostPerWatt = round(financedAmount / (systemSizeKw * 1000))
  }

  if (financedAmount !== undefined && apr !== undefined && termYears) {
    const months = Math.round(termYears * 12)
    const monthlyRate = apr / 100 / 12
    const payment = monthlyRate === 0
      ? financedAmount / months
      : financedAmount * monthlyRate * (1 + monthlyRate) ** months
        / ((1 + monthlyRate) ** months - 1)
    result.standardLoanPayment = round(payment)
    result.standardLoanTotal = round(payment * months)
  }

  if (monthlyPayment !== undefined && laterMonthlyPayment !== undefined) {
    result.paymentJump = round(laterMonthlyPayment - monthlyPayment)
    if (monthlyPayment > 0) {
      result.paymentJumpPercent = round(((laterMonthlyPayment - monthlyPayment) / monthlyPayment) * 100, 1)
    }
  }

  if (monthlyPayment !== undefined && laterMonthlyPayment !== undefined && termYears && paymentChangeMonth) {
    const months = Math.round(termYears * 12)
    const initialMonths = Math.max(0, Math.min(months, Math.round(paymentChangeMonth) - 1))
    result.noPrepaymentScheduledOutlay = round(
      monthlyPayment * initialMonths + laterMonthlyPayment * (months - initialMonths),
    )
  }

  let yearOneSolarMonthly: number | undefined
  let yearTenSolarMonthly: number | undefined

  if (deal.ownership === 'cash') {
    yearOneSolarMonthly = 0
    yearTenSolarMonthly = 0
  } else if (deal.ownership === 'loan' && monthlyPayment !== undefined) {
    yearOneSolarMonthly = averageSteppedPayment(
      monthlyPayment,
      laterMonthlyPayment,
      paymentChangeMonth,
      1,
    )
    yearTenSolarMonthly = averageSteppedPayment(
      monthlyPayment,
      laterMonthlyPayment,
      paymentChangeMonth,
      109,
    )
  } else if (deal.ownership === 'lease' && monthlyPayment !== undefined) {
    yearOneSolarMonthly = monthlyPayment
    yearTenSolarMonthly = monthlyPayment * (1 + solarEscalator / 100) ** 9
    if (termYears) {
      result.nominalEscalatingPayments = round(
        totalEscalatingPayments(monthlyPayment, solarEscalator, termYears),
      )
    }
  } else if (deal.ownership === 'ppa' && ppaRate !== undefined && annualProduction !== undefined) {
    yearOneSolarMonthly = ppaRate * annualProduction / 12
    yearTenSolarMonthly = yearOneSolarMonthly * (1 + solarEscalator / 100) ** 9
    result.yearTenPpaRate = round(ppaRate * (1 + solarEscalator / 100) ** 9, 4)
    if (termYears) {
      result.nominalEscalatingPayments = round(
        totalEscalatingPayments(yearOneSolarMonthly, solarEscalator, termYears),
      )
    }
  }

  if (yearOneSolarMonthly !== undefined) result.yearOneSolarMonthly = round(yearOneSolarMonthly)
  if (yearTenSolarMonthly !== undefined) result.yearTenSolarMonthly = round(yearTenSolarMonthly)

  if (
    result.yearOneSolarMonthly !== undefined
    && result.yearTenSolarMonthly !== undefined
    && remainingUtilityBill !== undefined
  ) {
    result.yearOneCombinedMonthly = round(result.yearOneSolarMonthly + remainingUtilityBill)
    result.yearTenCombinedMonthly = round(
      result.yearTenSolarMonthly
        + remainingUtilityBill * (1 + utilityEscalator / 100) ** 9,
    )
  }

  return result
}

const baseRequired: Array<{ key: keyof DealTerms; label: string }> = [
  { key: 'ownership', label: 'ownership type' },
  { key: 'cashPrice', label: 'cash price' },
  { key: 'systemSizeKw', label: 'system size' },
  { key: 'annualProductionKwh', label: 'first-year production' },
]

const ownershipRequired: Partial<Record<OwnershipType, Array<{ key: keyof DealTerms; label: string }>>> = {
  loan: [
    { key: 'financedAmount', label: 'financed amount' },
    { key: 'aprPercent', label: 'APR' },
    { key: 'termYears', label: 'loan term' },
    { key: 'monthlyPayment', label: 'starting payment' },
  ],
  lease: [
    { key: 'termYears', label: 'lease term' },
    { key: 'monthlyPayment', label: 'starting payment' },
    { key: 'annualEscalatorPercent', label: 'annual escalator' },
  ],
  ppa: [
    { key: 'termYears', label: 'PPA term' },
    { key: 'ppaRate', label: 'starting energy rate' },
    { key: 'annualEscalatorPercent', label: 'annual escalator' },
  ],
}

export const missingDealTerms = (deal: DealTerms) => {
  const required = [...baseRequired, ...(ownershipRequired[deal.ownership] ?? [])]
  return required.filter(({ key }) => !String(deal[key]).trim()).map(({ label }) => label)
}

export const formatCurrency = (value: number, digits = 0) =>
  new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value)
