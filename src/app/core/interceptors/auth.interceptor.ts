import { Injectable, Injector } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../servicios/auth.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    private apiUrl = environment.apiUrl;
    private tokenKey = 'authToken'; // Clave usada por AuthService para guardar el token

    // Constructor vacío o sin inyecciones relacionadas al ciclo
    constructor() {
        console.log('AuthInterceptor CONSTRUCTOR (Direct localStorage Access). API URL:', this.apiUrl);
    }

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        // Lee el token DIRECTAMENTE desde localStorage
        const token = localStorage.getItem(this.tokenKey); // <<< LECTURA DIRECTA

        const isApiUrl = request.url.startsWith(this.apiUrl);

        // Logs para depuración
        console.log(
        '%cAuthInterceptor: Intercepting request%c',
        'color: blue; font-weight: bold;', 'color: blue;',
        '\n  URL:', request.url,
        '\n  Token Present (from localStorage)?', !!token, // Indica que es de localStorage
        '\n  Token Value (first 20):', token ? token.substring(0, 20) + '...' : 'N/A',
        '\n  Is API URL?', isApiUrl, '(Request URL starts with API Base', this.apiUrl, '?)'
        );

        // Condición: Si hay token (de localStorage) y es URL de API (y no login/registro)
        if (token && isApiUrl && !request.url.endsWith('/login') && !request.url.endsWith('/registrar')) {
        console.log(
            '%cAuthInterceptor: ADDING TOKEN and Accept header (from localStorage)%c', // Indica origen
            'color: green; font-weight: bold;', 'color: green;',
            'for URL:', request.url
        );
        request = request.clone({
            setHeaders: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json'
            }
        });
        } else {
        console.log(
            '%cAuthInterceptor: NOT ADDING TOKEN%c',
            'color: orange; font-weight: bold;', 'color: orange;',
            'for URL:', request.url,
            `\n  Reasons: tokenFromLocalStorage=${!!token}, isApiUrl=${isApiUrl}, isLogin/Register=${request.url.endsWith('/login') || request.url.endsWith('/registrar')}`
        );
        }
        return next.handle(request);
    }

}
