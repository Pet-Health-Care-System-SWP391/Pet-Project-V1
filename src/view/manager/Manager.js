import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { auth } from "../../Components/firebase/firebase";
import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from "firebase/database";
import { ScaleLoader } from 'react-spinners';
import { css } from "@emotion/react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Manager = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const override = css`
    display: block;
    margin: 0 auto;
    border-color: red; 
  `;

  const Loading = () => {
    return
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const db = getDatabase();
        const userRef = ref(db, 'users/' + user.uid);

        onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          if (data.role === "user") {
            toast.error("You cant entry to this site!")
            navigate("/");
          } else if (data.role === "admin") {
            toast.error("You cant entry to this site!")
            navigate("/admin");
          } else if (data.role === "veterinary") {
            toast.error("You cant entry to this site!")
            navigate("/veterinary");
          }
          else {
            setUser(user);
            const usersRef = ref(db, 'users');
            const unsubscribeUsers = onValue(usersRef, (snapshot) => {
              const usersData = snapshot.val();
              if (usersData) {
                const userList = Object.entries(usersData).map(([uid, userData]) => ({
                  uid,
                  ...userData
                }));
                const veterinarianUsers = userList.filter(user => user.role === 'veterinarian');
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
    return <Loading />;
  }

  return (
    <div className="parent-container">
        {user ? (
          <div className="user-list">
            <h1>Veterinarian Management</h1>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Id</th>
                    <th>Name</th>
                    <th>Specialization</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={user.uid}>
                      <td>{index + 1}</td>
                      <td>{user.uid}</td>
                      <td>{user.username}</td>
                      <td>{user.specialization}</td>
                      <td style={{ backgroundColor: user.status === 'Busy' ? 'red' : 'green' }}>
                  {user.status}
                </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <h1>Please log in to manage users.</h1>
        )}
    </div>
  );
};

export default Manager;
