# Nido - Plataforma de Alquiler de Viviendas

Plataforma completa de alquiler de viviendas con frontend en React y backend en Node.js/Express.

## Descripción

Nido es una plataforma de alquiler de viviendas que permite a los usuarios buscar, reservar y gestionar propiedades. Incluye funcionalidades para anfitriones y huéspedes, con un sistema de autenticación seguro y una interfaz intuitiva.

## Características

### Frontend
- Interfaz de usuario moderna y responsive con React
- Navegación intuitiva y experiencia de usuario fluida
- Sistema de búsqueda y filtrado de propiedades
- Gestión de reservas y perfiles de usuario
- Integración con mapas para visualización de ubicaciones

### Backend
- API RESTful con Node.js y Express
- Base de datos MongoDB con Mongoose
- Autenticación JWT segura
- Encriptación de contraseñas con bcrypt
- Validación de datos y manejo de errores
- Logging de solicitudes y respuestas

## Tecnologías

### Frontend
- React 18
- React Router para navegación
- Material-UI y TailwindCSS para estilos
- React Query para gestión de estado asíncrono
- Zustand para gestión de estado global
- Framer Motion para animaciones

### Backend
- Node.js
- Express.js
- MongoDB con Mongoose
- JWT para autenticación
- Bcrypt para encriptación de contraseñas
- Nodemon para desarrollo

## Requisitos

- Node.js >= 14.x
- MongoDB >= 4.x
- npm o yarn

## Instalación

1. Clonar el repositorio:
```bash
git clone <repositorio-url>
cd nido
```

2. Instalar dependencias del frontend:
```bash
npm install
```

3. Instalar dependencias del backend (ya incluidas en package.json):
```bash
# Las dependencias del backend ya están incluidas en el package.json principal
```

4. Crear archivo `.env` basado en `.env.example`:
```bash
cp .env.example .env
```

5. Configurar las variables de entorno en `.env`

## Uso

### Desarrollo

#### Frontend
```bash
npm start
```

#### Backend
```bash
npm run dev:backend
```

### Producción
```bash
npm run build
```

## Estructura del Proyecto

```
nido/
├── config/          # Configuración de la aplicación
├── controllers/      # Controladores de las rutas
├── middleware/       # Middleware personalizado
├── models/          # Modelos de la base de datos
├── public/          # Archivos estáticos del frontend
├── routes/          # Definición de rutas
├── src/             # Código fuente del frontend
│   ├── components/  # Componentes de React
│   ├── pages/       # Páginas de la aplicación
│   ├── context/     # Contextos de React
│   ├── hooks/       # Hooks personalizados
│   ├── services/    # Servicios y llamadas a la API
│   ├── utils/       # Funciones auxiliares
│   └── assets/      # Recursos estáticos
├── utils/           # Funciones auxiliares del backend
├── server.js        # Punto de entrada del backend
├── .env.example     # Ejemplo de variables de entorno
├── .gitignore       # Archivos ignorados por git
├── package.json     # Dependencias y scripts
└── README.md        # Documentación
```

## Contribuir

1. Crear una rama para la nueva funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
2. Hacer commit de los cambios (`git commit -am 'Agregar nueva funcionalidad'`)
3. Hacer push a la rama (`git push origin feature/nueva-funcionalidad`)
4. Crear un nuevo Pull Request

## Licencia

MIT
