import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
  getAuth,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  updateDoc,
  setDoc, 
  getDoc, 
} from "firebase/firestore";
import { auth, db } from "@/Firebaseconfig";
import { User } from "@/src/domain/entities/User";

// 🚀 NUEVO: Importación de AsyncStorage para la persistencia
import AsyncStorage from "@react-native-async-storage/async-storage"; 

const USER_SESSION_KEY = "user_session_id"; // Clave para AsyncStorage

export class FirebaseAuthDataSource {
  // ===== MÉTODO PRIVADO: CONVERTIR FIREBASEUSER A USER =====
  private mapFirebaseUserToUser(firebaseUser: FirebaseUser): User {
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || "",
      displayName: firebaseUser.displayName || "Usuario",
      createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
    };
  }
    
  // 🚀 NUEVO: Manejo de AsyncStorage
  private async saveSession(userId: string): Promise<void> {
      await AsyncStorage.setItem(USER_SESSION_KEY, userId);
  }

  // 🚀 NUEVO: Manejo de AsyncStorage
  private async clearSession(): Promise<void> {
      await AsyncStorage.removeItem(USER_SESSION_KEY);
  }

  // ===== REGISTRO DE USUARIO =====
  async register(
    email: string,
    password: string,
    displayName: string
  ): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      await updateProfile(firebaseUser, {
        displayName,
      });

      await setDoc(doc(db, "users", firebaseUser.uid), {
        email,
        displayName,
        createdAt: new Date(),
      });
        
      // 🛑 PERSISTENCIA DE SESIÓN
      await this.saveSession(firebaseUser.uid);

      return {
        id: firebaseUser.uid,
        email,
        displayName,
        createdAt: new Date(),
      };
    } catch (error: any) {
      console.error("Error registering user:", error);
      if (error.code === "auth/email-already-in-use") {
        throw new Error("Este email ya está registrado. Por favor, inicia sesión.");
      } else if (error.code === "auth/invalid-email") {
        throw new Error("El email proporcionado no es válido.");
      } else if (error.code === "auth/weak-password") {
        throw new Error("La contraseña es muy débil (mínimo 6 caracteres).");
      }
      throw new Error(error.message || "Error desconocido al registrar usuario");
    }
  }

  // ===== LOGIN =====
  async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      const userData = userDoc.data();
        
      // 🛑 PERSISTENCIA DE SESIÓN
      await this.saveSession(firebaseUser.uid);

      return {
        id: firebaseUser.uid,
        email: firebaseUser.email || "",
        displayName:
          userData?.displayName || firebaseUser.displayName || "Usuario",
        createdAt: userData?.createdAt?.toDate() || new Date(),
      };
    } catch (error: any) {
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        throw new Error("Credenciales inválidas. Por favor, verifica tu email y contraseña.");
      }
      throw new Error(error.message || "Error al iniciar sesión");
    }
  }

  // ===== LOGOUT =====
  async logout(): Promise<void> {
    try {
      // 🛑 PERSISTENCIA DE SESIÓN
      await this.clearSession(); 
      await signOut(auth);
    } catch (error: any) {
      console.error("Error logging out:", error);
      throw new Error(error.message || "Error al cerrar sesión");
    }
  }
    
  // ===== MÉTODO DE RECUPERACIÓN DE CONTRASEÑA =====
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
        // Usamos el 'auth' importado
        await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
        console.error("Error sending password reset email:", error);
        if (error.code === "auth/user-not-found") {
            throw new Error("Usuario no encontrado.");
        } else if (error.code === "auth/invalid-email") {
            throw new Error("Email inválido según el servicio.");
        }
        throw new Error("Error al enviar el correo de recuperación. Intenta más tarde.");
    }
  }

  // ===== OBTENER USUARIO ACTUAL (CLAVE PARA PERSISTENCIA) =====
  async getCurrentUser(): Promise<User | null> {
    const firebaseUser = auth.currentUser;
    
    try {
        // 1. Verificar si Firebase Auth ya tiene la sesión
        if (firebaseUser) {
            return this.mapFirebaseUserToUser(firebaseUser);
        }

        // 2. Si Firebase no lo detectó, verificamos AsyncStorage.
        // Esto es útil si el hook se llama muy rápido antes de que Firebase inicie.
        const userIdFromStorage = await AsyncStorage.getItem(USER_SESSION_KEY);
        
        // Si no hay nada persistido, no hay sesión.
        if (!userIdFromStorage) {
            return null;
        }

        // Si hay un ID en AsyncStorage, pero `auth.currentUser` es nulo, significa que
        // el token de Firebase está en proceso de carga o es inválido.
        // Devolvemos null aquí y confiamos en el listener (`onAuthStateChanged`)
        // para obtener el usuario tan pronto como Firebase termine de inicializar.
        return null; 
    } catch (error) {
        console.error("Error al obtener el usuario actual o AsyncStorage falló:", error);
        await this.clearSession(); 
        return null;
    }
  }

  // ===== ACTUALIZAR PERFIL =====
  async updateProfile(displayName: string): Promise<void> {
    const user = auth.currentUser; 

    if (!user) {
      throw new Error("Usuario no autenticado para actualizar el perfil.");
    }

    // 1. Actualizar en Firebase Auth
    await updateProfile(user, { displayName });

    // 2. Actualizar en Firestore (colección 'users')
    const userRef = doc(db, "users", user.uid); 
    await updateDoc(userRef, {
      displayName: displayName,
      updatedAt: new Date().toISOString(),
    });
  }

  // ===== OBSERVAR CAMBIOS DE AUTENTICACIÓN (CLAVE PARA useAuth) =====
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    // Este listener se dispara cuando la sesión se carga por persistencia.
    return firebaseOnAuthStateChanged(auth, async (firebaseUser) => { // Usamos 'async'
      if (firebaseUser) {
          // 🛑 PERSISTENCIA DE SESIÓN: Si el listener detecta un usuario (por persistencia), 
          // aseguramos que el ID esté en AsyncStorage (aunque Firebase lo maneja, esto es por robustez).
          await this.saveSession(firebaseUser.uid);

          // 1. Mapear el usuario de Firebase Auth
          const mappedUser = this.mapFirebaseUserToUser(firebaseUser);
          
          // 2. Opcional: obtener datos de Firestore si se necesitan (ya está hecho en login/register)
          // Para evitar llamadas a DB innecesarias, solo devolvemos el mapeado simple.
          callback(mappedUser);
      } else {
          // 🛑 PERSISTENCIA DE SESIÓN: Si el listener detecta un usuario nulo (logout o token expirado)
          await this.clearSession();
        callback(null);
      }
    });
  }
}
