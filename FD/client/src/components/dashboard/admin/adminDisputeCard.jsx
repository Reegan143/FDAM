import React from 'react';
import { Col, Card } from 'react-bootstrap';
import { formatCurrency } from '../../utils/currencyFormatter';
import { formatDate } from '../../utils/dateFormates';
import { getDisputeStatusColor } from './disputeStatus';

function DisputeCard({ dispute, onClick }) {
  return (
    <Col xs={12} md={6} lg={4} className="mb-4">
      <Card
        onClick={() => onClick(dispute)}
        style={{ cursor: 'pointer' }}
        className="h-100 shadow-sm"
      >
        <Card.Body>
          <Card.Title>Ticket #{dispute.ticketNumber}</Card.Title>
          <Card.Text>
            <strong>User:</strong> {dispute.email}<br />
            <strong>Amount:</strong> {formatCurrency(dispute.amount)}<br />
            <strong>Type:</strong> {dispute.complaintType}<br />
            <strong>Date:</strong> {formatDate(dispute.createdAt)}<br />
            <strong>Status:</strong> 
            <span style={{
              color: dispute.status.toLowerCase() === 'submitted' ? '#32CD32' : 
                    `var(--bs-${getDisputeStatusColor(dispute.status)})`
            }}>
              {dispute.status}
            </span>
          </Card.Text>
        </Card.Body>
      </Card>
    </Col>
  );
}

export default DisputeCard;