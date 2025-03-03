const { expect } = require('chai');
const sinon = require('sinon');
const NotificationService = require('../src/services/notificationServices');
const NotificationRepository = require('../src/repositories/notificationRepository');

describe('NotificationService', () => {
    beforeEach(() => {
        sinon.restore();
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('createNotification', () => {
        it('should create a notification successfully', async () => {
            const notificationData = {
                email: 'user@example.com',
                message: 'Test notification',
                type: 'info'
            };
            
            const expectedResult = {
                _id: '123',
                email: 'user@example.com',
                message: 'Test notification',
                type: 'info',
                read: false,
                createdAt: new Date()
            };
            
            const createStub = sinon.stub(NotificationRepository, 'createNotification').resolves(expectedResult);
            
            const result = await NotificationService.createNotification(notificationData);
            
            expect(createStub.calledWith(notificationData)).to.be.true;
            expect(result).to.deep.equal(expectedResult);
        });
        
        it('should handle errors when creating notification', async () => {
            const notificationData = {
                email: 'user@example.com',
                message: 'Test notification',
                type: 'info'
            };
            
            sinon.stub(NotificationRepository, 'createNotification').rejects(new Error('Database error'));
            
            try {
                await NotificationService.createNotification(notificationData);
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).to.equal('Database error');
            }
        });
    });
    
    describe('getUserNotifications', () => {
        it('should return user notifications when they exist', async () => {
            const email = 'user@example.com';
            const expectedNotifications = [
                {
                    _id: '123',
                    email: 'user@example.com',
                    message: 'Test notification 1',
                    type: 'info',
                    read: false
                },
                {
                    _id: '456',
                    email: 'user@example.com',
                    message: 'Test notification 2',
                    type: 'alert',
                    read: true
                }
            ];
            
            const getStub = sinon.stub(NotificationRepository, 'getUserNotifications').resolves(expectedNotifications);
            
            const result = await NotificationService.getUserNotifications(email);
            
            expect(getStub.calledWith(email)).to.be.true;
            expect(result).to.deep.equal(expectedNotifications);
        });
        
        it('should return empty array when no notifications exist', async () => {
            const email = 'user@example.com';
            
            sinon.stub(NotificationRepository, 'getUserNotifications').resolves(null);
            
            const result = await NotificationService.getUserNotifications(email);
            
            expect(result).to.be.an('array').that.is.empty;
        });
        
        it('should handle errors when getting notifications', async () => {
            const email = 'user@example.com';
            
            sinon.stub(NotificationRepository, 'getUserNotifications').rejects(new Error('Database error'));
            
            try {
                await NotificationService.getUserNotifications(email);
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).to.equal('Database error');
            }
        });
    });
    
    describe('markAsRead', () => {
        it('should mark notification as read successfully', async () => {
            const notificationId = '123';
            const expectedResult = {
                _id: '123',
                email: 'user@example.com',
                message: 'Test notification',
                type: 'info',
                read: true
            };
            
            const markStub = sinon.stub(NotificationRepository, 'markNotificationAsRead').resolves(expectedResult);
            
            const result = await NotificationService.markAsRead(notificationId);
            
            expect(markStub.calledWith(notificationId)).to.be.true;
            expect(result).to.deep.equal(expectedResult);
        });
        
        it('should throw error when notification not found', async () => {
            const notificationId = '999';
            
            sinon.stub(NotificationRepository, 'markNotificationAsRead').resolves(null);
            
            try {
                await NotificationService.markAsRead(notificationId);
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).to.equal('Notification not found');
            }
        });
        
        it('should handle repository errors', async () => {
            const notificationId = '123';
            
            sinon.stub(NotificationRepository, 'markNotificationAsRead').rejects(new Error('Database error'));
            
            try {
                await NotificationService.markAsRead(notificationId);
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).to.equal('Database error');
            }
        });
    });
});