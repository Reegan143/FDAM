import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../components/utils/axiosInstance';

export function useUser(token) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    if (!token) {
      setSessionExpired(true);
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        const res = await API.user.get("/user/me");
        if (res.data) {
          setUserName(res.data.userName);
        } else {
          setSessionExpired(true);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        if (error.response?.status === 401) {
          setSessionExpired(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token, navigate]);

  const handleSessionExpired = () => {
    setSessionExpired(false);
    navigate("/login");
  };

  return { loading, userName, sessionExpired, handleSessionExpired };
}