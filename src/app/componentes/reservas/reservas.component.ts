import { Component, OnInit } from '@angular/core';
import { ReservaService } from '../../servicios/reserva.service';

@Component({
  selector: 'app-reservas',
  templateUrl: './reservas.component.html',
  styleUrls: ['./reservas.component.css']
})
export class ReservasComponent implements OnInit {
  clases: any[] = [];
  espacios: any[] = [];
  reservas: any[] = [];

  constructor(private reservaService: ReservaService) {}

  ngOnInit(): void {
    this.cargarClases();
    this.cargarEspacios();
    this.cargarReservas();
  }

  cargarClases() {
    this.reservaService.getClases().subscribe(data => {
      this.clases = data;
    });
  }

  cargarEspacios() {
    this.reservaService.getEspacios().subscribe(data => {
      this.espacios = data;
    });
  }

  cargarReservas() {
    this.reservaService.getReservas().subscribe(data => {
      this.reservas = data;
    });
  }

  crearReservaClase() {
    const reserva = {
      usuario_id: 1, // deberías obtener el ID de sesión o login
      clase_id: 1,
      tipo_reserva: 'clase',
      horario_reserva: new Date().toISOString()
    };

    this.reservaService.crearReserva(reserva).subscribe(() => {
      this.cargarReservas();
    });
  }
}
