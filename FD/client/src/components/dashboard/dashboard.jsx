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
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <Sidebar />
      <main className="ms-250 pt-5 mt-4">
        <div className="container-fluid">
          <div className="content-area">
            <h1>Welcome Back, {userName || "User"}!</h1>
            <p>Welcome to your Brilliant Bank overview.</p>

            <div className="disputes-section">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Your Disputes ({disputes.length})</h2>
              </div>

              <Row className="mt-4">
                {disputes.map((dispute) => (
                  <DisputeCard
                    key={dispute._id}
                    dispute={dispute}
                    onClick={() => handleDisputeClick(dispute)}
                  />
                ))}
              </Row>

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
  );
}

export default Dashboard;