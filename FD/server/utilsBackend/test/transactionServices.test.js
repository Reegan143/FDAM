const { expect } = require('chai');
const sinon = require('sinon');
const TransactionService = require('../src/services/transactionServices');
const TransactionRepository = require('../src/repositories/transactionRepository');
const emailUtils = require('../src/utils/email_checker');

describe('TransactionService', () => {
    beforeEach(() => {
        sinon.restore();
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('makeTransaction', () => {
        it('should create a transaction successfully with paid status', async () => {
            const transactionData = {
                senderAccNo: 'ACC123',
                receiverAccNo: 'ACC456',
                amount: 1000,
                debitCardNumber: '1234567890123456',
                transactionId: 'TXN123',
                status: 'paid'
            };
            
            const mockSender = {
                userName: 'John Doe',
                debitCardNumber: '1234567890123456',
                transactions: [],
                save: sinon.stub().resolves()
            };
            
            const mockReceiver = {
                userName: 'Jane Smith',
                transactions: [],
                save: sinon.stub().resolves()
            };
            
            sinon.stub(TransactionRepository, 'findUserByAccNo')
                .withArgs(transactionData.senderAccNo).resolves(mockSender)
                .withArgs(transactionData.receiverAccNo).resolves(mockReceiver);
                
            sinon.stub(TransactionRepository, 'createTransaction').resolves();
            
            const result = await TransactionService.makeTransaction(transactionData);
            
            expect(result).to.include({
                message: 'Transaction initiated successfully!',
                senderAccNo: 'ACC123',
                receiverAccNo: 'ACC456',
                amount: 1000,
                senderName: 'John Doe',
                receiverName: 'Jane Smith'
            });
            
            expect(mockSender.transactions).to.have.lengthOf(1);
            expect(mockReceiver.transactions).to.have.lengthOf(1);
            expect(mockSender.save.calledOnce).to.be.true;
            expect(mockReceiver.save.calledOnce).to.be.true;
        });
        
        it('should create a transaction with status other than paid', async () => {
            const transactionData = {
                senderAccNo: 'ACC123',
                receiverAccNo: 'ACC456',
                amount: 1000,
                debitCardNumber: '1234567890123456',
                transactionId: 'TXN123',
                status: 'pending'
            };
            
            const mockSender = {
                userName: 'John Doe',
                debitCardNumber: '1234567890123456',
                transactions: [],
                save: sinon.stub().resolves()
            };
            
            const mockReceiver = {
                userName: 'Jane Smith',
                transactions: [],
                save: sinon.stub().resolves()
            };
            
            sinon.stub(TransactionRepository, 'findUserByAccNo')
                .withArgs(transactionData.senderAccNo).resolves(mockSender)
                .withArgs(transactionData.receiverAccNo).resolves(mockReceiver);
                
            sinon.stub(TransactionRepository, 'createTransaction').resolves();
            
            const result = await TransactionService.makeTransaction(transactionData);
            
            expect(result.message).to.equal('Transaction initiated successfully!');
            expect(mockSender.transactions).to.have.lengthOf(1);
            expect(mockReceiver.transactions).to.have.lengthOf(0); // Receiver shouldn't have transaction if not paid
            expect(mockSender.save.calledOnce).to.be.true;
            expect(mockReceiver.save.called).to.be.false;
        });
        
        it('should handle vendor names correctly', async () => {
            const transactionData = {
                senderAccNo: 'ACC123',
                receiverAccNo: 'ACC456',
                amount: 1000,
                debitCardNumber: '1234567890123456',
                transactionId: 'TXN123',
                status: 'paid'
            };
            
            const mockSender = {
                vendorName: 'Amazon',
                debitCardNumber: '1234567890123456',
                transactions: [],
                save: sinon.stub().resolves()
            };
            
            const mockReceiver = {
                vendorName: 'eBay',
                transactions: [],
                save: sinon.stub().resolves()
            };
            
            sinon.stub(TransactionRepository, 'findUserByAccNo')
                .withArgs(transactionData.senderAccNo).resolves(mockSender)
                .withArgs(transactionData.receiverAccNo).resolves(mockReceiver);
                
            sinon.stub(TransactionRepository, 'createTransaction').resolves();
            
            const result = await TransactionService.makeTransaction(transactionData);
            
            expect(result.senderName).to.equal('Amazon');
            expect(result.receiverName).to.equal('eBay');
        });
        
        it('should throw error when sender not found', async () => {
            const transactionData = {
                senderAccNo: 'INVALID',
                receiverAccNo: 'ACC456',
                amount: 1000,
                debitCardNumber: '1234567890123456',
                transactionId: 'TXN123',
                status: 'paid'
            };
            
            sinon.stub(TransactionRepository, 'findUserByAccNo')
                .withArgs(transactionData.senderAccNo).resolves(null)
                .withArgs(transactionData.receiverAccNo).resolves({});
            
            try {
                await TransactionService.makeTransaction(transactionData);
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).to.equal('Sender account not found');
            }
        });
        
        it('should throw error when receiver not found', async () => {
            const transactionData = {
                senderAccNo: 'ACC123',
                receiverAccNo: 'INVALID',
                amount: 1000,
                debitCardNumber: '1234567890123456',
                transactionId: 'TXN123',
                status: 'paid'
            };
            
            sinon.stub(TransactionRepository, 'findUserByAccNo')
                .withArgs(transactionData.senderAccNo).resolves({
                    debitCardNumber: '1234567890123456',
                    transactions: [],
                    save: sinon.stub().resolves()
                })
                .withArgs(transactionData.receiverAccNo).resolves(null);
            
            try {
                await TransactionService.makeTransaction(transactionData);
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).to.equal('Receiver account not found');
            }
        });
        
        it('should throw error for invalid debit card number', async () => {
            const transactionData = {
                senderAccNo: 'ACC123',
                receiverAccNo: 'ACC456',
                amount: 1000,
                debitCardNumber: 'WRONGCARD',
                transactionId: 'TXN123',
                status: 'paid'
            };
            
            const mockSender = {
                userName: 'John Doe',
                debitCardNumber: '1234567890123456', // Different from input
                transactions: []
            };
            
            sinon.stub(TransactionRepository, 'findUserByAccNo')
                .withArgs(transactionData.senderAccNo).resolves(mockSender)
                .withArgs(transactionData.receiverAccNo).resolves({});
            
            try {
                await TransactionService.makeTransaction(transactionData);
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).to.equal('Invalid Debit Card Number');
            }
        });
    });

    describe('checkAndHandleFailedTransaction', () => {
        it('should send refund email for failed transaction found in transaction repository', async () => {
            const transactionId = 'TXN123';
            const userEmail = 'user@example.com';
            const amount = 1000;
            const ticketNumber = 'TKT123';
            
            sinon.stub(TransactionRepository, 'findFailedTransactionById').resolves({
                transactionId,
                status: 'failed'
            });
            
            const sendMailStub = sinon.stub(emailUtils, 'sendMail').resolves(true);
            
            const result = await TransactionService.checkAndHandleFailedTransaction(
                transactionId, userEmail, amount, ticketNumber
            );
            
            expect(result).to.be.true;
            expect(sendMailStub.calledOnce).to.be.true;
            expect(sendMailStub.firstCall.args[0].to).to.equal(userEmail);
            expect(sendMailStub.firstCall.args[0].subject).to.include(transactionId);
        });

        it('should send refund email for failed transaction found in user transactions', async () => {
            const transactionId = 'TXN123';
            const userEmail = 'user@example.com';
            const amount = 1000;
            const ticketNumber = 'TKT123';
            
            sinon.stub(TransactionRepository, 'findFailedTransactionById').resolves(null);
            
            sinon.stub(TransactionRepository, 'getUserByEmail').resolves({
                email: userEmail,
                transactions: [
                    { transactionId, status: 'failed', amount: 1000 }
                ]
            });
            
            const sendMailStub = sinon.stub(emailUtils, 'sendMail').resolves(true);
            
            const result = await TransactionService.checkAndHandleFailedTransaction(
                transactionId, userEmail, amount, ticketNumber
            );
            
            expect(result).to.be.true;
            expect(sendMailStub.calledOnce).to.be.true;
        });

        it('should return false when no failed transaction found', async () => {
            const transactionId = 'TXN123';
            const userEmail = 'user@example.com';
            const amount = 1000;
            const ticketNumber = 'TKT123';
            
            sinon.stub(TransactionRepository, 'findFailedTransactionById').resolves(null);
            sinon.stub(TransactionRepository, 'getUserByEmail').resolves({
                email: userEmail,
                transactions: [
                    { transactionId: 'OTHER-ID', status: 'failed', amount: 1000 }
                ]
            });
            
            const sendMailStub = sinon.stub(emailUtils, 'sendMail');
            
            const result = await TransactionService.checkAndHandleFailedTransaction(
                transactionId, userEmail, amount, ticketNumber
            );
            
            expect(result).to.be.false;
            expect(sendMailStub.called).to.be.false;
        });
    });

    describe('getUserTransactions', () => {
        it('should return user transactions', async () => {
            const email = 'user@example.com';
            const expectedTransactions = [
                { transactionId: 'TXN123', amount: 100 },
                { transactionId: 'TXN456', amount: 200 }
            ];
            
            sinon.stub(TransactionRepository, 'getUserByEmail').resolves({
                email,
                transactions: expectedTransactions
            });
            
            const result = await TransactionService.getUserTransactions(email);
            
            expect(result).to.deep.equal(expectedTransactions);
        });

        it('should throw error when user not found', async () => {
            const email = 'nonexistent@example.com';
            
            sinon.stub(TransactionRepository, 'getUserByEmail').resolves(null);
            
            try {
                await TransactionService.getUserTransactions(email);
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).to.equal('User not found');
            }
        });
    });

    describe('deleteTransactions', () => {
        it('should delete user transactions', async () => {
            const email = 'user@example.com';
            const expectedResult = { acknowledged: true, deletedCount: 5 };
            
            sinon.stub(TransactionRepository, 'deleteUserTransactions').resolves(expectedResult);
            
            const result = await TransactionService.deleteTransactions(email);
            
            expect(result).to.deep.equal(expectedResult);
        });

        it('should handle errors when deleting transactions', async () => {
            const email = 'user@example.com';
            
            sinon.stub(TransactionRepository, 'deleteUserTransactions').rejects(new Error('Database error'));
            
            try {
                await TransactionService.deleteTransactions(email);
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).to.equal('Database error');
            }
        });
    });
});