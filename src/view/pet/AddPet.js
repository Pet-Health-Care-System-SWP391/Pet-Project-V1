<<<<<<< HEAD
import { auth } from "../../Components/firebase/firebase";
import React, { useState, useEffect } from "react";
import { getDatabase, ref, push, get, query, orderByChild, limitToLast, set } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ToastContainer, toast } from "react-toastify";
import { v4 } from "uuid";
import { useNavigate } from 'react-router-dom'

const AddPet = () => {
  const [petName, setPetName] = useState("");
  const [petAge, setPetAge] = useState("");
  const [petType, setPetType] = useState("dog"); // Default to dog
  const [petSize, setPetSize] = useState("");
  const [petColor, setPetColor] = useState("");
  const [petVaccinated, setPetVaccinated] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [update, setUpdate] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const forceUpdate = () => {
    setUpdate(!update);
  };
  const handleNext = () => {
    setCurrentStep(currentStep + 1);
    navigate("/pet/add/details");
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);

    const imagePreview = URL.createObjectURL(file);
    setPreviewImage(imagePreview);
  };
  const backBtn = () => {
    navigate(-1)
  }

  const uploadImage = async (userId) => {
    const storage = getStorage();
    const storageReference = storageRef(storage, `images/${userId}/${v4()}`);
    const snapshot = await uploadBytes(storageReference, image);
    return getDownloadURL(snapshot.ref);
  };
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  const capitalizedPetName = capitalizeFirstLetter(petName);
  const capitalizedPetType = capitalizeFirstLetter(petType);
  const capitalizedPetColor = capitalizeFirstLetter(petColor);
  const capitalizedPetSize = capitalizeFirstLetter(petSize);
  const capitalizedPetVaccinated = capitalizeFirstLetter(petVaccinated);
  const capitalizedPetAge = capitalizeFirstLetter(petAge);

  const addDataBase = async (userId, imageUrl) => {
    try {
      const db = getDatabase();
      const newPetRef = push(ref(db, `users/${userId}/pets`));
      await set(newPetRef, {
        name: capitalizedPetName,
        age: capitalizedPetAge,
        type: capitalizedPetType,
        size: capitalizedPetSize,
        color: capitalizedPetColor,
        vaccinated: capitalizedPetVaccinated,
        imageUrl: imageUrl,
      });
      toast.success("Pet added successfully. You can view it in your collection!", {
        autoClose: 2000,
        onClose: () => {
          forceUpdate();
        }
      });
    } catch (error) {
      alert("Error adding pet: " + error.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    const user = auth.currentUser;
    if (user) {
      if (image) {
        // Upload single image to Firebase Storage
        uploadImage(user.uid)
          .then((imageUrl) => {
            addDataBase(user.uid, imageUrl);
            setLoading(false);
          })
          .catch((error) => {
            console.error("Error uploading image:", error);
            setLoading(false);
          });
      } else {
        toast.error("Please upload an image for your pet.");
        setLoading(false);
      }
    } else {
      alert("User not logged in.");
      setLoading(false);
    }
    resetForm();
  };

  const resetForm = () => {
    setImage(null);
    setPetName("");
    setPetAge("");
    setPetColor("");
    setPetSize("");
    setPetType("dog"); // Reset to default type
    setPetVaccinated("");
    setPreviewImage(null);

    const fileInput = document.getElementById("petimage");
    if (fileInput) {
      fileInput.value = ""; // Clear the value of the file input
    }

    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }
  };

  return (
    <div style={{ height: "100vh" }}>
      <section className="section-addpet">
        
      <div className="add-pet-container">
      <h2 className="title-addpet">Step 1: Add Your Pet</h2>
      <div className="line"></div>
      <p className="des-addpet">Choose your pet category</p>
      <div className="pet-options">
        <div
          className={`pet-option ${petType === 'cat' ? 'selected' : ''}`}
          onClick={() => setPetType('cat')}
        >
          <img src="https://app.petotum.com/assets/img/icon/select-cat.png" alt="Cat" />
          <span className="checkmark">&#10003;</span>
        </div>
        <div
          className={`pet-option ${petType === 'dog' ? 'selected' : ''}`}
          onClick={() => setPetType('dog')}
        >
          <img src="https://app.petotum.com/assets/img/icon/select-dog.png" alt="Dog" />
          <span className="checkmark">&#10003;</span>
        </div>
      </div>
      <div className="navigation-buttons">
        <div onClick={backBtn} className="back-link">Back</div>
        <div className="next-link" onClick={handleNext}>Next</div>
      </div>
    </div>
    
    <div className="img-addpet-thumbnail">
    <img src="https://app.petotum.com/assets/img/wp/petbg.png" />
    </div>
    </section>
    </div>
  );
};

export default AddPet;
=======
import { auth } from "../../Components/firebase/firebase";
import React, { useState } from "react";
import { getDatabase, ref, set, push, get } from "firebase/database";
import { ToastContainer, toast } from "react-toastify";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { v4 } from "uuid";

