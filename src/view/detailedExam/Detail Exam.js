import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, database } from "../../Components/firebase/firebase"; // Import the correct database instance

import { ref, get } from "firebase/database";

function DetailedExamination() {
  const [username, setUsername] = useState("");
  const [usernames, setUsernames] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsername(user.displayName || user.email); // Use displayName if available, otherwise fallback to email
      } else {
        setUsername(""); // Clear username if no user is logged in
      }
    });

    return () => unsubscribe(); // Clean up the listener on unmount
  }, []);

  
  return (
    <div className="detailedExam-container">
      <div className="container container-update" id="container">
        <div className="account">
          <h3 className="account-title">Medical Record</h3>
          <div className="mid-form">
            <div className="form-row">
              <div>
                <label>Record Id: REC111</label>
              </div>
              <div>
                <label>Date: </label>
              </div>
            </div>
            <div className="form-row">
              <div>
                <label>Created at: </label>
              </div>
              <div>
                <label>Updated at: </label>
              </div>
            </div>
            <div className="form-row">
              <div>
                <label>List of user: {usernames.join(", ")}</label>
              </div>
              <div>
                <label>Vet Id: </label>
              </div>
            </div>
          </div>
          <label>Description</label>
        </div>
      </div>
    </div>
  );
}

export default DetailedExamination;
