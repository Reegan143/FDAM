import React from 'react';
import { Row, Form, Col, Card } from 'react-bootstrap';
import { formatCurrency } from '../../utils/currencyFormatter';
import { formatDate } from '../../utils/dateFormates';

function DisputeList({
  disputes,
  sortBy,
  setSortBy,
  searchQuery,
  setSearchQuery,
  onDisputeClick
}) {
  return (
    <div className="disputes-section">
  <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
    <h2 className="h4 mb-3 mb-md-0">All Disputes ({disputes.length})</h2>
    <div className="d-flex flex-column flex-md-row gap-2 gap-md-3 w-100 w-md-auto">
      <Form.Control
        type="text"
        placeholder="Search by user's email"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="flex-grow-1"
        style={{ maxWidth: '300px' }}
      />
      <Form.Select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="flex-grow-1"
        style={{ maxWidth: '300px' }}
      >
        <option value="date_asc">Sort by Date (Oldest First)</option>
        <option value="amount_desc">Sort by Amount (Highest First)</option>
        <option value="amount_asc">Sort by Amount (Lowest First)</option>
        <option value="unsolved_first">Sort by Unsolved First</option>
      </Form.Select>
    </div>
  </div>

  <Row className="g-3">
    {disputes.map((dispute) => (
      <Col xs={12} sm={6} lg={4} key={dispute._id}>
        <Card
          onClick={() => onDisputeClick(dispute)}
          style={{ cursor: 'pointer' }}
          className="h-100 shadow-sm"
        >
          <Card.Body>
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
      </Col>
    ))}
  </Row>
  
  {disputes.length === 0 && (
    <div className="text-center p-5 bg-light rounded mt-4">
      <i className="fas fa-search fa-3x text-muted mb-3"></i>
      <p className="mb-0">No disputes found matching your search criteria.</p>
    </div>
  )}
</div>
  );
}

export default DisputeList;