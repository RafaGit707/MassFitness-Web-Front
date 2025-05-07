import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AdminService } from '../../admin/admin.service';
import { User } from '../../servicios/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-editar-usuario-dialog',
  templateUrl: './editar-usuario-dialog.component.html',
  styleUrls: ['./editar-usuario-dialog.component.css']
})

export class EditarUsuarioDialogComponent implements OnInit {
  userForm: FormGroup;
  isLoading = false;

  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private snackBar = inject(MatSnackBar);

  constructor(
    public dialogRef: MatDialogRef<EditarUsuarioDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: User // Recibe el usuario a editar
  ) {
    this.userForm = this.fb.group({
      nombre: ['', Validators.required],
      nombre_usuario: ['', Validators.required],
      correo_electronico: ['', [Validators.required, Validators.email]],
      // La contraseña es opcional al editar. El backend no debería actualizarla si viene vacía.
      contrasena: ['', [Validators.minLength(6)]],
      rol: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Rellena el formulario con los datos del usuario
    // No incluimos la contraseña al rellenar
    if (this.data) {
      this.userForm.patchValue({
        nombre: this.data.nombre,
        nombre_usuario: this.data.nombre_usuario,
        correo_electronico: this.data.correo_electronico,
        rol: this.data.rol
      });
    }
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
       this.userForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const updatedData = { ...this.userForm.value };

    // Elimina la contraseña del payload si está vacía para no enviarla
    if (!updatedData.contrasena) {
      delete updatedData.contrasena;
    }

    // Llama al servicio de actualización
    this.adminService.updateUsuario(this.data.id, updatedData).subscribe({
      next: () => {
        this.isLoading = false;
        this.dialogRef.close(true); // Éxito
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error actualizando usuario:', error);
        this.snackBar.open(`Error: ${error.message || 'No se pudo actualizar el usuario'}`, 'Cerrar', { duration: 4000 });
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}