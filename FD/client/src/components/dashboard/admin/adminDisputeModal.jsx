import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { formatCurrency } from '../../utils/currencyFormatter';
import { formatDate } from '../../utils/dateFormates';
import { getDisputeStatusColor } from './disputeStatus';
import { generateAdminDisputePDF } from '../../utils/generateAdminPdf';

function DisputeModal({
  show,
  dispute,
  remarks,
  setRemarks,
  onClose,
  onUpdateStatus,
  onViewTransaction,
  modalAnimation
}) {
  const isDisputeClosed = (status) => {
    return ['closed', 'approved', 'rejected'].includes(status.toLowerCase());
  };

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
          <h4>User Information</h4>
          <p><strong>Email:</strong> {dispute.email}</p>

          <h4 className="mt-4">Transaction Information</h4>
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
          <p><strong>Vendor Response:</strong> {dispute.vendorResponse || ""}</p>

          <Button 
            variant="primary" 
            className="mt-3 mb-3"
            onClick={() => onViewTransaction(dispute.transactionId)}
          >
            Check Transaction Details
          </Button>

          <h4 className="mt-4">Dispute Status</h4>
          <div className="p-3 bg-light rounded">
            <p>
              <strong>Current Status:</strong> 
              <span style={{
                color: dispute.status.toLowerCase() === 'submitted' ? '#32CD32' : 
                      `var(--bs-${getDisputeStatusColor(dispute.status)})`
              }}>
                {dispute.status}
              </span>
            </p>
            <p><strong>Complaint Type:</strong> {dispute.complaintType}</p>
            <p><strong>Description:</strong> {dispute.description}</p>
          </div>

          <Form.Group className="mt-4">
            <Form.Label>Admin Remarks</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter your remarks..."
              disabled={isDisputeClosed(dispute.status)}
            />
          </Form.Group>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        
        <Button 
          variant="primary" 
          className="btn btn-sm" 
          onClick={() => generateAdminDisputePDF(dispute, remarks)}
        >
          Download PDF
        </Button>
        
        {!isDisputeClosed(dispute.status) && (
          <>
            <Button variant="success" onClick={() => onUpdateStatus('approved')}>
              Approve
            </Button>
            <Button variant="danger" onClick={() => onUpdateStatus('rejected')}>
              Reject
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
}

export default DisputeModal;