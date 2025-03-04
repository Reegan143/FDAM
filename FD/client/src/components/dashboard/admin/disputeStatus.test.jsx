// disputeStatus.test.jsx
import { describe, it, expect } from 'vitest';
import { getStatusColor, getDisputeStatusColor } from './disputeStatus';

describe('Dispute Status Utilities', () => {
  describe('getStatusColor', () => {
    it('returns "success" for "paid" status', () => {
      expect(getStatusColor('paid')).toBe('success');
    });
    
    it('returns "danger" for "failed" status', () => {
      expect(getStatusColor('failed')).toBe('danger');
    });
    
    it('returns "warning" for "pending" status', () => {
      expect(getStatusColor('pending')).toBe('warning');
    });
    
    it('returns "primary" for any other status', () => {
      expect(getStatusColor('unknown')).toBe('primary');
    });
    
    it('is case insensitive', () => {
      expect(getStatusColor('PAID')).toBe('success');
      expect(getStatusColor('Failed')).toBe('danger');
      expect(getStatusColor('PENDING')).toBe('warning');
    });
  });
  
  describe('getDisputeStatusColor', () => {
    it('returns "success" for "closed" status', () => {
      expect(getDisputeStatusColor('closed')).toBe('success');
    });
    
    it('returns "success" for "approved" status', () => {
      expect(getDisputeStatusColor('approved')).toBe('success');
    });
    
    it('returns "danger" for "rejected" status', () => {
      expect(getDisputeStatusColor('rejected')).toBe('danger');
    });
    
    it('returns "lime" for "submitted" status', () => {
      expect(getDisputeStatusColor('submitted')).toBe('lime');
    });
    
    it('returns "primary" for any other status', () => {
      expect(getDisputeStatusColor('unknown')).toBe('primary');
    });
    
    it('is case insensitive', () => {
      expect(getDisputeStatusColor('CLOSED')).toBe('success');
      expect(getDisputeStatusColor('Approved')).toBe('success');
      expect(getDisputeStatusColor('REJECTED')).toBe('danger');
      expect(getDisputeStatusColor('Submitted')).toBe('lime');
    });
  });
});