const authService = require('../services/authServices');

class authController {
    
    async registerUser(req, res) {
        try {
            const user = await authService.registerUser(req.body);
            res.status(201).json({ message: "User registered successfully", user });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async loginUser(req, res) {
        try {
            const { email, password } = req.body;
            const data = await authService.loginUser(email, password);
            res.status(200).json(data);
        } catch (error) {
            res.status(401).json({ error: error.message });
        }
    }

}

module.exports = new authController();
