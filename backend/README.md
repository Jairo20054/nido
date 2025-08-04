# Nido Backend API

API RESTful para la aplicación de alquiler de viviendas Nido.

## Descripción

Este es el backend de la aplicación Nido, construido con Node.js, Express y MongoDB. Proporciona endpoints para gestionar usuarios, propiedades y reservas.

## Características

- Autenticación JWT
- CRUD de usuarios, propiedades y reservas
- Validación de datos
- Manejo de errores
- Logging de solicitudes
- Paginación de resultados

## Tecnologías

- Node.js
- Express.js
- MongoDB con Mongoose
- JWT para autenticación
- Bcrypt para encriptación de contraseñas

## Requisitos

- Node.js >= 14.x
- MongoDB >= 4.x

## Instalación

1. Clonar el repositorio:
```bash
git clone <repositorio-url>
cd nido-backend
```

2. Instalar dependencias:
```bash
npm install
```

3. Crear archivo `.env` basado en `.env.example`:
```bash
cp .env.example .env
```

4. Configurar las variables de entorno en `.env`

## Uso

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

## Estructura del Proyecto

```
backend/
├── config/          # Configuración de la aplicación
├── controllers/      # Controladores de las rutas
├── middleware/       # Middleware personalizado
├── models/          # Modelos de la base de datos
├── routes/          # Definición de rutas
├── utils/           # Funciones auxiliares
├── server.js        # Punto de entrada de la aplicación
├── .env.example     # Ejemplo de variables de entorno
├── .gitignore       # Archivos ignorados por git
├── package.json     # Dependencias y scripts
└── README.md        # Documentación
```

## Endpoints de la API

### Usuarios
- `POST /api/users` - Crear usuario
- `POST /api/users/login` - Iniciar sesión
- `GET /api/users/profile` - Obtener perfil del usuario (requiere autenticación)
- `GET /api/users/:id` - Obtener usuario por ID
- `PUT /api/users/:id` - Actualizar usuario (requiere autenticación)
- `DELETE /api/users/:id` - Eliminar usuario (requiere autenticación)

### Propiedades
- `GET /api/properties` - Obtener todas las propiedades
- `GET /api/properties/:id` - Obtener propiedad por ID
- `POST /api/properties` - Crear propiedad (requiere autenticación)
- `PUT /api/properties/:id` - Actualizar propiedad (requiere autenticación)
- `DELETE /api/properties/:id` - Eliminar propiedad (requiere autenticación)

### Reservas
- `GET /api/bookings` - Obtener todas las reservas (requiere autenticación)
- `GET /api/bookings/:id` - Obtener reserva por ID (requiere autenticación)
- `GET /api/bookings/user/:userId` - Obtener reservas por usuario (requiere autenticación)
- `POST /api/bookings` - Crear reserva (requiere autenticación)
- `PUT /api/bookings/:id` - Actualizar reserva (requiere autenticación)
- `DELETE /api/bookings/:id` - Cancelar reserva (requiere autenticación)

## Autenticación

La mayoría de los endpoints requieren autenticación mediante JWT. Para autenticarse:

1. Iniciar sesión con `POST /api/users/login`
2. Usar el token devuelto en el encabezado `Authorization: Bearer <token>`

## Variables de Entorno

Consultar `.env.example` para ver las variables de entorno requeridas.

## Contribuir

1. Crear una rama para la nueva funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
2. Hacer commit de los cambios (`git commit -am 'Agregar nueva funcionalidad'`)
3. Hacer push a la rama (`git push origin feature/nueva-funcionalidad`)
4. Crear un nuevo Pull Request

## Licencia

MIT
