import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { AdminService } from '../../admin/admin.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-crear-entrenador-dialog',
  templateUrl: './crear-entrenador-dialog.component.html',
  styleUrls: ['./crear-entrenador-dialog.component.css']
})

export class CrearEntrenadorDialogComponent {
  entrenadorForm: FormGroup;
  isLoading = false;

  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private snackBar = inject(MatSnackBar);

  constructor(public dialogRef: MatDialogRef<CrearEntrenadorDialogComponent>) {
    this.entrenadorForm = this.fb.group({
      nombre_entrenador: ['', Validators.required],
      especializacion: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.entrenadorForm.invalid) {
      this.entrenadorForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.adminService.createEntrenador(this.entrenadorForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.dialogRef.close(true); // Éxito
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error creando entrenador:', error);
        this.snackBar.open(`Error: ${error.message || 'No se pudo crear el entrenador'}`, 'Cerrar', { duration: 4000 });
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}