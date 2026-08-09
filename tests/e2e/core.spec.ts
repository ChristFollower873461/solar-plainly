import { expect, test } from '@playwright/test'

const consoleErrors = new WeakMap<object, string[]>()

test.beforeEach(async ({ page }) => {
  const errors: string[] = []
  consoleErrors.set(page, errors)
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.goto('/')
  await page.evaluate(async () => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase('solar-plainly')
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
      request.onblocked = () => resolve()
    })
  })
  await page.reload()
})

test.afterEach(async ({ page }) => {
  expect(consoleErrors.get(page) ?? []).toEqual([])
})

test('checks the fictional sample and resolves a sourced question', async ({ page }) => {
  await expect(page.getByRole('heading', { name: /your solar, without the sales fog/i })).toBeVisible()
  await page.getByRole('button', { name: /check a contract/i }).click()
  await page.getByRole('button', { name: /load the complete sample/i }).click()

  await expect(page.getByRole('heading', { name: 'Fictional three-document sample' })).toBeVisible()
  const snapshot = page.getByLabel('Deal snapshot')
  await expect(snapshot.getByText('36.2% over cash')).toBeVisible()
  await expect(snapshot.getByText('$4.47', { exact: true })).toBeVisible()
  await page.getByRole('navigation', { name: 'Contract review sections' }).getByRole('button', { name: /^Questions/ }).click()
  const questions = page.locator('section[aria-labelledby="questions-title"]')
  await expect(questions.getByText('Tax credit language affects the payment story')).toBeVisible()
  await expect(questions.getByText(/sunfield solar loan agreement\.pdf, page 2/i).first()).toBeVisible()

  await questions.getByRole('button', { name: 'Resolve', exact: true }).first().click()
  await questions.getByRole('button', { name: 'Resolved', exact: true }).click()
  await expect(questions.getByRole('button', { name: 'Reopen' }).first()).toBeVisible()
})

test('extracts and checks a searchable PDF in the browser', async ({ page }) => {
  await page.setContent(`
    <h1>Sample Solar Agreement</h1>
    <p>Total financed amount: $40,000. Cash price: $30,000.</p>
    <p>The loan term is 20 years at 4.99% APR.</p>
    <p>Disputes are resolved through binding arbitration.</p>
    <p>The system includes twenty panels and an inverter with manufacturer warranties.</p>
  `)
  const pdf = await page.pdf({ format: 'Letter' })
  await page.goto('/')
  await page.getByRole('button', { name: /check a contract/i }).click()
  const chooserPromise = page.waitForEvent('filechooser')
  await page.locator('button.primary-button', { hasText: 'Choose documents' }).click()
  const chooser = await chooserPromise
  await chooser.setFiles({ name: 'searchable-sample.pdf', mimeType: 'application/pdf', buffer: pdf })

  await expect(page.getByRole('heading', { name: 'searchable-sample.pdf' })).toBeVisible()
  await expect(page.getByLabel('APR')).toHaveValue('4.99')
  await page.getByRole('navigation', { name: 'Contract review sections' }).getByRole('button', { name: /^Questions/ }).click()
  await expect(page.locator('section[aria-labelledby="questions-title"]').getByText('Disputes may be limited to individual arbitration')).toBeVisible()
})

test('keeps a multi-document packet together', async ({ page }) => {
  await page.getByRole('button', { name: /check a contract/i }).click()
  const chooserPromise = page.waitForEvent('filechooser')
  await page.locator('button.primary-button', { hasText: 'Choose documents' }).click()
  const chooser = await chooserPromise
  await chooser.setFiles([
    {
      name: 'Purchase Contract.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Solar installation purchase contract. Cash price: $28,000. System size 8.0 kW DC. Expected annual production 11,500 kWh. Equipment includes panels and inverter with warranties.'),
    },
    {
      name: 'Solar Loan Agreement.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Solar loan financing agreement. Total financed amount: $36,000. Loan term: 20 years at 5.25% APR. Starting monthly payment is $242.50. Binding arbitration applies to disputes.'),
    },
  ])

  await expect(page.getByRole('heading', { name: '2-document solar packet' })).toBeVisible()
  await page.getByRole('navigation', { name: 'Contract review sections' }).getByRole('button', { name: /^Packet/ }).click()
  await expect(page.getByText('Purchase Contract.txt', { exact: true })).toBeVisible()
  await expect(page.getByText('Solar Loan Agreement.txt', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Loan, lease, or PPA agreement status')).toHaveValue('present')
})

test('calculates an escalating PPA from its own contract terms', async ({ page }) => {
  await page.getByRole('button', { name: /check a contract/i }).click()
  await page.getByLabel('Contract text').fill(`
    Power Purchase Agreement. The cash price is $31,000 and the system size is 10 kW DC.
    First-year production is 12,000 kWh. The PPA rate is $0.18 per kWh.
    The term is 25 years with a 2.9% annual escalator. Production is an estimate and not a guarantee.
  `)
  await page.getByRole('button', { name: /Build the review/i }).click()

  await expect(page.getByLabel('Ownership and payment type')).toHaveValue('ppa')
  const math = page.locator('.deal-math-section')
  await expect(math.getByText('$0.2328/kWh')).toBeVisible()
  await expect(math.getByText('$77,726')).toBeVisible()
})

