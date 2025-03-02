import React from 'react';
import { Modal, Button } from 'react-bootstrap';

function SessionExpiredModal({ show, onConfirm }) {
  return (
    <Modal show={show} onHide={onConfirm} backdrop="static" keyboard={false} centered>
  <Modal.Header className="border-bottom-0 pb-0">
    <Modal.Title className="h5">Session Expired</Modal.Title>
  </Modal.Header>
  <Modal.Body className="pt-2 pb-3">
    <div className="text-center mb-3">
      <i className="fas fa-exclamation-circle text-warning fa-3x mb-3"></i>
      <p className="mb-0">Your session has expired. Please log in again to continue.</p>
    </div>
  </Modal.Body>
  <Modal.Footer className="border-top-0 pt-0">
    <Button variant="primary" onClick={onConfirm} className="w-100">
      Login Again
    </Button>
  </Modal.Footer>
</Modal>
  );
}

export default SessionExpiredModal;