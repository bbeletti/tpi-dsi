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
    console.log('Iniciando el proceso de carga de datos iniciales...');
    try {
        const fixturePath = path.join(__dirname, 'pastas', 'fixtures', 'initial_data.json');
        if (!fs.existsSync(fixturePath)) {
            throw new Error(`No se encontró el archivo de fixtures en: ${fixturePath}`);
        }
        const data = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
        const findRecords = (modelName) => data.filter((item) => item.model === modelName);
        const queryRunner = dataSource.createQueryRunner();
        await queryRunner.connect();
        console.log('Limpiando tablas existentes...');
        await queryRunner.query('TRUNCATE TABLE pastas_receta RESTART IDENTITY CASCADE;');
        await queryRunner.query('TRUNCATE TABLE pastas_producto RESTART IDENTITY CASCADE;');
        await queryRunner.query('TRUNCATE TABLE pastas_ingrediente RESTART IDENTITY CASCADE;');
        await queryRunner.query('TRUNCATE TABLE pastas_barrio RESTART IDENTITY CASCADE;');
        await queryRunner.query('TRUNCATE TABLE pastas_unidadmedida RESTART IDENTITY CASCADE;');
        await queryRunner.startTransaction();
        try {
            const unidades = findRecords('pastas.unidadmedida');
            for (const item of unidades) {
                await queryRunner.manager.insert('pastas_unidadmedida', {
                    id: item.pk,
                    nombre: item.fields.nombre,
                });
            }
            console.log(`Se cargaron ${unidades.length} registros en UnidadMedida.`);
            const barrios = findRecords('pastas.barrio');
            for (const item of barrios) {
                await queryRunner.manager.insert('pastas_barrio', {
                    id: item.pk,
                    nombre: item.fields.nombre,
                });
            }
            console.log(`Se cargaron ${barrios.length} registros en Barrio.`);
            const ingredientes = findRecords('pastas.ingrediente');
            for (const item of ingredientes) {
                await queryRunner.manager.insert('pastas_ingrediente', {
                    id: item.pk,
                    nombre: item.fields.nombre,
                    costo: parseFloat(item.fields.costo),
                    unidad_medida: { id: item.fields.unidad_medida },
                });
            }
            console.log(`Se cargaron ${ingredientes.length} registros en Ingrediente.`);
            const productos = findRecords('pastas.producto');
            for (const item of productos) {
                await queryRunner.manager.insert('pastas_producto', {
                    id: item.pk,
                    nombre: item.fields.nombre,
                    ganancia: parseFloat(item.fields.ganancia),
                    es_relleno: item.fields.es_relleno,
                });
            }
            console.log(`Se cargaron ${productos.length} registros en Producto.`);
            const recetas = findRecords('pastas.receta');
            for (const item of recetas) {
                await queryRunner.manager.insert('pastas_receta', {
                    id: item.pk,
                    cantidad: parseFloat(item.fields.cantidad),
                    ingrediente: { id: item.fields.ingrediente },
                    producto: { id: item.fields.producto },
                });
            }
            console.log(`Se cargaron ${recetas.length} registros en Receta.`);
            await queryRunner.commitTransaction();
            console.log('¡Carga de datos iniciales completada exitosamente!');
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
        console.error('El seeding falló:', error);
    }
    finally {
        await app.close();
    }
}
bootstrap();
//# sourceMappingURL=seed.js.map