import React, { createContext, useState } from 'react';

export const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [selectedPet, setSelectedPet] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedDateTime, setSelectedDateTime] = useState(null);
  const [bookingSlots, setBookingSlots] = useState([]);

  const clearBookingData = () => {
    setSelectedPet(null);
    setSelectedServices([]);
    setSelectedDateTime(null);
  };

  
  return (
    <BookingContext.Provider value={{ 
      selectedPet, 
      setSelectedPet, 
      selectedServices, 
      setSelectedServices, 
      selectedDateTime, 
      setSelectedDateTime,
      bookingSlots,
      setBookingSlots,
      clearBookingData,
    }}>
      {children}
    </BookingContext.Provider>
  );
};
