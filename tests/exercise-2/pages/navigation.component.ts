import { Page, Locator } from "@playwright/test";

// NavigationComponent: encapsula la barra de navegación superior (Dashboard, Mis Tareas,
// Cerrar sesión). Responsabilidad única: solo la navegación entre secciones.
// Se llama "component" y no "page" porque no es una página completa, sino un elemento
// compartido que aparece en varias páginas.
export class NavigationComponent {
  private readonly page: Page;

  private readonly dashboardLink: Locator;
  private readonly todosLink: Locator;
  private readonly logoutLink: Locator;

  constructor(page: Page) {
    this.page = page;
    // Dashboard no tiene data-testid ni id: se localiza por su rol de link y su texto.
    this.dashboardLink = page.getByRole("link", { name: "Dashboard" });
    // Mis Tareas tiene data-testid propio.
    this.todosLink = page.getByTestId("nav-todos");
    // Cerrar sesión se identifica por su id.
    this.logoutLink = page.locator("#logoutLink");
  }

  // Acción: ir a la sección Dashboard.
  async goToDashboard() {
    await this.dashboardLink.click();
  }

  // Acción: ir a la lista de tareas ("Mis Tareas").
  async goToTodos() {
    await this.todosLink.click();
  }

  // Acción: cerrar sesión.
  async logout() {
    await this.logoutLink.click();
  }
}