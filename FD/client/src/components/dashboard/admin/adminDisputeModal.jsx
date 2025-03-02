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
  fullscreen="md-down"
>
  <Modal.Header closeButton>
    <Modal.Title className="h5">Dispute Details</Modal.Title>
  </Modal.Header>
  <Modal.Body className="p-3 p-md-4">
    <div>
      <h4 className="h5 border-bottom pb-2 mb-3">User Information</h4>
      <p><strong>Email:</strong> {dispute.email}</p>

      <h4 className="h5 border-bottom pb-2 mt-4 mb-3">Transaction Information</h4>
      <div className="row">
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
        <div className="col-12 col-md-6 mb-2">
          <p className="mb-2"><strong>Card Type:</strong> {dispute.cardType}</p>
        </div>
        <div className="col-12 mb-2">
          <p className="mb-2"><strong>Complaint On:</strong> {
            dispute.vendorName 
              ? dispute.vendorName.toUpperCase() 
              : `TransactionId : ${dispute.transactionId}`
          }</p>
        </div>
        <div className="col-12 mb-3">
          <p className="mb-0"><strong>Vendor Response:</strong> {dispute.vendorResponse || "No response yet"}</p>
        </div>
      </div>

      <Button 
        variant="primary" 
        className="mt-1 mb-4 d-block w-100 w-md-auto"
        onClick={() => onViewTransaction(dispute.transactionId)}
      >
        <i className="fas fa-search me-2"></i>Check Transaction Details
      </Button>

      <h4 className="h5 border-bottom pb-2 mb-3">Dispute Status</h4>
      <div className="p-3 bg-light rounded mb-4">
        <div className="row">
          <div className="col-12 mb-2">
            <p className="mb-1">
              <strong>Current Status:</strong> 
              <span style={{
                color: dispute.status.toLowerCase() === 'submitted' ? '#32CD32' : 
                      `var(--bs-${getDisputeStatusColor(dispute.status)})`
              }} className="ms-2">
                {dispute.status}
              </span>
            </p>
          </div>
          <div className="col-12 mb-2">
            <p className="mb-1"><strong>Complaint Type:</strong> {dispute.complaintType}</p>
          </div>
          <div className="col-12">
            <p className="mb-0"><strong>Description:</strong> {dispute.description}</p>
          </div>
        </div>
      </div>

      <Form.Group>
        <Form.Label><strong>Admin Remarks</strong></Form.Label>
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
  <Modal.Footer className="flex-column flex-sm-row align-items-stretch align-items-sm-center">
  <div className="d-flex gap-2 w-100 mt-2 mt-sm-0">
  
  <Button 
    variant="primary" 
    className="flex-fill" 
    onClick={() => generateAdminDisputePDF(dispute, remarks)}
  >
    <i className="fas fa-download me-2"></i>Download PDF
  </Button>
</div>
    
    {!isDisputeClosed(dispute.status) && (
      <div className="d-flex gap-2 w-100 mt-2 mt-sm-0">
        <Button variant="success" onClick={() => onUpdateStatus('approved')} className="flex-fill">
          <i className="fas fa-check me-2"></i>Approve
        </Button>
        <Button variant="danger" onClick={() => onUpdateStatus('rejected')} className="flex-fill">
          <i className="fas fa-times me-2"></i>Reject
        </Button>
      </div>
    )}
  </Modal.Footer>
</Modal>
  );
}

export default DisputeModal;