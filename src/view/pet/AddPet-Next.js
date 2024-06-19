import React, { useState, useContext, useEffect } from "react";
import "./AddPet.css"; // Import the CSS file
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { getDatabase, ref, push, set, get } from "firebase/database";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { getAuth } from "firebase/auth"; // Import Firebase auth for getting current user
import { AddPetContext } from "../../Components/context/AddPetContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretLeft } from "@fortawesome/free-solid-svg-icons";
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Box from '@mui/material/Box';
import useForceUpdate from "../../hooks/useForceUpdate";
 
const AddPetNext = () => {
  const { petData, updatePetData, clearPetData } = useContext(AddPetContext);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth(); 
  const forceUpdate = useForceUpdate()
  console.log(petData)

  const addDataBase = async (userId, imageUrl) => {
    try {
      const db = getDatabase();
      const newPetRef = push(ref(db, `users/${userId}/pets`));
      await set(newPetRef, {
        name: petData.name,
        age: petData.age,
        type: petData.type,
        weight: petData.weight,
        imageUrl: imageUrl,
        dob: petData.dob,
      });
      toast.success("Pet added successfully. You can view it in your collection!", {
        autoClose: 2000,
        onClose: () => {
          forceUpdate()
          setTimeout(() => {
            navigate("/pet");
          }, 500); // Delay for 2 seconds (2000 milliseconds)
        }
      });
      clearPetData()
    } catch (error) {
      toast.error("Error adding pet: " + error.message);
    }
  };
  

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    const user = auth.currentUser;
    if (user) {
      if (petData.image) {
        const storage = getStorage();
        const storageReference = storageRef(
          storage,
          `pets/${user.uid}/${uuidv4()}`
        );
        uploadBytes(storageReference, petData.image)
          .then((snapshot) => {
            getDownloadURL(snapshot.ref)
              .then((url) => {
                addDataBase(user.uid, url);
                setLoading(false);
              })
              .catch((error) => {
                console.error("Error getting download URL:", error);
                setLoading(false);
              });
          })
          .catch((error) => {
            console.error("Error uploading image:", error);
            setLoading(false);
          });
      } else {
        addDataBase(user.uid, "");
        setLoading(false);
      }
    } else {
      toast.error("User not logged in.");
      setLoading(false);
    }
    
  };

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const now = new Date();
    let age = now.getFullYear() - birthDate.getFullYear();
    const monthDiff = now.getMonth() - birthDate.getMonth();
  
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
      age--;
    }
  
    return age;
  };

  const handleDobChange = (event) => {
    const dob = event.target.value;
    const age = calculateAge(dob);
    updatePetData("age", age); // Update pet age based on DOB
    updatePetData("dob", dob); // Update pet DOB
  };
  const VisuallyHiddenInput = ({ ...props }) => (
    <input
      {...props}
      style={{
        margin: "0 auto",
        padding: "10px",
        width: '1px',
        height: '1px',
        padding: 0,
        overflow: 'hidden',
        border: 0,
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        clipPath: 'inset(100%)',
      }}
    />
  );
  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      updatePetData("image", e.target.files[0]); // For single image
    }
  };

  return (
    <div className="parent-container parent-container1">
      <h2 className="title-add-next-pet">Step 2: Add Pet Info</h2>
      <p className="des-add-next-pet">Tell us more about your Pet</p>
      <div className="container container1 pet-container" id="container">
      <div className="image-group" style={{ position: 'relative', textAlign: 'center', width: "100%" }}>
      <Box display="flex" flexDirection="column" alignItems="center">
        <Button
          component="label"
          variant="contained"
          startIcon={<CloudUploadIcon />}
          sx={{
            backgroundColor: '#e20074',
            color: 'white',
            padding: "12px",
            marginTop: "12px",
            '&:hover': {
              backgroundColor: "#c10065",
              color: '#fff',
            },
          }}
        >
          Upload Photo
          <VisuallyHiddenInput
            id="petimage"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
        </Button>
        {!petData.image && <p>No image uploaded yet.</p>}
        {petData.image && (
          <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
            <img
              style={{ width: '180px', height: '150px' }}
              src={URL.createObjectURL(petData.image)}
              alt="Pet Preview"
              className="rounded-lg object-cover"
            />
            <p>Image Preview</p>
          </Box>
        )}
      </Box>
    </div>
        <form
          onSubmit={handleSubmit}
          className="grid-container grid-container1"
        >
          <div className="form-group">
            <div className="flex-container">
              <div className="flex-item">
                <label>Pet Name</label>
                <input
                  required
                  id="petname"
                  type="text"
                  autoComplete="off"
                  value={petData.petName}
                  placeholder="Enter your pet name"
                  onChange={(e) => updatePetData("name", e.target.value)}
                  className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:indigo-600 shadow-sm rounded-lg transition duration-300"
                />
              </div>
            </div>
            <div className="flex-container">
              <div className="flex-item">
                <label>D.O.B</label>
                <input
                  type="date"
                  value={petData.dob}
                  onChange={handleDobChange}
                />
              </div>
              <div className="flex-item">
                <label>Pet Weight</label>
                <input
                  required
                  id="petweight"
                  type="number"
                  autoComplete="off"
                  value={petData.petWeight}
                  placeholder="Enter your pet weight"
                  onChange={(e) => updatePetData("weight", e.target.value)}
                  className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:indigo-600 shadow-sm rounded-lg transition duration-300"
                />
              </div>
            </div>
          </div>
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <button className="submit-pet back-button" onClick={() => navigate(-1)}>
                {" "}
                <FontAwesomeIcon
                  className="icon-left"
                  icon={faCaretLeft}
                />{" "}
                BACK
              </button>
              <button type="submit" disabled={loading} className="submit-pet">
                {loading ? (
                  "Uploading..."
                ) : (
                  <span style={{ fontSize: "12px", color: "white" }}>
                    Add Pet
                  </span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
      <ToastContainer />
      <div className="img-add-next-pet-thumbnail">
        <img
          src="https://app.petotum.com/assets/img/wp/petbg.png"
          alt="Pet Background"
        />
      </div>
    </div>
  );
};

export default AddPetNext;
