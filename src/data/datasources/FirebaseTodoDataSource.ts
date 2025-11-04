import { 
collection, 
addDoc, 
getDocs, 
doc, 
getDoc, 
updateDoc, 
deleteDoc, 
query, 
  orderBy, 
  where, 
  Timestamp, 
} from "firebase/firestore"; 
import { db } from "@/Firebaseconfig"; 
import { Todo } from "@/src/domain/entities/todo"; 
 
export class FirebaseTodoDataSource { 
  private collectionName = "todos"; 
 
  async initialize(): Promise<void> { 
    console.log("Firebase initialized"); 
  } 
 
  async getAllTodos(userId: string): Promise<Todo[]> { 
    const q = query( 
      collection(db, this.collectionName), 
      where("userId", "==", userId), 
      orderBy("createdAt", "desc") 
    ); 
 
    const querySnapshot = await getDocs(q); 
 
    return querySnapshot.docs.map((docSnapshot) => { 
      const data = docSnapshot.data(); 
      return { 
        id: docSnapshot.id, 
        title: data.title, 
        completed: data.completed, 
        createdAt: data.createdAt.toDate(), 
        userId: data.userId, 
      }; 
    }); 
  } 
 
  async getTodoById(id: string): Promise<Todo | null> { 
    const docRef = doc(db, this.collectionName, id); 
    const docSnap = await getDoc(docRef); 
 
    if (!docSnap.exists()) return null; 
 
    const data = docSnap.data(); 
    return { 
      id: docSnap.id, 
      title: data.title, 
      completed: data.completed, 
      createdAt: data.createdAt.toDate(), 
      userId: data.userId, 
    }; 
  } 
 
  async createTodo(title: string, userId: string): Promise<Todo> { 
    const newTodo = { 
      title, 
      completed: false, 
      createdAt: Timestamp.now(), 
      userId, 
    }; 
 
    const docRef = await addDoc(collection(db, this.collectionName), 
newTodo); 
 
    return { 
      id: docRef.id, 
      title, 
      completed: false, 
      createdAt: new Date(), 
      userId, 
    }; 
  } 
 
  // 🚀 CORRECCIÓN EN updateTodo
  async updateTodo( 
    id: string, 
    completed?: boolean, 
    title?: string,
    userId?: string // ⬅️ NUEVO: ACEPTAR EL ID DE USUARIO
  ): Promise<Todo> { 
    const docRef = doc(db, this.collectionName, id); 
 
    // 1. Verificar la propiedad antes de actualizar
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
        throw new Error("Tarea no encontrada.");
    }

    const taskData = docSnap.data();
    // 🚨 VERIFICACIÓN DE SEGURIDAD
    if (userId && taskData.userId !== userId) {
        // Aunque el Dominio ya validó, esta es la última línea de defensa
        throw new Error("Acción no autorizada. No eres el dueño de esta tarea.");
    }
    
    const updates: any = {}; 
    if (completed !== undefined) updates.completed = completed; 
    if (title !== undefined) updates.title = title; 
 
    if (Object.keys(updates).length > 0) {
        await updateDoc(docRef, updates); 
    }
 
    const updated = await this.getTodoById(id); 
    if (!updated) throw new Error("Todo not found after update"); 
 
    return updated; 
  } 
 
  // 🚀 CORRECCIÓN EN deleteTodo
  async deleteTodo(id: string, userId: string): Promise<void> { // ⬅️ NUEVO: ACEPTAR EL ID DE USUARIO
    const docRef = doc(db, this.collectionName, id); 

    // 1. Verificar la propiedad antes de eliminar
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
        // Si no existe, no hay nada que eliminar, podemos salir sin error
        return;
    }

    const taskData = docSnap.data();
    // 🚨 VERIFICACIÓN DE SEGURIDAD
    if (taskData.userId !== userId) {
        throw new Error("Acción no autorizada. No puedes eliminar la tarea de otro usuario.");
    }
    
    // 2. Ejecutar la eliminación
    await deleteDoc(docRef); 
  } 
}
