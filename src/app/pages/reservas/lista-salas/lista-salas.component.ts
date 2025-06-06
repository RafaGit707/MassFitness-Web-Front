import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService, Espacio } from '../../../admin/admin.service'; // Ajusta la ruta si AdminService tiene getEspacios()
                                                                // O crea un ReservaService dedicado

@Component({
  selector: 'app-lista-salas',
  templateUrl: './lista-salas.component.html',
  styleUrls: ['./lista-salas.component.css'] // Puedes crear este archivo o usar estilos comunes
})
export class ListaSalasComponent implements OnInit {
  salas: Espacio[] = [];
  isLoading = true;

  // Inyecta el servicio que obtiene los espacios (AdminService o un nuevo ReservaService)
  constructor(private adminService: AdminService, private router: Router) { }

  ngOnInit(): void {
    this.adminService.getEspacios().subscribe({ // Asume que getEspacios() existe y devuelve Espacio[]
      next: (data) => {
        this.salas = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando salas/espacios:', err);
        this.isLoading = false;
        // Aquí deberías mostrar un mensaje de error al usuario, ej. con MatSnackBar
      }
    });
  }

  seleccionarSala(salaId: number): void {
    // Navega a la página de detalle y reserva de la sala, pasando el ID de la sala
    this.router.navigate(['/reservar/sala', salaId]);
  }
}