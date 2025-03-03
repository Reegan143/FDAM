import React, { useState} from 'react';
import { Row } from 'react-bootstrap';
import Header from '../header/header';
import VendorSidebar from '../sideBar/vendorSidebar';
import DisputeCard from './vendorDisputeCard';
import DisputeModal from './vendorDisputeModal';
import NotificationToast from './notificationToast';
import { useVendor } from '../../../hooks/useVendor';
import { useNotifications } from '../../../hooks/useNotifications';
import { ModalAnimationStyles } from '../../utils/statusStyles';
import DisputeHeader from './disputeHeader';
import SessionExpiredModal from '../../modals/sessionExpiredModal';

function VendorDashboard() {
  const { 
    disputes,
    loading,
    isPolling,
    vendorName,
    sessionExpired,
    handleSessionExpired 
  } = useVendor();

  const { notifications, addNotification } = useNotifications();
  
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [modalAnimation, setModalAnimation] = useState('slide-up');

  const handleDisputeClick = (dispute) => {
    setSelectedDispute(dispute);
    setModalAnimation('slide-up');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setModalAnimation('slide-down');
    setTimeout(() => {
      setShowModal(false);
      setSelectedDispute(null);
      setResponseMessage('');
      setModalAnimation('slide-up');
    }, 300);
  };

  if (loading) {
    return <h2 className="text-center mt-5">Loading...</h2>;
  }

  return (
    <>
    <ModalAnimationStyles />
    <div className="d-flex flex-column vh-100">
      {/* Fixed header */}
      <div className="fixed-top">
        <Header />
      </div>
      
      {/* Content area with proper spacing */}
      <div className="d-flex flex-column flex-md-row" style={{ marginTop: "56px" }}>
        {/* Sidebar component */}
        <VendorSidebar />
        
        {/* Notifications */}
        <NotificationToast notifications={notifications} />
        
        {/* Main content area */}
        <main className="flex-grow-1 p-3 p-md-4" style={{ minWidth: "0" }}>
          <div className="container-fluid px-0">
            <div className="content-area">
              <h1 className="h2 mb-2">Vendor Portal - {vendorName.toUpperCase()}</h1>
              <p className="mb-4">Manage your transaction disputes</p>
  
              <div className="disputes-section">
                <DisputeHeader 
                  count={disputes.length}
                  isPolling={isPolling}
                />
  
                <Row className="g-3 mt-2">
                  {disputes.map((dispute) => (
                    <DisputeCard
                      key={dispute._id}
                      dispute={dispute}
                      onClick={handleDisputeClick}
                    />
                  ))}
                </Row>
                
                {disputes.length === 0 && (
                  <div className="text-center p-5 bg-light rounded mt-4">
                    <i className="fas fa-check-circle fa-3x text-muted mb-3"></i>
                    <p className="mb-0">You have no disputes to review at this time.</p>
                  </div>
                )}
  
                <DisputeModal
                  show={showModal}
                  dispute={selectedDispute}
                  responseMessage={responseMessage}
                  setResponseMessage={setResponseMessage}
                  onClose={handleCloseModal}
                  modalAnimation={modalAnimation}
                  addNotification={addNotification}
                />
  
                <SessionExpiredModal
                  show={sessionExpired}
                  onConfirm={handleSessionExpired}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </>
  );
}

export default VendorDashboard;