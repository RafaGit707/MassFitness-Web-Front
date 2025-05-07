import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AdminService } from '../../admin/admin.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-crear-usuario-dialog',
  templateUrl: './crear-usuario-dialog.component.html',
  styleUrls: ['./crear-usuario-dialog.component.css']
})

export class CrearUsuarioDialogComponent {
  userForm: FormGroup;
  isLoading = false;

  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private snackBar = inject(MatSnackBar);

  constructor(public dialogRef: MatDialogRef<CrearUsuarioDialogComponent>) {
    this.userForm = this.fb.group({
      nombre: ['', Validators.required],
      nombre_usuario: ['', Validators.required],
      correo_electronico: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      rol: ['usuario', Validators.required] // Valor por defecto, ajusta si es necesario
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched(); // Marca campos para mostrar errores
      return;
    }

    this.isLoading = true;
    // Asegúrate que tu servicio/backend maneje la contraseña (hashing)
    this.adminService.createUsuario(this.userForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        // No mostramos snackbar aquí, lo hacemos en el componente padre
        this.dialogRef.close(true); // Cierra y devuelve true (éxito)
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error creando usuario:', error);
        this.snackBar.open(`Error: ${error.message || 'No se pudo crear el usuario'}`, 'Cerrar', { duration: 4000 });
        // No cerramos el diálogo en caso de error, el usuario puede corregir
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(); // Cierra sin devolver nada (o false)
  }
}