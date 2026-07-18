import { Page, Locator } from "@playwright/test";

// LoginPage: Page Object que encapsula la pantalla de login.
// Los locators se declaran como propiedades y se preparan una vez en el constructor;
// los métodos exponen acciones del usuario (goto, login).
export class LoginPage {
  // 'page' es la pestaña del navegador que Playwright controla.
  private readonly page: Page;

  // Locators: las "instrucciones de búsqueda" de cada elemento del formulario.
  // Declararlos aquí permite reutilizarlos y cambiarlos en un solo lugar si la UI cambia.
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // Selectores por id/atributo: estables y semánticos.
    // Son los que ya validamos en el ejercicio 1.
    this.emailInput = page.locator("#email");
    this.passwordInput = page.locator("#password");
    this.submitButton = page.locator('button[type="submit"]');
  }

  // Acción: navegar a la pantalla de login.
  async goto() {
    await this.page.goto("/login");
  }

  // Acción: iniciar sesión. Representa lo que hace el usuario (llenar credenciales
  // y enviar), no operaciones técnicas sueltas.
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}