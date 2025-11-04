// src/domain/usecases/SendPasswordResetEmail.ts

import { AuthRepository } from '../repositories/AuthRepository';

// Regex simple para verificar un formato básico de email
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class SendPasswordResetEmail {
    constructor(private authRepository: AuthRepository) {}

    async execute(email: string): Promise<void> {
        if (!email || email.trim() === "") {
            throw new Error("El email es requerido.");
        }
        
        if (!EMAIL_REGEX.test(email)) {
            throw new Error("Formato de email inválido.");
        }

        // Delega la acción al repositorio
        return this.authRepository.sendPasswordResetEmail(email);
    }
}