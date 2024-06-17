import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { toast } from "react-toastify";
import { getDatabase, ref, onValue, off } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import { ColorModeContext, useMode } from "../../theme";
import Topbar from "../../view/scenes/global/Topbar";
import Sidebar from "../../view/scenes/global/Sidebar";
import Dashboard from "../../view/scenes/dashboard/index";
import Team from "../../view/scenes/team/index";
import Invoices from "../../view/scenes/invoices/index";
import Contacts from "../../view/scenes/contacts/index";
import Bar from "../../view/scenes/bar/index";
import Form from "../../view/scenes/form/index";
import Line from "../../view/scenes/line/index";
import Pie from "../../view/scenes/pie/index";
import FAQ from "../../view/scenes/faq/index";
import Geography from "../../view/scenes/geography/index";
import Calendar from "../../view/scenes/calendar/calendar";

function Admin() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  const [loading, setLoading] = useState(true); // Added loading state
  const [users, setUsers] = useState("");
  const [user, setUser] = useState("");
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const db = getDatabase();
        const userRef = ref(db, "users/" + user.uid);

        onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          if (data.role === "user") {
            toast.error("You cant entry to this site!");
            navigate("/"); // Redirect user role to home page
          } else if (data.role === "veterinary") {
            toast.error("You cant entry to this site!");
            navigate("/veterinary");
          } else if (data.role === "manager") {
            toast.error("You cant entry to this site!");
            navigate("/manager");
          } else {
            setUser(user);
            const usersRef = ref(db, "users");
            const unsubscribeUsers = onValue(usersRef, (snapshot) => {
              const usersData = snapshot.val();
              if (usersData) {
                const userList = Object.entries(usersData).map(
                  ([uid, userData]) => ({
                    uid,
                    ...userData,
                  })
                );
                const veterinarianUsers = userList.filter(
                  (user) => user.role === "veterinarian"
                );
                setUsers(veterinarianUsers);
                setLoading(false);
              } else {
                setUsers([]);
                setLoading(false);
              }
            });
            return () => unsubscribeUsers();
          }
        });
      } else {
        setUser(null);
        setUsers([]);
        setLoading(false);
        navigate("/signIn");
      }
    });

    return () => unsubscribe();
  }, [navigate]);
  if (loading) {
    // Show loading indicator or nothing until loading is complete
    return;
  }

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          <Sidebar isSidebar={isSidebar} />
          <main className="content">
            <Topbar setIsSidebar={setIsSidebar} />
            <Routes>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="team" element={<Team />} />
              <Route path="contacts" element={<Contacts />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="form" element={<Form />} />
              <Route path="bar" element={<Bar />} />
              <Route path="pie" element={<Pie />} />
              <Route path="line" element={<Line />} />
              <Route path="faq" element={<FAQ />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="geography" element={<Geography />} />
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default Admin;
