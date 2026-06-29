# Seguimiento de Bolsines - NestJS + Angular + PostgreSQL + Docker

![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL 16](https://img.shields.io/badge/PostgreSQL%2016-336791?style=for-the-badge&logo=postgresql&logoColor=white)

Este proyecto es una solución web integral diseñada para la gestión y monitoreo en tiempo real del traslado de bolsines de correspondencia entre diferentes Comisiones Médicas (CM)
---

## Caso de Uso 36: Consultar Seguimiento de Bolsines

La aplicación simula y resuelve el flujo de control para el seguimiento de bolsines en tránsito (estado *Enviado*):

* **Identificación de Sesión Activa**: Resuelve el usuario y la Comisión Médica origen desde la sesión activa en la base de datos.
* **Simulación de Dispositivos GPS (Trackers)**: Procesa de forma dinámica la localización de los bolsines consumiendo endpoints de tres modelos de rastreadores diferentes:
  * **Model XTR-4500L**: Llama a `getBolsinLocation()`, que requiere una API Key y devuelve un JSON en formato cadena de caracteres.
  * **Model NavTrack QX-7A**: Llama a `retrieveTrackingData()`, que retorna un String con valores separados por comas (CSV).
  * **Model GeoPulse MTR-900**: Llama a `fetchCargoPositions()`, que retorna una estructura matricial (array bidimensional).
* **Monitoreo en Tiempo Real**: Dibuja sobre un plano interactivo (HTML Canvas) la posición en tiempo real de los bolsines en tránsito con efectos de radar y colisiones inteligentes de etiquetas.
* **Caso de Uso 31 - Notificar Ubicación**: Permite al Encargado de Bolsines enviar alertas por correo electrónico directamente al Gerente de la Comisión Médica (GCM) de destino informando la ubicación del precinto seleccionado.

---

## Requisitos Previos

* Docker y Docker Compose instalados en el sistema.
* Un cliente de base de datos relacional (como DBeaver, pgAdmin o HeidiSQL) de forma opcional para interactuar con los datos locales.

---

## Configuración del Entorno (.env)

El archivo `.env` en la raíz del proyecto define el nombre del stack en compose y las credenciales de conexión para la base de datos PostgreSQL y la aplicación NestJS.

```ini
COMPOSE_PROJECT_NAME=tpi-dsi
DATABASE_ENGINE=postgres
POSTGRES_HOST=db
POSTGRES_PORT=5432
POSTGRES_DB=postgres
POSTGRES_USER=postgres
PGUSER=postgres
POSTGRES_PASSWORD=postgres
LANG=es_AR.utf8
POSTGRES_INITDB_ARGS="--locale-provider=icu --icu-locale=es-AR --auth-local=trust"
POSTGRES_HOST_AUTH_METHOD=scram-sha-256
PORT=8000
```

---

## Instrucciones de Despliegue Rápido

Sigue estos pasos en tu terminal para compilar e iniciar todo el entorno de servicios.

### Iniciar Contenedores y Servicios

Este comando descarga, construye e inicializa el contenedor de la base de datos, el backend en NestJS y el frontend de Angular en modo desarrollo (con recarga en caliente y compilación instantánea al modificar el código).

```bash
docker compose up -d
```

### Cargar Datos Iniciales (Seeding)

Una vez que el contenedor de PostgreSQL esté disponible y TypeORM haya creado automáticamente el esquema de tablas en la base de datos, carga las fixtures preconfiguradas (roles, comisiones médicas, empleados, usuarios, sesiones activas y bolsines de prueba desde `initial_data.json`):

```bash
docker compose run --rm seed
```

---

## Acceso y Verificación

Una vez que el despliegue esté completado con éxito, los puertos locales expuestos son:

* **Frontend (Angular)**: [http://localhost:4200](http://localhost:4200) (interfaz interactiva del mapa de radar).
* **Backend API (NestJS)**: [http://localhost:8000/api](http://localhost:8000/api) (ruta raíz del backend).
* **Prueba de Datos Rápida**: [http://localhost:8000/bolsines-test](http://localhost:8000/bolsines-test) (endpoint rápido del controlador raíz para verificar el estado de los bolsines cargados).
* **Base de Datos PostgreSQL (Host local)**:
  * **Host**: `localhost` o `127.0.0.1`
  * **Puerto**: `5432`
  * **Usuario**: `postgres`
  * **Contraseña**: `postgres`
  * **Base de Datos**: `postgres`

---

## Comandos Útiles de Docker Compose

* **Ver logs en tiempo real (todos los servicios)**:

  ```bash
  docker compose logs -f
  ```

* **Ver logs de un servicio específico (ej: backend)**:

  ```bash
  docker compose logs -f backend
  ```

* **Detener los servicios sin borrar datos**:

  ```bash
  docker compose stop
  ```

* **Detener y eliminar contenedores y redes virtuales**:

  ```bash
  docker compose down
  ```

* **Limpieza profunda (eliminar contenedores, redes y volúmenes de base de datos)**:

  ```bash
  docker compose down -v
  ```

* **Reiniciar el servidor backend (fuerza la recompilación)**:

  ```bash
  docker compose restart backend
  ```

---

## Arquitectura del Proyecto

El código fuente del proyecto se divide de la siguiente manera:

```
tpi-dsi/
├── frontend/                     # Aplicación del usuario (Angular 22)
│   ├── src/
│   │   ├── main.ts               # Archivo de inicio del frontend
│   │   └── app/
│   │       ├── app.ts            # Componente principal
│   │       ├── app.routes.ts     # Definición de las rutas de navegación
│   │       ├── models.ts         # Modelos e interfaces de datos compartidos
│   │       ├── services/
│   │       │   └── api.service.ts # Servicio de comunicación con el backend
│   │       └── views/
│   │           ├── seguimiento.html # Diseño de la pantalla de seguimiento
│   │           └── seguimiento.ts   # Control del plano y mapa interactivo
│   └── Dockerfile                # Configuración de despliegue en contenedores
│
├── src/                          # Servidor de la aplicación (NestJS)
│   ├── main.ts                   # Archivo de inicio del servidor
│   ├── app.module.ts             # Módulo principal del servidor
│   ├── app.controller.ts         # Controlador principal de prueba
│   ├── seed.ts                   # Carga de datos de prueba en la base de datos
│   └── bolsin/                   # Módulo específico de la lógica de bolsines
│       ├── bolsin.module.ts      # Configuración del módulo y sus dependencias
│       ├── controllers/
│       │   ├── bolsines.controller.ts  # Rutas básicas para la consulta de bolsines
│       │   └── seguimiento.controller.ts # Rutas de seguimiento y simulación de GPS
│       ├── entities/             # Clases que representan las tablas de la base de datos
│       │   ├── bolsin.entity.ts
│       │   ├── cambio-estado-bolsin.entity.ts
│       │   ├── cm.entity.ts
│       │   ├── empleado.entity.ts
│       │   ├── estado-bolsin.entity.ts
│       │   ├── rol.entity.ts
│       │   ├── sesion.entity.ts
│       │   └── usuario.entity.ts
│       └── fixtures/
│           └── initial_data.json # Archivo con la información inicial de prueba
│
├── Dockerfile                    # Configuración de despliegue del servidor
├── docker-compose.yml            # Coordinación de los contenedores
└── .env                          # Variables de configuración del entorno
```
