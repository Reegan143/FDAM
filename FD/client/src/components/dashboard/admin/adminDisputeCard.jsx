import React from 'react';
import { Col, Card } from 'react-bootstrap';
import { formatCurrency } from '../../utils/currencyFormatter';
import { formatDate } from '../../utils/dateFormates';
import { getDisputeStatusColor } from './disputeStatus';

function DisputeCard({ dispute, onClick }) {
  return (
    <Card
      onClick={onClick}
      style={{ cursor: 'pointer' }}
      className="h-100 shadow-sm border-0"
    >
      <Card.Body className="p-3">
        <h5 className="card-title mb-3" style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>
          Transaction ID: 
          <span className="text-dark">{dispute.transactionId}</span>
        </h5>
        
        <table className="w-100" style={{ fontSize: '0.9rem' }}>
          <tbody>
            <tr>
              <td className="text-muted" style={{ width: '30%', paddingBottom: '0.5rem' }}>Amount:</td>
              <td className="text-end" style={{ paddingBottom: '0.5rem' }}>{formatCurrency(dispute.amount)}</td>
            </tr>
            <tr>
              <td className="text-muted" style={{ paddingBottom: '0.5rem' }}>Type:</td>
              <td className="text-end" style={{ paddingBottom: '0.5rem' }}>{dispute.complaintType || dispute.type}</td>
            </tr>
            <tr>
              <td className="text-muted" style={{ paddingBottom: '0.5rem' }}>Date:</td>
              <td className="text-end" style={{ paddingBottom: '0.5rem' }}>{formatDate(dispute.createdAt) || dispute.date}</td>
            </tr>
            <tr>
              <td className="text-muted">Status:</td>
              <td className="text-end">
                <span className={
                  dispute.status === 'submitted' ? 'text-success' : 
                  dispute.status === 'closed' ? 'text-danger' : 
                  'text-warning'
                } style={{ fontWeight: '500' }}>
                  {dispute.status}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </Card.Body>
    </Card>
  );
}

export default DisputeCard;