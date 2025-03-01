import { useState, useEffect } from 'react';
import API from '../components/utils/axiosInstance';

export function useDisputes(token) {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchDisputes = async () => {
      try {
        const res = await API.utils.get("/disputes/me");
        setDisputes(res.data);
      } catch (error) {
        console.error("Error fetching disputes:", error.response?.data?.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDisputes();
    const interval = setInterval(fetchDisputes, 5000);

    return () => clearInterval(interval);
  }, [token]);

  return { disputes, loading };
}