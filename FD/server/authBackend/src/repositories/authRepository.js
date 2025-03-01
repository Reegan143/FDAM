const AuthModel = require('../models/authModel');

class AuthRepository {
    async createUser(userData) {
        return await AuthModel.create(userData);
    }

    async findVendor(vendorName) {
        return await AuthModel.findOne({ vendorName: vendorName})
    }
    async findUserByEmail(email){
        return await AuthModel.findOne({ email: email})
    }

    
}

module.exports = new AuthRepository();
