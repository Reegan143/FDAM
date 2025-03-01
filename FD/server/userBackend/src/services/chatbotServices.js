// services/chatbotService.js
const DisputesService = require('../services/disputeServices');
const UserRepository = require('../repositories/userRepository');

class ChatbotService {
  constructor() {
    this.conversations = {};
    this.validators = {
      transactionId: (value) => {
        const id = parseInt(value.replace(/\D/g, ''));
        return (!isNaN(id) && id >= 1000000000 && id <= 9999999999) 
          ? { valid: true, value: id } 
          : { valid: false, message: "Transaction ID must be a 10-digit number." };
      },
      debitCardNumber: (value) => {
        const cardNum = value.replace(/\D/g, '');
        return (cardNum.length === 16 && !isNaN(parseInt(cardNum))) 
          ? { valid: true, value: parseInt(cardNum) } 
          : { valid: false, message: "Debit card number must be a 16-digit number." };
      },
      amount: (value) => {
        const amount = parseFloat(value.replace(/[^\d.]/g, ''));
        return (!isNaN(amount) && amount > 0)
          ? { valid: true, value: amount }
          : { valid: false, message: "Amount must be a positive number." };
      },
      required: (value, fieldName) => {
        return value.trim() 
          ? { valid: true, value: value.trim() }
          : { valid: false, message: `${fieldName} is required.` };
      },
      yesNo: (value) => {
        const normalized = value.toLowerCase().trim();
        return (normalized === 'hi' || normalized === 'yes')
          ? { valid: true, value: normalized }
          : { valid: false, message: "Please answer with 'hi' or 'yes'." };
      }
    };
  }

  async processMessage(userId, message) {
    // Add user message to history
    if (!this.conversations[userId]) {
      const initialResponse = await this.startDisputeConversation(userId);
      // Initialize message history
      this.conversations[userId].messageHistory = [
        { text: initialResponse.message, sender: 'bot' }
      ];
      return initialResponse;
    }

    // Ensure message history exists
    if (!this.conversations[userId].messageHistory) {
      this.conversations[userId].messageHistory = [];
    }
    
    // Add user message to history
    this.conversations[userId].messageHistory.push(
      { text: message, sender: 'user' }
    );
    
    // Process the message
    const response = await this.processMessageStep(userId, message);
    
    // Add bot response to history
    this.conversations[userId].messageHistory.push(
      { 
        text: response.message, 
        sender: 'bot',
        isError: !!response.validationError,
        ticketNumber: response.ticketNumber
      }
    );
    
    return response;
  }

  async startDisputeConversation(userId) {
    try {
      const user = await UserRepository.findUserById(userId);
      if (!user) {
        return { message: "User not found. Please log in again." };
      }

      this.conversations[userId] = {
        currentStep: 'start',
        user: user,
        formData: {},
        messageHistory: []
      };

      return {
        message: "Welcome to the Dispute Registration Assistant. Would you like to register a new dispute? (yes/no)"
      };
    } catch (error) {
      console.error("Error starting conversation:", error);
      return { message: "An error occurred. Please try again later." };
    }
  }

  async processMessageStep(userId, message) {
    const conversation = this.conversations[userId];
    if (!conversation) {
      return this.startDisputeConversation(userId);
    }
    
    const step = conversation.currentStep;
    
    const handlers = {
      'start': () => this.handleStartStep(userId, message),
      'digitalChannel': () => this.handleDigitalChannelStep(userId, message),
      'complaintType': () => this.handleComplaintTypeStep(userId, message),
      'transactionId': () => this.handleTransactionIdStep(userId, message),
      'description': () => this.handleDescriptionStep(userId, message),
      'debitCardNumber': () => this.handleDebitCardStep(userId, message),
      'amount': () => this.handleAmountStep(userId, message),
      'vendorChoice': () => this.handleVendorChoiceStep(userId, message),
      'vendorName': () => this.handleVendorNameStep(userId, message)
    };

    return handlers[step] ? handlers[step]() : this.startDisputeConversation(userId);
  }

  handleStartStep(userId, message) {
    const result = this.validators.yesNo(message);
    if (!result.valid) {
      return { message: result.message, validationError: true };
    }

    if (result.value === 'yes') {
      this.conversations[userId].currentStep = 'digitalChannel';
      return {
        message: "What digital channel was used for this transaction? (e.g. Mobile Banking, Internet Banking, ATM)"
      };
    } else {
      return this.endConversation(userId);
    }
  }

