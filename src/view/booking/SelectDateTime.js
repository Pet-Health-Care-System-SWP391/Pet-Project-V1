import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookingContext } from "../../Components/context/BookingContext";
import { getDatabase, ref, get } from "firebase/database";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretLeft, faCaretRight } from "@fortawesome/free-solid-svg-icons";

const generateTimeSlots = (startTime, endTime, interval) => {
  const slots = [];
  let currentTime = startTime;

  while (currentTime < endTime) {
    const hours = Math.floor(currentTime / 60);
    const minutes = currentTime % 60;
    const timeString = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
    const formattedTime = `${hours % 12 || 12}:${minutes
      .toString()
      .padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
    slots.push({ timeString, formattedTime });
    currentTime += interval;
  }

  return slots;
};

const SelectDateTime = () => {
  const { selectedPet, selectedServices, setSelectedDateTime } =
    useContext(BookingContext);
  const [date, setDate] = useState("");
  const [vet, setVet] = useState("");
  const [vets, setVets] = useState([]);
  const [selectedTime, setSelectedTime] = useState("");
  const navigate = useNavigate();
  const [bookedSlots, setBookedSlots] = useState([]);

  useEffect(() => {
    if (!selectedPet) {
      navigate("/book/select-pet");
    } else if (selectedServices.length === 0) {
      navigate("/book/select-service");
    }
  }, [selectedPet, selectedServices, navigate]);

  useEffect(() => {
    const fetchVets = async () => {
      const db = getDatabase();
      const vetsRef = ref(db, "users");
      const snapshot = await get(vetsRef);
      const vetsData = snapshot.val();
      const vetsList = Object.keys(vetsData)
        .filter((uid) => vetsData[uid].role === "veterinarian")
        .map((uid) => ({
          uid,
          name: vetsData[uid].fullname,
          schedule: vetsData[uid].schedule || {},
          specialization: vetsData[uid].specialization,
        }));
      setVets(vetsList);
    };

    fetchVets();
  }, []);

  useEffect(() => {
    const fetchAllBookings = async () => {
      const db = getDatabase();
      const usersRef = ref(db, "users");
      const snapshot = await get(usersRef);
      const usersData = snapshot.val();
      let allBookings = [];

      if (usersData) {
        Object.keys(usersData).forEach((userId) => {
          const userData = usersData[userId];
          if (userData.bookings) {
            Object.keys(userData.bookings).forEach((bookingId) => {
              const booking = userData.bookings[bookingId];
              allBookings.push({
                userId,
                bookingId,
                ...booking,
              });
            });
          }
        });
      }
      setBookedSlots(allBookings);
    };

    fetchAllBookings();
  }, []);

  const morningSlots = generateTimeSlots(600, 720, 15); // 10:00 AM to 11:45 AM
  const afternoonSlots = generateTimeSlots(720, 1080, 15); // 12:00 PM to 4:45 PM

  const availableVets = date ? vets.filter((vet) => vet.schedule[date]) : [];
  vets.forEach((vet) => console.log("Vet Schedule:", vet.schedule));

  const handleNext = async () => {
    if (date && vet && selectedTime) {
      const selectedVet = vets.find((v) => v.name === vet);

      const serviceNames = selectedServices.map((service) => service.name);

      if (!selectedPet.name || serviceNames.length === 0) {
        alert(
          "Pet ID or Service Names are missing. Please check your selection."
        );
        return;
      }

      try {
        const newBookedSlot = {
          vetUid: selectedVet.uid,
          date,
          time: selectedTime,
        };
        setBookedSlots([...bookedSlots, newBookedSlot]);
        setSelectedDateTime({
          date,
          time: selectedTime,
          vet: { name: vet, uid: selectedVet.uid },
        });
        navigate("/book/booking-confirm");
      } catch (error) {
        console.error("Error processing booking:", error);
        alert("There was an error processing your booking. Please try again.");
      }
    } else {
      alert("Please select a date, vet, and time.");
    }
  };

  console.log(availableVets);

  const tileDisabled = ({ date }) => {
    const today = new Date();
    return date < today.setHours(0, 0, 0, 0);
  };

  const handleDateChange = (selectedDate) => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;
    setDate(formattedDate);
  };

  const renderTimeSlots = (slots) => {
    const currentTime = new Date();
    const currentDay = currentTime.getDate();
    const currentMinutes =
      currentTime.getHours() * 60 + currentTime.getMinutes();
    const cutoffTime = currentMinutes + 30;

    return slots.map((slot) => {
      const [slotHours, slotMinutes] = slot.timeString.split(":").map(Number);
      const slotTime = slotHours * 60 + slotMinutes;
      const isPast =
        currentDay === Number(date.split("-")[2]) && slotTime <= cutoffTime;

      const isBooked = bookedSlots.some(
        (bookedSlot) =>
          bookedSlot.vet.name === vet &&
          bookedSlot.date === date &&
          bookedSlot.time === slot.timeString &&
          (bookedSlot.status === "Paid" ||
            bookedSlot.status === "Checked-in" ||
            bookedSlot.status === "Rated")
      );

      console.log(
        `Slot: ${slot.timeString}, Is Booked: ${isBooked}, Is Past: ${isPast}`
      );

      return (
        <button
          key={slot.timeString}
          onClick={() => setSelectedTime(slot.timeString)}
          className={selectedTime === slot.timeString ? "selected" : ""}
          style={{ margin: "5px", width: "120px" }}
          disabled={isBooked || isPast}
        >
          {slot.formattedTime}
        </button>
      );
    });
  };

  if (!selectedPet || selectedServices.length === 0) {
    return (
      <div className="date-time-selection">
        <h1>
          No pet or services selected. Please go back and select a pet and
          services.
        </h1>
        <button onClick={() => navigate("/book/select-pet")}>
          Go Back to Pet Selection
        </button>
      </div>
    );
  }

  return (
    <div className="date-time-container">
      <div className="date-time-selection">
        <div className="form-column">
          <h1>
            Select Date and Time for{" "}
            <span className="service-pet-name">{selectedPet.name}</span>
          </h1>
          <div className="sel-date-form-group">
            <label>Date:</label>
            <Calendar
              onChange={handleDateChange}
              value={date}
              tileDisabled={tileDisabled}
            />
          </div>
          <div className="sel-date-form-group">
            <label htmlFor="vet">Vet:</label>
            <select
              id="vet"
              value={vet}
              onChange={(e) => setVet(e.target.value)}
              required
            >
              <option value="">Select a Vet</option>
              {availableVets.map((vet) => (
                <option key={vet.uid} value={vet.name}>
                  {vet.name} - {vet.specialization}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="slots-column">
          {date && vet && (
            <>
              <div className="slots-group">
                <h2>Morning Slots</h2>
                <div className="time-slots">
                  <div className="slot-row">
                    {renderTimeSlots(morningSlots.slice(0, 4))}
                  </div>
                  <div className="slot-row">
                    {renderTimeSlots(morningSlots.slice(4))}
                  </div>
                </div>
              </div>
              <div className="slots-group">
                <h2>Afternoon Slots</h2>
                <div className="time-slots">
                  <div className="slot-row">
                    {renderTimeSlots(afternoonSlots.slice(0, 4))}
                  </div>
                  <div className="slot-row">
                    {renderTimeSlots(afternoonSlots.slice(4, 8))}
                  </div>
                  <div className="slot-row">
                    {renderTimeSlots(afternoonSlots.slice(8, 12))}
                  </div>
                  <div className="slot-row">
                    {renderTimeSlots(afternoonSlots.slice(12, 16))}
                  </div>
                  <div className="slot-row">
                    {renderTimeSlots(afternoonSlots.slice(16, 20))}
                  </div>
                </div>
              </div>
              <button className="back-button" onClick={() => navigate(-1)}>
                <FontAwesomeIcon className="icon-left" icon={faCaretLeft} />{" "}
                BACK
              </button>
              <button
                className="button-service button-service1"
                onClick={handleNext}
                disabled={!date || !vet || !selectedTime}
              >
                NEXT{" "}
                <FontAwesomeIcon className="icon-right" icon={faCaretRight} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectDateTime;
