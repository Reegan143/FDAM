const TransactionService = require('../services/transactionServices');

class TransactionController {
    async makeTransaction(req, res) {
        try {
            const result = await TransactionService.makeTransaction(req.body);
            res.status(201).json(result);
        } catch (error) {
            res.status(500).json({ message: "Transaction failed", error: error.message });
        }
    }

    async checkAndHandleFailedTransaction(req, res) {
        try {
            const { transactionId, userEmail, amount, ticketNumber } = req.body;
            const result = await TransactionService.checkAndHandleFailedTransaction(transactionId, userEmail, amount, ticketNumber);
            res.status(200).json({ success: result });
        } catch (error) {
            res.status(500).json({ message: "Failed to handle transaction", error: error.message });
        }
    }

    async getUserTransactions(req, res) {
        try {
            const transactions = await TransactionService.getUserTransactions(req.user.email);
            res.status(200).json(transactions);
        } catch (error) {
            res.status(500).json({ message: "Failed to retrieve transactions", error: error.message });
        }
    }

    async deleteTransactions(req, res) {
        try {
            await TransactionService.deleteTransactions(req.user.email);
            res.status(200).json({ message: "Transactions deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Failed to delete transactions", error: error.message });
        }
    }
}

module.exports = new TransactionController();
