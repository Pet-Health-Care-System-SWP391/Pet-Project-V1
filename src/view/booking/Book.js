import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getDatabase,
  ref,
  onValue,
  get,
  set,
  push,
  remove,
  update,
} from "firebase/database";
import { ToastContainer, toast } from "react-toastify";
import { auth } from "../../Components/firebase/firebase";

const Book = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");

  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [accountBalance, setAccountBalance] = useState(0);
  const [bookingId, setBookingId] = useState("");
  const [totalPaid, setTotalPaid] = useState("");
  const [service, setService] = useState([]);
  const [vet, setVet] = useState("");
  const user = auth.currentUser;

  const services = [
    { name: "Grooming", price: 20 },
    { name: "Healthcare", price: 50 },
    { name: "Training", price: 100 },
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        setUserId(user.uid);
        const db = getDatabase();
        const userRef = ref(db, "users/" + user.uid);

        try {
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            const data = snapshot.val();
            setUsername(data.username);
            setEmail(data.email);
            setAccountBalance(data.accountBalance);
          }
        } catch (error) {
          console.error("Error fetching user data: ", error);
        }
      }
    };

    fetchUserData();
  }, [user]);

  const addBookingToDatabase = (
    bookingId,
    name,
    phone,
    date,
    time,
    reason,
    services,
    totalPaid,
    amountToPay,
    paid
  ) => {
    const db = getDatabase();
    const bookingRef = push(
      ref(db, "users/" + userId + "/bookings"),
      {
        name: name,
        phone: phone,
        date: date,
        time: time,
        reason: reason,
        bookingId: bookingId,
        services: services,
        totalPaid: totalPaid,
        amountToPay: amountToPay,
        paid: paid, // Add a field to track payment status
      },
      function (error) {
        if (error) {
          alert("Error adding booking");
        } else {
          alert("Booking added successfully!");
        }
      }
    );
  };

  const handleServiceChange = (event) => {
    const serviceName = event.target.value;
    const isChecked = event.target.checked;

    setService((prevServices) => {
      if (isChecked) {
        return [...prevServices, serviceName];
      } else {
        return prevServices.filter((service) => service !== serviceName);
      }
    });
  };

  const calculateTotalPaid = () => {
    const totalServiceCost = service.reduce((total, serviceName) => {
      const serviceData = services.find((s) => s.name === serviceName);
      return total + (serviceData ? serviceData.price : 0);
    }, 0);
    return totalServiceCost;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed in JavaScript
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    const bookingId = "BK" + day + month + hours + minutes + seconds;
    const totalPaid = calculateTotalPaid();

    if (accountBalance >= totalPaid) {
      // If accountBalance is sufficient to cover the total cost, update the balance and add booking
      const newBalance = accountBalance - totalPaid;
      const db = getDatabase();
      const userRef = ref(db, "users/" + userId);

      await update(userRef, { accountBalance: newBalance });
      setTotalPaid(totalPaid);
      addBookingToDatabase(
        bookingId,
        name,
        phone,
        date,
        time,
        reason,
        service,
        totalPaid,
        0,
        true
      );
      toast.success(
        "Booking successful! Your account balance has been updated."
      );
      navigate("/");
    } else {
      // If accountBalance is not sufficient, calculate remaining amount to pay and navigate to QR page for payment
      const amountToPay = (totalPaid - accountBalance) * 1000;
      const qrUrl = `https://img.vietqr.io/image/MB-0000418530364-print.png?amount=${amountToPay}&addInfo=thanhtoan%20${bookingId}&accountName=Nguyen%20Cong%20Duy%20Bao`;
      console.log(qrUrl); // Log the QR URL to check it
      setTotalPaid(totalPaid);
      addBookingToDatabase(
        bookingId,
        name,
        phone,
        date,
        time,
        reason,
        service,
        totalPaid,
        amountToPay / 1000,
        false
      );
      navigate("/qr", { state: { qrUrl, bookingId } });
    }

    setName("");
    setPhone("");
    setDate("");
    setTime("");
    setReason("");
    setService([]);
    setTotalPaid("");
    setVet("");
  };

  return (
    <div className="appointment-form-container">
      <h2>Đăng Ký Hẹn Lịch Khám</h2>
      {/* <img src='https://petpro.com.vn/assets/booking_pet.fcf232f8.png' /> */}
      <form className="appointment-form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Tên:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <label htmlFor="phone">Số điện thoại:</label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="date">Ngày:</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <label htmlFor="time">Giờ:</label>
          <input
            type="time"
            id="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="vet">Bác sĩ:</label>
          <input
            type="dropdown-menu"
            id="text"
            value={vet}
            onChange={(e) => setVet(e.target.value)}
            required
          />
          <label htmlFor="pet">Thú cưng:</label>
          <input
            type="dropdown-menu"
            id="text"
            value={vet}
            onChange={(e) => setVet(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Dịch vụ:</label>
          {services.map((service) => (
            <div key={service.name}>
              <input
                type="checkbox"
                id={service.name}
                value={service.name}
                onChange={handleServiceChange}
              />
              <label className="service-item" htmlFor={service.name}>
                {service.name} - ${service.price}
              </label>
            </div>
          ))}
        </div>

        <div className="full-width">
          <label htmlFor="reason">Lý do khám:</label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </div>
        <button type="submit">Đăng Ký</button>
      </form>
    </div>
  );
};

export default Book;
