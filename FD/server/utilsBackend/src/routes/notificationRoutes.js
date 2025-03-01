const express = require("express");
const NotificationController = require("../controllers/notificationController");
const { validationUser } = require('../middlewares/protected');

const router = express.Router();

router.get("/", validationUser, NotificationController.getNotifications);
router.patch("/:id/read", validationUser, NotificationController.markAsRead);


module.exports = router;
