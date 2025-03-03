const DisputesModel = require('../models/disputeModel');


class DisputesRepository {

    async getAllDisputes() {
        return await DisputesModel.find().sort({ createdAt: -1 });
    }

    async updateById(disputeId, status, remarks, adminId){
        return await DisputesModel.findByIdAndUpdate(
            disputeId,
            { status, adminRemarks: remarks, resolvedBy: adminId, resolvedAt: new Date() },
            { new: true }
        )
    }

    async getDisputeById(id) {
        return await DisputesModel.findById(id);
    }

    
}

module.exports = new DisputesRepository();
