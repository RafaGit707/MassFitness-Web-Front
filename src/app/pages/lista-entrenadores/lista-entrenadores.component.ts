import { Component } from '@angular/core';
import { AdminService, Entrenador } from 'src/app/admin/admin.service';

@Component({
  selector: 'app-lista-entrenadores',
  templateUrl: './lista-entrenadores.component.html',
  styleUrls: ['./lista-entrenadores.component.css']
})
export class ListaEntrenadoresComponent {
  entrenadores: Entrenador[] = [];
  isLoading = true;

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.adminService.getEntrenadores().subscribe({
      next: (data) => {
        this.entrenadores = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error al cargar entrenadores:", err);
        this.isLoading = false;
        // Manejar error en UI (ej. snackbar)
      }
    });
  }

  getFotoEntrenador(entrenador: Entrenador): string {
    // Fallback a imágenes predeterminadas basadas en algo (o una genérica)
    // Esto es solo un ejemplo, podrías tener una lógica más compleja
    // o simplemente una imagen placeholder.
    const nombreNormalizado = entrenador.nombre_entrenador.toLowerCase().split(' ')[0];
    const placeholderBase = 'assets/'; // Carpeta de placeholders

    // Intenta con nombre (muy básico, necesitarías imágenes como 'ana.jpg', 'carlos.jpg')
    if (nombreNormalizado) {
      return `${placeholderBase}${nombreNormalizado}.jpg`;
    }
    // O basado en género si tuvieras esa info (más complejo)

    // Placeholder genérico
    return `${placeholderBase}default-entrenador.png`;
  }
}
