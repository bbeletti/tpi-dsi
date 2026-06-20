import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Bolsin, CM, Empleado, Usuario, Sesion, EstadoBolsin, Rol, SeguimientoResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  // Bolsines
  getBolsines(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/bolsines`);
  }

  // CMs
  getCMs(): Observable<CM[]> {
    return this.http.get<CM[]>(`${this.apiUrl}/cms`);
  }

  // Empleados
  getEmpleados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/empleados`);
  }

  // Usuarios
  getUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuarios`);
  }

  // Sesiones
  getSesiones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sesiones`);
  }

  // Estados
  getEstados(): Observable<EstadoBolsin[]> {
    return this.http.get<EstadoBolsin[]>(`${this.apiUrl}/estados`);
  }

  // Roles
  getRoles(): Observable<Rol[]> {
    return this.http.get<Rol[]>(`${this.apiUrl}/roles`);
  }

  // Seguimiento
  consultarSeguimiento(): Observable<SeguimientoResponse> {
    return this.http.get<SeguimientoResponse>(`${this.apiUrl}/seguimiento/consultar`);
  }

  notificarUbicacion(payload: {
    numeroBolsin: number;
    latitud: number;
    longitud: number;
    fechaHoraActualizacion: string;
    emailDestino: string;
  }): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/seguimiento/notificar`, payload);
  }
}
