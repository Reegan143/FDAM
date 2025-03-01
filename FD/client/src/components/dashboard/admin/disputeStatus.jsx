export const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'success';
      case 'failed':
        return 'danger';
      case 'pending':
        return 'warning';
      default:
        return 'primary';
    }
  };
  
  export const getDisputeStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'closed':
      case 'approved':
        return 'success';
      case 'rejected':
        return 'danger';
      case 'submitted':
        return 'lime';
      default:
        return 'primary';
    }
  };