import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-info-gym',
  templateUrl: './info-gym.component.html',
  styleUrls: ['./info-gym.component.css']
})
export class InfoGymComponent {
  // Variable para el efecto parallax de fondo si NO usas background-attachment: fixed
  // y quieres que el fondo se mueva con el scroll.
  // Si usas background-attachment: fixed, esta lógica de --scroll-y no es necesaria para el fondo.
  // Sin embargo, la tenías en tu CSS original para .parallax-container, así que la mantengo.
  private scrollListenerFn!: () => void;
  @ViewChild('parallaxContainerElement') parallaxContainer!: ElementRef<HTMLElement>;


  constructor(private router: Router, private renderer: Renderer2, private el: ElementRef) { }

  ngOnInit(): void {
    // Listener para actualizar la variable CSS --scroll-y
    // Esto solo es necesario si tu .parallax-container usa var(--scroll-y) en background-position
    // y NO usa background-attachment: fixed.
    this.scrollListenerFn = this.renderer.listen('window', 'scroll', () => {
      // Aplicar la variable al elemento .parallax-container o a :host si es necesario
      if (this.parallaxContainer && this.parallaxContainer.nativeElement) {
        this.parallaxContainer.nativeElement.style.setProperty('--scroll-y', `${window.scrollY}px`);
      } else {
        // Fallback al elemento host si parallaxContainer no está listo (menos preciso para background-position)
        // this.el.nativeElement.style.setProperty('--scroll-y', `${window.scrollY}px`);
      }
    });
    // Actualizar una vez al inicio
    if (this.parallaxContainer && this.parallaxContainer.nativeElement) {
        this.parallaxContainer.nativeElement.style.setProperty('--scroll-y', `${window.scrollY}px`);
    }
  }

  navegarAReservaClases(tipo?: string): void {
    // Lógica de autenticación aquí si es necesario antes de navegar,
    // o usar un AuthGuard en la ruta de reserva.
    if (tipo) {
      this.router.navigate(['/reservar/clases'], { queryParams: { tipo: tipo } });
    } else {
      this.router.navigate(['/reservar/clases']);
    }
  }

  navegarAReservaSalas(): void {
    this.router.navigate(['/reservar/salas']);
  }

  navegarAEntrenadores(): void {
    this.router.navigate(['/entrenadores']); // Asegúrate que esta ruta exista
  }

  ngOnDestroy(): void {
    if (this.scrollListenerFn) {
      this.scrollListenerFn(); // Esto remueve el listener de scroll
    }
  }
}
