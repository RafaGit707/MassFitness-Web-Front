import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, take, filter, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '../servicios/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    console.log('AuthGuard: Running canActivate check for route:', state.url);

    return this.authService.authInitialized$.pipe(
      tap(init => console.log('AuthGuard: authInitialized$ emitted:', init)),
      filter(initialized => initialized === true), // 1. Espera a que AuthService termine su chequeo inicial
      take(1),                                    //    Solo una vez después de que la inicialización se complete
      switchMap(() => {
        // 2. Una vez AuthService está inicializado, comprobamos si el usuario está logueado
        console.log('AuthGuard: Auth service initialized. Checking isLoggedIn status...');
        const isLoggedIn = this.authService.isLoggedIn(); // Llama al método isLoggedIn()
        console.log('AuthGuard: isLoggedIn status from AuthService:', isLoggedIn);

        if (isLoggedIn) {
          console.log('AuthGuard: Access GRANTED for route:', state.url);
          return of(true); // Permite el acceso (devuelve Observable<true>)
        } else {
          console.warn('AuthGuard: Access DENIED for route:', state.url, '. User is not logged in. Redirecting to login...');
          // Crea y devuelve un UrlTree para redirigir a la página de login
          return of(this.router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } }));
          // El queryParams es opcional, para redirigir de vuelta después del login
        }
      })
    );
  }
}