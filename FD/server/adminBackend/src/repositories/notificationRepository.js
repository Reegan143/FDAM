const NotificationModel = require('../models/noticationModel');

class NotificationRepository {
    async createNotification(notificationData) {
        return await NotificationModel.create(notificationData);
    }

    async getUserNotifications(email) {
        return await NotificationModel.find({ email }).sort({ createdAt: -1 });
    }

    async markNotificationAsRead(id) {
        return await NotificationModel.findByIdAndUpdate(id, { isRead: true }, { new: true });
    }

  
}

module.exports = new NotificationRepository();
