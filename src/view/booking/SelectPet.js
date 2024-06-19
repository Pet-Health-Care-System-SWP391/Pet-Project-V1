import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from "../../Components/firebase/firebase";
import { getDatabase, ref, onValue } from "firebase/database";
import { ScaleLoader } from "react-spinners";
import { Pagination } from "@mui/material";
import { makeStyles } from "@mui/styles"; 
import useViewport from "../../hooks/useViewport";
import { BookingContext } from '../../Components/context/BookingContext';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaw } from "@fortawesome/free-solid-svg-icons";
import imageNopet from "../../public/assets/Remove-bg.ai_1716049467772.png"
 
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
    },
  },
});

const SelectPet = () => {
  const { setSelectedPet } = useContext(BookingContext);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const classes = useStyles();
  const { width } = useViewport();
  const [petsPerPage, setPetsPerPage] = useState(10);

  useEffect(() => {
    if (width >= 1785) {
      setPetsPerPage(12);
    } else if (width >= 991 && width < 1600) {
      setPetsPerPage(10);
    } else if (width >= 991 && width < 1600) {
      setPetsPerPage(5);
    } else {
      setPetsPerPage(4);
    }
  }, [width]);

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
            setLoading(false);
          } else {
            setPets([]);
            setLoading(false);
          }
        });
        return () => unsubscribePets();
      } else {
        setUser(null);
        setPets([]);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="sweet-loading">
        <ScaleLoader
          color={"#123abc"}
          loading={true}
          size={3000}
        />
      </div>
    );
  }

  const handlePetSelect = (pet) => {
    console.log("Selected Pet in handlePetSelect:", pet); // Debugging line
    setSelectedPet(pet);
    navigate('/book/select-service');
  };

  const indexOfLastPet = currentPage * petsPerPage;
  const indexOfFirstPet = indexOfLastPet - petsPerPage;
  const currentPets = pets.slice(indexOfFirstPet, indexOfLastPet);
  const pageNumbers = Math.ceil(pets.length / petsPerPage);

  return (
    <div className="pet-page">
      <div className="parent-container">
        <div className="pet-manage">
          {user ? (
            pets.length === 0 ? (
              <div className="empty-pet container">
                <div className="empty-pet-img">
                  <img src={imageNopet} alt="No pets" />
                </div>
                <div className="empty-pet-title">
                  <h1>
                    Look like you <span>DON'T HAVE</span> any pet in our system.
                  </h1>
                  <h3>Must add your boss before you proceed to booking</h3>
                  <div onClick={() => navigate('/pet/add')} className="btn">
                    <FontAwesomeIcon icon={faPaw} /> Add boss!
                  </div>
                </div>
              </div>
            ) : (
              <div className="pet-list">
                <h1>Your Pets</h1>
                <div className="add-pet-button">
                  <div onClick={() => navigate('/pet/add')} className="btn">
                    <FontAwesomeIcon icon={faPaw} /> Add boss!
                  </div>
                </div>
                <div className="grid-container">
                  {currentPets.map((pet, index) => (
                    <div
                      key={index}
                      className="pet-card"
                      onClick={() => handlePetSelect(pet)}
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
                  Page {currentPage} of {Math.ceil(pets.length / petsPerPage)}
                </div>
                {pageNumbers > 1 && (
                  <Pagination
                    className={classes.pagination}
                    count={pageNumbers}
                    page={currentPage}
                    onChange={(e, value) => setCurrentPage(value)}
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
    </div>
  );
};

export default SelectPet;
