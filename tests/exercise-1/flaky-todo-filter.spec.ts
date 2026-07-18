import { test, expect } from '@playwright/test';

// Test: Verify that todo filters work correctly
test.describe('Todo filtering', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to todos
    await page.goto('/login');
    await page.locator('#email').fill('user@test.com');
    await page.locator('#password').fill('Test1234!');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('/dashboard');
    await page.locator('[data-testid="nav-todos"]').click();
    await page.waitForURL('/todos');
  });

  test('filter shows only active todos', async ({ page }) => {
    // Click on the "Active" filter button using CSS selectors

    await page.getByTestId('filter-active').click();
    // los tests usaban selectores CSS acoplados a la implementación
    // cambie por el selector getByTestId que
    // identifican los elementos el id de testing que se le asigna a cada elemento de la aplicacion.


    // Verify all visible todos are unchecked
    const checkboxes = page.getByTestId('todo-item').locator('input[type="checkbox"]');
    // getByTestId('todo-item') en vez de la cadena div.MuiList-root > div.MuiListItem-root:


    const count = await checkboxes.count();
    for (let i = 0; i < count; i++) {
      await expect(checkboxes.nth(i)).not.toBeChecked();
    }
  });

  test('filter shows only completed todos', async ({ page }) => {
    // Click on "Completed" filter using implementation-specific selectors
    await page.locator(
      'div.filter-section > div:nth-child(1) > button:nth-child(3)'
    ).click();

    // Verify all visible todos have completed styling
    const todoItems = page.locator(
      'ul.MuiList-root > li.MuiListItem-root'
    );

    const count = await todoItems.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const item = todoItems.nth(i);
      // Check for the strikethrough class that MUI applies
      const textDecoration = await item.locator('span.MuiTypography-root').evaluate(
        (el) => getComputedStyle(el).textDecoration
      );
      expect(textDecoration).toContain('line-through');
    }
  });

  test('filter "All" shows all todos', async ({ page }) => {
    // Click "All" filter
    await page.locator(
      '.filter-buttons > .MuiButtonGroup-grouped:first-child'
    ).click();

    // Count total todos visible
    const allTodos = page.locator('div.MuiList-root > div.MuiListItem-root');
    const count = await allTodos.count();
    expect(count).toBeGreaterThan(0);
  });
});
