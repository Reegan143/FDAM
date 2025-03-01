const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AuthRepository = require('../repositories/authRepository');


class authService {
    constructor() {
        this.otpStore = {}; 
    }

    async registerUser(userData) {
        const { email, password } = userData;

            if (await AuthRepository.findUserByEmail(email)) {
                throw new Error("User already exists");
            }

        if (userData.vendorName){
            const vendor = await AuthRepository.findVendor(userData.vendorName)
            if (vendor) throw new Error("Vendor Name already exists")
        }

        userData.password = await bcrypt.hash(password, 10);
        return await AuthRepository.createUser(userData);
    }

    async loginUser(email, password) {
        const user = await AuthRepository.findUserByEmail(email);
        if (!user) {    
            throw new Error("Invalid Credentials");
        
        }
        if (!(await bcrypt.compare(password, user.password))){
            throw new Error("Invalid CREDENTIALS");
        }

        const token = jwt.sign({ userId: user._id, role: user.role, email: user.email, 
                        adminId : user.adminId }, process.env.JWT_SECRET, { expiresIn: '8h' });
                        
        return { token, user, message : "success" };
    }


}

module.exports = new authService();
