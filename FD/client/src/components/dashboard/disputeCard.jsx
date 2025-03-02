import React from 'react';
import { Col, Card } from 'react-bootstrap';
import { formatCurrency } from '../utils/currencyFormatter';
import { formatDate } from '../utils/dateFormates';
import { getStatusStyle } from '../utils/statusStyles';

function DisputeCard({ dispute, onClick }) {
  return (
    <Card
  onClick={onClick}
  style={{ cursor: 'pointer' }}
  className="h-100 shadow-sm border-0"
>
  <Card.Body className="p-3">
    <Card.Title className="mb-3">Transaction ID: {dispute.transactionId}</Card.Title>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Amount:</span>
                  <span className="text-end">{formatCurrency(dispute.amount)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Type:</span>
                  <span className="text-end">{dispute.complaintType}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Date:</span>
                  <span className="text-end">{formatDate(dispute.createdAt)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Status:</span>
                  <span className="text-end" style={{
                    color: dispute.status.toLowerCase() === 'submitted' ? 'green' : 
                          dispute.status.toLowerCase() === 'closed' ? 'red' : 
                          'var(--bs-warning)'
                  }}>
                    {dispute.status}
                  </span>
                </div>
  </Card.Body>
</Card>
  );
}

export default DisputeCard;