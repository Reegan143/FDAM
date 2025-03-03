const chai = require('chai');
const sinon = require('sinon');
const { expect } = chai;
const authController = require('../src/controllers/authController');
const authService = require('../src/services/authServices');

describe('AuthController Unit Tests', function () {
    let req, res;

    beforeEach(function () {
        // ✅ Mock request & response objects
        req = {
            body: {}
        };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub()
        };
    });

    afterEach(function () {
        sinon.restore();
    });

    describe('registerUser()', function () {
        it('should register a user successfully', async function () {
            const mockUser = { id: '123', email: 'test@example.com' };
            sinon.stub(authService, 'registerUser').resolves(mockUser);

            req.body = { email: 'test@example.com', password: 'password123' };
            await authController.registerUser(req, res);

            sinon.assert.calledWith(res.status, 201);
            sinon.assert.calledWith(res.json, { message: "User registered successfully", user: mockUser });
        });

        it('should return an error if registration fails', async function () {
            sinon.stub(authService, 'registerUser').rejects(new Error('Email already exists'));

            req.body = { email: 'test@example.com', password: 'password123' };
            await authController.registerUser(req, res);

            sinon.assert.calledWith(res.status, 400);
            sinon.assert.calledWith(res.json, { error: 'Email already exists' });
        });
    });

    describe('loginUser()', function () {
        it('should log in a user successfully', async function () {
            const mockData = { token: 'jwt_token' };
            sinon.stub(authService, 'loginUser').resolves(mockData);

            req.body = { email: 'test@example.com', password: 'password123' };
            await authController.loginUser(req, res);

            sinon.assert.calledWith(res.status, 200);
            sinon.assert.calledWith(res.json, mockData);
        });

        it('should return an error if login fails', async function () {
            sinon.stub(authService, 'loginUser').rejects(new Error('Invalid credentials'));

            req.body = { email: 'test@example.com', password: 'wrongpassword' };
            await authController.loginUser(req, res);

            sinon.assert.calledWith(res.status, 401);
            sinon.assert.calledWith(res.json, { error: 'Invalid credentials' });
        });
    });
});
