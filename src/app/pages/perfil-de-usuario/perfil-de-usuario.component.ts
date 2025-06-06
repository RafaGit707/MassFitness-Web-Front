// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { AuthService, User } from '../../servicios/auth.service'; // Ajusta la ruta
// import { Subscription } from 'rxjs';
// import { MatDialog } from '@angular/material/dialog';
// import { EditarMiPerfilDialogComponent } from 'src/app/componentes/editar-mi-perfil-dialog/editar-mi-perfil-dialog.component';
// import { CommonModule } from '@angular/common';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// @Component({
//   selector: 'app-perfil-de-usuario',
//   templateUrl: './perfil-de-usuario.component.html',
//   styleUrls: ['./perfil-de-usuario.component.css']
// })
// export class PerfilDeUsuarioComponent implements OnInit, OnDestroy {
//   usuario: User | null = null;
//   private userSubscription: Subscription | undefined;
//   isLoading: boolean = true;

//    constructor(private authService: AuthService, public dialog: MatDialog) { }

//   ngOnInit(): void {
//     console.log('PerfilDeUsuarioComponent: ngOnInit');
//     // Nos suscribimos a user$ para obtener los datos del usuario actual
//     // No necesitamos esperar a authInitialized$ aquí porque el AuthGuard ya lo hizo.
//     // Si llegamos aquí, el usuario DEBERÍA estar logueado.
//     this.userSubscription = this.authService.user$.subscribe(user => {
//       if (user) {
//         this.usuario = user;
//         console.log('PerfilDeUsuarioComponent: User data received', this.usuario);
//       } else {
//         // Esto no debería pasar si AuthGuard funciona, pero como defensa.
//         console.warn('PerfilDeUsuarioComponent: User is null after AuthGuard passed. This is unexpected.');
//         // Podrías redirigir o manejar este caso.
//       }
//       this.isLoading = false;
//     });

//     // Opcional: si necesitas los datos más frescos y no confías en el cache de user$
//     // podrías llamar a fetchAuthenticatedUser, pero AuthService ya lo hace al inicio.
//     // Si AuthGuard ya pasó, user$ debería tener la información correcta.
//   }

//  actualizarPerfil(): void {
//     if (this.usuario) {
//       const dialogRef = this.dialog.open(EditarMiPerfilDialogComponent, {
//         width: '450px',
//         data: { ...this.usuario } // Pasa los datos actuales al diálogo
//       });

//       dialogRef.afterClosed().subscribe(result => {
//         if (result) { // Si el diálogo devolvió datos actualizados o 'true'
//           // AuthService debería tener un método para refrescar el usuario actual si el backend lo actualizó
//           // o si el diálogo devuelve el usuario actualizado, actualizar this.usuario.
//           this.authService.fetchAuthenticatedUserInternal().subscribe(); // Vuelve a obtener el usuario para reflejar cambios
//           // O, si el diálogo devuelve el usuario actualizado:
//           // if (typeof result === 'object') { this.usuario = result; }
//           alert('Perfil actualizado (simulación)');
//         }
//       });
//     }
//   }

//   ngOnDestroy(): void {
//     if (this.userSubscription) {
//       this.userSubscription.unsubscribe();
//     }
//   }
// }

