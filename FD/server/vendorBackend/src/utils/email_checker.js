// Email checker utility
const nodemailer = require('nodemailer');
require('dotenv').config();

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

function sendMail(mailtemplate) {
  transporter.sendMail(mailtemplate, function(error, info){
    if (error) {
      console.log(error.message);
    } else {
      console.log('Email sent: ' + info.response);
    }
  })};

const   emailHtmlTemplate = (customerName, ticketNumber, merchantName, bankName, bankContactInfo, content, amount, status) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Dispute ${status}</title>
        <style>
            body { font-family: Arial, sans-serif; color: #333; background-color: #f4f4f4; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); }
            .header { text-align: center; padding-bottom: 20px; }
            h2 { color: #2c3e50; }
            .content { margin-bottom: 20px; }
            .footer { text-align:left; font-size: 0.8em; color: #aaa; }
            .highlight { color: #3498db; }
            .details { margin-top: 10px; }
        </style>
    </head>
    <body>

    <div class="container">
        <div class="header">
            <h2>Dispute Has Been ${status}</h2>
            <p>Thank you for contacting us. It's Regarding your dispute request.</p>
        </div>

        <div class="content">
            <p>Dear <strong>${customerName}</strong>,</p>
            <p>${content}</p>
            <div class="details">
                <p><strong>Ticket Number:</strong> <span class="highlight">${ticketNumber}</span></p>
                <p><strong>Transaction Amount:</strong> ${amount || "rejected"}</p>
                <p><strong>Complaint On:</strong> ${merchantName || "N/A"}</p>
            </div>


            <p>If you have any questions or need further assistance, feel free to contact us at <strong>${bankContactInfo}</strong>.</p>
        </div>

        <div class="footer">
            <p>Best regards,</p>
            <p><strong>${bankName}</strong><br>${bankContactInfo}</p>
        </div>
    </div>

    </body>
    </html>
  `;
};


module.exports = { sendMail, emailHtmlTemplate };
