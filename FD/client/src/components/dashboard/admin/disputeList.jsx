import React from 'react';
import { Row, Form } from 'react-bootstrap';
import DisputeCard from './adminDisputeCard';

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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>All Disputes ({disputes.length})</h2>
        <div className="d-flex gap-3">
          <Form.Control
            type="text"
            placeholder="Search by user's email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '300px' }}
          />
          <Form.Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ width: '300px' }}
          >
            <option value="date_asc">Sort by Date (Oldest First)</option>
            <option value="amount_desc">Sort by Amount (Highest First)</option>
            <option value="amount_asc">Sort by Amount (Lowest First)</option>
            <option value="unsolved_first">Sort by Unsolved First</option>
          </Form.Select>
        </div>
      </div>

      <Row>
        {disputes.map((dispute) => (
          <DisputeCard
            key={dispute._id}
            dispute={dispute}
            onClick={onDisputeClick}
          />
        ))}
      </Row>
    </div>
  );
}

export default DisputeList;