import { test as base } from "@playwright/test";
import { LoginPage } from "../pages/login.page";
import { TodoListPage } from "../pages/todo-list.page";
import { TodoBuilder } from "../builders/todo.builder";

// Definimos qué fixtures personalizados añadimos, con sus tipos.
type TodoFixtures = {
  // Una página ya autenticada y ubicada en /todos, lista para probar tareas.
  todoPage: TodoListPage;
  // Una página con datos precargados (varias tareas ya creadas).
  todoPageWithData: TodoListPage;
};

// Extendemos el 'test' base de Playwright con nuestros fixtures.
export const test = base.extend<TodoFixtures>({
  // Fixture: usuario autenticado + navegación a la lista de tareas.
  // Hace login una vez y entrega el TodoListPage listo, evitando repetir el login.
  todoPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login("user@test.com", "Test1234!");
    await page.waitForURL("**/dashboard");

    const todoPage = new TodoListPage(page);
    await todoPage.goto();

    // 'use' entrega el fixture al test. El código antes de 'use' es el setup;
    // lo que va después (si lo hubiera) sería el teardown.
    await use(todoPage);
  },

  // Fixture: página autenticada CON al menos 3 tareas precargadas.
  // Reutiliza el fixture 'todoPage' y le añade datos usando el builder.
  todoPageWithData: async ({ todoPage }, use) => {
    for (let i = 0; i < 3; i++) {
      const todo = new TodoBuilder().withTitle(`Precargada ${i}`).build();
      await todoPage.createTodo(todo.title);
    }
    await use(todoPage);
  },
});

// Reexportamos 'expect' para usarlo junto al 'test' extendido.
export { expect } from "@playwright/test";