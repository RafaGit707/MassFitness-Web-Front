import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService, Espacio } from '../../../admin/admin.service'; // O ReservaService
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService, User } from 'src/app/servicios/auth.service';
import { forkJoin, Observable, Subscription, take } from 'rxjs';
import { DatosCrearReservaEspacio, Reserva } from 'src/app/servicios/reserva.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatChipListboxChange } from '@angular/material/chips';

export interface HorarioEspacioDisponible {
  id_slot_generado: string; // La hora_inicio como string "HH:MM" o un timestamp si prefieres
  fecha_con_hora_inicio: string; // El datetime ISO completo del inicio del slot (útil para construir el Date obj)
  hora_inicio: string; // "08:00"
  hora_fin: string;   // "09:00"
  disponible: boolean;
  ocupado_por_otro: boolean;
  capacidad_maxima_slot?: number;
  reservas_hechas?: number;       // Total de reservas para este slot
  capacidad_restante?: number;
  usuario_tiene_reserva_aqui?: boolean;
  usuario_reservas_previas? : number; // Total de reservas previas del usuario para este espacio en el día 
}

@Component({
  selector: 'app-detalle-reserva-sala',
  templateUrl: './detalle-reserva-sala.component.html',
  styleUrls: ['./detalle-reserva-sala.component.css']
})
export class DetalleReservaSalaComponent implements OnInit, OnDestroy {
  sala: Espacio | undefined;
  salaId: number = 0;
  isLoading = true;
  isHorariosLoading = false;
  isConfirmingReserva = false; // Para el estado de carga del botón de confirmar

  horariosDelDia: HorarioEspacioDisponible[] = [];
  fechaSeleccionada: Date | null = null;
  horariosSeleccionados: HorarioEspacioDisponible[] = [];
  horariosSeleccionadosNgModel: HorarioEspacioDisponible[] = [];
  private lastValidSelectedHorarios: HorarioEspacioDisponible[] = [];

  readonly MAX_RESERVAS_ESPACIO_POR_DIA = 3;
  minDate: Date; // Para el datepicker

