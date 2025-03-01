import React, { useEffect, useState, useContext } from 'react';
import { Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
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
      <div className="d-flex flex-column min-vh-100">
        <Header />
        <VendorSidebar />
        
        <NotificationToast notifications={notifications} />

        <main className="ms-250 pt-5 mt-4">
          <div className="container-fluid">
            <div className="content-area">
              <h1>Vendor Portal - {vendorName.toUpperCase()}</h1>
              <p>Manage your transaction disputes</p>

              <div className="disputes-section">
                <DisputeHeader 
                  count={disputes.length}
                  isPolling={isPolling}
                />

                <Row className="mt-4">
                  {disputes.map((dispute) => (
                    <DisputeCard
                      key={dispute._id}
                      dispute={dispute}
                      onClick={handleDisputeClick}
                    />
                  ))}
                </Row>

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
    </>
  );
}

export default VendorDashboard;