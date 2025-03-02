import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { formatCurrency } from '../utils/currencyFormatter';
import { formatDate } from '../utils/dateFormates';
import { getStatusStyle } from '../utils/statusStyles';
import { generateUserReport } from '../utils/userReport';

function DisputeModal({ show, dispute, onClose }) {
  const handleDownloadPDF = () => {
    try {
      if (!dispute) return;
      generateUserReport(dispute);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" fullscreen="sm-down">
  <Modal.Header closeButton>
    <Modal.Title className="h5">Dispute Details</Modal.Title>
  </Modal.Header>
  <Modal.Body className="p-3 p-sm-4">
    {dispute && (
      <div>
        <h4 className="h5 mb-3">Transaction Information</h4>
        <div className="row mb-4">
          <div className="col-12 col-sm-6 mb-2">
            <p className="mb-2"><strong>Ticket No:</strong> {dispute.ticketNumber}</p>
            <p className="mb-2"><strong>Transaction ID:</strong> {dispute.transactionId}</p>
            <p className="mb-2"><strong>Amount Disputed:</strong> {formatCurrency(dispute.amount)}</p>
          </div>
          <div className="col-12 col-sm-6 mb-2">
            <p className="mb-2"><strong>Date:</strong> {formatDate(dispute.createdAt)}</p>
            <p className="mb-2"><strong>Channel:</strong> {dispute.digitalChannel}</p>
            <p className="mb-2"><strong>Card Number:</strong> {dispute.debitCardNumber}</p>
          </div>
        </div>
        <div className="row mb-4">
          <div className="col-12">
            <p className="mb-2"><strong>Card Type:</strong> {dispute.cardType}</p>
            <p className="mb-2"><strong>Complaint On:</strong> {
              dispute.vendorName 
                ? dispute.vendorName.toUpperCase() 
                : `TransactionId : ${dispute.transactionId}`
            }</p>
          </div>
        </div>

        <h4 className="h5 mb-3">Dispute Status</h4>
        <div className="p-3 bg-light rounded">
          <p className="mb-2">
            <strong>Current Status:</strong>{' '}
            <span style={getStatusStyle(dispute.status)}>
              {dispute.status}
            </span>
          </p>
          <p className="mb-2"><strong>Complaint Type:</strong> {dispute.complaintType}</p>
          <p className="mb-0"><strong>Description:</strong> {dispute.description}</p>
        </div>
      </div>
    )}
  </Modal.Body>
  <Modal.Footer className="d-flex flex-column flex-sm-row">
    <Button variant="primary" onClick={handleDownloadPDF} className="w-100 w-sm-auto mb-2 mb-sm-0">
      <i className="fas fa-download me-2"></i>Download PDF
    </Button>
    <Button variant="secondary" onClick={onClose} className="w-100 w-sm-auto">
      Close
    </Button>
  </Modal.Footer>
</Modal>
  );
}

export default DisputeModal;