import { Page, Locator } from "@playwright/test";

// TodoListPage: encapsula la lista de tareas y todas las acciones del usuario sobre ella
// (crear, completar, editar, eliminar, filtrar).
export class TodoListPage {
    private readonly page: Page;

    // Locators de elementos fijos y únicos de la página (tienen data-testid propio).
    private readonly todoInput: Locator;
    private readonly addButton: Locator;
    private readonly todoList: Locator;

    constructor(page: Page) {
        this.page = page;
        this.todoInput = page.getByTestId("todo-input");
        this.addButton = page.getByTestId("add-todo-button");
        this.todoList = page.getByTestId("todo-list");
    }

    // Acción: navegar a la lista de tareas y esperar a que el input esté visible,
    // garantizando que la página cargó antes de que un test intente usarla.
    async goto() {
        await this.page.goto("/todos");
        await this.todoInput.waitFor({ state: "visible" });
    }

    // Helper privado: devuelve el locator de una tarea concreta, identificada por su título.
    // Filtra todos los todo-item por su texto visible. Es la base de completeTodo, deleteTodo
    // y editTodo, que necesitan ubicar primero la tarea sobre la que actúan.
    // Es 'private' porque solo se usa internamente; los tests no lo llaman directamente.
    private todoByTitle(title: string): Locator {
        return this.page.getByTestId("todo-item").filter({ hasText: title });
    }

    // Acción: crear una tarea nueva escribiendo el título y pulsando Agregar.
    async createTodo(title: string) {
        await this.todoInput.fill(title);
        await this.addButton.click();
    }

    // Acción: marcar una tarea como completada activando su checkbox.
    // .check() marca el checkbox y verifica que quede marcado (a diferencia de .click()).
    async completeTodo(title: string) {
        await this.todoByTitle(title).locator('input[type="checkbox"]').check();
    }

    // Acción: eliminar una tarea. El botón no tiene data-testid, así que se localiza por
    // su rol y nombre accesible (aria-label="Eliminar") en vez de por su clase CSS.
    async deleteTodo(title: string) {
        await this.todoByTitle(title).getByRole("button", { name: "Eliminar" }).click();
    }

    // Acción: editar el título de una tarea.
    // Al hacer doble click, el label se convierte en <input class="edit-input"> y el texto
    // deja de ser visible como texto, por lo que ya no se puede localizar por hasText.
    // Se busca el edit-input directamente (solo hay uno activo al editar).
    async editTodo(oldTitle: string, newTitle: string) {
        await this.todoByTitle(oldTitle).dblclick();

        const editInput = this.page.locator('.edit-input');
        await editInput.waitFor({ state: "visible" });
        await editInput.press("ControlOrMeta+a");
        await editInput.fill(newTitle);
        await editInput.press("Enter");
    }

    // Acción: filtrar la lista por estado.
    // Los tres filtros comparten el patrón de data-testid "filter-{estado}"
    // (filter-all, filter-active, filter-completed). En vez de declarar tres
    // locators y tres métodos casi idénticos, se construye el testid dinámicamente.
    async filterBy(filter: "all" | "active" | "completed") {
        await this.page.getByTestId(`filter-${filter}`).click();
    }

    // Consulta: expone el locator de una tarea por título para aserciones en los tests.
    getTodo(title: string): Locator {
        return this.todoByTitle(title);
    }
}