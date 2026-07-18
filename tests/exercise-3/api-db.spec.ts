import { test, expect } from '@playwright/test';
import { LoginPage } from '../exercise-2/pages/login.page';
import { TodoListPage } from '../exercise-2/pages/todo-list.page';
import { findTodoByTitle, isTodoCompleted, cleanupTestTodos, closeConnection } from './db-helper';

const API = 'http://localhost:3000';
// Prefijo único para identificar los datos creados por estos tests y limpiarlos después.
const TEST_PREFIX = 'E3TEST';

// Helper: obtiene un token de autenticación vía API (POST /api/auth/login).
async function getToken(request: any): Promise<string> {
  const res = await request.post(`${API}/api/auth/login`, {
    data: { email: 'user@test.com', password: 'Test1234!' },
  });
  const body = await res.json();
  return body.token;
}

// Helper: hace login en la UI y navega a la lista de tareas.
async function loginUI(page: any) {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('user@test.com', 'Test1234!');
  await page.waitForURL('**/dashboard');
  const todoPage = new TodoListPage(page);
  await todoPage.goto();
  return todoPage;
}

// TEARDOWN idempotente: tras cada test, borra las tareas creadas por los tests
// (identificadas por el prefijo). cleanupTestTodos usa DELETE, que no falla si no
// hay coincidencias, por lo que ejecutarlo varias veces es seguro (idempotente).
test.afterEach(async () => {
  await cleanupTestTodos(TEST_PREFIX);
});

// Cierra el pool de conexiones al terminar todos los tests del archivo.
test.afterAll(async () => {
  await closeConnection();
});

// --- Test 1: API -> UI ---
test('Test 1: tarea creada por API aparece en la UI', async ({ page, request }) => {
  const token = await getToken(request);
  const title = `${TEST_PREFIX} API ${Date.now()}`;

  // Crear la tarea vía API REST.
  const res = await request.post(`${API}/api/todos`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { title },
  });
  expect(res.ok()).toBeTruthy();

  // Verificar en la UI que la tarea aparece.
  const todoPage = await loginUI(page);
  await page.reload();  // recarga para que la UI traiga los datos frescos de la DB
  await expect(todoPage.getTodo(title)).toHaveCount(1);
});

// --- Test 2: UI -> DB ---
test('Test 2: completar tarea en la UI se refleja en la DB', async ({ page }) => {
  const title = `${TEST_PREFIX} UIDB ${Date.now()}`;

  // Crear y completar la tarea en la UI.
  const todoPage = await loginUI(page);
  await todoPage.createTodo(title);
  await todoPage.completeTodo(title);

  // Consultar la DB directamente y verificar que completed = true.
  const record = await findTodoByTitle(title);
  expect(record).not.toBeNull();
  expect(await isTodoCompleted(record!.id)).toBe(true);
});

// --- Test 3: Setup y teardown idempotente ---
// El setup (crear datos) y el teardown (afterEach) ya demuestran idempotencia.
// Este test verifica que la limpieza deja la DB sin rastros del prefijo.
test('Test 3: teardown idempotente limpia solo los datos del test', async ({ request }) => {
  const token = await getToken(request);
  const title = `${TEST_PREFIX} CLEANUP ${Date.now()}`;

  // Crear un dato de prueba.
  await request.post(`${API}/api/todos`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { title },
  });

  // La limpieza es idempotente: llamarla dos veces seguidas no lanza error.
  await cleanupTestTodos(TEST_PREFIX);
  await cleanupTestTodos(TEST_PREFIX); // segunda llamada, no debe fallar

  // Tras limpiar, la tarea ya no existe en la DB.
  const record = await findTodoByTitle(title);
  expect(record).toBeNull();
});