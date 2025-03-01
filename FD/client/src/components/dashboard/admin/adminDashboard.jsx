import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../sideBar/adminSidebar';
import Header from '../header/header';
import DisputeModal from './adminDisputeModal';
import { getStatusColor } from './disputeStatus';
import API, { setAuthToken } from "../../utils/axiosInstance";
import AuthContext from '../../context/authContext';
import { sortDisputes, filterDisputesByName } from '../../utils/sortDisputes';
import { ModalAnimationStyles } from '../../utils/statusStyles';
import TransactionView from '../../transaction/transactionView';
import DisputeList from './disputeList';
import SessionExpiredModal from '../../modals/sessionExpiredModal';

function AdminDashboard() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [disputes, setDisputes] = useState([]);
  const [adminData, setAdminData] = useState(null);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('date_asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [remarks, setRemarks] = useState('');
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [transactionData, setTransactionData] = useState(null);
  const [modalAnimation, setModalAnimation] = useState('slide-up');

  useEffect(() => {
    if (token) {
      setAuthToken(() => token);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setSessionExpired(true);
      navigate('/login');
      return;
    }

    const fetchAdminData = async () => {
      try {
        const res = await API.admin.get("/admin/me");
        if (res.data) {
          setAdminData(res.data);
        } else {
          setSessionExpired(true);
        }
      } catch (error) {
        if (error.response?.status === 401) {
          setSessionExpired(true);
        }
        console.error("Error fetching admin data:", error);
      }
    };

    fetchAdminData();
    fetchAllDisputes();

    const interval = setInterval(() => {
      if(token) fetchAllDisputes();
    }, 5000);

    return () => clearInterval(interval);
  }, [token, navigate]);

  const fetchAllDisputes = async () => {
    try {
      const res = await API.admin.get("/admin/disputes");
      setDisputes(res.data);
    } catch (error) {
      console.error("Error fetching disputes:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactionDetails = async (transactionId) => {
    try {
      const res = await API.admin.get(`/admin/transaction/${transactionId}`);
      setTransactionData(res.data);
      setShowTransactionDetails(true);
      setShowModal(false);
    } catch (error) {
      console.error("Error fetching transaction details:", error);
    }
  };

  const handleDisputeClick = (dispute) => {
    setSelectedDispute(dispute);
    setModalAnimation('slide-up');
    setShowModal(true);
    setShowTransactionDetails(false);
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      await API.admin.patch('/admin/dispute-status', {
        disputeId: selectedDispute._id,
        status: newStatus,
        remarks: remarks,
      });
      await fetchAllDisputes();
      handleCloseModal();
    } catch (error) {
      console.error("Error updating dispute status:", error);
    }
  };

  const handleCloseModal = () => {
    setModalAnimation('slide-down');
    setTimeout(() => {
      setShowModal(false);
      setRemarks('');
      setSelectedDispute(null);
      setModalAnimation('slide-up');
    }, 300);
  };

  const handleSessionExpired = () => {
    setSessionExpired(false);
    navigate("/login");
  };

  const handleBackToDisputes = () => {
    setShowTransactionDetails(false);
    setTransactionData(null);
  };

  const sortedDisputes = sortDisputes(disputes, sortBy);
  const filteredDisputes = filterDisputesByName(sortedDisputes, searchQuery);

  if (loading) {
    return <h2 className="text-center mt-5">Loading...</h2>;
  }

  return (
    <>
      <ModalAnimationStyles />
      <div className="d-flex flex-column min-vh-100">
        <Header />
        <AdminSidebar />
        <main className="ms-250 pt-5 mt-4">
          <div className="container-fluid">
            <div className="content-area">
              <h1>Admin Portal - {adminData?.userName || 'Admin'}!</h1>
              <p>Manage user disputes and fraud claims.</p>

              {showTransactionDetails ? (
                <TransactionView
                  transactionData={transactionData}
                  onBack={handleBackToDisputes}
                  getStatusColor={getStatusColor}
                />
              ) : (
                <DisputeList
                  disputes={filteredDisputes}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  onDisputeClick={handleDisputeClick}
                />
              )}

              <DisputeModal
                show={showModal}
                dispute={selectedDispute}
                remarks={remarks}
                setRemarks={setRemarks}
                onClose={handleCloseModal}
                onUpdateStatus={handleUpdateStatus}
                onViewTransaction={fetchTransactionDetails}
                modalAnimation={modalAnimation}
              />

              <SessionExpiredModal
                show={sessionExpired}
                onConfirm={handleSessionExpired}
              />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default AdminDashboard;
