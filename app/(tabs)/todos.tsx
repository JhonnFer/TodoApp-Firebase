
// app/(tabs)/todos.tsx

import { useAuth } from "@/src/presentation/hooks/useAuth";
import { useRouter } from "expo-router";
import { useTodos } from "@/src/presentation/hooks/useTodos";
import { createStyles, defaultLightTheme, defaultDarkTheme } from "@/src/presentation/styles/todos.styles"; 
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { useState, useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert, // ⬅️ 1. IMPORTAR ALERT
} from "react-native";

export default function TodosScreenClean() {
  const [inputText, setInputText] = useState("");
  const { todos, loading, addTodo, toggleTodo, deleteTodo } = useTodos();
  const { user } = useAuth();
  const router = useRouter();

  // 🎨 Detectar tema y crear estilos dinámicamente
  const colorScheme = useColorScheme();
  const styles = useMemo(
    () => createStyles(colorScheme === 'dark' ? defaultDarkTheme : defaultLightTheme),
    [colorScheme]
  );

  const handleAddTodo = async () => {
    if (!inputText.trim()) return;

    const success = await addTodo(inputText); 
    if (success) {
      setInputText("");
    }
  };

  // 🚀 2. FUNCIÓN DE CONFIRMACIÓN
  const confirmDelete = (id: string) => {
    Alert.alert(
        "Confirmar Eliminación",
        "¿Estás seguro de que quieres eliminar esta tarea? Esta acción no se puede deshacer.",
        [
            { 
                text: "Cancelar", 
                style: "cancel" // No hace nada, cierra la alerta
            },
            { 
                text: "Eliminar", 
                style: "destructive", // Muestra el botón en rojo (UX)
                onPress: () => deleteTodo(id), // ⬅️ LLAMA A LA FUNCIÓN DEL HOOK SOLO SI CONFIRMA
            }, 
        ]
    );
  };
  // 🚀 FIN FUNCIÓN DE CONFIRMACIÓN

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator
          size="large"
          color={colorScheme === 'dark' ? defaultDarkTheme.primary : defaultLightTheme.primary}
        />
        <Text style={styles.loadingText}>Cargando tareas...</Text>
      </View>
    );
  }

  const renderTodo = ({ item }: { item: any }) => (
    <View style={styles.todoItem}>
      <TouchableOpacity
        style={styles.todoContent}
        onPress={() => toggleTodo(item.id)}
      >
        <View
          style={[styles.checkbox, item.completed && styles.checkboxChecked]}
        >
          {item.completed && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text
          style={[styles.todoText, item.completed && styles.todoTextCompleted]}
        >
          {item.title}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => confirmDelete(item.id)} // ⬅️ 3. USAR LA FUNCIÓN DE CONFIRMACIÓN AQUÍ
        style={styles.deleteButton}
      >
        <Text style={styles.deleteButtonText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* NUEVO HEADER SIMPLIFICADO con navegación a Perfil */}
      <View style={styles.header}>
        <View style={styles.userAvatarPlaceholder}>
          <Text style={styles.userAvatarText}>
            {user?.displayName?.charAt(0) || "U"}
          </Text>
        </View>
        <Text style={styles.userName}>Hola, {user?.displayName || "Usuario"}</Text>
        
        {/* BOTÓN PARA NAVEGAR A PERFIL */}
        <TouchableOpacity 
            onPress={() => router.push("/(tabs)/profile")}
            style={styles.profileButton}
        >
          <Text style={styles.profileButtonText}>👤 Perfil</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Mis Tareas (Clean)</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Nueva tarea..."
          placeholderTextColor={colorScheme === 'dark' ? defaultDarkTheme.placeholder : defaultLightTheme.placeholder}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddTodo}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={todos}
        renderItem={renderTodo}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />

      <Text style={styles.footer}>
        Total: {todos.length} | Completadas:{" "}
        {todos.filter((t) => t.completed).length}
      </Text>
    </View>
  );
}
