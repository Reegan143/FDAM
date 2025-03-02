import React from 'react';
import { Col, Card } from 'react-bootstrap';
import { formatCurrency } from '../../utils/currencyFormatter';
import { formatDate } from '../../utils/dateFormates';
import { getStatusStyle } from '../../utils/statusStyles';

function DisputeCard({ dispute, onClick }) {
  return (
    <Col xs={12} md={6} lg={4} className="mb-4">
    <Card 
        onClick={() => onClick(dispute)}
        style={{ cursor: 'pointer' }}
        className="h-100 shadow-sm"
    >
        <Card.Body>
            <Card.Title className="mb-3">
                Transaction ID: {dispute.transactionId}
            </Card.Title>
            <div>
                <div className="d-flex justify-content-between mb-2">
                    <span>Amount:</span>
                    <strong>{formatCurrency(dispute.amount)}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                    <span>Type:</span>
                    <strong>{dispute.complaintType}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                    <span>Date:</span>
                    <strong>{formatDate(dispute.createdAt)}</strong>
                </div>
                <div className="d-flex justify-content-between">
                    <span>Status:</span>
                    <strong style={getStatusStyle(dispute.status)}>
                        {dispute.status}
                    </strong>
                </div>
            </div>
        </Card.Body>
    </Card>
</Col>
  );
}

export default DisputeCard;