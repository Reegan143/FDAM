import React from 'react';
import { Card, Button, Row, Col } from 'react-bootstrap';
import { formatCurrency } from '../utils/currencyFormatter';
import { formatDate } from '../utils/dateFormates';

function TransactionView({ transactionData, onBack, getStatusColor }) {
  return (
    <div className="transaction-view">
      <Button 
        variant="secondary" 
        onClick={onBack} 
        className="mb-4"
      >
        ← Back to Disputes
      </Button>

      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h3 className="mb-0">Transaction Details</h3>
        </Card.Header>
        <Card.Body>
          {transactionData ? (
            <div className="transaction-details">
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <h5 className="text-muted">Transaction Information</h5>
                    <p><strong>Transaction ID:</strong> {transactionData.transactionId}</p>
                    <p><strong>Amount:</strong> {formatCurrency(transactionData.amount)}</p>
                    <p><strong>Date:</strong> {formatDate(transactionData.transactionDate)}</p>
                    <p>
                      <strong>Status: </strong>
                      <span className={`text-${getStatusColor(transactionData.status)}`}>
                        {transactionData.status.toUpperCase()}
                      </span>
                    </p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <h5 className="text-muted">Account Details</h5>
                    <p><strong>Sender's Name:</strong> {transactionData.senderName}</p>
                    <p><strong>Sender Account:</strong> {transactionData.senderAccNo}</p>
                    <p><strong>Receiver's Name:</strong> {transactionData.receiverName}</p>
                    <p><strong>Receiver Account:</strong> {transactionData.receiverAccNo}</p>
                    <p><strong>Debit Card Number:</strong> {transactionData.debitCardNumber}</p>
                  </div>
                </Col>
              </Row>
            </div>
          ) : (
            <div className="text-center">
              <p>No transaction details available</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

export default TransactionView;