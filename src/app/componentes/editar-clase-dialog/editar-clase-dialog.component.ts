import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { AdminService, Clase, Entrenador } from '../../admin/admin.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-editar-clase-dialog',
  templateUrl: './editar-clase-dialog.component.html',
  styleUrls: ['./editar-clase-dialog.component.css']
})

export class EditarClaseDialogComponent implements OnInit {
  claseForm: FormGroup;
  isLoading = false;
  entrenadores$: Observable<Entrenador[]>;

  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private snackBar = inject(MatSnackBar);

  constructor(
    public dialogRef: MatDialogRef<EditarClaseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Clase
  ) {
    this.claseForm = this.fb.group({
      nombre: ['', Validators.required],
      capacidad_maxima: ['', [Validators.required, Validators.min(1), Validators.pattern("^[0-9]*$")]],
      entrenador_id: [null, Validators.required]
    });
    this.entrenadores$ = this.adminService.getEntrenadores();
  }

  ngOnInit(): void {
    if (this.data) {
      this.claseForm.patchValue({
        nombre: this.data.nombre,
        capacidad_maxima: this.data.capacidad_maxima,
        entrenador_id: this.data.entrenador_id
      });
    }
  }

  onSubmit(): void {
    if (this.claseForm.invalid) {
      this.claseForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.adminService.updateClase(this.data.id, this.claseForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error actualizando clase:', error);
        this.snackBar.open(`Error: ${error.message || 'No se pudo actualizar la clase'}`, 'Cerrar', { duration: 4000 });
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
