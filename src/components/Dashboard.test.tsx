import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { createInitialData, sampleContractPages } from '../data/defaults'
import { analyzeContractPages } from '../lib/contractAnalyzer'
import { createDealFromFacts, createPacket } from '../lib/deal'
import { Dashboard } from './Dashboard'

describe('Dashboard', () => {
  it('sends a new homeowner to the contract check', async () => {
    const onNavigate = vi.fn()
    const onOpenReview = vi.fn()
    render(<Dashboard data={createInitialData()} onNavigate={onNavigate} onOpenReview={onOpenReview} />)

    await userEvent.click(screen.getByRole('button', { name: /check a contract/i }))
    expect(onOpenReview).toHaveBeenCalledWith('overview')
    expect(onNavigate).not.toHaveBeenCalled()
  })

  it('opens the requested review section from the attention panels', async () => {
    const data = createInitialData()
    const analysis = analyzeContractPages(sampleContractPages)
    const { deal, sources } = createDealFromFacts(analysis.facts)
    data.reviews.push({
      id: 'sample-review',
      name: 'Sample review',
      importedAt: new Date().toISOString(),
      pages: sampleContractPages,
      ...analysis,
      deal,
      dealSources: sources,
      packet: createPacket([...new Set(sampleContractPages.map((page) => page.documentName))], deal.ownership),
    })
    const onOpenReview = vi.fn()
    render(<Dashboard data={data} onNavigate={vi.fn()} onOpenReview={onOpenReview} />)

    await userEvent.click(screen.getByRole('button', { name: /unresolved contract questions/i }))
    expect(onOpenReview).toHaveBeenCalledWith('questions')

    await userEvent.click(screen.getByRole('button', { name: /packet items unconfirmed/i }))
    expect(onOpenReview).toHaveBeenCalledWith('packet')
  })
})
