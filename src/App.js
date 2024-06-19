import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { TransactionProvider } from "./Components/context/TransactionContext";
import MainContent from "./MainContent";
import "./App.css";
import { BookingProvider } from "./Components/context/BookingContext";
import { PetProvider } from "./Components/context/AddPetContext";


function App() {
  return (
    <TransactionProvider>
      <Router>
        <BookingProvider>
          <PetProvider>
            <div id="root">
              <MainContent />
              <ToastContainer
                transition={Slide}
                autoClose={1500}
                newestOnTop={true} 
                pauseOnHover={true}
                pauseOnFocusLoss={false}
                limit={5}
              />
            </div>
          </PetProvider>
        </BookingProvider>
      </Router>
    </TransactionProvider>
  );
}

export default App;
