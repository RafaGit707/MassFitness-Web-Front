import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Clase, Espacio } from '../admin/admin.service';
import { environment } from 'src/environments/environment';

export interface Horario { // O HorarioDisponible
  id: number; // ID único del slot de horario/sesión
  hora_inicio: string; // Ej: "09:00" o "09:00:00"
  hora_fin: string;   // Ej: "10:00" o "10:00:00"
  disponible: boolean;
  capacidad_restante?: number; // Opcional
}

export interface DatosCrearReservaClase {
  // usuario_id se tomará del token en el backend si la ruta está protegida
  clase_id: number;
  // En lugar de horarioId, es más robusto enviar la fecha y la hora de inicio exacta
  // o el ID de un slot de horario específico si tu backend los maneja así.
  // fecha_hora_inicio_utc: string; // Formato ISO UTC, ej: 2023-10-27T09:00:00.000Z
  horario_clase_id: number; // ID del slot de horario específico para esa clase en esa fecha
  // otros_datos?: any;
}

export interface DatosCrearReservaEspacio {
  espacio_id: number;
  fecha_hora_inicio_utc: string; // El backend usará esto para identificar el slot
}

// export interface Reserva { // Lo que el backend devuelve al crear una reserva
//   id: number;
//   usuario_id: number;
//   tipo_reservable_id: number; // clase_id o espacio_id
//   tipo_reservable_type: string; // 'App\\Models\\Clase' o 'App\\Models\\Espacio'
//   fecha_hora_reserva: string; // El timestamp de la reserva
//   clase?: Clase; // Opcional, si el backend devuelve la clase relacionada
//   espacio?: Espacio; // Opcional
// }

export interface Reserva {
  id: number;
  usuario_id: number;
  espacio_id: number | null;    // Puede ser null
  clase_id: number | null;      // Puede ser null
  reserva_clase_id?: number | null; // ID del slot de horario predefinido si es una clase
  tipo_reserva: 'clase' | 'espacio'; // Este es el campo que usas en el backend
  horario_reserva: string;       // Este es el campo del backend (string ISO datetime)
  created_at?: string;
  updated_at?: string;

  // Relaciones que el backend podría cargar con with()
  clase?: Partial<Clase>;   // Para acceder a reserva.clase.nombre
  espacio?: Partial<Espacio>; // Para acceder a reserva.espacio.nombre
}

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
 private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getClases(): Observable<any> {
    return this.http.get(`${this.apiUrl}clases`);
  }

  getEspacios(): Observable<any> {
    return this.http.get(`${this.apiUrl}espacios`);
  }

  crearReserva(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}reservas`, data);
  }

  getReservas(): Observable<any> {
    return this.http.get(`${this.apiUrl}reservas`);
  }
}
