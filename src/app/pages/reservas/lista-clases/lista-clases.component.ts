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
}