import React, { useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import SelectPet from './SelectPet';
import SelectService from './SelectService';
import SelectDateTime from './SelectDateTime';
import BookingConfirm from './BookingConfirm'; 
import { BookingContext } from '../../Components/context/BookingContext';

const Book = () => {
  const { selectedPet } = useContext(BookingContext);
  return (
    <Routes>
      <Route path="/select-pet" element={<SelectPet />} />
      <Route path="/select-service" element={<SelectService />} />
      <Route path="/select-datetime" element={<SelectDateTime />} />
      <Route path="/booking-confirm" element={<BookingConfirm />} />
    </Routes>
  );
};

export default Book;
 