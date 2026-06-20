export interface BaseNombre {
  id: number;
  nombre: string;
}

export interface Barrio extends BaseNombre {}
export interface Localidad extends BaseNombre {}
export interface Provincia extends BaseNombre {}
export interface UnidadMedida extends BaseNombre {}

export interface Ingrediente extends BaseNombre {
  costo: number;
  unidad_medida?: UnidadMedida;
}

export interface Receta {
  id?: number;
  cantidad: number;
  ingrediente_id: number;
  ingrediente?: {
    id: number;
    nombre: string;
    costo: number;
    unidad_medida?: string;
  } | null;
}

export interface Producto extends BaseNombre {
  ganancia: number;
  es_relleno: boolean;
  precio: number;
  recetas: Receta[];
}

export interface Cliente extends BaseNombre {
  numero_documento?: number | null;
  direccion?: string | null;
  celular?: number | null;
  telefono?: number | null;
  email?: string | null;
  barrio?: Barrio | null;
  localidad?: Localidad | null;
  provincia?: Provincia | null;
}

export interface DetalleVenta {
  id?: number;
  cantidad: number;
  producto_id: number;
  producto_nombre?: string;
  precio_unitario?: number;
  subtotal?: number;
}

export interface Venta {
  id: number;
  fecha: string;
  cliente?: {
    id: number;
    nombre: string;
  } | null;
  detalle: DetalleVenta[];
  total: number;
}
