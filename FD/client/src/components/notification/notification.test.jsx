import { describe, it, expect } from 'vitest';
import { create } from 'react-test-renderer';
import NotificationsPopup from './notification';
import React from 'react';

const sampleNotifications = [
  {
    _id: '1',
    ticketNumber: '12345',
    complaintType: 'Network Issue',
    createdAt: '2025-03-04T12:00:00Z',
    messages: 'Your complaint has been received.',
    isRead: false,
  },
  {
    _id: '2',
    ticketNumber: '67890',
    complaintType: 'Billing Issue',
    createdAt: '2025-03-03T15:30:00Z',
    messages: 'Your issue is being processed.',
    isRead: true,
  }
];

describe('NotificationsPopup Component', () => {
  it('renders correctly when visible', () => {
    const tree = create(
      <NotificationsPopup 
        showNotifications={true} 
        notifications={sampleNotifications} 
        markAsRead={() => {}} 
        onClose={() => {}} 
        unreadCount={1} 
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders correctly when hidden', () => {
    const tree = create(
      <NotificationsPopup 
        showNotifications={false} 
        notifications={[]} 
        markAsRead={() => {}} 
        onClose={() => {}} 
        unreadCount={0} 
      />
    ).toJSON();
    expect(tree).toBe(null);
  });

  it('renders no notifications message when list is empty', () => {
    const tree = create(
      <NotificationsPopup 
        showNotifications={true} 
        notifications={[]} 
        markAsRead={() => {}} 
        onClose={() => {}} 
        unreadCount={0} 
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
