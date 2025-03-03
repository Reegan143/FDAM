const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

const DisputesService = require('../src/services/disputeServices');
const DisputesRepository = require('../src/repositories/disputesRepository');
const NotificationRepository = require('../src/repositories/notificationRepository');
const UserRepository = require('../src/repositories/userRepository');
const sendMailModule = require('../src/utils/sendMail');

describe('DisputesService', function() {
  let sandbox;

  beforeEach(function() {
    // Create a sandbox to contain all our stubs
    sandbox = sinon.createSandbox();
    
    // Stub repository methods
    sandbox.stub(DisputesRepository);
    sandbox.stub(NotificationRepository);
    sandbox.stub(UserRepository);
    sandbox.stub(sendMailModule, 'sendMail');
    
    // Setup clock for testing timeouts
    this.clock = sinon.useFakeTimers();
  });

  afterEach(function() {
    // Restore all stubs
    sandbox.restore();
    this.clock.restore();
  });

  describe('registerDispute', function() {
    it('should throw error if admin not found', async function() {
      // Setup
      DisputesRepository.findAdmin.returns(null);
      
      // Test
      try {
        await DisputesService.registerDispute(
          { userId: '123', email: 'user@test.com' },
          { transactionId: 'txn123' }
        );
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Admin not found');
      }
    });

    it('should throw error if transaction not found', async function() {
      // Setup
      DisputesRepository.findAdmin.returns({ adminId: 'admin1', email: 'admin@test.com' });
      DisputesRepository.findDisputeByTransactionId.returns(null);
      DisputesRepository.findTransactionById.returns(null);
      
      // Test
      try {
        await DisputesService.registerDispute(
          { userId: '123', email: 'user@test.com' },
          { transactionId: 'txn123' }
        );
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('No transaction found');
      }
    });

    it('should throw error if transaction already submitted', async function() {
      // Setup
      DisputesRepository.findAdmin.returns({ adminId: 'admin1', email: 'admin@test.com' });
      DisputesRepository.findDisputeByTransactionId.returns({ status: 'submitted' });
      DisputesRepository.findTransactionById.returns({ transactionId: 'txn123', amount: 100 });
      
      // Test
      try {
        await DisputesService.registerDispute(
          { userId: '123', email: 'user@test.com' },
          { transactionId: 'txn123' }
        );
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Transaction has already been submitted');
      }
    });

    it('should throw error if debit card not found', async function() {
      // Setup
      DisputesRepository.findAdmin.returns({ adminId: 'admin1', email: 'admin@test.com' });
      DisputesRepository.findDisputeByTransactionId.returns(null);
      DisputesRepository.findTransactionById.returns({ transactionId: 'txn123', amount: 100 });
      DisputesRepository.findUserByDebitCard.returns(null);
      
      // Test
      try {
        await DisputesService.registerDispute(
          { userId: '123', email: 'user@test.com' },
          { transactionId: 'txn123', debitCardNumber: '12345' }
        );
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Debit Card Number Not Found');
      }
    });

    it('should successfully register dispute with vendor', async function() {
      // Setup
      const admin = { adminId: 'admin1', email: 'admin@test.com' };
      const transaction = { transactionId: 'txn123', amount: 100, status: 'completed' };
      const userRecord = { cardType: 'Visa' };
      const user = { userId: '123', email: 'user@test.com' };
      const userName = 'Test User';
      const vendor = { email: 'vendor@test.com' };
      const ticketNumber = 'TICKET123';
      const disputeData = {
        transactionId: 'txn123',
        complaintType: 'Wrong Amount',
        vendorName: 'TestVendor',
        description: 'Incorrect charge',
        debitCardNumber: '12345'
      };
      
      DisputesRepository.findAdmin.returns(admin);
      DisputesRepository.findDisputeByTransactionId.returns(null);
      DisputesRepository.findTransactionById.returns(transaction);
      DisputesRepository.findUserByDebitCard.returns(userRecord);
      UserRepository.findUserById.returns({ userName });
      DisputesRepository.generateUniqueTicketNumber.returns(ticketNumber);
      UserRepository.findVendor.returns(vendor);
      DisputesRepository.createDispute.returns({ id: 'dispute1', ...disputeData });
      
      // Test
      const result = await DisputesService.registerDispute(user, disputeData);
      
      // Verify
      expect(result).to.have.property('id', 'dispute1');
      expect(DisputesRepository.createDispute.calledOnce).to.be.true;
      expect(NotificationRepository.createNotification.calledThrice).to.be.true;
      expect(sendMailModule.sendMail.calledTwice).to.be.true;
    });

    it('should handle failed transactions properly', async function() {
      // Setup
      const admin = { adminId: 'admin1', email: 'admin@test.com' };
      const transaction = { transactionId: 'txn123', amount: 100, status: 'failed' };
      const userRecord = { cardType: 'Visa' };
      const user = { userId: '123', email: 'user@test.com' };
      const userName = 'Test User';
      const ticketNumber = 'TICKET123';
      const disputeData = {
        transactionId: 'txn123',
        complaintType: 'Failed Transaction',
        description: 'Transaction failed',
        debitCardNumber: '12345'
      };
      
      DisputesRepository.findAdmin.returns(admin);
      DisputesRepository.findDisputeByTransactionId.returns(null);
      DisputesRepository.findTransactionById.returns(transaction);
      DisputesRepository.findUserByDebitCard.returns(userRecord);
      UserRepository.findUserById.returns({ userName });
      DisputesRepository.generateUniqueTicketNumber.returns(ticketNumber);
      DisputesRepository.createDispute.returns({ id: 'dispute1', ...disputeData });
      DisputesRepository.getDisputeByTicketNumber.returns({ 
        ...disputeData, 
        ticketNumber,
        status: 'pending' 
      });
      
      // Test
      const result = await DisputesService.registerDispute(user, disputeData);
      
      // Verify initial dispatch
      expect(result).to.have.property('id', 'dispute1');
      expect(DisputesRepository.createDispute.calledOnce).to.be.true;
      
      // Fast forward time to trigger setTimeout callback
      this.clock.tick(21000);
      
      // Verify timeout callback executed
      expect(DisputesRepository.getDisputeByTicketNumber.calledOnce).to.be.true;
      expect(DisputesRepository.saveDispute.calledOnce).to.be.true;
      expect(NotificationRepository.createNotification.callCount).to.be.at.least(3);
    });
  });

  describe('getAllDisputes', function() {
    it('should return all disputes', async function() {
      // Setup
      const disputes = [{ id: 'dispute1' }, { id: 'dispute2' }];
      DisputesRepository.getAllDisputes.returns(disputes);
      
      // Test
      const result = await DisputesService.getAllDisputes();
      
      // Verify
      expect(result).to.deep.equal(disputes);
      expect(DisputesRepository.getAllDisputes.calledOnce).to.be.true;
    });
  });

  describe('getUserDisputes', function() {
    it('should return disputes for a specific user', async function() {
      // Setup
      const userDisputes = [{ id: 'dispute1' }];
      DisputesRepository.getUserDisputes.returns(userDisputes);
      
      // Test
      const result = await DisputesService.getUserDisputes('user@test.com');
      
      // Verify
      expect(result).to.deep.equal(userDisputes);
      expect(DisputesRepository.getUserDisputes.calledWith('user@test.com')).to.be.true;
    });
  });

  describe('getDisputeById', function() {
    it('should return a dispute by id', async function() {
      // Setup
      const dispute = { id: 'dispute1' };
      DisputesRepository.getDisputeById.returns(dispute);
      
      // Test
      const result = await DisputesService.getDisputeById('dispute1');
      
      // Verify
      expect(result).to.deep.equal(dispute);
      expect(DisputesRepository.getDisputeById.calledWith('dispute1')).to.be.true;
    });
  });

  describe('getDisputeByVendorName', function() {
    it('should return disputes by vendor name', async function() {
      // Setup
      const disputes = [{ id: 'dispute1', vendorName: 'Vendor1' }];
      DisputesRepository.getDisputeByVendorName.returns(disputes);
      
      // Test
      const result = await DisputesService.getDisputeByVendorName('Vendor1');
      
      // Verify
      expect(result).to.deep.equal(disputes);
      expect(DisputesRepository.getDisputeByVendorName.calledWith('Vendor1')).to.be.true;
    });
  });

  describe('getDisputeByTicketNumber', function() {
    it('should return a dispute by ticket number', async function() {
      // Setup
      const dispute = { id: 'dispute1', ticketNumber: 'TICKET123' };
      DisputesRepository.getDisputeByTicketNumber.returns(dispute);
      
      // Test
      const result = await DisputesService.getDisputeByTicketNumber('TICKET123');
      
      // Verify
      expect(result).to.deep.equal(dispute);
      expect(DisputesRepository.getDisputeByTicketNumber.calledWith('TICKET123')).to.be.true;
    });
  });
});