import React, { useState, useEffect } from "react";
import { getDatabase, ref, get } from "firebase/database";
import { useParams, useNavigate } from "react-router-dom";
import { auth } from "../../Components/firebase/firebase";

const BookingDetails = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const user = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      console.log('No user is currently logged in.');
      return;
    }

    const fetchBookingDetails = async () => {
      try {
        const db = getDatabase();
        const bookingRef = ref(db, `users/${user.uid}/bookings/${bookingId}`);
        const snapshot = await get(bookingRef);
        if (snapshot.exists()) {
          setBooking(snapshot.val());
        } else {
          console.log('No data available');
        }
      } catch (error) {
        console.error("Error fetching booking details:", error);
      }
    };

    fetchBookingDetails();
  }, [user, bookingId]);

  if (!booking) {
    return <p>Loading booking details...</p>;
  }

  const { pet, vet, date, time, services, totalPaid, amountToPay, status } = booking;
  const petName = pet?.name || 'N/A';
  const vetName = vet?.name || 'N/A';

  return (
    <div className="booking-details-wrapper">
      <div className="booking-details-container">
        <div className="left-panel">
          <img src={pet.imageUrl} alt="Pet Avatar" className="pet-avatar" />
          <div className="owner-info">
            <h3>Owner Information</h3>
            <p>Username: {user.displayName}</p>
            <p>Phone: {user.phoneNumber || 'N/A'}</p>
            <p>Pet Name: {petName}</p>
          </div>
        </div>
        <div className="right-panel">
          <h2>Booking Details</h2>
          <table className="booking-details-table">
            <tbody>
              <tr>
                <td className="key-column">Booking ID</td>
                <td className="value-column">{booking.bookingId}</td>
              </tr>
              <tr>
                <td className="key-column">Date</td>
                <td className="value-column">{date}</td>
              </tr>
              <tr>
                <td className="key-column">Time</td>
                <td className="value-column">{time}</td>
              </tr>
              <tr>
                <td className="key-column">Services</td>
                <td className="value-column">{services.join(', ')}</td>
              </tr>
              <tr>
                <td className="key-column">Total Paid</td>
                <td className="value-column">${totalPaid}</td>
              </tr>
              <tr>
                <td className="key-column">Status</td>
                <td className="value-column">{status}</td>
              </tr>
              <tr>
                <td className="key-column">Vet</td>
                <td className="value-column">{vetName}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <button className="booking-detail back-button" onClick={() => navigate(-1)}>Back</button>
      </div>
    </div>
  );
};

export default BookingDetails;
