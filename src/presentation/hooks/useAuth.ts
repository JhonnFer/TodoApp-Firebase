import { useState, useEffect } from "react";
import { container } from "@/src/di/container";
import { User } from "@/src/domain/entities/User";

// ❌ ELIMINAR: const updateUserProfile = container.resolve<UpdateUserProfile>('UpdateUserProfile');
// ✅ USAR: El Getter del contenedor para acceder al Use Case
const updateUserProfile = container.updateUserProfile; 

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Observar cambios de autenticación (Persistencia de Sesión)
    useEffect(() => {
        const unsubscribe = container.authRepository.onAuthStateChanged(
            (authUser) => {
                setUser(authUser);
                setLoading(false);
            }
        );
        // Cleanup: desuscribirse cuando el componente se desmonte
        return () => unsubscribe();
    }, []);
    
    // --- Lógica de AUTH (Register, Login, Logout) ---
    
    const register = async (
        email: string,
        password: string,
        displayName: string
    ): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);
            const newUser = await container.registerUser.execute(
                email,
                password,
                displayName
            );
            setUser(newUser);
            return true;
        } catch (err: any) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);
            const loggedUser = await container.loginUser.execute(email, password);
            setUser(loggedUser);
            return true;
        } catch (err: any) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = async (): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);
            await container.logoutUser.execute();
            setUser(null);
            return true;
        } catch (err: any) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    };
    
    // --- NUEVO MÉTODO DE ACTUALIZACIÓN DE PERFIL ---
    const handleUpdateProfile = async (displayName: string): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);
            
            // 1. Ejecutar el Use Case de Dominio
            await updateUserProfile.execute(displayName);

            // 2. Opcional: El onAuthStateChanged (en el useEffect) de Firebase 
            // generalmente dispara una actualización que refresca el estado 'user'.
            // Si eso no sucede de inmediato, podemos actualizar el estado local:
            if (user) {
                 setUser({ ...user, displayName });
            }

            return true;
        } catch (err: any) {
            setError(err.message);
            console.error("Error al actualizar perfil:", err);
            return false;
        } finally {
            setLoading(false);
        }
    };


    // --- RETORNO FINAL ---
    return {
        user,
        loading,
        error,
        register,
        login,
        logout,
        isAuthenticated: !!user,
        updateProfile: handleUpdateProfile, // <-- EXPONER EL NUEVO MÉTODO
    };
};