import { AuthRepository } from "@/src/domain/repositories/AuthRepository"; 
import { User } from "@/src/domain/entities/User"; 
import { FirebaseAuthDataSource } from 
"../datasources/FirebaseAuthDataSource"; 

export class AuthRepositoryImpl implements AuthRepository { 
    // ✅ Se inyecta la dependencia (Fuente de Datos)
    constructor(private dataSource: FirebaseAuthDataSource) {} 

    async register( 
        email: string, 
        password: string, 
        displayName: string 
    ): Promise<User> { 
        return this.dataSource.register(email, password, displayName); 
    } 

    async login(email: string, password: string): Promise<User> { 
        return this.dataSource.login(email, password); 
    } 

    async logout(): Promise<void> { 
        return this.dataSource.logout(); 
    } 

    // 🛑 MÉTODO CRÍTICO para Persistencia de Sesión
    async getCurrentUser(): Promise<User | null> { 
        // Delega la verificación de la sesión (Firebase/AsyncStorage) a la Fuente de Datos
        return this.dataSource.getCurrentUser(); 
    } 

    async updateProfile(displayName: string): Promise<void> {
        return this.dataSource.updateProfile(displayName);
    }
    
    async sendPasswordResetEmail(email: string): Promise<void> {
        return this.dataSource.sendPasswordResetEmail(email); 
    }

    // 🛑 MÉTODO CRÍTICO para el Listener de Sesión en React
    onAuthStateChanged(callback: (user: User | null) => void): () => void { 
        return this.dataSource.onAuthStateChanged(callback); 
    } 
}
