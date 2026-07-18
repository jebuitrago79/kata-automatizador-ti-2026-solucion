// Representa los datos de una tarea de prueba.
export interface TodoData {
  title: string;
  completed: boolean;
}

// TodoBuilder: genera datos de tarea dinámicos y únicos para los tests (patrón Builder).
// Evita hardcodear títulos, previniendo colisiones entre tests y datos acumulados.
// Cada método "with..." sobrescribe un valor y devuelve 'this' para encadenar llamadas.
export class TodoBuilder {
  // Valores por defecto: título único (timestamp + aleatorio) y no completada.
  private title: string = `Tarea ${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  private completed: boolean = false;

  // Sobrescribe el título con un prefijo legible, manteniéndolo único.
  withTitle(title: string): this {
    this.title = `${title} ${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    return this;
  }

  // Marca la tarea como completada.
  asCompleted(): this {
    this.completed = true;
    return this;
  }

  // Construye y devuelve el objeto final con los datos acumulados.
  build(): TodoData {
    return {
      title: this.title,
      completed: this.completed,
    };
  }
}