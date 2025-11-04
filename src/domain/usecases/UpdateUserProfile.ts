// src/domain/usecases/UpdateUserProfile.ts
import { AuthRepository } from '../repositories/AuthRepository';

export class UpdateUserProfile {
    constructor(private authRepository: AuthRepository) {}

    async execute(displayName: string): Promise<void> {
        if (!displayName || displayName.trim().length === 0) {
            throw new Error("El nombre de usuario no puede estar vacío.");
        }
        
        // La validación del negocio va aquí (e.g., longitud mínima)
        
        return this.authRepository.updateProfile(displayName);
    }
}