  private routeSubscription: Subscription | undefined;
  private currentUser: User | null = null;
  // userReservationsTodayCount se calculará basado en la respuesta del backend
  // o haciendo una llamada separada para obtener las reservas del usuario para el día

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    const today = new Date();
    this.minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }

  ngOnInit(): void {
    this.authService.user$.pipe(take(1)).subscribe(user => this.currentUser = user);

    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.salaId = +idParam;
        this.cargarDetallesSala();
      } else {
        console.error('No se proporcionó ID de sala');
        this.snackBar.open('Error: ID de sala no especificado.', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/reservar/salas']);
      }
    });
  }

  cargarDetallesSala(): void {
    this.isLoading = true;
    this.adminService.getEspacioById(this.salaId).subscribe({
      next: (data) => {
        this.sala = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando detalles de la sala:', err);
        this.isLoading = false;
        this.snackBar.open('Error al cargar los detalles de la sala.', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/reservar/salas']);
      }
    });
  }

  onFechaSeleccionada(event: any): void {
    this.fechaSeleccionada = event.value as Date;
    this.horariosSeleccionadosNgModel = []; // Resetea la selección del ngModel
    this.horariosDelDia = [];
    this.lastValidSelectedHorarios = [];    // También resetea la última selección válida

    if (this.salaId && this.fechaSeleccionada) {
      this.isHorariosLoading = true;
      const fechaFormateada = this.formatDateForAPI(this.fechaSeleccionada);
      this.adminService.getHorariosDisponiblesEspacio(this.salaId, fechaFormateada).subscribe({
        next: (data: HorarioEspacioDisponible[]) => {
          this.horariosDelDia = data;
          this.isHorariosLoading = false;
          if (this.horariosDelDia.length === 0) {
            this.snackBar.open('No hay horarios disponibles para esta fecha.', 'Cerrar', { duration: 3000 });
          }
        },
        error: (err: HttpErrorResponse) => { /* ... */ }
      });
    }
  }

  toggleSeleccionHora(horario: HorarioEspacioDisponible, event?: MouseEvent): void {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }

    const index = this.horariosSeleccionadosNgModel.findIndex(h => h.id_slot_generado === horario.id_slot_generado);

    if (index > -1) { // Ya estaba seleccionado -> deseleccionar
      this.horariosSeleccionadosNgModel.splice(index, 1);
      // Forzar actualización del ngModel si es necesario
      this.horariosSeleccionadosNgModel = [...this.horariosSeleccionadosNgModel];
    } else { // No estaba seleccionado -> intentar seleccionar
      if (horario.ocupado_por_otro && !horario.usuario_tiene_reserva_aqui) {
        this.snackBar.open('Este horario ya está completamente reservado.', 'Cerrar', {duration: 3000});
        return;
      }
      if (!horario.disponible) { // El backend ya calculó esto considerando el límite del usuario
          this.snackBar.open('No puedes seleccionar este horario (límite alcanzado o no disponible).', 'Cerrar', {duration: 4000});
          return;
      }
      // Si llegamos aquí, se puede seleccionar y no excede el límite que ya consideró el backend
      if (this.horariosSeleccionadosNgModel.length < this.reservasRestantesHoy) {
          this.horariosSeleccionadosNgModel.push(horario);
          // Forzar actualización del ngModel
          this.horariosSeleccionadosNgModel = [...this.horariosSeleccionadosNgModel];
      } else {
          // Este snackbar es una doble seguridad por si la UI y `disponible_para_usuario` se desincronizan
          this.snackBar.open(`Solo puedes seleccionar hasta ${this.MAX_RESERVAS_ESPACIO_POR_DIA} horas.`, 'Cerrar', {duration: 4000});
      }
    }
    console.log('Horarios Seleccionados (ngModel):', this.horariosSeleccionadosNgModel);
  }

  estaSeleccionado(horario: HorarioEspacioDisponible): boolean {
    return this.horariosSeleccionadosNgModel.some(h => h.id_slot_generado === horario.id_slot_generado);
  }

  get reservasRestantesHoy(): number {
      const numReservasPrevias = this.horariosDelDia.length > 0 ? (this.horariosDelDia[0].usuario_reservas_previas || 0) : 0;
      return this.MAX_RESERVAS_ESPACIO_POR_DIA - numReservasPrevias;
  }

  get capacidadActual(): number {
    const reservasHechas = this.horariosDelDia[0].capacidad_restante || 0;
    return reservasHechas;
  }

  private formatDateForAPI(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onChipSelectionChange(event: MatChipListboxChange | HorarioEspacioDisponible[]): void {
  let currentAttemptedSelection: HorarioEspacioDisponible[];
  if (Array.isArray(event)) { // Si viene de una actualización manual de ngModel
      currentAttemptedSelection = event;
  } else { // Si viene del evento (selectionChange) del listbox
      currentAttemptedSelection = Array.isArray(event.value) ? event.value : (event.value ? [event.value] : []);
  }

  // Comprobamos si se intentó AÑADIR un chip (la longitud nueva es mayor que la anterior válida)
  if (currentAttemptedSelection.length > this.lastValidSelectedHorarios.length) {
      // Ahora verificamos si esta adición excede el límite
      if (currentAttemptedSelection.length > this.reservasRestantesHoy) {
          this.snackBar.open(
              // Mensaje más específico:
              `Has intentado seleccionar ${currentAttemptedSelection.length} horario(s). Solo puedes añadir ${this.reservasRestantesHoy} nuevo(s) horario(s) (límite diario total ${this.MAX_RESERVAS_ESPACIO_POR_DIA}).`,
              'Cerrar',
              { duration: 5000 }
          );

          // Revertir a la última selección válida.
          // Es importante reasignar una nueva referencia de array para que Angular detecte el cambio.
          // Y hacemos esto DESPUÉS de que el snackbar se muestre,
          // pero antes de que this.horariosSeleccionadosNgModel se actualice permanentemente
          // con la selección inválida.
          // El [(ngModel)] ya habrá actualizado this.horariosSeleccionadosNgModel a currentAttemptedSelection.
          // Necesitamos forzarlo a volver.
          this.horariosSeleccionadosNgModel = [...this.lastValidSelectedHorarios];

          // Un pequeño truco que a veces es necesario para que el componente (mat-chip-listbox)
          // realmente recoja la reversión del ngModel en el mismo ciclo de detección de cambios.
          // Pruébalo si la línea anterior no funciona por sí sola.
          // setTimeout(() => {
          //   this.horariosSeleccionadosNgModel = [...this.lastValidSelectedHorarios];
          // }, 0);

      } else {
          // La selección es válida, así que actualizamos el ngModel y la última selección válida.
          this.horariosSeleccionadosNgModel = currentAttemptedSelection;
          this.lastValidSelectedHorarios = [...this.horariosSeleccionadosNgModel];
      }
  } else {
      // Se quitó un chip (o no cambió la longitud, aunque con `multiple` esto es raro a menos que se reemplace),
      // lo cual es siempre permitido en términos de exceder el límite.
      this.horariosSeleccionadosNgModel = currentAttemptedSelection;
      this.lastValidSelectedHorarios = [...this.horariosSeleccionadosNgModel];
  }
  console.log('Horarios Seleccionados (ngModel):', this.horariosSeleccionadosNgModel);
}

  confirmarReserva(): void {
    if (!this.currentUser) {
      this.snackBar.open('Error: Debes iniciar sesión para reservar.', 'Cerrar', { duration: 3000 });
      this.router.navigate(['/login']);
      return;
    }
    if (!this.sala || this.horariosSeleccionadosNgModel.length === 0) {
      this.snackBar.open('Por favor, selecciona al menos un horario para el espacio.', 'Cerrar', { duration: 3000 });
      return;
    }
    // El backend también validará el límite, pero una comprobación extra aquí no hace daño.
    if (this.horariosSeleccionadosNgModel.length > this.reservasRestantesHoy) {
        this.snackBar.open(`No puedes reservar más de ${this.MAX_RESERVAS_ESPACIO_POR_DIA} horas de espacio al día.`, 'Cerrar', { duration: 4000 });
        return;
    }

    this.isConfirmingReserva = true;

    const observablesDeReserva: Observable<Reserva>[] = this.horariosSeleccionadosNgModel.map(horario => {
      // 'horario.fecha_con_hora_inicio' ya es un string ISO DateTime (probablemente en AppTZ desde el backend)
      // Lo convertimos a objeto Date para obtener el .toISOString() que es UTC.
      const fechaHoraReservaUTC = new Date(horario.fecha_con_hora_inicio).toISOString();

      const datosReserva: DatosCrearReservaEspacio = { // <--- Usa la interfaz corregida
        espacio_id: this.sala!.id,
        fecha_hora_inicio_utc: fechaHoraReservaUTC
      };
      console.log('Enviando reserva para espacio:', datosReserva);
      return this.adminService.crearReservaEspacio(datosReserva);
    });

    forkJoin(observablesDeReserva).subscribe({
      next: (respuestas) => {
        this.isConfirmingReserva = false;
        const exitosas = respuestas.filter(r => !!r).length;
        this.snackBar.open(`Se han confirmado ${exitosas} de ${this.horariosSeleccionadosNgModel.length} reserva(s) de espacio.`, 'Cerrar', { duration: 4000 });
        this.horariosSeleccionadosNgModel = []; // Limpiar selección
        // Recargar horarios para el día actual para reflejar los cambios
        if (this.fechaSeleccionada) {
          this.onFechaSeleccionada({value: this.fechaSeleccionada});
        }
        // this.router.navigate(['/perfil']); // O a mis reservas
      },
      error: (err: HttpErrorResponse) => {
        this.isConfirmingReserva = false;
        console.error("Error creando una o más reservas de espacio (forkJoin):", err);
        let displayMessage = 'Algunas reservas no pudieron confirmarse.';
        if (err.error && typeof err.error.message === 'string') {
            displayMessage = err.error.message;
        } else if (err.message) {
            displayMessage = err.message;
        }
        this.snackBar.open(displayMessage, 'Cerrar', { duration: 5000, panelClass: ['snackbar-error']});
        if (this.fechaSeleccionada) { // Recargar para mostrar el estado actual
          this.onFechaSeleccionada({value: this.fechaSeleccionada});
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }
}