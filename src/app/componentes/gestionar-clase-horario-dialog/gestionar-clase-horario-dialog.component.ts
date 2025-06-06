import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog'; // Añadir MatDialog
import { AdminService, Clase, ClaseHorarioDefinido } from '../../admin/admin.service'; // Ajusta ruta
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../componentes/confirm-dialog/confirm-dialog.component'; // Para confirmar eliminación

interface DiaSemana {
  valor: number;
  texto: string;
}

@Component({
  selector: 'app-gestionar-clase-horario-dialog',
  templateUrl: './gestionar-clase-horario-dialog.component.html',
  styleUrls: ['./gestionar-clase-horario-dialog.component.css']
})
export class GestionarClaseHorarioDialogComponent implements OnInit {
  clase: Clase;
  horariosDefinidos: ClaseHorarioDefinido[] = [];
  isLoadingHorarios = false;
  isEditing = false;
  currentEditingHorarioId: number | null = null;

  horarioForm: FormGroup;
  diasSemana: DiaSemana[] = [
    { valor: 1, texto: 'Lunes' }, { valor: 2, texto: 'Martes' },
    { valor: 3, texto: 'Miércoles' }, { valor: 4, texto: 'Jueves' },
    { valor: 5, texto: 'Viernes' }, { valor: 6, texto: 'Sábado' },
    { valor: 7, texto: 'Domingo' }
  ];

  displayedColumns: string[] = ['dia_semana', 'hora_inicio', 'duracion', 'capacidad', 'acciones'];

  constructor(
    public dialogRef: MatDialogRef<GestionarClaseHorarioDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: { clase: Clase },
    private adminService: AdminService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private matDialog: MatDialog // Para el diálogo de confirmación
  ) {
    this.clase = this.dialogData.clase;
    this.horarioForm = this.fb.group({
      dia_semana: [null, Validators.required],
      hora_inicio: ['', [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)]], // HH:MM
      duracion_minutos: [60, [Validators.required, Validators.min(15)]],
      capacidad_maxima: [this.clase.capacidad_maxima || 10, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.cargarHorariosDefinidos();
  }

  cargarHorariosDefinidos(): void {
    this.isLoadingHorarios = true;
    this.adminService.getHorariosDefinidosParaClase(this.clase.id).subscribe({
      next: (data) => {
        this.horariosDefinidos = data.sort((a, b) => a.dia_semana - b.dia_semana || a.hora_inicio.localeCompare(b.hora_inicio));
        this.isLoadingHorarios = false;
      },
      error: (err) => {
        this.isLoadingHorarios = false;
        this.snackBar.open('Error al cargar los horarios definidos.', 'Cerrar', { duration: 3000 });
      }
    });
  }

  getNombreDia(diaValor: number): string {
    return this.diasSemana.find(d => d.valor === diaValor)?.texto || 'Día inválido';
  }

  onGuardarHorario(): void {
    if (this.horarioForm.invalid) {
      this.horarioForm.markAllAsTouched();
      return;
    }

    const formValue = this.horarioForm.value;
    const horarioParaEnviar: Partial<ClaseHorarioDefinido> = {
      dia_semana: formValue.dia_semana,
      hora_inicio: formValue.hora_inicio,
      duracion_minutos: formValue.duracion_minutos,
      capacidad_maxima: formValue.capacidad_maxima
    };
    // No es necesario clase_id aquí si el backend lo toma de la ruta para store

    if (this.isEditing && this.currentEditingHorarioId !== null) {
      // Actualizar
      this.adminService.updateHorarioDefinido(this.currentEditingHorarioId, horarioParaEnviar).subscribe({
        next: () => {
          this.snackBar.open('Horario actualizado correctamente.', 'Cerrar', { duration: 2500 });
          this.resetForm();
          this.cargarHorariosDefinidos(); // <--- ACTUALIZA LA LISTA
        },
        error: (err) => {
            // El componente ahora maneja la extracción del mensaje
            const message = (err.error && typeof err.error.message === 'string')
                            ? err.error.message
                            : (err.message || 'Error al actualizar el horario.');
            this.snackBar.open(message, 'Cerrar', { duration: 4000, panelClass: ['snackbar-error'] });
            console.error('Error actualizando horario:', err);
        }
      });
    } else {
      // Crear
      this.adminService.crearHorarioDefinido(this.clase.id, horarioParaEnviar as ClaseHorarioDefinido).subscribe({
        next: () => {
          this.snackBar.open('Horario creado exitosamente.', 'Cerrar', { duration: 2500 });
          this.resetForm();
          this.cargarHorariosDefinidos(); // <--- ACTUALIZA LA LISTA
        },
        error: (err) => {
            // El componente ahora maneja la extracción del mensaje
            const message = (err.error && typeof err.error.message === 'string')
                            ? err.error.message
                            : (err.message || 'Error al crear el horario.');
            this.snackBar.open(message, 'Cerrar', { duration: 4000, panelClass: ['snackbar-error'] });
            console.error('Error creando horario:', err);
        }
      });
    }
  }

  editarHorario(horario: ClaseHorarioDefinido): void {
    this.isEditing = true;
    this.currentEditingHorarioId = horario.id!;
    this.horarioForm.patchValue({
      dia_semana: horario.dia_semana,
      hora_inicio: horario.hora_inicio.substring(0, 5), // Asume HH:MM:SS y toma HH:MM
      duracion_minutos: horario.duracion_minutos,
      capacidad_maxima: horario.capacidad_maxima
    });
  }

  eliminarHorario(horarioId: number): void {
    const confirmDialogRef = this.matDialog.open(ConfirmDialogComponent, {
      data: { message: `¿Estás seguro de eliminar este horario? Las reservas existentes para este horario no se verán afectadas pero no se podrán hacer nuevas.` }
    });

    confirmDialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.adminService.deleteHorarioDefinido(horarioId).subscribe({
          next: () => {
            this.snackBar.open('Horario eliminado.', 'Cerrar', { duration: 2000 });
            this.cargarHorariosDefinidos();
            if (this.currentEditingHorarioId === horarioId) {
                this.resetForm();
            }
          },
          error: (err) => this.snackBar.open(err.message || 'Error al eliminar horario.', 'Cerrar', { duration: 3000 })
        });
      }
    });
  }

  resetForm(): void {
    this.isEditing = false;
    this.currentEditingHorarioId = null;
    this.horarioForm.reset({
        dia_semana: null,
        hora_inicio: '',
        duracion_minutos: 60,
        capacidad_maxima: this.clase.capacidad_maxima || 10
    });
    this.horarioForm.markAsPristine();
    this.horarioForm.markAsUntouched();
  }

  onCerrarDialogo(): void {
    this.dialogRef.close(); // No devuelve nada para no recargar innecesariamente
  }
}