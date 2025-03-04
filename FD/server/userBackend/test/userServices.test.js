const { expect } = require('chai');
const sinon = require('sinon');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const UserService = require('../src/services/userServices');
const UserRepository = require('../src/repositories/userRepository');
const crypto = require('crypto');

describe('UserService', () => {
    let userStub, bcryptStub, jwtStub, mailStub;

    beforeEach(() => {
        sinon.restore();
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('registerUser', () => {
        it('should register a new user successfully', async () => {
            const mockUser = { email: 'user@example.com', password: 'hashedPassword' };
            sinon.stub(UserRepository, 'findUserByEmail').resolves(null);
            sinon.stub(bcrypt, 'hash').resolves('hashedPassword');
            sinon.stub(UserRepository, 'createUser').resolves(mockUser);

            const result = await UserService.registerUser({ email: 'user@example.com', password: 'password123' });

            expect(result).to.deep.equal(mockUser);
        });

        it('should throw an error if user already exists', async () => {
            sinon.stub(UserRepository, 'findUserByEmail').resolves({ email: 'user@example.com' });

            try {
                await UserService.registerUser({ email: 'user@example.com', password: 'password123' });
            } catch (error) {
                expect(error.message).to.equal('User already exists');
            }
        });

        it('should throw an error if vendor name already exists', async () => {
            sinon.stub(UserRepository, 'findUserByEmail').resolves(null);
            sinon.stub(UserRepository, 'findVendor').resolves({ vendorName: 'Vendor1' });

            try {
                await UserService.registerUser({ email: 'user@example.com', password: 'password123', vendorName: 'Vendor1' });
            } catch (error) {
                expect(error.message).to.equal('Vendor Name already exists');
            }
        });
    });

    describe('loginUser', () => {
        it('should return a token if login is successful', async () => {
            const mockUser = { _id: '123', email: 'user@example.com', password: 'hashedPassword', role: 'user' };
            sinon.stub(UserRepository, 'findUserByEmail').resolves(mockUser);
            sinon.stub(bcrypt, 'compare').resolves(true);
            sinon.stub(jwt, 'sign').returns('mockToken');

            const result = await UserService.loginUser('user@example.com', 'password123');

            expect(result).to.deep.equal({ token: 'mockToken', user: mockUser, message: "success" });
        });

        it('should throw an error if email is not found', async () => {
            sinon.stub(UserRepository, 'findUserByEmail').resolves(null);

            try {
                await UserService.loginUser('user@example.com', 'password123');
            } catch (error) {
                expect(error.message).to.equal('Invalid Credentials');
            }
        });

        it('should throw an error if password is incorrect', async () => {
            sinon.stub(UserRepository, 'findUserByEmail').resolves({ email: 'user@example.com', password: 'hashedPassword' });
            sinon.stub(bcrypt, 'compare').resolves(false);

            try {
                await UserService.loginUser('user@example.com', 'wrongpassword');
            } catch (error) {
                expect(error.message).to.equal('Invalid CREDENTIALS');
            }
        });
    });

    describe('sendOTP', () => {
        it('should send an OTP successfully', async () => {
            const mockUser = { email: 'user@example.com' };
            const mockTransporter = { sendMail: sinon.stub().resolves() };

            sinon.stub(UserRepository, 'findUserByEmail').resolves(mockUser);
            sinon.stub(nodemailer, 'createTransport').returns(mockTransporter);
            sinon.stub(crypto, 'randomInt').returns(1234);

            const result = await UserService.sendOTP('user@example.com');

            expect(result).to.deep.equal({ message: "OTP sent successfully" });
            expect(mockTransporter.sendMail.calledOnce).to.be.true;
        });

        it('should throw an error if user is not found', async () => {
            sinon.stub(UserRepository, 'findUserByEmail').resolves(null);

            try {
                await UserService.sendOTP('user@example.com');
            } catch (error) {
                expect(error.message).to.equal('User not found');
            }
        });
    });

    describe('verifyOTP', () => {
        it('should verify OTP and reset password', async () => {
            UserService.otpStore['user@example.com'] = 1234;
            sinon.stub(UserService, 'resetPassword').resolves({ message: "Password reset successful" });

            const result = await UserService.verifyOTP('user@example.com', 1234, 'newPassword');

            expect(result).to.deep.equal({ message: "Password reset successful" });
            expect(UserService.otpStore['user@example.com']).to.be.undefined;
        });

        it('should throw an error for invalid OTP', async () => {
            UserService.otpStore['user@example.com'] = 1234;

            try {
                await UserService.verifyOTP('user@example.com', 5678, 'newPassword');
            } catch (error) {
                expect(error.message).to.equal('Invalid OTP');
            }
        });
    });

    describe('resetPassword', () => {
        it('should reset the user password', async () => {
            const mockUser = { email: 'user@example.com', save: sinon.stub().resolves() };
            sinon.stub(UserRepository, 'findUserByEmail').resolves(mockUser);
            sinon.stub(bcrypt, 'hash').resolves('hashedPassword');

            const result = await UserService.resetPassword('user@example.com', 'newPassword');

            expect(mockUser.password).to.equal('hashedPassword');
            expect(result).to.equal(mockUser);
        });

        it('should throw an error if user is not found', async () => {
            sinon.stub(UserRepository, 'findUserByEmail').resolves(null);

            try {
                await UserService.resetPassword('user@example.com', 'newPassword');
            } catch (error) {
                expect(error.message).to.equal('User not found');
            }
        });
    });

    describe('deleteUser', () => {
        it('should delete a user successfully', async () => {
            sinon.stub(UserRepository, 'deleteUserById').resolves({ success: true });

            const result = await UserService.deleteUser('123');

            expect(result).to.deep.equal({ success: true });
        });
    });

    describe('getAllUsers', () => {
        it('should return all users', async () => {
            const mockUsers = [{ email: 'user1@example.com' }, { email: 'user2@example.com' }];
            sinon.stub(UserRepository, 'getAllUsers').resolves(mockUsers);

            const result = await UserService.getAllUsers();

            expect(result).to.deep.equal(mockUsers);
        });
    });

    describe('getUserById', () => {
        it('should return a user by ID', async () => {
            const mockUser = { _id: '123', email: 'user@example.com' };
            sinon.stub(UserRepository, 'findUserById').resolves(mockUser);

            const result = await UserService.getUserById('123');

            expect(result).to.deep.equal(mockUser);
        });
    });
});
