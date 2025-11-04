// src/di/container.ts
// 🟢 DEPENDENCY INJECTION: Aquí se conectan todas las piezas

import { FirebaseTodoDataSource } from "@/src/data/datasources//FirebaseTodoDataSource";
import { TodoRepositoryFirebaseImpl } from "@/src/data/repositories/TodoRepositoryFirebaseImpl";
import { GetAllTodos } from "@/src/domain/usecases/getAllTodos";
import { CreateTodo } from "@/src/domain/usecases/createtodo";
import { ToggleTodo } from "@/src/domain/usecases/ToggleTodo";
import { DeleteTodo } from "@/src/domain/usecases/deleteTodo";
// ===== NUEVOS IMPORTS DE AUTH =====
import { FirebaseAuthDataSource } from "../data/datasources/FirebaseAuthDataSource";
import { AuthRepositoryImpl } from "../data/repositories/AuthRepositoryImpl";
import { RegisterUser } from "../domain/usecases/RegisterUser";
import { LoginUser } from "../domain/usecases/LoginUser";
import { LogoutUser } from "../domain/usecases/LogoutUser";
import { GetCurrentUser } from "../domain/usecases/GetCurrentUser";
import { AuthRepository } from "../domain/repositories/AuthRepository";
import { UpdateUserProfile } from "../domain/usecases/UpdateUserProfile"; // <--- NUEVO IMPORT

// 🟢 Singleton para mantener una sola instancia
class DIContainer {
  private static instance: DIContainer;
  private _dataSource: FirebaseTodoDataSource | null = null;
  private _repository: TodoRepositoryFirebaseImpl | null = null;
  // ===== NUEVOS DE AUTH ===== 
  private _authDataSource?: FirebaseAuthDataSource;
  private _authRepository?: AuthRepository;
  private _registerUser?: RegisterUser;
  private _loginUser?: LoginUser;
  private _logoutUser?: LogoutUser;
  private _getCurrentUser?: GetCurrentUser;
  private _updateUserProfile?: UpdateUserProfile; // <--- NUEVA PROPIEDAD

  private constructor() {}

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  // Método de inicialización (si es necesario)
  async initialize(): Promise<void> {
    this._dataSource = new FirebaseTodoDataSource();
    await this._dataSource.initialize();
    this._repository = new TodoRepositoryFirebaseImpl(this._dataSource);
  }

  // 🟢 Getters para Tareas
  get getAllTodos(): GetAllTodos {
    if (!this._repository) throw new Error("Container not initialized");
    return new GetAllTodos(this._repository);
  }
  // ... (otros getters de tareas) ...
  get deleteTodo(): DeleteTodo {
    if (!this._repository) throw new Error("Container not initialized");
    return new DeleteTodo(this._repository);
  }
  
  // 🟢 Getters para AUTH (Ya existentes)
  get authDataSource(): FirebaseAuthDataSource { 
    if (!this._authDataSource) { 
      this._authDataSource = new FirebaseAuthDataSource(); 
    } 
    return this._authDataSource; 
  } 

  get authRepository(): AuthRepository { 
    if (!this._authRepository) { 
      this._authRepository = new AuthRepositoryImpl(this.authDataSource); 
    } 
    return this._authRepository; 
  } 
  
  get registerUser(): RegisterUser { 
    if (!this._registerUser) { 
      this._registerUser = new RegisterUser(this.authRepository); 
    } 
    return this._registerUser; 
  } 
  
  get loginUser(): LoginUser { 
    if (!this._loginUser) { 
      this._loginUser = new LoginUser(this.authRepository); 
    } 
    return this._loginUser; 
  } 
  
  get logoutUser(): LogoutUser { 
    if (!this._logoutUser) { 
      this._logoutUser = new LogoutUser(this.authRepository); 
    } 
    return this._logoutUser; 
  } 
  
  get getCurrentUser(): GetCurrentUser { 
    if (!this._getCurrentUser) { 
      this._getCurrentUser = new GetCurrentUser(this.authRepository); 
    } 
    return this._getCurrentUser; 
  } 

  // 🟢 NUEVO GETTER para ACTUALIZAR PERFIL
  get updateUserProfile(): UpdateUserProfile { 
    if (!this._updateUserProfile) { 
      this._updateUserProfile = new UpdateUserProfile(this.authRepository); 
    } 
    return this._updateUserProfile; 
  } 
} 
 
export const container = DIContainer.getInstance();
