// controllers/chatbotController.js
const ChatbotService = require('../services/chatbotServices');

class ChatbotController {
  async processMessage(req, res) {
    try {
      const { message } = req.body;
      
      // Get userId from authenticated request
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          message: "You must be logged in to use the chatbot.",
          validationError: true
        });
      }
      
      const response = await ChatbotService.processMessage(userId, message);
      res.status(200).json(response);
    } catch (error) {
      console.error("Chatbot error:", error);
      res.status(500).json({ 
        message: "Sorry, I'm having trouble processing your message right now. Please try again later.",
        error: error.message,
        validationError: true
      });
    }
  }
  
  async resetConversation(req, res) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          message: "You must be logged in to use the chatbot.",
          validationError: true
        });
      }
      
      const response = await ChatbotService.startDisputeConversation(userId);
      res.status(200).json(response);
    } catch (error) {
      console.error("Chatbot reset error:", error);
      res.status(500).json({
        message: "Error resetting conversation. Please try again.",
        error: error.message,
        validationError: true
      });
    }
  }

  async getConversationStatus(req, res) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          hasActiveConversation: false,
          messages: []
        });
      }
      
      const hasActiveConversation = await ChatbotService.hasActiveConversation(userId);
      const messages = hasActiveConversation ? 
        await ChatbotService.getConversationMessages(userId) : 
        [];
        
      res.status(200).json({ 
        hasActiveConversation,
        messages
      });
    } catch (error) {
      console.error("Chatbot status error:", error);
      res.status(500).json({
        hasActiveConversation: false,
        messages: [],
        error: error.message
      });
    }
  }
}

module.exports = new ChatbotController();