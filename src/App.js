function saludar (nombre) {
    return "hola ${nombre}";
}

console.log(saludar("Jairo"));

const {nombre : Jairo, sexo = "masculino"} = persona;
console.log(persona)



function sumar (a, b) {return a + b}
module.exports = sumar;

function resta (a , b) { return a - b}
module.exports = resta;

function multiplicacion ( a , b) { return a * b}
module.exports = multiplicacion;