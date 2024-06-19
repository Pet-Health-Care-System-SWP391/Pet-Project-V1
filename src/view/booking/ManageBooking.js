import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue, update, get, set } from "firebase/database";
import { auth } from "../../Components/firebase/firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { Pagination } from "@mui/material";
import { makeStyles } from "@mui/styles";
import useForceUpdate from "../../hooks/useForceUpdate";
import "./ManageBookings.css";

const useStyles = makeStyles({
  pagination: {
    display: "flex",
    justifyContent: "center",
    fontSize: "1.5rem",
    marginTop: "0",
    paddingBottom: "2rem",
    "& .MuiPaginationItem-root": {
      fontSize: "1.5rem", 
      marginLeft: "2rem",
      padding: "4px",
      borderRadius: "50%",
      backgroundColor: "#7b2cbf",
      border: "1px solid var(--neon-color)",
      color: "#fff",
      transition: "all 0.3s ease",
      "&:hover": {
        backgroundColor: "#f0f0f0",
        borderColor: "#999",
        color: "#000",
      },
      "&.Mui-selected": {
        backgroundColor: "#be90e5",
        color: "#fff",
      },
    },
  },
});

const ManageBookings = () => {
  const [paidBookings, setPaidBookings] = useState([]);
  const [unpaidBookings, setUnpaidBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;
  const [confirmCancel, setConfirmCancel] = useState(null);
  const [showPaid, setShowPaid] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [bookingsPerPage] = useState(5);
  const navigate = useNavigate();
  const classes = useStyles();
  const forceUpdate = useForceUpdate();

  useEffect(() => {
    if (!user) {
      console.log("No user is currently logged in.");
      return;
    }

    const db = getDatabase();
    const bookingRef = ref(db, `users/${user.uid}/bookings`);
    const unsubscribe = onValue(bookingRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const paid = [];
        const unpaid = [];
        Object.keys(data).forEach((key) => {
          const booking = { ...data[key], key };
          if (
            booking.status === "Paid" ||
            booking.status === "Cancelled" ||
            booking.status === "Rated" ||
            booking.status === "Checked-in"
          ) {
            paid.push(booking);
          } else if (booking.status === "Pending Payment") {
            unpaid.push(booking);
          }
        });

        const compareBookings = (a, b) => {
          const statusDifference =
            statusToNumber(a.status) - statusToNumber(b.status);
          if (statusDifference !== 0) return statusDifference;

          const dateA = new Date(`${a.date} ${a.time}`);
          const dateB = new Date(`${b.date} ${b.time}`);
          return dateB - dateA;
        };

        paid.sort(compareBookings);
        unpaid.sort(compareBookings);

        setPaidBookings(paid);
        setUnpaidBookings(unpaid);
      } else {
        setPaidBookings([]);
        setUnpaidBookings([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleCancel = (booking) => {
    setConfirmCancel(booking);
  };

  const handleRating = (booking) => {
    navigate(`/rate-booking/${booking.key}`);
  };

  const statusToNumber = (status) => {
    switch (status) {
      case "Paid":
        return 1;
      case "Checked-in":
        return 2;
      case "Rated":
        return 3;
      case "Cancelled":
        return 4;
      default:
        return 5;
    }
  };

  const confirmCancellation = async (booking) => {
    if (confirmCancel) {
      const user = auth.currentUser;
      const db = getDatabase();
      const bookingRef = ref(
        db,
        `users/${user.uid}/bookings/${confirmCancel.key}`
      );
      const vetScheduleRef = ref(
        db,
        `users/${confirmCancel.vet.uid}/schedule/${confirmCancel.date}`
      );
      const vetScheduleSnapshot = await get(vetScheduleRef);
      const vetSchedule = vetScheduleSnapshot.val();

      const updatedSchedule = vetSchedule.map((slot) => {
        if (slot.time === confirmCancel.time && slot.status === 1) {
          return { ...slot, status: 0 };
        }
        return slot;
      });

      try {
        const refundAmount = confirmCancel.totalPaid * 0.75;

        const userRef = ref(db, `users/${user.uid}`);
        const snapshot = await get(userRef);
        const userData = snapshot.val();
        const updatedBalance = userData.accountBalance + refundAmount;

        // Optimistically update state before making async calls
        setPaidBookings((prev) =>
          prev.map((booking) =>
            booking.key === confirmCancel.key
              ? { ...booking, status: "Cancelled" }
              : booking
          )
        );

        await update(bookingRef, { status: "Cancelled" });
        await update(userRef, { accountBalance: updatedBalance });
        await set(vetScheduleRef, updatedSchedule);

        // Sort the updated list so cancelled bookings are at the bottom
        setPaidBookings((prev) => {
          const updated = prev.map((booking) =>
            booking.key === confirmCancel.key
              ? { ...booking, status: "Cancelled" }
              : booking
          );
          return updated.sort(
            (a, b) => statusToNumber(a.status) - statusToNumber(b.status)
          );
        });

        // Show success message
        toast.success(
          "Cancelled successfully! Please check your booking section.",
          {
            autoClose: 2000,
            onClose: () => {
              forceUpdate();
            },
          }
        );

        setConfirmCancel(null);
      } catch (error) {
        console.error("Error cancelling booking:", error);
        toast.error(
          `An error occurred while processing the cancellation. Details: ${error.message}`
        );
      }
    }
  };

  const toggleBookings = () => {
    setShowPaid(!showPaid);
  };

  const closeModal = () => {
    setConfirmCancel(null);
  };

  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentPaidBookings = paidBookings.slice(
    indexOfFirstBooking,
    indexOfLastBooking
  );
  const currentUnpaidBookings = unpaidBookings.slice(
    indexOfFirstBooking,
    indexOfLastBooking
  );

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  useEffect(() => {
    const applyStyles = () => {
      document.querySelectorAll(".MuiPaginationItem-root").forEach((item) => {
        item.classList.add(classes.paginationItem);
      });
    };
    applyStyles();
  }, [currentPage, classes]);

  const getStatusClassName = (status) => {
    switch (status) {
      case "Paid":
        return "status-paid";
      case "Pending Payment":
        return "status-pending";
      case "Checked-in":
        return "status-checkedin";
      case "Cancelled":
        return "status-cancelled";
      default:
        return "";
    }
  };

  return (
    <div className="manage-bookings-page">
      <h2 className="manage-bookings-title">Manage Bookings</h2>
      {showPaid ? (
        <div className="bookings-section">
          <h3>Paid Bookings</h3>
          {loading ? (
            <p>Loading paid bookings...</p>
          ) : (
            <>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Booking ID</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th className="action">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPaidBookings.length > 0 ? (
                    currentPaidBookings.map((booking, index) => (
                      <tr
                        key={booking.key}
                        className={
                          booking.status === "Cancelled"
                            ? "cancelled-booking"
                            : ""
                        }
                        style={{
                          textDecoration:
                            booking.status === "Cancelled"
                              ? "line-through"
                              : "none",
                        }}
                      >
                        <td>{indexOfFirstBooking + index + 1}</td>
                        <td>{booking.bookingId}</td>
                        <td>{booking.date}</td>
                        <td>{booking.time}</td>
                        <td
                          className={`status-cell ${getStatusClassName(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <button
                            className="detail-button"
                            onClick={() =>
                              navigate(`/booking-details/${booking.key}`)
                            }
                          >
                            Details
                          </button>
                          <button
                            className="cancel-button cancel-button-booking"
                            onClick={() => handleCancel(booking)}
                            disabled={
                              booking.status === "Cancelled" ||
                              booking.status === "Pending" ||
                              booking.status === "Rated" ||
                              booking.status === "Checked-in"
                            }
                          >
                            Cancel
                          </button>
                          <button
                            className="rate-button rate-button-booking"
                            onClick={() => handleRating(booking)}
                            disabled={
                              booking.status === "Cancelled" ||
                              booking.status === "Rated" ||
                              booking.status === "Paid"
                            }
                          >
                            Rate
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr class="no-data">
                      <td colspan="6">
                        <div class="no-data-image">
                          <div class="ant-table-placeholder">
                            <div class="ant-table-cell">
                              <div class="css-kghr11 ant-empty ant-empty-normal">
                                <div class="ant-empty-image">
                                  <svg
                                    width="64"
                                    height="41"
                                    viewBox="0 0 64 41"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <g
                                      transform="translate(0 1)"
                                      fill="none"
                                      fill-rule="evenodd"
                                    >
                                      <ellipse
                                        fill="#f5f5f5"
                                        cx="32"
                                        cy="33"
                                        rx="32"
                                        ry="7"
                                      ></ellipse>
                                      <g fill-rule="nonzero" stroke="#d9d9d9">
                                        <path d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z"></path>
                                        <path
                                          d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z"
                                          fill="#fafafa"
                                        ></path>
                                      </g>
                                    </g>
                                  </svg>
                                </div>
                                <div class="ant-empty-description">No data</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {paidBookings.length > bookingsPerPage && (
                <>
                  <div
                    style={{
                      textAlign: "center",
                      marginBottom: "1rem",
                      marginTop: "2rem",
                      fontSize: "2rem",
                    }}
                  >
                    Page {currentPage} of{" "}
                    {Math.ceil(paidBookings.length / bookingsPerPage)}
                  </div>
                  <Pagination
                    count={Math.ceil(paidBookings.length / bookingsPerPage)}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    variant="outlined"
                    shape="rounded"
                    size="large"
                    className={classes.pagination}
                  />
                </>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="bookings-section">
          <h3>Unpaid Bookings</h3>
          {loading ? (
            <p>Loading unpaid bookings...</p>
          ) : (
            <>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Booking ID</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th className="action">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUnpaidBookings.length > 0 ? (
                    currentUnpaidBookings.map((booking, index) => (
                      <tr
                        key={booking.key}
                        className={
                          booking.status === "Cancelled"
                            ? "cancelled-booking"
                            : ""
                        }
                        style={{
                          textDecoration:
                            booking.status === "Cancelled"
                              ? "line-through"
                              : "none",
                        }}
                      >
                        <td>{indexOfFirstBooking + index + 1}</td>
                        <td>{booking.bookingId}</td>
                        <td>{booking.date}</td>
                        <td>{booking.time}</td>
                        <td
                          className={`status-cell ${getStatusClassName(
                            booking.status
                          )}`}
                        >
                          {booking.status || "Pending"}
                        </td>
                        <td>
                          <button
                            className="detail-button"
                            onClick={() =>
                              navigate(`/booking-details/${booking.key}`)
                            }
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr class="no-data">
                      <td colspan="6">
                        <div class="no-data-image">
                          <div class="ant-table-placeholder">
                            <div class="ant-table-cell">
                              <div class="css-kghr11 ant-empty ant-empty-normal">
                                <div class="ant-empty-image">
                                  <svg
                                    width="64"
                                    height="41"
                                    viewBox="0 0 64 41"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <g
                                      transform="translate(0 1)"
                                      fill="none"
                                      fill-rule="evenodd"
                                    >
                                      <ellipse
                                        fill="#f5f5f5"
                                        cx="32"
                                        cy="33"
                                        rx="32"
                                        ry="7"
                                      ></ellipse>
                                      <g fill-rule="nonzero" stroke="#d9d9d9">
                                        <path d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z"></path>
                                        <path
                                          d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z"
                                          fill="#fafafa"
                                        ></path>
                                      </g>
                                    </g>
                                  </svg>
                                </div>
                                <div class="ant-empty-description">No data</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {unpaidBookings.length > bookingsPerPage && (
                <>
                  <div
                    style={{
                      textAlign: "center",
                      marginBottom: "1rem",
                      marginTop: "2rem",
                      fontSize: "2rem",
                    }}
                  >
                    Page {currentPage} of{" "}
                    {Math.ceil(unpaidBookings.length / bookingsPerPage)}
                  </div>
                  <Pagination
                    count={Math.ceil(unpaidBookings.length / bookingsPerPage)}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    variant="outlined"
                    shape="rounded"
                    size="large"
                    className={classes.pagination}
                  />
                </>
              )}
            </>
          )}
        </div>
      )}

      <ToastContainer autoClose={3000} />
      <div className="toggle-button">
        <button onClick={toggleBookings}>
          {showPaid ? "Show Unpaid Bookings" : "Show Paid Bookings"}
        </button>
      </div>
      {confirmCancel && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Cancellation</h3>
              <span className="modal-close" onClick={closeModal}>
                &times;
              </span>
            </div>
            <p
              style={{ fontSize: "2rem", padding: "12px", lineHeight: "3rem" }}
            >
              This booking will be cancelled and we will return you 75% amount
              of this booking
            </p>
            <div className="modal-actions">
              <button className="confirm" onClick={confirmCancellation}>
                Yes
              </button>
              <button className="cancel" onClick={closeModal}>
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBookings;
