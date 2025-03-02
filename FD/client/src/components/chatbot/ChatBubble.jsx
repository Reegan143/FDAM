// components/chatbot/ChatBubble.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button, Card, Form, InputGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { MessageCircle, X, Send, RefreshCw } from 'lucide-react';
import API from '../utils/axiosInstance';
import './ChatBubble.css';


const ChatBubble = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [errorState, setErrorState] = useState(false);
  const messagesEndRef = useRef(null);
  const chatWindowRef = useRef(null);
  const [chatStep, setChatStep] = useState('initial');
  const [formData, setFormData] = useState({});

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Initialize chat if it hasn't been loaded yet
  useEffect(() => {
    if (isOpen && !initialized && messages.length === 0) {
      initializeChat();
    }
  }, [isOpen, initialized, messages.length]);

  // Handle clicks outside the chat window
  const handleClickOutside = useCallback((event) => {
    if (
      chatWindowRef.current && 
      !chatWindowRef.current.contains(event.target) &&
      !event.target.closest('.chat-bubble-button')
    ) {
      // Only close the chat UI, don't reset the conversation
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, handleClickOutside]);

  const toggleChat = () => {
    if (!isOpen && !initialized) {
      initializeChat();
    }
    setIsOpen(!isOpen);
  };

  const initializeChat = async () => {
    setLoading(true);
    setErrorState(false);
    try {
      const response = await API.user.get('/chatbot/status');
      if (response.data.hasActiveConversation && response.data.messages.length > 0) {
        setMessages(response.data.messages);
      } else {
        await resetChat();
      }
      setInitialized(true);
    } catch (error) {
      console.error("Chat initialization error:", error);
      setMessages([{
        text: "Hello! I'm your dispute assistant. How can I help you today?",
        sender: 'bot'
      }]);
      setInitialized(true);
      setErrorState(true);
    } finally {
      setLoading(false);
    }
  };

  const resetChat = async () => {
    setLoading(true);
    try {
      await API.user.put('/chatbot/reset');
      setMessages([{
        text: "Hello! I'm your dispute assistant. How can I help you today?",
        sender: 'bot'
      }]);
      setChatStep('initial');
      setFormData({});
      setErrorState(false);
    } catch (error) {
      console.error("Reset error:", error);
      setMessages([{
        text: "Hello! I'm your dispute assistant. How can I help you today?",
        sender: 'bot'
      }]);
      setErrorState(true);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
  
    const userMessage = input.trim();
    setInput('');
    
    // Add user message to chat
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setLoading(true);
  
    try {
      // Call the backend API
      const response = await API.user.post('/chatbot/message', { message: userMessage });
      
      // Handle potential validation errors
      if (response.data.validationError) {
        setMessages(prev => [...prev, { 
          text: response.data.message,
          sender: 'bot',
          isError: true
        }]);
      } else {
        setMessages(prev => [...prev, { 
          text: response.data.message,
          sender: 'bot',
          ticketNumber: response.data.ticketNumber
        }]);
      
        // If dispute was successfully created
        if (response.data.success && response.data.ticketNumber) {
          setTimeout(() => {
            setMessages(prev => [...prev, { 
              text: `Your dispute has been registered with ticket #${response.data.ticketNumber}. You can track it on your dashboard.`,
              sender: 'bot'
            }]);
            setChatStep('initial');
            setFormData({});
          }, 1000);
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      // Fall back to local handling if API fails
      setErrorState(true);
      if (chatStep !== 'initial') {
        const botResponse = handleLocalChatLogic(userMessage);
        setMessages(prev => [...prev, { 
          text: botResponse,
          sender: 'bot'
        }]);
      } else {
        setMessages(prev => [...prev, { 
          text: "Sorry, I'm having trouble processing messages right now. You can try resetting our conversation or submitting a dispute through the regular form.",
          sender: 'bot',
          isError: true
        }]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Enhanced local chat logic to simulate dispute registration flow
  const handleLocalChatLogic = (message) => {
    const lowerMsg = message.toLowerCase();
    
    // Initial greeting or help request
    if (chatStep === 'initial') {
      if (lowerMsg.includes('dispute') || lowerMsg.includes('complaint') || 
          lowerMsg.includes('problem') || lowerMsg.includes('yes')) {
        setChatStep('askDigitalChannel');
        return "What digital channel was used for this transaction? (e.g. Mobile Banking, Internet Banking, ATM)";
      } else {
        return "I can help you register a dispute. Would you like to start the process? (yes/no)";
      }
    }
    
    // Ask for digital channel
    if (chatStep === 'askDigitalChannel') {
      setFormData({...formData, digitalChannel: message});
      setChatStep('askComplaintType');
      return "What type of complaint is this? (e.g. Failed Transaction, Unauthorized Transaction, Double Charge)";
    }
    
    // Ask for complaint type
    if (chatStep === 'askComplaintType') {
      setFormData({...formData, complaintType: message});
      setChatStep('askTransactionId');
      return "Please provide the transaction ID (10-digit number):";
    }
    
    // Ask for transaction ID
    if (chatStep === 'askTransactionId') {
      // Validate transaction ID
      if (!/^\d{10}$/.test(message.replace(/\D/g, ''))) {
        return "Transaction ID must be exactly 10 digits. Please try again:";
      }
      
      setFormData({...formData, transactionId: message.replace(/\D/g, '')});
      setChatStep('askDescription');
      return "Please describe the issue in detail:";
    }
    
    // Ask for description
    if (chatStep === 'askDescription') {
      if (message.length < 10) {
        return "Please provide a more detailed description (at least 10 characters):";
      }
      
      setFormData({...formData, description: message});
      setChatStep('askDebitCard');
      return "Please provide your debit card number (16 digits):";
    }
    
    // Ask for debit card
    if (chatStep === 'askDebitCard') {
      // Validate debit card
      if (!/^\d{16}$/.test(message.replace(/\D/g, ''))) {
        return "Debit card number must be exactly 16 digits. Please try again:";
      }
      
      setFormData({...formData, debitCardNumber: message.replace(/\D/g, '')});
      setChatStep('askAmount');
      return "What was the transaction amount?";
    }
    
    // Ask for amount
    if (chatStep === 'askAmount') {
      const amount = parseFloat(message.replace(/[^\d.]/g, ''));
      if (isNaN(amount) || amount <= 0) {
        return "Please enter a valid positive amount:";
      }
      
      setFormData({...formData, amount: amount});
      setChatStep('askVendor');
      return "Do you want to report a specific vendor? (yes/no)";
    }
    
    // Ask for vendor
    if (chatStep === 'askVendor') {
      if (lowerMsg === 'yes') {
        setChatStep('askVendorName');
        return "Please provide the vendor name:";
      } else if (lowerMsg === 'no') {
        // Complete the process
        setChatStep('complete');
        
        // Generate a mock ticket number
        const ticketNumber = Math.floor(100000 + Math.random() * 900000);
        
        setTimeout(() => {
          setMessages(prev => [...prev, {
            text: `Your dispute has been registered with ticket #${ticketNumber}. You can track it on your dashboard.`,
            sender: 'bot',
            ticketNumber: ticketNumber
          }]);
          
          // Reset the chat after successful submission
          setTimeout(() => {
            resetChat();
          }, 5000);
        }, 1000);
        
        return "Thank you for providing all the details. I'm submitting your dispute now...";
      } else {
        return "Please answer with 'yes' or 'no'.";
      }
    }
    
    // Ask for vendor name
    if (chatStep === 'askVendorName') {
      setFormData({...formData, vendorName: message});
      setChatStep('complete');
      
      // Generate a mock ticket number
      const ticketNumber = Math.floor(100000 + Math.random() * 900000);
      
      setTimeout(() => {
        setMessages(prev => [...prev, {
          text: `Your dispute has been registered with ticket #${ticketNumber}. You can track it on your dashboard.`,
          sender: 'bot',
          ticketNumber: ticketNumber
        }]);
        
        // Reset the chat after successful submission
        setTimeout(() => {
          resetChat();
        }, 5000);
      }, 1000);
      
      return "Thank you for providing all the details. I'm submitting your dispute now...";
    }
    
    // Default fallback
    return "I'm not sure I understand. Could you try rephrasing or use the dispute form on your dashboard?";
  };

  return (
    <>
  <style>
    {`
    .chat-bubble-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1030;
    }
    
    .chat-bubble-button {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    .chat-window {
      position: fixed;
      bottom: 80px;
      right: 20px;
      width: 320px;
      max-width: calc(100vw - 40px);
      height: 400px;
      max-height: calc(100vh - 140px);
      z-index: 1029;
      border-radius: 10px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.15);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    
    .chat-messages {
      flex-grow: 1;
      overflow-y: auto;
      padding: 10px;
      display: flex;
      flex-direction: column;
    }
    
    .message {
      max-width: 80%;
      padding: 8px 12px;
      border-radius: 10px;
      margin-bottom: 8px;
      font-size: 0.9rem;
      word-break: break-word;
    }
    
    .bot-message {
      background-color: #f0f2f5;
      align-self: flex-start;
      border-bottom-left-radius: 2px;
    }
    
    .user-message {
      background-color: #0d6efd;
      color: white;
      align-self: flex-end;
      border-bottom-right-radius: 2px;
    }
    
    .error-message {
      background-color: #f8d7da;
      color: #842029;
    }
    
    .ticket-number {
      font-size: 0.8rem;
      margin-top: 5px;
      font-weight: bold;
    }
    
    .typing-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      padding: 10px;
      height: 36px;
    }
    
    .typing-indicator span {
      width: 8px;
      height: 8px;
      background: #aaa;
      border-radius: 50%;
      display: inline-block;
      animation: pulse 1.2s infinite ease-in-out;
    }
    
    .typing-indicator span:nth-child(2) {
      animation-delay: 0.2s;
    }
    
    .typing-indicator span:nth-child(3) {
      animation-delay: 0.4s;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 0.4; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.2); }
    }
    
    .system-message {
      background-color: #f8f9fa;
      padding: 10px;
      border-radius: 10px;
      text-align: center;
      margin: 10px 0;
      font-size: 0.8rem;
    }
    
    @media (max-width: 576px) {
      .chat-window {
        height: 350px;
        bottom: 75px;
      }
      
      .chat-bubble-button {
        width: 45px;
        height: 45px;
      }
    }
    `}
  </style>

  {/* Chat bubble button */}
  <div className="chat-bubble-container">
    <Button 
      className="chat-bubble-button" 
      onClick={toggleChat}
      aria-label={isOpen ? "Close chat" : "Open chat"}
    >
      {isOpen ? <X size={20} /> : <MessageCircle size={20} />}
    </Button>
  </div>

  {/* Chat window */}
  {isOpen && (
    <Card className="chat-window" ref={chatWindowRef}>
      <Card.Header className="d-flex justify-content-between align-items-center py-2 px-3">
        <h6 className="mb-0 fs-6">Dispute Assistant</h6>
        <div className="d-flex">
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>Reset conversation</Tooltip>}
          >
            <Button 
              variant="link" 
              className="p-1 text-primary me-1" 
              onClick={resetChat}
              disabled={loading}
            >
              <RefreshCw size={14} />
            </Button>
          </OverlayTrigger>
          <Button 
            variant="link" 
            className="p-1 text-dark" 
            onClick={toggleChat}
          >
            <X size={16} />
          </Button>
        </div>
      </Card.Header>
      <Card.Body className="chat-messages p-2 p-sm-3">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`message ${msg.sender === 'bot' ? 'bot-message' : 'user-message'} ${msg.isError ? 'error-message' : ''}`}
          >
            {msg.text}
            {msg.ticketNumber && (
              <div className="ticket-number">
                Ticket #{msg.ticketNumber}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="message bot-message typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
        {errorState && (
          <div className="system-message">
            <p className="mb-2">Connection issue detected. Using simplified chat mode.</p>
            <Button 
              variant="outline-primary" 
              size="sm" 
              onClick={resetChat}
              className="py-1 px-2"
            >
              Reset Chat
            </Button>
          </div>
        )}
        <div ref={messagesEndRef} />
      </Card.Body>
      <Card.Footer className="p-2">
        <Form onSubmit={sendMessage}>
          <InputGroup>
            <Form.Control
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              size="sm"
              className="py-2"
            />
            <Button 
              type="submit" 
              variant="primary" 
              disabled={loading || !input.trim()}
              size="sm"
            >
              <Send size={16} />
            </Button>
          </InputGroup>
        </Form>
      </Card.Footer>
    </Card>
  )}
</>
  );
};

export default ChatBubble;