test('opens the exact review section requested from Home', async ({ page }) => {
  await page.getByRole('button', { name: /check a contract/i }).click()
  await page.getByRole('button', { name: /load the complete sample/i }).click()
  await page.getByRole('button', { name: 'Home', exact: true }).click()

  await page.getByRole('button', { name: /unresolved contract questions/i }).click()
  await expect(page.getByRole('heading', { name: 'Questions to resolve' })).toBeVisible()

  await page.getByRole('button', { name: 'Home', exact: true }).click()
  await page.getByRole('button', { name: /packet items unconfirmed/i }).click()
  await expect(page.getByRole('heading', { name: 'Imported documents' })).toBeVisible()
})

test('carries reviewed terms into the long-term system record', async ({ page }) => {
  await page.getByRole('button', { name: /check a contract/i }).click()
  await page.getByRole('button', { name: /load the complete sample/i }).click()
  await page.getByLabel('Installer on contract').fill('Sunfield Home Energy')
  await page.getByRole('button', { name: /carry into system record/i }).click()

  await expect(page.getByLabel('Ownership')).toHaveValue('loan')
  await expect(page.getByLabel('System size (kW DC)')).toHaveValue('9.6')
  await expect(page.getByLabel('Expected annual production (kWh)')).toHaveValue('13800')
  await expect(page.getByLabel('Installer')).toHaveValue('Sunfield Home Energy')
})

test('imports a monitoring CSV into the production record', async ({ page }) => {
  await page.getByRole('button', { name: 'Care', exact: true }).click()
  await page.getByRole('tab', { name: /Production/ }).click()

  const chooserPromise = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: /Import CSV/i }).click()
  const chooser = await chooserPromise
  await chooser.setFiles({
    name: 'monitoring-export.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('Date,Generated Energy (Wh)\n2026-01-01,500000\n2026-01-02,450000\n2026-02-01,820000'),
  })

  await expect(page.getByText('2 months ready from monitoring-export.csv')).toBeVisible()
  await page.getByRole('button', { name: /Import months/i }).click()

  const productionTable = page.getByRole('table', { name: 'Production entries' })
  await expect(productionTable.getByText('950 kWh')).toBeVisible()
  await expect(productionTable.getByText('820 kWh')).toBeVisible()
})

test('renders a print-only homeowner brief', async ({ page, isMobile }) => {
  test.skip(Boolean(isMobile), 'Print layout check')
  await page.getByRole('button', { name: /check a contract/i }).click()
  await page.getByRole('button', { name: /load the complete sample/i }).click()
  await page.emulateMedia({ media: 'print' })

  const report = page.locator('.review-report')
  await expect(report).toBeVisible()
  await expect(report.getByRole('heading', { name: 'Deal snapshot' })).toBeVisible()
  await expect(report.getByText('$11,400')).toBeVisible()
  await expect(report.getByRole('heading', { name: 'Packet gaps' })).toBeVisible()
  await expect(page.locator('.review-toolbar')).toBeHidden()
})

test('saves a system record across reloads', async ({ page }) => {
  await page.getByRole('button', { name: 'Record', exact: true }).click()
  await page.getByLabel('Record name').fill('Oak Street solar')
  await page.getByLabel('System size (kW DC)').fill('8.4')
  await page.getByLabel('Installer').fill('Example Energy')
  await expect(page.getByText(/saved here/i)).toBeVisible()
  await page.waitForTimeout(300)
  await page.reload()

  await page.getByRole('button', { name: 'Record', exact: true }).click()
  await expect(page.getByLabel('Record name')).toHaveValue('Oak Street solar')
  await expect(page.getByLabel('System size (kW DC)')).toHaveValue('8.4')
})

test('mobile navigation stays usable', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Mobile layout check')
  const mobileNavigation = page.locator('.mobile-nav')
  await expect(mobileNavigation).toBeVisible()
  await mobileNavigation.getByRole('button', { name: 'Care', exact: true }).click()
  await expect(page.getByRole('heading', { name: /keep a quiet record/i })).toBeVisible()
  const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
  const viewportWidth = page.viewportSize()?.width
  expect(bodyWidth).toBeLessThanOrEqual(viewportWidth ?? bodyWidth)
})

test('core workflows fit a 320px viewport', async ({ page, isMobile }) => {
  test.skip(Boolean(isMobile), 'Narrow viewport check')
  await page.setViewportSize({ width: 320, height: 760 })

  const assertNoOverflow = async () => {
    const dimensions = await page.evaluate(() => ({
      body: document.body.scrollWidth,
      document: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
    }))
    expect(Math.max(dimensions.body, dimensions.document)).toBeLessThanOrEqual(dimensions.viewport)
  }

  await assertNoOverflow()
  const mobileNavigation = page.locator('.mobile-nav')
  await mobileNavigation.getByRole('button', { name: 'Check', exact: true }).click()
  await page.getByRole('button', { name: /load the complete sample/i }).click()
  await assertNoOverflow()

  for (const destination of ['Record', 'Care'] as const) {
    await mobileNavigation.getByRole('button', { name: destination, exact: true }).click()
    await assertNoOverflow()
  }

  await page.getByRole('button', { name: 'Open settings' }).click()
  await assertNoOverflow()
})
