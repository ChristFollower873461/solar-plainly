import { describe, expect, it } from 'vitest'
import { sampleContractPages } from '../data/defaults'
import { analyzeContractPages } from './contractAnalyzer'
import { createDealFromFacts, deriveDealMetrics, missingDealTerms, parseNumber } from './deal'

describe('deal model', () => {
  it('does not treat an empty field as zero', () => {
    expect(parseNumber('')).toBeUndefined()
    expect(parseNumber('$0')).toBe(0)
  })

  it('turns sourced facts into editable deal terms', () => {
    const analysis = analyzeContractPages(sampleContractPages)
    const { deal, sources } = createDealFromFacts(analysis.facts)

    expect(deal).toEqual(expect.objectContaining({
      ownership: 'loan',
      cashPrice: '31500',
      financedAmount: '42900',
      aprPercent: '3.99',
      termYears: '25',
      monthlyPayment: '159.00',
      laterMonthlyPayment: '231.00',
      paymentChangeMonth: '19',
      expectedPrepayment: '12870',
      systemSizeKw: '9.6',
      annualProductionKwh: '13800',
    }))
    expect(sources.financedAmount).toEqual(expect.objectContaining({
      documentName: 'Sunfield solar loan agreement.pdf',
      page: 1,
    }))
    expect(sources.ownership).toEqual(expect.objectContaining({
      documentName: 'Sunfield solar loan agreement.pdf',
      page: 1,
    }))
    expect(missingDealTerms(deal)).toEqual([])
  })

  it('shows financing and payment-reset arithmetic without a score', () => {
    const analysis = analyzeContractPages(sampleContractPages)
    const { deal } = createDealFromFacts(analysis.facts)
    const metrics = deriveDealMetrics(deal)

    expect(metrics.financingPremium).toBe(11400)
    expect(metrics.financingPremiumPercent).toBe(36.2)
    expect(metrics.cashCostPerWatt).toBe(3.28)
    expect(metrics.financedCostPerWatt).toBe(4.47)
    expect(metrics.standardLoanPayment).toBe(226.21)
    expect(metrics.paymentJump).toBe(72)
    expect(metrics.paymentJumpPercent).toBe(45.3)
    expect(metrics.noPrepaymentScheduledOutlay).toBe(68004)
  })

  it('keeps utility comparison assumptions explicit', () => {
    const analysis = analyzeContractPages(sampleContractPages)
    const { deal } = createDealFromFacts(analysis.facts)
    deal.currentUtilityBill = '240'
    deal.remainingUtilityBill = '45'
    deal.utilityEscalatorPercent = '3'

    const metrics = deriveDealMetrics(deal)
    expect(metrics.yearOneCombinedMonthly).toBe(204)
    expect(metrics.yearTenCombinedMonthly).toBe(289.71)
  })

  it('compounds lease payments across the entered term', () => {
    const deal = createDealFromFacts([]).deal
    Object.assign(deal, {
      ownership: 'lease',
      monthlyPayment: '150',
      annualEscalatorPercent: '2.9',
      termYears: '20',
      remainingUtilityBill: '40',
      utilityEscalatorPercent: '3',
    })

    const metrics = deriveDealMetrics(deal)
    expect(metrics.yearOneSolarMonthly).toBe(150)
    expect(metrics.yearTenSolarMonthly).toBe(194.01)
    expect(metrics.yearTenCombinedMonthly).toBe(246.2)
    expect(metrics.nominalEscalatingPayments).toBe(47877.68)
  })

  it('turns a PPA energy rate into year-one and year-ten payment estimates', () => {
    const deal = createDealFromFacts([]).deal
    Object.assign(deal, {
      ownership: 'ppa',
      ppaRate: '0.18',
      annualProductionKwh: '12000',
      annualEscalatorPercent: '2.9',
      termYears: '25',
      remainingUtilityBill: '35',
    })

    const metrics = deriveDealMetrics(deal)
    expect(metrics.yearOneSolarMonthly).toBe(180)
    expect(metrics.yearTenPpaRate).toBe(0.2328)
    expect(metrics.yearTenSolarMonthly).toBe(232.81)
    expect(metrics.yearOneCombinedMonthly).toBe(215)
    expect(metrics.nominalEscalatingPayments).toBe(77726.17)
  })
})
