const chai = require('chai');
const sinon = require('sinon');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { expect } = chai;

const authService = require('../src/services/authServices');
const AuthRepository = require('../src/repositories/authRepository');

describe('AuthService Unit Tests', function () {
    let userData, vendorData;

    beforeEach(function () {
        userData = {
            _id: "12345",
            name: "Test User",
            email: "test@example.com",
            password: "hashedpassword",
            role: "user",
            adminId: "admin123"
        };

        vendorData = {
            _id: "67890",
            vendorName: "TestVendor",
            email: "vendor@example.com"
        };

        sinon.stub(AuthRepository, 'createUser').resolves(userData);
        sinon.stub(AuthRepository, 'findUserByEmail');
        sinon.stub(AuthRepository, 'findVendor');
        sinon.stub(bcrypt, 'hash').resolves('hashedpassword');
        sinon.stub(bcrypt, 'compare').resolves(true);
        sinon.stub(jwt, 'sign').returns('fake_jwt_token');
    });

    afterEach(function () {
        sinon.restore();
    });

    describe('registerUser()', function () {
        it('should register a user successfully', async function () {
            AuthRepository.findUserByEmail.resolves(null);
            AuthRepository.findVendor.resolves(null);

            const result = await authService.registerUser({
                email: "test@example.com",
                password: "password123",
                vendorName: "UniqueVendor"
            });

            expect(result).to.deep.equal(userData);
            sinon.assert.calledOnce(bcrypt.hash);
        });

        it('should throw an error if user already exists', async function () {
            AuthRepository.findUserByEmail.resolves(userData);

            try {
                await authService.registerUser({
                    email: "test@example.com",
                    password: "password123"
                });
            } catch (error) {
                expect(error.message).to.equal("User already exists");
            }
        });

        it('should throw an error if vendor name already exists', async function () {
            AuthRepository.findUserByEmail.resolves(null);
            AuthRepository.findVendor.resolves(vendorData);

            try {
                await authService.registerUser({
                    email: "newuser@example.com",
                    password: "password123",
                    vendorName: "TestVendor"
                });
            } catch (error) {
                expect(error.message).to.equal("Vendor Name already exists");
            }
        });
    });

    describe('loginUser()', function () {
        it('should login user successfully and return a token', async function () {
            AuthRepository.findUserByEmail.resolves(userData);
            bcrypt.compare.resolves(true);

            const result = await authService.loginUser("test@example.com", "password123");

            expect(result).to.have.property('token', 'fake_jwt_token');
            expect(result).to.have.property('user', userData);
            expect(result).to.have.property('message', 'success');
        });

        it('should throw an error if email is invalid', async function () {
            AuthRepository.findUserByEmail.resolves(null);

            try {
                await authService.loginUser("invalid@example.com", "password123");
            } catch (error) {
                expect(error.message).to.equal("Invalid Email, please try again");
            }
        });

        it('should throw an error if password is invalid', async function () {
            AuthRepository.findUserByEmail.resolves(userData);
            bcrypt.compare.resolves(false);

            try {
                await authService.loginUser("test@example.com", "wrongpassword");
            } catch (error) {
                expect(error.message).to.equal("Invalid Password, please try again");
            }
        });
    });
});
