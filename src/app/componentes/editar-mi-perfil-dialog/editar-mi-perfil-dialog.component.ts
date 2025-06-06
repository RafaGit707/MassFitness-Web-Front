import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService, User } from 'src/app/servicios/auth.service';

@Component({
  selector: 'app-editar-mi-perfil-dialog',
  templateUrl: './editar-mi-perfil-dialog.component.html',
  styleUrls: ['./editar-mi-perfil-dialog.component.css']
})
export class EditarMiPerfilDialogComponent implements OnInit {
  perfilForm: FormGroup;
  isLoading = false;
  userId: number;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService); // Inyecta AuthService
  private snackBar = inject(MatSnackBar);
  // Podrías necesitar un AdminService o un UserService dedicado si la API es diferente
  // private adminService = inject(AdminService);


  constructor(
    public dialogRef: MatDialogRef<EditarMiPerfilDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: User
  ) {
    this.userId = data.id; // Guarda el ID del usuario
    this.perfilForm = this.fb.group({
      nombre: [data.nombre || '', Validators.required],
      nombre_usuario: [data.nombre_usuario || '', Validators.required],
      correo_electronico: [data.correo_electronico || '', [Validators.required, Validators.email]],
      // No incluimos rol aquí, el usuario no debería poder cambiarlo
      // La contraseña se manejaría por separado
    });
  }

  ngOnInit(): void {
    // El formulario ya se inicializa con 'data' en el constructor
  }

  onSubmit(): void {
    if (this.perfilForm.invalid) {
      this.perfilForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    const updatedProfileData = this.perfilForm.value;

    // Necesitas un método en AuthService (o un nuevo UserService) para actualizar el perfil
    // y un endpoint en Laravel. Asumamos que existe `this.authService.updateMyProfile(updatedProfileData)`
    // o `this.adminService.updateUsuario(this.userId, updatedProfileData)` si reutilizas el del admin.
    // Es mejor un endpoint específico para el perfil del usuario autenticado.

    // EJEMPLO: Si reutilizas el endpoint de adminService (ajusta según tu API)
    // ¡CUIDADO! Esto permitiría cambiar el nombre_usuario y correo_electronico
    // que podrían necesitar validación de unicidad diferente para el propio perfil.
    this.authService.updateMyProfile(this.data.id, updatedProfileData).subscribe({
    // O si usas el de admin: this.adminService.updateUsuario(this.userId, updatedProfileData).subscribe({
      next: (updatedUser) => {
        this.isLoading = false;
        this.snackBar.open('Perfil actualizado correctamente', 'Cerrar', { duration: 3000 });
        this.dialogRef.close(updatedUser); // Devuelve el usuario actualizado
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error actualizando perfil:', error);
        this.snackBar.open(error.message || 'No se pudo actualizar el perfil', 'Cerrar', { duration: 4000 });
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}