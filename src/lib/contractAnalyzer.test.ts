import { describe, expect, it } from 'vitest'
import { sampleContractPages } from '../data/defaults'
import { analyzeContractPages } from './contractAnalyzer'

describe('analyzeContractPages', () => {
  it('finds high-value questions and page sources in the sample agreement', () => {
    const analysis = analyzeContractPages(sampleContractPages)

    expect(analysis.findings.map((finding) => finding.id)).toEqual(
      expect.arrayContaining([
        'tax-credit-assumption',
        'payment-reset',
        'security-interest',
        'arbitration',
        'home-transfer',
        'warranty-exclusions',
      ]),
    )
    expect(analysis.findings.find((finding) => finding.id === 'security-interest')?.source?.page).toBe(5)
    expect(analysis.facts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'cash-price', value: '$31,500' }),
        expect.objectContaining({ id: 'financed-amount', value: '$42,900' }),
        expect.objectContaining({ id: 'system-size', value: '9.6 kW' }),
      ]),
    )
  })

  it('labels critical topics as not found without claiming they are absent', () => {
    const analysis = analyzeContractPages([
      { number: 1, text: 'A contractor may install twelve panels after permit approval.' },
    ])

    const missing = analysis.findings.filter((finding) => finding.id.startsWith('missing-'))
    expect(missing.map((finding) => finding.id)).toEqual(
      expect.arrayContaining(['missing-price', 'missing-financing', 'missing-warranty', 'missing-cancel']),
    )
    expect(missing.every((finding) => finding.explanation.includes('does not prove'))).toBe(true)
  })

  it('does not invent a page source for a missing topic', () => {
    const analysis = analyzeContractPages([{ number: 1, text: 'System description only.' }])
    expect(analysis.findings.find((finding) => finding.id === 'missing-price')?.source).toBeUndefined()
  })
})
