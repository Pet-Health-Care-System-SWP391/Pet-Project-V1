import React, { useState, useEffect } from "react";
import { auth } from "../../Components/firebase/firebase";
import { useNavigate } from "react-router-dom";
import { updateProfile } from "firebase/auth";
import { getDatabase, ref, onValue, update } from "firebase/database";
<<<<<<< HEAD
import { ToastContainer, toast } from 'react-toastify';
import useForceUpdate from '../../hooks/useForceUpdate'
=======
import { ToastContainer, toast } from "react-toastify";
>>>>>>> myrepo/main

function Update() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [accountBalance, setAccountBalance] = useState("");
  const [userId, setUserId] = useState("");
  const [fullname, setFullname] = useState("");
  const [loading, setLoading] = useState(true);
  const [userUpdated, setUserUpdated] = useState(false); 
  const navigate = useNavigate();
  const user = auth.currentUser;
  const forceUpdate = useForceUpdate(); // use the custom hook


  const validateEmail = (email) => {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePhone = (phone) => {
    const re = /^\d{10}$/; // Only allow 10 digits
    return re.test(phone);
  };

  useEffect(() => {
    if (user) {
      setUserId(user.uid);
      setEmail(localStorage.getItem("email") || "");
      setUsername(localStorage.getItem("username") || "");
      setPhone("");
      setAddress("");
    }
  }, [user]);

  useEffect(() => {
    if (userId) {
      const db = getDatabase();
      const userRef = ref(db, "users/" + userId);

      onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setEmail(data.email);
          setUsername(data.username);
          setPhone(data.phone);
          setAddress(data.address);
          setFullname(data.fullname);
          setAccountBalance(data.accountBalance);
        }
        setLoading(false);
      });
    }
  }, [userId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    const updates = {};
    if (!validateEmail(email)) {
      updates.email = email;
      localStorage.setItem("email", email);
    }
    if (username) {
      updates.username = username;
      localStorage.setItem("username", username);
    }
    if (accountBalance) {
      updates.accountBalance = accountBalance;
      localStorage.setItem("accountBalance", accountBalance);
    }
    if (!validatePhone(phone)) {
      updates.phone = phone;
    }
    if (address) {
      updates.address = address;
    }
    if (fullname) {
      updates.fullname = fullname;
    }

    if (Object.keys(updates).length > 0) {
      const user = auth.currentUser;
      if (user) {
        try {
          await updateProfile(user, {
            displayName: username,
            phone: phone,
            address: address,
            fullname: fullname,
          });

          await update(ref(getDatabase(), "users/" + userId), updates);
<<<<<<< HEAD
          setUserUpdated(true); 
          toast.success("Cập nhật thành công !!!", {
            onClose: () => {
              navigate("/account")
              forceUpdate();
            },
          });
=======
          navigate("/account");
          setUserUpdated(true); // Đánh dấu cập nhật của người dùng
          toast.success("Cập nhật thành công !!!");
>>>>>>> myrepo/main
        } catch (error) {
          toast.error("Lỗi");
        }
      }
    } else {
      toast.warning("Không có thay đổi để cập nhật");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (userUpdated) {
      setUserUpdated(false);
      setEmail(localStorage.getItem("email") || "");
      setUsername(localStorage.getItem("username") || "");
    }
  }, [userUpdated]);

  return (
<<<<<<< HEAD
    <div style={{height: "100vh"}} className="update-account-page">
=======
    <div className="update-account-page">
>>>>>>> myrepo/main
      <div className="container container-update" id="container">
        <div className="account">
          <h3 className="account-title">Update Account</h3>
          <form onSubmit={handleSubmit}>
            {/* <label>Account Balance: </label> */}
            <div className="account-balance-display">
              Account Balance: {accountBalance}
            </div>

            <div className="mid-form">
              <div className="form-row">
                <div>
                  <label>Username</label>
                  <input
                    id="username"
                    type="text"
                    autoComplete="off"
                    required
                    value={username}
                    placeholder="Enter your username"
                    onChange={(e) => {
                      setUsername(e.target.value);
                    }}
                    disabled
                    className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:indigo-600 shadow-sm rounded-lg transition duration-300"
                  />
                </div>
                <div>
                  <label>Full Name</label>
                  <input
                    id="fullname"
                    type="fullname"
                    autoComplete="off"
                    value={fullname}
                    placeholder="Enter your full name"
                    onChange={(e) => {
                      setFullname(e.target.value);
                    }}
                    className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:indigo-600 shadow-sm rounded-lg transition duration-300"
                  />
                </div>
              </div>
              <div className="form-row">
                <div>
                  <label>Email</label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="off"
                    value={email}
                    placeholder="Enter your email"
                    onChange={(e) => {
                      setEmail(e.target.value);
                    }}
                    className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:indigo-600 shadow-sm rounded-lg transition duration-300"
                    disabled
                  />
                </div>
                <div>
                  <label>Phone</label>
                  <input
                    id="phone"
                    type="phone"
                    autoComplete="off"
                    value={phone}
                    placeholder="Enter your phone"
                    onChange={(e) => {
                      setPhone(e.target.value);
                    }}
                    className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:indigo-600 shadow-sm rounded-lg transition duration-300"
                  />
                </div>
              </div>
            </div>
            <label>Address</label>
            <input
              id="address"
              type="address"
              autoComplete="off"
              value={address}
              placeholder="Enter your address"
              onChange={(e) => {
                setAddress(e.target.value);
              }}
              className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:indigo-600 shadow-sm rounded-lg transition duration-300"
            />
            <div className="update-button-container">
              <button
                type="submit"
                className="update-button"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Update;
