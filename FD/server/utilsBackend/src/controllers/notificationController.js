const NotificationService = require('../services/notificationservices');

class NotificationController {
    async getNotifications(req, res) {
        try {
            const notifications = await NotificationService.getUserNotifications(req.user.email);
            if (!notifications.length) return res.status(404).json({ message: "No notifications found" });

            res.status(200).json(notifications);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async markAsRead(req, res) {
        try {
            const notification = await NotificationService.markAsRead(req.params.id);
            res.status(200).json({ message: "Notification marked as read", notification });
        } catch (error) {
            res.status(500).json({ message: "Failed to update notification", error: error.message });
        }
    }

}

module.exports = new NotificationController();
