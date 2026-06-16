# PlaneAR

> **"Organizá tus eventos de manera simple."**

PlaneAR es una plataforma web SaaS de organización de eventos sociales diseñada para simplificar el proceso de invitación, confirmación de asistencia (RSVP), control de invitados, estadísticas de eventos e integración de pagos online.

---

## Características Principales

1. **Página de Lanzamiento (Landing Page)**: Hero section moderno, beneficios detallados, cómo funciona, testimonios y preguntas frecuentes.
2. **Dashboard de Usuario**: Resumen de estadísticas (eventos creados, próximos eventos, total de invitados, confirmaciones) y listado de eventos activos.
3. **Gestión de Eventos (CRUD)**: Creación, edición, cambio de estado y eliminación de eventos con campos como nombre, descripción, fecha, hora, ubicación, capacidad máxima e imágenes de portada.
4. **Invitación por URL Única**: Enlaces públicos e invitaciones personalizadas generadas de forma automática para compartir con un click en WhatsApp o Telegram.
5. **Confirmación de Asistencia (RSVP)**: Formulario público interactivo para invitados donde confirman asistencia, agregan acompañantes y registran su respuesta.
6. **Gestión de Invitados**: Panel completo para buscar, filtrar y eliminar invitados. Además de la importación masiva de listas de contactos mediante archivos CSV.
7. **Estadísticas Visuales**: Gráficos circulares interactivos con la distribución de confirmaciones (Recharts).
8. **Simulación de Mercado Pago**: Integración de checkout para cobros por entrada simulados que permiten aprobar o cancelar pagos ficticios y registrar transacciones con webhooks preparados.
9. **Panel Administrativo**: Interfaz protegida para administradores para gestionar usuarios, cambiar roles (USER/ADMIN) y activar o desactivar cuentas.

---

## Stack Tecnológico

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend & Actions**: Next.js Server Actions, API routes.
- **Base de Datos**: PostgreSQL (producción) / SQLite (desarrollo local).
- **ORM**: Prisma Client.
- **Autenticación**: Auth.js (NextAuth v5) con proveedores de Google y Credenciales.

---

## Estructura de Carpetas

El proyecto sigue una estructura profesional y escalable:

```text
src/
 ├── app/               # Enrutamiento App Router, páginas, layouts y API Routes
 ├── components/        # Componentes de interfaz compartidos
 ├── actions/           # Server Actions para manejo de lógica backend (Auth, Event, Guest, Payment)
 ├── lib/               # Clientes de servicios (Prisma client singleton, NextAuth configuration)
 ├── prisma/            # Esquema Prisma y script de sembrado (seed)
 └── tests/             # Scripts de pruebas automatizadas (Smoke test suite)
```

---

## Instalación y Configuración Local

Siga estos pasos para iniciar el proyecto en su entorno de desarrollo local:

### 1. Clonar el repositorio e Instalar dependencias
```bash
npm install
```

### 2. Configurar Variables de Entorno
El archivo `.env` ya viene preconfigurado con claves genéricas seguras para desarrollo local. En caso de requerir personalización, configure:
- `AUTH_SECRET`: Secreto criptográfico de NextAuth.
- `NEXT_PUBLIC_APP_URL`: URL del frontend (por defecto `http://localhost:3000`).

### 3. Preparar la Base de Datos
PlaneAR utiliza **SQLite** por defecto para facilitar el desarrollo local sin configuraciones previas de base de datos.
Ejecute el siguiente comando para crear la base de datos local `dev.db` y sincronizar las tablas de Prisma:
```bash
npx prisma db push
```

### 4. Ejecutar el Seed (Datos de Prueba)
Cargue las cuentas de prueba y eventos ficticios para probar el dashboard y flujos de pago:
```bash
npx tsx src/prisma/seed.ts
```

### 5. Iniciar Servidor de Desarrollo
Inicie la aplicación en modo desarrollo local:
```bash
npm run dev
```
Abra [http://localhost:3000](http://localhost:3000) en su navegador para explorar la aplicación.

---

## Cuentas de Prueba Sembradas (Seeded Accounts)

Para iniciar sesión y probar las diferentes vistas, utilice las siguientes credenciales:

### Cuenta Administrador (Admin Panel)
- **Correo**: `admin@planear.app`
- **Contraseña**: `admin123`

### Cuenta Organizador (User Panel)
- **Correo**: `juan@planear.app`
- **Contraseña**: `user123`

---

## Pruebas de Humo (Smoke Tests)

Hemos incluido una suite de pruebas automatizadas para validar que la conexión a la base de datos, el flujo de RSVP, y la creación de pagos funcionen perfectamente con Prisma 7.
Para ejecutar las pruebas de humo locales, ejecute:
```bash
npx tsx src/tests/smoke.test.ts
```

---

## Preparación para Despliegue en Vercel & PostgreSQL

Para desplegar PlaneAR en producción usando Vercel y una base de datos PostgreSQL:

1. **Esquema de Base de Datos**: Cambie el proveedor del datasource en `src/prisma/schema.prisma` a `"postgresql"`:
   ```prisma
   datasource db {
     provider = "postgresql"
   }
   ```
2. **Configuración de Conexión**: En su base de datos PostgreSQL de producción, configure la variable de entorno `DATABASE_URL` y defínala en su archivo `prisma.config.ts`.
3. **Generar Cliente**: Asegúrese de ejecutar `npx prisma generate` en su pipeline de build en Vercel.
