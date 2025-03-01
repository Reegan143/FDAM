const UserModel = require('../models/userModel');

class UserProfileRepository {
    async getUserByEmail(email) {
        return await UserModel.findOne({ email }, { password: 0 }); // Exclude password
    }

    async updateUserProfile(email, updateData) {
        return await UserModel.findOneAndUpdate({ email }, updateData, { new: true });
    }

    async updateUserPassword(email, hashedPassword) {
        return await UserModel.findOneAndUpdate({ email }, { password: hashedPassword }, { new: true });
    }
}

module.exports = new UserProfileRepository();
