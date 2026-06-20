"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const typeorm_1 = require("typeorm");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const dataSource = app.get(typeorm_1.DataSource);
    console.log('Iniciando el proceso de carga de datos iniciales desde JSON...');
    try {
        const fixturePath = path.join(__dirname, 'bolsin', 'fixtures', 'initial_data.json');
        if (!fs.existsSync(fixturePath)) {
            throw new Error(`No se encontró el archivo de fixtures en: ${fixturePath}`);
        }
        const data = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
        const findRecords = (modelName) => data.filter((item) => item.model === modelName);
        const queryRunner = dataSource.createQueryRunner();
        await queryRunner.connect();
        console.log('Limpiando tablas existentes...');
        await queryRunner.query('TRUNCATE TABLE cambio_estado_bolsin RESTART IDENTITY CASCADE;');
        await queryRunner.query('TRUNCATE TABLE bolsin RESTART IDENTITY CASCADE;');
        await queryRunner.query('TRUNCATE TABLE sesion RESTART IDENTITY CASCADE;');
        await queryRunner.query('TRUNCATE TABLE usuario RESTART IDENTITY CASCADE;');
        await queryRunner.query('TRUNCATE TABLE empleado RESTART IDENTITY CASCADE;');
        await queryRunner.query('TRUNCATE TABLE rol RESTART IDENTITY CASCADE;');
        await queryRunner.query('TRUNCATE TABLE cm RESTART IDENTITY CASCADE;');
        await queryRunner.query('TRUNCATE TABLE estado_bolsin RESTART IDENTITY CASCADE;');
        await queryRunner.startTransaction();
        try {
            const estados = findRecords('bolsin.estado_bolsin');
            for (const item of estados) {
                await queryRunner.manager.insert('estado_bolsin', {
                    id: item.pk,
                    nombre: item.fields.nombre,
                    descripcion: item.fields.descripcion,
                });
            }
            console.log(`Se cargaron ${estados.length} registros en EstadoBolsin.`);
            const cms = findRecords('bolsin.cm');
            for (const item of cms) {
                await queryRunner.manager.insert('cm', {
                    id: item.pk,
                    codigo: item.fields.codigo,
                    nombre: item.fields.nombre,
                    direccion: item.fields.direccion,
                    email: item.fields.email,
                    telefono: item.fields.telefono,
                });
            }
            console.log(`Se cargaron ${cms.length} registros en CM.`);
            const roles = findRecords('bolsin.rol');
            for (const item of roles) {
                await queryRunner.manager.insert('rol', {
                    id: item.pk,
                    nombre: item.fields.nombre,
                });
            }
            console.log(`Se cargaron ${roles.length} registros en Rol.`);
            const empleados = findRecords('bolsin.empleado');
            for (const item of empleados) {
                await queryRunner.manager.insert('empleado', {
                    id: item.pk,
                    nombre: item.fields.nombre,
                    apellido: item.fields.apellido,
                    email: item.fields.email,
                    legajo: item.fields.legajo,
                    rol: { id: item.fields.rol },
                    cm: { id: item.fields.cm },
                });
            }
            console.log(`Se cargaron ${empleados.length} registros en Empleado.`);
            const usuarios = findRecords('bolsin.usuario');
            for (const item of usuarios) {
                await queryRunner.manager.insert('usuario', {
                    id: item.pk,
                    usuarioActivo: item.fields.usuario_activo,
                    empleadoActivo: item.fields.empleado_activo,
                    empleado: { id: item.fields.empleado },
                });
            }
            console.log(`Se cargaron ${usuarios.length} registros en Usuario.`);
            const sesiones = findRecords('bolsin.sesion');
            for (const item of sesiones) {
                await queryRunner.manager.insert('sesion', {
                    id: item.pk,
                    fechaHoraIngreso: new Date(item.fields.fecha_hora_ingreso),
                    fechaHoraEgreso: item.fields.fecha_hora_egreso ? new Date(item.fields.fecha_hora_egreso) : null,
                    usuario: { id: item.fields.usuario },
                });
            }
            console.log(`Se cargaron ${sesiones.length} registros en Sesion.`);
            const bolsines = findRecords('bolsin.bolsin');
            for (const item of bolsines) {
                await queryRunner.manager.insert('bolsin', {
                    id: item.pk,
                    fechaCreacion: new Date(item.fields.fecha_creacion),
                    numeroBolsin: item.fields.numero_bolsin,
                    numeroPrecinto: item.fields.numero_precinto,
                    peso: parseFloat(item.fields.peso),
                    origen: { id: item.fields.origen },
                    destino: { id: item.fields.destino },
                });
            }
            console.log(`Se cargaron ${bolsines.length} registros en Bolsin.`);
            const cambios = findRecords('bolsin.cambio_estado_bolsin');
            for (const item of cambios) {
                await queryRunner.manager.insert('cambio_estado_bolsin', {
                    id: item.pk,
                    fechaHoraInicio: new Date(item.fields.fecha_hora_inicio),
                    fechaHoraFin: item.fields.fecha_hora_fin ? new Date(item.fields.fecha_hora_fin) : null,
                    UsLog: item.fields.us_log,
                    estadoBolsin: { id: item.fields.estado },
                    bolsin: { id: item.fields.bolsin },
                });
            }
            console.log(`Se cargaron ${cambios.length} registros en CambioEstadoBolsin.`);
            await queryRunner.commitTransaction();
            console.log('¡Carga de datos iniciales del dominio Bolsín completada con éxito!');
        }
        catch (err) {
            console.error('Error durante la transacción, revirtiendo cambios...', err);
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    catch (error) {
        console.error('El seeding de Bolsín falló:', error);
    }
    finally {
        await app.close();
    }
}
bootstrap();
//# sourceMappingURL=seed.js.map