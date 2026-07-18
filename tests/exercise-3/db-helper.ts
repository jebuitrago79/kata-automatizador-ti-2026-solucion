import { Pool, QueryResult } from 'pg';

/**
 * Database helper for test setup and teardown.
 * Complete the TODOs below as part of Exercise 3.
 */

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'tododb',
  user: process.env.DB_USER || 'testuser',
  password: process.env.DB_PASSWORD,
});

export interface TodoRecord {
  id: number;
  title: string;
  completed: boolean;
  user_id: number;
  created_at: Date;
}

/**
 * TODO: Implement a function that queries a todo by its title.
 * Must use parameterized queries to prevent SQL injection.
 */
export async function findTodoByTitle(title: string): Promise<TodoRecord | null> {
  // $1 es un parámetro: pg lo sustituye de forma segura, evitando inyección SQL.
  const result: QueryResult<TodoRecord> = await pool.query(
    'SELECT * FROM todos WHERE title = $1',
    [title]
  );
  // Devuelve la primera fila si existe, o null si no hay resultados.
  return result.rows[0] ?? null;
}

/**
 * TODO: Implement a function that checks if a todo is marked as completed.
 * Returns the completed status for a given todo ID.
 */
export async function isTodoCompleted(todoId: number): Promise<boolean> {
  const result: QueryResult<{ completed: boolean }> = await pool.query(
    'SELECT completed FROM todos WHERE id = $1',
    [todoId]
  );
  // Si no existe la tarea, devuelve false; si existe, su estado completed.
  return result.rows[0]?.completed ?? false;
}
/**
 * TODO: Implement an idempotent cleanup function.
 * Should delete only todos created during tests (identified by a prefix or pattern).
 * Must not throw if the records don't exist.
 */
export async function cleanupTestTodos(titlePrefix: string): Promise<void> {
  // LIKE con $1 || '%' borra los títulos que empiezan con el prefijo.
  // DELETE no falla si no encuentra filas, por eso es naturalmente idempotente.
  await pool.query(
    "DELETE FROM todos WHERE title LIKE $1 || '%'",
    [titlePrefix]
  );
}

/**
 * Close the database connection pool.
 * Call this in afterAll or globalTeardown.
 */
export async function closeConnection(): Promise<void> {
  await pool.end();
}
