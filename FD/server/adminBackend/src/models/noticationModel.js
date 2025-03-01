const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    email: { type: String, required: true },
    complaintType: { type: String },
    ticketNumber: { type: Number },
    userName: { type: String  },
    messages: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const NotificationModel = mongoose.model("Notification", notificationSchema);
module.exports = NotificationModel
