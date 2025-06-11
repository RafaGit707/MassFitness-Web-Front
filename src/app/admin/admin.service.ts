import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, delay, map, Observable, of, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../servicios/auth.service';
import { Horario, DatosCrearReservaClase, DatosCrearReservaEspacio, Reserva } from '../servicios/reserva.service';
import { HorarioEspacioDisponible } from '../pages/reservas/detalle-reserva-sala/detalle-reserva-sala.component';

export interface Entrenador { id: number; nombre_entrenador: string; especializacion: string; /*...*/ }
export interface Clase { id: number; nombre: string; capacidad_maxima: number; entrenador_id: number; /*...*/ }
export interface Espacio { id: number; nombre: string; capacidad_maxima: number; entrenador_id: number; /*...*/ }
// admin.service.ts o un archivo de interfaces
export interface ClaseHorarioDefinido {
  id?: number; // Opcional para la creación
  clase_id: number;
  dia_semana: number; // 1 (Lunes) a 7 (Domingo)
  hora_inicio: string; // "HH:MM" o "HH:MM:SS"
  duracion_minutos: number;
  capacidad_maxima: number;
  activo?: boolean;
}

export interface ClaseResumida {
  id: number | string;
  nombre: string;
  // Podrías añadir un icono específico o tipo si quieres
  tipoIcono?: string; // ej: 'fitness_center', 'sports_mma', 'self_improvement'
}

export interface SalaResumida {
  id: number | string;
  nombre: string;
  tipoIcono?: string; // ej: 'meeting_room', 'sensor_door'
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = environment.apiUrl; // Asume que apiUrl es 'http://.../api/' (con / al final)

  constructor(private http: HttpClient) { }


