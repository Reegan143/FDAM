import React from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

function NotificationToast({ notifications }) {
  return (
    <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
      {notifications.map(notification => (
        <Toast 
          key={notification.id}
          bg={notification.variant}
          autohide
        >
          <Toast.Header closeButton={false}>
            <strong className="me-auto">Notification</strong>
          </Toast.Header>
          <Toast.Body className={notification.variant === 'danger' ? 'text-white' : ''}>
            {notification.message}
          </Toast.Body>
        </Toast>
      ))}
    </ToastContainer>
  );
}

export default NotificationToast;
