import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { formatCurrency } from '../../utils/currencyFormatter';
import { formatDate } from '../../utils/dateFormates';
import { getStatusStyle } from '../../utils/statusStyles';
import { useVendorDispute } from '../../../hooks/useVendorDispute';

function DisputeModal({
  show,
  dispute,
  responseMessage,
  setResponseMessage,
  onClose,
  modalAnimation,
  addNotification
}) {
  const { 
    handleSubmitResponse,
    handleRequestApiKey,
    handleDownloadPDF 
  } = useVendorDispute(dispute, responseMessage, addNotification, onClose);

  if (!dispute) return null;

  return (
    <Modal 
      show={show} 
      onHide={onClose} 
      size="lg"
      className={modalAnimation}
    >
      <Modal.Header closeButton>
        <Modal.Title>Dispute Details</Modal.Title>

      </Modal.Header>
      <Modal.Body>
        <div>
        <p><strong>User :</strong> {dispute.email}</p>
          <h4>Transaction Information</h4>
          <p><strong>Ticket No:</strong> {dispute.ticketNumber}</p>
          <p><strong>Transaction ID:</strong> {dispute.transactionId}</p>
          <p><strong>Amount Disputed:</strong> {formatCurrency(dispute.amount)}</p>
          <p><strong>Date:</strong> {formatDate(dispute.createdAt)}</p>
          <p><strong>Channel:</strong> {dispute.digitalChannel}</p> 
          <p><strong>Card Number:</strong> {dispute.debitCardNumber}</p>
          <p><strong>Card Type:</strong> {dispute.cardType}</p>

          <div className="mt-4 d-flex justify-content-end">
            <Button 
              variant="primary" 
              onClick={handleRequestApiKey}
              className="me-3"
            >
              Request API Key
            </Button>
          </div>
          
          <h4 className="mt-4">Dispute Status</h4>
          <div className="p-3 bg-light rounded">
            <p>
              <strong>Current Status:</strong>{' '}
              <span style={getStatusStyle(dispute.status)}>
                {dispute.status}
              </span>
            </p>
            <p><strong>Complaint Type:</strong> {dispute.complaintType}</p>
            <p><strong>Description:</strong> {dispute.description}</p>
            
            {!dispute.vendorResponse ? (
              <div className="mt-4">
                <h4>Submit Response</h4>
                <textarea
                  className="form-control mb-3"
                  rows="4"
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  placeholder="Enter your response to this dispute..."
                />
                <div className="d-flex justify-content-end">
                  <Button 
                    variant="primary" 
                    onClick={handleSubmitResponse}
                    className="me-2"
                  >
                    Submit
                  </Button>
                  <Button 
                    variant="success" 
                    onClick={handleDownloadPDF}
                  >
                    Download PDF
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-4 alert alert-info">
                <h5>Your Response:</h5>
                <p>{dispute.vendorResponse}</p>
                <p className="text-muted mt-2">
                  <small>Submitted on {formatDate(dispute.updatedAt)}</small>
                </p>
                <div className="d-flex justify-content-end mt-3">
                  <Button 
                    variant="success" 
                    onClick={handleDownloadPDF}
                  >
                    Download PDF
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default DisputeModal;