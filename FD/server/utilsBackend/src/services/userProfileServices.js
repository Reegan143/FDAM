const bcrypt = require('bcrypt');
const UserProfileRepository = require('../repositories/userProfileRepository');

class UserProfileService {
    async getUserProfile(email) {
        const user = await UserProfileRepository.getUserByEmail(email);
        if (!user) throw new Error("User not found");
        return user;
    }

    async updateUserProfile(email, updateData) {
        const updatedUser = await UserProfileRepository.updateUserProfile(email, updateData);
        if (!updatedUser) throw new Error("Failed to update profile");
        return updatedUser;
    }

}

module.exports = new UserProfileService();
