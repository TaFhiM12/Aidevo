import { useState, useEffect } from 'react';
import useAuth from './useAuth';
import axios from 'axios';
import { useUserContext } from '../context/UserContext';

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
      
      // Only fetch if we don't have the data or it's a different user
      if (globalUserInfo && globalUserInfo.email === user.email) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const res = await axios.get(`http://localhost:3000/users/role/${user.email}`);
        const userData = res.data;
        updateGlobalUserInfo(userData);
      } catch (err) {
        setError(err);
        console.error('Error fetching user role:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user?.email, userUpdateKey]); // Remove globalUserInfo from dependencies

  const refetch = () => {
    setLoading(true);

  };

  return { 
    userInfo: globalUserInfo, 
    loading, 
    error, 
    refetch 
  };
};

export default useUserRole;