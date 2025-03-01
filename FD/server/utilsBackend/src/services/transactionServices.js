const TransactionRepository = require('../repositories/transactionRepository');
const { sendMail } = require('../utils/email_checker');

class TransactionService {
    
    async makeTransaction(transactionData) {
        const { senderAccNo, receiverAccNo, amount, debitCardNumber,transactionId, status } = transactionData;
        const sender = await TransactionRepository.findUserByAccNo(senderAccNo);
        const receiver = await TransactionRepository.findUserByAccNo(receiverAccNo);
        
        if (!sender) throw new Error("Sender account not found");
        if (!receiver) throw new Error("Receiver account not found");
        if (sender.debitCardNumber != debitCardNumber) throw new Error("Invalid Debit Card Number");

        
        const senderName = sender.userName ? sender.userName : sender.vendorName
        const receiverName = receiver.vendorName ? receiver.vendorName : receiver.userName
        const transactionDataObject = { transactionId, senderAccNo, receiverAccNo, amount, debitCardNumber, status, senderName, receiverName };

        sender.transactions.push({
            senderName,
            receiverName,
            transactionId,
            transactionDate: new Date(),
            transactionAmount: amount,
            digitalChannel: "Online",
            status,
            debitCardNumber,
            senderAccNo,
            receiverAccNo
        });

        await sender.save();

        if (status === "paid") {
            receiver.transactions.push({
                senderName,
                receiverName,
                transactionId,
                transactionDate: new Date(),
                transactionAmount: amount,
                digitalChannel: "Online",
                status,
                debitCardNumber,
                senderAccNo,
                receiverAccNo
            });

            await receiver.save();
        }

        await TransactionRepository.createTransaction(transactionDataObject);

        return { message: "Transaction initiated successfully!", ...transactionDataObject };
    }

    async checkAndHandleFailedTransaction(transactionId, userEmail, amount, ticketNumber) {
        const transaction = await TransactionRepository.findFailedTransactionById(transactionId);
        const user = await TransactionRepository.getUserByEmail(userEmail);
        const userTransaction = user?.transactions.find(t => t.transactionId === transactionId && t.status === 'failed');

        if (transaction || userTransaction) {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: userEmail,
                subject: `Transaction Refund Notice - Transaction #${transactionId}`,
                html: `<p>Your dispute has been resolved and your money ${amount} will be refunded within 3 working days.</p>`
            };

            await sendMail(mailOptions);
            return true;
        }
        return false;
    }

    async getUserTransactions(email) {
        const user = await TransactionRepository.getUserByEmail(email);
        if (!user) throw new Error("User not found");
        return user.transactions;
    }

    async deleteTransactions(email) {
        return await TransactionRepository.deleteUserTransactions(email);
    }
}

module.exports = new TransactionService();
