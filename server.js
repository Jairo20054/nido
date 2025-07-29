const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Datos de ejemplo
const properties = [
  { id: 1, name: 'Casa en la playa', location: 'Cartagena' },
  { id: 2, name: 'Apartamento en la ciudad', location: 'Bogotá' },
];

// Ruta para obtener propiedades
app.get('/api/properties', (req, res) => {
  res.json(properties);
});

app.listen(port, () => {
  console.log(`Servidor backend escuchando en http://localhost:${port}`);
});
