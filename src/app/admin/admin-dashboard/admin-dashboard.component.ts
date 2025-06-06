import { Component, OnInit } from '@angular/core';
import { AdminService, Entrenador, Clase, Espacio } from '../../admin/admin.service';
import { User, AuthService } from '../../servicios/auth.service';
import { Subscription } from 'rxjs';
import { filter, switchMap, take, tap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CrearUsuarioDialogComponent } from 'src/app/componentes/crear-usuario-dialog/crear-usuario-dialog.component';
import { ConfirmDialogComponent } from 'src/app/componentes/confirm-dialog/confirm-dialog.component';
import { EditarUsuarioDialogComponent } from 'src/app/componentes/editar-usuario-dialog/editar-usuario-dialog.component';
import { CrearEspacioDialogComponent } from 'src/app/componentes/crear-espacio-dialog/crear-espacio-dialog.component';
import { EditarEntrenadorDialogComponent } from 'src/app/componentes/editar-entrenador-dialog/editar-entrenador-dialog.component';
import { CrearEntrenadorDialogComponent } from 'src/app/componentes/crear-entrenador-dialog/crear-entrenador-dialog.component';
import { CrearClaseDialogComponent } from 'src/app/componentes/crear-clase-dialog/crear-clase-dialog.component';
import { EditarClaseDialogComponent } from 'src/app/componentes/editar-clase-dialog/editar-clase-dialog.component';
import { EditarEspacioDialogComponent } from 'src/app/componentes/editar-espacio-dialog/editar-espacio-dialog.component';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { GestionarClaseHorarioDialogComponent } from 'src/app/componentes/gestionar-clase-horario-dialog/gestionar-clase-horario-dialog.component';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})

export class AdminDashboardComponent implements OnInit {

  isLoadingUsuarios = false;
  isLoadingEntrenadores = false;
  isLoadingClases = false;
  isLoadingEspacios = false;

  usuarios: User[] = [];
  entrenadores: Entrenador[] = [];
  clases: Clase[] = [];
  espacios: Espacio[] = [];

  displayedColumnsUsuarios: string[] = ['id', 'nombre', 'nombre_usuario', 'correo_electronico', 'rol', 'acciones'];
  displayedColumnsEntrenadores: string[] = ['id', 'nombre_entrenador', 'especializacion', 'acciones'];
  displayedColumnsClases: string[] = ['id', 'nombre', 'capacidad_maxima', 'entrenador_id', 'acciones'];
  displayedColumnsEspacios: string[] = ['id', 'nombre', 'capacidad_maxima', 'entrenador_id', 'acciones'];

