// app/(tabs)/profile.tsx

import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { useAuth } from '@/src/presentation/hooks/useAuth'; 
import { router } from 'expo-router';

export default function ProfileScreen() {
    // Obtener la lógica de autenticación y actualización
    const { user, loading, logout, updateProfile } = useAuth();
    
    // Estado local para el campo de texto. Usamos el valor actual del usuario.
    const [newDisplayName, setNewDisplayName] = useState(user?.displayName || '');
    const [isUpdating, setIsUpdating] = useState(false);

    // Sincronizar el estado local si el user cambia
    React.useEffect(() => {
        if (user) {
            setNewDisplayName(user.displayName || '');
        }
    }, [user]);

    // Función para actualizar el perfil
    const handleUpdate = async () => {
        const trimmedName = newDisplayName.trim();

        if (!trimmedName) {
            Alert.alert("Error", "El nombre no puede estar vacío.");
            return;
        }

        if (trimmedName === user?.displayName?.trim()) {
            Alert.alert("Aviso", "El nombre de usuario es el mismo que el actual.");
            return;
        }

        setIsUpdating(true);
        try {
            // Llamada al método expuesto por el hook, que usa el Use Case
            const success = await updateProfile(trimmedName); 

            if (success) {
                Alert.alert("Éxito", "Perfil actualizado correctamente. 🎉");
            } else {
                 Alert.alert("Error", "No se pudo actualizar el perfil. Intenta de nuevo.");
            }
        } catch (error) {
             Alert.alert("Error", "Ocurrió un error inesperado al actualizar.");
        } finally {
            setIsUpdating(false);
        }
    };
    
    // Función para cerrar la sesión
    const handleLogout = async () => {
        await logout();
        // Redirige a la pantalla pública
        router.replace('/(tabs)/login'); 
    };

    // Si el hook está cargando el estado de la sesión, mostramos el ActivityIndicator
    if (loading) {
        return (
            <View style={styles.centeredContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={styles.loadingText}>Verificando sesión...</Text>
            </View>
        ); 
    }

    if (!user) {
        return (
            <View style={styles.centeredContainer}>
                <Text>No hay usuario autenticado.</Text>
            </View>
        );
    }

    // UI principal
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Mi Perfil</Text>
            
            <View style={styles.infoContainer}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{user.email}</Text>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre de Usuario:</Text>
                <TextInput
                    style={styles.input}
                    value={newDisplayName}
                    onChangeText={setNewDisplayName}
                    placeholder="Escribe tu nuevo nombre"
                    editable={!isUpdating}
                />
                <Button 
                    title={isUpdating ? "Guardando..." : "Guardar Nombre"} 
                    onPress={handleUpdate} 
                    disabled={isUpdating || newDisplayName.trim().length === 0} 
                    color="#007AFF"
                />
            </View>
            
            <View style={styles.logoutButton}>
                <Button title="Cerrar Sesión" onPress={handleLogout} color="red" />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f0f0f5' },
    centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, color: '#333' },
    infoContainer: { 
        marginBottom: 25, 
        padding: 15, 
        backgroundColor: '#ffffff', 
        borderRadius: 10, 
        borderLeftWidth: 5,
        borderLeftColor: '#007AFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
    },
    label: { fontSize: 16, fontWeight: '600', color: '#555', marginBottom: 5 },
    value: { fontSize: 18, color: '#000' },
    inputGroup: { marginBottom: 30 },
    input: { 
        height: 45, 
        borderColor: '#ccc', 
        borderWidth: 1, 
        paddingHorizontal: 15, 
        marginBottom: 15,
        borderRadius: 8,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    logoutButton: { marginTop: 50 },
    loadingText: { marginTop: 10, fontSize: 16 }
});