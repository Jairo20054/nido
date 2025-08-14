function saludar (nombre) {
    return "hola ${nombre}";
}

console.log(saludar("Jairo"));

//npm ci — instala exactamente lo que está en package-lock.json. Más rápido y reproducible (ideal para pipelines).
// npm install — resuelve versiones nuevas según rangos permitidos y actualiza package-lock.json.
//npm update — intenta actualizar paquetes según los rangos semánticos en package.json.
//npm audit / npm audit fix — analiza vulnerabilidades y sugiere arreglos.//

for (let i = 0; i <10; i++) {
    console.log(i)
};

// Eventos en Node.js permiten manejar acciones asíncronas. Aquí un ejemplo simple:
const http = require('http');

const server = http.createServer((req, res) => {
    res.end('¡Evento de solicitud HTTP manejado!');
});

server.listen(3000, () => {
    console.log('Servidor escuchando en puerto 3000');
});

//Módulo events

const EventEmitter = require('events');

class MiEmisor extends EventEmitter {}

const emisor = new MiEmisor();

// Registrar un listener
emisor.on('saludo', (nombre) => {
    console.log(`¡Hola, ${nombre}!`);
});

// Emitir el evento
emisor.emit('saludo', 'Estudiante');

// promesas en Node.js permiten manejar operaciones asíncronas de manera más sencilla que callbacks.

const promesa = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve('Operación completada');
    }, 2000);
});

promesa.then((resultado) => {
    console.log(resultado);
});

2. 

function operacionAsincrona(exito) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (exito) {
                resolve('Éxito');
            } else {
                reject(new Error('Fallo'));
            }
        }, 1000);
    });
}

operacionAsincrona(true).then(console.log);  // Salida: 'Éxito'
operacionAsincrona(false).then(console.log).catch(console.error);  // Salida: Error: Fallo

// tercer ejercicio

function 