/**
 * Format currency amount in COP (Colombian Peso)
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Calculate number of nights between two dates
 */
export const calculateNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Format date string into local date format
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Check if a date is in the past
 */
export const isPastDate = (date) => {
  return new Date(date) < new Date();
};

/**
 * Get total price including fees
 */
export const calculateTotalPrice = ({
  basePrice,
  nights,
  cleaningFee = 0,
  serviceFee = 0,
  additionalGuests = 0,
  guestFee = 0
}) => {
  const subtotal = basePrice * nights;
  const guestCharges = additionalGuests * guestFee * nights;
  return subtotal + cleaningFee + serviceFee + guestCharges;
};

/**
 * Generate an array of dates between start and end dates
 */
export const getDatesBetween = (startDate, endDate) => {
  const dates = [];
  let currentDate = new Date(startDate);
  const end = new Date(endDate);

  while (currentDate <= end) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

/**
 * Check if two date ranges overlap
 */
export const dateRangesOverlap = (
  start1, 
  end1, 
  start2, 
  end2
) => {
  return (
    (new Date(start1) >= new Date(start2) && new Date(start1) <= new Date(end2)) ||
    (new Date(end1) >= new Date(start2) && new Date(end1) <= new Date(end2)) ||
    (new Date(start1) <= new Date(start2) && new Date(end1) >= new Date(end2))
  );
};

/**
 * Format duration string (e.g., "2 noches")
 */
export const formatDuration = (nights) => {
  return `${nights} ${nights === 1 ? 'noche' : 'noches'}`;
};

/**
 * Format date range (e.g., "15-20 jun")
 */
export const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return '';

  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const startDay = start.getDate();
  const endDay = end.getDate();
  const month = start.toLocaleDateString('es-CO', { month: 'short' });

  return `${startDay}-${endDay} ${month}`;
};
