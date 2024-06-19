import React, { useState, useEffect } from "react";
import { getDatabase, ref, get, update } from "firebase/database";
import { useParams, useNavigate } from "react-router-dom";
import { auth } from "../../Components/firebase/firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import SparkleButton from "../../hooks/sparkleButton";
import Calendar from "react-calendar";
import { toast, ToastContainer } from "react-toastify";
import useForceUpdate from "../../hooks/useForceUpdate";

const PetDetail = () => {
  const { petId } = useParams();
  const [pet, setPet] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const forceUpdate = useForceUpdate();
  const catBreeds = [
    "Domestic Short Hair",
    "Domestic Long Hair",
    "Abyssinian",
    "American Bobtail",
    "American Curl",
    "American Shorthair",
    "American Wirehair",
    "Balinese", 
    "Bengal",
    "Birman",
    "Bombay",
    "British Shorthair",
    "Burmese",
    "Chartreux",
    "Chausie",
    "Cornish Rex",
    "Devon Rex",
    "Donskoy",
    "Egyptian Mau",
    "Oriental",
    "Persian",
    "Peterbald",
    "Pixiebob",
    "Ragdoll",
    "Russian Blue",
    "Savannah",
    "Scottish Fold",
    "Selkirk Rex",
    "Serengeti",
    "Siberian",
    "Siamese",
    "Singapura",
    "Snowshoe",
    "Sokoke",
    "Somali",
    "Sphynx",
    "Thai",
    "Tonkinese",
    "Toyger",
    "Turkish Angora",
    "Turkish Van",
  ];

  const dogBreeds = [
    "Domestic Dog",
    "Affenpinscher",
    "Afghan Hound",
    "Akita",
    "Alaskan Malamute",
    "American Staffordshire terrier",
    "American Water Spaniel",
    "Australian cattle dog",
    "Australian shepherd",
    "Australian terrier",
    "Basenji",
    "Basset Hound",
    "Beagle",
    "Bearded Collie",
    "Bedlington Terrier",
    "Bernese Mountain Dog",
    "Bichon Frise",
    "Black And Tan Coonhound",
    "Bloodhound",
    "Border Collie",
    "Border Terrier",
    "Borzoi",
    "Boston Terrier",
    "Bouvier Des Flandres",
    "Boxer",
    "Briard",
    "Brittany",
    "Brussels Griffon",
    "Bull Terrier",
    "Bulldog",
    "Bullmastiff",
    "Cairn Terrier",
    "Canaan Dog",
    "Chesapeake Bay Retriever",
    "Chihuahua",
    "Chinese Crested",
    "Chinese Shar-pei",
    "Chow Chow",
    "Clumber Spaniel",
    "Cocker Spaniel",
    "Collie",
    "Curly-coated Retriever",
    "Dachshund",
    "Dalmatian",
    "Doberman Pinscher",
    "English Cocker Spaniel",
    "English Setter",
    "English Springer Spaniel",
    "English Toy Spaniel",
    "Eskimo Dog",
    "Finnish Spitz",
    "Flat-coated Retriever",
    "Fox Terrier",
    "Foxhound",
    "French Bulldog",
    "German Shepherd",
    "German Shorthaired pointer",
    "German Wirehaired pointer",
    "Golden Retriever",
    "Gordon Setter",
    "Great Dane",
    "Greyhound",
    "Irish Setter",
    "Irish Water Spaniel",
    "Irish Wolfhound",
    "Jack Russell Terrier",
    "Japanese Spaniel",
    "Keeshond",
    "Kerry Blue Terrier",
    "Komondor",
    "Kuvasz",
    "Labrador Retriever",
    "Lakeland Terrier",
    "Lhasa Apso",
    "Maltese",
    "Manchester Terrier",
    "Mastiff",
    "Mexican Hairless",
    "Newfoundland",
    "Norwegian Elkhound",
    "Norwich Terrier",
    "Otterhound",
    "Papillon",
    "Pekingese",
    "Pointer",
    "Pomeranian",
    "Poodle",
    "Pug",
    "Puli",
    "Rhodesian Ridgeback",
    "Rottweiler",
    "Saint Bernard",
    "Saluki",
    "Samoyed",
    "Schipperke",
    "Schnauzer",
    "Scottish Deerhound",
    "Scottish Terrier",
    "Sealyham Terrier",
    "Shetland Sheepdog",
    "Shih Tzu",
    "Siberian Husky",
    "Silky Terrier",
    "Skye Terrier",
    "Staffordshire Bull Terrier",
    "Soft-coated Wheaten Terrier",
    "Sussex Spaniel",
    "Spitz",
    "Tibetan Terrier",
    "Vizsla",
    "Weimaraner",
    "Welsh Terrier",
    "West Highland White Terrier",
    "Whippet",
    "Yorkshire Terrier",
  ];

  const [selectedBreeds, setSelectedBreeds] = useState(catBreeds);

  const handleTypeChange = (event) => {
    const type = event.target.value;
    handleInputChange(event);
    if (type === "Cat") {
      setSelectedBreeds(catBreeds);
    } else if (type === "Dog") {
      setSelectedBreeds(dogBreeds);
    }
  };
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    weight: "",
    type: "",
    breed: "",
    dob: "",
    gender: "",
  });

  const user = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      console.log("No user is currently logged in.");
      return;
    }

    const fetchUserData = async () => {
      try {
        const db = getDatabase();
        const userRef = ref(db, `users/${user.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          setUserData(snapshot.val());
        } else {
          console.log("No user data available");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    const fetchPetDetails = async () => {
      try {
        const db = getDatabase();
        const petRef = ref(db, `users/${user.uid}/pets/${petId}`);
        const snapshot = await get(petRef);
        if (snapshot.exists()) {
          const petData = snapshot.val();
          setPet(petData);
          setFormData({
            name: petData.name,
            age: petData.age,
            weight: petData.weight,
            type: petData.type,
            breed: petData.breed,
            dob: petData.dob,
            gender: petData.gender,
          });
        } else {
          console.log("No data available");
        }
      } catch (error) {
        console.error("Error fetching pet details:", error);
      }
    };

    fetchUserData();
    fetchPetDetails();
  }, [user, petId]);

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleCancelClick = () => {
    setIsEditMode(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(value);
    setFormData((prevData) => ({
      ...prevData,
      [name]: value || "",
    }));
  };
  const handleUpdateClick = async () => {
    const updatedFormData = { ...formData };

    Object.keys(updatedFormData).forEach((key) => {
      if (updatedFormData[key] === undefined) {
        updatedFormData[key] = "";
      }
    });

    try {
      const db = getDatabase();
      const petRef = ref(db, `users/${user.uid}/pets/${petId}`);
      await toast.promise(update(petRef, updatedFormData), {
        success: "Update successful! Please check your pet information again!.",
      });
      setPet(updatedFormData);
      setIsEditMode(false);
      forceUpdate();
      setTimeout(() => {
        window.location.reload();
      }, 2500);
    } catch (error) {
      console.error("Error updating pet details:", error);
    }
  };
  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const difference = Date.now() - birthDate.getTime();
    const ageDate = new Date(difference);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const handleDobChange = (event) => {
    const dob = event.target.value;
    const age = calculateAge(dob);
    setFormData((prevData) => ({
      ...prevData,
      dob: dob,
      age: age.toString(),
    }));
  };
  if (!pet || !userData) {
    return <p>Loading pet details...</p>;
  }

  return (
    <div
      style={{
        height: "100%",
        minHeight: "100vh",
        position: "relative",
        width: "100%",
        backgroundColor: "#EBEFF2",
      }}
    >
      <div className="pet-profile-wrapper">
        <div className="left-panel">
          <img src={pet.imageUrl} alt="Pet Avatar" className="pet-avatar" />
          <div className="owner-info">
            <h3>Pet Parent</h3>
            <div style={{ display: "flex" }}>
              <h3>Username:</h3>
              <p style={{ marginLeft: "20px" }}>{userData.username}</p>
            </div>
            <div style={{ display: "flex" }}>
              <h3>Email:</h3>
              <p style={{ marginLeft: "20px" }}>{userData.email}</p>
            </div>
            <div style={{ display: "flex" }}>
              <h3>Address:</h3>
              <p style={{ marginLeft: "20px" }}>{userData.address || "N/A"}</p>
            </div>
            <div style={{ display: "flex" }}>
              <h3>Phone Number:</h3>
              <p style={{ marginLeft: "20px" }}>{userData.phone || "N/A"}</p>
            </div>
            <div style={{ display: "flex" }}>
              <h3>Status:</h3>
              <p style={{ margin: "12px 0px 0px 20px" }} className="status">
                {userData.accountStatus}
              </p>
            </div>
          </div>
        </div>
        <div className="right-panel">
          {!isEditMode ? (
            <>
              <div className="section general-info">
                <div className="header-pet-info">
                  <h2>Hi, I'm {pet.name}</h2>
                  <div className="edit-button" onClick={handleEditClick}>
                    Edit <FontAwesomeIcon icon={faPenToSquare} />
                  </div>
                </div>
                <div className="section pet-general-info">
                  <div className="pet-info">
                    <p>Age:</p>
                    <div>{pet.age}</div>
                  </div>
                  <div className="pet-info">
                    <p>Weight:</p>
                    <div>{pet.weight || "N/A"}kg</div>
                  </div>
                  <div className="pet-info">
                    <p>Type Of Pet:</p>
                    <div>{pet.type || "N/A"}</div>
                  </div>
                </div>
                <div className="section pet-general-info">
                  <div className="pet-info">
                    <p>D.O.B:</p>
                    <div>{pet.dob}</div>
                  </div>
                  <div className="pet-info">
                    <p>Breed:</p>
                    <div>{pet.breed || "N/A"}</div>
                  </div>
                  <div className="pet-info">
                    <p>Gender:</p>
                    <div>{pet.gender || "N/A"}</div>
                  </div>
                </div>
              </div>
              <button
                className="booking-detail back-button"
                onClick={() => navigate(-1)}
              >
                Back
              </button>
            </>
          ) : (
            <div className="edit-form">
              <div className="title-container">
                <h2>Hi, I'm {formData.name}</h2>
                <p>As pet parent, you can change or update your pet details</p>
              </div>
              <div className="form-group">
                <label>Pet Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Type of Pet</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleTypeChange}
                >
                  <option value="Cat">Cat</option>
                  <option value="Dog">Dog</option>
                </select>
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                >
                  
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="form-group">
                <label>Breed</label>
                <select
                  name="breed"
                  value={formData.breed}
                  onChange={handleInputChange}
                >
                  {selectedBreeds.map((breed, index) => (
                    <option key={index} value={breed}>
                      {breed}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>D.O.B</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleDobChange}
                />
              </div>
              <div className="form-group">
                <label>Weight(kg)</label>
                <input
                  type="text"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                />
              </div>
              <div className="button-group">
                <button className="cancel-button" onClick={handleCancelClick}>
                  Cancel
                </button>
                <button className="update-button" onClick={handleUpdateClick}>
                  Update
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <img
        className="image-103"
        src="https://cdn.prod.website-files.com/6139cf517cd6d26ff1548b86/63525e4544284383347d65d1_cat%20insurance%20(1).png"
        alt=""
        style={{
          opacity: 1,
          transform:
            "translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)",
          transformStyle: "preserve-3d",
          marginRight: "auto",
          marginTop: "20px",
          float: "right",
          zIndex: "1",
          position: "relative",
          pointerEvents: "none" /* thêm vào sẽ click dc button bên dưới */,
        }}
        sizes="(max-width: 479px) 100vw, (max-width: 991px) 200px, (min-width: 991px) and (max-width: 1600px) 350px, 350px"
        data-w-id="4d2f337d-e917-b0c0-fbc2-6c9ab2459d23"
        loading="lazy"
        srcSet="https://cdn.prod.website-files.com/6139cf517cd6d26ff1548b86/63525e4544284383347d65d1_cat%20insurance%20(1)-p-500.png 500w, https://cdn.prod.website-files.com/6139cf517cd6d26ff1548b86/63525e4544284383347d65d1_cat%20insurance%20(1)-p-800.png 800w, https://cdn.prod.website-files.com/6139cf517cd6d26ff1548b86/63525e4544284383347d65d1_cat%20insurance%20(1)-p-1080.png 1080w, https://cdn.prod.website-files.com/6139cf517cd6d26ff1548b86/63525e4544284383347d65d1_cat%20insurance%20(1).png 1212w"
      />
      <img
        className="image-99"
        src="https://cdn.prod.website-files.com/6139cf517cd6d26ff1548b86/6352491844284352957c5405_dog%20(1).png"
        alt="a dog looking up"
        style={{
          opacity: 1,
          transform:
            "translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)",
          transformStyle: "preserve-3d",
          float: "left",
          marginBottom: "auto",
          zIndex: "1000",
        }}
        sizes="(max-width: 479px) 100vw, (max-width: 991px) 200px, (min-width: 991px) and (max-width: 1600px) 350px, 400px"
        data-w-id="a7cc2e85-500e-967b-d8a2-e769496fe301"
        loading="lazy"
        srcSet="https://cdn.prod.website-files.com/6139cf517cd6d26ff1548b86/6352491844284352957c5405_dog%20(1)-p-500.png 500w, https://cdn.prod.website-files.com/6139cf517cd6d26ff1548b86/6352491844284352957c5405_dog%20(1)-p-800.png 800w, https://cdn.prod.website-files.com/6139cf517cd6d26ff1548b86/6352491844284352957c5405_dog%20(1)-p-1080.png 1080w, https://cdn.prod.website-files.com/6139cf517cd6d26ff1548b86/6352491844284352957c5405_dog%20(1).png 1250w"
      />
    </div>
  );
};

export default PetDetail;
