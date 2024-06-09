import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";

const useUserData = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        setUserData(userDocSnap.data());
      } else {
        console.log("User data not found");
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  return { userData, loading };
};

export default useUserData;
