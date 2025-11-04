// 🟢 CONTRATO: Define QUÉ operaciones existen, no CÓMO se implementan 
// Esta es la clave de Clean Architecture 
import { Todo, CreateTodoDTO, UpdateTodoDTO } from "../entities/todo"; 
export interface TodoRepository { 
getAll(userId: string): Promise<Todo[]>; // ← MODIFICADO: filtrar por userId 
getById(id: string): Promise<Todo | null>; 
create(todo: CreateTodoDTO): Promise<Todo>; // ← Ahora CreateTodoDTO incluye userId 
update(data: UpdateTodoDTO, userId: string): Promise<Todo>;//La interfaz exige el DTO puro y el userId para la autorización
delete(id: string, userId: string): Promise<void>; 
} 