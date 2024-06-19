import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDatabase, ref, update, get, onValue } from "firebase/database";
import { toast, ToastContainer } from "react-toastify";
import Rating from "@mui/material/Rating";
import Box from "@mui/material/Box";
import StarIcon from "@mui/icons-material/Star";
import { auth } from "../../Components/firebase/firebase";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import FormatBold from "@mui/icons-material/FormatBold";
import FormatItalic from "@mui/icons-material/FormatItalic";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import Check from "@mui/icons-material/Check";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretLeft } from "@fortawesome/free-solid-svg-icons";
import useForceUpdate from "../../hooks/useForceUpdate";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
 
const labels = {
  0.5: "Useless",
  1: "Useless+",
  1.5: "Poor",
  2: "Poor+",
  2.5: "Ok",
  3: "Ok+",
  3.5: "Good",
  4: "Good+",
  4.5: "Excellent",
  5: "Excellent+",
};

function getLabelText(value) {
  return `${value} Star${value !== 1 ? "s" : ""}, ${labels[value]}`;
}

const RatingBooking = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(-1);
  const [review, setReview] = useState("");
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [italic, setItalic] = React.useState(false);
  const [fontWeight, setFontWeight] = React.useState("normal");
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [username, setUsername] = useState("");
  const forceUpdate = useForceUpdate();
  const user = auth.currentUser;

  useEffect(() => {
    if (user && user.uid) {
      const db = getDatabase();
      const userRef = ref(db, "users/" + user.uid);

      onValue(userRef, (snapshot) => {
        const data = snapshot.val();

        if (data) {
          setUsername(data.username);
        }
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        if (!user) {
          console.log("No user is currently logged in.");
          return;
        }

        const db = getDatabase();
        const bookingRef = ref(db, `users/${user.uid}/bookings/${bookingId}`);
        const snapshot = await get(bookingRef);
        if (snapshot.exists()) {
          setBooking(snapshot.val());
        } else {
          console.log("No data available");
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching booking details:", error);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error("User not authenticated. Please log in and try again.");
        return;
      }

      const db = getDatabase();
      const bookingRef = ref(db, `users/${user.uid}/bookings/${bookingId}`);
      await update(bookingRef, {
        rating,
        review,
        status: "Rated",
        username: username,
      });
      toast.success("Rating submitted successfully!", {
        autoClose: 1500,
        onClose: () => {
          forceUpdate();
        },
      });
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error("Failed to submit rating. Please try again.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="rating-container">
      <div>
        <h2 style={{ color: "#CF0070" }}>Rate Your Booking</h2>
        <div className="submit-form">
          <div className="input-container">
            <label style={{ color: "#CF0070" }}>Rating</label>
            <div className="rating-stars-container">
              <Box sx={{ width: 200, display: "flex", alignItems: "center" }}>
                <Rating
                  aria-required
                  name="hover-feedback"
                  value={rating}
                  precision={0.5}
                  getLabelText={getLabelText}
                  onChange={(event, newValue) => {
                    setRating(newValue);
                  }}
                  onChangeActive={(event, newHover) => {
                    setHover(newHover);
                  }}
                  emptyIcon={
                    <StarIcon
                      style={{ opacity: 0.55, fontSize: "3rem" }}
                      fontSize="inherit"
                    />
                  }
                  sx={{
                    "& .MuiRating-iconFilled": {
                      color: "gold",
                      fontSize: "3rem",
                    },
                  }}
                />
                {rating !== null && (
                  <Box sx={{ ml: 2 }}>
                    {labels[hover !== -1 ? hover : rating]}
                  </Box>
                )}
              </Box>
            </div>
          </div>
          <div className="input-container">
            <FormControl>
              <FormLabel style={{ color: "#CF0070" }}>Comment</FormLabel>
              <TextareaAutosize
                required
                placeholder="Leave your comment here..."
                minRows={3}
                style={{
                  minWidth: 300,
                  fontWeight,
                  fontStyle: italic ? "italic" : "initial",
                }}
                value={review}
                onChange={(e) => setReview(e.target.value)}
              />
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  pt: 2,
                  borderTop: "1px solid",
                  borderColor: "divider",
                  flex: "auto",
                }}
              >
                <IconButton
                  color="neutral"
                  onClick={(event) => setAnchorEl(event.currentTarget)}
                >
                  <FormatBold />
                  <KeyboardArrowDown fontSize="small" />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                >
                  {["200", "normal", "bold"].map((weight) => (
                    <MenuItem
                      key={weight}
                      selected={fontWeight === weight}
                      onClick={() => {
                        setFontWeight(weight);
                        setAnchorEl(null);
                      }}
                      sx={{ fontWeight: weight }}
                    >
                      <ListItemIcon>
                        {fontWeight === weight && <Check fontSize="small" />}
                      </ListItemIcon>
                      {weight === "200" ? "lighter" : weight}
                    </MenuItem>
                  ))}
                </Menu>
                <IconButton
                  color={italic ? "primary" : "neutral"}
                  aria-pressed={italic}
                  onClick={() => setItalic((bool) => !bool)}
                >
                  <FormatItalic />
                </IconButton>
              </Box>
            </FormControl>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button
              className="back-rating-button"
              onClick={() => navigate("/manage-booking")}
            >
              <FontAwesomeIcon className="icon-left" icon={faCaretLeft} /> BACK
            </button>
            <button
              onClick={handleSubmit}
              style={{ backgroundColor: "#CF0070" }}
              className="submit-rating-button"
              type="submit"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default RatingBooking;
