import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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

function MainContent() {
  const location = useLocation();
  const [currentPath, setCurrentPath] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    setCurrentPath(location.pathname);

    return unsubscribe; // Clean up listener on component unmount
  },[location.pathname]);
  return (
    <div className="App">
      {/* {location.pathname === "/" && <Header user={user} />} */}
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
      </Routes>
    </div>
  );
}

function App() {
  return (
    <TransactionProvider>
      <Router>
        <MainContent />
        <ToastContainer autoClose={3000} />
      </Router>
    </TransactionProvider>
  );
}

export default App;
