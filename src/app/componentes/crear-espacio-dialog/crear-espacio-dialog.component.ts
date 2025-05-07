import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { AdminService, Entrenador } from '../../admin/admin.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-crear-espacio-dialog',
  templateUrl: './crear-espacio-dialog.component.html',
  styleUrls: ['./crear-espacio-dialog.component.css']
})

export class CrearEspacioDialogComponent implements OnInit {
  espacioForm: FormGroup;
  isLoading = false;
  entrenadores$: Observable<Entrenador[]>;

  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private snackBar = inject(MatSnackBar);

  constructor(public dialogRef: MatDialogRef<CrearEspacioDialogComponent>) {
    this.espacioForm = this.fb.group({
      nombre: ['', Validators.required],
      capacidad_maxima: ['', [Validators.required, Validators.min(1), Validators.pattern("^[0-9]*$")]],
      entrenador_id: [null, Validators.required]
    });
    this.entrenadores$ = this.adminService.getEntrenadores();
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.espacioForm.invalid) {
      this.espacioForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.adminService.createEspacio(this.espacioForm.value).subscribe({ // Cambiado
      next: () => {
        this.isLoading = false;
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error creando espacio:', error);
        this.snackBar.open(`Error: ${error.message || 'No se pudo crear el espacio'}`, 'Cerrar', { duration: 4000 });
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}