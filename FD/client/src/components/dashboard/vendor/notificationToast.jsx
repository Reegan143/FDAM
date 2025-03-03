import React from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

function NotificationToast({ notifications }) {
  return (
    <ToastContainer 
  position="top-end" 
  className="p-3" 
  style={{ 
    zIndex: 9999, 
    position: 'fixed', 
    right: '10px', 
    top: '66px',
    width: 'auto',
    maxWidth: 'calc(100vw - 20px)'
  }}
>
  {notifications.map(notification => (
    <Toast 
      key={notification.id}
      bg={notification.variant}
      autohide
      delay={5000}
      className="mb-2 shadow-sm"
    >
      <Toast.Header closeButton={false} className="d-flex justify-content-between">
        <strong className="me-auto">Notification</strong>
        <small>{new Date().toLocaleTimeString()}</small>
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
