import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { AdminService, Entrenador } from '../../admin/admin.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-editar-entrenador-dialog',
  templateUrl: './editar-entrenador-dialog.component.html',
  styleUrls: ['./editar-entrenador-dialog.component.css']
})

export class EditarEntrenadorDialogComponent implements OnInit {
  entrenadorForm: FormGroup;
  isLoading = false;

  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private snackBar = inject(MatSnackBar);

  constructor(
    public dialogRef: MatDialogRef<EditarEntrenadorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Entrenador
  ) {
    this.entrenadorForm = this.fb.group({
      nombre_entrenador: ['', Validators.required],
      especializacion: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.entrenadorForm.patchValue({
        nombre_entrenador: this.data.nombre_entrenador,
        especializacion: this.data.especializacion
      });
    }
  }

  onSubmit(): void {
    if (this.entrenadorForm.invalid) {
      this.entrenadorForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.adminService.updateEntrenador(this.data.id, this.entrenadorForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error actualizando entrenador:', error);
        this.snackBar.open(`Error: ${error.message || 'No se pudo actualizar el entrenador'}`, 'Cerrar', { duration: 4000 });
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}