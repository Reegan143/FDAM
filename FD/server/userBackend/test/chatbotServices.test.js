const { expect } = require('chai');
const sinon = require('sinon');
const ChatbotService = require('../src/services/chatbotServices');
const DisputesService = require('../src/services/disputeServices');
const UserRepository = require('../src/repositories/userRepository');

describe('ChatbotService', () => {
    let disputeStub, userStub;

    beforeEach(() => {
        sinon.restore();
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('startDisputeConversation', () => {
        it('should initialize a conversation if the user exists', async () => {
            const mockUser = { _id: '123', email: 'user@example.com', cardType: 'debit' };
            userStub = sinon.stub(UserRepository, 'findUserById').resolves(mockUser);

            const result = await ChatbotService.startDisputeConversation('123');

            expect(result).to.deep.equal({
                message: "Welcome to the Dispute Registration Assistant. Would you like to register a new dispute? (yes/no)"
            });
            expect(ChatbotService.conversations['123']).to.deep.include({
                currentStep: 'start',
                user: mockUser
            });
        });

        it('should return an error message if the user is not found', async () => {
            userStub = sinon.stub(UserRepository, 'findUserById').resolves(null);

            const result = await ChatbotService.startDisputeConversation('123');

            expect(result).to.deep.equal({ message: "User not found. Please log in again." });
        });
    });

    describe('processMessage', () => {
        it('should start a new conversation if user has no active session', async () => {
            const mockUser = { _id: '123', email: 'user@example.com', cardType: 'debit' };
            userStub = sinon.stub(UserRepository, 'findUserById').resolves(mockUser);

            const result = await ChatbotService.processMessage('123', 'hi');

            expect(result).to.deep.equal({
                message: "Welcome to the Dispute Registration Assistant. Would you like to register a new dispute? (yes/no)"
            });
        });

        it('should process a yes response correctly at start step', async () => {
            ChatbotService.conversations['123'] = { currentStep: 'start', formData: {} };

            const result = await ChatbotService.processMessage('123', 'yes');

            expect(result).to.deep.equal({
                message: "What digital channel was used for this transaction? (e.g. Mobile Banking, Internet Banking, ATM)"
            });
            expect(ChatbotService.conversations['123'].currentStep).to.equal('digitalChannel');
        });

        it('should process a no response correctly at start step', async () => {
            ChatbotService.conversations['123'] = { currentStep: 'start', formData: {} };

            const result = await ChatbotService.processMessage('123', 'no');

            expect(result).to.deep.equal({
                message: "Thank you for using the Dispute Registration Assistant. Feel free to come back if you need to register a dispute."
            });
        });

        it('should return validation error for an invalid response', async () => {
            ChatbotService.conversations['123'] = { currentStep: 'start', formData: {} };

            const result = await ChatbotService.processMessage('123', 'nope');

            expect(result).to.deep.equal({
                message: "Please answer with 'hi' or 'yes'.",
                validationError: true
            });
        });

        it('should handle digitalChannel step correctly', async () => {
            ChatbotService.conversations['123'] = { currentStep: 'digitalChannel', formData: {} };

            const result = await ChatbotService.processMessage('123', 'Mobile Banking');

            expect(result.message).to.include("Enter the transaction ID");
            expect(ChatbotService.conversations['123'].formData.digitalChannel).to.equal('Mobile Banking');
            expect(ChatbotService.conversations['123'].currentStep).to.equal('transactionId');
        });

        it('should handle description step correctly', async () => {
            ChatbotService.conversations['123'] = { currentStep: 'description', formData: {} };

            const result = await ChatbotService.processMessage('123', 'I did not authorize this transaction');

            expect(result.message).to.include("What type of complaint");
            expect(ChatbotService.conversations['123'].formData.description).to.equal('I did not authorize this transaction');
            expect(ChatbotService.conversations['123'].currentStep).to.equal('complaintType');
        });

        it('should handle complaintType step correctly', async () => {
            ChatbotService.conversations['123'] = { currentStep: 'complaintType', formData: {} };

            const result = await ChatbotService.processMessage('123', 'Unauthorized Transaction');

            expect(result.message).to.include("Enter the transaction amount");
            expect(ChatbotService.conversations['123'].formData.complaintType).to.equal('Unauthorized Transaction');
            expect(ChatbotService.conversations['123'].currentStep).to.equal('amount');
        });

        it('should handle vendorQuestion step with yes response', async () => {
            ChatbotService.conversations['123'] = { currentStep: 'vendorQuestion', formData: {} };

            const result = await ChatbotService.processMessage('123', 'yes');

            expect(result.message).to.include("Enter the vendor name");
            expect(ChatbotService.conversations['123'].currentStep).to.equal('vendorName');
        });

        it('should handle vendorQuestion step with no response', async () => {
            ChatbotService.conversations['123'] = { 
                currentStep: 'vendorQuestion', 
                formData: {}, 
                user: { _id: '123', email: 'user@example.com' } 
            };
            
            sinon.stub(DisputesService, 'registerDispute').resolves({ ticketNumber: '654321' });

            const result = await ChatbotService.processMessage('123', 'no');

            expect(result.message).to.include("Thank you! Your dispute has been registered successfully");
            expect(result.ticketNumber).to.equal('654321');
        });

        it('should handle vendorName step correctly', async () => {
            ChatbotService.conversations['123'] = { 
                currentStep: 'vendorName', 
                formData: {}, 
                user: { _id: '123', email: 'user@example.com' } 
            };
            
            sinon.stub(DisputesService, 'registerDispute').resolves({ ticketNumber: '654321' });

            const result = await ChatbotService.processMessage('123', 'Amazon');

            expect(result.message).to.include("Thank you! Your dispute has been registered successfully");
            expect(ChatbotService.conversations['123'].formData.vendorName).to.equal('Amazon');
            expect(result.ticketNumber).to.equal('654321');
        });
    });

    describe('handleTransactionIdStep', () => {
        it('should accept a valid transaction ID', async () => {
            ChatbotService.conversations['123'] = { currentStep: 'transactionId', formData: {} };

            const result = ChatbotService.handleTransactionIdStep('123', '1234567890');

            expect(result).to.deep.equal({
                message: "Please describe the issue in detail:"
            });
            expect(ChatbotService.conversations['123'].formData.transactionId).to.equal(1234567890);
            expect(ChatbotService.conversations['123'].currentStep).to.equal('description');
        });

        it('should return validation error for an invalid transaction ID', async () => {
            ChatbotService.conversations['123'] = { currentStep: 'transactionId', formData: {} };

            const result = ChatbotService.handleTransactionIdStep('123', 'ABC123');

            expect(result).to.deep.equal({
                message: "Transaction ID must be a 10-digit number.",
                validationError: true
            });
        });

        it('should return validation error for a short transaction ID', async () => {
            ChatbotService.conversations['123'] = { currentStep: 'transactionId', formData: {} };

            const result = ChatbotService.handleTransactionIdStep('123', '12345');

            expect(result).to.deep.equal({
                message: "Transaction ID must be a 10-digit number.",
                validationError: true
            });
        });
    });

    describe('handleAmountStep', () => {
        it('should accept a valid amount', async () => {
            ChatbotService.conversations['123'] = { currentStep: 'amount', formData: {} };

            const result = ChatbotService.handleAmountStep('123', '250.50');

            expect(result).to.deep.equal({
                message: "Do you want to report a specific vendor? (yes/no)"
            });
            expect(ChatbotService.conversations['123'].formData.amount).to.equal(250.50);
            expect(ChatbotService.conversations['123'].currentStep).to.equal('vendorQuestion');
        });

        it('should accept a valid integer amount', async () => {
            ChatbotService.conversations['123'] = { currentStep: 'amount', formData: {} };

            const result = ChatbotService.handleAmountStep('123', '500');

            expect(result).to.deep.equal({
                message: "Do you want to report a specific vendor? (yes/no)"
            });
            expect(ChatbotService.conversations['123'].formData.amount).to.equal(500);
        });

        it('should return validation error for an invalid amount', async () => {
            ChatbotService.conversations['123'] = { currentStep: 'amount', formData: {} };

            const result = ChatbotService.handleAmountStep('123', 'abc');

            expect(result).to.deep.equal({
                message: "Amount must be a positive number.",
                validationError: true
            });
        });

        it('should return validation error for a negative amount', async () => {
            ChatbotService.conversations['123'] = { currentStep: 'amount', formData: {} };

            const result = ChatbotService.handleAmountStep('123', '-50');

            expect(result).to.deep.equal({
                message: "Amount must be a positive number.",
                validationError: true
            });
        });
    });

    describe('submitDispute', () => {
        it('should submit a dispute successfully', async () => {
            ChatbotService.conversations['123'] = {
                currentStep: 'vendorName',
                formData: {
                    transactionId: 'TXN123',
                    complaintType: 'Unauthorized Transaction',
                    amount: 100.00,
                    vendorName: 'Amazon',
                    cardType: 'debit'
                },
                user: { _id: '123', email: 'user@example.com', role: 'customer' }
            };

            const mockDispute = { ticketNumber: '654321' };
            disputeStub = sinon.stub(DisputesService, 'registerDispute').resolves(mockDispute);

            const result = await ChatbotService.submitDispute('123', ChatbotService.conversations['123'].user);

            expect(result).to.deep.equal({
                message: "Thank you! Your dispute has been registered successfully.",
                success: true,
                ticketNumber: '654321'
            });
        });

        it('should return an error if dispute submission fails', async () => {
            ChatbotService.conversations['123'] = {
                currentStep: 'vendorName',
                formData: {
                    transactionId: 'TXN123',
                    complaintType: 'Unauthorized Transaction',
                    amount: 100.00,
                    vendorName: 'Amazon',
                    cardType: 'debit'
                },
                user: { _id: '123', email: 'user@example.com', role: 'customer' }
            };

            disputeStub = sinon.stub(DisputesService, 'registerDispute').throws(new Error('Submission failed'));

            const result = await ChatbotService.submitDispute('123', ChatbotService.conversations['123'].user);

            expect(result).to.deep.equal({
                message: "Error registering dispute: Submission failed. Please try again or contact customer support.",
                success: false,
                validationError: true
            });
        });
    });

    describe('endConversation', () => {
        it('should reset conversation state and return a thank-you message', () => {
            ChatbotService.conversations['123'] = { currentStep: 'vendorName', formData: {} };

            const result = ChatbotService.endConversation('123');

            expect(result).to.deep.equal({
                message: "Thank you for using the Dispute Registration Assistant. Feel free to come back if you need to register a dispute."
            });
            expect(ChatbotService.conversations['123'].currentStep).to.equal('start');
            expect(ChatbotService.conversations['123'].formData).to.be.an('object').that.is.empty;
        });
    });
});