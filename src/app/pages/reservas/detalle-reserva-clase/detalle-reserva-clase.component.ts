// src/app/pages/reservas/detalle-reserva-clase/detalle-reserva-clase.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../../admin/admin.service'; // Asumiendo que aquí están los métodos getClaseById, etc.
import { Clase, Entrenador } from '../../../admin/admin.service'; // O desde donde definas tus interfaces
import { AuthService, User } from '../../../servicios/auth.service'; // Para obtener el usuario_id si es necesario
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription, forkJoin, of } from 'rxjs';
import { catchError, switchMap, take, map, tap } from 'rxjs/operators';

// detalle-reserva-clase.component.ts
export interface HorarioDisponible {
  id_slot_definido: number;
  fecha_con_hora_inicio?: string; // Este lo añadiste en el backend, asegúrate que la interfaz lo refleje
  hora_inicio: string;
  hora_fin: string;
  disponible: boolean;
  capacidad_restante?: number;
  capacidad_maxima_slot?: number;
}

@Component({
  selector: 'app-detalle-reserva-clase',
  templateUrl: './detalle-reserva-clase.component.html',
  styleUrls: ['./detalle-reserva-clase.component.css']
})
export class DetalleReservaClaseComponent implements OnInit, OnDestroy {
  clase: Clase | undefined;
  entrenador: Entrenador | undefined;
  claseId: number = 0;
  isLoading = true;
  isHorariosLoading = false;
  minDate: Date;

  horariosDisponibles: HorarioDisponible[] = [];
  fechaSeleccionada: Date | null = null;
  horarioSeleccionado: HorarioDisponible | null = null;

