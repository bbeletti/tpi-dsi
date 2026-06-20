# Despliegue de Aplicación NestJS con Docker y PostgreSQL

![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL 18](https://img.shields.io/badge/PostgreSQL%2018-336791?style=for-the-badge&logo=postgresql&logoColor=white)

Este proyecto es una migración y modernización del tutorial de Django a un entorno profesional utilizando **NestJS**, **TypeORM** y **Docker Compose**. Permite levantar un entorno de desarrollo portable y listo para producción de manera rápida.

---

## Requisitos Previos

- **Docker** y **Docker Compose** instalados en tu sistema. Puedes consultar la [documentación oficial de Docker](https://docs.docker.com/get-docker/) para la instalación.
- Un cliente de base de datos opcional (como DBeaver o HeidiSQL) si deseas interactuar con los datos.

---

## 1. Configuración del Entorno (.env)

El archivo `.env` en la raíz del proyecto contiene las credenciales de conexión para el contenedor de base de datos y la aplicación NestJS.

```ini
DATABASE_ENGINE=postgres
POSTGRES_HOST=db
POSTGRES_PORT=5432
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
PORT=8000
```

---

## 2. Instrucciones de Despliegue Rápido

Sigue estos pasos en tu terminal para levantar el proyecto por primera vez.

### Paso 1: Iniciar los Servicios
Este comando descarga e inicializa la base de datos PostgreSQL, y compila tanto el backend en NestJS como el frontend en Angular en modo desarrollo con recarga en caliente (watch).

```sh
docker compose up -d
```

### Paso 2: Cargar Datos Iniciales (Seeding)
Una vez que el contenedor de base de datos esté listo y NestJS haya creado las tablas automáticamente mediante TypeORM, ejecuta el script de seeding para cargar las unidades, ingredientes, productos y recetas de prueba (`initial_data.json`):

```sh
docker compose run --rm seed
```

---

## 3. Acceso y Verificación

Una vez completado el despliegue:

- **Aplicación NestJS**: Accede a [http://localhost:8000](http://localhost:8000).
- **Prueba de Datos**: Accede al endpoint de verificación [http://localhost:8000/pastas-test](http://localhost:8000/pastas-test) para ver el listado de pastas con su precio calculado dinámicamente según sus recetas.
- **Acceso a PostgreSQL (Host)**: 
  Puedes conectarte a la base de datos desde tu cliente preferido utilizando:
  - **Host**: `localhost` o `127.0.0.1`
  - **Puerto**: `5432`
  - **Usuario**: `postgres`
  - **Contraseña**: `postgres`
  - **Base de Datos**: `postgres`

---

## 4. Comandos Útiles de Docker

- **Ver logs en tiempo real**:
  ```sh
  docker compose logs -f
  ```
- **Detener los servicios sin borrar datos**:
  ```sh
  docker compose stop
  ```
- **Detener y eliminar contenedores**:
  ```sh
  docker compose down
  ```
- **Detener y eliminar contenedores limpiando volúmenes (borra base de datos)**:
  ```sh
  docker compose down -v
  ```
- **Reiniciar el servidor backend (fuerza compilación en watch mode)**:
  ```sh
  docker compose restart backend
  ```

---

## 5. Arquitectura del Proyecto

El proyecto está estructurado con las mejores prácticas de NestJS:
- **`src/pastas/entities/`**: Contiene la definición de los modelos (Provincia, Cliente, Producto, Receta, etc.) decorados con TypeORM.
- **`src/seed.ts`**: Script autónomo de carga de datos iniciales.
- **`src/app.controller.ts`**: Controlador principal donde se expone la ruta `/pastas-test`.
