const bookings = [
  { id: 1, userId: 1, propertyId: 1, startDate: '2023-06-01', endDate: '2023-06-05', guests: 2, totalPrice: 600 },
  { id: 2, userId: 2, propertyId: 2, startDate: '2023-07-10', endDate: '2023-07-15', guests: 4, totalPrice: 500 },
];

const getAllBookings = (req, res) => {
  res.json({
    success: true,
    data: bookings
  });
};

const getBookingById = (req, res) => {
  const { id } = req.params;
  const booking = bookings.find(b => b.id === parseInt(id));
  
  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }
  
  res.json({
    success: true,
    data: booking
  });
};

const getBookingsByUserId = (req, res) => {
  const { userId } = req.params;
  const userBookings = bookings.filter(b => b.userId === parseInt(userId));
  
  res.json({
    success: true,
    data: userBookings
  });
};

const createBooking = (req, res) => {
  const { userId, propertyId, startDate, endDate, guests } = req.body;
  
  // Validación básica
  if (!userId || !propertyId || !startDate || !endDate || !guests) {
    return res.status(400).json({
      success: false,
      message: 'userId, propertyId, startDate, endDate, and guests are required'
    });
  }
  
  // Verificar que las fechas sean válidas
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
    return res.status(400).json({
      success: false,
      message: 'Invalid date range'
    });
  }
  
  const newBooking = {
    id: bookings.length + 1,
    userId,
    propertyId,
    startDate,
    endDate,
    guests,
    totalPrice: 0 // En una implementación real, se calcularía basado en el precio de la propiedad
  };
  
  bookings.push(newBooking);
  
  res.status(201).json({
    success: true,
    data: newBooking
  });
};

const updateBooking = (req, res) => {
  const { id } = req.params;
  const bookingIndex = bookings.findIndex(b => b.id === parseInt(id));
  
  if (bookingIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }
  
  const updatedBooking = {
    ...bookings[bookingIndex],
    ...req.body
  };
  
  bookings[bookingIndex] = updatedBooking;
  
  res.json({
    success: true,
    data: updatedBooking
  });
};

const deleteBooking = (req, res) => {
  const { id } = req.params;
  const bookingIndex = bookings.findIndex(b => b.id === parseInt(id));
  
  if (bookingIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }
  
  bookings.splice(bookingIndex, 1);
  
  res.json({
    success: true,
    message: 'Booking deleted successfully'
  });
};

module.exports = {
  getAllBookings,
  getBookingById,
  getBookingsByUserId,
  createBooking,
  updateBooking,
  deleteBooking
};
