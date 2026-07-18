import { test, expect } from '@playwright/test';

const TEST_TODO_TITLE = 'Comprar leche';

// Test: Verify that a user can create a new todo
test('user can create a new todo item', async ({ page }) => {
  // Login first
  await page.goto('/login');
  await page.locator('#email').fill('user@test.com');
  await page.locator('#password').fill('Test1234!');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL('/dashboard');

  // Navigate to the todo list
  await page.locator('[data-testid="nav-todos"]').click();
  await page.waitForURL('/todos');

  // Create a new todo
  await page.locator('[data-testid="todo-input"]').fill(TEST_TODO_TITLE);
  await page.locator('[data-testid="add-todo-button"]').click();

  // Wait for the todo to appear in the list
  await page.waitForSelector('[data-testid="todo-list"]');

  // Verify the todo was created by counting items with that title
  const todoItems = page.locator('[data-testid="todo-item"]', {
    hasText: TEST_TODO_TITLE,
  });
  const count = await todoItems.count();
  expect(todoItems).toHaveCount(1);
  // count()+toBe fallaba porque contaba una sola vez, antes de que el item apareciera.
  // todoItems no es un valor fijo es la intruccion de busqueda, y toHaveCount(1) verifica que 
  // haya exactamente un elemento que coincida con la busqueda
  // y reintenta hasta que haya un elemento que coincida con la busqueda
});

test('created todo appears with uncompleted state', async ({ page }) => {
  await page.goto('/login');
  await page.locator('#email').fill('user@test.com');
  await page.locator('#password').fill('Test1234!');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL('/dashboard');

  await page.locator('[data-testid="nav-todos"]').click();
  await page.waitForURL('/todos');

  // Create a todo with the same hardcoded title
  
  await page.locator('[data-testid="todo-input"]').fill(TEST_TODO_TITLE);
  await page.locator('[data-testid="add-todo-button"]').click();

  // Find the todo and check its checkbox is unchecked
  const todoCheckbox = page.locator('[data-testid="todo-item"]', {
    hasText: TEST_TODO_TITLE,
  }).locator('input[type="checkbox"]');

  await expect(todoCheckbox.first()).not.toBeChecked();
});
