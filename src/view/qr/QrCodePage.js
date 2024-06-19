import React, { useEffect, useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getDatabase, ref, get, update, onValue, set } from "firebase/database";
import { auth } from "../../Components/firebase/firebase";
import { TransactionContext } from "../../Components/context/TransactionContext";
import { ToastContainer, toast } from "react-toastify";
import { ScaleLoader } from "react-spinners";
import { css } from "@emotion/react";
import useForceUpdate from "../../hooks/useForceUpdate";
import { BookingContext } from "../../Components/context/BookingContext";

const QrCodePage = () => {
  const { selectedPet, selectedServices, selectedDateTime } =
    useContext(BookingContext);
  const location = useLocation();
  const { qrUrl, bookingId } = location.state;
  const navigate = useNavigate();
  const { fetchTransactions } = useContext(TransactionContext);
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [accountBalance, setAccountBalance] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const forceUpdate = useForceUpdate();
   
  const userId = auth.currentUser.uid
  console.log(userId)

  const override = css`
    display: block;
    margin: 500px auto;
    border-color: red;
  `;

  const mockFetchTransactions = async () => {
    return {
      descriptions: [
        "thanhtoan BK1243463456",
        "thanhtoan BK12315234",
        "thanhtoan BK12315234",
        "thanhtoan BK12315234",
        "thanhtoan " + bookingId,
        "thanhtoan BK12315234",
        "thanhtoan BK12315234",
      ],
      amounts: [0, 1000, 100, 100, 120000, 500, 50000, 120000],
    };
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;

      if (user) {
        const db = getDatabase();
        const userRef = ref(db, "users/" + user.uid);

        try {
          const snapshot = await get(userRef);
          const data = snapshot.val();
          if (snapshot.exists()) {
            setUsername(data.username);
            setAccountBalance(data.accountBalance || 0);
            console.log(data)
          }
          if (data && data.bookings) {
            const bookings = data.bookings;
            const booking = Object.values(bookings).find(
              (b) => b.bookingId === bookingId
            );
            if (booking) {
              setTotalPaid(booking.totalPaid);
            }
          }
        } catch (error) {
          console.error("Error fetching user data: ", error);
        }
      }
    };

    fetchUserData();
  }, [bookingId]);
  useEffect(() => {
    const user = auth.currentUser;

    if (!username || !bookingId) return;

    const intervalId = setInterval(async () => {
      try {
        const { descriptions, amounts } = await mockFetchTransactions();
        const contentTransfer = `thanhtoan ${bookingId}`;

        const paymentIndex = descriptions.findIndex((description) =>
          description.includes(contentTransfer)
        );

        console.log("Descriptions:", descriptions);
        console.log("Amounts:", amounts);
        console.log("Payment Index:", paymentIndex);

        if (paymentIndex !== -1) {
          const paymentAmount = amounts[paymentIndex];
          const db = getDatabase();
          const userRef = ref(db, "users/" + user.uid);
          const snapshot = await get(userRef);
          const data = snapshot.val();
          const paymentAmountInSystem = paymentAmount / 1000;

          if (!data) {
            throw new Error("No user data found.");
          }
          const accountBalanceNumber = parseFloat(accountBalance);

          const newAccountBalance =
            accountBalanceNumber + paymentAmountInSystem - totalPaid;

          if (newAccountBalance >= 0) {
            await update(userRef, { accountBalance: newAccountBalance });
            const bookingRef = ref(db, `users/${user.uid}/bookings`);
            onValue(bookingRef, (snapshot) => {
              const bookings = snapshot.val();
              if (bookings) {
                const bookingKey = Object.keys(bookings).find(
                  (key) => bookings[key].bookingId === bookingId
                );
                if (bookingKey) {
                  const specificBookingRef = ref(
                    db,
                    `users/${user.uid}/bookings/${bookingKey}`
                  );
                  update(specificBookingRef, { status: "Paid" });
                }
              }
            });

            const bookingSlotRef = ref(
              db,
              `users/${selectedDateTime.vet.uid}/schedule/${selectedDateTime.date}`
            );
            const bookingSlotSnapshot = await get(bookingSlotRef);
            let bookedSlots = Array.isArray(bookingSlotSnapshot.val())
              ? bookingSlotSnapshot.val()
              : [];

            bookedSlots.push({
              time: selectedDateTime.time,
              petName: selectedPet.name,
              services: selectedServices.map((service) => service.name),
              userAccount: user.email,
              username: username,
              status: 1,
              bookingId: bookingId,
              userId: userId
            });

            await set(
              ref(
                db,
                `users/${selectedDateTime.vet.uid}/schedule/${selectedDateTime.date}`
              ),
              bookedSlots
            );

            toast.success(
              "Payment successfully! Please your check booking section.",
              {
                autoClose: 2000,
                onClose: () => {
                  setTimeout(() => {
                    forceUpdate();
                    navigate("/manage-booking");
                    window.location.reload()
                  }, 500);
                },
              }
            );
            clearInterval(intervalId);
          }
        } else {
          console.log("Payment not found in transaction history");
        }
      } catch (error) {
        console.error("Error fetching transaction history:", error);
      } finally {
        setIsLoading(false);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(intervalId);
  }, [navigate, username, bookingId, fetchTransactions, totalPaid]);

  return (
    <div
      className="qr-code-page"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <h2
        style={{ marginTop: "30px", paddingBottom: "20px", fontSize: "3rem" }}
      >
        Quét QR để thanh toán
      </h2>
      {isLoading ? (
        <ScaleLoader
          color={"#123abc"}
          loading={true}
          css={override}
          height={35}
          width={4}
          radius={2}
          margin={2}
          speedMultiplier={2}
        />
      ) : (
        <img src={qrUrl} alt="QR Code" />
      )}
      <ToastContainer />
    </div>
  );
};

export default QrCodePage;
