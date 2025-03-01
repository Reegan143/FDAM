const NotificationRepository = require('../repositories/notificationRepository');

class NotificationService {
    async createNotification(notificationData) {
        return await NotificationRepository.createNotification(notificationData);
    }
    
    async getUserNotifications(email) {
        const notifications =  await NotificationRepository.getUserNotifications(email);
        return notifications || []
    }


    async markAsRead(id) {
        const notification = await NotificationRepository.markNotificationAsRead(id);
        if (!notification) throw new Error("Notification not found");
        return notification;
    }
}

module.exports = new NotificationService();
