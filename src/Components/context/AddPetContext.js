import React, { createContext, useState } from "react";

export const AddPetContext = createContext();

export const PetProvider = ({ children }) => {
  const [petData, setPetData] = useState({
    name: "",
    age: "",
    type: "Dog", // Default to dog
    size: "",
    color: "",
    vaccinated: "",
    imageUrl: "",
    dob: "",
  });
 
  const updatePetData = (key, value) => {
    setPetData((prevData) => ({ ...prevData, [key]: value }));
  };

  const clearPetData = () => {
    setPetData({
      name: "",
      age: "",
      type: "Dog", // Reset to default type
      size: "",
      color: "",
      vaccinated: "",
      imageUrl: "",
      dob: "",
    });
  };

  return (
    <AddPetContext.Provider
      value={{ petData, setPetData, updatePetData, clearPetData }}
    >
      {children}
    </AddPetContext.Provider>
  );
};
