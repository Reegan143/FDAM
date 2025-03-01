const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserRepository = require('../repositories/userRepository');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

class UserService {
    constructor() {
        this.otpStore = {}; 
    }

    async registerUser(userData) {
        const { email, password } = userData;

            if (await UserRepository.findUserByEmail(email)) {
                throw new Error("User already exists");
            }

        if (userData.vendorName){
            const vendor = await UserRepository.findVendor(userData.vendorName)
            if (vendor) throw new Error("Vendor Name already exists")
        }

        userData.password = await bcrypt.hash(password, 10);
        return await UserRepository.createUser(userData);
    }

    async loginUser(email, password) {
        const user = await UserRepository.findUserByEmail(email);
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

    async getAllUsers() {
        return await UserRepository.getAllUsers();
    }

    async getUserById(userId) {
        return await UserRepository.findUserById(userId);
    }

    async updateUser(userId, updateData) {
        return await UserRepository.updateUserById(userId, updateData);
    }

    async deleteUser(userId) {
        return await UserRepository.deleteUserById(userId);
    }

    async getAllVendor() {
        return await UserRepository.findAllVendors();
    }

    async resetPassword(email, newPassword) {
        const user = await UserRepository.findUserByEmail(email);
        if (!user) throw new Error("User not found");

        user.password = await bcrypt.hash(newPassword, 10);
        return await user.save();
    }

    async sendOTP(email) {
        const user = await UserRepository.findUserByEmail(email);
        if (!user) throw new Error("User not found");

        const otp = crypto.randomInt(1000,9000);
        this.otpStore[email] = otp;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        await transporter.sendMail({
            to: user.email,
            subject: 'Password Reset OTP',
            html: `<p>Your OTP is <strong>${otp}</strong></p>`
        });

        return { message: "OTP sent successfully" };
    }

    async verifyOTP(email, otp, newPassword) {
        if (!this.otpStore[email] || this.otpStore[email] !== parseInt(otp)) {
            throw new Error("Invalid OTP");
        }

        await this.resetPassword(email, newPassword);
        delete this.otpStore[email];

        return { message: "Password reset successful" };
    }
}

module.exports = new UserService();
