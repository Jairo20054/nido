//Primero - Configuración de Base de Datos y Variables de Entorno:

config.js - Configuración general
db.js - Conexión a MongoDB
.env - Variables de entorno

// Segundo - Modelos de Datos: En la carpeta models tienes: //

User.js
Property.js
Booking.js
Message.js
Payment.js

//Tercero - Middleware: En middleware:

auth.js - Autenticación
errorHandler.js - Manejo de errores
validationMiddleware.js - Validaciones
permissionsMiddleware.js - Control de acceso

//Cuarto - Controladores: En controllers:

authController.js
propertyController.js
bookingController.js
userController.js
paymentController.js
messageController.js

// Quinto - Rutas: En routes:

authRoutes.js
propertyRoutes.js
bookingRoutes.js
userRoutes.js
paymentRoutes.js
messageRoutes.js