    /**
   * Obtiene una lista resumida de clases para usar en dropdowns.
   * Reutiliza el método getClases() y transforma los datos.
   */
  getClasesParaDropdown(): Observable<ClaseResumida[]> {
    return this.getClases() // Llama a tu método existente que devuelve Observable<Clase[]>
      .pipe(
        map(clasesCompletas => clasesCompletas.map(clase => ({ // Transforma Clase a ClaseResumida
          id: clase.id,
          nombre: clase.nombre,
          // Aquí podrías añadir lógica para el tipoIcono si la clase original tiene más info
          // o si quieres que el icono dependa de más propiedades además del nombre.
          tipoIcono: this.getIconoParaActividad(clase.nombre, 'clase')
        }))),
        tap(clasesResumidas => console.log('Clases para dropdown:', clasesResumidas)),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene una lista resumida de espacios/salas para usar en dropdowns.
   * Reutiliza el método getEspacios() y transforma los datos.
   */
  getSalasParaDropdown(): Observable<SalaResumida[]> {
    return this.getEspacios() // Llama a tu método existente que devuelve Observable<Espacio[]>
      .pipe(
        map(espaciosCompletos => espaciosCompletos.map(espacio => ({ // Transforma Espacio a SalaResumida
          id: espacio.id,
          nombre: espacio.nombre,
          tipoIcono: this.getIconoParaActividad(espacio.nombre, 'sala')
        }))),
        tap(salasResumidas => console.log('Salas para dropdown:', salasResumidas)),
        catchError(this.handleError)
      );
  }

  // Tu método getIconoParaActividad se mantiene igual
  private getIconoParaActividad(nombre: string, tipo: 'clase' | 'sala'): string {
    const nombreLower = nombre.toLowerCase();
    if (tipo === 'clase') {
      if (nombreLower.includes('boxeo')) return 'sports_mma';
      if (nombreLower.includes('yoga')) return 'self_improvement';
      if (nombreLower.includes('pilates')) return 'fitness_center';
      if (nombreLower.includes('hiit')) return 'directions_run';
      if (nombreLower.includes('spinning') || nombreLower.includes('ciclo')) return 'pedal_bike';
      if (nombreLower.includes('zumba') || nombreLower.includes('baile')) return 'music_note';
      if (nombreLower.includes('funcional')) return 'exercise';
      if (nombreLower.includes('core')) return 'accessibility_new';
      return 'fitness_center'; // Icono por defecto para clases
    } else { // tipo === 'sala'
      if (nombreLower.includes('musculación')) return 'fitness_center';
      if (nombreLower.includes('cardio')) return 'monitor_heart';
      if (nombreLower.includes('polivalente')) return 'meeting_room';
      if (nombreLower.includes('estudio') && (nombreLower.includes('yoga') || nombreLower.includes('pilates'))) return 'spa';
      if (nombreLower.includes('spinning') || nombreLower.includes('ciclo')) return 'directions_bike';
      if (nombreLower.includes('exterior') || nombreLower.includes('outdoor')) return 'outdoor_grill';
      return 'sensor_door'; // Icono por defecto para salas/espacios
    }
  }

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

  deleteClase(id: number, force: boolean = false): Observable<void> {
    let url = `${this.apiUrl}clases/${id}`;
    if (force) {
      url += '?force=true';
    }
    return this.http.delete<void>(url);
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

  // Obtener una clase específica por su ID
  getClaseById(id: number): Observable<Clase> {
    return this.http.get<Clase>(`${this.apiUrl}clases/${id}`);
  }

  // Obtener un espacio específico por su ID
  getEspacioById(id: number): Observable<Espacio> {
    return this.http.get<Espacio>(`${this.apiUrl}espacios/${id}`);
  }

  // Obtener un entrenador específico por su ID (si lo necesitas en detalle-clase/espacio)
  getEntrenadorById(id: number): Observable<Entrenador> {
    return this.http.get<Entrenador>(`${this.apiUrl}entrenadores/${id}`);
  }
  
  getHorariosDisponiblesClase(claseId: number, fecha: string): Observable<Horario[]> {
    // La fecha debe estar en formato YYYY-MM-DD o el que espere tu backend
    return this.http.get<Horario[]>(`${this.apiUrl}reservas/clase/${claseId}/horarios-disponibles?fecha=${fecha}`);
  }

  // Obtener horarios disponibles para un espacio en una fecha específica
  getHorariosDisponiblesEspacio(espacioId: number, fecha: string): Observable<HorarioEspacioDisponible[]> {
    // Asume que el backend devuelve datos que coinciden con HorarioEspacioDisponible
    return this.http.get<HorarioEspacioDisponible[]>(`${this.apiUrl}reservas/espacio/${espacioId}/horarios-disponibles?fecha=${fecha}`); // Asume que tienes un handleError similar al de AuthService
  }

  // Crear una reserva para una clase
  crearReservaClase(datosReserva: DatosCrearReservaClase): Observable<Reserva> { // Devuelve la reserva creada
    // El backend debería tomar el usuario_id del token autenticado
    return this.http.post<Reserva>(`${this.apiUrl}reservas/clase`, datosReserva);
  }

  // Crear una reserva para un espacio
  crearReservaEspacio(datosReserva: DatosCrearReservaEspacio): Observable<Reserva> {
    return this.http.post<Reserva>(`${this.apiUrl}reservas/espacio`, datosReserva);
  }

  getMisReservas(): Observable<Reserva[]> {
      return this.http.get<Reserva[]>(`${this.apiUrl}mis-reservas`)
        .pipe(catchError(this.handleError)); // Asume que tienes handleError
  }

  cancelarReserva(reservaId: number): Observable<any> { // Podría devolver void o un mensaje
    return this.http.delete<any>(`${this.apiUrl}reservas/${reservaId}/cancelar`)
      .pipe(catchError(this.handleError));
  }

  getHorariosDefinidosParaClase(claseId: number): Observable<ClaseHorarioDefinido[]> {
    return this.http.get<ClaseHorarioDefinido[]>(`${this.apiUrl}clases/${claseId}/horariosDefinidos`);
  }

  crearHorarioDefinido(claseId: number, horarioData: ClaseHorarioDefinido): Observable<ClaseHorarioDefinido> {
    return this.http.post<ClaseHorarioDefinido>(`${this.apiUrl}clases/${claseId}/horariosDefinidos`, horarioData);
  }

  updateHorarioDefinido(horarioId: number, horarioData: Partial<ClaseHorarioDefinido>): Observable<ClaseHorarioDefinido> {
    return this.http.put<ClaseHorarioDefinido>(`${this.apiUrl}horariosDefinidos/${horarioId}`, horarioData);
  }

  deleteHorarioDefinido(horarioId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}horariosDefinidos/${horarioId}`);
  }

   private handleError(error: HttpErrorResponse) {
    // ... (lógica de manejo de errores como la de AuthService) ...
    let userFriendlyMessage = 'Ocurrió un error.';
    if (error.error && typeof error.error.message === 'string') {
        userFriendlyMessage = error.error.message;
    } else if (error.status === 0) {
        userFriendlyMessage = 'No se pudo conectar al servidor.';
    } // ... etc.
    console.error('AdminService Error:', error, '-> Message:', userFriendlyMessage);
    return throwError(() => new Error(userFriendlyMessage));
  }

}