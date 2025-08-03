const properties = [
  { id: 1, name: 'Casa en la playa', location: 'Cartagena', price: 150, rating: 4.8 },
  { id: 2, name: 'Apartamento en la ciudad', location: 'Bogotá', price: 100, rating: 4.5 },
];

const getAllProperties = (req, res) => {
  res.json({
    success: true,
    data: properties
  });
};

const getPropertyById = (req, res) => {
  const { id } = req.params;
  const property = properties.find(p => p.id === parseInt(id));
  
  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }
  
  res.json({
    success: true,
    data: property
  });
};

const createProperty = (req, res) => {
  const { name, location, price, rating } = req.body;
  
  // Validación básica
  if (!name || !location || !price) {
    return res.status(400).json({
      success: false,
      message: 'Name, location and price are required'
    });
  }
  
  const newProperty = {
    id: properties.length + 1,
    name,
    location,
    price,
    rating: rating || 0
  };
  
  properties.push(newProperty);
  
  res.status(201).json({
    success: true,
    data: newProperty
  });
};

const updateProperty = (req, res) => {
  const { id } = req.params;
  const propertyIndex = properties.findIndex(p => p.id === parseInt(id));
  
  if (propertyIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }
  
  const updatedProperty = {
    ...properties[propertyIndex],
    ...req.body
  };
  
  properties[propertyIndex] = updatedProperty;
  
  res.json({
    success: true,
    data: updatedProperty
  });
};

const deleteProperty = (req, res) => {
  const { id } = req.params;
  const propertyIndex = properties.findIndex(p => p.id === parseInt(id));
  
  if (propertyIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }
  
  properties.splice(propertyIndex, 1);
  
  res.json({
    success: true,
    message: 'Property deleted successfully'
  });
};

module.exports = {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty
};
