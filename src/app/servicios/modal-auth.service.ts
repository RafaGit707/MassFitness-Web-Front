import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root' // Disponible en toda la aplicación
})
export class ModalAuthService {
  private abrirLoginModalSource = new Subject<void>();

  // Observable al que los componentes (AuthComponent) se pueden suscribir
  abrirLoginModal$ = this.abrirLoginModalSource.asObservable();

  constructor() { }

  /**
   * Llama a este método desde cualquier componente para solicitar
   * que se abra el modal de inicio de sesión.
   */
  solicitarAbrirLoginModal(): void {
    this.abrirLoginModalSource.next();
  }
}