const AddPet = () => {
  const [petName, setPetName] = useState("");
  const [petAge, setPetAge] = useState("");
  const [petGender, setPetGender] = useState("");
  const [petSize, setPetSize] = useState("");
  const [petColor, setPetColor] = useState("");
  const [petVacinated, setPetVacinated] = useState("");
  const [image, setImage] = useState(null); // State for single image
  const [images, setImages] = useState([]); // State for multiple images
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const handleImageChange = (e) => {
    if (e.target.files.length === 1) {
      const selectedImage = e.target.files[0];
      setImage(selectedImage); // For single image
      setPreviewImage(URL.createObjectURL(selectedImage)); // Set preview image URL
    } else {
      setImages(e.target.files); // For multiple images
    }
  };

  const generatePetId = async (userId) => {
    const db = getDatabase();
    const petRef = ref(db, "users/" + userId + "/pets");
    const snapshot = await get(petRef);
    const count = snapshot.exists() ? snapshot.size : 0;
    const newCount = count + 1;
    const petId = `PE${String(newCount).padStart(6, "0")}`;
    return petId;
  };

  const uploadImages = async (userId) => {
    const storage = getStorage();
    const uploadPromises = Array.from(images).map((image) => {
      const storageReference = storageRef(storage, `images/${userId}/${v4()}`);
      return uploadBytes(storageReference, image).then((snapshot) =>
        getDownloadURL(snapshot.ref)
      );
    });
    return Promise.all(uploadPromises);
  };

  const addDataBase = async (userId, imageUrls) => {
    try {
      const petId = await generatePetId(userId);
      const db = getDatabase();
      const newPetRef = push(ref(db, "users/" + userId + "/pets"));
      set(newPetRef, {
        id: petId,
        name: petName,
        age: petAge,
        gender: petGender,
        size: petSize,
        color: petColor,
        vacinated: petVacinated,
        imageUrls: imageUrls,
      });
      toast.success("Pet added successfully. You can view in your collection!");
    } catch (error) {
      alert("Error adding pet: " + error.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    const user = auth.currentUser;
    if (user) {
      if (images.length > 0) {
        // Upload multiple images to Firebase Storage
        uploadImages(user.uid)
          .then((imageUrls) => {
            addDataBase(user.uid, imageUrls);
            setLoading(false);
          })
          .catch((error) => {
            console.error("Error uploading images:", error);
            setLoading(false);
          });
      } else if (image) {
        // Upload single image to Firebase Storage
        const storage = getStorage();
        const storageReference = storageRef(
          storage,
          `images/${user.uid}/${v4()}`
        );
        uploadBytes(storageReference, image)
          .then((snapshot) => {
            getDownloadURL(snapshot.ref)
              .then((url) => {
                addDataBase(user.uid, [url]); // Call add to database with the URL of the image
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
        addDataBase(user.uid, []); // If no image, still add to database
        setLoading(false);
      }
    } else {
      alert("User not logged in.");
      setLoading(false);
    }
  };

  return (
    <div className="parent-container">
      <div className="container" id="container">
        <h3 className="account-title">Add Info Pet</h3>
        <form onSubmit={handleSubmit} className="addPet-grid-container">
          <div className="form-group">
            <div className="flex-container">
              <div className="flex-item">
                <label>Pet Name</label>
                <input
                  required
                  id="petname"
                  type="text"
                  autoComplete="off"
                  value={petName}
                  placeholder="Enter your pet name"
                  onChange={(e) => setPetName(e.target.value)}
                  className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:indigo-600 shadow-sm rounded-lg transition duration-300"
                />
              </div>
              <div className="flex-item">
                <label>Pet Gender</label>
                <input
                  required
                  id="petgender"
                  type="text"
                  autoComplete="off"
                  value={petGender}
                  placeholder="Enter your pet gender"
                  onChange={(e) => setPetGender(e.target.value)}
                  className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:indigo-600 shadow-sm rounded-lg transition duration-300"
                />
              </div>
            </div>
            <div className="flex-container">
              <div className="flex-item">
                <label>Pet Age</label>
                <input
                  id="petage"
                  type="text"
                  autoComplete="off"
                  value={petAge}
                  placeholder="Enter your pet age"
                  onChange={(e) => setPetAge(e.target.value)}
                  className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:indigo-600 shadow-sm rounded-lg transition duration-300"
                />
              </div>
              <div className="flex-item">
                <label>Pet Size</label>
                <input
                  required
                  id="petsize"
                  type="text"
                  autoComplete="off"
                  value={petSize}
                  placeholder="Enter your pet size"
                  onChange={(e) => setPetSize(e.target.value)}
                  className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:indigo-600 shadow-sm rounded-lg transition duration-300"
                />
              </div>
            </div>
            <div className="flex-container">
              <div className="flex-item">
                <label>Pet Color</label>
                <input
                  id="petcolor"
                  type="text"
                  autoComplete="off"
                  required
                  value={petColor}
                  placeholder="Enter your pet color"
                  onChange={(e) => setPetColor(e.target.value)}
                  className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:indigo-600 shadow-sm rounded-lg transition duration-300"
                />
              </div>
              <div className="flex-item">
                <label>Pet Vaccinated</label>
                <input
                  id="petvacinated"
                  type="text"
                  autoComplete="off"
                  required
                  value={petVacinated}
                  placeholder="Enter your pet vaccinated status"
                  onChange={(e) => setPetVacinated(e.target.value)}
                  className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:indigo-600 shadow-sm rounded-lg transition duration-300"
                />
              </div>
            </div>
          </div>
          <div className="image-group">
            <label>Pet Images</label>
            <input
              required
              id="petimage"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:indigo-600 shadow-sm rounded-lg transition duration-300"
            />
            {previewImage && (
              <img
                src={previewImage}
                alt="Preview"
                style={{ maxWidth: "100%", marginTop: "10px" }}
              />
            )}
          </div>
          <div className="button-container">
            <button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Pet"}
            </button>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default AddPet;
>>>>>>> myrepo/main
