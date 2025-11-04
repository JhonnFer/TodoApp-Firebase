// src/domain/usecases/ToggleTodo.ts

import  { Todo, UpdateTodoDTO } from "../entities/todo"; // Asegúrate de importar UpdateTodoDTO si está en el mismo archivo
import { TodoRepository } from "../repositories/TodoRepository";


export class ToggleTodo {
    constructor(private todoRepository: TodoRepository) {}
    
    // 🛑 CORRECCIÓN: Acepta el DTO puro + userId para seguridad
    async execute(id: string, userId: string): Promise<Todo> { 
        
        if (!userId) {
            throw new Error("El ID de usuario es requerido para actualizar.");
        }

        const todo = await this.todoRepository.getById(id);
        
        if (!todo) {
            throw new Error("Todo no encontrado");
        }
        
        // 🚨 Validación de Propiedad (Dominio)
        if (todo.userId !== userId) {
            throw new Error("No tienes permiso para modificar esta tarea.");
        }

        // Creamos el DTO puro (sin userId)
        const updateData: UpdateTodoDTO = {
            id,
            completed: !todo.completed,
        };

        // ✅ Llamada al Repositorio con el DTO puro y el userId por separado
        return await this.todoRepository.update(updateData, userId);
    } 
}
