const DisputesRepository = require('../repositories/disputesRepository');
const NotificationRepository = require('../repositories/notificationRepository');
const UserRepository = require('../repositories/userRepository')
const { sendMail } = require('../utils/sendMail');

class DisputesService {
    

    async registerDispute(user, disputeData) {
        const { transactionId, complaintType, vendorName, description, debitCardNumber } = disputeData;
        const admin = await DisputesRepository.findAdmin();
        if (!admin) throw new Error('Admin not found');
        
        let isTransactionExist = await DisputesRepository.findDisputeByTransactionId(transactionId);
        let transaction = await DisputesRepository.findTransactionById(transactionId);
        if (!transaction) throw new Error('No transaction found');

        if(isTransactionExist && isTransactionExist.status === 'submitted'){
            throw new Error('Transaction has already been submitted');
        }
        
        const amount = transaction.amount;
        const userRecord = await DisputesRepository.findUserByDebitCard(debitCardNumber);
        if (!userRecord) throw new Error('Debit Card Number Not Found');
        const cardType = userRecord.cardType;
        const isUser = await UserRepository.findUserById(user.userId)
        const userName = isUser.userName
        
        const ticketNumber = await DisputesRepository.generateUniqueTicketNumber();
        disputeData = { ...disputeData, ticketNumber, email: user.email, amount, adminId: admin.adminId, cardType };
        
        if (vendorName) {
            const vendor = await UserRepository.findVendor( vendorName );
            if (!vendor) throw new Error('Vendor not found');
            
            const message = `${userName} has raised a dispute on you. <p>Complaint Type: ${complaintType}</p>
            <p>User's Complaint: ${description}</p>`;
            await sendMail(vendor.email, ticketNumber, vendorName.toUpperCase(), amount, message, 'Raised upon You', vendorName);
            
            await NotificationRepository.createNotification({
                email: vendor.email,
                ticketNumber,
                userName: vendorName,
                messages: `A dispute has been raised by ${userName} upon you.`,
                complaintType
            });
        }
        
        const dispute = await DisputesRepository.createDispute(disputeData);
        
        await NotificationRepository.createNotification({
            email: user.email,
            ticketNumber,
            userName: userName,
            messages: `Dear ${userName}, Your Complaint/Dispute has been submitted successfully.`,
            complaintType
        });

        await NotificationRepository.createNotification({
            email: admin.email,
            ticketNumber,
            userName: userName,
            messages: `${userName} has been raised the dispute/complaint upon ${vendorName ? vendorName :  `Transaction No : ${transactionId}`}.`,
            complaintType
        });
        
        let message = "Your Complaint/Dispute has been submitted successfully. Our team will review the dispute and get back to you within the next 7-10 business days.";
        await sendMail(user.email, ticketNumber, userName, amount, message, 'Registered', vendorName ? vendorName : `Transaction Id : ${transactionId}`);
        
        if(transaction.status === 'failed' && !isTransactionExist){
            const message = `Your Money ${amount} will be refunded to your bank account within 3 working days`;
            return await this.handlefailedTransaction(user.email, ticketNumber, userName, amount, message, 'approved')
        }
        return dispute;
    }

    async handlefailedTransaction(email, ticketNumber, userName, amount, message, status){
        setTimeout(async ()=>{
            const dispute = await DisputesRepository.getDisputeByTicketNumber(ticketNumber);
        dispute.status = status;
        await DisputesRepository.saveDispute(dispute);
        await sendMail(email, ticketNumber, userName, amount, message, status,dispute.vendorName ?
                         dispute.vendorName : `Transaction Id : ${dispute.transactionId}` );
         
        await NotificationRepository.createNotification({
            email: email,
            ticketNumber: ticketNumber,
            userName: userName,
            messages: `Your transaction has failed. Your money ${amount} will be refunded to your bank account within 3 working days.`,
            complaintType: 'failed transaction'
        })
        }, 20000)
    }

    async getAllDisputes() {
        return await DisputesRepository.getAllDisputes();
    }

    async getUserDisputes(email) {
        return await DisputesRepository.getUserDisputes(email);
    }

    async getDisputeById(id) {
        return await DisputesRepository.getDisputeById(id);
    }

    async getDisputeByVendorName(vendorName) {
        return await DisputesRepository.getDisputeByVendorName(vendorName);
    }

    async getDisputeByTicketNumber(ticketNumber) {
        return await DisputesRepository.getDisputeByTicketNumber(ticketNumber);
    }
}

module.exports = new DisputesService();
