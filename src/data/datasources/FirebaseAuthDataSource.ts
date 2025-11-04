import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
  getAuth,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  updateDoc,
  setDoc, // Necesario para guardar en Firestore después del registro
  getDoc,  // Necesario para leer de Firestore después del login
} from "firebase/firestore";
import { auth, db } from "@/Firebaseconfig";
import { User } from "@/src/domain/entities/User";
// ❌ ELIMINAR: import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry"; 

export class FirebaseAuthDataSource {
  // Usamos las instancias importadas de Firebaseconfig.ts,
  // por lo que estas líneas de inicialización son redundantes.
  // private auth = getAuth();
  // private db = getFirestore();

  // ===== MÉTODO PRIVADO: CONVERTIR FIREBASEUSER A USER =====
  private mapFirebaseUserToUser(firebaseUser: FirebaseUser): User {
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || "",
      displayName: firebaseUser.displayName || "Usuario",
      createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
    };
  }

  // ===== REGISTRO DE USUARIO (Manejo de Errores Específicos) =====
  async register(
    email: string,
    password: string,
    displayName: string
  ): Promise<User> {
    try {
      // 1. Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      // 2. Actualizar perfil en Auth (displayName)
      await updateProfile(firebaseUser, {
        displayName,
      });

      // 3. Guardar datos adicionales en Firestore
      await setDoc(doc(db, "users", firebaseUser.uid), {
        email,
        displayName,
        createdAt: new Date(),
      });

      // 4. Retornar usuario mapeado
      // Usamos el displayName actualizado
      return {
        id: firebaseUser.uid,
        email,
        displayName,
        createdAt: new Date(),
      };
    } catch (error: any) {
      console.error("Error registering user:", error);

      // 🟢 CAPTURA Y CONVERSIÓN DE ERRORES DE FIREBASE A MENSAJES DE NEGOCIO
      if (error.code === "auth/email-already-in-use") {
        // ✅ Error específico solicitado: El mensaje que se le mostrará al usuario.
        throw new Error("Este email ya está registrado. Por favor, inicia sesión.");
      } else if (error.code === "auth/invalid-email") {
        throw new Error("El email proporcionado no es válido.");
      } else if (error.code === "auth/weak-password") {
        throw new Error("La contraseña es muy débil (mínimo 6 caracteres).");
      }

      throw new Error(error.message || "Error desconocido al registrar usuario");
    }
  }

  // ===== LOGIN (Manejo de Errores Específicos) =====
  async login(email: string, password: string): Promise<User> {
    try {
      // 1. Autenticar con Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      // 2. Obtener datos adicionales de Firestore
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      const userData = userDoc.data();

      // 3. Retornar usuario completo
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email || "",
        displayName:
          userData?.displayName || firebaseUser.displayName || "Usuario",
        createdAt: userData?.createdAt?.toDate() || new Date(),
      };
    } catch (error: any) {
      console.error("Error logging in:", error);

      // Mensajes de error más amigables
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        // En login, a menudo se usa un mensaje genérico por seguridad
        throw new Error("Credenciales inválidas. Por favor, verifica tu email y contraseña.");
      }

      throw new Error(error.message || "Error al iniciar sesión");
    }
  }

  // ===== LOGOUT =====
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error("Error logging out:", error);
      throw new Error(error.message || "Error al cerrar sesión");
    }
  }

  // ===== OBTENER USUARIO ACTUAL =====
  async getCurrentUser(): Promise<User | null> {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return null;

      return this.mapFirebaseUserToUser(firebaseUser);
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  // ===== ACTUALIZAR PERFIL =====
  async updateProfile(displayName: string): Promise<void> {
    const user = auth.currentUser; // Usamos 'auth' importado

    if (!user) {
      throw new Error("Usuario no autenticado para actualizar el perfil.");
    }

    // 1. Actualizar en Firebase Auth
    await updateProfile(user, { displayName });

    // 2. Actualizar en Firestore (colección 'users')
    const userRef = doc(db, "users", user.uid); // Usamos 'db' importado
    await updateDoc(userRef, {
      displayName: displayName,
      updatedAt: new Date().toISOString(),
    });
  }

  // ===== OBSERVAR CAMBIOS DE AUTENTICACIÓN =====
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    // Retorna función de desuscripción
    return firebaseOnAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        callback(this.mapFirebaseUserToUser(firebaseUser));
      } else {
        callback(null);
      }
    });
  }
}