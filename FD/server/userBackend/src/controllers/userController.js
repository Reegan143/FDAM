const UserService = require('../services/userServices');

class UserController {
    
    async registerUser(req, res) {
        try {
            const user = await UserService.registerUser(req.body);
            res.status(201).json({ message: "User registered successfully", user });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async loginUser(req, res) {
        try {
            const { email, password } = req.body;
            const data = await UserService.loginUser(email, password);
            res.status(200).json(data);
        } catch (error) {
            res.status(401).json({ error: error.message });
        }
    }

    async getAllUsers(req, res) {
        try {
            const users = await UserService.getAllUsers();
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getUserById(req, res) {
        try {
            const user = await UserService.getUserById(req.user.userId);
            res.status(200).json(user);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }

    async updateUser(req, res) {
        try {
            const user = await UserService.updateUser(req.params.id, req.body);
            res.status(200).json({ message: "User updated successfully", user });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async deleteUser(req, res) {
        try {
            await UserService.deleteUser(req.params.id);
            res.status(200).json({ message: "User deleted successfully" });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async sendOTP(req, res) {
        try {
            const data = await UserService.sendOTP(req.body.email);
            res.status(200).json(data);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async verifyOTP(req, res) {
        try {
            const { email, otp, newPassword } = req.body;
            const data = await UserService.verifyOTP(email, otp, newPassword);
            res.status(200).json(data);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getAllVendor(req, res) {
        try {
            const vendors = await UserService.getAllVendor();
            res.status(200).json(vendors);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new UserController();
