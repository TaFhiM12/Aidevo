import { useState, useEffect } from 'react';
import useAuth from './useAuth';
import axios from 'axios';

const useUserRole = () => {
  const { user } = useAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true); // Changed from isLoading to loading
  const [error, setError] = useState(null);

  const fetchUserRole = async () => {
    if (!user?.email) {
      setUserInfo(null);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await axios.get(`http://localhost:3000/users/role/${user.email}`);
      setUserInfo(res.data);
    } catch (err) {
      setError(err);
      console.error('Error fetching user role:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRole();
  }, [user?.email]);

  const refetch = () => {
    fetchUserRole();
  };

  return { userInfo, loading, error, refetch }; // Changed from isLoading to loading
};

export default useUserRole;