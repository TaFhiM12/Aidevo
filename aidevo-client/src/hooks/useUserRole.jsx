import { useState, useEffect } from "react";
import useAuth from "./useAuth";
import { useUserContext } from "../context/UserContext";
import API from "../utils/api";

const useUserRole = () => {
  const { user } = useAuth();
  const { globalUserInfo, updateGlobalUserInfo, userUpdateKey } = useUserContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user?.email) {
        setLoading(false);
        return;
      }

      if (globalUserInfo && globalUserInfo.email === user.email) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await API.get(
          `/users/role/${encodeURIComponent(user.email)}`
        );

        updateGlobalUserInfo(res.data);
      } catch (err) {
        console.error("Error fetching user role:", err);
        setError(err);
        updateGlobalUserInfo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user?.email, userUpdateKey]);

  const refetch = () => {
    setLoading(true);
    updateGlobalUserInfo(null);
  };

  return {
    userInfo: globalUserInfo,
    loading,
    error,
    refetch,
  };
};

export default useUserRole;