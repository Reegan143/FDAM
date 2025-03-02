import React, { useState, useContext } from 'react';
import { Row } from 'react-bootstrap';
import Header from './header/header';
import Sidebar from './sideBar/sidebar';
import DisputeCard from './disputeCard';
import DisputeModal from './disputeModal';
import SessionExpiredModal from '../modals/sessionExpiredModal';
import ChatBubble from '../chatbot/ChatBubble';
import { useDisputes } from '../../hooks/userDisputes';
import { useUser } from '../../hooks/useUser';
import { AuthContext } from '../context/authContext';

function Dashboard() {
  const { token } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState(null);
  
  const { 
    loading: userLoading, 
    userName, 
    sessionExpired, 
    handleSessionExpired 
  } = useUser(token);
  
  const { 
    disputes, 
    loading: disputesLoading 
  } = useDisputes(token);

  const handleDisputeClick = (dispute) => {
    setSelectedDispute(dispute);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDispute(null);
  };

  if (userLoading || disputesLoading) {
    return <h2 className="text-center mt-5">Loading...</h2>;
  }

  return (
    <div className="d-flex flex-column vh-100">
  {/* Fixed header */}
  <div className="fixed-top">
    <Header />
  </div>
  
  {/* Content area with proper spacing */}
  <div className="d-flex flex-column flex-md-row" style={{ marginTop: "56px" }}>
    {/* Sidebar component */}
    <Sidebar />
    
    {/* Main content area */}
    <main className="flex-grow-1 p-3 p-md-4" style={{ minWidth: "0" }}>
      <div className="container-fluid px-0">
        <div className="content-area">
          <h1 className="h2 mb-2">Welcome Back, {userName}!</h1>
          <p className="mb-4">Welcome to your Brilliant Bank overview.</p>

          <div className="disputes-section">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h4">Your Disputes ({disputes.length})</h2>
            </div>

            <div className="row g-3">
              {disputes.map((dispute) => (
                <div className="col-12 col-sm-6 col-lg-4 mb-3" key={dispute._id}>
                  <DisputeCard
                    dispute={dispute}
                    onClick={() => handleDisputeClick(dispute)}
                  />
                </div>
              ))}
            </div>

            <DisputeModal
              show={showModal}
              dispute={selectedDispute}
              onClose={handleCloseModal}
            />

            <SessionExpiredModal
              show={sessionExpired}
              onConfirm={handleSessionExpired}
            />
          </div>
        </div>
      </div>
      <ChatBubble />
    </main>
  </div>
</div>
  );
}

export default Dashboard;