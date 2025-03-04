const { expect } = require('chai');
const sinon = require('sinon');
const UserController = require('../src/controllers/userController');
const UserService = require('../src/services/userServices');

describe('UserController', () => {
    let req, res, next, userServiceStub;

    beforeEach(() => {
        req = {
            body: {},
            params: { id: '123' },
            user: { userId: '123' }
        };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub()
        };
        next = sinon.stub();
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('registerUser', () => {
        it('should register a user successfully', async () => {
            userServiceStub = sinon.stub(UserService, 'registerUser').resolves({ id: '123', email: 'test@example.com' });

            req.body = { email: 'test@example.com', password: 'password123' };
            await UserController.registerUser(req, res);

            expect(userServiceStub.calledOnceWith(req.body)).to.be.true;
            expect(res.status.calledWith(201)).to.be.true;
            expect(res.json.calledWithMatch({ message: "User registered successfully" })).to.be.true;
        });

        it('should return 400 if registration fails', async () => {
            userServiceStub = sinon.stub(UserService, 'registerUser').throws(new Error('Registration failed'));

            await UserController.registerUser(req, res);

            expect(res.status.calledWith(400)).to.be.true;
            expect(res.json.calledWithMatch({ error: 'Registration failed' })).to.be.true;
        });
    });

    describe('loginUser', () => {
        it('should login a user successfully', async () => {
            userServiceStub = sinon.stub(UserService, 'loginUser').resolves({ token: 'jwt-token' });

            req.body = { email: 'test@example.com', password: 'password123' };
            await UserController.loginUser(req, res);

            expect(userServiceStub.calledOnceWith('test@example.com', 'password123')).to.be.true;
            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWithMatch({ token: 'jwt-token' })).to.be.true;
        });

        it('should return 401 if login fails', async () => {
            userServiceStub = sinon.stub(UserService, 'loginUser').throws(new Error('Invalid credentials'));

            await UserController.loginUser(req, res);

            expect(res.status.calledWith(401)).to.be.true;
            expect(res.json.calledWithMatch({ error: 'Invalid credentials' })).to.be.true;
        });
    });

    describe('getAllUsers', () => {
        it('should return a list of users', async () => {
            userServiceStub = sinon.stub(UserService, 'getAllUsers').resolves([{ id: '1' }, { id: '2' }]);

            await UserController.getAllUsers(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith([{ id: '1' }, { id: '2' }])).to.be.true;
        });

        it('should return 500 if fetching users fails', async () => {
            userServiceStub = sinon.stub(UserService, 'getAllUsers').throws(new Error('Database error'));

            await UserController.getAllUsers(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWithMatch({ error: 'Database error' })).to.be.true;
        });
    });

    describe('getUserById', () => {
        it('should return user details', async () => {
            userServiceStub = sinon.stub(UserService, 'getUserById').resolves({ id: '123', email: 'test@example.com' });

            await UserController.getUserById(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith({ id: '123', email: 'test@example.com' })).to.be.true;
        });

        it('should return 404 if user is not found', async () => {
            userServiceStub = sinon.stub(UserService, 'getUserById').throws(new Error('User not found'));

            await UserController.getUserById(req, res);

            expect(res.status.calledWith(404)).to.be.true;
            expect(res.json.calledWithMatch({ error: 'User not found' })).to.be.true;
        });
    });

    describe('updateUser', () => {
        it('should update a user successfully', async () => {
            userServiceStub = sinon.stub(UserService, 'updateUser').resolves({ id: '123', email: 'updated@example.com' });

            req.body = { email: 'updated@example.com' };
            await UserController.updateUser(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWithMatch({ message: "User updated successfully" })).to.be.true;
        });

        it('should return 400 if update fails', async () => {
            userServiceStub = sinon.stub(UserService, 'updateUser').throws(new Error('Update failed'));

            await UserController.updateUser(req, res);

            expect(res.status.calledWith(400)).to.be.true;
            expect(res.json.calledWithMatch({ error: 'Update failed' })).to.be.true;
        });
    });

    describe('deleteUser', () => {
        it('should delete a user successfully', async () => {
            userServiceStub = sinon.stub(UserService, 'deleteUser').resolves();

            await UserController.deleteUser(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWithMatch({ message: "User deleted successfully" })).to.be.true;
        });

        it('should return 400 if deletion fails', async () => {
            userServiceStub = sinon.stub(UserService, 'deleteUser').throws(new Error('Deletion failed'));

            await UserController.deleteUser(req, res);

            expect(res.status.calledWith(400)).to.be.true;
            expect(res.json.calledWithMatch({ error: 'Deletion failed' })).to.be.true;
        });
    });

    describe('sendOTP', () => {
        it('should send OTP successfully', async () => {
            userServiceStub = sinon.stub(UserService, 'sendOTP').resolves({ success: true });

            req.body = { email: 'test@example.com' };
            await UserController.sendOTP(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith({ success: true })).to.be.true;
        });

        it('should return 400 if OTP sending fails', async () => {
            userServiceStub = sinon.stub(UserService, 'sendOTP').throws(new Error('OTP sending failed'));

            await UserController.sendOTP(req, res);

            expect(res.status.calledWith(400)).to.be.true;
            expect(res.json.calledWithMatch({ error: 'OTP sending failed' })).to.be.true;
        });
    });

    describe('verifyOTP', () => {
        it('should verify OTP successfully', async () => {
            userServiceStub = sinon.stub(UserService, 'verifyOTP').resolves({ success: true });

            req.body = { email: 'test@example.com', otp: '123456', newPassword: 'newPass' };
            await UserController.verifyOTP(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith({ success: true })).to.be.true;
        });

        it('should return 400 if OTP verification fails', async () => {
            userServiceStub = sinon.stub(UserService, 'verifyOTP').throws(new Error('OTP verification failed'));

            await UserController.verifyOTP(req, res);

            expect(res.status.calledWith(400)).to.be.true;
            expect(res.json.calledWithMatch({ error: 'OTP verification failed' })).to.be.true;
        });
    });
});
