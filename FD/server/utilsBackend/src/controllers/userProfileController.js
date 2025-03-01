const UserProfileService = require('../services/userProfileServices');

class UserProfileController {
    async getUserProfile(req, res) {
        try {
            const user = await UserProfileService.getUserProfile(req.user.email);
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching user profile', error: error.message });
        }
    }

    async updateUserProfile(req, res) {
        try {
            const updatedUser = await UserProfileService.updateUserProfile(req.user.email, req.body);
            res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
        } catch (error) {
            res.status(500).json({ message: 'Error updating user profile', error: error.message });
        }
    }

    
}

module.exports = new UserProfileController();
