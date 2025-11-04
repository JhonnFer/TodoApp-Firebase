// src/data/repositories/TodoRepositoryFirebaseImpl.ts

import { TodoRepository } from "@/src/domain/repositories/TodoRepository"; 
import { Todo, CreateTodoDTO, UpdateTodoDTO } from "@/src/domain/entities/todo"; 
import { FirebaseTodoDataSource } from "../datasources/FirebaseTodoDataSource"; 

export class TodoRepositoryFirebaseImpl implements TodoRepository { 
    constructor(private dataSource: FirebaseTodoDataSource) {} 
    
    async getAll(userId: string): Promise<Todo[]> { 
        return await this.dataSource.getAllTodos(userId); 
    } 
    
    async getById(id: string): Promise<Todo | null> { 
        // Nota: Idealmente getById también debería recibir userId por seguridad.
        return await this.dataSource.getTodoById(id); 
    } 
    
    async create(data: CreateTodoDTO): Promise<Todo> { 
        return await this.dataSource.createTodo(data.title, data.userId); 
    } 
    
    // 🚀 CORRECCIÓN EN UPDATE
    // ✅ Ahora acepta userId
    async update(data: UpdateTodoDTO, userId: string): Promise<Todo> { 
        // 🛑 Propagamos el userId a la Fuente de Datos
        return await this.dataSource.updateTodo( 
            data.id, 
            data.completed, 
            data.title,
            userId // ⬅️ NUEVO: El requisito de seguridad
        ); 
    } 
    
    // 🚀 CORRECCIÓN EN DELETE
    // ✅ Ahora acepta userId
    async delete(id: string, userId: string): Promise<void> { 
        // 🛑 Propagamos el userId a la Fuente de Datos
        await this.dataSource.deleteTodo(id, userId);
    } 
}