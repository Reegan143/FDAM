const DisputesModel = require('../models/disputeModel');
const UserModel = require('../models/userModel');
const DisputesRepository = require('../repositories//disputesRepository')
const ApiModel = require('../models/apiModel');

class AdminRepository {
    async createAdmin(adminData) {
        return await UserModel.create(adminData);
    }

    async getAllDisputes(){
        return await DisputesRepository.getAllDisputes()
    }


    async findAdminByEmail(email) {
        return await UserModel.findOne({ email });
    }

    
    async findAndDeleteApiKeyRequest(id){
        return await ApiModel.findByIdAndDelete(id);
    }
    
    async findApiKeyRequest(id) {
        return await ApiModel.findOne({ _id : id });
    }
    async updateApiKeyRequest(id, status) {
        return await ApiModel.findOneAndUpdate({_id : id} , {status : status})
    }


    async getAllApiKeyRequests(){
        return await ApiModel.find();
    }

    async updateDisputeStatus(disputeId, status, remarks, adminId) {
        const disputes = await DisputesRepository.getDisputeById(disputeId)
        if (!disputes) throw new Error('Dispute not found');
        if (disputes.status === 'Resolved' || disputes.status === "closed") throw new Error('Dispute already resolved');
        return await DisputesRepository.updateById(disputeId, status, remarks, adminId)
    }

    async generateFraudReport(startDate, endDate) {
        return await DisputesModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
                }
            },
            {
                $group: {
                    _id: "$complaintType",
                    count: { $sum: 1 },
                    totalAmount: { $sum: "$disputedAmount" }
                }
            }
        ]);
    }
}

module.exports = new AdminRepository();
