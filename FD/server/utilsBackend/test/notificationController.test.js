const { expect } = require('chai');
const sinon = require('sinon');
const NotificationController = require('../src/controllers/notificationController');
const NotificationService = require('../src/services/notificationServices');

describe('NotificationController', () => {
    let req, res, notificationStub;

    beforeEach(() => {
        req = { user: { email: 'user@example.com' }, params: {}, body: {} };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub(),
        };
        sinon.restore();
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('getNotifications', () => {
        it('should return user notifications successfully', async () => {
            const mockNotifications = [{ id: 1, message: 'New dispute update' }];
            notificationStub = sinon.stub(NotificationService, 'getUserNotifications').resolves(mockNotifications);

            await NotificationController.getNotifications(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith(mockNotifications)).to.be.true;
        });

        it('should return 404 if no notifications found', async () => {
            notificationStub = sinon.stub(NotificationService, 'getUserNotifications').resolves([]);

            await NotificationController.getNotifications(req, res);

            expect(res.status.calledWith(404)).to.be.true;
            expect(res.json.calledWith({ message: 'No notifications found' })).to.be.true;
        });

        it('should handle errors when fetching notifications', async () => {
            notificationStub = sinon.stub(NotificationService, 'getUserNotifications').throws(new Error('Database error'));

            await NotificationController.getNotifications(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith({ error: 'Database error' })).to.be.true;
        });
    });

    describe('markAsRead', () => {
        it('should mark a notification as read successfully', async () => {
            req.params.id = '1';
            const mockNotification = { id: 1, message: 'Notification read' };
            notificationStub = sinon.stub(NotificationService, 'markAsRead').resolves(mockNotification);

            await NotificationController.markAsRead(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith({ message: 'Notification marked as read', notification: mockNotification })).to.be.true;
        });

        it('should handle errors when marking notification as read', async () => {
            req.params.id = '1';
            notificationStub = sinon.stub(NotificationService, 'markAsRead').throws(new Error('Failed to update'));

            await NotificationController.markAsRead(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith({ message: 'Failed to update notification', error: 'Failed to update' })).to.be.true;
        });
    });
});
