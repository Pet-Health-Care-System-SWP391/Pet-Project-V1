import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import {
  Box,
  Typography,
  useTheme,
} from "@mui/material";
import { getDatabase, ref, get } from "firebase/database";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Header from "../../Components/dashboardChart/Header";
import { tokens } from "../../theme";
 
const Calendar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [currentEvents, setCurrentEvents] = useState([]);
  const auth = getAuth();
  const navigate = useNavigate();

  const convertScheduleToEvents = (schedule) => {
    const events = [];
    for (const [date, bookings] of Object.entries(schedule)) {
      bookings
        .filter((booking) => booking.status === 1) // Only include bookings with status 1
        .forEach((booking, index) => {
          events.push({
            id: `${date}-${index}`,
            title: `Booking with ${booking.username}`,
            start: `${date}T${booking.time}:00`,
            allDay: false,
            extendedProps: {
              services: booking.services.join(", "),
              petName: booking.petName,
              bookingId: booking.bookingId, // Pass bookingId for navigation
            },
          });
        });
    }
    return events;
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const db = getDatabase();
          const userRef = ref(db, "users/" + currentUser.uid);

          const snapshot = await get(userRef);
          const data = snapshot.val();
          if (data && data.schedule) {
            const events = convertScheduleToEvents(data.schedule);
            setCurrentEvents(events);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleDateClick = (selected) => {
    const title = prompt("Please enter a new title for your event");
    const calendarApi = selected.view.calendar;
    calendarApi.unselect();

    if (title) {
      calendarApi.addEvent({
        id: `${selected.dateStr}-${title}`,
        title,
        start: selected.startStr,
        end: selected.endStr,
        allDay: selected.allDay,
      });
    }
  };

  const handleEventClick = (selected) => {
    const bookingId = selected.event.extendedProps.bookingId; // Assuming bookingId is part of extendedProps
    navigate(`/booking-details/${bookingId}`);
  };

  return (
    <Box m="20px">
      <Header title="Calendar" subtitle="Full Calendar Interactive Page" />

      <Box display="flex" justifyContent="space-between">
        {/* CALENDAR */}
        <Box flex="1 1 100%" ml="15px">
          <FullCalendar
            height="75vh"
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
              listPlugin,
            ]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
            }}
            initialView="dayGridMonth"
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            select={handleDateClick}
            eventClick={handleEventClick}
            events={currentEvents}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Calendar;
