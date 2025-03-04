const { expect } = require('chai');
const sinon = require('sinon');
const DisputesRepository = require('../src/repositories/disputesRepository');
const DisputesModel = require('../src/models/disputeModel');
const UserModel = require('../src/models/userModel');
const TransactionModel = require('../src/models/tranasactionModel');
const crypto = require('crypto');

describe('DisputesRepository', () => {
    let disputeStub, userStub, transactionStub, cryptoStub;

    afterEach(() => {
        sinon.restore();
    });

    describe('createDispute', () => {
        it('should create a dispute successfully', async () => {
            const mockDispute = { transactionId: 'TXN123', status: 'pending' };
            disputeStub = sinon.stub(DisputesModel, 'create').resolves(mockDispute);

            const result = await DisputesRepository.createDispute(mockDispute);

            expect(result).to.deep.equal(mockDispute);
            expect(disputeStub.calledOnceWith(mockDispute)).to.be.true;
        });
    });

    describe('findDisputeByTransactionId', () => {
        it('should find a dispute by transactionId', async () => {
            const mockDispute = { transactionId: 'TXN123', status: 'pending' };
            disputeStub = sinon.stub(DisputesModel, 'findOne').resolves(mockDispute);

            const result = await DisputesRepository.findDisputeByTransactionId('TXN123');

            expect(result).to.deep.equal(mockDispute);
            expect(disputeStub.calledOnceWith({ transactionId: 'TXN123' })).to.be.true;
        });
    });

    describe('findTransactionById', () => {
        it('should find a transaction by ID', async () => {
            const mockTransaction = { transactionId: 'TXN123', amount: 500 };
            transactionStub = sinon.stub(TransactionModel, 'findOne').resolves(mockTransaction);

            const result = await DisputesRepository.findTransactionById('TXN123');

            expect(result).to.deep.equal(mockTransaction);
            expect(transactionStub.calledOnceWith({ transactionId: 'TXN123' })).to.be.true;
        });
    });

    describe('findUserByDebitCard', () => {
        it('should find a user by debit card number', async () => {
            const mockUser = { name: 'John Doe', debitCardNumber: '1234567890' };
            userStub = sinon.stub(UserModel, 'findOne').resolves(mockUser);

            const result = await DisputesRepository.findUserByDebitCard('1234567890');

            expect(result).to.deep.equal(mockUser);
            expect(userStub.calledOnceWith({ debitCardNumber: '1234567890' })).to.be.true;
        });
    });

    describe('findAdmin', () => {
        it('should find an admin user', async () => {
            const mockAdmin = { name: 'Admin User', role: 'admin' };
            userStub = sinon.stub(UserModel, 'findOne').resolves(mockAdmin);

            const result = await DisputesRepository.findAdmin();

            expect(result).to.deep.equal(mockAdmin);
            expect(userStub.calledOnceWith({ role: 'admin' })).to.be.true;
        });
    });

    describe('getAllDisputes', () => {
        it('should return all disputes sorted by creation date', async () => {
            const mockDisputes = [{ transactionId: 'TXN123' }, { transactionId: 'TXN124' }];
            disputeStub = sinon.stub(DisputesModel, 'find').returns({ sort: sinon.stub().resolves(mockDisputes) });

            const result = await DisputesRepository.getAllDisputes();

            expect(result).to.deep.equal(mockDisputes);
        });
    });

    describe('getUserDisputes', () => {
        it('should return all disputes for a specific user', async () => {
            const mockDisputes = [{ email: 'user@example.com', status: 'pending' }];
            disputeStub = sinon.stub(DisputesModel, 'find').returns({ sort: sinon.stub().resolves(mockDisputes) });

            const result = await DisputesRepository.getUserDisputes('user@example.com');

            expect(result).to.deep.equal(mockDisputes);
        });
    });

    describe('getDisputeById', () => {
        it('should return a dispute by ID', async () => {
            const mockDispute = { _id: 'DIS123', transactionId: 'TXN123' };
            disputeStub = sinon.stub(DisputesModel, 'findById').resolves(mockDispute);

            const result = await DisputesRepository.getDisputeById('DIS123');

            expect(result).to.deep.equal(mockDispute);
        });
    });

    describe('getDisputeByVendorName', () => {
        it('should return disputes for a vendor', async () => {
            const mockDisputes = [{ vendorName: 'VendorA' }];
            disputeStub = sinon.stub(DisputesModel, 'find').resolves(mockDisputes);

            const result = await DisputesRepository.getDisputeByVendorName('VendorA');

            expect(result).to.deep.equal(mockDisputes);
        });
    });

    describe('getDisputeByTicketNumber', () => {
        it('should return a dispute by ticket number', async () => {
            const mockDispute = { ticketNumber: '123456' };
            disputeStub = sinon.stub(DisputesModel, 'findOne').resolves(mockDispute);

            const result = await DisputesRepository.getDisputeByTicketNumber('123456');

            expect(result).to.deep.equal(mockDispute);
        });
    });

    describe('generateUniqueTicketNumber', () => {
        it('should generate a unique ticket number', async () => {
            disputeStub = sinon.stub(DisputesModel, 'exists').resolves(false);
            cryptoStub = sinon.stub(crypto, 'randomInt').returns(654321);

            const result = await DisputesRepository.generateUniqueTicketNumber();

            expect(result).to.equal(654321);
            expect(disputeStub.called).to.be.true;
            expect(cryptoStub.called).to.be.true;
        });
    });

    describe('updateById', () => {
        it('should update a dispute by ID', async () => {
            const mockDispute = { _id: 'DIS123', status: 'resolved' };
            disputeStub = sinon.stub(DisputesModel, 'findByIdAndUpdate').resolves(mockDispute);

            const result = await DisputesRepository.updateById('DIS123', 'resolved', 'Approved', 'Admin123');

            expect(result).to.deep.equal(mockDispute);
        });
    });

    describe('saveDispute', () => {
        it('should save a dispute', async () => {
            const mockDispute = { _id: 'DIS123', status: 'pending' };
            disputeStub = sinon.stub(mockDispute, 'save').resolves(mockDispute);

            const result = await DisputesRepository.saveDispute(mockDispute);

            expect(result).to.deep.equal(mockDispute);
        });
    });
});
