import React, { useEffect, useState } from "react";
import { auth, database } from "../../Components/firebase/firebase";
import { ref, get, onValue } from "firebase/database";
import { tokens } from "../../theme";

let updatedDataTeam = [];
export let mockDataTeam = [];
export let mockPieData = [];
export let mockBarData = [];
export let mockTransactions = [];
export let mockLineData = [
  {
    id: "User",
    color: tokens("dark").greenAccent[500],
    data: Array.from({ length: 12 }, (_, i) => ({
      x: (i + 1).toString(),
      y: 0,
    })), 
  },
];

const getMockTransactions = () => {
  let transactions = [];
  let currentYear = new Date().getFullYear();

  mockDataTeam.forEach((user) => {
    for (const bookingId in user.bookings) {
      if (user.bookings.hasOwnProperty(bookingId) && user.bookings[bookingId]) {
        const booking = user.bookings[bookingId];
        let inputStr = booking.bookingId;

        let date = booking.date;
        let bookedYear = date.slice(0, 4);
        let bookedMonth = date.slice(5, 7);
        let bookedDay = date.slice(8, 10);
        let bookedDate = `${bookedDay}-${bookedMonth}-${bookedYear}`;
        // console.log(bookedDate);

        let strippedStr = inputStr.slice(2);
        let day = strippedStr.slice(0, 2);
        let month = strippedStr.slice(2, 4);
        let hour = strippedStr.slice(4, 6);
        let minute = strippedStr.slice(6, 8);
        let second = strippedStr.slice(8, 10);
        let formattedDate = `${currentYear}-${month}-${day}T${hour}:${minute}:${second}`;

        transactions.push({
          bookingID: booking.bookingId,
          user: user.username,
          date: bookedDate,
          time: booking.time,
          formattedDate: formattedDate,
          status: booking.status,
          cost: booking.totalPaid || 0,
        });
      } else {
        console.warn(
          `Skipping booking with undefined bookingId for user: ${user.username}`
        );
      }
    }
  });

  transactions.sort(
    (a, b) => new Date(b.formattedDate) - new Date(a.formattedDate)
  );

  return transactions;
};

const fetchUsers = () => {
  const usersRef = ref(database, "users");

  onValue(
    usersRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        updatedDataTeam = [];

        for (const userId in usersData) {
          if (usersData.hasOwnProperty(userId)) {
            const user = usersData[userId];
            const bookings = user.bookings || {};
            updatedDataTeam.push({
              id: userId,
              ...user,
              bookings: bookings,
            });
          }
        }

        mockDataTeam = updatedDataTeam;
        mockTransactions = getMockTransactions();
        getMockLineData();
        mockPieData = getMockPieData();
        mockBarData = getMockBarData();
      } else {
        console.log("No data available");
      }
    },
    (error) => {console.error("Error fetching data: ", error);
    }
  );
};

const getMockLineData = () => {
  const currentYear = new Date().getFullYear();
  const monthlyTotals = Array(12).fill(0);

  updatedDataTeam.forEach((user) => {
    for (const bookingId in user.bookings) {
      if (user.bookings.hasOwnProperty(bookingId)) {
        const booking = user.bookings[bookingId];
        if (!["Paid", "Checked-in", "Rated"].includes(booking.status)) continue;

        const bookingDate = new Date(booking.date);
        if (bookingDate.getFullYear() === currentYear) {
          const month = bookingDate.getMonth();
          const totalPaid = booking.totalPaid || 0;
          monthlyTotals[month] += totalPaid;
        }
      }
    }
  });
  mockLineData[0].data = monthlyTotals.map((total, index) => ({
    x: (index + 1).toString(),
    y: total.toString(),
  }));
};

const getMockPieData = () => {
  let serviceCounts = {};

  updatedDataTeam.forEach((user) => {
    for (const bookingId in user.bookings) {
      if (user.bookings.hasOwnProperty(bookingId)) {
        const booking = user.bookings[bookingId];
        if (!["Paid", "Checked-in", "Rated"].includes(booking.status)) continue;

        booking.services.forEach((serviceName) => {
          if (serviceCounts[serviceName]) {
            serviceCounts[serviceName]++;
          } else {
            serviceCounts[serviceName] = 1;
          }
        });
      }
    }
  });

  const pieData = Object.keys(serviceCounts).map((serviceName) => ({
    id: serviceName,
    label: serviceName,
    value: serviceCounts[serviceName],
    color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
  }));

  return pieData;
};

const getMockBarData = () => {
  const currentYear = new Date().getFullYear();
  const barData = [];
  for (let month = 0; month < 12; month++) {
    let monthData = {
      months: (month + 1).toString(),
      Grooming: 0,
      Vaccination: 0,
      Pet_Veterinary: 0,
      Check_up: 0,
    };

    updatedDataTeam.forEach((user) => {
      for (const bookingId in user.bookings) {
        if (user.bookings.hasOwnProperty(bookingId)) {
          const booking = user.bookings[bookingId];
          if (!["Paid", "Checked-in", "Rated"].includes(booking.status))
            continue;

          const bookingDate = new Date(booking.date);
          if (
            bookingDate.getFullYear() === currentYear &&
            bookingDate.getMonth() === month
          ) {
            booking.services.forEach((serviceName) => {
              if (serviceName === "Pet Veterinary") serviceName = "Pet_Veterinary";
              if (serviceName === "Check-up") serviceName = "Check_up";
              monthData[serviceName]++;
            });
          }
        }
      }
    });

    barData.push(monthData);
  }

  return barData;
};

fetchUsers();