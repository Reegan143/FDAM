const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const { expect } = chai;

const UserRepository = require('../src/repositories/userRepository');
const UserModel = require('../src/models/userModel');

describe('UserRepository Unit Tests', function () {
    let userData;

    beforeEach(function () {
        userData = {
            _id: new mongoose.Types.ObjectId(),
            name: "Test User",
            email: "test@example.com",
            password: "hashedpassword",
            accNo: "123456789",
            cuid: "CUID123",
            debitCardNumber: "1234-5678-9012-3456",
            role: "user",
            otp: "123456"
        };

        //  Stub Mongoose methods
        sinon.stub(UserModel, 'create').resolves(userData);
        sinon.stub(UserModel, 'findOne');
        sinon.stub(UserModel, 'findById');
        sinon.stub(UserModel, 'findByIdAndUpdate');
        sinon.stub(UserModel, 'findByIdAndDelete');
        sinon.stub(UserModel, 'find');
        sinon.stub(UserModel, 'findOneAndUpdate');
    });

    afterEach(function () {
        sinon.restore();
    });

    describe('createUser()', function () {
        it('should create a new user', async function () {
            const result = await UserRepository.createUser(userData);
            expect(result).to.deep.equal(userData);
        });

        it('should handle errors when creating a user', async function () {
            UserModel.create.rejects(new Error('Database error'));

            try {
                await UserRepository.createUser(userData);
            } catch (error) {
                expect(error.message).to.equal('Database error');
            }
        });
    });

    describe('findVendor()', function () {
        it('should find a vendor by vendor name', async function () {
            UserModel.findOne.resolves(userData);

            const result = await UserRepository.findVendor("TestVendor");
            expect(result).to.deep.equal(userData);
        });

        it('should return null if vendor not found', async function () {
            UserModel.findOne.resolves(null);

            const result = await UserRepository.findVendor("UnknownVendor");
            expect(result).to.be.null;
        });
    });

    describe('findUserByEmail()', function () {
        it('should find a user by email', async function () {
            UserModel.findOne.resolves(userData);

            const result = await UserRepository.findUserByEmail("test@example.com");
            expect(result).to.deep.equal(userData);
        });

        it('should return null if user not found', async function () {
            UserModel.findOne.resolves(null);

            const result = await UserRepository.findUserByEmail("unknown@example.com");
            expect(result).to.be.null;
        });
    });

    describe('findUserByAccNo()', function () {
        it('should find a user by account number', async function () {
            UserModel.findOne.resolves(userData);

            const result = await UserRepository.findUserByAccNo("123456789");
            expect(result).to.deep.equal(userData);
        });
    });

    describe('findUserByCuid()', function () {
        it('should find a user by CUID', async function () {
            UserModel.findOne.resolves(userData);

            const result = await UserRepository.findUserByCuid("CUID123");
            expect(result).to.deep.equal(userData);
        });
    });

    describe('findUserById()', function () {
        it('should find a user by ID', async function () {
            UserModel.findById.resolves(userData);

            const result = await UserRepository.findUserById(userData._id);
            expect(result).to.deep.equal(userData);
        });
    });

    describe('findUserByDebitCard()', function () {
        it('should find a user by debit card number', async function () {
            UserModel.findOne.resolves(userData);

            const result = await UserRepository.findUserByDebitCard("1234-5678-9012-3456");
            expect(result).to.deep.equal(userData);
        });
    });

    describe('updateUserById()', function () {
        it('should update user by ID', async function () {
            UserModel.findByIdAndUpdate.resolves(userData);

            const result = await UserRepository.updateUserById(userData._id, { name: "Updated User" });
            expect(result).to.deep.equal(userData);
        });

        it('should handle errors when updating a user', async function () {
            UserModel.findByIdAndUpdate.rejects(new Error('Database error'));

            try {
                await UserRepository.updateUserById(userData._id, { name: "Updated User" });
            } catch (error) {
                expect(error.message).to.equal('Database error');
            }
        });
    });

    describe('deleteUserById()', function () {
        it('should delete a user by ID', async function () {
            UserModel.findByIdAndDelete.resolves(userData);

            const result = await UserRepository.deleteUserById(userData._id);
            expect(result).to.deep.equal(userData);
        });

        it('should handle errors when deleting a user', async function () {
            UserModel.findByIdAndDelete.rejects(new Error('Database error'));

            try {
                await UserRepository.deleteUserById(userData._id);
            } catch (error) {
                expect(error.message).to.equal('Database error');
            }
        });
    });

    describe('getAllUsers()', function () {
        it('should return all users', async function () {
            UserModel.find.resolves([userData]);

            const result = await UserRepository.getAllUsers();
            expect(result).to.deep.equal([userData]);
        });
    });

    describe('storeOTP()', function () {
        it('should store OTP for a user', async function () {
            UserModel.findOneAndUpdate.resolves(userData);

            const result = await UserRepository.storeOTP("test@example.com", "123456");
            expect(result).to.deep.equal(userData);
        });
    });

    describe('verifyOTP()', function () {
        it('should return true if OTP matches', async function () {
            UserModel.findOne.resolves(userData);

            const result = await UserRepository.verifyOTP("test@example.com", "123456");
            expect(result).to.be.true;
        });

        it('should return false if OTP does not match', async function () {
            UserModel.findOne.resolves(null);

            const result = await UserRepository.verifyOTP("test@example.com", "000000");
            expect(result).to.be.false;
        });
    });

    describe('findOneAndUpdate()', function () {
        it('should update user with new API key', async function () {
            UserModel.findOneAndUpdate.resolves(userData);

            const result = await UserRepository.findOneAndUpdate("test@example.com", "new-api-key");
            expect(result).to.deep.equal(userData);
        });
    });
});
