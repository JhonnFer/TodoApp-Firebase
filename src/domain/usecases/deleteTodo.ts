import { TodoRepository } from "../repositories/TodoRepository";

export class DeleteTodo {
    constructor(private todoRepository: TodoRepository) {}
    
    // ✅ CORRECCIÓN: Ahora acepta el userId como segundo argumento
    async execute(id: string, userId: string): Promise<void> { 
        
        // 1. Validación de seguridad básica
        if (!userId) {
            throw new Error("El ID de usuario es requerido para eliminar.");
        }

        // 2. Verificar la propiedad antes de eliminar
        // Asumimos que el Repositorio tiene un método getById que devuelve la tarea completa.
        const todo = await this.todoRepository.getById(id);
        
        if (!todo) {
            // Si no existe, no hay problema, simplemente salimos.
            return;
        }

        // 🚨 Validación de Propiedad
        if (todo.userId !== userId) {
            throw new Error("Acción no autorizada. No tienes permiso para eliminar esta tarea.");
        }
        
        // 3. Llamar al repositorio con el requisito de seguridad.
        await this.todoRepository.delete(id, userId); // ⬅️ Asegúrate de que tu Repositorio ahora acepta 2 argumentos
    }
}
