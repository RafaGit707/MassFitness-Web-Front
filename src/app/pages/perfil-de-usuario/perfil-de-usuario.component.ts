import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService, User } from '../../servicios/auth.service'; // Ajusta la ruta
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-perfil-de-usuario',
  templateUrl: './perfil-de-usuario.component.html',
  styleUrls: ['./perfil-de-usuario.component.css']
})
export class PerfilDeUsuarioComponent implements OnInit, OnDestroy {
  usuario: User | null = null;
  private userSubscription: Subscription | undefined;
  isLoading: boolean = true; // Para mostrar un indicador de carga

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    console.log('PerfilDeUsuarioComponent: ngOnInit');
    // Nos suscribimos a user$ para obtener los datos del usuario actual
    // No necesitamos esperar a authInitialized$ aquí porque el AuthGuard ya lo hizo.
    // Si llegamos aquí, el usuario DEBERÍA estar logueado.
    this.userSubscription = this.authService.user$.subscribe(user => {
      if (user) {
        this.usuario = user;
        console.log('PerfilDeUsuarioComponent: User data received', this.usuario);
      } else {
        // Esto no debería pasar si AuthGuard funciona, pero como defensa.
        console.warn('PerfilDeUsuarioComponent: User is null after AuthGuard passed. This is unexpected.');
        // Podrías redirigir o manejar este caso.
      }
      this.isLoading = false;
    });

    // Opcional: si necesitas los datos más frescos y no confías en el cache de user$
    // podrías llamar a fetchAuthenticatedUser, pero AuthService ya lo hace al inicio.
    // Si AuthGuard ya pasó, user$ debería tener la información correcta.
  }

  // Ejemplo de una acción
  actualizarPerfil(): void {
    if (this.usuario) {
      alert(`Actualizar perfil para: ${this.usuario.nombre_usuario}`);
      // Aquí iría la lógica para abrir un diálogo de edición o llamar a un servicio
    }
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}