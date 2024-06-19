import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaw } from "@fortawesome/free-solid-svg-icons";
import { auth, imageDb } from "../../Components/firebase/firebase";
import React, { useState, useEffect, useRef } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { ClipLoader } from "react-spinners";
import { css } from "@emotion/react";
import { ScaleLoader } from "react-spinners";
import { Pagination, PaginationItem } from "@mui/material";
import { makeStyles } from "@mui/styles"; // Import makeStyles
import useViewport from "./useViewport";

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
        backgroundColor: "rgba(0, 0, 0, 0.08);",
        color: "#fff",
      },
    },
  },
});

const Pet = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);
  const [petCount, setPetCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const classes = useStyles();
  const { width } = useViewport(); // Get the viewport width

  const [petsPerPage, setPetsPerPage] = useState(10); // Default value

  useEffect(() => {
    if (width >= 1785) {
      setPetsPerPage(12);
    } else if (width >= 991 && width < 1600) {
      setPetsPerPage(10);
    } else if (width >= 991 && width < 1600) {
      setPetsPerPage(5);
    } else {
      setPetsPerPage(4); // Default value for smaller screens
    }
  }, [width]);

  const override = css`
    display: block;
    margin: 500px auto;
    border-color: red;
  `;
  const Loading = () => {
    return (
      <div className="sweet-loading">
        <ScaleLoader
          color={"#123abc"}
          loading={true}
          css={override}
          size={3000}
        />
      </div>
    );
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        const db = getDatabase();
        const petRef = ref(db, "users/" + user.uid + "/pets");
        const unsubscribePets = onValue(petRef, (snapshot) => {
          const pets = snapshot.val();
          if (pets) {
            const petList = Object.entries(pets).map(([key, value]) => ({
              ...value,
              key,
            }));
            setPets(petList);
            setPetCount(petList.length);
            setLoading(false);
          } else {
            setPets([]);
            setPetCount(0);
            setLoading(false);
          }
        });
        return () => unsubscribePets();
      } else {
        setUser(null);
        setPets([]);
        setPetCount(0);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const applyStyles = () => {
      document.querySelectorAll(".MuiPaginationItem-root").forEach((item) => {
        item.classList.add(classes.paginationItem);
      });
    };
    applyStyles();
  }, [currentPage, classes]);

  const addPet = () => {
    navigate("/pet/add");
  };
  if (loading) {
    return <Loading />;
  }

  const indexOfLastPet = currentPage * petsPerPage;
  const indexOfFirstPet = indexOfLastPet - petsPerPage;
  const currentPets = pets.slice(indexOfFirstPet, indexOfLastPet);

  const pageNumbers = Math.ceil(petCount / petsPerPage);

  const handlePaginationChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <div className="pet-page">
      <div className="parent-container ">
        <div className="pet-manage">
          {user ? (
            petCount === 0 ? (
              <div className="empty-pet container">
                <div className="empty-pet-img">
                  <img src="./Remove-bg.ai_1716049467772.png" alt="No pets" />
                </div>
                <div className="empty-pet-title">
                  <h1>
                    Look like you <span>DON'T HAVE</span> any pet in our system.
                  </h1>
                  <h3>Must add your boss before you proceed to booking</h3>
                  <div onClick={addPet} className="btn">
                    <FontAwesomeIcon icon={faPaw} /> Add boss!
                  </div>
                </div>
              </div>
            ) : (
              <div className="pet-list">
                <h1>Your Pets</h1>
                <div className="add-pet-button">
                  <div onClick={addPet} className="btn">
                    <FontAwesomeIcon icon={faPaw} /> Add boss!
                  </div>
                </div>
                <p>Current number of pets: {petCount}</p>
                <div className="grid-container">
                  {currentPets.map((pet, index) => (
                    <div
                      key={index}
                      className="pet-card"
                      onClick={() => navigate(`/pet-details/${pet.key}`)}
                      
                    >
                      <div className="pet-card-image">
                        {pet.imageUrl ? (
                          <img src={pet.imageUrl} alt={`${pet.name}'s image`} />
                        ) : (
                          "No image"
                        )}
                      </div>
                      <div className="pet-card-content">
                        <div className="pet-card-header">
                          <span className="pet-name">{pet.name}</span>
                          <span className="pet-color">{pet.type}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    textAlign: "center",
                    marginBottom: "1rem",
                    marginTop: "2rem",
                    fontSize: "3rem",
                  }}
                >
                  Page {currentPage} of {Math.ceil(petCount / petsPerPage)}
                </div>
                {pageNumbers > 1 && (
                  <Pagination
                    className={classes.pagination}
                    count={pageNumbers}
                    page={currentPage}
                    onChange={handlePaginationChange}
                    variant="outlined"
                    shape="rounded"
                    size="large"
                    siblingCount={1}
                  />
                )}
              </div>
            )
          ) : (
            <h1>Please log in to manage your pets.</h1>
          )}
        </div>
      </div>
          {/* <img className="img-pet-manage" src="https://app.petotum.com/assets/img/wp/petbg.png" /> */}
    </div>
  );
};

export default Pet;