  private routeSubscription: Subscription | undefined;
  private currentUser: User | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService, // O un ReservaService dedicado
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {  const today = new Date();
    this.minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate()); }

  ngOnInit(): void {
    this.authService.user$.pipe(take(1)).subscribe(user => this.currentUser = user);

    this.routeSubscription = this.route.paramMap.pipe(
      // Paso 1: Obtener el ID de la clase de los parámetros de la ruta
      tap(params => {
        const idParam = params.get('id');
        console.log('DetalleReservaClase: idParam de la ruta:', idParam);
        if (idParam) {
          this.claseId = +idParam;
          console.log('DetalleReservaClase: claseId establecida a:', this.claseId);
        } else {
          console.error('No se proporcionó ID de clase');
          this.snackBar.open('Error: ID de clase no especificado.', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/reservar/clases']);
          // Lanzar un error o devolver un observable vacío para detener el pipe si no hay ID
          throw new Error('ID de clase no encontrado en la ruta');
        }
      }),
      // Paso 2: Cargar la clase usando el claseId
      switchMap(() => {
        this.isLoading = true;
        return this.adminService.getClaseById(this.claseId).pipe(
          catchError(err => {
            console.error('Error cargando clase:', err);
            this.snackBar.open('Error al cargar la clase.', 'Cerrar', { duration: 3000 });
            this.router.navigate(['/reservar/clases']);
            return of(null); // Devuelve of(null) para indicar que la clase no se pudo cargar
          })
        );
      }),
      // Paso 3: Si la clase se cargó, intentar cargar el entrenador
      switchMap((claseCargada: Clase | null) => {
        this.clase = claseCargada || undefined; // Asigna la clase o undefined

        if (this.clase && this.clase.entrenador_id) {
          console.log('DetalleReservaClase: Intentando cargar entrenador con ID:', this.clase.entrenador_id);
          return this.adminService.getEntrenadorById(this.clase.entrenador_id).pipe(
            tap(ent => console.log('DetalleReservaClase: Entrenador recibido:', ent)),
            catchError(err => {
              console.warn('Error cargando entrenador para la clase:', err);
              return of(undefined); // Continúa con entrenador como undefined si falla la carga
            })
          );
        }
        // Si no hay clase o no hay entrenador_id, pasa undefined para el entrenador
        return of(undefined);
      })
    ).subscribe({
      next: (entrenadorCargado?: Entrenador) => { // entrenadorCargado puede ser Entrenador o undefined
        this.entrenador = entrenadorCargado; // Asigna el entrenador (o undefined)

        if (this.clase) {
          console.log('Detalles de clase cargados:', this.clase, 'Entrenador:', this.entrenador);
        } else {
          console.log('DetalleReservaClase: La clase no se pudo cargar, no se mostrarán detalles.');
          // El router.navigate en el catchError de getClaseById ya debería haber redirigido.
        }
        this.isLoading = false;
      },
      error: (err) => { // Error del throw new Error('ID de clase no encontrado...')
          console.error("Error en el flujo de carga de ngOnInit:", err);
          this.isLoading = false;
          // La redirección ya debería haber ocurrido si el ID no se encontró
      }
    });
  }

  onFechaSeleccionada(event: any): void { // El tipo de evento dependerá del selector de fecha
    this.fechaSeleccionada = event.value as Date; // Asumimos que event.value es un Date
    this.horarioSeleccionado = null; // Resetea la hora seleccionada
    this.horariosDisponibles = []; // Limpia horarios anteriores

    if (this.claseId && this.fechaSeleccionada) {
      this.isHorariosLoading = true;
      // Formatea la fecha a YYYY-MM-DD para el API (o como tu backend la espere)
      const fechaFormateada = this.formatDateForAPI(this.fechaSeleccionada);
      console.log('Cargando horarios para clase ID:', this.claseId, 'en fecha:', fechaFormateada);

      // Asume que tienes un método en AdminService (o ReservaService)
      this.adminService.getHorariosDisponiblesClase(this.claseId, fechaFormateada).subscribe({
        next: (data) => {
        //  this.horariosDisponibles = data;
        this.horariosDisponibles = data.map((h: any) => ({
            id_slot_definido: h.id_slot_definido ?? h.id,
            fecha_con_hora_inicio: h.fecha_con_hora_inicio,
            hora_inicio: h.hora_inicio,
            hora_fin: h.hora_fin,
            disponible: h.disponible,
            capacidad_restante: h.capacidad_restante ?? h.capacidad_actual,
            capacidad_maxima_slot: h.capacidad_maxima_slot ?? h.capacidad_maxima
          }));
          console.log('Horarios recibidos:', this.horariosDisponibles);
          console.log('Horarios recibidos:', data);
          if (data.length === 0) {
            this.snackBar.open('No hay horarios disponibles para esta fecha.', 'Cerrar', {duration: 3000});
          }
          this.isHorariosLoading = false;
        },
        error: (err) => {
          console.error('Error cargando horarios:', err);
          this.snackBar.open('Error al cargar los horarios disponibles.', 'Cerrar', { duration: 3000 });
          this.isHorariosLoading = false;
        }
      });
    }
  }

  private formatDateForAPI(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  seleccionarHora(horario: HorarioDisponible): void {
    if (horario.disponible) {
      this.horarioSeleccionado = horario;
      console.log('Horario seleccionado:', horario);
    } else {
        this.snackBar.open('Este horario no está disponible.', 'Cerrar', {duration: 2000});
    }
  }

  confirmarReserva(): void {
    if (!this.currentUser) {
        this.snackBar.open('Error: No se pudo identificar al usuario.', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/login']);
        return;
    }
    if (this.clase && this.fechaSeleccionada && this.horarioSeleccionado && this.horarioSeleccionado.disponible) {
    // --- VALIDACIÓN DE FECHA/HORA PASADA EN FRONTEND ---
      const ahora = new Date();
      const [hora, minuto] = this.horarioSeleccionado.hora_inicio.split(':').map(Number);
      const fechaHoraReserva = new Date(this.fechaSeleccionada.getFullYear(), this.fechaSeleccionada.getMonth(), this.fechaSeleccionada.getDate(), hora, minuto);

      if (fechaHoraReserva <= ahora) {
        this.snackBar.open('No puedes realizar reservas para una fecha u hora que ya ha pasado.', 'Cerrar', { duration: 4000 });
        return;
      }

      const datosReserva = {
        clase_id: this.clase.id,
        fecha_hora_inicio_utc: fechaHoraReserva.toISOString(),
        horario_clase_id: this.horarioSeleccionado.id_slot_definido,
      };
      console.log('Datos Reserva confirmarReserva()', datosReserva);

      // Asume que tienes un método en AdminService (o ReservaService)
      this.adminService.crearReservaClase(datosReserva).subscribe({
        next: (respuesta) => {
          console.log('Reserva creada:', respuesta);
          this.snackBar.open('¡Reserva de clase confirmada exitosamente!', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/perfil']); // O a una página de "mis reservas"
        },
        error: (err) => {
          const message = (err.error && typeof err.error.message === 'string')
                            ? err.error.message
                            : (err.message || 'Error.');
          console.error("Error al crear reserva de clase:", err);
          this.snackBar.open(message || 'No se pudo confirmar la reserva.', 'Cerrar', { duration: 4000 });
        }
      });
    } else {
      this.snackBar.open('Por favor, selecciona una clase, fecha y un horario disponible válidos.', 'Cerrar', { duration: 3000 });
    }
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }
}