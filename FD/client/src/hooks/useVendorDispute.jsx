import { useCallback } from 'react';
import API from '../components/utils/axiosInstance';
import { generateVendorPdf } from '../components/utils/vendorReport';

export function useVendorDispute(dispute, responseMessage, addNotification, onClose) {
  const handleSubmitResponse = async () => {
    try {
      if (!responseMessage.trim()) {
        addNotification('Please enter a response before submitting', 'warning');
        return;
      }

      await API.vendor.post('/vendor/disputes/respond', {
        disputeId: dispute._id,
        vendorResponse: responseMessage
      });

      onClose();
      addNotification('Response submitted successfully');
    } catch (error) {
      addNotification(
        error.response?.data?.message || 'Error submitting response. Please try again.',
        'danger'
      );
    }
  };

  const handleRequestApiKey = useCallback(async () => {
    try {
      const response = await API.vendor.post('/vendor/request-api-key', 
        { transactionId: dispute.transactionId }
      );
      addNotification(response.data.message || 'API Key request sent successfully!');
    } catch (error) {
      addNotification(error.response?.data?.error || 'Error requesting API Key', 'danger');
    }
  }, [dispute, addNotification]);

  const handleDownloadPDF = useCallback(() => {
    try {
      generateVendorPdf(dispute, responseMessage);
      addNotification('PDF downloaded successfully');
    } catch (error) {
      addNotification('Error generating PDF. Please try again.', 'danger');
    }
  }, [dispute, responseMessage, addNotification]);

  return {
    handleSubmitResponse,
    handleRequestApiKey,
    handleDownloadPDF
  };
}