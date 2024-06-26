<<<<<<< HEAD
import React, { useState, useEffect } from "react";
import { auth, provider, database } from "../firebase/firebase"; // Assuming config file with Firebase settings
import { doCreateUserWithEmailAndPassword } from "../firebase/auth";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import Home from "../../view/partials/Home";
import { useNavigate } from "react-router-dom";
import {
  fetchSignInMethodsForEmail,
  updateProfile,
  sendEmailVerification,
  onAuthStateChanged,
} from "firebase/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getDatabase,
  ref,
  set,
  onValue,
  get,
  update,
  child,
} from "firebase/database";
import useForceUpdate from "../../hooks/useForceUpdate";
import ReCAPTCHA from "react-google-recaptcha";

function SignIn() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userEmail, setUserEmail] = useState(null); // Track logged-in user email
  const [error, setError] = useState(null); // Store error messages
  const [confirmPassword, setconfirmPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const navigate = useNavigate();
  const forceUpdate = useForceUpdate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigate("/"); // Redirect to home page if user is already logged in
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  function addDataBase(userId, email, name, role) {
    const db = getDatabase();
    set(
      ref(db, "users/" + userId),
      {
        email: email,
        username: name,
        role: role,
        isVerified: false,
      },
      function (error) {
        if (error) {
          alert("Lỗi");
        } else {
          alert("Thành Công !!!");
        }
      }
    );
  }

  const onChange = (value) => {
    setIsCaptchaVerified(!!value);
  };

  const handleGoogleLogin = async () => {
    try {
      const data = await signInWithPopup(auth, provider);
      const user = data.user;
  
      // Get the creation time from the user's metadata
      const creationTime = user.metadata.creationTime;
  
      const userEmail = user.email;
      const userNamePart = userEmail.split("@")[0];
      const userName = "gg" + userNamePart;
      const userId = user.uid;
      const db = getDatabase();
      const userRef = ref(db, "users/" + userId);
      let userRole = "user";
  
      // Fetch user data from Firebase
      const userDataSnapshot = await new Promise((resolve) => {
        onValue(userRef, (snapshot) => {
          resolve(snapshot);
        });
      });
  
      const userData = userDataSnapshot.val();
      let accountStatus = "enable";
      // If user does not exist in the database, add the user
      if (!userData) {
        await set(userRef, {
          email: userEmail,
          username: userName,
          role: userRole,
          isVerified: true,
          accountBalance: 0,
          accountStatus: accountStatus,
          creationTime: creationTime, // Add the creation time here
        });
      } else {
        userRole = userData.role || "user";
        const accountBalance = userData.accountBalance || 0;
        await set(userRef, {
          ...userData,
          email: userEmail,
          username: userName,
          role: userRole,
          isVerified: true,
          accountBalance: accountBalance,
          accountStatus: userData.accountStatus || accountStatus,
          creationTime: userData.creationTime || creationTime, // Add the creation time here
        });
      }
  
      if (userData && userData.accountBalance === undefined) {
        await update(userRef, {
          accountBalance: 0,
        });
      }
  
      switch (userRole) {
        case "user":
          navigate("/");
          break;
        case "veterinarian":
          navigate("/veterinarian");
          break;
        case "manager":
          navigate("/manager");
          break;
        case "admin":
          navigate("/admin/dashboard");
          break;
        default:
          navigate("/");
      }
      toast.success("Login successfully. Wish you enjoy our best experience", {
        autoClose: 2000,
        onClose: () => {
          forceUpdate();
        },
      });
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      toast.error("Failed to sign in with Google. Please try again.", {
        autoClose: 2000,
        onClose: () => {
          forceUpdate();
        },
      });
    }
  };
  
  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Password not match, please try again!", {
        autoClose: 2000,
        onClose: () => {
          forceUpdate();
        },
      });
      return;
    }

    const username = email.split("@")[0];

    const expression = /^[^@]+@\w+(\.\w+)+\w$/;
    if (!expression.test(email)) {
      toast.error("Email is invalid. Please enter a valid email address.", {
        autoClose: 2000,
        onClose: () => {
          forceUpdate();
        },
      });
      return;
    }

    const signInMethods = await fetchSignInMethodsForEmail(auth, email);
    if (signInMethods.length > 0) {
      setIsRegistering(false);
      toast.error("This email is used by another user, please try again!", {
        autoClose: 2000,
        onClose: () => {
          forceUpdate();
        },
      });
      return;
    }
    if (!isCaptchaVerified) {
      alert("Please complete the captcha before submitting the form.");
      return;
    }

    if (!isRegistering) {
      setIsRegistering(true);
      try {
        const userCredential = await doCreateUserWithEmailAndPassword(
          email,
          password
        );
        const user = userCredential.user;
        const userId = userCredential.user.uid;
        await sendEmailVerification(user);
        await updateProfile(user, {
          displayName: username,
          role: "user",
          isVerified: false,
          accountBalance: 0,
        });
        addDataBase(userId, email, username, "user");
        await auth.signOut();
        toast.success(
          "Registration successful. Please check your email for verification then login to our system again.",
          {
            autoClose: 2000,
            onClose: () => {
              setTimeout(() => {
                forceUpdate();
                navigate("/signIn");
              }, 2000);
            },
          }
        );
      } catch (error) {
        toast.error("This email is used by another user, please try again!", {
          autoClose: 2000,
          onClose: () => {
            forceUpdate();
          },
        });
      } finally {
        setIsRegistering(false);
      }
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "email") {
      setEmail(value);
    } else if (name === "password") {
      setPassword(value);
    } else if (name === "username") {
      setUsername(value);
    } else if (name === "confirmPassword") {
      setconfirmPassword(value);
    }
  };

  const handleEmailLogin = async (event) => {
    event.preventDefault();
    setError(null);

    if (!isCaptchaVerified) {
      toast.error("Please complete the captcha before submitting the form.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      if (!user.emailVerified) {
        toast.error("Please verify your email before logging in.", {
          autoClose: 2000,
          onClose: () => {
            forceUpdate();
          },
        });
        auth.signOut();
        navigate("/signIn");
        return;
      }
      const userEmail = user.email;
      setUserEmail(userEmail);
      localStorage.setItem("email", userEmail);
      const userId = user.uid;
      const db = getDatabase();
      const userRef = ref(db, "users/" + userId);
      let userRole = "user";
      const creationTime = user.metadata.creationTime;
      const creationTimeSnapshot = await get(child(userRef, "creationTime"));

      if (!creationTimeSnapshot.exists()) {
        // If not, store it
        await set(child(userRef, "creationTime"), creationTime);
      }

      let accountStatus = "enable";

      const userDataSnapshot = await new Promise((resolve) => {
        onValue(
          userRef,
          (snapshot) => {
            resolve(snapshot);
          },
          { onlyOnce: true }
        );
      });

      const userData = userDataSnapshot.val();

      if (!userData) {
        await set(userRef, {
          email: userEmail,
          username: user.displayName,
          role: userRole,
          isVerified: true,
          accountBalance: 0,
          accountStatus: accountStatus,
        });
      } else {
        userRole = userData.role || "user";
        if (userData.accountBalance === undefined) {
          await update(userRef, {
            accountBalance: 0,
          });
        }

        await update(userRef, {
          username: user.displayName,
          role: userRole,
          isVerified: userData.isVerified,
          accountStatus: userData.accountStatus || accountStatus,
        });
      }

      const petRef = ref(db, "users/" + userId + "/pets");
      const pets = await new Promise((resolve) => {
        onValue(
          petRef,
          (snapshot) => {
            const petData = snapshot.val();
            resolve(petData ? Object.values(petData) : []);
          },
          { onlyOnce: true }
        );
      });

      // Lưu dữ liệu thú cưng vào state hoặc localStorage nếu cần
      localStorage.setItem("pets", JSON.stringify(pets));

      switch (userRole) {
        case "user":
          navigate("/");
          break;
        case "veterinarian":
          navigate("/veterinarian");
          break;
        case "manager":
          navigate("/manager");
          break;
        case "admin":
          navigate("/admin/dashboard");
          break;
        default:
          navigate("/");
      }
      toast.success("Login successfully. Wish you enjoy our best experience", {
        autoClose: 2000,
        onClose: () => {
          forceUpdate();
        },
      });
    } catch (error) {
      toast.error(
        "Something went wrong. Please check your email or password and try again!",
        {
          autoClose: 2000,
          onClose: () => {
            forceUpdate();
          },
        }
      );
    }
  };

  const handleClickButtonReg = async () => {
    const container = document.getElementById("container");
    container.classList.add("active");
  };
  const handleClickButtonLog = async () => {
    const container = document.getElementById("container");
    container.classList.remove("active");
  };

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    setUserEmail(storedEmail);
  }, []);

  useEffect(() => {
    const updateUserVerificationStatus = async (user) => {
      if (user && user.emailVerified) {
        const userRef = ref(database, "users/" + user.uid);
        await update(userRef, { isVerified: true });
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        updateUserVerificationStatus(user);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      {!userEmail && (
        <div className="signIn" style={{ height: "100vh" }}>
          <div className="container form" id="container">
            <div className="form-container sign-up">
              <form onSubmit={onSubmit}>
                <h1>Create Account</h1>
                <div className="social-icons">
                  <button type="button" onClick={handleGoogleLogin}>
                    Login with Google
                  </button>
                </div>
                <span>or use your email for registeration</span>
                <input
                  id="email"
                  type="email"
                  autoComplete="off"
                  required
                  value={email}
                  placeholder="Input your email"
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:indigo-600 shadow-sm rounded-lg transition duration-300"
                />
                <input
                  id="password"
                  disabled={isRegistering}
                  placeholder="Input your password"
                  type="password"
                  autoComplete="off"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                  className="mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg transition duration-300"
                />
                <div>
                  <label className="text-sm text-gray-600 font-bold">
                    Confirm Password
                  </label>
                  <input
                    disabled={isRegistering}
                    type="password"
                    placeholder="Confirm your password"
                    autoComplete="off"
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setconfirmPassword(e.target.value);
                    }}
                    className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg transition duration-300"
                  />
                </div>
                <ReCAPTCHA
                  sitekey="6LfjlPcpAAAAAPLRaxVhKzYI4OYR2mBW_wv6LZwW"
                  onChange={onChange}
                />
                <button
                  type="submit"
                  disabled={isRegistering}
                  className={`px-4 py-2 text-white font-medium rounded-lg ${
                    isRegistering
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl transition duration-300"
                  }`}
                >
                  {isRegistering ? "Signing Up..." : "Sign Up"}
                </button>
              </form>
            </div>
            <div class="form-container sign-in">
              <form onSubmit={handleEmailLogin}>
                <h1>Sign In</h1>
                <div className="social-icons">
                  <button type="button" onClick={handleGoogleLogin}>
                    Login with Google
                  </button>
                </div>
                <span>or use your email password</span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Input your email"
                  value={email}
                  onChange={handleChange}
                  required
                />
                <input
                  type="password"
                  placeholder="Input your password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={handleChange}
                  required
                />
                <a href="/reset">Forget Your Password?</a>
                <ReCAPTCHA
                  sitekey="6LfjlPcpAAAAAPLRaxVhKzYI4OYR2mBW_wv6LZwW"
                  onChange={onChange}
                />
                <button>Sign In</button>
              </form>
            </div>
            <div className="toggle-container">
              <div className="toggle">
                <div className="toggle-panel toggle-left">
                  <h1>Welcome Back!</h1>
                  <p>Enter your personal details to use all of site features</p>
                  <button
                    className="hidden"
                    id="login"
                    onClick={handleClickButtonLog}
                  >
                    Sign In
                  </button>
                </div>
                <div className="toggle-panel toggle-right">
                  <h1>Hello, Friend!</h1>
                  <p>
                    Register with your personal details to use all of site
                    features
                  </p>
                  <button
                    className="hidden"
                    id="register"
                    onClick={handleClickButtonReg}
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
        <ToastContainer />
      {userEmail && <Home />}
    </div>
  );
}

export default SignIn;
=======
import React, { useState, useEffect } from "react";
import { auth, provider, database } from "../firebase/firebase"; // Assuming config file with Firebase settings
import { doCreateUserWithEmailAndPassword } from "../firebase/auth";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import Home from "../../view/partials/Home";
import { useNavigate } from "react-router-dom";
import {
  fetchSignInMethodsForEmail,
  updateProfile,
  sendEmailVerification,
  onAuthStateChanged,
} from "firebase/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getDatabase, ref, set, onValue, get, update } from "firebase/database";

function SignIn() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userEmail, setUserEmail] = useState(null); // Track logged-in user email
  const [error, setError] = useState(null); // Store error messages
  const [confirmPassword, setconfirmPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigate("/"); // Redirect to home page if user is already logged in
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  function addDataBase(userId, email, name, role) {
    const db = getDatabase();
    set(
      ref(db, "users/" + userId),
      {
        email: email,
        username: name,
        role: role,
        isVerified: false,
      },
      function (error) {
        if (error) {
          alert("Lỗi");
        } else {
          alert("Thành Công !!!");
        }
      }
    );
  }

  const handleGoogleLogin = async () => {
    try {
      const data = await signInWithPopup(auth, provider);
      const userEmail = data.user.email;
      const userNamePart = userEmail.split("@")[0];
      const userName = "gg" + userNamePart;
      const userId = data.user.uid;
      const db = getDatabase();
      const userRef = ref(db, "users/" + userId);
      let userRole = "user";
      console.log("User Email:", userEmail);
      console.log("Generated Username:", userName);
      console.log("User ID:", userId);
      // Kiểm tra và lấy dữ liệu người dùng từ Firebase
      const userDataSnapshot = await new Promise((resolve) => {
        onValue(userRef, (snapshot) => {
          resolve(snapshot);
        });
      });

      const userData = userDataSnapshot.val();
      console.log("User Data from Firebase:", userData);
      // Nếu người dùng chưa tồn tại trong cơ sở dữ liệu, thêm người dùng
      if (!userData) {
        await set(userRef, {
          email: userEmail,
          username: userName,
          role: userRole,
          isVerified: true,
          accountBalance: 0,
        });
      } else {
        userRole = userData.role || "user";
        await set(userRef, {
          ...userData,
          username: userName,
          role: userRole,
          isVerified: true,
          accountBalance: 0,
        });
      }

      // Đọc dữ liệu thú cưng của người dùng từ Firebase sau khi đăng nhập thành công
      const petRef = ref(db, "users/" + userId + "/pets");
      const pets = await new Promise((resolve) => {
        onValue(petRef, (snapshot) => {
          const petData = snapshot.val();
          resolve(petData ? Object.values(petData) : []);
        });
      });

      // Lưu dữ liệu thú cưng vào state hoặc localStorage nếu cần
      localStorage.setItem("pets", JSON.stringify(pets));

      // Điều hướng dựa trên vai trò của người dùng
      switch (userRole) {
        case "user":
          navigate("/");
          break;
        case "veterinarian":
          navigate("/veterinarian");
          break;
        case "manager":
          navigate("/manager");
          break;
        case "admin":
          navigate("/admin/dashboard");
          break;
        default:
          navigate("/");
      }

      toast.success("Login successfully. Wish you enjoy our best experience");
    } catch (error) {
      setError(error.message);
      toast.error("Login failed. Please try again.");
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Password not match, please try again!");
      return; // Prevent form submission
    }

    const username = email.split("@")[0];

    const expression = /^[^@]+@\w+(\.\w+)+\w$/;
    if (!expression.test(email)) {
      toast.error("Email is invalid. Please enter a valid email address.");
      return; // Prevent form submission
    }

    const signInMethods = await fetchSignInMethodsForEmail(auth, email);
    if (signInMethods.length > 0) {
      setIsRegistering(false); // Allow user to edit registration info
      toast.error("This email is used by another user, please try again!");
      return; // Prevent form submission
    }

    if (!isRegistering) {
      setIsRegistering(true);
      try {
        const userCredential = await doCreateUserWithEmailAndPassword(
          email,
          password
        );
        const user = userCredential.user;
        const userId = userCredential.user.uid; // Use userCredential.user.uid for unique identifier
        await sendEmailVerification(user);
        await updateProfile(user, {
          displayName: username,
          role: "user",
          isVerified: false,
          accountBalance: 0,
        });
        addDataBase(userId, email, username, "user"); // Omit password from user data
        await auth.signOut();
        navigate("/"); // Redirect to home page
        toast.success(
          "Registration successful. Please check your email for verification then login to our system again."
        );
      } catch (error) {
        // Handle Firebase errors (e.g., weak password)
        toast.error("This email is used by another user, please try again!");
      } finally {
        setIsRegistering(false); // Allow user to edit registration info
      }
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "email") {
      setEmail(value);
    } else if (name === "password") {
      setPassword(value);
    } else if (name === "username") {
      setUsername(value);
    } else if (name === "confirmPassword") {
      setconfirmPassword(value);
    }
  };

  const handleEmailLogin = async (event) => {
    event.preventDefault(); // Ngăn hành vi mặc định của biểu mẫu
    setError(null); // Xóa các lỗi trước đó

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      if (!user.emailVerified) {
        toast.error("Please verify your email before logging in.");
        auth.signOut();
        return;
      }
      const userEmail = user.email;
      setUserEmail(userEmail);
      localStorage.setItem("email", userEmail); // Xem xét việc lưu trữ an toàn trong sản xuất
      const userId = user.uid;
      const db = getDatabase();
      const userRef = ref(db, "users/" + userId);
      let userRole = "user";

      // Kiểm tra và lấy dữ liệu người dùng từ Firebase
      const userDataSnapshot = await new Promise((resolve) => {
        onValue(
          userRef,
          (snapshot) => {
            resolve(snapshot);
          },
          { onlyOnce: true }
        );
      });

      const userData = userDataSnapshot.val();
      console.log("User Data from Firebase:", userData);

      if (!userData) {
        await set(userRef, {
          email: userEmail,
          username: user.displayName,
          role: userRole,
          isVerified: true,
          accountBalance: 0, // Thiết lập accountBalance mặc định là 0 nếu người dùng không tồn tại
        });
      } else {
        userRole = userData.role || "user";
        // Chỉ cập nhật accountBalance nếu nó chưa tồn tại
        if (userData.accountBalance === undefined) {
          await update(userRef, {
            accountBalance: 0,
          });
        }
        // Cập nhật các trường khác mà không làm thay đổi accountBalance
        await update(userRef, {
          username: user.displayName,
          role: userRole,
          isVerified: userData.isVerified,
        });
      }

      const petRef = ref(db, "users/" + userId + "/pets");
      const pets = await new Promise((resolve) => {
        onValue(
          petRef,
          (snapshot) => {
            const petData = snapshot.val();
            resolve(petData ? Object.values(petData) : []);
          },
          { onlyOnce: true }
        );
      });

      // Lưu dữ liệu thú cưng vào state hoặc localStorage nếu cần
      localStorage.setItem("pets", JSON.stringify(pets));

      switch (userRole) {
        case "user":
          navigate("/");
          break;
        case "veterinarian":
          navigate("/veterinarian");
          break;
        case "manager":
          navigate("/manager");
          break;
        case "admin":
          navigate("/admin/dashboard");
          break;
        default:
          navigate("/");
      }
      toast.success("Login successfully. Wish you enjoy our best experience");
    } catch (error) {
      toast.error(
        "Something went wrong. Please check your email or password and try again!"
      );
    }
  };

  const handleClickButtonReg = async () => {
    const container = document.getElementById("container");
    container.classList.add("active");
  };
  const handleClickButtonLog = async () => {
    const container = document.getElementById("container");
    container.classList.remove("active");
  };

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    setUserEmail(storedEmail);
  }, []); // Empty dependency array ensures it runs only once

  useEffect(() => {
    const updateUserVerificationStatus = async (user) => {
      if (user && user.emailVerified) {
        const userRef = ref(database, "users/" + user.uid);
        await update(userRef, { isVerified: true });
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        updateUserVerificationStatus(user);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      {!userEmail && ( // Only show login options if not logged in
        <>
          <div className="signin-form">
            <div className="container form" id="signin-container">
              <div className="form-container sign-up">
                <form onSubmit={onSubmit}>
                  <h1>Create Account</h1>
                  <div className="social-icons">
                    <button type="button" onClick={handleGoogleLogin}>
                      Login with Google
                    </button>
                  </div>
                  <span>or use your email for registeration</span>
                  <input
                    id="email"
                    type="email"
                    autoComplete="off"
                    required
                    value={email}
                    placeholder="Input your email"
                    onChange={(e) => {
                      setEmail(e.target.value);
                    }}
                    className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:indigo-600 shadow-sm rounded-lg transition duration-300"
                  />
                  <input
                    id="password"
                    disabled={isRegistering}
                    placeholder="Input your password"
                    type="password"
                    autoComplete="off"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                    }}
                    className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg transition duration-300"
                  />
                  <div>
                    <label className="text-sm text-gray-600 font-bold">
                      Confirm Password
                    </label>
                    <input
                      disabled={isRegistering}
                      type="password"
                      placeholder="Confirm your password"
                      autoComplete="off"
                      required
                      value={confirmPassword}
                      onChange={(e) => {
                        setconfirmPassword(e.target.value);
                      }}
                      className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg transition duration-300"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isRegistering}
                    className={`w-full px-4 py-2 text-white font-medium rounded-lg ${
                      isRegistering
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl transition duration-300"
                    }`}
                  >
                    {isRegistering ? "Signing Up..." : "Sign Up"}
                  </button>
                </form>
              </div>
              <div class="form-container sign-in">
                <form onSubmit={handleEmailLogin}>
                  <h1>Sign In</h1>
                  <div className="social-icons">
                    <button type="button" onClick={handleGoogleLogin}>
                      Login with Google
                    </button>
                  </div>
                  <span>or use your email password</span>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Input your email"
                    value={email}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="password"
                    placeholder="Input your password"
                    id="password"
                    name="password"
                    value={password}
                    onChange={handleChange}
                    required
                  />
                  <a href="/reset">Forget Your Password?</a>
                  <button>Sign In</button>
                </form>
              </div>
              <div className="toggle-container">
                <div className="toggle">
                  <div className="toggle-panel toggle-left">
                    <h1>Welcome Back!</h1>
                    <p>
                      Enter your personal details to use all of site features
                    </p>
                    <button
                      className="hidden"
                      id="login"
                      onClick={handleClickButtonLog}
                    >
                      Sign In
                    </button>
                  </div>
                  <div className="toggle-panel toggle-right">
                    <h1>Hello, Friend!</h1>
                    <p>
                      Register with your personal details to use all of site
                      features
                    </p>
                    <button
                      className="hidden"
                      id="register"
                      onClick={handleClickButtonReg}
                    >
                      Sign Up
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {userEmail && <Home />} {/* Render Home if user is logged in */}
    </div>
  );
}

export default SignIn;
>>>>>>> myrepo/main
