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
    <i className="fas fa-arrow-left me-2"></i>Back to Disputes
  </Button>

  <Card className="shadow-sm">
    <Card.Header className="bg-primary text-white py-3">
      <h3 className="h5 mb-0">Transaction Details</h3>
    </Card.Header>
    <Card.Body className="p-3 p-md-4">
      {transactionData ? (
        <div className="transaction-details">
          <Row className="g-4">
            <Col xs={12} md={6}>
              <div className="mb-3">
                <h5 className="text-muted mb-3">Transaction Information</h5>
                <div className="border-bottom pb-2 mb-2">
                  <strong>Transaction ID:</strong> {transactionData.transactionId}
                </div>
                <div className="border-bottom pb-2 mb-2">
                  <strong>Amount:</strong> {formatCurrency(transactionData.amount)}
                </div>
                <div className="border-bottom pb-2 mb-2">
                  <strong>Date:</strong> {formatDate(transactionData.transactionDate)}
                </div>
                <div>
                  <strong>Status: </strong>
                  <span className={`text-${getStatusColor(transactionData.status)}`}>
                    {transactionData.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </Col>
            <Col xs={12} md={6}>
              <div className="mb-3">
                <h5 className="text-muted mb-3">Account Details</h5>
                <div className="border-bottom pb-2 mb-2">
                  <strong>Sender's Name:</strong> {transactionData.senderName}
                </div>
                <div className="border-bottom pb-2 mb-2">
                  <strong>Sender Account:</strong> {transactionData.senderAccNo}
                </div>
                <div className="border-bottom pb-2 mb-2">
                  <strong>Receiver's Name:</strong> {transactionData.receiverName}
                </div>
                <div className="border-bottom pb-2 mb-2">
                  <strong>Receiver Account:</strong> {transactionData.receiverAccNo}
                </div>
                <div>
                  <strong>Debit Card Number:</strong> {transactionData.debitCardNumber}
                </div>
              </div>
            </Col>
          </Row>
        </div>
      ) : (
        <div className="text-center p-4">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mb-0">Loading transaction details...</p>
        </div>
      )}
    </Card.Body>
  </Card>
</div>
  );
}

export default TransactionView;