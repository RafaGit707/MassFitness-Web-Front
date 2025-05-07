import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; // Ajusta ruta
import { User } from '../servicios/auth.service'; // Ajusta ruta (asume User está ahí)

// Define interfaces para las otras entidades si no las tienes
export interface Entrenador { id: number; nombre_entrenador: string; especializacion: string; /*...*/ }
export interface Clase { id: number; nombre: string; capacidad_maxima: number; entrenador_id: number; /*...*/ }
export interface Espacio { id: number; nombre: string; capacidad_maxima: number; entrenador_id: number; /*...*/ }


@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = environment.apiUrl; // Asume que apiUrl es 'http://.../api' (sin / al final)

  constructor(private http: HttpClient) { }

  // --- Usuarios ---
  getUsuarios(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}usuarios`);
  }
  createUsuario(usuarioData: any): Observable<User> { // Ajusta 'any' a un tipo más específico si es posible
    return this.http.post<User>(`${this.apiUrl}usuarios`, usuarioData);
  }
  updateUsuario(id: number, usuarioData: any): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}usuarios/${id}`, usuarioData);
  }
  deleteUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}usuarios/${id}`);
  }

  // --- Entrenadores ---
  getEntrenadores(): Observable<Entrenador[]> {
    return this.http.get<Entrenador[]>(`${this.apiUrl}entrenadores`);
  }
   createEntrenador(data: any): Observable<Entrenador> {
    return this.http.post<Entrenador>(`${this.apiUrl}entrenadores`, data);
  }
  updateEntrenador(id: number, data: any): Observable<Entrenador> {
    return this.http.put<Entrenador>(`${this.apiUrl}entrenadores/${id}`, data);
  }
  deleteEntrenador(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}entrenadores/${id}`);
  }


  // --- Clases ---
  getClases(): Observable<Clase[]> {
    return this.http.get<Clase[]>(`${this.apiUrl}clases`);
  }
   createClase(data: any): Observable<Clase> {
    return this.http.post<Clase>(`${this.apiUrl}clases`, data);
  }
  updateClase(id: number, data: any): Observable<Clase> {
    return this.http.put<Clase>(`${this.apiUrl}clases/${id}`, data);
  }
  deleteClase(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}clases/${id}`);
  }

  // --- Espacios ---
  getEspacios(): Observable<Espacio[]> {
    return this.http.get<Espacio[]>(`${this.apiUrl}espacios`);
  }
   createEspacio(data: any): Observable<Espacio> {
    return this.http.post<Espacio>(`${this.apiUrl}espacios`, data);
  }
  updateEspacio(id: number, data: any): Observable<Espacio> {
    return this.http.put<Espacio>(`${this.apiUrl}espacios/${id}`, data);
  }
  deleteEspacio(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}espacios/${id}`);
  }

}