import 'jspdf-autotable';
import jsPDF from 'jspdf';
import { formatDate } from './dateFormates';
import { formatCurrency } from './currencyFormatter';
export function generateUserReport(selectedDispute){
    const pdf = new jsPDF();
      
      // Add logo and header
      pdf.setFontSize(20);
      pdf.setTextColor(0, 102, 204);
      pdf.text('Brilliant Bank', 105, 15, { align: 'center' });
      
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Coustomer's Dispute Details Report", 105, 25, { align: 'center' });
      
      pdf.setDrawColor(0, 102, 204);
      pdf.setLineWidth(0.5);
      pdf.line(20, 30, 190, 30);
      
      // Add current date and reference
      pdf.setFontSize(10);
      pdf.text(`Generated on: ${new Date().toLocaleString()}`, 20, 40);
      pdf.text(`Reference: ${selectedDispute.ticketNumber || selectedDispute.transactionId}`, 20, 45);
      
      // Transaction Information Section
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('Transaction Information', 20, 55);
      pdf.setFont(undefined, 'normal');
      
      const transactionData = [
        ['Ticket No:', selectedDispute.ticketNumber || 'N/A'],
        ['Transaction ID:', selectedDispute.transactionId || 'N/A'],
        ['Amount Disputed:', `${formatCurrency(selectedDispute.amount) || 'N/A'}`],
        ['Date:', formatDate(selectedDispute.createdAt) || 'N/A'],
        ['Channel:', selectedDispute.digitalChannel || 'N/A'],
        ['Card Number:', selectedDispute.debitCardNumber || 'N/A'],
        ['Card Type:', selectedDispute.cardType || 'N/A'],
        ['complaint On :', selectedDispute.vendorName ? selectedDispute.vendorName : "Transaction Id : ",selectedDispute.transactionId || 'N/A'],
      ];
      
      pdf.autoTable({
        startY: 60,
        head: [['Field', 'Value']],
        body: transactionData,
        theme: 'striped',
        headStyles: { fillColor: [0, 102, 204], textColor: 255 },
        styles: { overflow: 'linebreak' },
        columnStyles: { 0: { cellWidth: 50 } }
      });
      
      // Dispute Status Section
      const finalY = pdf.lastAutoTable.finalY + 10;
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('Dispute Status', 20, finalY);
      pdf.setFont(undefined, 'normal');
      
      // Get color for status
      let statusColor;
      switch (selectedDispute.status?.toLowerCase()) {
        case 'closed':
        case 'approved':
          statusColor = [46, 125, 50]; // Green
          break;
        case 'rejected':
          statusColor = [198, 40, 40]; // Red
          break;
        case 'submitted':
          statusColor = [50, 205, 50]; // Lime green
          break;
        default:
          statusColor = [33, 150, 243]; // Blue
      }
      
      const statusData = [
        [{ content: 'Current Status:', styles: { fontStyle: 'bold' } }, 
         { content: selectedDispute.status || 'N/A', styles: { textColor: statusColor } }],
        [{ content: 'Complaint Type:', styles: { fontStyle: 'bold' } }, selectedDispute.complaintType || 'N/A'],
        [{ content: 'Description:', styles: { fontStyle: 'bold' } }, selectedDispute.description || 'N/A']
      ];
      
      pdf.autoTable({
        startY: finalY + 5,
        body: statusData,
        theme: 'grid',
        styles: { overflow: 'linebreak' },
        columnStyles: { 0: { cellWidth: 40 } }
      });
      
      // Add footer
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setTextColor(100);
        pdf.text(
          `Page ${i} of ${pageCount} - Brilliant Bank Confidential`,
          pdf.internal.pageSize.getWidth() / 2,
          pdf.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }
      
      // Generate filename with dispute ticket number or transaction ID
      const filename = `Dispute_${selectedDispute.ticketNumber || selectedDispute.transactionId}.pdf`;
      
      // Download PDF
      pdf.save(filename);
}