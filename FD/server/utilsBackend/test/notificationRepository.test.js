const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const { expect } = chai;
const NotificationRepository = require('../src/repositories/notificationRepository');
const NotificationModel = require('../src/models/noticationModel');

describe('NotificationRepository Unit Tests', function () {
    let notificationData;

    beforeEach(async function () {
        // Mock notification data
        notificationData = {
            _id: new mongoose.Types.ObjectId(),
            email: "user@example.com",
            message: "New transaction alert",
            isRead: false,
            createdAt: new Date()
        };

        // Stub Mongoose methods properly
        sinon.stub(NotificationModel, 'create').resolves(notificationData);

        //  Properly stub `find().sort()` to avoid errors
        const mockQuery = {
            sort: sinon.stub().resolves([notificationData]) // `sort()` should return sorted notifications
        };
        sinon.stub(NotificationModel, 'find').returns(mockQuery); // `find()` should return a query object

        sinon.stub(NotificationModel, 'findByIdAndUpdate').resolves({ ...notificationData, isRead: true });
    });

    afterEach(function () {
        sinon.restore(); // Restore all stubs after each test
    });

    it('should create a notification', async function () {
        const result = await NotificationRepository.createNotification(notificationData);
        expect(result).to.deep.equal(notificationData);
    });

    it('should get user notifications sorted by createdAt in descending order', async function () {
        const result = await NotificationRepository.getUserNotifications("user@example.com");
        expect(result).to.be.an('array');
        expect(result.length).to.be.greaterThan(0);
        expect(result[0]).to.have.property('email', 'user@example.com');
    });

    it('should mark a notification as read', async function () {
        const result = await NotificationRepository.markNotificationAsRead(notificationData._id);
        expect(result.isRead).to.be.true;
    });

    // Error handling tests
    it('should handle error when creating a notification', async function () {
        NotificationModel.create.rejects(new Error('Database error'));

        try {
            await NotificationRepository.createNotification(notificationData);
        } catch (error) {
            expect(error.message).to.equal("Database error");
        }
    });

    it('should handle error when fetching user notifications', async function () {
        const mockQuery = { sort: sinon.stub().rejects(new Error('Database error')) };
        NotificationModel.find.returns(mockQuery); // Make `find().sort()` fail

        try {
            await NotificationRepository.getUserNotifications("user@example.com");
        } catch (error) {
            expect(error.message).to.equal("Database error");
        }
    });

    it('should handle error when marking a notification as read', async function () {
        NotificationModel.findByIdAndUpdate.rejects(new Error('Database error'));

        try {
            await NotificationRepository.markNotificationAsRead(notificationData._id);
        } catch (error) {
            expect(error.message).to.equal("Database error");
        }
    });
});
