const DisputesModel = require('../models/disputeModel');


class DisputesRepository {

    async getAllDisputes() {
        return await DisputesModel.find().sort({ createdAt: -1 });
    }

    
}

module.exports = new DisputesRepository();
