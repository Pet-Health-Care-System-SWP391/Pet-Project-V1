import { useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { auth } from "../firebase/firebase";

const useAuth = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        const db = getDatabase();
        const userRef = ref(db, "users/" + currentUser.uid);

        onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setUser({
              ...currentUser,
              roles: data.roles || [], // assuming roles is an array in your database
            });
          } 
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return user;
};

export default useAuth;
