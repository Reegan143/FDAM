// routes/chatbotRoutes.js
const express = require('express');
const ChatbotController = require('../controllers/chatbotController');
const { validationUser } = require('../middlewares/protected');

const router = express.Router();

// Apply authentication middleware to all chatbot routes
router.use(validationUser);

router.post('/message', ChatbotController.processMessage);
router.put('/reset', ChatbotController.resetConversation);
router.get('/status', ChatbotController.getConversationStatus);

module.exports = router;