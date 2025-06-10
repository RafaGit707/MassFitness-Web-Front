import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService, Clase } from '../../../admin/admin.service';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-lista-clases',
  templateUrl: './lista-clases.component.html',
  styleUrls: ['./lista-clases.component.css']
})
export class ListaClasesComponent implements OnInit {
  clases: Clase[] = [];
  isLoading = true;

  constructor(private adminService: AdminService, private router: Router) { } // O ReservaService

  ngOnInit(): void {
    this.adminService.getClases().subscribe({ // O reservaService.getClasesDisponibles()
      next: (data) => {
        this.clases = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando clases:', err);
        this.isLoading = false;
        // Mostrar error al usuario
      }
    });
  }

  seleccionarClase(claseId: number): void {
    console.log('Navegando a detalle de clase con ID:', claseId);
    this.router.navigate(['/reservar/clase', claseId]);
  }

   getImagenParaClase(clase: any): string {
    // Lógica para determinar la imagen
    // Opción 1: Si tienes una propiedad 'imagenUrl' directamente en el objeto clase
    // if (clase.imagenUrl) {
    //   return clase.imagenUrl;
    // }

    // Opción 2: Mapear por 'tipo_clase' o 'nombre' a imágenes locales o remotas
    // Asegúrate de que las rutas a las imágenes sean correctas desde tu carpeta 'assets'
    switch (clase.tipo_clase?.toLowerCase() || clase.nombre?.toLowerCase()) {
      case 'boxeo':
        return 'assets/boxeo.webp'; // Ejemplo de ruta
      case 'yoga':
        return 'assets/yoga.webp';
      case 'spinning':
        return 'assets/spinning.webp';
      case 'zumba':
        return 'assets/zumba.webp';
      default:
        return 'assets/fondosobre.webp'; // Una imagen por defecto
    }
  }
}