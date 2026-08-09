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
  await page.getByRole('button', { name: /load the sample/i }).click()

  await expect(page.getByRole('heading', { name: 'Fictional sample agreement' })).toBeVisible()
  await expect(page.getByText('Tax credit language affects the payment story')).toBeVisible()
  await expect(page.getByText('Page 2', { exact: true }).first()).toBeVisible()

  await page.getByRole('button', { name: 'Mark resolved' }).first().click()
  await expect(page.getByText('Resolved', { exact: true }).first()).toBeVisible()
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
  await page.locator('button.primary-button', { hasText: 'Choose file' }).click()
  const chooser = await chooserPromise
  await chooser.setFiles({ name: 'searchable-sample.pdf', mimeType: 'application/pdf', buffer: pdf })

  await expect(page.getByRole('heading', { name: 'searchable-sample.pdf' })).toBeVisible()
  await expect(page.getByText('Possible APR')).toBeVisible()
  await expect(page.getByText('Disputes may be limited to individual arbitration')).toBeVisible()
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
  await expect(page.getByRole('navigation', { name: 'Primary navigation' }).last()).toBeVisible()
  await page.getByRole('button', { name: 'Care', exact: true }).click()
  await expect(page.getByRole('heading', { name: /keep a quiet record/i })).toBeVisible()
  const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
  const viewportWidth = page.viewportSize()?.width
  expect(bodyWidth).toBeLessThanOrEqual(viewportWidth ?? bodyWidth)
})
