const DisputesModel = require('../models/disputeModel');
const UserModel = require('../models/userModel');
const TransactionModel = require('../models/tranasactionModel');
const crypto = require('crypto');

class DisputesRepository {
    async createDispute(disputeData) {
        return await DisputesModel.create(disputeData);
    }

    async findDisputeByTransactionId(transactionId) {
        return await DisputesModel.findOne({ transactionId });
    }

    async findTransactionById(transactionId) {
        return await TransactionModel.findOne({ transactionId });
    }

    async findUserByDebitCard(debitCardNumber) {
        return await UserModel.findOne({ debitCardNumber });
    }

    async findAdmin() {        
        return await UserModel.findOne({ role: 'admin' });
      }

    async getAllDisputes() {
        return await DisputesModel.find().sort({ createdAt: -1 });
    }

    async getUserDisputes(email) {
        return await DisputesModel.find({ email }).sort({ createdAt: -1 });
    }

    async getDisputeById(id) {
        return await DisputesModel.findById(id);
    }

    async getDisputeByVendorName(vendorName) {
        return await DisputesModel.find({ vendorName });
    }

    async getDisputeByTicketNumber(ticketNumber) {
        return await DisputesModel.findOne({ticketNumber });
    }
    async generateUniqueTicketNumber() {
        let ticketNumber;
        do {
            ticketNumber = crypto.randomInt(100000 , 900000);
        } while (await DisputesModel.exists({ ticketNumber }));
        return ticketNumber;
    }
    async updateById(disputeId, status, remarks, adminId){
        return await DisputesModel.findByIdAndUpdate(
            disputeId,
            { status, adminRemarks: remarks, resolvedBy: adminId, resolvedAt: new Date() },
            { new: true }
        )
    }

    async saveDispute(disputes){
        return await disputes.save();
    }
}

module.exports = new DisputesRepository();
