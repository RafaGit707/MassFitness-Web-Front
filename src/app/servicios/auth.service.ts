// src/app/servicios/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

export interface AuthResponseData {
  token: string;
  usuario: User;
}

export interface User {
    id: number;
    nombre: string;
    nombre_usuario: string;
    correo_electronico: string;
    rol: string;
    created_at?: string;
    updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public apiUrl = environment.apiUrl;
  private tokenKey = 'authToken';
  private userStorageKey = 'authUser';

  // BehaviorSubject para indicar si el chequeo inicial de auth ha terminado
  private authInitialized = new BehaviorSubject<boolean>(false);
  authInitialized$ = this.authInitialized.asObservable();

  // BehaviorSubject para mantener el estado del usuario actual
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  // Observable para saber si el usuario logueado es admin
  isAdmin$: Observable<boolean> = this.user$.pipe(
    map(user => !!user && user.rol?.toUpperCase() === 'ADMIN')
  );

  constructor(private http: HttpClient, private router: Router) {
    console.log('AuthService: Constructor - Calling initial validation.');
    this.loadInitialUserAndValidate(); // Llamada correcta en el constructor
  }

  registrar(userData: any): Observable<AuthResponseData> {
    return this.http.post<AuthResponseData>(`${this.apiUrl}registrar`, userData)
      .pipe(
        tap(response => this.handleSuccessfulAuth(response)), // Llama al handler común
        catchError(this.handleError)
      );
  }

  login(credentials: any): Observable<AuthResponseData> {
    console.log('AuthService: Attempting login...');
    return this.http.post<AuthResponseData>(`${this.apiUrl}login`, credentials)
      .pipe(
        tap(response => this.handleSuccessfulAuth(response)), // Llama al handler común
        catchError(error => {
          console.error('AuthService: Login failed API call.', error);
          return this.handleError(error);
        })
      );
  }

  logout(): void {
    this.clearSessionAndRedirect();
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentUser(): User | null {
    return this.userSubject.getValue();
  }

  isLoggedIn(): boolean {
    return !!this.userSubject.value && !!this.getToken();
  }

  // Guarda token/usuario y actualiza el estado (con logs de verificación)
  private setSessionData(token: string, user: User): void {
    if (!token || !user) {
      console.error('AuthService [setSessionData]: Attempted with invalid token or user.');
      return;
    }
    try {
      console.log('AuthService [setSessionData]: Attempting to save token:', token.substring(0, 10) + '...');
      localStorage.setItem(this.tokenKey, token);
      console.log('AuthService [setSessionData]: Token SAVED to localStorage.');

      console.log('AuthService [setSessionData]: Attempting to save user:', user);
      localStorage.setItem(this.userStorageKey, JSON.stringify(user)); // Usa userStorageKey
      console.log('AuthService [setSessionData]: User SAVED to localStorage. Value:', localStorage.getItem(this.userStorageKey));

      this.userSubject.next(user);
      console.log('AuthService [setSessionData]: Session data SET. User:', user.nombre_usuario);

      const tokenRead = localStorage.getItem(this.tokenKey);
      const userRead = localStorage.getItem(this.userStorageKey);
      console.log('AuthService [setSessionData]: Verification Read - Token:', !!tokenRead, 'User:', !!userRead);

    } catch (e) {
      console.error('AuthService [setSessionData]: Error saving to localStorage.', e);
      this.clearSessionAndRedirect();
    }
  }

  private clearSessionAndRedirect(): void {
    console.log('AuthService [clearSessionAndRedirect]: Clearing session, redirecting to login.');
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userStorageKey);
    this.userSubject.next(null);
    this.authInitialized.next(true);
    this.router.navigate(['/']);
  }

  private handleSuccessfulAuth(response: AuthResponseData): void {
    if (response && response.token && response.usuario) {
      this.setSessionData(response.token, response.usuario);
    } else {
      console.error('AuthService: Invalid response from login/registrar', response);
      throw new Error('Respuesta de autenticación inválida desde el servidor.');
    }
  }

  // Orquesta la carga desde localStorage y la validación con el backend
  private loadInitialUserAndValidate(): void {
    const token = localStorage.getItem(this.tokenKey);
    const storedUserJson = localStorage.getItem(this.userStorageKey);
    console.log('AuthService [loadInitialUserAndValidate]: Starting check. Token:', !!token, 'UserJson:', !!storedUserJson);
    this.authInitialized.next(false);

    if (token && storedUserJson) {
      try {
        const userFromStorage: User = JSON.parse(storedUserJson);
        this.userSubject.next(userFromStorage);
        console.log('AuthService [loadInitialUserAndValidate]: User tentatively loaded from storage:', userFromStorage.nombre_usuario);

        this.fetchAuthenticatedUserInternal().subscribe({
          next: (userFromApi) => {
            this.setSessionData(token, userFromApi);
            console.log('AuthService [loadInitialUserAndValidate]: Token validated successfully.');
            this.authInitialized.next(true);
          },
          error: (err) => {
            console.warn('AuthService [loadInitialUserAndValidate]: Token validation failed (API Error or other). Logging out.', err.message || err);
            this.clearSessionAndRedirect();
          }
        });
      } catch (e) {
        console.error('AuthService [loadInitialUserAndValidate]: Error parsing user from storage. Clearing session.', e);
        this.logout();
      }
    } else {
      console.log('AuthService [loadInitialUserAndValidate]: No session found in storage.');
      this.userSubject.next(null);
      this.authInitialized.next(true);
    }
  }

  // Hace la llamada a la API para obtener el usuario autenticado (el interceptor añade el token)
  private fetchAuthenticatedUserInternal(): Observable<User> {
    console.log('AuthService [fetchAuthenticatedUserInternal]: Calling API /usuarioAutenticado (Interceptor adds token)...');
    return this.http.get<User>(`${this.apiUrl}usuarioAutenticado`)
      .pipe(
        tap(userFromApi => {
          console.log('AuthService [fetchAuthenticatedUserInternal]: API call successful. User:', userFromApi.nombre_usuario);
        }),
        catchError(error => {
          console.error('AuthService [fetchAuthenticatedUserInternal]: API call failed.', error.status, error.message || error);
          return throwError(() => error);
        })
      );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error desconocido.';
    if (error.error instanceof ErrorEvent) {
        errorMessage = `Error: ${error.error.message}`;
    } else {
        if (error.status === 422 && error.error && error.error.errors) {
            const validationErrors = error.error.errors;
            errorMessage = Object.values(validationErrors).flat().join('. ');
        } else if (error.error && typeof error.error.message === 'string') {
            errorMessage = error.error.message;
        } else if (error.status) {
            errorMessage = `Error ${error.status}: ${error.statusText || 'Error de servidor'}`;
            if (error.status === 401) {
                errorMessage = 'No autorizado. Por favor, inicia sesión.';
            } else if (error.status === 403) {
                errorMessage = 'No tienes permiso para realizar esta acción.';
            }
        }
    }
    console.error('AuthService handleError -> Original Error:', error, 'Formatted Message:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

}
