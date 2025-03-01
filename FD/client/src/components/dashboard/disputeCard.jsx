import React from 'react';
import { Col, Card } from 'react-bootstrap';
import { formatCurrency } from '../utils/currencyFormatter';
import { formatDate } from '../utils/dateFormates';
import { getStatusStyle } from '../utils/statusStyles';

function DisputeCard({ dispute, onClick }) {
  return (
    <Col xs={12} md={6} lg={4} className="mb-4">
      <Card
        onClick={onClick}
        style={{ cursor: 'pointer' }}
        className="h-100 shadow-sm"
      >
        <Card.Body>
          <Card.Title>Transaction ID: {dispute.transactionId}</Card.Title>
          <Card.Text>
            <strong>Amount:</strong> {formatCurrency(dispute.amount)}<br />
            <strong>Type:</strong> {dispute.complaintType}<br />
            <strong>Date:</strong> {formatDate(dispute.createdAt)}<br />
            <strong>Status:</strong> <span style={getStatusStyle(dispute.status)}>{dispute.status}</span>
          </Card.Text>
        </Card.Body>
      </Card>
    </Col>
  );
}

export default DisputeCard;