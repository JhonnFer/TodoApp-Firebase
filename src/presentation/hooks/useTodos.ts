// src/presentation/hooks/useTodos.ts

// 🟢 CUSTOM HOOK: La UI solo interactúa con este hook 
// No conoce nada sobre SQLite, repositorios, o use cases 
import { container } from "@/src/di/container"; 
import { Todo } from "@/src/domain/entities/todo"; 
import { useCallback, useEffect, useState } from "react"; 
import { Alert } from "react-native"; 
import { useAuth } from "./useAuth"; 

export const useTodos = () => { 
  const [todos, setTodos] = useState<Todo[]>([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState<string | null>(null); 
  const { user } = useAuth();
  
  const loadTodos = useCallback(async () => { 
    if (!user) { 
      setTodos([]); 
      setLoading(false); 
      return; 
    } 
    try { 
      setLoading(true); 
      setError(null); 
      // La nomenclatura es correcta: container.getAllTodos.execute
      const result = await container.getAllTodos.execute(user.id); 
      setTodos(result); 
    } catch (err) { 
      const message = err instanceof Error ? err.message : "Error desconocido"; 
      setError(message); 
      Alert.alert("Error", "No se pudieron cargar las tareas"); 
    } finally { 
      setLoading(false); 
    } 
  }, [user]);
  
  useEffect(() => { 
    loadTodos(); 
  }, [loadTodos]); 
  
  const addTodo = async (title: string): Promise<boolean> => { 
    if (!user) { 
      Alert.alert("Error", "Debes estar autenticado para agregar tareas"); 
      return false; 
    } 
    
    try { 
      // La nomenclatura es correcta: container.createTodo.execute
      const newTodo = await container.createTodo.execute({ 
        title, 
        userId: user.id, 
      }); 
      setTodos([newTodo, ...todos]); 
      return true; 
    } catch (err) { 
      const message = 
        err instanceof Error ? err.message : "Error al agregar tarea"; 
      Alert.alert("Error", message); 
      return false; 
    } 
  }; 
  
  // 🚀 CORRECCIÓN: Pasar el user.id al Use Case
  const toggleTodo = async (id: string): Promise<void> => { 
    if (!user) {
      Alert.alert("Error", "Debes estar autenticado para actualizar tareas.");
      return;
    }
    try { 
      // 🛑 CORREGIDO: Se pasa el user.id
      const updatedTodo = await container.toggleTodo.execute(id, user.id); 
      setTodos(todos.map((t) => (t.id === id ? updatedTodo : t))); 
    } catch (err) { 
      Alert.alert("Error", "No se pudo actualizar la tarea"); 
    } 
  }; 
  
  // 🚀 CORRECCIÓN: Pasar el user.id al Use Case
  const deleteTodo = async (id: string): Promise<void> => { 
    if (!user) {
      Alert.alert("Error", "Debes estar autenticado para eliminar tareas.");
      return;
    }
    try { 
      // 🛑 CORREGIDO: Se pasa el user.id
      await container.deleteTodo.execute(id, user.id); 
      setTodos(todos.filter((t) => t.id !== id)); 
    } catch (err) { 
      Alert.alert("Error", "No se pudo eliminar la tarea"); 
    } 
  }; 

  return { 
    todos, 
    loading, 
    error, 
    addTodo, 
    toggleTodo, 
    deleteTodo, 
    refresh: loadTodos, 
  }; 
};