  private dataLoadSubscription: Subscription | undefined;

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    public dialog: MatDialog,
    private router: Router,
    private snackBar: MatSnackBar
    ) { }

  ngOnInit(): void {
    console.log('AdminDashboard: ngOnInit - Waiting for auth initialization...');
    this.dataLoadSubscription = this.authService.authInitialized$.pipe(
      tap(initialized => console.log('AdminDashboard: authInitialized$ emitted:', initialized)),
      filter(initialized => initialized === true),
      take(1), // Solo la primera vez que se inicializa
      switchMap(() => {
        console.log('AdminDashboard: Auth is initialized. Checking user status...');
        return this.authService.user$; // Ahora escucha el estado del usuario
      }),
      tap(user => console.log('AdminDashboard: user$ emitted after auth init:', user)),
    ).subscribe(user => {
      // Verifica si el usuario existe Y si ES admin antes de cargar
      if (user && user.rol?.toUpperCase() === 'ADMIN' && this.authService.isLoggedIn()) {
        console.log('AdminDashboard: Auth initialized and user IS ADMIN. Loading all data...', user);
        this.cargarTodosLosDatos();
      } else if (user) {
        console.warn('AdminDashboard: Auth initialized, user logged in BUT NOT ADMIN. Not loading data.');
        // Redirigir si un no-admin llega aquí (aunque el guard debería prevenirlo)
        this.router.navigate(['/']); // O a donde sea apropiado
      } else {
        console.warn('AdminDashboard: Auth initialized BUT user is NOT logged in. Not loading data.');
      }
    });
  }

  cargarTodosLosDatos(): void {
    console.log('AdminDashboard: cargarTodosLosDatos() called.');
    this.cargarUsuarios();
    this.cargarEntrenadores();
    this.cargarClases();
    this.cargarEspacios();
  }

  cargarUsuarios(): void {
    this.isLoadingUsuarios = true;
    this.adminService.getUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.isLoadingUsuarios = false;
      },
      error: (err) => {
        console.error("Error cargando usuarios:", err);
        this.isLoadingUsuarios = false;
        this.mostrarError('Error al cargar usuarios');
      }
    });
  }

  cargarEntrenadores(): void {
     this.isLoadingEntrenadores = true;
    this.adminService.getEntrenadores().subscribe({
      next: (data) => {
        this.entrenadores = data;
         this.isLoadingEntrenadores = false;
      },
      error: (err) => {
        console.error("Error cargando entrenadores:", err);
         this.isLoadingEntrenadores = false;
         this.mostrarError('Error al cargar entrenadores');
      }
    });
  }

  cargarClases(): void {
     this.isLoadingClases = true;
    this.adminService.getClases().subscribe({
      next: (data) => {
        this.clases = data;
         this.isLoadingClases = false;
      },
      error: (err) => {
        console.error("Error cargando clases:", err);
        this.isLoadingClases = false;
        this.mostrarError('Error al cargar clases');

      }
    });
  }

  cargarEspacios(): void {
     this.isLoadingEspacios = true;
    this.adminService.getEspacios().subscribe({
      next: (data) => {
        this.espacios = data;
         this.isLoadingEspacios = false;
      },
      error: (err) => {
        console.error("Error cargando espacios:", err);
        this.isLoadingEspacios = false;
        this.mostrarError('Error al cargar espacios');
      }
    });
  }

  abrirModalCrearUsuario(): void {
    const dialogRef = this.dialog.open(CrearUsuarioDialogComponent, {
      width: '450px', // Ajusta el ancho según necesites
      disableClose: true // Evita cerrar al hacer clic fuera
    });

    dialogRef.afterClosed().subscribe(result => {
      // Si el diálogo devolvió 'true' o un objeto (indicando éxito)
      if (result) {
        this.mostrarMensaje('Usuario creado correctamente');
        this.cargarUsuarios(); // Recarga la tabla
      }
    });
 }

 abrirModalEditarUsuario(usuario: User): void {
   const dialogRef = this.dialog.open(EditarUsuarioDialogComponent, {
     width: '450px',
     disableClose: true,
     data: { ...usuario } // Pasa una copia del usuario al diálogo para evitar mutaciones directas
   });

   dialogRef.afterClosed().subscribe(result => {
     if (result) {
       this.mostrarMensaje('Usuario actualizado correctamente');
       this.cargarUsuarios();
     }
   });
 }

 eliminarUsuario(id: number): void {
   this.abrirDialogoConfirmacion(`¿Estás seguro de eliminar el usuario con ID ${id}?`)
     .subscribe(confirmado => {
       if (confirmado) {
         this.adminService.deleteUsuario(id).subscribe({ // Asume que existe este método en AdminService
           next: () => {
             this.mostrarMensaje('Usuario eliminado correctamente');
             this.cargarUsuarios();
           },
           error: (err) => {
             console.error("Error eliminando usuario:", err);
             this.mostrarError('Error al eliminar el usuario');
           }
         });
       }
     });
 }

  // ---- Entrenadores ----
  abrirModalCrearEntrenador(): void {
     const dialogRef = this.dialog.open(CrearEntrenadorDialogComponent, { width: '400px', disableClose: true });
     dialogRef.afterClosed().subscribe(result => { if (result) { this.mostrarMensaje('Entrenador creado'); this.cargarEntrenadores(); } });
  }

  abrirModalEditarEntrenador(entrenador: Entrenador): void {
     const dialogRef = this.dialog.open(EditarEntrenadorDialogComponent, { width: '400px', disableClose: true, data: { ...entrenador } });
     dialogRef.afterClosed().subscribe(result => { if (result) { this.mostrarMensaje('Entrenador actualizado'); this.cargarEntrenadores(); } });
  }

  eliminarEntrenador(id: number): void {
    this.abrirDialogoConfirmacion(`¿Estás seguro de eliminar el entrenador con ID ${id}?`)
      .subscribe(confirmado => {
        if (confirmado) {
          this.isLoadingEntrenadores = true;
          this.adminService.deleteEntrenador(id).subscribe({
            next: () => {
              this.isLoadingEntrenadores = false;
              this.mostrarMensaje('Entrenador eliminado correctamente');
              this.cargarEntrenadores();
            },
            error: (err: HttpErrorResponse) => { // Tipar como HttpErrorResponse
              this.isLoadingEntrenadores = false;
              console.error(`Error eliminando entrenador ID ${id} (desde componente):`, err);

              let displayMessage = 'No se pudo eliminar el entrenador.';
              if (err.error && typeof err.error.message === 'string') {
                displayMessage = err.error.message; // Mensaje específico del backend
              } else if (err.message) {
                displayMessage = err.message;
              }
              this.mostrarError(displayMessage);
            }
          });
        }
      });
  }

  // ---- Clases ----
  abrirModalCrearClase(): void {
     const dialogRef = this.dialog.open(CrearClaseDialogComponent, { width: '400px', disableClose: true });
     dialogRef.afterClosed().subscribe(result => { if (result) { this.mostrarMensaje('Clase creada'); this.cargarClases(); } });
  }

  abrirModalEditarClase(clase: Clase): void {
      const dialogRef = this.dialog.open(EditarClaseDialogComponent, { width: '400px', disableClose: true, data: { ...clase } });
      dialogRef.afterClosed().subscribe(result => { if (result) { this.mostrarMensaje('Clase actualizada'); this.cargarClases(); } });
  }

  eliminarClase(id: number): void {
  this.abrirDialogoConfirmacion(`¿Estás seguro de eliminar la clase con ID ${id}? Esta acción es irreversible.`)
    .subscribe(confirmado => {
      if (confirmado) {
        this.isLoadingClases = true;
        this.adminService.deleteClase(id).subscribe({ // Primera llamada (sin force)
          next: () => {
            this.isLoadingClases = false;
            this.mostrarMensaje('Clase eliminada correctamente.');
            this.cargarClases();
          },
          error: (err: HttpErrorResponse) => {
            this.isLoadingClases = false;
            console.error(`Error eliminando clase ID ${id}:`, err);
            if (err.status === 422 && err.error && err.error.requires_force) {
              // El backend indica que hay dependencias y requiere confirmación para forzar
              this.abrirDialogoConfirmacion(err.error.detailed_message || 'Esta clase tiene dependencias. ¿Forzar eliminación?')
                .subscribe(forceConfirmed => {
                  if (forceConfirmed) {
                    this.isLoadingClases = true;
                    // Segunda llamada, AHORA con el parámetro force=true
                    this.adminService.deleteClase(id, true).subscribe({ // Asume que deleteClase puede tomar 'force'
                      next: () => {
                        this.isLoadingClases = false;
                        this.mostrarMensaje('Clase y sus dependencias eliminadas correctamente.');
                        this.cargarClases();
                      },
                      error: (forceErr: HttpErrorResponse) => {
                        this.isLoadingClases = false;
                        const message = (forceErr.error && typeof forceErr.error.message === 'string')
                                          ? forceErr.error.message
                                          : 'No se pudo forzar la eliminación de la clase.';
                        this.mostrarError(message);
                      }
                    });
                  }
                });
            } else {
              // Otro tipo de error
              const message = (err.error && typeof err.error.message === 'string')
                                ? err.error.message
                                : 'Error al eliminar la clase.';
              this.mostrarError(message);
            }
          }
        });
      }
    });
}

   // Para mostrar nombres de entrenadores en la tabla de clases
  getNombreEntrenador(entrenadorId: number): string | undefined {
    const entrenador = this.entrenadores.find(e => e.id === entrenadorId);
    return entrenador ? entrenador.nombre_entrenador : undefined;
  }

  // ... (tus métodos CRUD existentes para clases) ...

  abrirModalGestionarHorarios(clase: Clase): void {
    console.log('Gestionar horarios para la clase:', clase);
    const dialogRef = this.dialog.open(GestionarClaseHorarioDialogComponent, {
      width: '700px', // Un poco más ancho para la gestión de horarios
      data: { clase: clase } // Pasamos la clase al diálogo
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'saved') { // Si el diálogo indica que se guardaron cambios
        this.mostrarMensaje('Horarios actualizados.');
        // No es necesario recargar todas las clases, solo los horarios si se muestran aquí.
        // Por ahora, un mensaje es suficiente.
      }
    });
  }

  // ---- Espacios ----
  abrirModalCrearEspacio(): void {
     const dialogRef = this.dialog.open(CrearEspacioDialogComponent, { width: '400px', disableClose: true });
     dialogRef.afterClosed().subscribe(result => { if (result) { this.mostrarMensaje('Espacio creado'); this.cargarEspacios(); } });
  }

  abrirModalEditarEspacio(espacio: Espacio): void {
      const dialogRef = this.dialog.open(EditarEspacioDialogComponent, { width: '400px', disableClose: true, data: { ...espacio } });
      dialogRef.afterClosed().subscribe(result => { if (result) { this.mostrarMensaje('Espacio actualizado'); this.cargarEspacios(); } });
  }

  eliminarEspacio(id: number): void {
      this.abrirDialogoConfirmacion(`¿Estás seguro de eliminar el espacio con ID ${id}?`)
       .subscribe(confirmado => {
         if (confirmado) {
           this.adminService.deleteEspacio(id).subscribe({ // Asume que existe este método
             next: () => { this.mostrarMensaje('Espacio eliminado'); this.cargarEspacios(); },
             error: (err) => { console.error(err); this.mostrarError('Error al eliminar espacio'); }
           });
         }
       });
  }

  private abrirDialogoConfirmacion(mensaje: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: { message: mensaje } // Pasa el mensaje al componente de confirmación
    });
    return dialogRef.afterClosed(); // Devuelve el observable para suscribirse
   }

   /** Muestra un mensaje de Snackbar */
   private mostrarMensaje(mensaje: string): void {
     this.snackBar.open(mensaje, 'Cerrar', {
       duration: 3000, // Duración en ms
       horizontalPosition: 'center',
       verticalPosition: 'top',
     });
   }

   /** Muestra un mensaje de error en Snackbar */
   private mostrarError(mensaje: string): void {
     this.snackBar.open(mensaje, 'Cerrar', {
       duration: 4000,
       horizontalPosition: 'center',
       verticalPosition: 'top',
       panelClass: ['snackbar-error'] // Clase CSS opcional para estilizar errores
     });
   }

   ngOnDestroy(): void {
    if (this.dataLoadSubscription) {
      this.dataLoadSubscription.unsubscribe();
    }
  }

}