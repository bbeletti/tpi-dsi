import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  console.log('Iniciando el proceso de carga de datos iniciales...');

  try {
    const fixturePath = path.join(__dirname, 'pastas', 'fixtures', 'initial_data.json');
    if (!fs.existsSync(fixturePath)) {
      throw new Error(`No se encontró el archivo de fixtures en: ${fixturePath}`);
    }

    const data = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
    const findRecords = (modelName: string) => data.filter((item: any) => item.model === modelName);

    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();

    // Limpiar tablas para evitar errores de duplicados si se corre varias veces
    console.log('Limpiando tablas existentes...');
    await queryRunner.query('TRUNCATE TABLE pastas_receta RESTART IDENTITY CASCADE;');
    await queryRunner.query('TRUNCATE TABLE pastas_producto RESTART IDENTITY CASCADE;');
    await queryRunner.query('TRUNCATE TABLE pastas_ingrediente RESTART IDENTITY CASCADE;');
    await queryRunner.query('TRUNCATE TABLE pastas_barrio RESTART IDENTITY CASCADE;');
    await queryRunner.query('TRUNCATE TABLE pastas_unidadmedida RESTART IDENTITY CASCADE;');

    await queryRunner.startTransaction();

    try {
      // 1. UnidadMedida
      const unidades = findRecords('pastas.unidadmedida');
      for (const item of unidades) {
        await queryRunner.manager.insert('pastas_unidadmedida', {
          id: item.pk,
          nombre: item.fields.nombre,
        });
      }
      console.log(`Se cargaron ${unidades.length} registros en UnidadMedida.`);

      // 2. Barrio
      const barrios = findRecords('pastas.barrio');
      for (const item of barrios) {
        await queryRunner.manager.insert('pastas_barrio', {
          id: item.pk,
          nombre: item.fields.nombre,
        });
      }
      console.log(`Se cargaron ${barrios.length} registros en Barrio.`);

      // 3. Ingrediente
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

      // 4. Producto
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

      // 5. Receta
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
    } catch (err) {
      console.error('Error durante la transacción, revirtiendo cambios...', err);
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  } catch (error) {
    console.error('El seeding falló:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
