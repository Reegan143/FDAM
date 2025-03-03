const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const { expect } = chai;
const UserRepository = require('../src/repositories/userRepository');
const UserModel = require('../src/models/userModel');

describe('UserRepository Unit Tests', function () {
    let userData;

    beforeEach(async function () {
        // Mock user data
        userData = {
            _id: new mongoose.Types.ObjectId(),
            name: "Test User",
            vendorName: "Test Vendor",
            email: "user@example.com",
            accNo: "1234567890",
            cuid: "CUID123",
            debitCardNumber: "1111-2222-3333-4444",
            otp: "123456",
            apiKey: "API_KEY_123"
        };

        // Stub Mongoose methods
        sinon.stub(UserModel, 'create').resolves(userData);
        sinon.stub(UserModel, 'findOne').resolves(userData);
        sinon.stub(UserModel, 'findById').resolves(userData);
        sinon.stub(UserModel, 'findByIdAndUpdate').resolves(userData);
        sinon.stub(UserModel, 'findByIdAndDelete').resolves(userData);
        sinon.stub(UserModel, 'findOneAndUpdate').resolves(userData);
        sinon.stub(UserModel, 'find').resolves([userData]);
    });

    afterEach(function () {
        sinon.restore(); // Restore all stubs after each test
    });

    it('should create a user', async function () {
        const result = await UserRepository.createUser(userData);
        expect(result).to.deep.equal(userData);
    });

    it('should find a vendor by name', async function () {
        const result = await UserRepository.findVendor("Test Vendor");
        expect(result).to.deep.equal(userData);
    });

    it('should find a user by email', async function () {
        const result = await UserRepository.findUserByEmail("user@example.com");
        expect(result).to.deep.equal(userData);
    });

    it('should find a user by account number', async function () {
        const result = await UserRepository.findUserByAccNo("1234567890");
        expect(result).to.deep.equal(userData);
    });

    it('should find a user by CUID', async function () {
        const result = await UserRepository.findUserByCuid("CUID123");
        expect(result).to.deep.equal(userData);
    });

    it('should find a user by ID', async function () {
        const result = await UserRepository.findUserById(userData._id);
        expect(result).to.deep.equal(userData);
    });

    it('should find a user by debit card number', async function () {
        const result = await UserRepository.findUserByDebitCard("1111-2222-3333-4444");
        expect(result).to.deep.equal(userData);
    });

    it('should update a user by ID', async function () {
        const updateData = { name: "Updated User" };
        const result = await UserRepository.updateUserById(userData._id, updateData);
        expect(result).to.deep.equal(userData);
    });

    it('should delete a user by ID', async function () {
        const result = await UserRepository.deleteUserById(userData._id);
        expect(result).to.deep.equal(userData);
    });

    it('should get all users', async function () {
        const result = await UserRepository.getAllUsers();
        expect(result).to.be.an('array').that.is.not.empty;
    });

    it('should store OTP', async function () {
        const result = await UserRepository.storeOTP("user@example.com", "654321");
        expect(result).to.deep.equal(userData);
    });

    it('should verify OTP successfully', async function () {
        const result = await UserRepository.verifyOTP("user@example.com", "123456");
        expect(result).to.be.true;
    });

    it('should return false for incorrect OTP', async function () {
        UserModel.findOne.resolves(null); // Simulate incorrect OTP
        const result = await UserRepository.verifyOTP("user@example.com", "wrong_otp");
        expect(result).to.be.false;
    });

    it('should update API key for user', async function () {
        const result = await UserRepository.findOneAndUpdate("user@example.com", "NEW_API_KEY");
        expect(result).to.deep.equal(userData);
    });

    // Error handling tests
    it('should handle error when creating a user', async function () {
        UserModel.create.rejects(new Error('Database error'));

        try {
            await UserRepository.createUser(userData);
        } catch (error) {
            expect(error.message).to.equal("Database error");
        }
    });

    it('should handle error when finding a user by email', async function () {
        UserModel.findOne.rejects(new Error('Database error'));

        try {
            await UserRepository.findUserByEmail("user@example.com");
        } catch (error) {
            expect(error.message).to.equal("Database error");
        }
    });

    it('should handle error when updating a user by ID', async function () {
        UserModel.findByIdAndUpdate.rejects(new Error('Database error'));

        try {
            await UserRepository.updateUserById(userData._id, { name: "New Name" });
        } catch (error) {
            expect(error.message).to.equal("Database error");
        }
    });

    it('should handle error when deleting a user by ID', async function () {
        UserModel.findByIdAndDelete.rejects(new Error('Database error'));

        try {
            await UserRepository.deleteUserById(userData._id);
        } catch (error) {
            expect(error.message).to.equal("Database error");
        }
    });

    it('should handle error when verifying OTP', async function () {
        UserModel.findOne.rejects(new Error('Database error'));

        try {
            await UserRepository.verifyOTP("user@example.com", "123456");
        } catch (error) {
            expect(error.message).to.equal("Database error");
        }
    });

    it('should handle error when updating API key', async function () {
        UserModel.findOneAndUpdate.rejects(new Error('Database error'));

        try {
            await UserRepository.findOneAndUpdate("user@example.com", "NEW_API_KEY");
        } catch (error) {
            expect(error.message).to.equal("Database error");
        }
    });
});