  handleDigitalChannelStep(userId, message) {
    const result = this.validators.required(message, "Digital channel");
    if (!result.valid) {
      return { message: result.message, validationError: true };
    }

    this.conversations[userId].formData.digitalChannel = result.value;
    this.conversations[userId].currentStep = 'complaintType';
    return {
      message: "What type of complaint is this? (e.g. Failed Transaction, Unauthorized Transaction, Double Charge)"
    };
  }

  handleComplaintTypeStep(userId, message) {
    const result = this.validators.required(message, "Complaint type");
    if (!result.valid) {
      return { message: result.message, validationError: true };
    }

    this.conversations[userId].formData.complaintType = result.value;
    this.conversations[userId].currentStep = 'transactionId';
    return {
      message: "Please provide the transaction ID (10-digit number):"
    };
  }

  handleTransactionIdStep(userId, message) {
    const result = this.validators.transactionId(message);
    if (!result.valid) {
      return { message: result.message, validationError: true };
    }

    this.conversations[userId].formData.transactionId = result.value;
    this.conversations[userId].currentStep = 'description';
    return {
      message: "Please describe the issue in detail:"
    };
  }

  handleDescriptionStep(userId, message) {
    const result = this.validators.required(message, "Description");
    if (!result.valid) {
      return { message: result.message, validationError: true };
    }

    this.conversations[userId].formData.description = result.value;
    this.conversations[userId].currentStep = 'debitCardNumber';
    return {
      message: "Please provide your debit card number (16 digits):"
    };
  }

  handleDebitCardStep(userId, message) {
    const result = this.validators.debitCardNumber(message);
    if (!result.valid) {
      return { message: result.message, validationError: true };
    }

    this.conversations[userId].formData.debitCardNumber = result.value;
    this.conversations[userId].currentStep = 'amount';
    return {
      message: "What was the transaction amount? (numbers only, e.g. 123.45)"
    };
  }

  handleAmountStep(userId, message) {
    const result = this.validators.amount(message);
    if (!result.valid) {
      return { message: result.message, validationError: true };
    }

    this.conversations[userId].formData.amount = result.value;
    this.conversations[userId].currentStep = 'vendorChoice';
    return {
      message: "Do you want to report a specific vendor? (yes/no)"
    };
  }

  handleVendorChoiceStep(userId, message) {
    const result = this.validators.yesNo(message);
    if (!result.valid) {
      return { message: result.message, validationError: true };
    }

    if (result.value === 'yes') {
      this.conversations[userId].currentStep = 'vendorName';
      return {
        message: "Please provide the vendor name:"
      };
    } else {
      return this.submitDispute(userId, this.conversations[userId].user);
    }
  }

  handleVendorNameStep(userId, message) {
    this.conversations[userId].formData.vendorName = message.trim() || null;
    return this.submitDispute(userId, this.conversations[userId].user);
  }

  // In chatbotService.js, update the submitDispute method to include cardType
async submitDispute(userId, user) {
  try {
    const formData = this.conversations[userId].formData;
    console.log("Attempting to register dispute with data:", formData);
    console.log("User info:", user);
    
    // Add cardType from user to formData if it doesn't exist
    if (!formData.cardType && user.cardType) {
      formData.cardType = user.cardType;
    }
    
    // Convert user document to the format expected by DisputeService
    const userInfo = {
      userId: user._id,
      email: user.email,
      // Add role to help with admin identification
      role: user.role
    };
    
    console.log("Formatted user info:", userInfo);
    const dispute = await DisputesService.registerDispute(userInfo, formData);
    console.log("Dispute registered successfully:", dispute);
    
    // Keep conversation history but reset step
    this.conversations[userId].currentStep = 'start';
    this.conversations[userId].formData = {};
    
    return {
      message: `Thank you! Your dispute has been registered successfully.`,
      success: true,
      ticketNumber: dispute.ticketNumber
    };
  } catch (error) {
    console.error("Error in submitDispute:", error);
    
    // Special handling for admin not found error
   
    
    return {
      message: `Error registering dispute: ${error.message}. Please try again or contact customer support.`,
      success: false,
      validationError: true
    };
  }
}

  async hasActiveConversation(userId) {
    return !!this.conversations[userId];
  }

  async getConversationMessages(userId) {
    return this.conversations[userId]?.messageHistory ?? [];
  }

  endConversation(userId) {
    // Keep the conversation object but reset its state
    if (this.conversations[userId]) {
      this.conversations[userId].currentStep = 'start';
      this.conversations[userId].formData = {};
    }
    
    return {
      message: "Thank you for using the Dispute Registration Assistant. Feel free to come back if you need to register a dispute."
    };
  }
}

module.exports = new ChatbotService();