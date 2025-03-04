const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const { expect } = chai;
const TransactionRepository = require('../src/repositories/transactionRepository');
const TransactionModel = require('../src/models/tranasactionModel');
const UserModel = require('../src/models/userModel');

describe('TransactionRepository Unit Tests', function () {
    let transactionData, userData;

    beforeEach(async function () {
        // Mock transaction data
        transactionData = {
            _id: new mongoose.Types.ObjectId(),
            transactionId: "TXN12345",
            userId: new mongoose.Types.ObjectId(),
            amount: 1000,
            status: "pending",
            createdAt: new Date()
        };

        // Mock user data
        userData = {
            _id: new mongoose.Types.ObjectId(),
            name: "Test User",
            email: "user@example.com",
            accNo: "1234567890",
            transactions: [transactionData]
        };

        // Stub Mongoose methods properly
        sinon.stub(TransactionModel, 'create').resolves(transactionData);
        sinon.stub(UserModel, 'findOne').resolves(userData);
        sinon.stub(TransactionModel, 'findOne').resolves(transactionData);
        sinon.stub(TransactionModel, 'findOneAndUpdate').resolves({ ...transactionData, status: "completed" });
        sinon.stub(UserModel, 'findOneAndUpdate').resolves({ ...userData, transactions: [] });
    });

    afterEach(function () {
        sinon.restore(); // Restore all stubs after each test
    });

    it('should create a transaction', async function () {
        const result = await TransactionRepository.createTransaction(transactionData);
        expect(result).to.deep.equal(transactionData);
    });

    it('should find a user by account number', async function () {
        const result = await TransactionRepository.findUserByAccNo("1234567890");
        expect(result).to.deep.equal(userData);
    });

    it('should find a transaction by ID', async function () {
        const result = await TransactionRepository.findTransactionById("TXN12345");
        expect(result).to.deep.equal(transactionData);
    });

    it('should find a failed transaction by ID', async function () {
        TransactionModel.findOne.resolves({ ...transactionData, status: "failed" });
        const result = await TransactionRepository.findFailedTransactionById("TXN12345");
        expect(result.status).to.equal("failed");
    });

    it('should update a transaction status', async function () {
        const result = await TransactionRepository.updateTransactionStatus("TXN12345", "completed");
        expect(result.status).to.equal("completed");
    });

    it('should get a user by email', async function () {
        const result = await TransactionRepository.getUserByEmail("user@example.com");
        expect(result).to.deep.equal(userData);
    });

    it('should update user transactions', async function () {
        const newTransactions = [{ ...transactionData, amount: 2000 }];
        const result = await TransactionRepository.updateUserTransactions("user@example.com", newTransactions);
        expect(result.transactions).to.be.an('array').that.is.not.empty;
    });

    it('should delete user transactions', async function () {
        const result = await TransactionRepository.deleteUserTransactions("user@example.com");
        expect(result.transactions).to.be.an('array').that.is.empty;
    });

    // Error handling tests
    it('should handle error when creating a transaction', async function () {
        TransactionModel.create.rejects(new Error('Database error'));

        try {
            await TransactionRepository.createTransaction(transactionData);
        } catch (error) {
            expect(error.message).to.equal("Database error");
        }
    });

    it('should handle error when finding a user by account number', async function () {
        UserModel.findOne.rejects(new Error('Database error'));

        try {
            await TransactionRepository.findUserByAccNo("1234567890");
        } catch (error) {
            expect(error.message).to.equal("Database error");
        }
    });

    it('should handle error when finding a transaction by ID', async function () {
        TransactionModel.findOne.rejects(new Error('Database error'));

        try {
            await TransactionRepository.findTransactionById("TXN12345");
        } catch (error) {
            expect(error.message).to.equal("Database error");
        }
    });

    it('should handle error when updating transaction status', async function () {
        TransactionModel.findOneAndUpdate.rejects(new Error('Database error'));

        try {
            await TransactionRepository.updateTransactionStatus("TXN12345", "completed");
        } catch (error) {
            expect(error.message).to.equal("Database error");
        }
    });

    it('should handle error when updating user transactions', async function () {
        UserModel.findOneAndUpdate.rejects(new Error('Database error'));

        try {
            await TransactionRepository.updateUserTransactions("user@example.com", []);
        } catch (error) {
            expect(error.message).to.equal("Database error");
        }
    });

    it('should handle error when deleting user transactions', async function () {
        UserModel.findOneAndUpdate.rejects(new Error('Database error'));

        try {
            await TransactionRepository.deleteUserTransactions("user@example.com");
        } catch (error) {
            expect(error.message).to.equal("Database error");
        }
    });
});
