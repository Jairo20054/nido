class Property {
  constructor(id, name, location, price, rating, description, amenities, images) {
    this.id = id;
    this.name = name;
    this.location = location;
    this.price = price;
    this.rating = rating;
    this.description = description;
    this.amenities = amenities;
    this.images = images;
  }

  // Método para obtener la representación JSON del objeto
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      location: this.location,
      price: this.price,
      rating: this.rating,
      description: this.description,
      amenities: this.amenities,
      images: this.images
    };
  }

  // Método para crear una instancia de Property desde un objeto JSON
  static fromJSON(json) {
    return new Property(
      json.id,
      json.name,
      json.location,
      json.price,
      json.rating,
      json.description,
      json.amenities,
      json.images
    );
  }
}

module.exports = Property;
