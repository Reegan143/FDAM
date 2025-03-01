const mail = require('./email_checker')


exports.sendMail = async (email, ticketNumber,complaintName, amount, content, status, vendorName) => {
    await mail.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Dispute ${status} - Ticket #${ticketNumber}`,
      html: mail.emailHtmlTemplate(complaintName, ticketNumber, 
         vendorName, 
        'Brillian Bank', 
        '+91 8982895246',
        content,
        amount,
        status
      ),
    });
  }

