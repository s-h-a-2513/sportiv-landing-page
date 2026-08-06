import { test, expect } from '@playwright/test'

test.describe('Sportiv Owner Web — public smoke', () => {
  test('root redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login/)
    await expect(
      page.getByRole('heading', { name: 'Sign in' }),
    ).toBeVisible()
    await expect(
      page.getByText(/manage your courts, bookings, and revenue/i),
    ).toBeVisible()
  })

  test('login form exposes email, password, and signup link', async ({
    page,
  }) => {
    await page.goto('/login')

    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Sign in' }),
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Create an account' }),
    ).toHaveAttribute('href', '/signup')
    await expect(
      page.getByRole('link', { name: 'Forgot password?' }),
    ).toBeVisible()
  })

  test('signup page shows owner registration fields', async ({ page }) => {
    await page.goto('/signup')

    await expect(
      page.getByRole('heading', { name: 'Create owner account' }),
    ).toBeVisible()
    await expect(page.getByLabel('Full name')).toBeVisible()
    await expect(page.getByLabel('Business name')).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible()
    await expect(page.getByLabel('Confirm password')).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Create account' }),
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Sign in' }),
    ).toHaveAttribute('href', '/login')
  })

  test('login → signup navigation works', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('link', { name: 'Create an account' }).click()
    await expect(page).toHaveURL(/\/signup/)
    await expect(
      page.getByRole('heading', { name: 'Create owner account' }),
    ).toBeVisible()
  })
})
