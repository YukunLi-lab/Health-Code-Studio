import { test, expect } from '@playwright/test'

test.describe('HealthCode Studio', () => {
  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/')

    // Check title
    await expect(page).toHaveTitle(/HealthCode Studio/)

    // Check hero section
    await expect(page.getByRole('heading', { name: /Build Health Apps/i })).toBeVisible()

    // Check prompt input
    const promptInput = page.getByPlaceholder(/Build me a daily mood/i)
    await expect(promptInput).toBeVisible()

    // Check generate button
    await expect(page.getByRole('button', { name: /Generate/i })).toBeVisible()
  })

  test('can enter a prompt and see generation UI', async ({ page }) => {
    await page.goto('/')

    // Enter a prompt
    const promptInput = page.getByPlaceholder(/Build me a daily mood/i)
    await promptInput.fill('Build me a sleep tracker with charts')

    // Click generate
    await page.getByRole('button', { name: /Generate/i }).click()

    // Check for generation progress
    await expect(page.getByText(/Generating/i)).toBeVisible()
  })

  test('templates section displays correctly', async ({ page }) => {
    await page.goto('/')

    // Scroll to templates section
    await page.locator('#templates').scrollIntoViewIfNeeded()

    // Check template cards are visible
    await expect(page.getByText(/Mood & Workout Tracker/i)).toBeVisible()
    await expect(page.getByText(/Nutrition Planner/i)).toBeVisible()
    await expect(page.getByText(/Sleep Analyzer/i)).toBeVisible()
  })

  test('PWA can be installed', async ({ page, browserName }) => {
    // Skip on non Chromium browsers
    if (browserName !== 'chromium') {
      test.skip()
    }

    await page.goto('/')

    // Check for PWA features
    const manifest = await page.evaluate(() => {
      return fetch('/manifest.json').then(r => r.json())
    })

    expect(manifest.name).toBe('HealthCode Studio')
    expect(manifest.display).toBe('standalone')
  })

  test('offline page works', async ({ page }) => {
    await page.goto('/')

    // Check service worker registration
    const swRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations()
        return registrations.length > 0
      }
      return false
    })

    expect(swRegistered).toBe(true)
  })
})
