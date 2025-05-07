import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { AdminService, Espacio, Entrenador } from '../../admin/admin.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-editar-espacio-dialog',
  templateUrl: './editar-espacio-dialog.component.html',
  styleUrls: ['./editar-espacio-dialog.component.css']
})

export class EditarEspacioDialogComponent implements OnInit {
  espacioForm: FormGroup;
  isLoading = false;
  entrenadores$: Observable<Entrenador[]>;

  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private snackBar = inject(MatSnackBar);

  constructor(
    public dialogRef: MatDialogRef<EditarEspacioDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Espacio // Recibe el Espacio a editar
  ) {
    this.espacioForm = this.fb.group({
      nombre: ['', Validators.required],
      capacidad_maxima: ['', [Validators.required, Validators.min(1), Validators.pattern("^[0-9]*$")]],
      // Hacemos entrenador_id opcional para permitir "Ninguno", pero si se envía debe ser un número válido.
      // El backend debe manejar null si no se asigna entrenador.
      entrenador_id: [null]
    });
    this.entrenadores$ = this.adminService.getEntrenadores();
  }

  ngOnInit(): void {
    if (this.data) {
      this.espacioForm.patchValue({
        nombre: this.data.nombre,
        capacidad_maxima: this.data.capacidad_maxima,
        entrenador_id: this.data.entrenador_id // Puede ser null si no tiene entrenador
      });
    }
  }

  onSubmit(): void {
    if (this.espacioForm.invalid) {
      this.espacioForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    const formData = this.espacioForm.value;
    // Si entrenador_id es una cadena vacía por el mat-select, convertir a null
    if (formData.entrenador_id === '') {
        formData.entrenador_id = null;
    }

    this.adminService.updateEspacio(this.data.id, formData).subscribe({
      next: () => {
        this.isLoading = false;
        this.dialogRef.close(true); // Éxito
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error actualizando espacio:', error);
        this.snackBar.open(`Error: ${error.message || 'No se pudo actualizar el espacio'}`, 'Cerrar', { duration: 4000 });
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
