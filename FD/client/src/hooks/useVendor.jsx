import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API, { setAuthToken } from '../components/utils/axiosInstance';
import AuthContext from '../components/context/authContext';

export function useVendor() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [vendorName, setVendorName] = useState('');
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    if (token) {
      setAuthToken(() => token);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setSessionExpired(true);
      navigate("/login");
      return;
    }

    const fetchVendorData = async () => {
      setIsPolling(true);
      try {
        if (!vendorName) {
          const res = await API.vendor.get("/vendor/me");
          if (res.data) {
            setVendorName(res.data.vendorName);
            const disputesRes = await API.utils.get(`/disputes/vendor/${res.data.vendorName}`);
            setDisputes(disputesRes.data);
          }
        } else {
          const disputesRes = await API.utils.get(`/disputes/vendor/${vendorName}`);
          setDisputes(disputesRes.data);
        }
      } catch (error) {
        if (error.response?.status === 401) {
          setSessionExpired(true);
        }
      } finally {
        setLoading(false);
        setIsPolling(false);
      }
    };

    fetchVendorData();
    const pollingInterval = setInterval(fetchVendorData, 5000);

    return () => clearInterval(pollingInterval);
  }, [token, navigate, vendorName]);

  const handleSessionExpired = () => {
    setSessionExpired(false);
    navigate("/login");
  };

  return {
    disputes,
    loading,
    isPolling,
    vendorName,
    sessionExpired,
    handleSessionExpired
  };
}
