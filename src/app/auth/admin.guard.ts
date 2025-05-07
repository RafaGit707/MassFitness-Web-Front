// src/app/auth/admin.guard.ts (o la ruta donde lo tengas)

import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, filter, switchMap, tap } from 'rxjs/operators'; // Asegúrate de importar todos los operadores
import { AuthService } from '../servicios/auth.service'; // Ajusta la ruta a tu AuthService

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    console.log('AdminGuard: Running canActivate check...');

    return this.authService.authInitialized$.pipe(
      tap(init => console.log('AdminGuard: authInitialized$ emitted:', init)),
      filter(initialized => initialized === true), // 1. Espera a que AuthService termine su chequeo inicial
      take(1), // Solo necesitamos saber el resultado final de la inicialización una vez
      switchMap(() => {
        // 2. Una vez AuthService está inicializado, obtenemos el estado actual de isAdmin$
        console.log('AdminGuard: Auth initialized. Checking isAdmin$ status...');
        // Usamos isAdmin$ directamente, que ya está basado en user$
        return this.authService.isAdmin$;
      }),
      take(1), // Tomamos el primer valor emitido por isAdmin$ DESPUÉS de la inicialización
      tap(isAdmin => console.log('AdminGuard: isAdmin$ after init emitted:', isAdmin)),
      map(isAdmin => {
        // 3. Decide basado en el estado de administrador verificado
        if (isAdmin) {
          console.log('AdminGuard: Access GRANTED.');
          return true; // Permite el acceso a la ruta
        } else {
          console.warn('AdminGuard: Access DENIED. User is not admin or not logged in. Redirecting to login...');
          // Redirige a la página de login si el usuario no es admin
          return this.router.createUrlTree(['/login']); // Asegúrate que '/login' sea tu ruta correcta
        }
      })
    );
  }
}