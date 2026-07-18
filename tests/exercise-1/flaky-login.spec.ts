import { test, expect } from '@playwright/test';

// Test: Verify that a user can log in and is redirected to the dashboard
test('user can login with valid credentials', async ({ page }) => {
  await page.goto('/login');

  // Fill in the login form
  await page.locator('#email').fill('user@test.com');
  await page.locator('#password').fill('Test1234!');

  // Submit the form
  await page.locator('button[type="submit"]').click();

  // Verify redirect to dashboard
  await expect(page).toHaveURL('/dashboard');
  //Fallaba por que se leia la URL sin esperar a que se redirigiera, por eso se agrego la espera de URL
  //Se cambia el assertion por toHaveURL que reintenta hasta que la URL sea la esperada.

  // Verify welcome message is displayed
  const welcomeMessage = page.locator('[data-testid="welcome-message"]');
  await expect(welcomeMessage).toBeVisible();
});

test('user sees error with invalid credentials', async ({ page }) => {
  await page.goto('/login');

  await page.locator('#email').fill('wrong@test.com');
  await page.locator('#password').fill('WrongPass!');

  await page.locator('button[type="submit"]').click();

  // Verify error is shown
  const errorAlert = page.locator('[data-testid="login-error"]');
  await expect(errorAlert).toBeVisible();
  await expect(errorAlert).toContainText('credenciales');
});
