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
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Dispute Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {dispute && (
          <div>
            <h4>Transaction Information</h4>
            <p><strong>Ticket No:</strong> {dispute.ticketNumber}</p>
            <p><strong>Transaction ID:</strong> {dispute.transactionId}</p>
            <p><strong>Amount Disputed:</strong> {formatCurrency(dispute.amount)}</p>
            <p><strong>Date:</strong> {formatDate(dispute.createdAt)}</p>
            <p><strong>Channel:</strong> {dispute.digitalChannel}</p>
            <p><strong>Card Number:</strong> {dispute.debitCardNumber}</p>
            <p><strong>Card Type:</strong> {dispute.cardType}</p>
            <p><strong>Complaint On:</strong> {
              dispute.vendorName 
                ? dispute.vendorName.toUpperCase() 
                : `TransactionId : ${dispute.transactionId}`
            }</p>

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
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleDownloadPDF}>
          Download PDF
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default DisputeModal;