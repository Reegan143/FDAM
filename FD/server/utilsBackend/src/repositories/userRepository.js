const UserModel = require('../models/userModel');

class UserRepository {
    async createUser(userData) {
        return await UserModel.create(userData);
    }

    async findVendor(vendorName) {
        return await UserModel.findOne({ vendorName: vendorName})
    }

    async findUserByEmail(email) {
        return await UserModel.findOne({ email });
    }

    async findUserByAccNo(accNo) {
        return await UserModel.findOne({ accNo });
    }

    async findUserByCuid(cuid) {
        return await UserModel.findOne({ cuid });
    }

    async findUserById(userId) {
        return await UserModel.findById(userId);
    }

    async findUserByDebitCard(debitCardNumber) {
        return await UserModel.findOne({ debitCardNumber });
    }

    async updateUserById(userId, updateData) {
        return await UserModel.findByIdAndUpdate(userId, updateData, { new: true });
    }

    async deleteUserById(userId) {
        return await UserModel.findByIdAndDelete(userId);
    }

    async getAllUsers() {
        return await UserModel.find();
    }

    async storeOTP(email, otp) {
        return await UserModel.findOneAndUpdate({ email }, { otp }, { new: true });
    }

    async verifyOTP(email, otp) {
        const user = await UserModel.findOne({ email, otp });
        return user ? true : false;
    }

    async findOneAndUpdate(email,apiKey){
        return await UserModel.findOneAndUpdate({ email }, { apiKey }, { new: true })
    }
}

module.exports = new UserRepository();