// src/app/pages/perfil-de-usuario/perfil-de-usuario.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService, User } from '../../servicios/auth.service';
import { AdminService } from '../../admin/admin.service'; // O ReservaService
import { Reserva } from '../../servicios/reserva.service'; // Ajusta ruta
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EditarMiPerfilDialogComponent } from '../../componentes/editar-mi-perfil-dialog/editar-mi-perfil-dialog.component'; // Ajusta ruta
import { ConfirmDialogComponent } from '../../componentes/confirm-dialog/confirm-dialog.component'; // Ajusta ruta
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-perfil-de-usuario',
  templateUrl: './perfil-de-usuario.component.html',
  styleUrls: ['./perfil-de-usuario.component.css']
})
export class PerfilDeUsuarioComponent implements OnInit, OnDestroy {
  usuario: User | null = null;
  misReservasClases: Reserva[] = [];
  misReservasEspacios: Reserva[] = [];
  isLoadingUsuario = true;
  isLoadingReservas = false;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private adminService: AdminService, // O ReservaService
    public dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    console.log('PerfilDeUsuarioComponent: ngOnInit');
    this.isLoadingUsuario = true;
    const userSub = this.authService.user$.subscribe(user => {
      if (user) {
        this.usuario = user;
        console.log('PerfilDeUsuarioComponent: User data received', this.usuario);
        this.cargarMisReservas(); // Carga las reservas una vez que tienes el usuario
      } else {
        console.warn('PerfilDeUsuarioComponent: User is null.');
        // El AuthGuard ya debería haber redirigido si no hay usuario
      }
      this.isLoadingUsuario = false;
    });
    this.subscriptions.add(userSub);
  }

   cargarMisReservas(): void {
    if (!this.usuario) return;

    this.isLoadingReservas = true;
    const hoy = new Date(); // Para filtrar solo reservas futuras
    hoy.setHours(0,0,0,0); // Comienzo del día de hoy para la comparación

    const reservasSub = this.adminService.getMisReservas().subscribe({ // Asume que getMisReservas devuelve Observable<Reserva[]>
      next: (reservas: Reserva[]) => { // Tipar 'reservas' aquí
        console.log('Todas mis reservas recibidas del backend:', reservas);

        this.misReservasClases = reservas.filter(r =>
          r.tipo_reserva === 'clase' && // <-- USA 'tipo_reserva'
          new Date(r.horario_reserva) >= hoy // <-- USA 'horario_reserva'
        ).sort((a, b) => new Date(a.horario_reserva).getTime() - new Date(b.horario_reserva).getTime());

        this.misReservasEspacios = reservas.filter(r =>
          r.tipo_reserva === 'espacio' && // <-- USA 'tipo_reserva'
          new Date(r.horario_reserva) >= hoy // <-- USA 'horario_reserva'
        ).sort((a, b) => new Date(a.horario_reserva).getTime() - new Date(b.horario_reserva).getTime());

        console.log('Mis reservas de clases (filtradas y ordenadas):', this.misReservasClases);
        console.log('Mis reservas de espacios (filtradas y ordenadas):', this.misReservasEspacios);
        this.isLoadingReservas = false;
      },
      error: (err) => {
        console.error('Error cargando mis reservas:', err);
        this.snackBar.open('Error al cargar tus reservas.', 'Cerrar', { duration: 3000 });
        this.isLoadingReservas = false;
      }
    });
    this.subscriptions.add(reservasSub);
  }

  // cargarMisReservas(): void {
  //   if (!this.usuario) return;

  //   this.isLoadingReservas = true;
  //   const reservasSub = this.adminService.getMisReservas().subscribe({
  //     next: (reservas) => {
  //       this.misReservasClases = reservas.filter(r => r.tipo_reservable_type === 'clase' && new Date(r.fecha_hora_reserva) >= new Date());
  //       this.misReservasEspacios = reservas.filter(r => r.tipo_reservable_type === 'espacio' && new Date(r.fecha_hora_reserva) >= new Date());
  //       // Ordenar por fecha más próxima primero
  //       this.misReservasClases.sort((a, b) => new Date(a.fecha_hora_reserva).getTime() - new Date(b.fecha_hora_reserva).getTime());
  //       this.misReservasEspacios.sort((a, b) => new Date(a.fecha_hora_reserva).getTime() - new Date(b.fecha_hora_reserva).getTime());

  //       console.log('Mis reservas de clases:', this.misReservasClases);
  //       console.log('Mis reservas de espacios:', this.misReservasEspacios);
  //       this.isLoadingReservas = false;
  //     },
  //     error: (err) => {
  //       console.error('Error cargando mis reservas:', err);
  //       this.snackBar.open('Error al cargar tus reservas.', 'Cerrar', { duration: 3000 });
  //       this.isLoadingReservas = false;
  //     }
  //   });
  //   this.subscriptions.add(reservasSub);
  // }

  actualizarPerfil(): void {
    if (this.usuario) {
      const dialogRef = this.dialog.open(EditarMiPerfilDialogComponent, {
        width: '450px',
        data: { ...this.usuario }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.isLoadingUsuario = true; // Muestra spinner mientras se refresca
          // AuthService actualiza el userSubject internamente después de updateMyProfile
          this.authService.updateMyProfile(this.usuario!.id, result as User).subscribe({
            next: (updatedUser) => {
                this.snackBar.open('Perfil actualizado correctamente.', 'Cerrar', { duration: 3000 });
                // user$ emitirá el nuevo usuario, no es necesario asignar this.usuario aquí si te suscribes a user$
                this.isLoadingUsuario = false;
            },
            error: (err: HttpErrorResponse) => {
                this.isLoadingUsuario = false;
                const message = (err.error && typeof err.error.message === 'string') ? err.error.message : 'No se pudo actualizar el perfil.';
                this.snackBar.open(message, 'Cerrar', { duration: 4000, panelClass: ['snackbar-error'] });
            }
          });
        }
      });
    }
  }

  cancelarReserva(reserva: Reserva): void {
    const tipo = reserva.tipo_reserva === 'clase' ? 'la clase' : 'el espacio';
    const nombre = reserva.tipo_reserva === 'clase' ? reserva.clase?.nombre : reserva.espacio?.nombre;
    const fechaHora = new Date(reserva.horario_reserva).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' });

    const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: `¿Estás seguro de cancelar tu reserva para ${tipo} "${nombre}" el ${fechaHora}?` }
    });

    confirmDialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.isLoadingReservas = true; // Podrías tener un isLoading para la reserva específica
        this.adminService.cancelarReserva(reserva.id).subscribe({
          next: (response: any) => { // El backend puede devolver un mensaje
            this.snackBar.open(response.message || 'Reserva cancelada correctamente.', 'Cerrar', { duration: 3000 });
            this.cargarMisReservas(); // Recarga la lista de reservas
          },
          error: (err: HttpErrorResponse) => {
            this.isLoadingReservas = false;
            const message = (err.error && typeof err.error.message === 'string') ? err.error.message : 'No se pudo cancelar la reserva.';
            this.snackBar.open(message, 'Cerrar', { duration: 4000, panelClass: ['snackbar-error']});
          }
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}