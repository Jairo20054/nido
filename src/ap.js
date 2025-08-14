const sumar = require('./sumar');
console.log(sumar(5, 10));

const resta = require('./resta');
console.log(resta(10, 5));

const multiplicacion = require('./multiplicacion')
console.log(multiplicacion(5, 10));

console.log(process.argv[2])

const os = require('os')
console.log(os.homedir());node 
console.log(os.platform());
console.log(os.arch());
console.log(os.type());  // devuelve el nombre del sistema operativo
console.log(os.cpus());

