import jsPDF from 'jspdf';
import { formatCurrency } from './currencyFormatter';
import { formatDate } from './dateFormates';

export async function generateVendorPdf(selectedDispute, responseMessage){
    // Create PDF
const pdf = new jsPDF('p', 'mm', 'a4');
      
// Add title
pdf.setFont('helvetica', 'bold');
pdf.setFontSize(16);
pdf.text('Brilliant Bank', 14, 15);
pdf.setFontSize(14);
pdf.text("Venor's Dispute Details Report", 14, 22);

// Add generation information
pdf.setFontSize(10);
pdf.setFont('helvetica', 'normal');
pdf.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
pdf.text(`Reference: ${selectedDispute.transactionId}`, 14, 35);

// Add transaction details
pdf.setFont('helvetica', 'bold');
pdf.setFontSize(12);
pdf.text('Transaction Information', 14, 45);

// Add table header
const tableColumns = ['Field', 'Value'];

// Create table for transaction details
const transactionData = [
  ['Ticket No:', selectedDispute.ticketNumber || 'N/A'],
  ['Transaction ID:', selectedDispute.transactionId || 'N/A'],
  ['Amount Disputed:', selectedDispute.amount ? formatCurrency(selectedDispute.amount) : 'N/A'],
  ['Date:', formatDate(selectedDispute.createdAt) || 'N/A'],
  ['Channel:', selectedDispute.digitalChannel || 'N/A'],
  ['Card Number:', selectedDispute.debitCardNumber || 'N/A'],
  ['Card Type:', selectedDispute.cardType || 'N/A'],
  ['complaint On :', selectedDispute.vendorName ? selectedDispute.vendorName : "Transaction Id : ",selectedDispute.transactionId || 'N/A'],

];

pdf.autoTable({
  startY: 50,
  head: [tableColumns],
  body: transactionData,
  theme: 'grid',
  styles: { fontSize: 10, cellPadding: 3 },
  headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0] },
  alternateRowStyles: { fillColor: [245, 245, 245] }
});

// Add dispute status
const finalY = pdf.lastAutoTable.finalY + 10;
pdf.setFont('helvetica', 'bold');
pdf.setFontSize(12);
pdf.text('Dispute Status', 14, finalY);

const statusData = [
  ['Current Status:', selectedDispute.status || 'N/A'],
  ['Complaint Type:', selectedDispute.complaintType || 'N/A'],
  ['Description:', selectedDispute.description || 'N/A']
];

if (selectedDispute.vendorResponse || responseMessage) {
  statusData.push(['Vendor Response:', selectedDispute.vendorResponse || responseMessage]);
}

pdf.autoTable({
  startY: finalY + 5,
  body: statusData,
  theme: 'grid',
  styles: { fontSize: 10, cellPadding: 3 },
  alternateRowStyles: { fillColor: [245, 245, 245] }
});

// Add footer
const pageCount = pdf.internal.getNumberOfPages();
for (let i = 1; i <= pageCount; i++) {
  pdf.setPage(i);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'italic');
  pdf.text(
    `Page ${i} of ${pageCount} - Brilliant Bank Confidential`, 
    pdf.internal.pageSize.width / 2, 
    pdf.internal.pageSize.height - 10, 
    { align: 'center' }
  );
}

// Save PDF
pdf.save(`Dispute_${selectedDispute.transactionId}.pdf`);
}