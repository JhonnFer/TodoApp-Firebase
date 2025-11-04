// src/di/container.ts
// 🟢 DEPENDENCY INJECTION: Aquí se conectan todas las piezas

import { FirebaseTodoDataSource } from "@/src/data/datasources//FirebaseTodoDataSource";
import { TodoRepositoryFirebaseImpl } from "@/src/data/repositories/TodoRepositoryFirebaseImpl";
import { GetAllTodos } from "@/src/domain/usecases/getAllTodos";
import { CreateTodo } from "@/src/domain/usecases/createtodo";
import { ToggleTodo } from "@/src/domain/usecases/ToggleTodo";
import { DeleteTodo } from "@/src/domain/usecases/deleteTodo";
// ===== IMPORTS DE AUTH =====
import { FirebaseAuthDataSource } from "../data/datasources/FirebaseAuthDataSource";
import { AuthRepositoryImpl } from "../data/repositories/AuthRepositoryImpl";
import { RegisterUser } from "../domain/usecases/RegisterUser";
import { LoginUser } from "../domain/usecases/LoginUser";
import { LogoutUser } from "../domain/usecases/LogoutUser";
import { GetCurrentUser } from "../domain/usecases/GetCurrentUser";
import { AuthRepository } from "../domain/repositories/AuthRepository";
import { UpdateUserProfile } from "../domain/usecases/UpdateUserProfile"; 
import { SendPasswordResetEmail } from "@/src/domain/usecases/SendPasswordResetEmail";

class DIContainer {
  private static instance: DIContainer;
  private _dataSource: FirebaseTodoDataSource | null = null;
  private _repository: TodoRepositoryFirebaseImpl | null = null;
  // ===== NUEVOS DE AUTH Y TAREAS (se declaran como 'private' en tu patrón) ===== 
  private _authDataSource?: FirebaseAuthDataSource;
  private _authRepository?: AuthRepository;
  private _registerUser?: RegisterUser;
  private _loginUser?: LoginUser;
  private _logoutUser?: LogoutUser;
  private _getCurrentUser?: GetCurrentUser;
  private _updateUserProfile?: UpdateUserProfile; 

  // ✅ NUEVOS CAMPOS PRIVADOS PARA LAS TAREAS
  private _createTodo?: CreateTodo; 
  private _toggleTodo?: ToggleTodo;
  private _getAllTodos?: GetAllTodos; // <-- Ahora usa un campo privado
  private _deleteTodo?: DeleteTodo;  // <-- Ahora usa un campo privado
  
  // ✅ CAMPO PÚBLICO (ya existente en tu código)
  public sendPasswordResetEmail!: SendPasswordResetEmail;

  private constructor() {}

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  async initialize(): Promise<void> {
    this._dataSource = new FirebaseTodoDataSource();
    await this._dataSource.initialize();
    this._repository = new TodoRepositoryFirebaseImpl(this._dataSource);
    
    // ✅ INICIALIZACIÓN DE SendPasswordResetEmail
    // Nota: Asumo que this.authRepository ya está inicializado por sus getters al llegar aquí.
    this.sendPasswordResetEmail = new SendPasswordResetEmail(this.authRepository);
  }

  // 🟢 Getters para Tareas (Ahora inicializan la propiedad privada)

  // ✅ NUEVO GETTER: CreateTodo
  get createTodo(): CreateTodo {
    if (!this._repository) throw new Error("Container not initialized");
    if (!this._createTodo) {
      this._createTodo = new CreateTodo(this._repository);
    }
    return this._createTodo;
  }

  // ✅ NUEVO GETTER: ToggleTodo
  get toggleTodo(): ToggleTodo {
    if (!this._repository) throw new Error("Container not initialized");
    if (!this._toggleTodo) {
      this._toggleTodo = new ToggleTodo(this._repository);
    }
    return this._toggleTodo;
  }
  
  // Getter para GetAllTodos (Ajustado a tu patrón)
  get getAllTodos(): GetAllTodos {
    if (!this._repository) throw new Error("Container not initialized");
    if (!this._getAllTodos) {
      this._getAllTodos = new GetAllTodos(this._repository);
    }
    return this._getAllTodos;
  }

  // Getter para DeleteTodo (Ajustado a tu patrón)
  get deleteTodo(): DeleteTodo {
    if (!this._repository) throw new Error("Container not initialized");
    if (!this._deleteTodo) {
      this._deleteTodo = new DeleteTodo(this._repository);
    }
    return this._deleteTodo;
  }
  
  // 🟢 Getters para AUTH (Mantenidos igual, solo renombré para claridad)
  // ... (Tu código de getters de Auth (authDataSource, authRepository, registerUser, etc.) va aquí)
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

  get updateUserProfile(): UpdateUserProfile { 
    if (!this._updateUserProfile) { 
      this._updateUserProfile = new UpdateUserProfile(this.authRepository); 
    } 
    return this._updateUserProfile; 
  } 
} 
 
export const container = DIContainer.getInstance();
