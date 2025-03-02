const DisputesModel = require('../models/disputeModel');


class DisputesRepository {

    async getAllDisputes() {
        return await DisputesModel.find().sort({ createdAt: -1 });
    }

    async getDisputeById(id) {
        return await DisputesModel.findById(id);
    }

    
}

module.exports = new DisputesRepository();
