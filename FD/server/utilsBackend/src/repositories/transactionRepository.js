const TransactionModel = require('../models/tranasactionModel');
const UserModel = require('../models/userModel');

class TransactionRepository {
    async createTransaction(transactionData) {
        return await TransactionModel.create(transactionData);
    }

    async findUserByAccNo(accNo) {
        return await UserModel.findOne({ accNo: accNo });
    }

    async findTransactionById(transactionId) {
        return await TransactionModel.findOne({ transactionId });
    }

    async findFailedTransactionById(transactionId) {
        return await TransactionModel.findOne({ transactionId, status: 'failed' });
    }

    async updateTransactionStatus(transactionId, status) {
        return await TransactionModel.findOneAndUpdate({ transactionId }, { status }, { new: true });
    }

    async getUserByEmail(email) {
        return await UserModel.findOne({ email });
    }

    async updateUserTransactions(email, transactions) {
        return await UserModel.findOneAndUpdate({ email }, { transactions }, { new: true });
    }

    async deleteUserTransactions(email) {
        return await UserModel.findOneAndUpdate({ email }, { transactions: [] }, { new: true });
    }
}

module.exports = new TransactionRepository();
