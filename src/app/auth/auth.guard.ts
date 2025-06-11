import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, take, filter, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '../servicios/auth.service';
import { ModalAuthService } from '../servicios/modal-auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router, private modalAuthService: ModalAuthService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    console.log('AuthGuard: Running canActivate check for route:', state.url);

    return this.authService.authInitialized$.pipe(
      tap(init => console.log('AuthGuard: authInitialized$ emitted:', init)),
      filter(initialized => initialized === true), // 1. Espera a que AuthService termine su chequeo inicial
      take(1),                                    //    Solo una vez después de que la inicialización se complete
      switchMap(() => {
        // 2. Una vez AuthService está inicializado, comprobamos el estado de login
        console.log('AuthGuard: Auth service initialized. Checking user status...');
        // Es mejor usar el observable user$ para obtener el estado más actual
        // y asegurar que se basa en la última emisión.
        return this.authService.user$.pipe(
          take(1), // Tomar el estado actual del usuario
          map(user => {
            const isLoggedIn = !!user; // Convierte el objeto user a booleano
            console.log('AuthGuard: isLoggedIn status based on user$:', isLoggedIn);

            if (isLoggedIn) {
              console.log('AuthGuard: Access GRANTED for route:', state.url);
              return true; // Usuario logueado, permitir acceso
            } else {
              console.warn('AuthGuard: Access DENIED for route:', state.url, '. User is not logged in. Requesting login modal...');

              // Usuario no logueado:
              // a. Solicitar abrir el modal de login a través del servicio
              this.modalAuthService.solicitarAbrirLoginModal();

              // b. Cancelar la navegación actual a la ruta protegida.
              //    Devolver 'false' cancela la navegación y el usuario se queda
              //    en la página actual, viendo el modal que AuthComponent abrirá.
              //    Opcionalmente, puedes redirigir a la home si prefieres:
              //    return this.router.createUrlTree(['/']);
              return false;
            }
          })
        );
      })
    );
  }
}