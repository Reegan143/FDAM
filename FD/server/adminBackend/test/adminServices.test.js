const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
const AdminService = require('../src/services/adminServices');
const UserRepository = require('../src/repositories/userRepository');
const NotificationRepository = require('../src/repositories/notificationRepository');
const TransactionRepository = require('../src/repositories/transactionRepository');
const AdminRepository = require('../src/repositories/adminRepository');
const { sendMail } = require('../src/utils/sendMail');
const axios = require('axios');
const nodemailer = require('nodemailer');

describe('AdminService', function() {
  let clock;

  beforeEach(function() {
    // Create a fake timer
    clock = sinon.useFakeTimers();
  });

  afterEach(function() {
    // Restore all stubs and timers
    sinon.restore();
    clock.restore();
  });

  describe('approveApiKeyRequest', function() {
    it('should approve an API key request and return the message and API key', async function() {
      // Arrange
      const requestId = 'request123';
      const email = 'vendor@example.com';
      const transactionId = 'trans123';
      const vendorName = 'Test Vendor';
      const apiKey = 'api-key-123';
      
      const request = { status: 'pending' };
      const vendor = { 
        vendorName, 
        apiKey: [],
        save: sinon.stub().resolves()
      };
      
      sinon.stub(AdminRepository, 'findApiKeyRequest').resolves(request);
      sinon.stub(UserRepository, 'findUserByEmail').resolves(vendor);
      sinon.stub(axios, 'post').resolves({ data: { apiKey } });
      sinon.stub(AdminRepository, 'updateApiKeyRequest').resolves();
      sinon.stub(AdminRepository, 'findAndDeleteApiKeyRequest').resolves();
      sinon.stub(NotificationRepository, 'createNotification').resolves();
      
      // Create deleteApiKeyOneDay stub
      sinon.stub(AdminService, 'deleteApiKeyOneDay').resolves();

      // Act
      const result = await AdminService.approveApiKeyRequest(requestId, email, transactionId);

      // Assert
      expect(result).to.have.property('message', 'API key approved and generated');
      expect(result).to.have.property('apiKey');
      expect(AdminRepository.findApiKeyRequest.calledWith(requestId)).to.be.true;
      expect(UserRepository.findUserByEmail.calledWith(email)).to.be.true;
      expect(AdminRepository.updateApiKeyRequest.calledWith(requestId, 'approved')).to.be.true;
      expect(NotificationRepository.createNotification.calledOnce).to.be.true;
      
      // Run timeout
      clock.tick(60000 * 5);
      expect(AdminRepository.findAndDeleteApiKeyRequest.calledWith(requestId)).to.be.true;
    });

    it('should throw an error if no pending request is found', async function() {
      // Arrange
      const requestId = 'request123';
      const email = 'vendor@example.com';
      const transactionId = 'trans123';
      
      sinon.stub(AdminRepository, 'findApiKeyRequest').resolves(null);
      
      // Act & Assert
      try {
        await AdminService.approveApiKeyRequest(requestId, email, transactionId);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('No pending API key request found for this vendor');
      }
    });

    it('should throw an error if vendor is not found', async function() {
      // Arrange
      const requestId = 'request123';
      const email = 'vendor@example.com';
      const transactionId = 'trans123';
      
      const request = { status: 'pending' };
      
      sinon.stub(AdminRepository, 'findApiKeyRequest').resolves(request);
      sinon.stub(UserRepository, 'findUserByEmail').resolves(null);
      
      // Act & Assert
      try {
        await AdminService.approveApiKeyRequest(requestId, email, transactionId);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Vendor not found');
      }
    });
  });

  describe('deleteApiKeyOneDay', function() {
    it('should delete API key after 24 hours', async function() {
      // Arrange
      const email = 'vendor@example.com';
      const altered = { transactionId: 'trans123' };
      const vendor = { 
        apiKey: [
          { transactionId: 'trans123', apiKey: 'key1' },
          { transactionId: 'trans456', apiKey: 'key2' }
        ],
        save: sinon.stub().resolves()
      };
      
      sinon.stub(UserRepository, 'findUserByEmail').resolves(vendor);
      
      // Act
      await AdminService.deleteApiKeyOneDay(email, altered);
      
      // Advance clock 24 hours
      clock.tick(60000 * 60 * 24);
      
      // Assert
      expect(UserRepository.findUserByEmail.calledWith(email)).to.be.true;
      expect(vendor.apiKey.length).to.equal(1);
      expect(vendor.apiKey[0].transactionId).to.equal('trans456');
      expect(vendor.save.calledOnce).to.be.true;
    });
  });

  describe('rejectApiKeyRequest', function() {
    it('should reject an API key request and return a message', async function() {
      // Arrange
      const requestId = 'request123';
      const email = 'vendor@example.com';
      const transactionId = 'trans123';
      
      const request = { status: 'pending' };
      
      sinon.stub(AdminRepository, 'findApiKeyRequest').resolves(request);
      sinon.stub(AdminRepository, 'updateApiKeyRequest').resolves();
      sinon.stub(NotificationRepository, 'createNotification').resolves();
      sinon.stub(AdminRepository, 'findAndDeleteApiKeyRequest').resolves();
      
      // Act
      const result = await AdminService.rejectApiKeyRequest(requestId, email, transactionId);
      
      // Assert
      expect(result).to.have.property('message', 'API key request rejected');
      expect(AdminRepository.findApiKeyRequest.calledWith(requestId)).to.be.true;
      expect(AdminRepository.updateApiKeyRequest.calledWith(requestId, 'rejected')).to.be.true;
      expect(NotificationRepository.createNotification.calledOnce).to.be.true;
      
      // Run timeout
      clock.tick(60000 * 5);
      expect(AdminRepository.findAndDeleteApiKeyRequest.calledWith(requestId)).to.be.true;
    });

    it('should throw an error if no pending request is found', async function() {
      // Arrange
      const requestId = 'request123';
      const email = 'vendor@example.com';
      const transactionId = 'trans123';
      
      sinon.stub(AdminRepository, 'findApiKeyRequest').resolves(null);
      
      // Act & Assert
      try {
        await AdminService.rejectApiKeyRequest(requestId, email, transactionId);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('No pending API key request found for this vendor');
      }
    });
  });

  describe('getApiKeyRequests', function() {
    it('should return all API key requests', async function() {
      // Arrange
      const requests = [{ id: 'req1' }, { id: 'req2' }];
      sinon.stub(AdminRepository, 'getAllApiKeyRequests').resolves(requests);
      
      // Act
      const result = await AdminService.getApiKeyRequests();
      
      // Assert
      expect(result).to.deep.equal(requests);
      expect(AdminRepository.getAllApiKeyRequests.calledOnce).to.be.true;
    });
  });

  describe('getAdminByEmail', function() {
    it('should return an admin by email', async function() {
      // Arrange
      const email = 'admin@example.com';
      const admin = { email, name: 'Admin' };
      sinon.stub(AdminRepository, 'findAdminByEmail').resolves(admin);
      
      // Act
      const result = await AdminService.getAdminByEmail(email);
      
      // Assert
      expect(result).to.deep.equal(admin);
      expect(AdminRepository.findAdminByEmail.calledWith(email)).to.be.true;
    });

    it('should throw an error if admin is not found', async function() {
      // Arrange
      const email = 'admin@example.com';
      sinon.stub(AdminRepository, 'findAdminByEmail').resolves(null);
      
      // Act & Assert
      try {
        await AdminService.getAdminByEmail(email);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Admin not found');
      }
    });
  });

  describe('getAllDisputes', function() {
    it('should return all disputes', async function() {
      // Arrange
      const disputes = [{ id: 'dispute1' }, { id: 'dispute2' }];
      sinon.stub(AdminRepository, 'getAllDisputes').resolves(disputes);
      
      // Act
      const result = await AdminService.getAllDisputes();
      
      // Assert
      expect(result).to.deep.equal(disputes);
      expect(AdminRepository.getAllDisputes.calledOnce).to.be.true;
    });
  });

  describe('updateDisputeStatus', function() {
    it('should update dispute status and send notification if status is not submitted', async function() {
      // Arrange
      const disputeId = 'dispute123';
      const status = 'resolved';
      const remarks = 'Issue resolved';
      const adminId = 'admin123';
      
      const updatedDispute = {
        status: 'resolved',
        email: 'user@example.com',
        ticketNumber: 'ticket123',
        amount: 100,
        transactionId: 'trans123'
      };
      
      const user = {
        userName: 'Test User'
      };
      
      sinon.stub(AdminRepository, 'updateDisputeStatus').resolves(updatedDispute);
      sinon.stub(UserRepository, 'findUserByEmail').resolves(user);
      sinon.stub(sendMail, 'sendMail').resolves();
      sinon.stub(NotificationRepository, 'createNotification').resolves();
      
      // Act
      const result = await AdminService.updateDisputeStatus(disputeId, status, remarks, adminId);
      
      // Assert
      expect(result).to.deep.equal(updatedDispute);
      expect(AdminRepository.updateDisputeStatus.calledWith(disputeId, status, remarks, adminId)).to.be.true;
      expect(UserRepository.findUserByEmail.calledWith(updatedDispute.email)).to.be.true;
      expect(NotificationRepository.createNotification.calledOnce).to.be.true;
    });

    it('should return undefined if dispute status is submitted', async function() {
      // Arrange
      const disputeId = 'dispute123';
      const status = 'resolved';
      const remarks = 'Issue resolved';
      const adminId = 'admin123';
      
      const updatedDispute = {
        status: 'submitted',
        email: 'user@example.com'
      };
      
      sinon.stub(AdminRepository, 'updateDisputeStatus').resolves(updatedDispute);
      
      // Act
      const result = await AdminService.updateDisputeStatus(disputeId, status, remarks, adminId);
      
      // Assert
      expect(result).to.be.undefined;
      expect(AdminRepository.updateDisputeStatus.calledWith(disputeId, status, remarks, adminId)).to.be.true;
    });

    it('should throw an error if user is not found', async function() {
      // Arrange
      const disputeId = 'dispute123';
      const status = 'resolved';
      const remarks = 'Issue resolved';
      const adminId = 'admin123';
      
      const updatedDispute = {
        status: 'resolved',
        email: 'user@example.com'
      };
      
      sinon.stub(AdminRepository, 'updateDisputeStatus').resolves(updatedDispute);
      sinon.stub(UserRepository, 'findUserByEmail').resolves(null);
      
      // Act & Assert
      try {
        await AdminService.updateDisputeStatus(disputeId, status, remarks, adminId);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('User not found');
      }
    });
  });

  describe('getTransactionById', function() {
    it('should return a transaction by ID', async function() {
      // Arrange
      const transactionId = 'trans123';
      const transaction = { id: transactionId, amount: 100 };
      sinon.stub(TransactionRepository, 'findTransactionById').resolves(transaction);
      
      // Act
      const result = await AdminService.getTransactionById(transactionId);
      
      // Assert
      expect(result).to.deep.equal(transaction);
      expect(TransactionRepository.findTransactionById.calledWith(transactionId)).to.be.true;
    });
  });

  describe('generateFraudReport', function() {
    it('should generate a fraud report and send it via email', async function() {
      // Arrange
      const startDate = '2023-01-01';
      const endDate = '2023-01-31';
      const adminEmail = 'admin@example.com';
      const report = [{ fraud: 'data' }];
      
      sinon.stub(AdminRepository, 'generateFraudReport').resolves(report);
      
      const sendMailStub = sinon.stub().resolves();
      const transporterStub = {
        sendMail: sendMailStub
      };
      
      sinon.stub(nodemailer, 'createTransport').returns(transporterStub);
      
      // Act
      const result = await AdminService.generateFraudReport(startDate, endDate, adminEmail);
      
      // Assert
      expect(result).to.deep.equal(report);
      expect(AdminRepository.generateFraudReport.calledWith(startDate, endDate)).to.be.true;
      expect(nodemailer.createTransport.calledOnce).to.be.true;
      expect(sendMailStub.calledOnce).to.be.true;
      
      const emailOptions = sendMailStub.firstCall.args[0];
      expect(emailOptions.to).to.equal(adminEmail);
      expect(emailOptions.subject).to.equal('Fraud Report');
      expect(emailOptions.attachments).to.have.lengthOf(1);
      expect(emailOptions.attachments[0].filename).to.equal('fraud_report.json');
    });
  });
});