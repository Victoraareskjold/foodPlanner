import { useState, useEffect } from "react";
import useUserData from "./userUserData";

const useFamilyId = () => {
  const { userData, loading: userLoading } = useUserData();
  const [familyId, setFamilyId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userData) {
      setFamilyId(userData.familyId);
      setLoading(false);
    }
  }, [userData]);

  return { familyId, loading: userLoading || loading };
};

export default useFamilyId;
