const chai = require('chai');
const sinon = require('sinon');
const { expect } = chai;
const mongoose = require('mongoose');
const AuthRepository = require('../src/repositories/authRepository');
const AuthModel = require('../src/models/authModel');

describe('AuthRepository Unit Tests', function () {
    let userData, vendorData;

    beforeEach(async function () {
        // ✅ Mock user data
        userData = {
            _id: new mongoose.Types.ObjectId(),
            name: "Test User",
            email: "test@example.com",
            password: "hashedpassword"
        };

        // ✅ Mock vendor data
        vendorData = {
            _id: new mongoose.Types.ObjectId(),
            vendorName: "TestVendor",
            email: "vendor@example.com"
        };

        // ✅ Stub Mongoose methods
        sinon.stub(AuthModel, 'create').resolves(userData);
        sinon.stub(AuthModel, 'findOne');
    });

    afterEach(function () {
        sinon.restore();
    });

    describe('createUser()', function () {
        it('should create a new user', async function () {
            const result = await AuthRepository.createUser(userData);
            expect(result).to.deep.equal(userData);
        });

        it('should handle errors when creating a user', async function () {
            AuthModel.create.rejects(new Error('Database error'));

            try {
                await AuthRepository.createUser(userData);
            } catch (error) {
                expect(error.message).to.equal('Database error');
            }
        });
    });

    describe('findVendor()', function () {
        it('should find a vendor by vendor name', async function () {
            AuthModel.findOne.resolves(vendorData);

            const result = await AuthRepository.findVendor("TestVendor");
            expect(result).to.deep.equal(vendorData);
        });

        it('should return null if vendor not found', async function () {
            AuthModel.findOne.resolves(null);

            const result = await AuthRepository.findVendor("NonExistentVendor");
            expect(result).to.be.null;
        });

        it('should handle errors when finding a vendor', async function () {
            AuthModel.findOne.rejects(new Error('Database error'));

            try {
                await AuthRepository.findVendor("TestVendor");
            } catch (error) {
                expect(error.message).to.equal('Database error');
            }
        });
    });

    describe('findUserByEmail()', function () {
        it('should find a user by email', async function () {
            AuthModel.findOne.resolves(userData);

            const result = await AuthRepository.findUserByEmail("test@example.com");
            expect(result).to.deep.equal(userData);
        });

        it('should return null if user not found', async function () {
            AuthModel.findOne.resolves(null);

            const result = await AuthRepository.findUserByEmail("nonexistent@example.com");
            expect(result).to.be.null;
        });

        it('should handle errors when finding a user', async function () {
            AuthModel.findOne.rejects(new Error('Database error'));

            try {
                await AuthRepository.findUserByEmail("test@example.com");
            } catch (error) {
                expect(error.message).to.equal('Database error');
            }
        });
    });
});
