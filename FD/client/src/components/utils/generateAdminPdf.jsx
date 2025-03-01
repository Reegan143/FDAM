import jsPDF from 'jspdf';
import { formatDateForFilename } from './dateFormates';
import { formatDate } from './dateFormates';
import { formatCurrency } from './currencyFormatter';

export const generateAdminDisputePDF = (selectedDispute, remarks) => {
    if (!selectedDispute) return;
    
    // Create new PDF document in portrait orientation
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const centerX = pageWidth / 2;
    
    // Add a simple header with "Brillian Bank"
    doc.setFillColor(0, 83, 156); // Dark blue header
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setTextColor(255, 255, 255); // White text
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text("Brillian Bank", centerX, 15, { align: 'center' }); // Bank Name

     // Add a subtitle below the main title
     doc.setFontSize(16);
     doc.text("ADMIN'S DISPUTE RESOLUTION REPORT", centerX, 25, { align: 'center' });
    
    // Reset text color for the rest of the document
    doc.setTextColor(0, 0, 0);
    
    // Ticket number and date
    doc.setFillColor(240, 240, 240); // Light gray background
    doc.rect(0, 35, pageWidth, 15, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Ticket #: ${selectedDispute.ticketNumber}`, 15, 45);
    doc.text(`Resolution Date: ${formatDate(new Date())}`, pageWidth - 15, 45, { align: 'right' });
    
    // Section: User Information
    const startY = 70;
    doc.setFillColor(229, 241, 251); // Light blue section heading
    doc.rect(10, startY - 10, pageWidth - 20, 10, 'F');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text("USER INFORMATION", 15, startY - 2);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Email: ${selectedDispute.email}`, 15, startY + 10);
    
    // Section: Transaction Information
    const transY = startY + 30;
    doc.setFillColor(229, 241, 251);
    doc.rect(10, transY - 10, pageWidth - 20, 10, 'F');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text("TRANSACTION INFORMATION", 15, transY - 2);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text("Transaction ID:", 15, transY + 10);
    doc.text(String(selectedDispute.transactionId), 100, transY + 10);
    
    doc.text("Amount Disputed:", 15, transY + 20);
    doc.text(`${formatCurrency(selectedDispute.amount)}`, 100, transY + 20);
    
    doc.text("Transaction Date:", 15, transY + 30);
    doc.text(formatDate(selectedDispute.createdAt), 100, transY + 30);
    
    doc.text("Channel:", 15, transY + 40);
    doc.text(selectedDispute.digitalChannel, 100, transY + 40);
    
    doc.text("Card Number:", 15, transY + 50);
    doc.text(String(selectedDispute.debitCardNumber), 100, transY + 50);
    
    doc.text("Card Type:", 15, transY + 60);
    doc.text(selectedDispute.cardType, 100, transY + 60);
    
    doc.text("Complaint On:", 15, transY + 70);
    doc.text(selectedDispute.vendorName ? selectedDispute.vendorName : 
              `Transaction Id : ${selectedDispute.transactionId}`, 100, transY + 70);

    if (selectedDispute.vendorResponse) {
      doc.text("Vendor Response:", 15, transY + 80);
      
      // Handle long vendor response with text wrapping
      const maxWidth = pageWidth - 105;
      const splitResponse = doc.splitTextToSize(selectedDispute.vendorResponse, maxWidth);
      doc.text(splitResponse, 100, transY + 80);
    }
    
    // Section: Dispute Resolution
    const resY = transY + 100;
    doc.setFillColor(229, 241, 251);
    doc.rect(10, resY - 10, pageWidth - 20, 10, 'F');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text("DISPUTE RESOLUTION", 15, resY - 2);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text("Complaint Type:", 15, resY + 10);
    doc.text(selectedDispute.complaintType, 100, resY + 10);
    
    
    doc.text("Description:", 15, resY + 20);
    // Handle long description with text wrapping
    const maxWidth = pageWidth - 105;
    const splitDescription = doc.splitTextToSize(selectedDispute.description, maxWidth);
    doc.text(splitDescription, 100, resY + 20);
    
    // Calculate next Y position after description
    const descriptionLines = splitDescription.length;
    const nextY = resY + 25 + (descriptionLines * 5);
    
    doc.text("Resolution Status:", 15, nextY);
    // Highlight status with color
    if (selectedDispute.status.toLowerCase() === 'approved') {
      doc.setTextColor(0, 128, 0); // Green for approved
    } else if (selectedDispute.status.toLowerCase() === 'rejected') {
      doc.setTextColor(255, 0, 0); // Red for rejected
    }
    doc.setFont('helvetica', 'bold');
    doc.text(selectedDispute.status.toUpperCase(), 100, nextY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0); // Reset text color
    
    // Admin Remarks
    if (selectedDispute.adminRemarks) {
      const remarksY = nextY + 20;
      doc.text("Admin Remarks:", 15, remarksY);
      const splitRemarks = doc.splitTextToSize(selectedDispute.adminRemarks, maxWidth);
      doc.text(splitRemarks, 100, remarksY);
    }
    
    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 20;
    doc.setFillColor(240, 240, 240);
    doc.rect(0, footerY - 5, pageWidth, 25, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text("This is an official dispute resolution document. Please keep for your records.", centerX, footerY + 5, { align: 'center' });
    doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, centerX, footerY + 15, { align: 'center' });
    
    // Save the PDF with a well-formatted name
    doc.save(`Dispute_Resolution_${selectedDispute.ticketNumber}_${formatDateForFilename(new Date())}.pdf`);
  };