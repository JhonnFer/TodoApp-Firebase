import { AuthRepository } from "@/src/domain/repositories/AuthRepository"; 
import { User } from "@/src/domain/entities/User"; 
import { FirebaseAuthDataSource } from 
"../datasources/FirebaseAuthDataSource"; 

export class AuthRepositoryImpl implements AuthRepository { 
    // ✅ La propiedad se define aquí como 'dataSource'
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

    async getCurrentUser(): Promise<User | null> { 
        return this.dataSource.getCurrentUser(); 
    } 

    async updateProfile(displayName: string): Promise<void> {
        return this.dataSource.updateProfile(displayName);
    }
    
    // ✅ MÉTODO DE RECUPERACIÓN DE CONTRASEÑA CORREGIDO
    async sendPasswordResetEmail(email: string): Promise<void> {
        // 🚀 Corregido: Usar this.dataSource en lugar de this.authDataSource
        return this.dataSource.sendPasswordResetEmail(email); 
    }

    onAuthStateChanged(callback: (user: User | null) => void): () => void { 
        return this.dataSource.onAuthStateChanged(callback); 
    } 
}