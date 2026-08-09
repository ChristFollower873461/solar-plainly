import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { createInitialData } from '../data/defaults'
import { Dashboard } from './Dashboard'

describe('Dashboard', () => {
  it('sends a new homeowner to the contract check', async () => {
    const onNavigate = vi.fn()
    render(<Dashboard data={createInitialData()} onNavigate={onNavigate} />)

    await userEvent.click(screen.getByRole('button', { name: /check a contract/i }))
    expect(onNavigate).toHaveBeenCalledWith('check')
  })
})
