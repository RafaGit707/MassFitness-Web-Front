import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { AdminService, Entrenador } from '../../admin/admin.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-crear-clase-dialog',
  templateUrl: './crear-clase-dialog.component.html',
  styleUrls: ['./crear-clase-dialog.component.css']
})

export class CrearClaseDialogComponent implements OnInit {
  claseForm: FormGroup;
  isLoading = false;
  entrenadores$: Observable<Entrenador[]>;

  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private snackBar = inject(MatSnackBar);

  constructor(public dialogRef: MatDialogRef<CrearClaseDialogComponent>) {
    this.claseForm = this.fb.group({
      nombre: ['', Validators.required],
      capacidad_maxima: ['', [Validators.required, Validators.min(1), Validators.pattern("^[0-9]*$")]],
      entrenador_id: [null, Validators.required] // Cambiado a null para el selector
    });
    this.entrenadores$ = this.adminService.getEntrenadores(); // Carga entrenadores para el select
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.claseForm.invalid) {
      this.claseForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.adminService.createClase(this.claseForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error creando clase:', error);
        this.snackBar.open(`Error: ${error.message || 'No se pudo crear la clase'}`, 'Cerrar', { duration: 4000 });
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
