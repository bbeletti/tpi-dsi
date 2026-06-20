import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ingrediente, Producto, Cliente, Venta, Barrio, Localidad, Provincia, UnidadMedida } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  // Ingredientes
  getIngredientes(): Observable<Ingrediente[]> {
    return this.http.get<Ingrediente[]>(`${this.apiUrl}/ingredientes`);
  }

  getIngrediente(id: number): Observable<Ingrediente> {
    return this.http.get<Ingrediente>(`${this.apiUrl}/ingredientes/${id}`);
  }

  createIngrediente(data: Partial<Ingrediente>): Observable<Ingrediente> {
    return this.http.post<Ingrediente>(`${this.apiUrl}/ingredientes`, data);
  }

  updateIngrediente(id: number, data: Partial<Ingrediente>): Observable<Ingrediente> {
    return this.http.put<Ingrediente>(`${this.apiUrl}/ingredientes/${id}`, data);
  }

  deleteIngrediente(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/ingredientes/${id}`);
  }

  // Productos
  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/productos`);
  }

  getProducto(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/productos/${id}`);
  }

  createProducto(data: Partial<Producto>): Observable<Producto> {
    return this.http.post<Producto>(`${this.apiUrl}/productos`, data);
  }

  updateProducto(id: number, data: Partial<Producto>): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/productos/${id}`, data);
  }

  deleteProducto(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/productos/${id}`);
  }

  // Clientes
  getClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.apiUrl}/clientes`);
  }

  getCliente(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/clientes/${id}`);
  }

  createCliente(data: Partial<Cliente>): Observable<Cliente> {
    return this.http.post<Cliente>(`${this.apiUrl}/clientes`, data);
  }

  updateCliente(id: number, data: Partial<Cliente>): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.apiUrl}/clientes/${id}`, data);
  }

  deleteCliente(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/clientes/${id}`);
  }

  // Ventas
  getVentas(): Observable<Venta[]> {
    return this.http.get<Venta[]>(`${this.apiUrl}/ventas`);
  }

  getVenta(id: number): Observable<Venta> {
    return this.http.get<Venta>(`${this.apiUrl}/ventas/${id}`);
  }

  createVenta(data: { fecha: string; cliente_id: number; detalle: { producto_id: number; cantidad: number; }[] }): Observable<Venta> {
    return this.http.post<Venta>(`${this.apiUrl}/ventas`, data);
  }

  deleteVenta(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/ventas/${id}`);
  }

  // Auxiliares
  getBarrios(): Observable<Barrio[]> {
    return this.http.get<Barrio[]>(`${this.apiUrl}/barrios`);
  }

  getLocalidades(): Observable<Localidad[]> {
    return this.http.get<Localidad[]>(`${this.apiUrl}/localidades`);
  }

  getProvincias(): Observable<Provincia[]> {
    return this.http.get<Provincia[]>(`${this.apiUrl}/provincias`);
  }

  getUnidadesMedida(): Observable<UnidadMedida[]> {
    return this.http.get<UnidadMedida[]>(`${this.apiUrl}/unidades-medida`);
  }
}
