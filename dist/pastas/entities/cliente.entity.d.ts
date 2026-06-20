import { BaseNombre } from './base-nombre.entity';
import { Barrio } from './barrio.entity';
import { Localidad } from './localidad.entity';
import { Provincia } from './provincia.entity';
import { User } from './user.entity';
export declare class Cliente extends BaseNombre {
    numero_documento: number;
    direccion: string;
    celular: number;
    telefono: number;
    email: string;
    barrio: Barrio;
    localidad: Localidad;
    provincia: Provincia;
    user: User;
}
