import { test, expect } from '@playwright/test'

/**
 * Owner signup against the live app.
 *
 * Full happy-path (create account → land in /app) only runs when these
 * env vars are set, so we do not spam production with random accounts:
 *   OWNER_TEST_EMAIL
 *   OWNER_TEST_PASSWORD
 *   OWNER_TEST_FULL_NAME (optional)
 *   OWNER_TEST_BUSINESS (optional)
 */
test.describe('Sportiv Owner Web — signup', () => {
  test('shows validation when required fields are empty', async ({ page }) => {
    await page.goto('/signup')
    await page.getByRole('button', { name: 'Create account' }).click()

    // Stay on signup; HTML5 or form validation should block navigation.
    await expect(page).toHaveURL(/\/signup/)
    await expect(
      page.getByRole('heading', { name: 'Create owner account' }),
    ).toBeVisible()
  })

  test('rejects mismatched password confirmation', async ({ page }) => {
    await page.goto('/signup')

    await page.getByLabel('Full name').fill('Playwright Tester')
    await page.getByLabel('Business name').fill('Test Courts')
    await page
      .getByLabel('Email')
      .fill(`pw-mismatch-${Date.now()}@example.com`)
    await page.getByLabel('Password', { exact: true }).fill('Password123!')
    await page.getByLabel('Confirm password').fill('Different123!')
    await page.getByRole('button', { name: 'Create account' }).click()

    await expect(page).toHaveURL(/\/signup/)
    // Zod / RHF error copy may vary; assert we did not enter the app shell.
    await expect(page).not.toHaveURL(/\/app(\/|$)/)
  })

  test('registers a new owner and lands in the dashboard', async ({
    page,
  }) => {
    const email = process.env.OWNER_TEST_EMAIL
    const password = process.env.OWNER_TEST_PASSWORD
    test.skip(
      !email || !password,
      'Set OWNER_TEST_EMAIL and OWNER_TEST_PASSWORD to run live signup',
    )

    const stamp = Date.now()
    const uniqueEmail = email!.includes('+')
      ? email!.replace('@', `+pw${stamp}@`)
      : `pw.${stamp}.${email}`

    await page.goto('/signup')
    await page
      .getByLabel('Full name')
      .fill(process.env.OWNER_TEST_FULL_NAME ?? 'Playwright Owner')
    await page
      .getByLabel('Business name')
      .fill(process.env.OWNER_TEST_BUSINESS ?? 'Playwright Courts')
    await page.getByLabel('Email').fill(uniqueEmail)
    await page.getByLabel('Password', { exact: true }).fill(password!)
    await page.getByLabel('Confirm password').fill(password!)
    await page.getByRole('button', { name: 'Create account' }).click()

    await expect(page).toHaveURL(/\/app(\/|$)/, { timeout: 45_000 })
  })
})
