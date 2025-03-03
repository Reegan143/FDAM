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
  fullscreen="md-down"
>
  <Modal.Header closeButton>
    <Modal.Title className="h5">Dispute Details</Modal.Title>
  </Modal.Header>
  <Modal.Body className="p-3 p-md-4">
    <div>
      <p className="mb-3"><strong>User:</strong> {dispute.email}</p>
      
      <h4 className="h5 border-bottom pb-2 mb-3">Transaction Information</h4>
      <div className="row g-2">
        <div className="col-12 col-md-6 mb-2">
          <p className="mb-2"><strong>Ticket No:</strong> {dispute.ticketNumber}</p>
        </div>
        <div className="col-12 col-md-6 mb-2">
          <p className="mb-2"><strong>Transaction ID:</strong> {dispute.transactionId}</p>
        </div>
        <div className="col-12 col-md-6 mb-2">
          <p className="mb-2"><strong>Amount Disputed:</strong> {formatCurrency(dispute.amount)}</p>
        </div>
        <div className="col-12 col-md-6 mb-2">
          <p className="mb-2"><strong>Date:</strong> {formatDate(dispute.createdAt)}</p>
        </div>
        <div className="col-12 col-md-6 mb-2">
          <p className="mb-2"><strong>Channel:</strong> {dispute.digitalChannel}</p>
        </div>
        <div className="col-12 col-md-6 mb-2">
          <p className="mb-2"><strong>Card Number:</strong> {dispute.debitCardNumber}</p>
        </div>
        <div className="col-12 mb-2">
          <p className="mb-2"><strong>Card Type:</strong> {dispute.cardType}</p>
        </div>
      </div>

      <div className="d-flex justify-content-md-end mt-3">
        <Button 
          variant="primary" 
          onClick={handleRequestApiKey}
          className="w-100 w-md-auto"
        >
          <i className="fas fa-key me-2"></i>Request API Key
        </Button>
      </div>

      <h4 className="h5 border-bottom pb-2 mt-4 mb-3">Dispute Status</h4>
      <div className="p-3 bg-light rounded">
        <div className="mb-3">
          <p className="mb-2">
            <strong>Current Status:</strong>{' '}
            <span style={getStatusStyle(dispute.status)}>
              {dispute.status}
            </span>
          </p>
          <p className="mb-2"><strong>Complaint Type:</strong> {dispute.complaintType}</p>
          <p className="mb-0"><strong>Description:</strong> {dispute.description}</p>
        </div>

        {!dispute.vendorResponse ? (
          <div className="mt-4">
            <h5 className="mb-3">Submit Response</h5>
            <textarea
              className="form-control mb-3"
              rows="4"
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              placeholder="Enter your response to this dispute..."
            />
            <div className="d-flex flex-column flex-md-row justify-content-md-end gap-2">
              <Button 
                variant="primary" 
                onClick={handleSubmitResponse}
                className="w-100 w-md-auto order-md-1"
              >
                <i className="fas fa-paper-plane me-2"></i>Submit
              </Button>
              <Button 
                variant="success" 
                onClick={handleDownloadPDF}
                className="w-100 w-md-auto"
              >
                <i className="fas fa-download me-2"></i>Download PDF
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-4 alert alert-info">
            <h5 className="h6">Your Response:</h5>
            <p className="mb-2">{dispute.vendorResponse}</p>
            <p className="text-muted mt-2 mb-2">
              <small>Submitted on {formatDate(dispute.updatedAt)}</small>
            </p>
            <div className="d-flex justify-content-end mt-3">
              <Button 
                variant="success" 
                onClick={handleDownloadPDF}
                className="w-100 w-md-auto"
              >
                <i className="fas fa-download me-2"></i>Download PDF
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={onClose} className="w-100 w-md-auto">
      Close
    </Button>
  </Modal.Footer>
</Modal>
  );
}

export default DisputeModal;