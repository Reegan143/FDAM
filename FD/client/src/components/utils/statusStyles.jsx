import React from 'react'
export function getStatusStyle(status='') {
    switch (status.toLowerCase()) {
      case 'closed':
      case 'approved':
        return { color: 'var(--bs-success)' };
      case 'rejected':
        return { color: 'var(--bs-danger)' };
      case 'submitted':
        return { color: '#32CD32' };
      default:
        return { color: 'var(--bs-primary)' };
    }
  }


export function ModalAnimationStyles() {
  return (
    <style>
      {`
        .modal.fade .modal-dialog {
          transition: transform 0.3s ease-out !important;
        }
        
        .modal.fade.slide-up .modal-dialog {
          transform: translate(0, 100%) !important;
        }
        
        .modal.fade.slide-up.show .modal-dialog {
          transform: translate(0, 0) !important;
        }
        
        .modal.fade.slide-down .modal-dialog {
          transform: translate(0, -100%) !important;
        }
        
        .modal.fade.slide-down.show .modal-dialog {
          transform: translate(0, 0) !important;
        }
      `}
    </style>
  );
}