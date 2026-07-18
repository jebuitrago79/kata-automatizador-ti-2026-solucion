import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { TodoListPage } from './pages/todo-list.page';
import { TodoBuilder } from './builders/todo.builder'; 

// Antes de cada test: login y navegación a la lista de tareas.
// Así cada test empieza ya autenticado y en /todos, sin repetir esos pasos.
test.beforeEach(async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('user@test.com', 'Test1234!');

  // Espera a que el login complete la redirección al dashboard antes de seguir.
  await page.waitForURL('**/dashboard');

  const todoPage = new TodoListPage(page);
  await todoPage.goto();
});

test('crear una tarea la muestra en la lista', async ({ page }) => {
  const todoPage = new TodoListPage(page);
  const titulo = `Crear ${Date.now()}`;
  await todoPage.createTodo(titulo);
  await expect(todoPage.getTodo(titulo)).toHaveCount(1);
});

test('completar una tarea marca su checkbox', async ({ page }) => {
  const todoPage = new TodoListPage(page);
  const titulo = `Completar ${Date.now()}`;
  await todoPage.createTodo(titulo);
  await todoPage.completeTodo(titulo);
  await expect(
    todoPage.getTodo(titulo).locator('input[type="checkbox"]')
  ).toBeChecked();
});

test('editar el título muestra el nuevo texto', async ({ page }) => {
  const todoPage = new TodoListPage(page);
  const original = `Original ${Date.now()}`;
  const nuevo = `Editada ${Date.now()}`;
  await todoPage.createTodo(original);
  await todoPage.editTodo(original, nuevo);
  await expect(todoPage.getTodo(nuevo)).toHaveCount(1);
  await expect(todoPage.getTodo(original)).toHaveCount(0);
});

test('eliminar una tarea la quita de la lista', async ({ page }) => {
  const todoPage = new TodoListPage(page);
  const titulo = `Eliminar ${Date.now()}`;
  await todoPage.createTodo(titulo);
  await todoPage.deleteTodo(titulo);
  await expect(todoPage.getTodo(titulo)).toHaveCount(0);
});

test('filtrar por completadas muestra solo las completadas', async ({ page }) => {
  const todoPage = new TodoListPage(page);
  const titulo = `Filtrar ${Date.now()}`;
  await todoPage.createTodo(titulo);
  await todoPage.completeTodo(titulo);
  await todoPage.filterBy('completed');
  await expect(todoPage.getTodo(titulo)).toHaveCount(1);
});

test('crear tarea con builder', async ({ page }) => {
  const todoPage = new TodoListPage(page);
  const todo = new TodoBuilder().withTitle('Crear').build();
  await todoPage.createTodo(todo.title);
  await expect(todoPage.getTodo(todo.title)).toHaveCount(1);
});