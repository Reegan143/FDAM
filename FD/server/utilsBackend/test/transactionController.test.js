const { expect } = require('chai');
const sinon = require('sinon');
const TransactionController = require('../src/controllers/transactionController');
const TransactionService = require('../src/services/transactionServices');

describe('TransactionController', () => {
    let req, res, transactionStub;

    beforeEach(() => {
        req = { user: { email: 'user@example.com' }, body: {}, params: {} };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub(),
        };
        sinon.restore();
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('makeTransaction', () => {
        it('should process a transaction successfully', async () => {
            const mockTransaction = { success: true, transactionId: 'TXN123' };
            transactionStub = sinon.stub(TransactionService, 'makeTransaction').resolves(mockTransaction);

            await TransactionController.makeTransaction(req, res);

            expect(res.status.calledWith(201)).to.be.true;
            expect(res.json.calledWith(mockTransaction)).to.be.true;
        });

        it('should handle transaction failure', async () => {
            transactionStub = sinon.stub(TransactionService, 'makeTransaction').throws(new Error('Transaction error'));

            await TransactionController.makeTransaction(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith({ message: 'Transaction failed', error: 'Transaction error' })).to.be.true;
        });
    });

    describe('checkAndHandleFailedTransaction', () => {
        it('should check and handle failed transactions successfully', async () => {
            req.body = { transactionId: 'TXN123', userEmail: 'user@example.com', amount: 100, ticketNumber: 'TICKET123' };
            transactionStub = sinon.stub(TransactionService, 'checkAndHandleFailedTransaction').resolves(true);

            await TransactionController.checkAndHandleFailedTransaction(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith({ success: true })).to.be.true;
        });

        it('should handle failure in checking failed transactions', async () => {
            req.body = { transactionId: 'TXN123', userEmail: 'user@example.com', amount: 100, ticketNumber: 'TICKET123' };
            transactionStub = sinon.stub(TransactionService, 'checkAndHandleFailedTransaction').throws(new Error('Check failed'));

            await TransactionController.checkAndHandleFailedTransaction(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith({ message: 'Failed to handle transaction', error: 'Check failed' })).to.be.true;
        });
    });

    describe('getUserTransactions', () => {
        it('should return user transactions successfully', async () => {
            const mockTransactions = [{ transactionId: 'TXN123', amount: 100 }];
            transactionStub = sinon.stub(TransactionService, 'getUserTransactions').resolves(mockTransactions);

            await TransactionController.getUserTransactions(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith(mockTransactions)).to.be.true;
        });

        it('should handle errors when fetching user transactions', async () => {
            transactionStub = sinon.stub(TransactionService, 'getUserTransactions').throws(new Error('Fetch error'));

            await TransactionController.getUserTransactions(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith({ message: 'Failed to retrieve transactions', error: 'Fetch error' })).to.be.true;
        });
    });

    describe('deleteTransactions', () => {
        it('should delete user transactions successfully', async () => {
            transactionStub = sinon.stub(TransactionService, 'deleteTransactions').resolves();

            await TransactionController.deleteTransactions(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.calledWith({ message: 'Transactions deleted successfully' })).to.be.true;
        });

        it('should handle errors when deleting transactions', async () => {
            transactionStub = sinon.stub(TransactionService, 'deleteTransactions').throws(new Error('Delete error'));

            await TransactionController.deleteTransactions(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith({ message: 'Failed to delete transactions', error: 'Delete error' })).to.be.true;
        });
    });
});
