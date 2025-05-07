import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private API_URL = 'http://127.0.0.1:8000/api/';

  constructor(private http: HttpClient) {}

  getClases(): Observable<any> {
    return this.http.get(`${this.API_URL}clases`);
  }

  getEspacios(): Observable<any> {
    return this.http.get(`${this.API_URL}espacios`);
  }

  crearReserva(data: any): Observable<any> {
    return this.http.post(`${this.API_URL}reservas`, data);
  }

  getReservas(): Observable<any> {
    return this.http.get(`${this.API_URL}reservas`);
  }
}
