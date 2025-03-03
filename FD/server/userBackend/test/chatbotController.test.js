const { expect } = require('chai');
const sinon = require('sinon');
const ChatbotController = require('../src/controllers/chatbotController');
const ChatbotService = require('../src/services/chatbotServices');

describe('ChatbotController', () => {
    let req, res, next, chatbotStub;

    beforeEach(() => {
        req = {
            user: { userId: '123' }, // Mock authenticated user
            body: { message: 'Hello' }
        };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub()
        };
        next = sinon.stub();
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('processMessage', () => {
        it('should process user message successfully', async () => {
            chatbotStub = sinon.stub(ChatbotService, 'processMessage').resolves({ reply: 'Hello User' });

            await ChatbotController.processMessage(req, res);

            expect(chatbotStub.calledOnceWith('123', 'Hello')).to.be.true;
            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith({ reply: 'Hello User' })).to.be.true;
        });

        it('should return 401 if user is not authenticated', async () => {
            req.user = null;

            await ChatbotController.processMessage(req, res);

            expect(res.status.calledWith(401)).to.be.true;
            expect(res.json.calledWith({
                message: "You must be logged in to use the chatbot.",
                validationError: true
            })).to.be.true;
        });

        it('should handle errors gracefully', async () => {
            chatbotStub = sinon.stub(ChatbotService, 'processMessage').throws(new Error('Processing failed'));

            await ChatbotController.processMessage(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWithMatch({
                message: "Sorry, I'm having trouble processing your message right now. Please try again later.",
                error: "Processing failed",
                validationError: true
            })).to.be.true;
        });
    });

    describe('resetConversation', () => {
        it('should reset user conversation successfully', async () => {
            chatbotStub = sinon.stub(ChatbotService, 'startDisputeConversation').resolves({ success: true });

            await ChatbotController.resetConversation(req, res);

            expect(chatbotStub.calledOnceWith('123')).to.be.true;
            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith({ success: true })).to.be.true;
        });

        it('should return 401 if user is not authenticated', async () => {
            req.user = null;

            await ChatbotController.resetConversation(req, res);

            expect(res.status.calledWith(401)).to.be.true;
            expect(res.json.calledWith({
                message: "You must be logged in to use the chatbot.",
                validationError: true
            })).to.be.true;
        });

        it('should handle errors gracefully', async () => {
            chatbotStub = sinon.stub(ChatbotService, 'startDisputeConversation').throws(new Error('Reset failed'));

            await ChatbotController.resetConversation(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWithMatch({
                message: "Error resetting conversation. Please try again.",
                error: "Reset failed",
                validationError: true
            })).to.be.true;
        });
    });

    describe('getConversationStatus', () => {
        it('should return conversation status with messages', async () => {
            sinon.stub(ChatbotService, 'hasActiveConversation').resolves(true);
            sinon.stub(ChatbotService, 'getConversationMessages').resolves([{ text: 'Previous message' }]);

            await ChatbotController.getConversationStatus(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith({
                hasActiveConversation: true,
                messages: [{ text: 'Previous message' }]
            })).to.be.true;
        });

        it('should return empty messages if no active conversation', async () => {
            sinon.stub(ChatbotService, 'hasActiveConversation').resolves(false);

            await ChatbotController.getConversationStatus(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith({
                hasActiveConversation: false,
                messages: []
            })).to.be.true;
        });

        it('should return 401 if user is not authenticated', async () => {
            req.user = null;

            await ChatbotController.getConversationStatus(req, res);

            expect(res.status.calledWith(401)).to.be.true;
            expect(res.json.calledWith({
                hasActiveConversation: false,
                messages: []
            })).to.be.true;
        });

        it('should handle errors gracefully', async () => {
            sinon.stub(ChatbotService, 'hasActiveConversation').throws(new Error('Status fetch failed'));

            await ChatbotController.getConversationStatus(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWithMatch({
                hasActiveConversation: false,
                messages: [],
                error: "Status fetch failed"
            })).to.be.true;
        });
    });
});
