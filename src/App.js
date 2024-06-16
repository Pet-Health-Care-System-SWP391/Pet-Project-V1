import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
<<<<<<< HEAD
import { TransactionProvider } from "./Components/context/TransactionContext";
import MainContent from "./MainContent";
import "./App.css";
import { BookingProvider } from './Components/context/BookingContext';
=======
import Header from "./view/partials/Header";
import { auth, provider } from "./Components/firebase/firebase"; // Assuming config file with Firebase settings
import Update from "./view/account/Update";
import Admin from "../src/view/admin/Admin";
import Manager from "../src/view/manager/Manager";
import Pet from "../src/view/pet/Pet";
import AddPet from "../src/view/pet/AddPet";
import Book from "../src/view/booking/Book";
import QrCodePage from "../src/view/qr/QrCodePage";
import Transaction from "../src/Components/transaction/TransactionHistory";
import { TransactionProvider } from "../src/Components/context/TransactionContext";
import ForgotPassword from "./Components/googleSignIn/ForgotPassword";
import { CircularProgress } from "@mui/material";
import Footer from "./view/partials/Footer";
import DetailedExamination from "./view/detailedExam/Detail Exam";


function MainContent() {
  const location = useLocation();
  const [currentPath, setCurrentPath] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    setCurrentPath(location.pathname);

    const handleLoading = () => {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 1500);
    };

    handleLoading();

    return () => {
      unsubscribe();
      clearTimeout(handleLoading);
    };
  }, [location.pathname]);
  return (
    <div className="App">
    {loading && (
      <div className="loading-dots">
        <div></div>
        <div></div>
        <div></div>
      </div>
    )}
    {!loading && (
      <>
        <Header user={user} currentPath={currentPath} />
        <Routes>
          <Route path="/signIn" element={<SignIn />} />
          <Route path="/" element={<Home />} />
          <Route path="/account" element={<Update user={user} />} />
          <Route path="/admin/*" element={<Admin />} />
          <Route path="/manager" element={<Manager />} />
          <Route path="/pet" element={<Pet />} />
          <Route path="/pet/add" element={<AddPet />} />
          <Route path="/book" element={<Book />} />
          <Route path="/qr" element={<QrCodePage />} />
          <Route path="/transaction-history" element={<Transaction />} />
          <Route path="/reset" element={<ForgotPassword />} />
          <Route path="/detailedExam" element={<DetailedExamination />}/>
        </Routes>
        <Footer currentPath={currentPath} />
      </>
    )}
  </div>
  );
}
>>>>>>> myrepo/main

function App() {
  return (
    <TransactionProvider>
<<<<<<< HEAD
        <Router>
      <BookingProvider>
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
      </BookingProvider>
        </Router>
=======
      <Router>
        <MainContent />
        <ToastContainer autoClose={1500} />
      </Router>
>>>>>>> myrepo/main
    </TransactionProvider>
  );
}

export default App;
