class Booking {
  constructor(id, userId, propertyId, startDate, endDate, guests, totalPrice) {
    this.id = id;
    this.userId = userId;
    this.propertyId = propertyId;
    this.startDate = startDate;
    this.endDate = endDate;
    this.guests = guests;
    this.totalPrice = totalPrice;
  }

  // Método para obtener la representación JSON del objeto
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      propertyId: this.propertyId,
      startDate: this.startDate,
      endDate: this.endDate,
      guests: this.guests,
      totalPrice: this.totalPrice
    };
  }

  // Método para crear una instancia de Booking desde un objeto JSON
  static fromJSON(json) {
    return new Booking(
      json.id,
      json.userId,
      json.propertyId,
      json.startDate,
      json.endDate,
      json.guests,
      json.totalPrice
    );
  }
}

module.exports = Booking;
