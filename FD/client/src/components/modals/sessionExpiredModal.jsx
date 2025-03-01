import React from 'react';
import { Modal, Button } from 'react-bootstrap';

function SessionExpiredModal({ show, onConfirm }) {
  return (
    <Modal show={show} onHide={onConfirm} backdrop="static" keyboard={false}>
      <Modal.Header>
        <Modal.Title>Session Expired</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Your session has expired. Please log in again to continue.
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onConfirm}>
          Login Again
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default SessionExpiredModal;