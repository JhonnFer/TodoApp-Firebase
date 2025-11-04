import { TodoRepository } from "@/src/domain/repositories/TodoRepository"; 
import { Todo, CreateTodoDTO, UpdateTodoDTO } from 
"@/src/domain/entities/todo"; 
import { FirebaseTodoDataSource } from 
"../datasources/FirebaseTodoDataSource"; 
// 🟢 EXACTAMENTE LA MISMA ESTRUCTURA que antes 
// Solo cambia para incluir userId 
export class TodoRepositoryFirebaseImpl implements TodoRepository { 
constructor(private dataSource: FirebaseTodoDataSource) {} 
// ← MODIFICADO: ahora recibe userId 
async getAll(userId: string): Promise<Todo[]> { 
return await this.dataSource.getAllTodos(userId); 
} 
async getById(id: string): Promise<Todo | null> { 
return await this.dataSource.getTodoById(id); 
} 
// ← MODIFICADO: ahora usa data.userId 
async create(data: CreateTodoDTO): Promise<Todo> { 
return await this.dataSource.createTodo(data.title, data.userId); 
} 
async update(data: UpdateTodoDTO): Promise<Todo> { 
return await this.dataSource.updateTodo( 
data.id, 
data.completed, 
data.title 
); 
} 
async delete(id: string): Promise<void> { 
await this.dataSource.deleteTodo(id); 
} 
}