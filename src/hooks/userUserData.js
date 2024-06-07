import { useState, useEffect } from "react";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";

const useUserData = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserData(userDocSnap.data());
        }
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return { userData, loading };
};

export default useUserData;
