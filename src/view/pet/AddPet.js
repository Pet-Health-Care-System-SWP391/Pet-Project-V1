
import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from 'react-router-dom'
import { AddPetContext } from "../../Components/context/AddPetContext";

const AddPet = () => {
  const [type, setType] = useState("Dog"); // Default to dog
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const { petData, setPetData } = useContext(AddPetContext);

  useEffect(() => {
    setPetData(prevData => ({ ...prevData, type }));
  }, [type]);
  

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
    navigate("/pet/add/details");
  };

  const backBtn = () => {
    navigate(-1)
  } 
  


  return (
    <div style={{ height: "100vh" }}>
      <section className="section-addpet">
        
      <div className="add-pet-container">
      <h2 className="title-addpet">Step 1: Add Your Pet</h2>
      <div className="line"></div>
      <p className="des-addpet">Choose your pet category</p>
      <div className="pet-options">
        <div
          className={`pet-option ${type === 'Cat' ? 'selected' : ''}`}
          onClick={() => setType('Cat')}
        >
          <img src="https://app.petotum.com/assets/img/icon/select-cat.png" alt="Cat" />
          <span className="checkmark">&#10003;</span>
        </div>
        <div
          className={`pet-option ${type === 'Dog' ? 'selected' : ''}`}
          onClick={() => setType('Dog')}
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