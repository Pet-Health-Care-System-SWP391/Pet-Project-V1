import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

import { CssBaseline, ThemeProvider } from "@mui/material";
import "react-toastify/dist/ReactToastify.css";
import { ColorModeContext, useMode } from "../../theme";
import { getDatabase, ref, onValue } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import Topbar from "../../view/scenes/admin-scenes/global/Topbar";
import Sidebar from "../../view/scenes/admin-scenes/global/Sidebar";
import Dashboard from "../../view/scenes/admin-scenes/dashboard/index";
import Team from "../../view/scenes/admin-scenes/team/index";
import Bar from "../../view/scenes/admin-scenes/bar/index";
import Form from "../../view/scenes/admin-scenes/form/index";
import Line from "../../view/scenes/admin-scenes/line/index";
import Pie from "../../view/scenes/admin-scenes/pie/index";
import Service from "../../view/scenes/admin-scenes/services/index";
import Calendar from "../../view/scenes/admin-scenes/calendar/calendar";
import { auth } from "../../Components/firebase/firebase";

function Admin() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const db = getDatabase();
        const userRef = ref(db, "users/" + user.uid);

        onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          if (data.role === "user") {
            toast.error("You can't access this site!");
            navigate("/");
          } else if (data.role === "manager") {
            toast.error("You can't access this site!");
            navigate("/manager");
          } else if (data.role === "veterinary") {
            toast.error("You can't access this site!");
            navigate("/veterinary");
          } else {
            setUser(user);
            setUserRole(data.role);
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
    return;
  }

  if (!user || !userRole) {
    return <Navigate to="/signIn" />;
  }

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ToastContainer />
        <div className="app">
          <Sidebar isSidebar={isSidebar} />
          <main className="content">
            <Topbar setIsSidebar={setIsSidebar} />
            <Routes>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="team" element={<Team />} />
              <Route path="addService" element={<Service />} />
              <Route path="form" element={<Form />} />
              <Route path="bar" element={<Bar />} />
              <Route path="pie" element={<Pie />} />
              <Route path="line" element={<Line />} />
              <Route path="calendar" element={<Calendar />} />
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default Admin;
