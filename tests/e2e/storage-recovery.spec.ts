import { expect, test, type Page } from '@playwright/test'
import { createInitialData } from '../../src/data/defaults'

const writeRecord = (page: Page, value: unknown) => page.evaluate((record) => new Promise<void>((resolve, reject) => {
  const request = indexedDB.open('solar-plainly', 1)
  request.onsuccess = () => {
    const db = request.result
    const transaction = db.transaction('app', 'readwrite')
    transaction.objectStore('app').put(record, 'solar-data')
    transaction.oncomplete = () => { db.close(); resolve() }
    transaction.onabort = () => { db.close(); reject(transaction.error) }
  }
  request.onerror = () => reject(request.error)
}), value)

const readRecord = (page: Page) => page.evaluate(() => new Promise<unknown>((resolve, reject) => {
  const request = indexedDB.open('solar-plainly', 1)
  request.onsuccess = () => {
    const db = request.result
    const transaction = db.transaction('app', 'readonly')
    const get = transaction.objectStore('app').get('solar-data')
    transaction.oncomplete = () => { db.close(); resolve(get.result) }
    transaction.onabort = () => { db.close(); reject(transaction.error) }
  }
  request.onerror = () => reject(request.error)
}))

for (const [label, invalid] of [
  ['unsupported schema', { schemaVersion: 999, profile: { nickname: 'Preserve this synthetic record' } }],
  ['invalid falsy value', null],
] as const) {
  test(`preserves ${label} and recovers only after a successful read`, async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Saved here', { exact: true })).toBeVisible()
    await writeRecord(page, invalid)
    await page.reload()

    await expect(page.getByRole('heading', { name: 'Your local record could not be opened' })).toBeVisible()
    await expect(page.getByRole('alert')).toContainText('Nothing has been overwritten')
    await expect(page.getByRole('button', { name: /check a contract/i })).toHaveCount(0)
    // Exceed the autosave debounce to prove the failed read cannot replace storage.
    await page.waitForTimeout(400)
    expect(await readRecord(page)).toEqual(invalid)

    await page.getByRole('button', { name: 'Try opening again' }).click()
    await expect(page.getByRole('heading', { name: 'Your local record could not be opened' })).toBeVisible()
    await page.waitForTimeout(400)
    expect(await readRecord(page)).toEqual(invalid)

    const recovered = createInitialData()
    recovered.profile.nickname = 'Recovered synthetic homeowner record'
    await writeRecord(page, recovered)
    await page.getByRole('button', { name: 'Try opening again' }).click()
    await expect(page.getByRole('heading', { name: /your solar, without the sales fog/i })).toBeVisible()
    await expect(page.getByText('Saved here', { exact: true })).toBeVisible()
    expect(await readRecord(page)).toEqual(recovered)
  })
}
