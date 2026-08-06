import { test, expect } from '@playwright/test'

const OWNER_APP_URL = 'https://app.sportiv.pk/'

test.describe('Sportiv landing', () => {
  test('home shows brand, hero, and owner dashboard CTA', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('banner')).toBeVisible()
    await expect(
      page.getByRole('heading', { name: /find your next game partner/i }),
    ).toBeVisible()

    const cta = page
      .getByRole('link', { name: 'Field Owner Dashboard' })
      .first()
    await expect(cta).toBeVisible()
    await expect(cta).toHaveAttribute('href', OWNER_APP_URL)
  })

  test('theme toggle switches between light and dark', async ({ page }) => {
    await page.goto('/')

    const theme = page.getByRole('group', { name: 'Theme' })
    await expect(theme).toBeVisible()

    await theme.getByRole('button', { name: 'Dark' }).click()
    await expect(page.locator('html')).toHaveClass(/dark/)

    await theme.getByRole('button', { name: 'Light' }).click()
    await expect(page.locator('html')).not.toHaveClass(/dark/)
  })

  test('how it works tabs switch content', async ({ page }) => {
    await page.goto('/#how-it-works')

    await expect(
      page.getByRole('heading', { name: 'How It Works' }),
    ).toBeVisible()

    const facilities = page.getByRole('button', {
      name: 'For Facility Owners',
    })
    await facilities.click()
    await expect(facilities).toHaveAttribute('aria-pressed', 'true')
    await expect(
      page.getByText(/partner venues get visibility/i),
    ).toBeVisible()

    const players = page.getByRole('button', { name: 'For Players' })
    await players.click()
    await expect(players).toHaveAttribute('aria-pressed', 'true')
    await expect(
      page.getByText(/discover nearby players by sport/i),
    ).toBeVisible()
  })

  test('privacy page loads', async ({ page }) => {
    await page.goto('/privacy')

    await expect(
      page.getByRole('heading', { name: 'Privacy Policy' }),
    ).toBeVisible()
    await expect(
      page.getByRole('banner').getByRole('link', { name: 'Sportiv home' }),
    ).toBeVisible()
  })

  test('contact section exposes form fields', async ({ page }) => {
    await page.goto('/#contact')

    await expect(page.getByRole('heading', { name: 'Contact Us' })).toBeVisible()
    await expect(page.locator('#contact-email')).toBeVisible()
    await expect(page.locator('#contact-message')).toBeVisible()
    await expect(
      page.getByRole('button', { name: /send message/i }),
    ).toBeVisible()
  })
})
